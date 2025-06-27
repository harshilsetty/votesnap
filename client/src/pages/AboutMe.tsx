import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const AboutMe: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [email] = useState(user?.email || '');
  const [resetMode, setResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

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
      <h2 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-400">About VoteSnap</h2>
      <p className="mb-6 text-lg text-gray-700 dark:text-gray-200">
        <b>VoteSnap</b> is a modern, secure, and user-friendly online polling platform designed to make voting and poll management easy for everyone.
      </p>
      <div className="mb-6 flex flex-col items-center gap-2">
        <img src="https://avatars.githubusercontent.com/u/102648347?v=4" alt="Harshil Somisetty" className="w-20 h-20 rounded-full object-cover border-2 border-blue-400 shadow" />
        <div className="text-lg font-semibold text-gray-900 dark:text-white">Harshil Somisetty</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Creator & Developer</div>
      </div>
      <div className="mb-6 flex flex-col items-center gap-2">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 text-white text-3xl font-bold shadow">🤖</span>
        <div className="text-lg font-semibold text-gray-900 dark:text-white">CURSOR AI</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">AI Assistant & Co-Creator</div>
      </div>
      <div className="mt-8 text-base text-gray-600 dark:text-gray-300">
        <p>Made with ❤️ by Harshil & CURSOR AI</p>
        <p className="mt-2">For feedback or collaboration, contact: <a href="mailto:harshilsomisetty@gmail.com" className="text-blue-600 dark:text-blue-400 underline">harshilsomisetty@gmail.com</a></p>
      </div>
    </div>
  );
};

export default AboutMe; 