import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AccessPoll: React.FC = () => {
  const [pollId, setPollId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!pollId.trim()) {
      setError('Please enter a Poll ID');
      return;
    }
    // If access code is provided, add it as a query param
    if (accessCode.trim()) {
      navigate(`/poll/${pollId}?accessCode=${encodeURIComponent(accessCode)}`);
    } else {
      navigate(`/poll/${pollId}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Access a Poll
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter the Poll ID to view a public poll, or add the access code for a private poll.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 flex items-center gap-2 text-red-700 dark:text-red-200 text-sm">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm bg-white/80 dark:bg-gray-800/80 p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            <div>
              <label htmlFor="pollId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Poll ID
              </label>
              <input
                id="pollId"
                name="pollId"
                type="text"
                value={pollId}
                onChange={e => setPollId(e.target.value)}
                className="w-full h-12 px-3 py-3 rounded-md border bg-transparent dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-300 dark:border-gray-700 transition-all duration-200"
                placeholder="Enter Poll ID"
                required
              />
            </div>
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Access Code (if private)
              </label>
              <input
                id="accessCode"
                name="accessCode"
                type="text"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value)}
                className="w-full h-12 px-3 py-3 rounded-md border bg-transparent dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-300 dark:border-gray-700 transition-all duration-200"
                placeholder="Enter Access Code (optional)"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Access Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccessPoll; 