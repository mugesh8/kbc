import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
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

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get phone number from navigation state
  const phoneNumber = location.state?.phoneNumber;

  useEffect(() => {
    // Redirect to forgot password if no phone number
    if (!phoneNumber) {
      navigate('/forgot-password');
    }
  }, [phoneNumber, navigate]);

  const handleResetPassword = async () => {
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${baseurl}/api/member/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          contact_no: phoneNumber,
          newPassword: newPassword 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.msg || 'Failed to reset password');
      }

      setSnackbar({
        open: true,
        message: 'Password reset successfully!',
        severity: 'success',
      });

      // Redirect to login page after successful reset
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
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
            Reset Password
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Create a new password for your account
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mt-2"></div>
        </div>
      </div>
    </div>
  );

  if (!phoneNumber) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <CompanyHeader />
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 lg:p-12">
          <div className="max-w-md mx-auto animate-in slide-in-from-right duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600">Create a new password for your account</p>
            </div>

            <div className="space-y-4">
              <InputField 
                label="New Password" 
                placeholder="Enter new password" 
                required 
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-gray-500 hover:text-green-500 transition-colors duration-200"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />

              <InputField 
                label="Confirm Password" 
                placeholder="Confirm new password" 
                required 
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-500 hover:text-green-500 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />

              <div className="text-sm text-gray-600 mb-4">
                Password must be at least 8 characters long
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 mb-4 animate-in slide-in-from-top duration-300">
                  <p className="text-red-600 text-sm font-medium flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    {error}
                  </p>
                </div>
              )}

              <button
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>

              <div className="text-center my-8">
                <p className="text-gray-600">
                  Remember your password?{' '}
                  <Link
                    to="/"
                    className="text-green-500 hover:text-green-600 font-semibold underline transition-colors duration-200"
                  >
                    Back to Sign In
                  </Link>
                </p>
              </div>
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

export default ResetPasswordPage;
