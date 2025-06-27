import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">User Info</h2>
        <p className="text-gray-600 dark:text-gray-300">You must be logged in to view your profile.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await userApi.updateProfile({ name, phone, profilePic });
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }
    try {
      await userApi.resetPassword(currentPassword, newPassword);
      setSuccess('Password reset successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setResetMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your Profile</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex flex-col items-center gap-2 mb-6">
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 shadow" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-4xl font-bold text-white">
              {(name ? name.charAt(0) : user.email.charAt(0)).toUpperCase()}
            </div>
          )}
          <input
            type="text"
            placeholder="Profile Picture URL"
            value={profilePic}
            onChange={e => setProfilePic(e.target.value)}
            className="mt-2 w-48 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        {user.role && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <input
              type="text"
              value={user.role}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}
        {user.createdAt && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Created</label>
            <input
              type="text"
              value={new Date(user.createdAt).toLocaleString()}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}
        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
      </form>
      <div className="mt-6">
        <button onClick={() => setResetMode(!resetMode)} className="text-blue-600 hover:underline">{resetMode ? 'Cancel' : 'Reset Password'}</button>
        {resetMode && (
          <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700">Reset Password</button>
          </form>
        )}
      </div>
      {success && <div className="mt-4 text-green-600">{success}</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
};

export default Profile; 