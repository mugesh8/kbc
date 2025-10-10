import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, Phone, Globe, MapPin, Clock, Mail, Users, ChevronDown, Briefcase, Building2, User as UserIcon, Tag, X, Award, TrendingUp, Shield, Heart, Linkedin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import MobileFooter from './MobileFooter'; // Adjust the path as needed
import baseurl from '../../components/Baseurl/baseurl';

const BusinessListing = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [aboutExpanded, setAboutExpanded] = useState(true);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsError, setRatingsError] = useState('');
  const [ratingsReloadKey, setRatingsReloadKey] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isReviewPopupOpen, setIsReviewPopupOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const { id } = useParams();
  const isMounted = useRef(true);
  const currentId = useRef(null);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [memberDetails, setMemberDetails] = useState(null);
  const [branch, setBranch] = useState([]);
  const [memberDetailsLoading, setMemberDetailsLoading] = useState(false);

  // New state for collapsible sections and popup
  const [expandedSections, setExpandedSections] = useState({
    memberInfo: false,
    businessInfo: false,
    addressContact: false,
    familyInfo: false,
    businessImages: false,
    ratingsReviews: false,
    customerReviews: false
  });
  const [showImagePopup, setShowImagePopup] = useState(false);
  // Popup for gallery media (images/videos)
  const [showMediaPopup, setShowMediaPopup] = useState(false);
  const [mediaPopupData, setMediaPopupData] = useState({ url: '', isVideo: false, alt: '' });
  // Detect hero background brightness to set contrasting title color
  const [isHeroBgLight, setIsHeroBgLight] = useState(true);
  const titleContrastTextClass = isHeroBgLight ? 'text-gray-900' : 'text-white';

  // Analyze hero image brightness and set title color for contrast
  useEffect(() => {
    let cancelled = false;
    const resolveUrl = () => {
      try {
        const profileImg = businessProfile?.business_profile_image
          ? (businessProfile.business_profile_image.startsWith('https')
            ? businessProfile.business_profile_image
            : `${baseurl}/${businessProfile.business_profile_image}`)
          : '';
        const memberObj = memberDetails || businessProfile?.Member || {};
        const memberImg = memberObj?.profile_image
          ? (memberObj.profile_image.startsWith('https')
            ? memberObj.profile_image
            : `${baseurl}/${memberObj.profile_image}`)
          : '';
        const raw = businessProfile?.media_gallery || '';
        const items = Array.isArray(raw)
          ? raw
          : (typeof raw === 'string' ? raw.split(',').map(s => s && s.trim()).filter(Boolean) : []);
        const firstGallery = items.length > 0
          ? (items[0].startsWith('http') ? items[0] : `${baseurl}/${items[0]}`)
          : '';
        return profileImg || memberImg || firstGallery || '';
      } catch {
        return '';
      }
    };

    const analyze = (url) => {
      try {
        if (!url) {
          if (!cancelled) setIsHeroBgLight(false);
          return;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const width = (canvas.width = 16);
            const height = (canvas.height = 16);
            ctx.drawImage(img, 0, 0, width, height);
            const { data } = ctx.getImageData(0, 0, width, height);
            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < data.length; i += 4) {
              r += data[i];
              g += data[i + 1];
              b += data[i + 2];
              count++;
            }
            const avgR = r / count;
            const avgG = g / count;
            const avgB = b / count;
            const luminance = 0.2126 * avgR + 0.7152 * avgG + 0.0722 * avgB;
            if (!cancelled) setIsHeroBgLight(luminance > 186);
          } catch (e) {
            if (!cancelled) setIsHeroBgLight(true);
          }
        };
        img.onerror = () => {
          if (!cancelled) setIsHeroBgLight(true);
        };
      } catch (e) {
        if (!cancelled) setIsHeroBgLight(true);
      }
    };

    analyze(resolveUrl());
    return () => { cancelled = true; };
  }, [businessProfile, memberDetails]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch(`${baseurl}/api/category/all`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (isMounted.current && data.success) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        if (isMounted.current) {
          setCategories([]);
        }
      } finally {
        if (isMounted.current) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();
  }, []);

  const getCategoryName = (categoryId) => {
    if (!categoryId || categoriesLoading) return 'N/A';
    // If an ID-like value is provided, try numeric match first
    const numeric = parseInt(categoryId, 10);
    if (!isNaN(numeric)) {
      const byId = categories.find(cat => parseInt(cat.cid, 10) === numeric);
      if (byId) return byId.category_name;
    }
    // Otherwise try name match (case-insensitive)
    const valueStr = String(categoryId).trim().toLowerCase();
    const byName = categories.find(cat => String(cat.category_name).trim().toLowerCase() === valueStr);
    return byName ? byName.category_name : 'Not specified';
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  function convertToBranchObjects(data) {
    const parsed = {};

    // Parse each field safely
    for (const [key, value] of Object.entries(data)) {
      try {
        const arr = JSON.parse(value);
        parsed[key] = Array.isArray(arr) ? arr : [value];
      } catch {
        parsed[key] = [value];
      }
    }

    // Find the maximum array length
    const maxLength = Math.max(...Object.values(parsed).map(v => v.length));

    // Build array of branch objects
    const result = [];
    for (let i = 0; i < maxLength; i++) {
      const obj = {};
      for (const [key, arr] of Object.entries(parsed)) {
        obj[key] = arr[i] !== undefined ? arr[i] : arr[0] ?? null;
      }
      result.push(obj);
    }

    return result;
  }
  function getFirstItem(value) {
    try {
      const arr = JSON.parse(value);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    } catch {
      return null; // Return null if JSON is invalid or empty
    }
  }

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Skip if id is undefined or if it's the same as the last fetched id
    if (!id || (currentId.current !== null && currentId.current === id)) {
      return;
    }

    // Update the currentId ref
    currentId.current = id;

    const fetchBusinessProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching business profile for ID:", id);

        const apiUrl = `${baseurl}/api/business-profile/${id}`;
        console.log("Fetching from URL:", apiUrl);

        const response = await fetch(apiUrl, {
          credentials: 'include'
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch business profile: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API response data:", data);

        if (isMounted.current) {
          // Fixed: Check for the correct data structure - data.data is a single object, not an array
          if (data.data) {
            const businessdata = {
              company_address: data.data.company_address,
              city: data.data.city,
              state: data.data.state,
              zip_code: data.data.zip_code,
              branch_name: data.data.branch_name,
              email: data.data.email,
              business_work_contact: data.data.business_work_contract,
            }
            setBranch(convertToBranchObjects(businessdata));
            // Check if the ID matches
            if (parseInt(data.data.id) === parseInt(id)) {
              setBusinessProfile({
                ...data.data,
                company_address: getFirstItem(data.data.company_address),
                city: getFirstItem(data.data.city),
                state: getFirstItem(data.data.state),
                zip_code: getFirstItem(data.data.zip_code)
              });
              console.log("Found business profile:", data.data);
              // Fetch full member details to mirror profile page data
              const memberId = data.data.member_id || data.data.Member?.mid;
              if (memberId) {
                try {
                  setMemberDetailsLoading(true);
                  const resp = await fetch(`${baseurl}/api/member/${memberId}`, {
                    headers: {
                      ...(localStorage.getItem('token') ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {})
                    },
                    credentials: 'include'
                  });
                  if (resp.ok) {
                    const json = await resp.json();
                    if (json.success && json.data) {
                      setMemberDetails(json.data);
                    }
                  }
                } catch (e) {
                  console.warn('Could not fetch member details', e);
                } finally {
                  setMemberDetailsLoading(false);
                }
              }
            } else {
              console.error("Business profile ID mismatch");
              setError('Business profile ID mismatch');
            }
          } else {
            console.error("Unexpected API response structure:", data);
            setError('Invalid data format');
          }
        }
      } catch (err) {
        console.error("Error fetching business profile:", err);
        if (isMounted.current) {
          setError(err.message || 'Unable to load business profile');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchBusinessProfile();
  }, [id]);

  // Fetch all ratings and filter by business ID
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const fetchRatings = async () => {
      try {
        setRatingsError('');
        setRatingsLoading(true);
        console.log("Fetching all ratings to filter for business ID:", id);

        const ratingsUrl = `${baseurl}/api/ratings/all`;
        console.log("Fetching all ratings from URL:", ratingsUrl);

        const response = await fetch(ratingsUrl, {
          credentials: 'include',
          signal: controller.signal
        });

        console.log("Ratings response status:", response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch ratings: ${response.status} ${response.statusText}`);
        }

        const ratingsData = await response.json();
        console.log("All ratings API response data:", ratingsData);

        if (isMounted.current) {
          if (ratingsData && ratingsData.data && Array.isArray(ratingsData.data)) {
            // Filter ratings by business ID
            const businessRatings = ratingsData.data.filter(rating =>
              parseInt(rating.business_id) === parseInt(id)
            );
            console.log("Filtered ratings for business:", businessRatings);
            setRatings(businessRatings);
          } else {
            console.error("Unexpected ratings API response structure:", ratingsData);
            setRatings([]);
          }
        }
      } catch (err) {
        console.error("Error fetching ratings:", err);
        if (isMounted.current) {
          setRatings([]);
          setRatingsError(err?.name === 'AbortError' ? 'Request timed out. Please try again.' : (err.message || 'Unable to load reviews'));
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted.current) {
          setRatingsLoading(false);
        }
      }
    };

    fetchRatings();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [id, ratingsReloadKey]);

  // Calculate average rating
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
    : 0;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = ratings.filter(r => r.rating === rating).length;
    const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
    return { rating, count, percentage };
  });

  const StarRating = ({ rating, size = "w-4 h-4" }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${size} ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  // Image Popup Component
  const ImagePopup = ({ imageUrl, altText, onClose }) => {
    if (!imageUrl) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="relative max-w-5xl max-h-full">
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-2xl hover:bg-gray-100 z-10 transition-all duration-200 hover:scale-110"
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    );
  };

  // Media Popup (image or video)
  const MediaPopup = ({ url, isVideo, altText, onClose }) => {
    if (!url) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="relative max-w-5xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-2xl hover:bg-gray-100 z-10 transition-all duration-200 hover:scale-110"
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>
          <div className="w-full max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
            {isVideo ? (
              <video
                src={url}
                controls
                autoPlay
                className="w-full h-full max-h-[80vh] object-contain bg-black"
              />
            ) : (
              <img
                src={url}
                alt={altText}
                className="w-full h-full max-h-[80vh] object-contain bg-black"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Review Popup Component
  const ReviewPopup = ({ review, onClose }) => {
    if (!review) return null;

    // Extract reviewer information - adjust based on your API response structure
    const reviewerName = review.ratedBy
      ? `${review.ratedBy.first_name || ''} ${review.ratedBy.last_name || ''}`.trim()
      : review.member_name || 'Anonymous';

    const reviewerInitials = reviewerName !== 'Anonymous'
      ? reviewerName.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
      : 'AN';

    const avatarUrl = review.ratedBy?.profile_image
      ? (review.ratedBy.profile_image.startsWith('https')
        ? review.ratedBy.profile_image
        : `${baseurl}/${review.ratedBy.profile_image}`)
      : review.member_profile_image
        ? (review.member_profile_image.startsWith('https')
          ? review.member_profile_image
          : `${baseurl}/${review.member_profile_image}`)
        : '';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-green-500/90 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={reviewerName} className="w-14 h-14 object-cover rounded-full" />
              ) : (
                reviewerInitials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-800 truncate">{reviewerName}</div>
                <div className="text-sm text-gray-500">{formatRelativeTime(review.createdAt)}</div>
              </div>
              <div className="mt-1">
                <StarRating rating={review.rating} size="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="mt-4 text-gray-800 whitespace-pre-wrap break-words">
            {review.message || review.review_text || 'No review message provided.'}
          </div>
          <div className="mt-6 text-right">
            <button onClick={onClose} className="px-5 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700">Close</button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Collapsible Card Component
  const CollapsibleCard = ({ title, isExpanded, onToggle, icon: Icon, children, defaultExpanded = false, gradient = false }) => {
    useEffect(() => {
      if (defaultExpanded && !isExpanded) {
        onToggle();
      }
    }, []);

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" style={{ overflowAnchor: 'none' }}>
        <button
          onClick={onToggle}
          className={`w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between transition-all duration-300 ${gradient ? 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100' : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50'
            }`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {Icon && (
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            )}
            <h3 className="font-bold text-lg sm:text-xl text-gray-800">{title}</h3>
          </div>
          <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-green-100 rotate-180' : 'bg-gray-100'}`}>
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </div>
        </button>
        {isExpanded && (
          <div className="border-t border-gray-100" style={{ overflowAnchor: 'none' }}>
            <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Debugging information
  console.log("Current state:", { loading, error, businessProfile, id, ratings, averageRating });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-emerald-400 animate-pulse mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">Loading business profile...</p>
          <p className="mt-2 text-sm text-gray-500">ID: {id || 'Not available'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!businessProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
          <div className="text-gray-400 text-6xl mb-6">🏢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Business Profile Not Found</h2>
          <p className="text-gray-600 mb-2">The requested business profile could not be found.</p>
          <p className="text-sm text-gray-500">ID: {id}</p>
        </div>
      </div>
    );
  }

  // Extract member information from the business profile
  const member = businessProfile.Member;
  const memberName = member ? `${member.first_name || ''} ${member.last_name || ''}`.trim() : 'Unknown Member';
  const memberFamily = member?.MemberFamily || null;
  const resolvedMember = memberDetails || member || {};
  const resolvedFamily = resolvedMember?.MemberFamily || memberFamily || null;

  // Get profile image URL
  const profileImageUrl = businessProfile?.business_profile_image
    ? businessProfile.business_profile_image.startsWith('https')
      ? businessProfile.business_profile_image
      : `${baseurl}/${businessProfile.business_profile_image}`
    : '';

  // Get member profile image URL
  const memberProfileImageUrl = resolvedMember?.profile_image
    ? resolvedMember.profile_image.startsWith('https')
      ? resolvedMember.profile_image
      : `${baseurl}/${resolvedMember.profile_image}`
    : '';

  // Build media gallery URLs (supports comma-separated string or array)
  const rawMedia = businessProfile?.media_gallery || '';
  const mediaItems = Array.isArray(rawMedia)
    ? rawMedia
    : typeof rawMedia === 'string'
      ? rawMedia.split(',').map(s => s && s.trim()).filter(Boolean)
      : [];
  const mediaUrls = mediaItems.map(item => {
    const normalized = item.startsWith('http') ? item : `${baseurl}/${item}`;
    return normalized;
  });
  const heroBackgroundUrl = mediaUrls.length > 0 ? mediaUrls[0] : '';

  // Get social media links
  const socialLinks = {
    website: businessProfile?.website || '',
    facebook: businessProfile?.facebook_link || '',
    instagram: businessProfile?.instagram_link || '',
    linkedin: businessProfile?.linkedin_link || '',
    google: businessProfile?.google_link || ''
  };

  // Resolve hero image URL with multiple fallbacks
  const heroImageUrl = profileImageUrl
    ? profileImageUrl
    : (memberProfileImageUrl
      ? memberProfileImageUrl
      : (heroBackgroundUrl || '/fallback.png'));

  // Helper: Build Google Maps URL for an address string
  const buildMapsUrl = (addressString) => {
    if (!addressString) return '#';
    const query = encodeURIComponent(addressString.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // Helper: Build tel: URL from a phone-like value
  const buildTelHref = (value) => {
    if (!value) return '#';
    const cleaned = String(value).replace(/[^\d+]/g, '');
    return `tel:${cleaned}`;
  };

  // Compose full business address for mapping
  const getBusinessFullAddress = () => {
    const parts = [
      businessProfile?.company_address || '',
      businessProfile?.city || '',
      businessProfile?.state || '',
      businessProfile?.zip_code || ''
    ].filter(Boolean);
    if (parts.length === 0 && businessProfile?.location) return businessProfile.location;
    return parts.join(', ');
  };

  // Helper: format children names from JSON or comma separated string
  const formatChildrenNames = (value) => {
    if (!value) return '';
    try {
      if (Array.isArray(value)) {
        return value.filter(Boolean).join(', ');
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || trimmed.startsWith('{')) {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.filter(Boolean).join(', ');
          }
        }
        return trimmed
          .replace(/^[\[\"]+|[\]\"]+$/g, '')
          .split(',')
          .map((s) => s.replace(/^[\"\s]+|[\"\s]+$/g, ''))
          .filter(Boolean)
          .join(', ');
      }
      return String(value);
    } catch (e) {
      return String(value)
        .replace(/[\[\]"]+/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .join(', ');
    }
  };

  // Helper: relative time for review timestamps
  const formatRelativeTime = (dateValue) => {
    try {
      const date = new Date(dateValue);
      const diffMs = Date.now() - date.getTime();
      const minutes = Math.floor(diffMs / 60000);
      if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
      const weeks = Math.floor(days / 7);
      if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
      const months = Math.floor(days / 30);
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    } catch {
      return new Date(dateValue).toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      <Header />

      {/* Image Popup */}
      {showImagePopup && (
        <ImagePopup
          imageUrl={memberProfileImageUrl}
          altText={memberName}
          onClose={() => setShowImagePopup(false)}
        />
      )}

      {/* Enhanced Hero Section */}
      <div className="w-full relative overflow-hidden">
        <div className="relative">
          <div className="h-80 lg:h-96 relative">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10 z-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full animate-pulse delay-700"></div>
            </div>

            {/* Background image */}
            {heroImageUrl && (
              <img
                src={heroImageUrl}
                alt="Business banner"
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            )}

            <div className="absolute inset-x-0 bottom-0 px-4 sm:px-6 pb-6 sm:pb-8 z-20">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                  {/* Enhanced Profile Image */}
                  <div className="relative flex-shrink-0">
                    <div className="relative">
                      <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-3xl p-1 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                        <div
                          className="w-full h-full rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center"
                          onClick={() => memberProfileImageUrl && setShowImagePopup(true)}
                        >
                          {memberProfileImageUrl ? (
                            <img
                              src={memberProfileImageUrl}
                              alt={memberName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-12 h-12 text-green-600" />
                          )}
                        </div>
                      </div>
                      {/* Status indicator */}
                      {memberProfileImageUrl && (
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Title Section */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="mb-4">
                      <h1 className={`text-4xl md:text-5xl font-bold mb-3 drop-shadow-2xl ${isHeroBgLight ? 'text-gray-900' : 'text-white mix-blend-difference'}`}>
                        {businessProfile.company_name}
                      </h1>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span className={`px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full ${titleContrastTextClass} font-semibold text-sm border border-white/30`}>
                          {businessProfile.business_type || 'Business'}
                        </span>
                        <span className={`px-4 py-2 bg-green-400/30 backdrop-blur-sm rounded-full ${titleContrastTextClass} font-medium text-sm border border-green-300/50`}>
                          {memberName}
                        </span>
                        <span className={`px-4 py-2 bg-amber-400/30 backdrop-blur-sm rounded-full ${titleContrastTextClass} font-medium text-sm border border-amber-300/50 flex items-center gap-2`}>
                          <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                          {averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons removed as requested */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Contact Info Strip */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl">
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-md">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm sm:text-base">Address</p>
                <a
                  href={buildMapsUrl(getBusinessFullAddress())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-green-700 hover:text-green-800 underline-offset-2 hover:underline"
                >
                  {(businessProfile.company_address || businessProfile.location || 'Address not available')}
                  {businessProfile.city && `, ${businessProfile.city}`}
                  {businessProfile.state && `, ${businessProfile.state}`}
                  {businessProfile.zip_code && ` ${businessProfile.zip_code}`}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm sm:text-base">Phone</p>
                {member?.contact_no ? (
                  <a
                    href={buildTelHref(member.contact_no)}
                    className="text-xs sm:text-sm text-green-700 hover:text-green-800 underline-offset-2 hover:underline"
                  >
                    {member.contact_no}
                  </a>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-600">Phone not available</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm sm:text-base">Website</p>
                {socialLinks.website ? (
                  <a
                    href={socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-green-700 hover:text-green-800 underline-offset-2 hover:underline break-all"
                  >
                    {socialLinks.website}
                  </a>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-600">Website not available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8" style={{ overflowAnchor: 'none' }}>

        {/* About This Business Card - hidden for salary type */}
        {((businessProfile?.business_type || '').toLowerCase() !== 'salary') && (
          <CollapsibleCard
            title="About This Business"
            isExpanded={aboutExpanded}
            onToggle={() => setAboutExpanded(prev => !prev)}
            icon={Building2}
            gradient={true}
          >
            <div className="prose prose-gray max-w-none text-left">
              <p className="text-gray-700 text-sm sm:text-base leading-7 sm:leading-8 break-words whitespace-pre-wrap md:max-w-3xl lg:max-w-4xl mx-auto">
                {businessProfile.about || `${businessProfile.company_name} is a ${businessProfile.business_type || 'business'} established in ${businessProfile.business_starting_year || 'recently'}.`}
              </p>
              {businessProfile.tags && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {businessProfile.tags.split(',').map((tag, index) => (
                    <span key={index} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-xl text-xs sm:text-sm font-medium hover:from-green-200 hover:to-emerald-200 transition-all duration-200">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleCard>
        )}

        {/* Member Information Card */}
        <CollapsibleCard
          title="Member Information"
          isExpanded={expandedSections.memberInfo}
          onToggle={() => toggleSection('memberInfo')}
          icon={UserIcon}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-green-800 border-b pb-2 text-left">Basic Information</h4>
              <div className="flex items-center gap-3">
                <UserIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Full Name</span>
                  <p className="text-gray-600">{memberName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Email Address</span>
                  <p className="text-gray-600">{resolvedMember?.email || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Contact Number</span>
                  {resolvedMember?.contact_no ? (
                    <a href={buildTelHref(resolvedMember.contact_no)} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">{resolvedMember.contact_no}</a>
                  ) : (
                    <p className="text-gray-600">Not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Date of Birth</span>
                  <p className="text-gray-600">{resolvedMember?.dob || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Gender</span>
                  <p className="text-gray-600">{resolvedMember?.gender || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Arakattalai</span>
                  <p className="text-gray-600">{resolvedMember?.Arakattalai || 'No'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">BNI</span>
                  <p className="text-gray-600">{resolvedMember?.BNI || 'No'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">KBN Member</span>
                  <p className="text-gray-600">{resolvedMember?.KBN_Member || 'No'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">KNS Member</span>
                  <p className="text-gray-600">{resolvedMember?.KNS_Member || 'No'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Lions</span>
                  <p className="text-gray-600">{resolvedMember?.Lions || 'No'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Rotary</span>
                  <p className="text-gray-600">{resolvedMember?.Rotary || 'No'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Other Forum</span>
                  <p className="text-gray-600">{resolvedMember?.Other_forum || 'No'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Pro</span>
                  <p className="text-gray-600">{resolvedMember?.pro || 'Unpro'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Marital Status</span>
                  <p className="text-gray-600">{resolvedMember?.marital_status || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Blood Group</span>
                  <p className="text-gray-600">{resolvedMember?.blood_group || 'Not available'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-green-800 border-b pb-2 text-left">Contact Information</h4>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Alternative Contact</span>
                  {resolvedMember?.alternate_contact_no ? (
                    <a href={buildTelHref(resolvedMember.alternate_contact_no)} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">{resolvedMember.alternate_contact_no}</a>
                  ) : (
                    <p className="text-gray-600">Not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Secondary Email</span>
                  <p className="text-gray-600">{resolvedMember?.secondary_email || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Best Time to Contact</span>
                  <p className="text-gray-600">{resolvedMember?.best_time_to_contact || 'Not available'}</p>
                </div>
              </div>
            </div>

            {/* Emergency & Cultural Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-green-800 border-b pb-2 text-left">Emergency & Cultural</h4>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Emergency Contact Name</span>
                  <p className="text-gray-600">{resolvedMember?.emergency_contact || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Emergency Phone</span>
                  {resolvedMember?.emergency_phone ? (
                    <a href={buildTelHref(resolvedMember.emergency_phone)} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">{resolvedMember.emergency_phone}</a>
                  ) : (
                    <p className="text-gray-600">Not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Aadhaar Number</span>
                  <p className="text-gray-600">{resolvedMember?.aadhar_no || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Kootam</span>
                  <p className="text-gray-600">{resolvedMember?.kootam || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Kovil</span>
                  <p className="text-gray-600">{resolvedMember?.kovil || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Access Level</span>
                  <p className="text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${resolvedMember?.access_level?.toLowerCase() === 'admin' ? 'bg-red-100 text-red-800' :
                      resolvedMember?.access_level?.toLowerCase() === 'premium' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                      {resolvedMember?.access_level || 'Basic'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Status</span>
                  <p className="text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${resolvedMember?.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' :
                      resolvedMember?.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        resolvedMember?.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {resolvedMember?.status || 'Unknown'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-green-800 mb-4 text-left">Address Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Street Address</span>
                  {resolvedMember?.address ? (
                    <a
                      href={buildMapsUrl(`${resolvedMember?.address || ''}, ${resolvedMember?.city || ''}, ${resolvedMember?.state || ''} ${resolvedMember?.zip_code || ''}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline"
                    >
                      {resolvedMember.address}
                    </a>
                  ) : (
                    <p className="text-gray-600">Not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">City</span>
                  {resolvedMember?.city ? (
                    <a
                      href={buildMapsUrl(`${resolvedMember?.city || ''}, ${resolvedMember?.state || ''} ${resolvedMember?.zip_code || ''}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline"
                    >
                      {resolvedMember.city}
                    </a>
                  ) : (
                    <p className="text-gray-600">Not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">State</span>
                  <p className="text-gray-600">{resolvedMember?.state || 'Not available'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Pin Code</span>
                  <p className="text-gray-600">{resolvedMember?.zip_code || 'Not available'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-green-800 mb-4 text-left">Social Media & Online Presence</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Personal Website</span>
                  {resolvedMember?.personal_website ? (
                    <a
                      href={resolvedMember.personal_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:text-green-800 underline underline-offset-2 break-all"
                    >
                      {resolvedMember.personal_website}
                    </a>
                  ) : (
                    <p className="text-gray-600">Not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Linkedin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">LinkedIn Profile</span>
                  {resolvedMember?.linkedin_profile ? (
                    <a
                      href={resolvedMember.linkedin_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:text-green-800 underline underline-offset-2 break-all"
                    >
                      {resolvedMember.linkedin_profile}
                    </a>
                  ) : (
                    <p className="text-gray-600">Not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Facebook className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Facebook</span>
                  {resolvedMember?.facebook ? (
                    <a
                      href={resolvedMember.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:text-green-800 underline underline-offset-2 break-all"
                    >
                      {resolvedMember.facebook}
                    </a>
                  ) : (
                    <p className="text-gray-600">Not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Instagram className="w-4 h-4 text-pink-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Instagram</span>
                  {resolvedMember?.instagram ? (
                    <a
                      href={resolvedMember.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:text-green-800 underline underline-offset-2 break-all"
                    >
                      {resolvedMember.instagram}
                    </a>
                  ) : (
                    <p className="text-gray-600">Not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Twitter className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">Twitter</span>
                  {resolvedMember?.twitter ? (
                    <a
                      href={resolvedMember.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:text-green-800 underline underline-offset-2 break-all"
                    >
                      {resolvedMember.twitter}
                    </a>
                  ) : (
                    <p className="text-gray-600">Not available</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Youtube className="w-4 h-4 text-red-600 flex-shrink-0" />
                <div className="text-left">
                  <span className="font-semibold text-gray-800 block">YouTube</span>
                  {resolvedMember?.youtube ? (
                    <a
                      href={resolvedMember.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:text-green-800 underline underline-offset-2 break-all"
                    >
                      {resolvedMember.youtube}
                    </a>
                  ) : (
                    <p className="text-gray-600">Not available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Referral Information (only show if exists) */}
          {resolvedMember?.Referral && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-green-800 mb-4 text-left">Referral Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Referral Name</span>
                    <p className="text-gray-600">{resolvedMember.Referral.referral_name || 'Not available'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Referral Code</span>
                    <p className="text-gray-600">{resolvedMember.Referral.referral_code || 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CollapsibleCard>

        {/* Business Information Card */}
        <CollapsibleCard
          title="Business Information"
          isExpanded={expandedSections.businessInfo}
          onToggle={() => toggleSection('businessInfo')}
          icon={Briefcase}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-2xl border border-blue-100 text-left">
                <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-green-600" />
                  Company Details
                </h4>
                <div className="space-y-4 text-sm text-left">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">Company Name</span>
                      <p className="text-gray-700">{businessProfile.company_name || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">Business Type</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                        {businessProfile.business_type || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">Registration Type</span>
                      <p className="text-gray-700">{businessProfile.business_registration_type || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">Experience</span>
                      <p className="text-gray-700">{businessProfile.experience || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">Staff Size</span>
                      <p className="text-gray-700">{businessProfile.staff_size || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Tag className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">Category</span>
                      <p className="text-gray-700">{getCategoryName(businessProfile.category_id || businessProfile.category || businessProfile.category_name)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="p-6 bg-white rounded-2xl border border-green-100 text-left">
                <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Location & Contact
                </h4>
                <div className="space-y-4 text-sm text-left">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">Business Email</span>
                      <p className="text-gray-700">{businessProfile.email || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">Work Contract</span>
                      <p className="text-gray-700">{businessProfile.business_work_contract || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">Business Address</span>
                      {(businessProfile.company_address || businessProfile.location) ? (
                        <a
                          href={buildMapsUrl(getBusinessFullAddress())}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline"
                        >
                          {businessProfile.company_address || businessProfile.location}
                        </a>
                      ) : (
                        <p className="text-gray-700">Not specified</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">City</span>
                      <p className="text-gray-700">{businessProfile.city || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">State</span>
                      <p className="text-gray-700">{businessProfile.state || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Tag className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">Pin Code</span>
                      <p className="text-gray-700">{businessProfile.zip_code || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">Location</span>
                      <p className="text-gray-700">{businessProfile.location || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div> */}

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-2xl border border-purple-100 text-left">
                <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  Online Presence
                </h4>
                <div className="space-y-3 text-sm text-left">
                  {businessProfile.website && (
                    <a href={businessProfile.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors group">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <span className="text-purple-700 underline underline-offset-2 break-all">{businessProfile.website}</span>
                    </a>
                  )}
                  {businessProfile.google_link && (
                    <a href={businessProfile.google_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors group">
                      <Globe className="w-5 h-5 text-red-500" />
                      <span className="text-red-600 underline underline-offset-2 break-all">{businessProfile.google_link}</span>
                    </a>
                  )}
                  {businessProfile.facebook_link && (
                    <a href={businessProfile.facebook_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors group">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-700 underline underline-offset-2 break-all">{businessProfile.facebook_link}</span>
                    </a>
                  )}
                  {businessProfile.instagram_link && (
                    <a href={businessProfile.instagram_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors group">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <span className="text-pink-600 underline underline-offset-2 break-all">{businessProfile.instagram_link}</span>
                    </a>
                  )}
                  {businessProfile.linkedin_link && (
                    <a href={businessProfile.linkedin_link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-gray-50 transition-colors group">
                      <Linkedin className="w-5 h-5 text-blue-700" />
                      <span className="text-blue-800 underline underline-offset-2 break-all">{businessProfile.linkedin_link}</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-amber-100 text-left">
                <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  Professional Details
                </h4>
                <div className="space-y-4 text-sm">
                  {businessProfile.business_type === 'salary' ? (
                    <>
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-gray-800 block mb-1">Designation</span>
                          <p className="text-gray-700">{businessProfile.designation || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-gray-800 block mb-1">Salary</span>
                          <p className="text-gray-700">{businessProfile.salary || 'Not specified'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-gray-800 block mb-1">Source</span>
                          <p className="text-gray-700">{businessProfile.source || 'Not specified'}</p>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex items-start gap-3">
                    <Tag className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800 block mb-1">Tags</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {businessProfile.tags ? businessProfile.tags.split(',').map((tag, index) => (
                          <span key={index} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-medium hover:bg-amber-200 transition-colors cursor-pointer">
                            #{tag.trim()}
                          </span>
                        )) : (
                          <span className="text-gray-600 text-xs">Not specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mt-8">
            <div className='space-y-12 text-sm'>
              <div className="p-6 bg-white rounded-2xl border border-green-100 text-left">
                <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Location & Contact
                </h4>

                {branch.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {branch.map((branch, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-green-50 bg-green-50/30 shadow-sm"
                      >
                        <h5 className="font-semibold text-green-700 mb-2">
                          {branch.branch_name || `Branch ${index + 1}`}
                        </h5>

                        <div className="space-y-3 text-sm text-left">
                          {/* Email */}
                          <div className="flex items-start gap-3">
                            <Mail className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-gray-800 block mb-1">
                                Work Contact
                              </span>
                              <p className="text-gray-700">
                                {branch.business_work_contact || "Not specified"}
                              </p>
                            </div>
                          </div>

                          {/* Address */}
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-gray-800 block mb-1">
                                Address
                              </span>
                              {branch.company_address ? (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.company_address)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline"
                                >
                                  {branch.company_address}
                                </a>
                              ) : (
                                <p className="text-gray-700">Not specified</p>
                              )}
                            </div>
                          </div>

                          {/* City */}
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-gray-800 block mb-1">
                                City
                              </span>
                              <p className="text-gray-700">{branch.city || "Not specified"}</p>
                            </div>
                          </div>

                          {/* State */}
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-gray-800 block mb-1">
                                State
                              </span>
                              <p className="text-gray-700">{branch.state || "Not specified"}</p>
                            </div>
                          </div>

                          {/* Zipcode */}
                          <div className="flex items-start gap-3">
                            <Tag className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-semibold text-gray-800 block mb-1">
                                Pincode
                              </span>
                              <p className="text-gray-700">{branch.zip_code || "Not specified"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 text-sm">No branches available.</p>
                )}
              </div>
          </div>
</div>
          
        </CollapsibleCard>

        {/* Business Images Card */}
        {(profileImageUrl || mediaUrls.length > 0) && (
          <CollapsibleCard
            title="Business Gallery"
            isExpanded={expandedSections.businessImages}
            onToggle={() => toggleSection('businessImages')}
            icon={Building2}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Removed business profile image tile as requested */}
              {mediaUrls.map((url, idx) => {
                const isVideo = /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv|m4v|3gp)(\?|$)/i.test(url);
                return (
                  <div
                    key={idx}
                    className="group relative aspect-video bg-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                    onClick={() => {
                      setMediaPopupData({ url, isVideo, alt: `Business Media ${idx + 1}` });
                      setShowMediaPopup(true);
                    }}
                  >
                    {isVideo ? (
                      <video src={url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img
                        src={url}
                        alt={`Business Media ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-semibold">{isVideo ? 'Video' : `Image ${idx + 1}`}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleCard>
        )}

        {/* Family Information Card */}
        {resolvedFamily && (
          <CollapsibleCard
            title="Family Information"
            isExpanded={expandedSections.familyInfo}
            onToggle={() => toggleSection('familyInfo')}
            icon={Users}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-800 border-b pb-2 text-left">Parents Information</h4>
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Father Name</span>
                    <p className="text-gray-600">{resolvedFamily?.father_name || 'Not available'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Father Contact</span>
                    {resolvedFamily?.father_contact ? (
                      <a href={buildTelHref(resolvedFamily.father_contact)} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">{resolvedFamily.father_contact}</a>
                    ) : (
                      <p className="text-gray-600">Not available</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Mother Name</span>
                    <p className="text-gray-600">{resolvedFamily?.mother_name || 'Not available'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Mother Contact</span>
                    {resolvedFamily?.mother_contact ? (
                      <a href={buildTelHref(resolvedFamily.mother_contact)} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">{resolvedFamily.mother_contact}</a>
                    ) : (
                      <p className="text-gray-600">Not available</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-green-800 border-b pb-2 text-left">Spouse Information</h4>
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Spouse Name</span>
                    <p className="text-gray-600">{resolvedFamily?.spouse_name || 'Not available'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Spouse Contact</span>
                    {resolvedFamily?.spouse_contact ? (
                      <a href={buildTelHref(resolvedFamily.spouse_contact)} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">{resolvedFamily.spouse_contact}</a>
                    ) : (
                      <p className="text-gray-600">Not available</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Anniversary Date</span>
                    <p className="text-gray-600">{resolvedFamily?.anniversary_date || 'Not available'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-green-800 border-b pb-2 text-left">Children Information</h4>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Number of Children</span>
                    <p className="text-gray-600">{resolvedFamily?.number_of_children || 'Not available'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Children Names</span>
                    <p className="text-gray-600">{formatChildrenNames(resolvedFamily?.children_names) || 'Not available'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Emergency Contact</span>
                    <p className="text-gray-600">{resolvedFamily?.emergency_contact || 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-green-800 mb-4 text-left">Family Address</h4>
              <div className="text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <span className="font-semibold text-gray-800 block">Family Address</span>
                    <p className="text-gray-600">{resolvedFamily?.address || 'Not available'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleCard>
        )}

        {/* Ratings & Reviews (static section) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="w-full px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-800">Ratings & Reviews</h3>
            </div>
          </div>
          <div className="border-t border-gray-100">
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                    <div className="text-5xl font-bold text-amber-600 mb-3">
                      {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                    </div>
                    <StarRating rating={Math.round(averageRating)} size="w-6 h-6" />
                    <p className="text-base font-semibold text-gray-800 mt-2">Based on {ratings.length} reviews</p>
                    <p className="text-xs text-gray-600 mt-1">Last updated 2 days ago</p>
                  </div>
                  <div className="space-y-3">
                    {ratingDistribution.map(({ rating, count, percentage }) => (
                      <div key={rating} className="flex items-center gap-4 p-2.5 bg-white rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium w-3 text-right">{rating}</span>
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-orange-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-8 text-right">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center space-y-4 p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-amber-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <Star className="w-8 h-8 text-white fill-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl text-gray-800">Referral Points: {member?.reward_points || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews (static section) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="w-full px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-gray-800">{`Customer Reviews (${ratings.length})`}</h3>
            </div>
          </div>
          <div className="border-t border-gray-100">
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
              {ratingsLoading ? (
                <div className="text-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                    <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-r-emerald-400 animate-pulse mx-auto"></div>
                  </div>
                  <p className="mt-6 text-gray-600 font-semibold">Loading reviews...</p>
                </div>
              ) : ratingsError ? (
                <div className="text-center py-12">
                  <p className="text-red-600 font-medium mb-4">{ratingsError}</p>
                  <button
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-all duration-200"
                    onClick={() => setRatingsReloadKey((k) => k + 1)}
                  >
                    Retry
                  </button>
                </div>
              ) : ratings.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Star className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">No reviews yet</h3>
                  <p className="text-gray-600 mb-6">Be the first to review this business!</p>
                  <button
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                    onClick={() => navigate(`/review/${businessProfile.id}`)}
                  >
                    Write a Review
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                    {(showAllReviews ? ratings : ratings.slice(0, 3)).map((review, index) => {
                      const reviewerName = review.ratedBy
                        ? `${review.ratedBy.first_name || ''} ${review.ratedBy.last_name || ''}`.trim()
                        : review.member_name || 'Anonymous';

                      const reviewerInitials = reviewerName !== 'Anonymous'
                        ? reviewerName.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
                        : 'AN';

                      const avatarUrl = review.ratedBy?.profile_image
                        ? (review.ratedBy.profile_image.startsWith('https')
                          ? review.ratedBy.profile_image
                          : `${baseurl}/${review.ratedBy.profile_image}`)
                        : review.member_profile_image
                          ? (review.member_profile_image.startsWith('https')
                            ? review.member_profile_image
                            : `${baseurl}/${review.member_profile_image}`)
                          : '';

                      return (
                        <div key={review.rid || index} className="p-4 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm h-48 sm:h-56 flex flex-col text-left">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500/90 text-white flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0 overflow-hidden">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={reviewerName}
                                  className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-full"
                                />
                              ) : (
                                reviewerInitials
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-semibold text-gray-800 truncate text-sm sm:text-base">{reviewerName}</div>
                                <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{formatRelativeTime(review.createdAt)}</div>
                              </div>
                              <div className="mt-1 flex items-center gap-1 text-amber-500">
                                <StarRating rating={review.rating} size="w-4 h-4" />
                              </div>
                              <div className="relative mt-2 sm:mt-3 text-gray-700 leading-relaxed break-words text-sm sm:text-base">
                                <div className="max-h-16 overflow-hidden whitespace-pre-wrap">{review.message || review.review_text || 'No review message provided.'}</div>
                                {(String(review.message || review.review_text || '').length > 120) && (
                                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="mt-auto pt-2 sm:pt-3 text-right">
                            <button
                              className="text-xs sm:text-sm font-semibold text-green-700 hover:text-green-800"
                              onClick={() => { setSelectedReview(review); setIsReviewPopupOpen(true); }}
                            >
                              Read full review
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {ratings.length > 3 && (
                      <button
                        className="px-8 py-3 border-2 border-green-500 text-green-600 rounded-full font-semibold hover:bg-green-50 transition-all duration-300"
                        onClick={() => setShowAllReviews(prev => !prev)}
                      >
                        {showAllReviews ? 'Show Less' : `View All ${ratings.length} Reviews`}
                      </button>
                    )}
                    <button
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                      onClick={() => navigate(`/review/${businessProfile.id}`)}
                    >
                      Write a Review
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isReviewPopupOpen && (
        <ReviewPopup review={selectedReview} onClose={() => { setIsReviewPopupOpen(false); setSelectedReview(null); }} />
      )}

      {showMediaPopup && (
        <MediaPopup
          url={mediaPopupData.url}
          isVideo={mediaPopupData.isVideo}
          altText={mediaPopupData.alt}
          onClose={() => setShowMediaPopup(false)}
        />
      )}

      <div className="hidden md:block">
        <Footer />
      </div>
      <div className="md:hidden">
        <MobileFooter />
      </div>
    </div>
  );
};

export default BusinessListing;