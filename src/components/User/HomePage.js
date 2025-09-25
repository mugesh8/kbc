import React, { useEffect, useState } from 'react';
import { Search, MapPin, Star, Users, Eye, Phone, Mail, Facebook, Twitter, Linkedin, Instagram, MessageCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// Import your header and footer components
import Header from './Header';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import baseurl from '../../components/Baseurl/baseurl';

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" fill="#25D366" />
  </svg>
);

const PhoneIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#3B82F6" />
  </svg>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [categoriesList, setCategoriesList] = useState(['All']);
  const [categoriesData, setCategoriesData] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [appliedTag, setAppliedTag] = useState('');
  const [appliedLocation, setAppliedLocation] = useState('');
  const [appliedCategory, setAppliedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [userCity, setUserCity] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsError, setRatingsError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  // Helpers to resolve media URLs safely
  const toAbsoluteUrl = (path) => {
    if (!path) return '';
    const trimmed = String(path).trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `${baseurl}/${trimmed.replace(/^\//, '')}`;
  };

  const getBannerImageUrl = (business) => {
    // Prefer explicit business profile image
    if (business?.business_profile_image) {
      return toAbsoluteUrl(business.business_profile_image);
    }

    // Fallback: first image (not video) from media_gallery
    const gallery = (business?.media_gallery || '').split(',').map((s) => s.trim()).filter(Boolean);
    const imageEntry = gallery.find((entry) => /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(entry));
    if (imageEntry) return toAbsoluteUrl(imageEntry);

    return '';
  };

  // Fetch ratings data
  const fetchRatings = async () => {
    try {
      setRatingsLoading(true);
      const response = await fetch(`${baseurl}/api/ratings/all`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }
      const data = await response.json();
      const ratingsData = Array.isArray(data?.data) ? data.data : [];
      setRatings(ratingsData);
    } catch (err) {
      setRatingsError(err.message || 'Unable to load ratings');
      console.error('Error fetching ratings:', err);
    } finally {
      setRatingsLoading(false);
    }
  };

  // Get current user ID from localStorage
  useEffect(() => {
    const memberData = localStorage.getItem('memberData');
    if (memberData) {
      try {
        const parsedData = JSON.parse(memberData);
        setCurrentUserId(parsedData.mid);
      } catch (error) {
        console.error('Error parsing member data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseurl}/api/business-profile/all`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch businesses');
        }
        const data = await response.json();
        // Support both shapes: { profiles: [...] } and { success: true, data: [...] }
        const profiles = Array.isArray(data?.profiles)
          ? data.profiles
          : Array.isArray(data?.data)
            ? data.data
            : [];
        setBusinesses(profiles);
      } catch (err) {
        setError(err.message || 'Unable to load businesses');
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
    fetchRatings();
  }, []);

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${baseurl}/api/category/all`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        const list = Array.isArray(data?.data) ? data.data : [];
        setCategoriesData(list);
        setCategoriesList(['All', ...list.map((c) => c.category_name)]);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    };
    fetchCategories();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedTag, appliedLocation, appliedCategory, selectedTags, searchQuery]);

  // Add tag function
  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  // Remove tag function
  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // Handle tag input key press
  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    setSearchQuery(value);
    // Auto-apply search as user types (with debounce)
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setAppliedTag(selectedTags.join(','));
      setAppliedLocation(searchLocation.trim());
      setAppliedCategory(activeCategory);
    }, 300);
  };

  // Get user's current location and city
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Location obtained:', { latitude, longitude });
        setUserLocation({ lat: latitude, lng: longitude });

        // Get city name from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const city = data.city || data.locality || data.principalSubdivision || 'Unknown';
          console.log('User city detected:', city);
          setUserCity(city);
          setSearchLocation(`Near Me (${city})`);
          setAppliedLocation('Near Me');
        } catch (geocodeError) {
          console.error('Reverse geocoding failed:', geocodeError);
          setSearchLocation('Near Me');
          setAppliedLocation('Near Me');
        }

        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to retrieve your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Please try again.';
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Calculate ratings for a specific business
  const getBusinessRatings = (businessId) => {
    const businessRatings = ratings.filter(rating =>
      rating.business_id === businessId && rating.status === 'approved'
    );

    if (businessRatings.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    const totalRating = businessRatings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / businessRatings.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: businessRatings.length
    };
  };

  // derive unique tags and locations for suggestions
  const uniqueTags = Array.from(
    new Set(
      businesses
        .flatMap((b) =>
          (b?.tags || '')
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t)
        )
    )
  );

  const uniqueLocations = Array.from(
    new Set(
      businesses
        .map((b) => (b?.city || b?.location || '').trim())
        .filter((v) => v)
    )
  );

  const tagSuggestions = tagInput
    ? uniqueTags
      .filter((t) => t.toLowerCase().startsWith(tagInput.toLowerCase()))
      .slice(0, 8)
    : [];

  const locationSuggestions = searchLocation
    ? uniqueLocations
      .filter((l) => l.toLowerCase().startsWith(searchLocation.toLowerCase()))
      .slice(0, 8)
    : [];

  // Function to assign colors to categories
  const getCategoryColor = (categoryName) => {
    const colors = [
      "bg-green-100 text-green-800",
      "bg-blue-100 text-blue-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-yellow-100 text-yellow-800",
      "bg-red-100 text-red-800"
    ];

    // Use category name to consistently assign colors
    const hash = categoryName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  // Calculate real categories from business data EXCLUDING current user's businesses
  const realCategories = React.useMemo(() => {
    // Filter out current user's businesses before counting categories
    const filteredBusinesses = currentUserId 
      ? businesses.filter(business => business?.member_id !== currentUserId)
      : businesses;

    const categoryCounts = {};
    filteredBusinesses.forEach(business => {
      const category = business?.business_type || 'Other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count: count.toString(),
        color: getCategoryColor(name)
      }))
      .sort((a, b) => parseInt(b.count) - parseInt(a.count)); // Sort by count descending
  }, [businesses, currentUserId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Uncomment when you have the Header component */}
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-8 sm:py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Discover Local Businesses</h1>
            <p className="text-green-100 text-base sm:text-lg">Connect with trusted businesses in your community</p>
          </div>

          {/* Search Section */}
          <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <div className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 text-gray-700 border border-gray-200 rounded-lg focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 min-h-[44px] sm:min-h-[48px] flex flex-wrap items-center gap-2">
                    {/* Selected Tags */}
                    {selectedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {/* Tag Input */}
                    <input
                      type="text"
                      placeholder={selectedTags.length === 0 ? "Search businesses, services, tags..." : "Add more tags..."}
                      value={tagInput}
                      onChange={handleSearchChange}
                      onKeyPress={handleTagInputKeyPress}
                      onFocus={() => setShowTagSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
                      className="flex-1 min-w-[150px] sm:min-w-[200px] outline-none bg-transparent text-sm sm:text-base"
                    />
                  </div>
                  {showTagSuggestions && tagSuggestions.length > 0 && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-auto">
                      {tagSuggestions.map((s) => (
                        <div
                          key={s}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                          onMouseDown={() => {
                            addTag(s);
                          }}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 max-w-xs">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Enter Location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 150)}
                    className="w-full pl-8 sm:pl-10 pr-16 sm:pr-20 py-2 sm:py-3 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-2 sm:px-3 py-1 rounded text-xs font-medium transition duration-200"
                  >
                    {locationLoading ? '...' : 'Near Me'}
                  </button>
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow max-h-48 overflow-auto">
                      {locationSuggestions.map((s) => (
                        <div
                          key={s}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                          onMouseDown={() => {
                            setSearchLocation(s);
                            setShowLocationSuggestions(false);
                          }}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {locationError && (
                  <p className="text-red-500 text-xs mt-1">{locationError}</p>
                )}
              </div>

              <div className="lg:w-48">
                <select
                  className="w-full py-2 sm:py-3 px-3 sm:px-4 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  value={activeCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    setActiveCategory(val);
                  }}
                >
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-medium transition duration-200 text-sm sm:text-base"
                onClick={() => {
                  console.log('Search clicked:', { selectedTags, searchQuery, searchLocation, activeCategory });
                  setAppliedTag(selectedTags.join(','));
                  setAppliedLocation(searchLocation.trim());
                  setAppliedCategory(activeCategory);
                }}
              >
                Search Now
              </button>
            </div>

            {/* Helper: apply on Enter key anywhere in the search row */}
            <input
              type="text"
              className="hidden"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setAppliedTag(selectedTags.join(','));
                  setAppliedLocation(searchLocation.trim());
                  setAppliedCategory(activeCategory);
                }
              }}
            />

          </div>
        </div>
      </div>

      {/* Featured Businesses Section */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Featured Businesses</h2>
          <p className="text-gray-600 text-sm sm:text-base">Discover top-rated local businesses</p>
        </div>

        {/* Category Filter (dynamic from business_type) */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          {categoriesList.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setAppliedCategory(category);
              }}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition duration-200 ${activeCategory === category
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Active Filters Display */}
        {(appliedTag || appliedLocation || appliedCategory !== 'All') && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs sm:text-sm text-gray-600">Active filters:</span>
              {appliedTag && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  Tags: {appliedTag}
                </span>
              )}
              {appliedLocation && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  Location: {appliedLocation}
                </span>
              )}
              {appliedCategory !== 'All' && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  Category: {appliedCategory}
                </span>
              )}
              <button
                onClick={() => {
                  setAppliedTag('');
                  setAppliedLocation('');
                  setAppliedCategory('All');
                  setSearchTag('');
                  setSearchLocation('');
                  setActiveCategory('All');
                  setSelectedTags([]);
                  setTagInput('');
                  setSearchQuery('');
                }}
                className="text-red-600 hover:text-red-800 text-xs underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Business Grid */}
        {loading ? (
          <div className="text-center text-gray-600 mb-8">Loading businesses...</div>
        ) : error ? (
          <div className="text-center text-red-600 mb-8">{error}</div>
        ) : (() => {
          // Filter businesses first - EXCLUDE CURRENT USER'S BUSINESSES
          const filteredBusinesses = businesses.filter((b) => {
            // Hide user's own business profile
            if (currentUserId && b?.member_id === currentUserId) {
              return false;
            }

            let matchCategory = true;
            if ((appliedCategory || 'All') !== 'All') {
              const selectedCategory = categoriesData.find((c) => c.category_name === appliedCategory);
              matchCategory = selectedCategory ? Number(b?.category_id) === Number(selectedCategory.cid) : false;
            }
            const tagText = (b?.tags || '').toLowerCase();
            const nameText = (b?.company_name || '').toLowerCase();
            const typeText = (b?.business_type || '').toLowerCase();
            const appliedTags = appliedTag ? appliedTag.split(',').map(t => t.trim().toLowerCase()) : [];
            const searchQueryLower = searchQuery.toLowerCase().trim();

            // Match selected tags
            const matchSelectedTags = appliedTags.length === 0 || appliedTags.some(tag =>
              tagText.includes(tag) || nameText.includes(tag) || typeText.includes(tag)
            );

            // Match search query (normal search functionality)
            const matchSearchQuery = searchQueryLower === '' ||
              tagText.includes(searchQueryLower) ||
              nameText.includes(searchQueryLower) ||
              typeText.includes(searchQueryLower);

            const matchTag = matchSelectedTags && matchSearchQuery;

            // Handle "Near Me" location filtering
            let matchLocation = true;
            if (appliedLocation && appliedLocation.toLowerCase().trim() === 'near me') {
              if (userCity) {
                // Filter businesses by user's city
                const businessCity = (b?.city || '').toLowerCase();
                const businessLocation = (b?.location || '').toLowerCase();
                const userCityLower = userCity.toLowerCase();

                matchLocation = businessCity.includes(userCityLower) ||
                  businessLocation.includes(userCityLower) ||
                  businessCity.includes(userCityLower.split(' ')[0]); // Match first word of city

                console.log(`Near Me filter: User city "${userCityLower}" matches business city "${businessCity}" or location "${businessLocation}" = ${matchLocation}`);
              } else {
                console.log('Near Me selected but no user city available');
                matchLocation = false; // Don't show any if no city detected
              }
            } else if (appliedLocation && appliedLocation.trim() !== '') {
              const locText = (b?.city || b?.location || '').toLowerCase();
              const searchLocLower = appliedLocation.toLowerCase().trim();
              matchLocation = locText.includes(searchLocLower);
              console.log(`Location filter: "${searchLocLower}" in "${locText}" = ${matchLocation}`);
            } else {
              matchLocation = true; // No location filter applied
            }

            return matchCategory && matchTag && matchLocation;
          });

          // Calculate pagination
          const totalItems = filteredBusinesses.length;
          const totalPages = Math.ceil(totalItems / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const currentItems = filteredBusinesses.slice(startIndex, endIndex);

          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {currentItems.map((business) => {
                  const imageUrl = getBannerImageUrl(business);

                  const title = business?.company_name || 'Business';
                  const subtitle = business?.business_type || (business?.Member?.first_name || business?.member?.first_name || '');
                  const memberFirstName = business?.member?.first_name || business?.Member?.first_name || '';
                  const memberLastName = business?.member?.last_name || business?.Member?.last_name || '';
                  const memberName = [memberFirstName, memberLastName].filter(Boolean).join(' ');

                  // Get real ratings data
                  const { averageRating, reviewCount } = getBusinessRatings(business.id);
                  const reviewsCount = reviewCount;
                  const ratingValue = averageRating;
                  return (
                    <div key={business.id} className="bg-white rounded-3xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
                      <Link to={`/details/${business.id}`}>
                        <div className="relative">
                          {/* Green header section */}
                          <div
                            className="h-32 w-full bg-green-600 flex items-center justify-center bg-cover bg-no-repeat bg-center"
                            style={{
                              backgroundImage: imageUrl ? `url(${imageUrl})` : "url('/fallback.png')",
                            }}
                          ></div>


                          {/* Avatar and member name positioned on the right side between green and white sections */}
                          <div className="absolute right-6 top-20 flex flex-col items-end z-10">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md border-2 border-white">
                              {imageUrl ? (
                                <img src={`${baseurl}/${business.Member?.profile_image}`} alt="Profile" className="w-12 h-12 object-cover rounded-full" />
                              ) : (
                                <div className="w-10 h-10 bg-green-100 rounded-full" />
                              )}
                            </div>
                            {memberName && (
                              <div className="mt-1 text-sm font-medium text-gray-800 bg-white/80 px-2 py-0.5 rounded text-right">
                                {memberName}
                              </div>
                            )}
                          </div>

                          {/* Content section with left alignment */}
                          <div className="px-3 sm:px-4 pt-10 sm:pt-12 pb-3 text-left">
                            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2 text-left">{title}</h3>
                            <p className="text-gray-600 text-sm sm:text-base mb-3 text-left">{subtitle}</p>
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 justify-start">
                              <div className="flex items-center text-yellow-500">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${star <= Math.floor(ratingValue)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : star === Math.ceil(ratingValue) && ratingValue % 1 !== 0
                                        ? 'fill-yellow-200 text-yellow-400'
                                        : 'text-gray-300'
                                      }`}
                                  />
                                ))}
                              </div>
                              <div className="flex items-baseline gap-1 sm:gap-2">
                                <span className="text-gray-900 text-sm sm:text-lg font-semibold">
                                  {ratingValue > 0 ? ratingValue.toFixed(1) : ''}
                                </span>
                                <span className="text-gray-500 text-xs sm:text-sm">
                                  ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
                                </span>
                              </div>
                            </div>
                            <div className="text-gray-700 mb-3 sm:mb-4 text-left text-xs sm:text-sm">Best time to contact : <span className="font-medium">{business?.best_contact_time || 'Morning'}</span></div>
                            <div className="flex items-center gap-2">
                              <button className="inline-flex items-center px-4 sm:px-7 py-1.5 sm:py-2 rounded-full bg-green-600 text-white text-xs sm:text-sm font-medium hover:bg-green-700 transition"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(`/details/${business.id}`);
                                }}
                              >
                                View
                              </button>

                              {/* Phone and WhatsApp icons */}
                              <div className="flex items-center gap-2 ml-auto">
                                <a
                                  href={`tel:${business.business_work_contract || business.phone || ''}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Call"
                                >
                                  <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </a>
                                <a
                                  href='#'
                                  className="text-green-600 hover:text-green-800 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                  title="WhatsApp"
                                >
                                  <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                  {/* Results info */}
                  <div className="text-xs sm:text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} businesses
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-2 sm:px-3 py-2 text-xs sm:text-sm border rounded-lg ${currentPage === pageNum
                              ? 'bg-green-600 text-white border-green-600'
                              : 'border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}

              {/* Load More Button (alternative to pagination) */}
              {currentPage < totalPages && (
                <div className="text-center mb-8">
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="bg-white border-2 border-green-600 text-green-600 px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-medium hover:bg-green-50 transition duration-200 text-sm sm:text-base"
                  >
                    Load More Businesses ({totalItems - endIndex} remaining)
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Browse by Category */}
      <div className="bg-gray-100 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse by Category</h2>
            <button
              onClick={() => navigate('/categories')}
              className="text-green-600 font-medium hover:text-green-700 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition duration-200 text-sm sm:text-base"
            >
              View All Categories
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {realCategories.slice(0, 4).map((category) => (
              <div
                key={category.name}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
                onClick={() => {
                  setActiveCategory(category.name);
                  setAppliedCategory(category.name);
                }}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${category.color}`}>
                    {category.name}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {category.count}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {category.count === '1' ? 'business' : 'businesses'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to List Your Business?</h2>
          <p className="text-green-100 text-base sm:text-lg mb-6 sm:mb-8">Join thousands of local businesses and reach more customers</p>
          <button className="bg-white text-green-600 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-200 text-sm sm:text-base">
            List Your Business
          </button>
        </div>
      </div>

      <Footer />
      <MobileFooter />
    </div>
  );
};

export default HomePage;