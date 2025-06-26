import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pollApi from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiPencil, HiPlus, HiTrash, HiExclamationCircle, HiClock, HiEye, HiEyeOff } from 'react-icons/hi';

const CreatePoll: React.FC = () => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [expiryHours, setExpiryHours] = useState(24);
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdAccessCode, setCreatedAccessCode] = useState<string | null>(null);
  const [createdPollId, setCreatedPollId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate title
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }

    // Validate options
    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    // Check for duplicate options
    const uniqueOptions = new Set(validOptions.map(opt => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== validOptions.length) {
      setError('Options must be unique');
      return;
    }

    setIsLoading(true);

    try {
      const poll = await pollApi.createPoll({
        title: title.trim(),
        options: validOptions.map(opt => opt.trim()),
        expiryHours,
        isPublic
      });
      if (!isPublic && poll.accessCode) {
        setCreatedAccessCode(poll.accessCode);
        setCreatedPollId(poll._id);
      } else {
        navigate(`/poll/${poll._id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create poll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Please log in to create a poll</div>
        <button
          onClick={() => navigate('/login')}
          className="btn btn-primary"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Create New Poll</h1>

      {createdAccessCode && createdPollId && (
        <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg text-center">
          <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Private Poll Created!</h2>
          <p className="text-yellow-700 dark:text-yellow-100 mb-2">
            Share this access code with voters:
          </p>
          <div className="text-2xl font-mono font-bold text-yellow-900 dark:text-yellow-100 mb-4">{createdAccessCode}</div>
          <p className="text-yellow-700 dark:text-yellow-100 mb-2">
            Or share this direct poll link:
          </p>
          <div className="flex flex-col items-center gap-2 mb-4">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/poll/${createdPollId}?code=${createdAccessCode}`}
              className="w-full max-w-xl px-2 py-1 rounded border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/60 text-yellow-900 dark:text-yellow-100 font-mono text-sm"
              onFocus={e => e.target.select()}
            />
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/poll/${createdPollId}?code=${createdAccessCode}`);
                alert('Poll link copied to clipboard!');
              }}
            >
              Copy Link
            </button>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/poll/${createdPollId}`)}
          >
            Go to Poll
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 flex items-center gap-2">
            <HiExclamationCircle className="text-red-500 dark:text-red-200 text-xl" />
            <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
          </div>
        )}
        <div className="rounded-md shadow-sm bg-white/80 dark:bg-gray-800/80 p-6 space-y-6 border border-gray-200 dark:border-gray-700">
          {/* Poll Title */}
          <div className="relative">
            <HiPencil className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg pointer-events-none" />
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`peer pl-10 pr-3 py-3 block w-full rounded-md border bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 placeholder-transparent transition-all ${title && title.trim().length < 3 ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'}`}
              placeholder="Enter poll title"
              required
              aria-invalid={title && title.trim().length < 3}
              aria-describedby="title-error"
            />
            <label
              htmlFor="title"
              className={`absolute left-10 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-1 text-gray-500 dark:text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:dark:text-blue-400 peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 dark:peer-placeholder-shown:text-gray-400 ${title ? '-top-2 left-2 text-xs text-blue-600 dark:text-blue-400' : ''}`}
            >
              Poll Title
            </label>
            {title && title.trim().length < 3 && (
              <span id="title-error" className="text-xs text-red-600 dark:text-red-400 mt-1 block">Title must be at least 3 characters</span>
            )}
          </div>
          {/* Poll Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Options
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center relative">
                  <HiPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-lg pointer-events-none" />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className={`peer pl-10 pr-3 py-3 flex-1 rounded-md border bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 placeholder-transparent transition-all ${(option && option.trim().length === 0) ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'}`}
                    placeholder={`Option ${index + 1}`}
                    required
                    aria-invalid={option && option.trim().length === 0}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      aria-label="Remove option"
                    >
                      <HiTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <HiPlus className="mr-2" /> Add Option
              </button>
            )}
          </div>
          {/* Expiry Time */}
          <div className="relative">
            <HiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg pointer-events-none" />
            <input
              type="number"
              id="expiry"
              min={1}
              max={168}
              value={expiryHours}
              onChange={(e) => setExpiryHours(Number(e.target.value))}
              className="peer pl-10 pr-3 py-3 block w-full rounded-md border bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 placeholder-transparent transition-all border-gray-300 dark:border-gray-700"
              placeholder="Expiry Time (hours)"
              required
            />
            <label
              htmlFor="expiry"
              className={`absolute left-10 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-1 text-gray-500 dark:text-gray-400 pointer-events-none transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:dark:text-blue-400 peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 dark:peer-placeholder-shown:text-gray-400 ${expiryHours ? '-top-2 left-2 text-xs text-blue-600 dark:text-blue-400' : ''}`}
            >
              Expiry Time (hours)
            </label>
          </div>
          {/* Public/Private Toggle */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Poll Visibility:</span>
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex items-center gap-1 px-3 py-1 rounded-md border text-sm font-medium transition-all ${isPublic ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
            >
              <HiEye className="text-lg" /> Public
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex items-center gap-1 px-3 py-1 rounded-md border text-sm font-medium transition-all ${!isPublic ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
            >
              <HiEyeOff className="text-lg" /> Private
            </button>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Create Poll'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePoll; 