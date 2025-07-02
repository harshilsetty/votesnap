import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import pollApi, { Poll } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Toaster, toast } from 'react-hot-toast';
import copy from 'copy-to-clipboard';
import html2canvas from 'html2canvas';
ChartJS.register(ArcElement, Tooltip, Legend);

const PollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [maxOptionsWarning, setMaxOptionsWarning] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Move fetchPoll outside useEffect so it can be used in error handler
  const fetchPoll = async (code?: string) => {
    try {
      setLoading(true);
      const pollData = await pollApi.getPoll(id!, code);
      setPoll(pollData);
      if (!pollData.isPublic && !code) {
        setShowAccessCodeInput(true);
      } else {
        setShowAccessCodeInput(false);
      }
      setError('');
    } catch (err: any) {
      console.error('Error fetching poll:', err);
      if (err.response?.status === 403) {
        setError('This is a private poll. Please enter the access code to view it.');
        setShowAccessCodeInput(true);
      } else {
        setError('Failed to load poll. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      // Get access code from URL if present
      const params = new URLSearchParams(location.search);
      let code = params.get('accessCode') || params.get('code');
      // If not in URL, check localStorage
      if (!code) {
        code = localStorage.getItem(`accessCode_${id}`) || null;
      }
      setAccessCode(code);
      fetchPoll(code || undefined);
    }
  }, [id, location.search]);

  // Helper to check if current user is the creator
  const isCreator = poll && user && typeof poll.createdBy === 'object' && poll.createdBy._id?.toString() === user._id?.toString();
  const isAdmin = user && user.role === 'admin';

  // Helper to check if current user has voted
  const hasVoted = !!(poll && user && Array.isArray(poll.voters) && poll.voters.some((v: any) => v === user._id || v?._id === user._id));

  const handleVote = async () => {
    if (!poll) return;
    if (poll.allowMultipleOptions) {
      if (!selectedOptions.length) {
        setError('Please select at least one option to vote');
        return;
      }
    } else {
      if (!selectedOption) {
        setError('Please select an option to vote');
        return;
      }
    }
    try {
      setVoting(true);
      let votePayload: any;
      if (poll.allowMultipleOptions) {
        votePayload = { optionIds: selectedOptions };
      } else {
        if (!poll.options.some(opt => String(opt._id) === String(selectedOption))) {
          setError('Invalid option selected. Please try again.');
          setVoting(false);
          return;
        }
        votePayload = { optionId: selectedOption };
      }
      if (!poll.isPublic) {
        votePayload.accessCode = accessCode || localStorage.getItem(`accessCode_${id}`) || '';
      }
      await pollApi.submitVote(id!, votePayload);
      setSelectedOption('');
      setSelectedOptions([]);
      await fetchPoll(accessCode || undefined);
    } catch (err: any) {
      console.error('Error voting:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Please enter the correct access code.');
        setShowAccessCodeInput(true);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to submit vote. Please try again.');
      }
    } finally {
      setVoting(false);
    }
  };

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode) {
      setError('Please enter an access code');
      return;
    }
    // Save access code for this poll in localStorage
    if (id) {
      localStorage.setItem(`accessCode_${id}` , accessCode);
    }
    await fetchPoll(accessCode);
  };

  const calculatePercentage = (votes: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = currentTime.getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  // Handler for declaring results
  const handleDeclareResults = async () => {
    if (!poll) return;
    try {
      setLoading(true);
      const updatedPoll = await pollApi.declareResults(poll._id);
      setPoll(updatedPoll);
    } catch (err: any) {
      setError(err.message || 'Failed to declare results');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (showAccessCodeInput && !isCreator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Private Poll Access
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter the access code to view this poll
              </p>
            </div>
            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            <form onSubmit={handleAccessCodeSubmit} className="space-y-6">
              <div>
                <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Access Code
                </label>
                <input
                  type="text"
                  id="accessCode"
                  value={accessCode || ''}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter access code"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Access Poll
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-red-500 mb-6 text-lg">{error}</div>
            <button 
              onClick={() => fetchPoll()} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 dark:border-gray-700/20">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-gray-500 mb-6 text-lg">Poll not found</div>
            <button 
              onClick={() => navigate('/')} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(poll.expiresAt) < new Date();
  const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);

  // Prepare data for the pie chart with enhanced styling
  const chartData = {
    labels: poll.options.map((opt: any) => opt.text),
    datasets: [
      {
        data: poll.options.map((opt: any) => opt.votes),
        backgroundColor: [
          '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899', '#84cc16', '#f43f5e'
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: 700
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const percentage = calculatePercentage(context.parsed, totalVotes);
            return `${context.label}: ${context.parsed} votes (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 relative overflow-hidden">
      {/* Enhanced Background with Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-200 dark:bg-blue-800 rounded-full opacity-30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Diagonal lines overlay */}
        <div 
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(59, 130, 246, 0.1) 10px,
              rgba(59, 130, 246, 0.1) 20px
            )`
          }}
        />
        
        {/* Subtle blur overlay */}
        <div className="absolute inset-0 backdrop-blur-[0.5px] opacity-30" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        
        {/* Main Poll Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
          {/* Header Section */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {poll.title}
                </h1>
                
                {/* Status and Time */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isExpired 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {isExpired ? '🔴 Expired' : '🟢 Active'}
                  </span>
                  {!isExpired && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      ⏰ {getTimeRemaining(poll.expiresAt)}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    poll.isPublic 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                  }`}>
                    {poll.isPublic ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>

                {/* Creator Info */}
                {typeof poll.createdBy === 'object' && poll.createdBy.email && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    {'profilePic' in poll.createdBy && typeof poll.createdBy.profilePic === 'string' && poll.createdBy.profilePic.trim() !== '' ? (
                      <img
                        src={String(poll.createdBy.profilePic)}
                        alt="Creator Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                        <UserCircleIcon className="w-6 h-6 text-blue-500 dark:text-blue-300" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Created by</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {'name' in poll.createdBy && typeof poll.createdBy.name === 'string' && poll.createdBy.name 
                          ? poll.createdBy.name 
                          : poll.createdBy.email
                        }
                      </p>
                      {poll.createdBy.role && (
                        <span className="inline-block mt-1 px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                          {poll.createdBy.role}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total Votes */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 animate-pulse">
                {totalVotes.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Total Votes
              </div>
            </div>
          </div>

          {/* Voting/Results Section */}
          <div className="p-8">
            {!isAuthenticated ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🔐</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Please log in to vote
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  You need to be logged in to participate in this poll.
                </p>
                <button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={() => navigate('/login')}
                >
                  Log In to Vote
                </button>
              </div>
            ) : (!hasVoted || poll.allowMultipleVotes) && poll.status === 'active' ? (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Cast Your Vote
                </h3>
                <div className="space-y-4">
                  {poll.allowMultipleOptions ? (
                    <>
                      {poll.options.map((option: any) => (
                        <div key={option._id} className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                          <input
                            type="checkbox"
                            id={option._id}
                            name="vote"
                            value={option._id}
                            checked={selectedOptions.includes(option._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (poll.maxSelectableOptions && selectedOptions.length >= poll.maxSelectableOptions) {
                                  setMaxOptionsWarning(`You can select up to ${poll.maxSelectableOptions} options.`);
                                  return;
                                }
                                setSelectedOptions([...selectedOptions, option._id]);
                                setMaxOptionsWarning('');
                              } else {
                                setSelectedOptions(selectedOptions.filter(id => id !== option._id));
                                setMaxOptionsWarning('');
                              }
                            }}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                          />
                          <label
                            htmlFor={option._id}
                            className="ml-4 flex-1 text-lg font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                          >
                            {option.text}
                          </label>
                        </div>
                      ))}
                      {maxOptionsWarning && (
                        <div className="text-red-500 text-sm mt-2">{maxOptionsWarning}</div>
                      )}
                    </>
                  ) : (
                    poll.options.map((option: any) => (
                      <div key={option._id} className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                        <input
                          type="radio"
                          id={option._id}
                          name="vote"
                          value={option._id}
                          checked={selectedOption === option._id}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        />
                        <label
                          htmlFor={option._id}
                          className="ml-4 flex-1 text-lg font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                          {option.text}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex justify-center pt-6">
                  <button
                    onClick={handleVote}
                    disabled={poll.allowMultipleOptions ? !selectedOptions.length || voting : !selectedOption || voting}
                    className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                      (poll.allowMultipleOptions ? !selectedOptions.length : !selectedOption) || voting
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    }`}
                  >
                    {voting ? 'Submitting Vote...' : 'Submit Vote'}
                  </button>
                </div>
              </div>
            ) : (poll.resultsDeclared || isCreator || isAdmin) ? (
              <div className="space-y-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Poll Results
                </h3>
                {/* Side-by-side layout for results and pie chart */}
                <div className="flex flex-col md:flex-row md:items-start md:space-x-8 space-y-8 md:space-y-0">
                  {/* Poll options/results */}
                  <div className="flex-1 space-y-4">
                    {poll.options.map((option: any) => {
                      const percentage = calculatePercentage(option.votes, totalVotes);
                      const isWinning = totalVotes > 0 && option.votes === Math.max(...poll.options.map((o: any) => o.votes));
                      const isUserChoice = hasVoted && user && poll.voters && Array.isArray(poll.voters) && poll.voters.some((v: any) => v === user._id || v?._id === user._id) && poll.voters.includes(user._id) && selectedOption === option._id;
                      return (
                        <div key={option._id} className={`space-y-3 border-2 rounded-xl p-3 transition-all duration-500 ${isWinning ? 'border-yellow-400 dark:border-yellow-500 shadow-lg' : 'border-transparent'} ${isUserChoice ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}> 
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              {option.text}
                              {isWinning && <span title="Winning Option" className="ml-1">🏆</span>}
                              {isUserChoice && <span title="Your Choice" className="ml-1 text-blue-500">✔️</span>}
                            </span>
                            <div className="flex flex-col items-end">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                                {option.votes.toLocaleString()} votes &bull; {percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full transition-all duration-1000 ease-out ${isWinning ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Pie chart */}
                  <div className="w-full md:w-64 lg:w-72 flex-shrink-0 mx-auto md:mx-0">
                    <div className="results-pie-chart transition-transform duration-700 hover:scale-105">
                      <Pie data={chartData} options={chartOptions} height={220} />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Results Chart Section */}
          {(poll.resultsDeclared || isCreator || isAdmin) && totalVotes > 0 && (
            <div className="p-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Results Overview
              </h3>
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4">
                <button
                  onClick={() => {
                    copy(window.location.href);
                    toast.success('Results link copied to clipboard!');
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium shadow hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  Share Results
                </button>
                <button
                  onClick={async () => {
                    const chart = document.querySelector('.results-pie-chart');
                    if (chart) {
                      const canvas = await html2canvas(chart as HTMLElement);
                      const link = document.createElement('a');
                      link.download = `poll-results-${poll._id}.png`;
                      link.href = canvas.toDataURL();
                      link.click();
                    }
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium shadow hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  Download Chart
                </button>
              </div>
            </div>
          )}

          {/* Admin/Creator Actions */}
          {(isCreator || isAdmin) && !poll.resultsDeclared && (
            <div className="p-8 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <button
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={handleDeclareResults}
                  disabled={loading}
                >
                  {loading ? 'Declaring Results...' : 'Declare Results'}
                </button>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Once declared, all voters will be able to see the results.
                  <br />
                  <span className="text-blue-500 font-medium">
                    You can declare results even after the poll has expired.
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Voters List for Admin/Creator */}
          {(isCreator || isAdmin) && poll.voters && Array.isArray(poll.voters) && poll.voters.length > 0 && (
            <div className="p-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Voters ({poll.voters.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {poll.voters.map((voter: any) => (
                  <div key={voter._id || voter} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                      <UserCircleIcon className="w-5 h-5 text-blue-500 dark:text-blue-300" />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {voter.email || voter}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Messages */}
          {hasVoted && (
            <div className="p-6 bg-green-50 dark:bg-green-900/30 border-t border-green-200 dark:border-green-800">
              <div className="text-center">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-green-700 dark:text-green-300 font-medium">
                  Thank you for voting!
                </p>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="p-6 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl mb-2">⏰</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  This poll has expired
                </p>
              </div>
            </div>
          )}

          {hasVoted && !isCreator && !isAdmin && !poll.resultsDeclared && (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/30 border-t border-yellow-200 dark:border-yellow-800">
              <div className="text-center">
                <div className="text-2xl mb-2">⏳</div>
                <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                  The poll creator has not yet declared the results. Please check back later.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-medium border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollDetail; 