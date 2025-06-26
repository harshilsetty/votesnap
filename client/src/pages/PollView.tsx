import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import pollApi, { Poll } from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const PollView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  useEffect(() => {
    const fetchPoll = async () => {
      if (!id) return;
      try {
        const data = await pollApi.getPoll(id);
        setPoll(data);
        if (user && data.voters && Array.isArray(data.voters)) {
          setShowResults(data.voters.some((v: any) => v === user._id || v?._id === user._id));
        } else {
          setShowResults(false);
        }
      } catch (err) {
        setError('Failed to fetch poll. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [id, user]);

  const handleVote = async () => {
    if (!poll || selectedOption === null || !id) return;
    setIsSubmitting(true);
    try {
      const updatedPoll = await pollApi.submitVote(id, {
        optionId: poll.options[selectedOption]._id,
      });
      setPoll(updatedPoll);
      setShowResults(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="text-center text-red-500 py-8">
        {error || 'Poll not found'}
      </div>
    );
  }

  const chartData = {
    labels: poll.options.map(option => option.text),
    datasets: [
      {
        label: 'Votes',
        data: poll.options.map(option => option.votes),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Poll Results',
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">{poll.title}</h1>
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
        ) : !showResults ? (
          <div className="space-y-4">
            <div className="space-y-2">
              {poll.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors
                    ${selectedOption === index
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="vote"
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                    className="mr-3"
                    disabled={isSubmitting}
                  />
                  {option.text}
                </label>
              ))}
            </div>
            <button
              onClick={handleVote}
              disabled={selectedOption === null || isSubmitting}
              className={`w-full text-xl font-extrabold py-4 rounded-lg shadow-xl border-2 border-blue-800 transition-all duration-150 
                bg-blue-600 text-white 
                hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 
                flex items-center justify-center gap-2
                ${selectedOption === null || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {isSubmitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64">
                <Pie data={chartData} options={chartOptions} />
              </div>
              <div className="space-y-2">
                {poll.options.map((option, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{option.text}</span>
                    <span className="font-medium">
                      {option.votes} votes
                      ({poll.totalVotes > 0 ? ((option.votes / poll.totalVotes) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>Total votes: {poll.totalVotes}</span>
          <span>
            Expires in {Math.ceil((new Date(poll.expiresAt).getTime() - Date.now()) / 3600000)}h
          </span>
        </div>
      </div>
    </div>
  );
};

export default PollView; 