import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pollApi, { Poll } from '../services/api';
import { Toaster } from 'react-hot-toast';

const Home: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setIsLoading(true);
        const data = await pollApi.getPublicPolls();
        setPolls(data);
      } catch (err: any) {
        console.error('Error fetching polls:', err);
        setError(err.message || 'Failed to fetch polls');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolls();
  }, []);

  // Filter out expired polls
  const activePolls = polls.filter(poll => {
    // If poll.status exists, use it; otherwise, check expiresAt
    if (poll.status) {
      return poll.status === 'active';
    }
    return new Date(poll.expiresAt) > new Date();
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        {/* Skeleton loader for poll cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-32 flex flex-col justify-between">
              <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-1"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-500 hover:text-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {/* Greeting Section */}
      {isAuthenticated && user && (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6 mb-6 bg-primary-50 dark:bg-primary-900/30 rounded-xl shadow animate-fade-in">
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border-2 border-primary-300 dark:border-primary-700 shadow"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-2xl font-bold text-white">
              {(user.name ? user.name.charAt(0) : user.email.charAt(0)).toUpperCase()}
            </div>
          )}
          <div className="text-center sm:text-left">
            <div className="text-lg sm:text-xl font-semibold text-primary-700 dark:text-primary-200">Hello, {user.name ? user.name.split(' ')[0] : user.email.split('@')[0]}!</div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Welcome back to VoteSnap{user.role === 'admin' ? ' (Admin)' : ''}.</div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Public Polls</h1>
        {isAuthenticated && (
          <Link
            to="/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-base sm:text-lg"
          >
            Create Poll
          </Link>
        )}
      </div>
      {activePolls.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No polls available. {isAuthenticated && 'Be the first to create one!'}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {activePolls.map((poll) => (
            <Link
              key={poll._id}
              to={`/poll/${poll._id}`}
              className="block p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {poll.title}
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Created by: {typeof poll.createdBy === 'object' && poll.createdBy !== null ? poll.createdBy.email : 'Anonymous'}</p>
                <p>Status: {poll.status}</p>
                <p>Total votes: {poll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home; 