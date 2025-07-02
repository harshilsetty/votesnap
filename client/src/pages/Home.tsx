import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pollApi, Poll } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [filteredPolls, setFilteredPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchPolls();
    
    // Update current time every minute for countdown timers
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    filterAndSortPolls();
  }, [polls, searchTerm, categoryFilter, statusFilter, sortBy]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const data = await pollApi.getPolls();
      setPolls(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch polls');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPolls = () => {
    let filtered = polls.filter(poll => {
      const matchesSearch = poll.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || poll.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || poll.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort polls
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'mostVotes':
          return b.totalVotes - a.totalVotes;
        case 'endingSoon':
          return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredPolls(filtered);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = currentTime.getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'general': '📊',
      'politics': '🏛️',
      'technology': '💻',
      'entertainment': '🎬',
      'sports': '⚽',
      'education': '📚',
      'business': '💼',
      'health': '🏥',
      'other': '📋'
    };
    return icons[category] || '📋';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 relative overflow-hidden">
      {/* Enhanced Background with Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
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

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            Discover & Vote
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Explore polls from around the world, share your opinion, and see real-time results.
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <Link
              to="/create"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              ✨ Create New Poll
            </Link>
            {!isAuthenticated && (
              <Link
                to="/signup"
                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-full font-medium border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 transform hover:scale-105"
              >
                🚀 Join VoteSnap
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20 dark:border-gray-700/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search polls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="politics">Politics</option>
              <option value="technology">Technology</option>
              <option value="entertainment">Entertainment</option>
              <option value="sports">Sports</option>
              <option value="education">Education</option>
              <option value="business">Business</option>
              <option value="health">Health</option>
              <option value="other">Other</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostVotes">Most Votes</option>
              <option value="endingSoon">Ending Soon</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['all', 'active', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  statusFilter === status
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status === 'all' ? 'All' : status === 'active' ? '🟢 Active' : '🔴 Expired'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center border border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 animate-pulse">
              {polls.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total Polls</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center border border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {polls.filter(p => p.status === 'active').length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Active Polls</div>
          </div>
        </div>

        {/* Polls Grid */}
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={fetchPolls}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredPolls.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-bounce">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No polls found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search criteria or create the first poll!
            </p>
            <Link
              to="/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
            >
              Create First Poll
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolls.map((poll) => (
              <Link
                key={poll._id}
                to={`/poll/${poll._id}`}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-white/20 dark:border-gray-700/20"
              >
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                      {getCategoryIcon(poll.category || 'other')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                      poll.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 group-hover:bg-green-200 dark:group-hover:bg-green-800'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {poll.status === 'active' ? '🟢 Active' : '🔴 Expired'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {poll.title}
                  </h3>

                  {/* Poll Info with Animated Vote Count */}
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between">
                      <span>📊 {poll.options.length} options</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
                        🗳️ {poll.totalVotes.toLocaleString()} votes
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-orange-600 dark:text-orange-400">
                        ⏰ {getTimeRemaining(poll.expiresAt)}
                      </span>
                      <span>{poll.isPublic ? '🌐 Public' : '🔒 Private'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 