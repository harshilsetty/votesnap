import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { pollApi, userApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Toaster, toast } from 'react-hot-toast';
import { MoonIcon, SunIcon, ComputerDesktopIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [bio, setBio] = useState('');
  const [bioLocal, setBioLocal] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pollStats, setPollStats] = useState({ created: 0, votes: 0 });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const polls = await pollApi.getUserPolls();
        setPollStats({
          created: polls.length,
          votes: polls.reduce((acc, poll) => acc + (Array.isArray(poll.voters) ? poll.voters.length : 0), 0),
        });
      } catch (err) {
        // ignore
      }
    };
    if (user) fetchStats();
  }, [user]);

  // Load bio and social handles from localStorage (simulate backend)
  useEffect(() => {
    if (user) {
      const storedBio = localStorage.getItem(`bio_${user._id}`);
      setBioLocal(storedBio || '');
      setBio(storedBio || '');
      setTwitter(localStorage.getItem(`twitter_${user._id}`) || '');
      setLinkedin(localStorage.getItem(`linkedin_${user._id}`) || '');
      setInstagram(localStorage.getItem(`instagram_${user._id}`) || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl text-center backdrop-blur-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">User Info</h2>
        <p className="text-gray-600 dark:text-gray-300">You must be logged in to view your profile.</p>
      </div>
    );
  }

  // Profile picture preview logic
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfilePic(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const updatedUser = await userApi.updateProfile({ name, phone, profilePic });
      setUser(updatedUser);
      localStorage.setItem(`bio_${user._id}`, bio);
      setBioLocal(bio);
      localStorage.setItem(`twitter_${user._id}`, twitter);
      localStorage.setItem(`linkedin_${user._id}`, linkedin);
      localStorage.setItem(`instagram_${user._id}`, instagram);
      setSuccess('Profile updated successfully!');
      toast.success('Profile updated!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      toast.error(err.message || 'Failed to update profile');
    }
  };

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  // Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    if (!currentPassword) {
      setError('Please enter your current password');
      toast.error('Please enter your current password');
      return;
    }
    try {
      await userApi.resetPassword(currentPassword, newPassword);
      setSuccess('Password reset successfully!');
      toast.success('Password reset!');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setResetMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
      toast.error(err.message || 'Failed to reset password');
    }
  };

  // Delete account (simulate)
  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    toast('Delete account feature coming soon!', { icon: '⚠️' });
  };

  // Account age
  const accountAge = user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Theme icon
  const themeIcon = theme === 'dark' ? <SunIcon className="w-6 h-6" /> : theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <ComputerDesktopIcon className="w-6 h-6" />;

  // Social links (dynamic)
  const socialLinks = [
    twitter && { name: 'Twitter', url: `https://twitter.com/${twitter.replace('@','')}`, icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195A4.92 4.92 0 0 0 16.616 3c-2.73 0-4.942 2.21-4.942 4.932 0 .386.045.762.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965c-.423.722-.666 1.561-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.237-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z" /></svg> },
    linkedin && { name: 'LinkedIn', url: linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin.replace('@','')}`, icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.966 0-1.75-.79-1.75-1.75s.784-1.75 1.75-1.75 1.75.79 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.76 1.37-1.56 2.82-1.56 3.01 0 3.57 1.98 3.57 4.56v5.64z" /></svg> },
    instagram && { name: 'Instagram', url: `https://instagram.com/${instagram.replace('@','')}`, icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.809 2.256 6.089 2.243 6.498 2.243 12c0 5.502.013 5.911.072 7.191.059 1.277.353 2.45 1.32 3.417.967.967 2.14 1.261 3.417 1.32C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.277-.059 2.45-.353 3.417-1.32.967-.967 1.261-2.14 1.32-3.417.059-1.28.072-1.689.072-7.191 0-5.502-.013-5.911-.072-7.191-.059-1.277-.353-2.45-1.32-3.417C19.398.425 18.225.131 16.948.072 15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg> },
  ].filter(Boolean);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-2">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {/* Glassmorphism Card */}
      <div className="w-full max-w-3xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col md:flex-row gap-10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 animate-fade-in">
        {/* Left: Profile Info & Stats */}
        <div className="flex flex-col items-center md:w-1/3 gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center overflow-hidden border-4 border-blue-200 dark:border-blue-700 shadow-xl">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-bold text-white">{(name ? name.charAt(0) : user.email.charAt(0)).toUpperCase()}</span>
              )}
            </div>
            <button
              className="absolute bottom-2 right-2 bg-white dark:bg-gray-900 rounded-full p-2 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-blue-800 transition"
              onClick={() => fileInputRef.current?.click()}
              title="Change profile picture"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" /></svg>
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleProfilePicChange}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="text-xl font-bold text-gray-900 dark:text-white">{name || user.email}</div>
            <div className="text-sm text-gray-500 dark:text-gray-300">{user.email}</div>
            <div className="flex gap-2 mt-2">
              {(socialLinks.filter(Boolean) as { name: string; url: string; icon: JSX.Element }[]).map(link => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition" title={link.name}>
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          {/* Stats */}
          <div className="w-full bg-white/60 dark:bg-gray-900/60 rounded-xl p-4 shadow flex flex-col gap-2 mt-4">
            <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Polls Created</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{pollStats.created}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Total Votes</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{pollStats.votes}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Account Age</span>
              <span className="font-bold text-green-600 dark:text-green-400">{accountAge} days</span>
            </div>
          </div>
          {/* Theme Toggle */}
          <button
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition-all"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {themeIcon}
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </button>
          {/* Delete Account */}
          <button
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:from-red-600 hover:to-pink-600 transition-all"
            onClick={() => setShowDeleteModal(true)}
            title="Delete account"
          >
            <TrashIcon className="w-5 h-5" /> Delete Account
          </button>
        </div>
        {/* Right: Editable Form */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[60px]"
                maxLength={200}
                placeholder="Tell us about yourself..."
              />
              <div className="text-xs text-gray-400 text-right">{bio.length}/200</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Twitter</label>
                <input
                  type="text"
                  value={twitter}
                  onChange={e => setTwitter(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="@yourhandle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={e => setLinkedin(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="your-linkedin-id"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instagram</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="@yourhandle"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all font-semibold">Save Changes</button>
          </form>
          {/* Password Reset */}
          <div className="mt-8">
            <button onClick={() => setResetMode(!resetMode)} className="text-blue-600 hover:underline font-medium mb-2">
              {resetMode ? 'Cancel' : 'Change Password'}
            </button>
            {resetMode && (
              <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                    />
                    <button type="button" className="absolute right-2 top-2" onClick={() => setShowPassword(v => !v)}>
                      {showPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                    />
                    <button type="button" className="absolute right-2 top-2" onClick={() => setShowNewPassword(v => !v)}>
                      {showNewPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                  {/* Password strength meter */}
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded mt-1">
                    <div
                      className={`h-2 rounded transition-all duration-300 ${getPasswordStrength(newPassword) === 0 ? 'w-0' : getPasswordStrength(newPassword) === 1 ? 'w-1/4 bg-red-500' : getPasswordStrength(newPassword) === 2 ? 'w-1/2 bg-yellow-500' : getPasswordStrength(newPassword) === 3 ? 'w-3/4 bg-blue-500' : 'w-full bg-green-500'}`}
                    ></div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                    />
                    <button type="button" className="absolute right-2 top-2" onClick={() => setShowConfirmPassword(v => !v)}>
                      {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold transition-all">Reset Password</button>
              </form>
            )}
          </div>
          {success && <div className="mt-4 text-green-600 font-medium">{success}</div>}
          {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}
        </div>
      </div>
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center animate-fade-in">
            <TrashIcon className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Delete Account?</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">This action cannot be undone. All your data will be lost.</p>
            <div className="flex gap-4 justify-center">
              <button
                className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition"
                onClick={handleDeleteAccount}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;