import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminSignup from './pages/AdminSignup';
import CreatePoll from './pages/CreatePoll';
import PollDetail from './pages/PollDetail';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import MyPolls from './pages/MyPolls';
import AboutMe from './pages/AboutMe';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const App: React.FC = () => {
  useEffect(() => {
    const grid = document.getElementById('parallax-grid');
    if (!grid) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
      const maxMove = 32; // px
      grid.style.transform = `translate3d(${-x * maxMove}px, ${-y * maxMove}px, 0)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Ensure persistent voterId for the whole app
  let voterId = localStorage.getItem('voterId');
  if (!voterId) {
    voterId = 'voter_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('voterId', voterId);
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-x-hidden">
        {/* Parallax grid overlay */}
        <div
          id="parallax-grid"
          className="pointer-events-none fixed inset-0 z-0"
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='20' height='20' fill='none'/%3E%3Cpath d='M0 0H20V20' stroke='%23b97bff' stroke-width='0.5'/%3E%3Cpath d='M0 20V0H20' stroke='%23b97bff' stroke-width='0.5'/%3E%3C/svg%3E")`,
            opacity: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 0.13 : 0.32,
            backgroundSize: '20px 20px',
            transition: 'transform 0.2s cubic-bezier(.4,2,.6,1)',
            willChange: 'transform',
            mixBlendMode: 'normal',
          }}
        />
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/poll/:id" element={<PollDetail />} />
            <Route
              path="/create"
              element={
                <PrivateRoute>
                  <CreatePoll />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/mypolls"
              element={
                <PrivateRoute>
                  <MyPolls />
                </PrivateRoute>
              }
            />
            <Route path="/about-me" element={<PrivateRoute><AboutMe /></PrivateRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App; 