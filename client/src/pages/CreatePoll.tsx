import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollApi, CreatePollData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiPencil, HiPlus, HiTrash, HiExclamationCircle, HiClock, HiEye, HiEyeOff } from 'react-icons/hi';

const CreatePoll: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreatePollData>({
    title: '',
    description: '',
    category: 'general',
    options: ['', ''],
    expiryHours: 24,
    isPublic: true,
    tags: [],
    allowMultipleVotes: false,
    allowMultipleOptions: false,
    maxSelectableOptions: 2,
    showResultsBeforeVoting: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTag, setNewTag] = useState('');

  const categories = [
    { value: 'general', label: 'General', icon: '📊' },
    { value: 'politics', label: 'Politics', icon: '🏛️' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'other', label: 'Other', icon: '📋' },
  ];

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData({ ...formData, options: [...formData.options, ''] });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim()) && (formData.tags?.length || 0) < 5) {
      setFormData({ 
        ...formData, 
        tags: [...(formData.tags || []), newTag.trim()] 
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || [] 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please log in to create a poll');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a poll title');
      return;
    }

    if (formData.options.filter(opt => opt.trim()).length < 2) {
      setError('Please enter at least 2 options');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const pollData = {
        ...formData,
        options: formData.options.filter(opt => opt.trim()),
        tags: formData.tags?.filter(tag => tag.trim()) || [],
      };

      const createdPoll = await pollApi.createPoll(pollData);
      navigate(`/poll/${createdPoll._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create New Poll
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Share your question with the world and get instant feedback
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Poll Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What's your question?"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add more context to your poll..."
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a tag..."
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Poll Options *
              </label>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Option ${index + 1}`}
                      maxLength={100}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-3 py-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {formData.options.length < 10 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    + Add Option
                  </button>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expiry */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Poll Duration
                </label>
                <select
                  value={formData.expiryHours}
                  onChange={(e) => setFormData({ ...formData, expiryHours: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 hour</option>
                  <option value={6}>6 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>1 day</option>
                  <option value={72}>3 days</option>
                  <option value={168}>1 week</option>
                  <option value={720}>1 month</option>
                </select>
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Privacy Setting
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={formData.isPublic}
                      onChange={() => setFormData({ ...formData, isPublic: true })}
                      className="mr-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">🌐 Public - Anyone can vote</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!formData.isPublic}
                      onChange={() => setFormData({ ...formData, isPublic: false })}
                      className="mr-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">🔒 Private - Access code required</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Advanced Options</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allowMultipleVotes}
                    onChange={(e) => setFormData({ ...formData, allowMultipleVotes: e.target.checked })}
                    className="mr-3"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Allow multiple votes per user</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allowMultipleOptions}
                    onChange={(e) => setFormData({ ...formData, allowMultipleOptions: e.target.checked })}
                    className="mr-3"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Allow users to select multiple options</span>
                </label>
                {formData.allowMultipleOptions && (
                  <div className="flex items-center mt-2 ml-6">
                    <label className="mr-2 text-gray-700 dark:text-gray-300">Max selectable options:</label>
                    <input
                      type="number"
                      min={2}
                      max={formData.options.length}
                      value={formData.maxSelectableOptions || 2}
                      onChange={e => setFormData({ ...formData, maxSelectableOptions: Math.max(2, Math.min(formData.options.length, Number(e.target.value))) })}
                      className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showResultsBeforeVoting}
                    onChange={(e) => setFormData({ ...formData, showResultsBeforeVoting: e.target.checked })}
                    className="mr-3"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Show results before voting</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Creating...' : 'Create Poll'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll; 