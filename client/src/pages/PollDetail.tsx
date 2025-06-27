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
import { Toaster } from 'react-hot-toast';
ChartJS.register(ArcElement, Tooltip, Legend);

const PollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);

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
    if (!poll || !selectedOption) {
      setError('Please select an option to vote');
      return;
    }
    try {
      setVoting(true);
      if (!poll.options.some(opt => String(opt._id) === String(selectedOption))) {
        setError('Invalid option selected. Please try again.');
        setVoting(false);
        return;
      }
      const votePayload: any = {
        optionId: selectedOption,
      };
      if (!poll.isPublic) {
        votePayload.accessCode = accessCode || localStorage.getItem(`accessCode_${id}`) || '';
      }
      await pollApi.submitVote(id!, votePayload);
      setSelectedOption('');
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

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
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
      <div className="flex justify-center items-center min-h-[60vh]">
        {/* Skeleton loader for poll detail */}
        <div className="w-full max-w-2xl mx-auto animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-4"></div>
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-6"></div>
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-2"></div>
        </div>
      </div>
    );
  }

  if (showAccessCodeInput && !isCreator) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Private Poll Access
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Access Code
            </label>
            <input
              type="text"
              id="accessCode"
              value={accessCode || ''}
              onChange={(e) => setAccessCode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter access code"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Access Poll
          </button>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button onClick={() => fetchPoll()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Poll not found</div>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-4">
          Back to Home
        </button>
      </div>
    );
  }

  const isExpired = new Date(poll.expiresAt) < new Date();
  const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);

  // Prepare data for the pie chart
  const chartData = {
    labels: poll.options.map((opt: any) => opt.text),
    datasets: [
      {
        data: poll.options.map((opt: any) => opt.votes),
        backgroundColor: [
          '#3b82f6', '#f59e42', '#10b981', '#ef4444', '#a78bfa', '#fbbf24', '#6366f1', '#f472b6', '#34d399', '#f87171'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in px-2 sm:px-0">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="card p-2 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">{poll.title}</h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-6">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${isExpired ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200' : 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-200'}`}>{isExpired ? 'Expired' : 'Active'}</span>
          {!isExpired && (
            <span className="text-xs text-primary-500 font-medium ml-0 sm:ml-2">
              {formatTimeRemaining(poll.expiresAt)}
            </span>
          )}
        </div>
        {typeof poll.createdBy === 'object' && poll.createdBy.email && (
          <div className="mb-2 flex flex-col sm:flex-row items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {'profilePic' in poll.createdBy && typeof poll.createdBy.profilePic === 'string' && poll.createdBy.profilePic.trim() !== '' ? (
              <img
                src={String(poll.createdBy.profilePic)}
                alt="Creator Profile"
                className="w-7 h-7 rounded-full object-cover border border-primary-300 dark:border-primary-700 shadow"
              />
            ) : (
              <span className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-primary-500 dark:text-primary-300" />
              </span>
            )}
            <span>Created by: <span className="font-medium">{'name' in poll.createdBy && typeof poll.createdBy.name === 'string' && poll.createdBy.name ? `${poll.createdBy.name} (${poll.createdBy.email})` : poll.createdBy.email}</span></span>
            {poll.createdBy.role && (
              <span className="ml-0 sm:ml-2 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300">{poll.createdBy.role}</span>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-6 gap-2">
          <span>{totalVotes} total votes</span>
        </div>
        <div className="space-y-4">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-lg font-semibold mb-4">Please log in to vote in this poll.</div>
              <button
                className="btn btn-primary px-6 py-2 text-lg"
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
            </div>
          ) : !hasVoted && poll.status === 'active' ? (
            <div className="space-y-2">
              {poll.options.map((option: any) => (
                <div key={option._id} className="flex items-center">
                  <input
                    type="radio"
                    id={option._id}
                    name="vote"
                    value={option._id}
                    checked={selectedOption === option._id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor={option._id}
                    className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {option.text}
                  </label>
                </div>
              ))}
              <div className="flex justify-center">
                <button
                  onClick={handleVote}
                  disabled={!selectedOption || voting}
                  className={`w-full max-w-xs py-2 px-4 text-base font-bold rounded-md shadow bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 text-white transition-all duration-200 border border-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:text-white ${(!selectedOption || voting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ letterSpacing: '0.5px' }}
                >
                  {voting ? 'Submitting...' : 'Submit Vote'}
                </button>
              </div>
            </div>
          ) : (poll.resultsDeclared || isCreator || isAdmin) ? (
            <div className="space-y-4">
              {poll.options.map((option: any) => {
                const percentage = calculatePercentage(option.votes, totalVotes);
                const isWinning = totalVotes > 0 && 
                  option.votes === Math.max(...poll.options.map((o: any) => o.votes));
                return (
                  <div key={option._id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {option.text}
                      </span>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${isWinning ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-400 dark:bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Results section logic */}
        {hasVoted && !isCreator && !isAdmin && !poll.resultsDeclared && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-center">
            <p className="text-yellow-700 dark:text-yellow-300">
              The poll creator has not yet declared the results. Please check back later.
            </p>
          </div>
        )}
        {(isCreator || isAdmin) && !poll.resultsDeclared && (
          <div className="mt-6 flex flex-col items-center">
            <button
              className="w-full max-w-xs py-2 px-4 text-base font-bold rounded-md shadow bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 text-white transition-all duration-200 border border-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:text-white mx-auto"
              onClick={handleDeclareResults}
              disabled={loading}
              style={{ letterSpacing: '0.5px' }}
            >
              {loading ? 'Declaring...' : 'Declare Results'}
            </button>
            <p className="mt-2 text-xs text-gray-500 w-full text-center">
              Once declared, all voters will be able to see the results.<br />
              <span className="text-blue-500">You can declare results even after the poll has expired.</span>
            </p>
          </div>
        )}
        {/* Only show results if declared, or if creator/admin */}
        {(poll.resultsDeclared || isCreator || isAdmin) && totalVotes > 0 && (
          <div className="mt-8 animate-fade-in">
            <h3 className="text-lg font-semibold mb-2">Results Overview</h3>
            <div className="transition-transform duration-700 hover:scale-105">
            <Pie data={chartData} />
            </div>
          </div>
        )}

        {/* Show voters to creator/admin */}
        {(isCreator || isAdmin) && poll.voters && Array.isArray(poll.voters) && poll.voters.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Voters</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-200">
              {poll.voters.map((voter: any) => (
                <li key={voter._id || voter} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <UserCircleIcon className="w-4 h-4 text-primary-500 dark:text-primary-300" />
                  </span>
                  <span>{voter.email || voter}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasVoted && (
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-center">
            <p className="text-emerald-600 dark:text-emerald-400">
              Thank you for voting!
            </p>
          </div>
        )}

        {isExpired && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-gray-700 dark:text-gray-300">
              This poll has expired
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigate('/')}
          className="btn btn-outline"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PollDetail; 