import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiExclamationCircle } from 'react-icons/hi';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Inline validation
  const emailValid = email.length > 0 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const passwordValid = password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTouched({ email: true, password: true });
    if (!emailValid || !passwordValid) return;
    setIsLoading(true);
    try {
      await login(email, password);
      if (user && user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 flex items-center gap-2">
              <HiExclamationCircle className="text-red-500 dark:text-red-200 text-xl" />
              <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm bg-white/80 dark:bg-gray-800/80 p-6 space-y-6 border border-gray-200 dark:border-gray-700">
            {/* Email Field */}
            <div className="relative">
              <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg pointer-events-none" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className={`peer pl-10 pr-3 py-3 block w-full rounded-md border bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 placeholder-transparent transition-all ${touched.email && !emailValid ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="Email address"
                aria-invalid={touched.email && !emailValid}
                aria-describedby="email-error"
              />
              <label
                htmlFor="email"
                className={`absolute left-10 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-1 text-gray-500 dark:text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:dark:text-blue-400 peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 dark:peer-placeholder-shown:text-gray-400 ${email ? '-top-2 left-2 text-xs text-blue-600 dark:text-blue-400' : ''}`}
              >
                Email address
              </label>
              {touched.email && !emailValid && (
                <span id="email-error" className="text-xs text-red-600 dark:text-red-400 mt-1 block">Enter a valid email address</span>
              )}
            </div>
            {/* Password Field */}
            <div className="relative">
              <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg pointer-events-none" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                className={`peer pl-10 pr-3 py-3 block w-full rounded-md border bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 placeholder-transparent transition-all ${touched.password && !passwordValid ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="Password"
                aria-invalid={touched.password && !passwordValid}
                aria-describedby="password-error"
              />
              <label
                htmlFor="password"
                className={`absolute left-10 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-1 text-gray-500 dark:text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:dark:text-blue-400 peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 dark:peer-placeholder-shown:text-gray-400 ${password ? '-top-2 left-2 text-xs text-blue-600 dark:text-blue-400' : ''}`}
              >
                Password
              </label>
              {touched.password && !passwordValid && (
                <span id="password-error" className="text-xs text-red-600 dark:text-red-400 mt-1 block">Password is required</span>
              )}
            </div>
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading || !emailValid || !passwordValid}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 