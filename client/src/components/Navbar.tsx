import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiSun, HiMoon } from 'react-icons/hi';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [privatePollId, setPrivatePollId] = useState('');
  const [privateAccessCode, setPrivateAccessCode] = useState('');
  const [privateError, setPrivateError] = useState('');
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredPollId, setExpiredPollId] = useState('');
  const [expiredError, setExpiredError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handlePrivatePollAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!privatePollId.trim() || !privateAccessCode.trim()) {
      setPrivateError('Please enter both Poll ID and Access Code.');
      return;
    }
    setPrivateError('');
    setShowPrivateModal(false);
    navigate(`/poll/${privatePollId.trim()}?accessCode=${encodeURIComponent(privateAccessCode.trim())}`);
    setPrivatePollId('');
    setPrivateAccessCode('');
  };

  const handleExpiredPollAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expiredPollId.trim()) {
      setExpiredError('Please enter a Poll ID.');
      return;
    }
    setExpiredError('');
    setShowExpiredModal(false);
    navigate(`/poll/${expiredPollId.trim()}`);
    setExpiredPollId('');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {/* SVG Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" className="fill-blue-100 dark:fill-blue-900" />
              <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">VoteSnap</span>
            <span className="sm:hidden">VS</span>
          </Link>
          {/* Hamburger for mobile */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center sm:gap-6">
            <div className="hidden sm:flex sm:items-center gap-x-4">
              <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
              {isAuthenticated && (
                <Link to="/profile" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-1 rounded-md text-base font-medium">{user?.name || user?.email}</Link>
              )}
              {isAuthenticated && (
                <Link to="/mypolls" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">My Polls</Link>
              )}
              <Link to="/create" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Create Poll</Link>
              <div className="flex items-center gap-x-2">
                <button
                  onClick={() => setShowPrivateModal(true)}
                  className="px-3 py-1 rounded-md text-sm font-medium border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Access a private poll by ID and code"
                  type="button"
                >
                  Private Poll
                </button>
                <button
                  onClick={() => setShowExpiredModal(true)}
                  className="px-3 py-1 rounded-md text-sm font-medium border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  title="Check an expired public poll by ID"
                  type="button"
                >
                  Expired Poll
                </button>
              </div>
              <button
                onClick={toggleTheme}
                className="ml-2 p-2 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <HiSun className="w-5 h-5 text-yellow-400" /> : <HiMoon className="w-5 h-5 text-primary-900" />}
              </button>
              {isAuthenticated && user?.role === 'admin' && (
                <Link to="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-1 rounded-md text-base font-medium">Admin Dashboard</Link>
              )}
            </div>
            {isAuthenticated ? (
              <>
                <Link to="/about-me" className="ml-2 px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none text-sm">About</Link>
                <button
                  onClick={logout}
                  className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none text-sm">Login</Link>
                <Link to="/signup" className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none text-sm">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-2 pt-2 pb-3 space-y-1 animate-fade-in" id="mobile-menu">
          <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => setMenuOpen(false)}>Home</Link>
          {isAuthenticated && (
            <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => setMenuOpen(false)}>{user?.name || user?.email}</Link>
          )}
          {isAuthenticated && (
            <Link to="/mypolls" className="block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => setMenuOpen(false)}>My Polls</Link>
          )}
          <Link to="/create" className="block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => setMenuOpen(false)}>Create Poll</Link>
          <button
            onClick={() => { setMenuOpen(false); setShowPrivateModal(true); }}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
            type="button"
          >
            Private Poll
          </button>
          <button
            onClick={() => { setMenuOpen(false); setShowExpiredModal(true); }}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 mt-1"
            type="button"
          >
            Expired Poll
          </button>
          <button
            onClick={() => { toggleTheme(); setMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to="/about-me" className="block px-3 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none text-base mt-1" onClick={() => setMenuOpen(false)}>About</Link>
              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="block w-full text-left px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none text-base mt-1"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none text-base mt-1" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="block px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none text-base mt-1" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}

      {/* Private Poll Modal */}
      {showPrivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm relative animate-slide-up flex flex-col items-center justify-center">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setShowPrivateModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4 text-center">Access Private Poll</h2>
            <form onSubmit={handlePrivatePollAccess} className="space-y-4 w-full flex flex-col items-center">
              <div className="w-full">
                <label htmlFor="privatePollId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Poll ID
                </label>
                <input
                  type="text"
                  id="privatePollId"
                  value={privatePollId}
                  onChange={e => setPrivatePollId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-3 text-base"
                  placeholder="Enter Poll ID"
                  required
                />
              </div>
              <div className="w-full">
                <label htmlFor="privateAccessCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Access Code
                </label>
                <input
                  type="text"
                  id="privateAccessCode"
                  value={privateAccessCode}
                  onChange={e => setPrivateAccessCode(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-3 text-base"
                  placeholder="Enter Access Code"
                  required
                />
              </div>
              {privateError && <div className="text-red-500 text-sm w-full text-center">{privateError}</div>}
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Access Poll
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Expired Poll Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm relative animate-slide-up flex flex-col items-center justify-center">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setShowExpiredModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4 text-center">Check Expired Public Poll</h2>
            <form onSubmit={handleExpiredPollAccess} className="space-y-4 w-full flex flex-col items-center">
              <div className="w-full">
                <label htmlFor="expiredPollId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Poll ID
                </label>
                <input
                  type="text"
                  id="expiredPollId"
                  value={expiredPollId}
                  onChange={e => setExpiredPollId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-4 py-3 text-base"
                  placeholder="Enter Poll ID"
                  required
                />
              </div>
              {expiredError && <div className="text-red-500 text-sm w-full text-center">{expiredError}</div>}
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Check Poll
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 