import { useState } from 'react';

export const useLoginModal = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLoginSuccess = (result) => {
    // You can add any additional logic here after successful login
    console.log('Login successful:', result);
  };

  return {
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    handleLoginSuccess
  };
};

