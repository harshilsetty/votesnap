import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<{ name: boolean; email: boolean; password: boolean; confirmPassword: boolean }>({ name: false, email: false, password: false, confirmPassword: false });
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');

  // Inline validation
  const emailValid = email.length > 0 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const passwordValid = password.length >= 6;
  const confirmPasswordValid = confirmPassword === password && confirmPassword.length > 0;
  const nameValid = name.trim().length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (!nameValid || !emailValid || !passwordValid || !confirmPasswordValid) return;
    setIsLoading(true);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your account
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
            {/* Name Field */}
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                className={`peer pl-3 pr-3 py-3 block w-full rounded-md border bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 placeholder-transparent transition-all ${touched.name && !nameValid ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="Full Name"
                aria-invalid={touched.name && !nameValid}
                aria-describedby="name-error"
              />
              <label
                htmlFor="name"
                className={`absolute left-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-1 text-gray-500 dark:text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:dark:text-blue-400 peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 dark:peer-placeholder-shown:text-gray-400 ${name ? '-top-2 left-2 text-xs text-blue-600 dark:text-blue-400' : ''}`}
              >
                Full Name
              </label>
              {touched.name && !nameValid && (
                <span id="name-error" className="text-xs text-red-600 dark:text-red-400 mt-1 block">Enter your full name (at least 2 characters)</span>
              )}
            </div>
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
                autoComplete="new-password"
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
                <span id="password-error" className="text-xs text-red-600 dark:text-red-400 mt-1 block">Password must be at least 6 characters</span>
              )}
            </div>
            {/* Confirm Password Field */}
            <div className="relative">
              <HiCheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg pointer-events-none" />
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                className={`peer pl-10 pr-3 py-3 block w-full rounded-md border bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 placeholder-transparent transition-all ${touched.confirmPassword && !confirmPasswordValid ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'}`}
                placeholder="Confirm Password"
                aria-invalid={touched.confirmPassword && !confirmPasswordValid}
                aria-describedby="confirm-password-error"
              />
              <label
                htmlFor="confirm-password"
                className={`absolute left-10 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-1 text-gray-500 dark:text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:dark:text-blue-400 peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 dark:peer-placeholder-shown:text-gray-400 ${confirmPassword ? '-top-2 left-2 text-xs text-blue-600 dark:text-blue-400' : ''}`}
              >
                Confirm Password
              </label>
              {touched.confirmPassword && !confirmPasswordValid && (
                <span id="confirm-password-error" className="text-xs text-red-600 dark:text-red-400 mt-1 block">Passwords do not match</span>
              )}
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading || !emailValid || !passwordValid || !confirmPasswordValid}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Sign up'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup; 