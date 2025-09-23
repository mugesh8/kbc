import React from 'react';
import { LogIn } from 'lucide-react';
import LoginModal from './LoginModal';
import { useLoginModal } from '../../hooks/useLoginModal';

const LoginModalExample = () => {
  const { isLoginModalOpen, openLoginModal, closeLoginModal, handleLoginSuccess } = useLoginModal();

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Login Modal Example</h2>
      <p className="text-gray-600 mb-6">
        Click the button below to open the login modal. This modal can be used anywhere in your application.
      </p>
      
      <button
        onClick={openLoginModal}
        className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <LogIn className="w-5 h-5" />
        <span>Open Login Modal</span>
      </button>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default LoginModalExample;

