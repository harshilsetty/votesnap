import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pollApi, { Poll } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyPolls: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const shareText = (title: string, url: string) =>
    encodeURIComponent(`Check out my poll: "${title}"\n${url}`);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        const data = await pollApi.getUserPolls();
        setPolls(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch your polls');
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchPolls();
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
      <h1 className="text-3xl font-bold mb-8">My Polls</h1>
      {polls.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          You haven't created any polls yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => {
            // Build the shareable link
            const pollLink = poll.isPublic
              ? `${window.location.origin}/poll/${poll._id}`
              : `${window.location.origin}/poll/${poll._id}${poll.accessCode ? `?accessCode=${encodeURIComponent(poll.accessCode || '')}` : ''}`;
            return (
              <div key={poll._id} className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <Link
                  to={`/poll/${poll._id}`}
                  className="block"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {poll.title}
                  </h2>
                  <div className="flex items-center mb-2">
                    <span className="text-xs text-gray-400 mr-2">ID: <span className="font-mono select-all">{poll._id}</span></span>
                    <button
                      className="ml-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(poll._id);
                        setCopiedId(`id-${poll._id}`);
                        setTimeout(() => setCopiedId(null), 1200);
                      }}
                    >
                      {copiedId === `id-${poll._id}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Status: {poll.status}</p>
                    <p>Type: {poll.isPublic ? 'Public' : 'Private'}</p>
                    <p>Total votes: {poll.totalVotes}</p>
                    <p>Expires: {new Date(poll.expiresAt).toLocaleString()}</p>
                    {!poll.isPublic && poll.accessCode && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 flex items-center">
                        Access Code: <span className="font-mono select-all mr-2">{poll.accessCode || ''}</span>
                        <button
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-xs rounded hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none"
                          onClick={async (e) => {
                            e.preventDefault();
                            await navigator.clipboard.writeText(poll.accessCode || '');
                            setCopiedId(`code-${poll._id}`);
                            setTimeout(() => setCopiedId(null), 1200);
                          }}
                        >
                          {copiedId === `code-${poll._id}` ? 'Copied!' : 'Copy Code'}
                        </button>
                      </p>
                    )}
                  </div>
                </Link>
                <button
                  className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none text-sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(pollLink);
                    setCopiedId(poll._id);
                    setTimeout(() => setCopiedId(null), 1500);
                  }}
                >
                  {copiedId === poll._id ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={`https://wa.me/?text=${shareText(poll.title, pollLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none text-sm inline-block"
                  title="Share on WhatsApp"
                >
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent('Vote in my poll!')}&body=${shareText(poll.title, pollLink)}`}
                  className="ml-2 px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 focus:outline-none text-sm inline-block"
                  title="Share via Email"
                >
                  Email
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPolls; 