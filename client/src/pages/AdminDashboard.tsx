import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pollApi, Poll } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    if (user?.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      return;
    }

    fetchPolls();
  }, [isAuthenticated, user, navigate]);

  const fetchPolls = async () => {
    try {
      setIsLoading(true);
      const data = await pollApi.getDashboardData();
      setPolls(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch polls');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!window.confirm('Are you sure you want to delete this poll?')) {
      return;
    }

    try {
      await pollApi.deletePoll(pollId);
      setPolls(polls.filter(poll => poll._id !== pollId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete poll');
    }
  };

  const handleEndPoll = async (pollId: string) => {
    if (!window.confirm('Are you sure you want to end this poll?')) {
      return;
    }

    try {
      await pollApi.deletePoll(pollId);
      setPolls(polls.filter(poll => poll._id !== pollId));
    } catch (err: any) {
      setError(err.message || 'Failed to end poll');
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ message: `${label} copied!`, type: 'success' });
    } catch {
      setToast({ message: `Failed to copy ${label.toLowerCase()}.`, type: 'error' });
    }
  };

  const handleViewPoll = (poll: Poll) => {
    setSelectedPoll(poll);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPoll(null);
  };

  const filteredPolls = polls.filter(poll => {
    const matchesSearch = poll.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || poll.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return null; // Will be redirected by useEffect
  }

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Access denied. Admin privileges required.</div>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (isLoading) {
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
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          onAnimationEnd={() => setToast(null)}
        >
          {toast.message}
        </div>
      )}

      {/* Modal for Poll Analytics */}
      {showModal && selectedPoll && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full p-6 relative animate-fade-in">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl">&times;</button>
            <h2 className="text-xl font-bold mb-2">Poll Analytics</h2>
            <div className="mb-2 text-gray-600 dark:text-gray-300">{selectedPoll.title}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="h-48">
                <Bar data={{
                  labels: selectedPoll.options.map(o => o.text),
                  datasets: [{
                    label: 'Votes',
                    data: selectedPoll.options.map(o => o.votes),
                    backgroundColor: [
                      'rgba(54, 162, 235, 0.8)',
                      'rgba(255, 99, 132, 0.8)',
                      'rgba(75, 192, 192, 0.8)',
                      'rgba(255, 206, 86, 0.8)',
                      'rgba(153, 102, 255, 0.8)',
                    ],
                  }],
                }} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: false } } }} />
              </div>
              <div className="h-48">
                <Pie data={{
                  labels: selectedPoll.options.map(o => o.text),
                  datasets: [{
                    label: 'Votes',
                    data: selectedPoll.options.map(o => o.votes),
                    backgroundColor: [
                      'rgba(54, 162, 235, 0.8)',
                      'rgba(255, 99, 132, 0.8)',
                      'rgba(75, 192, 192, 0.8)',
                      'rgba(255, 206, 86, 0.8)',
                      'rgba(153, 102, 255, 0.8)',
                    ],
                  }],
                }} options={{ responsive: true, plugins: { legend: { position: 'bottom' as const }, title: { display: false } } }} />
              </div>
            </div>
            <div className="mb-2">
              <div className="font-semibold">Options:</div>
              <ul className="list-disc ml-6 text-gray-700 dark:text-gray-200">
                {selectedPoll.options.map((o, i) => (
                  <li key={i}>{o.text}: <span className="font-bold">{o.votes}</span> votes</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
              <div>Created: {new Date(selectedPoll.createdAt).toLocaleString()}</div>
              <div>Expires: {new Date(selectedPoll.expiresAt).toLocaleString()}</div>
              <div>Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedPoll.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>{selectedPoll.status}</span></div>
              <div>Total Votes: {selectedPoll.options.reduce((sum, o) => sum + o.votes, 0)}</div>
              <div>Created By: {typeof selectedPoll.createdBy === 'string' ? `User ID: ${selectedPoll.createdBy}` : `${selectedPoll.createdBy.email} (${selectedPoll.createdBy.role})`}</div>
              {!selectedPoll.isPublic && (
                <div>Access Code: <span className="font-mono text-yellow-700 dark:text-yellow-200">{selectedPoll.accessCode}</span></div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Link
            to="/admin/signup"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Register New Admin
          </Link>
          <Link
            to="/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Poll
          </Link>
        </div>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search polls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input flex-1"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-40"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-left border-b dark:border-gray-700">
                <th className="pb-3 px-4">Title</th>
                <th className="pb-3 px-4">Created By</th>
                <th className="pb-3 px-4">Options</th>
                <th className="pb-3 px-4">Votes</th>
                <th className="pb-3 px-4">Created</th>
                <th className="pb-3 px-4">Expires</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Access Code</th>
                <th className="pb-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolls.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-5xl">🗳️</span>
                      <span className="text-lg font-semibold">No polls found.</span>
                      <span className="text-sm">Try adjusting your search or filter.</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPolls.map((poll) => (
                <tr key={poll._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer" onClick={() => handleViewPoll(poll)}>
                  <td className="py-4 px-4 font-semibold">{poll.title}</td>
                  <td className="py-4 px-4">
                    {typeof poll.createdBy === 'string' ? (
                      <span className="text-gray-500 dark:text-gray-400">User ID: {poll.createdBy}</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">{poll.createdBy.email}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{poll.createdBy.role}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">{poll.options.length}</td>
                  <td className="py-4 px-4">{poll.options.reduce((sum, opt) => sum + opt.votes, 0)}</td>
                  <td className="py-4 px-4">{new Date(poll.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-4">{new Date(poll.expiresAt).toLocaleDateString()}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${poll.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>{poll.status}</span>
                  </td>
                  <td className="py-4 px-4">
                    {!poll.isPublic && poll.accessCode ? (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-yellow-700 dark:text-yellow-200 font-mono">{poll.accessCode}</span>
                        <button
                          className="btn btn-xs btn-outline"
                          title="Copy Access Code"
                          onClick={e => { e.stopPropagation(); handleCopy(poll.accessCode!, 'Access Code'); }}
                        >Copy Code</button>
                      </div>
                    ) : null}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 items-center">
                      <button
                        className="btn btn-xs btn-info"
                        title="View Analytics"
                        onClick={e => { e.stopPropagation(); handleViewPoll(poll); }}
                      >View</button>
                      <button
                        className="btn btn-xs btn-outline"
                        title="Copy Poll Link"
                        onClick={e => { e.stopPropagation(); handleCopy(`${window.location.origin}/poll/${poll._id}${poll.accessCode ? `?accessCode=${poll.accessCode}` : ''}`, 'Poll Link'); }}
                      >Copy Link</button>
                      <button
                        className="btn btn-xs btn-warning"
                        title="End Poll"
                        onClick={e => { e.stopPropagation(); handleEndPoll(poll._id); }}
                        disabled={poll.status !== 'active'}
                      >End</button>
                      <button
                        className="btn btn-xs btn-error"
                        title="Delete Poll"
                        onClick={e => { e.stopPropagation(); handleDeletePoll(poll._id); }}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 