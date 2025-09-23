import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import baseurl from '../Baseurl/baseurl';
import logo from '../../assets/image.png';

const InputField = ({ label, placeholder, required = false, type = 'text', icon = null, value, onChange, className = '' }) => (
  <div className={`mb-4 group ${className}`}>
    <label className="block text-gray-800 text-sm font-semibold mb-2 transition-colors duration-200 group-focus-within:text-green-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 placeholder-gray-400 text-gray-700 hover:border-gray-300 focus:bg-white focus:shadow-sm"
      />
      {icon && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors duration-200">
          {icon}
        </div>
      )}
    </div>
  </div>
);

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('community');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      const loginEndpoint = role === 'community' 
        ? `${baseurl}/api/community_admin/login`
        : `${baseurl}/api/admin/login`;
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(role === 'community' ? { email, password } : { email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.message || 'Login failed');
      }

      // Persist token consistently as 'adminToken' for both roles
      const token = role === 'community' ? data.token : data.accessToken;
      if (!token) {
        throw new Error('No token received from server');
      }
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminRole', role);

      setSnackbar({
        open: true,
        message: data.msg || data.message || 'Login successful!',
        severity: 'success',
      });

      // Redirect to admin dashboard
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1000);
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const CompanyHeader = () => (
    <div className="text-center mb-8 animate-in fade-in duration-700">
      <div className="flex flex-col items-center space-y-4">
        {/* Company Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <img
            src={logo}
            alt="Logo"
            className="w-12 h-12 rounded-full"
          />
        </div>
        
        {/* Company Name */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Admin Login
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Secure Admin Access
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mt-2"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <CompanyHeader />
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 lg:p-12">
          <div className="max-w-md mx-auto animate-in slide-in-from-right duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Select your role and sign in to your admin account</p>
            </div>

            <div className="space-y-4">
              {/* Role Selection */}
              <div className="mb-6">
                <label className="block text-gray-800 text-sm font-semibold mb-3">
                  Select Admin Role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('community')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      role === 'community'
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-center">
                      <Shield className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <h3 className="font-semibold text-gray-800 mb-1">Community Admin</h3>
                      <p className="text-xs text-gray-500">Manage community content</p>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setRole('super')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      role === 'super'
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-center">
                      <Shield className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <h3 className="font-semibold text-gray-800 mb-1">Super Admin</h3>
                      <p className="text-xs text-gray-500">Full system access</p>
                    </div>
                  </button>
                </div>
              </div>

              <InputField 
                label="Email Address" 
                placeholder="Enter your email address" 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
              />

              <InputField 
                label="Password" 
                placeholder="Enter your password" 
                required 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={
                  <button
                    type="button"
                    onClick={handleTogglePassword}
                    className="text-gray-500 hover:text-green-500 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 mb-4 animate-in slide-in-from-top duration-300">
                  <p className="text-red-600 text-sm font-medium flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    {error}
                  </p>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  `Login as ${role === 'community' ? 'Community Admin' : 'Super Admin'}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-300">
          <div className={`px-6 py-4 rounded-xl shadow-lg ${
            snackbar.severity === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                snackbar.severity === 'success' ? 'bg-white' : 'bg-white'
              }`}></div>
              <span className="font-medium">{snackbar.message}</span>
              <button
                onClick={() => setSnackbar({ ...snackbar, open: false })}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoginPage;