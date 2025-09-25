import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import baseurl from '../Baseurl/baseurl';

const ReviewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [value, setValue] = useState(4);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [businessName, setBusinessName] = useState('');
  
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbar({ open: true, message: t('pleaseLogin'), severity: 'error' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
  }, [navigate, t]);

  // Get business name from localStorage or use a default
  useEffect(() => {
    // You can get business name from various sources:
    // 1. From localStorage if stored previously
    // 2. From URL parameters or state if passed
    // 3. Use a default name
    const businessData = localStorage.getItem('currentBusiness');
    if (businessData) {
      const business = JSON.parse(businessData);
      setBusinessName(business.company_name || 'Business');
    } else {
      setBusinessName('Business'); // Default fallback
    }
  }, [id]);

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbar({ open: true, message: t('pleaseLogin'), severity: 'error' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    try {
      // Enhanced validation
      if (!review.trim()) {
        setSnackbar({ open: true, message: t('reviewRequired'), severity: 'error' });
        return;
      }
      
      setLoading(true);
      
      // Get member data from localStorage
      const loggedInMember = JSON.parse(localStorage.getItem('memberData'));
      const memberId = loggedInMember?.mid; // Use logged-in user's ID
      
      if (!memberId) {
        throw new Error('Logged-in Member ID (mid) not found in localStorage');
      }
      
      if (!id) {
        throw new Error('Business ID not found in URL parameters');
      }
      
      // Create the payload according to your backend API
      const requestPayload = {
        member_id: parseInt(memberId), // Ensure it's a number
        business_id: parseInt(id), // Use the ID from URL parameters
        rating: parseInt(value),
        message: review.trim()
      };
      
      // Validate the payload
      if (isNaN(requestPayload.rating)) {
        throw new Error('Invalid rating value');
      }
      
      if (requestPayload.rating < 1 || requestPayload.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      
      if (isNaN(requestPayload.member_id)) {
        throw new Error('Invalid member ID');
      }
      
      if (isNaN(requestPayload.business_id)) {
        throw new Error('Invalid business ID');
      }
      
      console.log('Submitting rating with payload:', requestPayload);
      
      const response = await fetch(`${baseurl}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });
      
      console.log('Response Status:', response.status);
      
      // Parse response
      const data = await response.json();
      console.log('Response Data:', data);
      
      if (!response.ok) {
        // Handle specific backend errors
        if (response.status === 400) {
          throw new Error(data.error || 'Invalid request data');
        } else if (response.status === 404) {
          if (data.error?.includes('Member not found')) {
            throw new Error(`Member with ID ${requestPayload.member_id} not found. Please check member exists.`);
          } else if (data.error?.includes('Business not found')) {
            throw new Error(`Business with ID ${requestPayload.business_id} not found. Please check business profile.`);
          } else {
            throw new Error(data.error || 'Resource not found');
          }
        } else if (response.status === 500) {
          console.error('Server Error Details:', data);
          throw new Error(data.error || 'Server error occurred. Please try again later.');
        } else {
          throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      // Success handling
      if (data.message && data.data) {
        setSnackbar({ open: true, message: data.message || t('reviewSubmitted'), severity: 'success' });
        setTimeout(() => navigate(-1), 2000);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setSnackbar({ open: true, message: error.message || t('reviewSubmissionFailed'), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-20 lg:pb-0">
      <Header />

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12l7.5-7.5M3 12h18" />
            </svg>
            {t('back')}
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{t('ratingsReviews')}</h1>
          <div className="w-10" />
        </div>

        <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {businessName}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Business
              </p>
            </div>
            <div className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-100">
              {t('rating')}: {value}.0/5
            </div>
          </div>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div>
            <p className="text-sm font-medium text-gray-900">{t('rating')}</p>
            <div className="mt-2 flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue(star)}
                  className="group p-1 focus:outline-none"
                  aria-label={`Rate ${star}`}
                >
                  {star <= value ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-yellow-400 group-hover:text-yellow-500">
                      <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l1.443 3.474a1.25 1.25 0 001.046.773l3.74.324c1.164.101 1.636 1.553.75 2.317l-2.84 2.432a1.25 1.25 0 00-.403 1.314l.97 3.62c.301 1.125-.964 2.02-1.96 1.42l-3.22-1.932a1.25 1.25 0 00-1.28 0l-3.22 1.932c-.996.6-2.261-.295-1.96-1.42l.97-3.62a1.25 1.25 0 00-.403-1.314L3.81 10.098c-.886-.764-.414-2.216.75-2.317l3.74-.324a1.25 1.25 0 001.046-.773l1.443-3.474z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 text-gray-300 group-hover:text-yellow-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l1.348 3.245a2.25 2.25 0 001.88 1.385l3.517.295c.499.042.701.663.321.988l-2.665 2.28a2.25 2.25 0 00-.727 2.367l.91 3.396c.13.487-.418.87-.846.613l-3.02-1.812a2.25 2.25 0 00-2.268 0l-3.02 1.812c-.428.257-.976-.126-.846-.613l.91-3.396a2.25 2.25 0 00-.727-2.367l-2.665-2.28c-.38-.325-.178-.946.32-.988l3.518-.295a2.25 2.25 0 001.88-1.385l1.349-3.245z" />
                    </svg>
                  )}
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">{value}.0 {t('outOf5')}</span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-gray-900">{t('reviewThank')}</p>
            <textarea
              rows={5}
              maxLength={500}
              placeholder={t('reviewPlaceholder')}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none p-3 text-sm bg-white"
            />
            <div className="mt-1 text-right text-xs text-gray-500">{`${review.length}/500`}</div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !review.trim()}
            className={`mt-6 w-full inline-flex justify-center items-center rounded-full px-4 py-3 text-sm font-medium text-white transition ${
              loading || !review.trim()
                ? 'bg-green-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-700 to-green-400 hover:from-green-800 hover:to-green-500'
            }`}
          >
            {loading ? t('submitting') : t('submitReview')}
          </button>
        </section>
      </main>

      {snackbar.open && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center px-4 sm:px-0">
          <div
            className={`max-w-md w-full px-4 py-3 rounded-lg shadow-lg border text-sm flex items-start gap-3 ${
              snackbar.severity === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span className="mt-0.5">
              {snackbar.severity === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.94a.75.75 0 10-1.22-.88l-3.236 4.49-1.49-1.49a.75.75 0 10-1.06 1.06l2.1 2.1a.75.75 0 001.147-.089l3.76-5.191z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12V16.5zm9.114-4.364a9.75 9.75 0 11-18.228 0 9.75 9.75 0 0118.228 0z" />
                </svg>
              )}
            </span>
            <div className="flex-1 leading-5">{snackbar.message}</div>
            <button
              onClick={handleCloseSnackbar}
              className="text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}

      <Footer />
      <MobileFooter />
    </div>
  );
};

export default ReviewPage;