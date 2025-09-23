import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Phone, Lock, User, X } from 'lucide-react';
import baseurl from '../Baseurl/baseurl';
import logo from '../../assets/image.png';

const InputField = React.memo(({ label, placeholder, required = false, type = 'text', icon = null, value, onChange, className = '' }) => (
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
));

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [approvalDialog, setApprovalDialog] = useState({ open: false, message: '' });

  const handleLogin = async () => {
    setError('');

    if (!identifier || !password) {
      setError(t('formErrors') || 'Email/Phone and password are required');
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const loginPayload = {
      password,
      ...(isEmail ? { email: identifier } : { contact_no: identifier }),
    };

    try {
      setIsLoading(true);
      const response = await fetch(`${baseurl}/api/member/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Check if it's an approval error
        if (result.msg && result.msg.includes('not approved')) {
          setApprovalDialog({
            open: true,
            message: "Your Profile is under review. For more information 730506436 (KBC Admin)."
          });
          return;
        }
        throw new Error(result?.msg || 'Login failed');
      }

      // Store token and member data
      localStorage.setItem('token', result.token);
      localStorage.setItem('memberData', JSON.stringify(result.data));

      setSnackbar({
        open: true,
        message: result.msg || 'Login successful!',
        severity: 'success',
      });

      // Call the success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess(result);
      }

      // Close modal and redirect
      setTimeout(() => {
        onClose();
        navigate('/home');
      }, 1500);

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

  const handleCloseApprovalDialog = () => {
    setApprovalDialog({ open: false, message: '' });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClose = () => {
    setError('');
    setIdentifier('');
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <img
                  src={logo}
                  alt="Logo"
                  className="w-8 h-8 rounded-full"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-sm text-gray-600">Sign in to your account</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            <div className="space-y-4">
              <InputField 
                label="Email or Contact Number" 
                placeholder="Enter your email or contact number" 
                required 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                icon={isEmail ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              />

              <InputField 
                label={t('password')} 
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

              <div className="text-right mb-4">
                <Link
                  to="/forgot-password"
                  onClick={handleClose}
                  className="text-green-500 hover:text-green-600 text-sm font-medium underline transition-colors duration-200"
                >
                  Forgot Password?
                </Link>
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
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  t('signin') || 'Sign In'
                )}
              </button>

              <div className="text-center my-6">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    onClick={handleClose}
                    className="text-green-500 hover:text-green-600 font-semibold underline transition-colors duration-200"
                  >
                    {t('signup') || 'Sign Up'}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-60 animate-in slide-in-from-bottom duration-300">
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

      {/* Approval Dialog */}
      {approvalDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl animate-in slide-in-from-bottom duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Account Approval Required</h3>
            <p className="text-gray-600 mb-6">{approvalDialog.message}</p>
            <div className="flex justify-end">
              <button
                onClick={handleCloseApprovalDialog}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginModal;

