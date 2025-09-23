import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Grid3X3, List, ChevronDown, ChevronLeft, ChevronRight, X, Star } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import baseurl from '../Baseurl/baseurl';
import { useNavigate, Link } from 'react-router-dom';

const BusinessDirectory = () => {
  const [sortBy, setSortBy] = useState('Relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [rawBusinesses, setRawBusinesses] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [ratingFilter, setRatingFilter] = useState('');
  const navigate = useNavigate();

  // Color schemes for different categories
  const colorSchemes = [
    { bgColor: "bg-green-500", icon: "🍝" },
    { bgColor: "bg-teal-500", icon: "🏥" },
    { bgColor: "bg-indigo-500", icon: "⚖️" },
    { bgColor: "bg-orange-400", icon: "👗" },
    { bgColor: "bg-black", icon: "🚗" },
    { bgColor: "bg-purple-500", icon: "💄" },
    { bgColor: "bg-red-500", icon: "🏪" },
    { bgColor: "bg-blue-500", icon: "🏢" },
    { bgColor: "bg-yellow-500", icon: "🍕" },
    { bgColor: "bg-pink-500", icon: "💅" }
  ];

  // Function to calculate average rating for a business (matching HomePage)
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

  // Fetch businesses and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories, businesses, and ratings in parallel
        const [categoriesResponse, businessesResponse, ratingsResponse] = await Promise.all([
          fetch(`${baseurl}/api/category/all`),
          fetch(`${baseurl}/api/business-profile/all`),
          fetch(`${baseurl}/api/ratings/all`)
        ]);
        
        const categoriesData = await categoriesResponse.json();
        const businessesData = await businessesResponse.json();
        const ratingsData = await ratingsResponse.json();
        
        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
        
        if (ratingsData.success || ratingsData.data) {
          setRatings(ratingsData.data || []);
        }
        
        if (businessesData.success || businessesData.profiles) {
          // Get business profiles
          const profiles = Array.isArray(businessesData?.profiles)
            ? businessesData.profiles
            : Array.isArray(businessesData?.data)
            ? businessesData.data
            : [];
          
          setRawBusinesses(profiles);
        }
      } catch (err) {
        setError('Failed to load businesses. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform businesses with ratings when both raw businesses and ratings are available
  useEffect(() => {
    if (rawBusinesses.length > 0) {
      const transformedBusinesses = rawBusinesses.map((business, index) => {
        const colorScheme = colorSchemes[index % colorSchemes.length];
        const categoryName = business?.business_type || 'Business';
        const city = business?.city || business?.location || '';
        
        // Calculate real ratings
        const businessRating = getBusinessRatings(business.id);
        
        return {
          id: business.id,
          member_id: business?.member_id, // Preserve member_id for filtering
          company_name: business?.company_name || 'Business',
          business_type: business?.business_type,
          Member: business?.Member,
          member: business?.member,
          business_profile_image: business?.business_profile_image,
          media_gallery: business?.media_gallery,
          best_contact_time: business?.best_contact_time || null,
          city: business?.city || business?.location || '',
          category: `${categoryName} • ${city}`,
          rating: businessRating ? businessRating.averageRating : null,
          reviews: businessRating ? businessRating.reviewCount : 0,
          status: 'Open', // Default status
          distance: `${(Math.random() * 3 + 0.1).toFixed(1)} mi`, // Mock distance
          color: colorScheme.bgColor,
          featured: Math.random() > 0.8, // Random featured
          verified: Math.random() > 0.7, // Random verified
          topRated: businessRating ? businessRating.averageRating >= 4.5 : false, // Real top rated
          discount: Math.random() > 0.9 ? '30% OFF' : null, // Random discount
          actions: ['View'],
          icon: colorScheme.icon,
          category_id: business?.category_id
        };
      });
      
      setBusinesses(transformedBusinesses);
      setFilteredBusinesses(transformedBusinesses);
    }
  }, [rawBusinesses, ratings]);

  // Filter businesses based on search and filters
  useEffect(() => {
    let filtered = businesses;

    // Hide user's own business profile
    if (currentUserId) {
      filtered = filtered.filter(business => business.member_id !== currentUserId);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(business =>
        business.category.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(business =>
        business.business_type === selectedCategory
      );
    }

    // Rating filter
    if (ratingFilter) {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(business => {
        const businessRating = getBusinessRatings(business.id);
        return businessRating.averageRating >= minRating;
      });
    }

    setFilteredBusinesses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [businesses, searchTerm, locationFilter, selectedCategory, ratingFilter, currentUserId]);

  // Sort businesses
  const sortedBusinesses = [...filteredBusinesses].sort((a, b) => {
    switch (sortBy) {
      case 'Rating':
        return b.rating - a.rating;
      case 'Name':
        return a.name.localeCompare(b.name);
      case 'Distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      default:
        return 0; // Relevance - keep original order
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedBusinesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedBusinesses.slice(startIndex, endIndex);


  const StatusChip = ({ business }) => {
    if (business.featured) {
      return (
        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
          FEATURED
        </span>
      );
    }
    if (business.verified) {
      return (
        <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
          VERIFIED
        </span>
      );
    }
    if (business.topRated) {
      return (
        <span className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
          TOP RATED
        </span>
      );
    }
    return null;
  };

  const DiscountChip = ({ discount }) => {
    if (discount) {
      return (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10 uppercase">
          {discount}
        </span>
      );
    }
    return null;
  };

  const BusinessCard = ({ business, isListView = false }) => {
    // Match HomePage exactly
    const imageUrl = business?.business_profile_image
      ? business.business_profile_image.startsWith('https')
        ? business.business_profile_image
        : `${baseurl}/${business.business_profile_image}`
      : '';

    const title = business?.company_name || 'Business';
    const subtitle = business?.business_type || (business?.Member?.first_name || business?.member?.first_name || '');
    
    // Get real ratings data (matching HomePage approach)
    const { averageRating, reviewCount } = getBusinessRatings(business.id);
    const reviewsCount = reviewCount;
    const ratingValue = averageRating;

    if (isListView) {
      return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
          <div className="flex">
            {/* Left side - Image */}
            <div 
              className="w-24 h-24 sm:w-32 sm:h-32 bg-green-600 flex items-center justify-center flex-shrink-0 bg-cover bg-no-repeat bg-center"
              style={{
                backgroundImage: business?.media_gallery
                  ? `url(${baseurl}/${business.media_gallery})`
                  : "url('/fallback.png')",
              }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-md">
                {imageUrl ? (
                  <img src={imageUrl} alt={title} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full" />
                ) : (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm sm:text-lg">{title.charAt(0)}</span>
                  </div>
                )}
              </div>
            </div>
            
              {/* Right side - Content */}
              <div className="flex-1 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                  <div className="flex-1 mb-3 sm:mb-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 text-left">{title}</h3>
                    <p className="text-gray-600 text-sm mb-3 text-left">{subtitle}</p>
                    
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 justify-start">
                      <div className="flex items-center text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              star <= Math.floor(ratingValue)
                                ? 'fill-yellow-400 text-yellow-400'
                                : star === Math.ceil(ratingValue) && ratingValue % 1 !== 0
                                ? 'fill-yellow-200 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-baseline gap-1 sm:gap-2">
                        <span className="text-gray-900 text-sm sm:text-base font-semibold">
                          {ratingValue > 0 ? ratingValue.toFixed(1) : 'No rating'}
                        </span>
                        <span className="text-gray-500 text-xs sm:text-sm">
                          ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-gray-700 text-xs sm:text-sm text-left">
                      Best time to contact: <span className="font-medium">{business?.best_contact_time || 'Morning'}</span>
                    </div>
                  </div>
                  <button className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition">
                    View
                  </button>
                </div>
              </div>
          </div>
        </div>
      );
    }

    // Grid view (original design)
    return (
      <div className="bg-white rounded-3xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
        <Link to={`/details/${business.id}`}>
        <div className="relative">
          <div
            className="h-24 sm:h-32 w-full bg-green-600 flex items-center justify-center bg-cover bg-no-repeat bg-center"
            style={{
              backgroundImage: business?.media_gallery
                ? `url(${baseurl}/${business.media_gallery})`
                : "url('/fallback.png')",
            }}
          ></div>
          <div className="absolute left-4 sm:left-6 top-16 sm:top-20 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-md border-2 border-white z-10">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-full" />
            ) : (
              <div className="w-6 h-6 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-xs sm:text-sm">{title.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="px-3 sm:px-4 pt-10 sm:pt-12 pb-3 text-left">
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2 text-left">{title}</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-3 text-left">{subtitle}</p>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 justify-start">
              <div className="flex items-center text-yellow-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                      star <= Math.floor(ratingValue)
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
                  {ratingValue > 0 ? ratingValue.toFixed(1) : 'No rating'}
                </span>
                <span className="text-gray-500 text-xs sm:text-sm">
                  ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
            <div className="text-gray-700 mb-3 sm:mb-4 text-left text-xs sm:text-sm">Best time to contact : <span className="font-medium">{business?.best_contact_time || 'Morning'}</span></div>
            <button className="inline-flex items-center px-4 sm:px-7 py-1.5 sm:py-2 rounded-full bg-green-600 text-white text-xs sm:text-sm font-medium hover:bg-green-700 transition"
              onClick={() => navigate(`/details/${business.id}`)}
            >
              View
            </button>
          </div>
        </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Mobile Search Section */}
        <div className="mb-6">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="space-y-3">
                {/* Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>

                {/* Location and Category Row */}
                <div className="flex items-center gap-2">
                  {/* Location Input */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Location"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="flex-1 relative">
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full py-3 px-3 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-500 appearance-none"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.cid} value={category.category_name}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Search Button */}
                <button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-medium text-sm">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:block">
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
              </div>
              <div className="w-48">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
              </div>
              <div className="w-44">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-2.5 px-3 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-500 appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.cid} value={category.category_name}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="bg-green-500 text-white px-6 py-2.5 rounded-lg hover:bg-green-600 font-medium text-sm">
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setLocationFilter('');
                    setSelectedCategory('');
                    setRatingFilter('');
                  }}
                  className="text-sm text-green-500 hover:text-green-700"
                >
                  Clear All
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                      className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Categories <span className="text-gray-400">({businesses.length})</span></span>
                  </label>
                  {categories.map((category) => {
                    const count = businesses.filter(b => b.business_type === category.category_name).length;
                    return (
                      <label key={category.cid} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategory === category.category_name}
                          onChange={() => setSelectedCategory(selectedCategory === category.category_name ? '' : category.category_name)}
                          className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category.category_name} <span className="text-gray-400">({count})</span></span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Rating</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={ratingFilter === ''}
                      onChange={() => setRatingFilter('')}
                      className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Ratings</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={ratingFilter === '4.5'}
                      onChange={() => setRatingFilter(ratingFilter === '4.5' ? '' : '4.5')}
                      className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="ml-2 flex items-center">
                      <div className="flex items-center text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= 4
                                ? 'fill-yellow-400 text-yellow-400'
                                : star === 5
                                ? 'fill-yellow-200 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-700">4.5+ Stars</span>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={ratingFilter === '4.0'}
                      onChange={() => setRatingFilter(ratingFilter === '4.0' ? '' : '4.0')}
                      className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div className="ml-2 flex items-center">
                      <div className="flex items-center text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= 4
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-700">4.0+ Stars</span>
                    </div>
                  </label>
                </div>
              </div>

              <button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-medium">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-3">
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
                <p className="text-red-600 font-medium">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 text-red-500 hover:text-red-700 underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Results Header */}
            {!loading && !error && (
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
                <div className="mb-4 lg:mb-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'Business' : 'Businesses'} Found
                  </h2>
                  <p className="text-gray-600 mb-3 text-xs sm:text-sm lg:text-base">
                    {searchTerm || selectedCategory || locationFilter 
                      ? `Showing results for ${searchTerm ? `"${searchTerm}"` : ''} ${selectedCategory ? `in ${selectedCategory}` : ''} ${locationFilter ? `near ${locationFilter}` : ''}`
                      : 'Showing all businesses in your area'
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-800 border">
                        Search: {searchTerm}
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="ml-1 sm:ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedCategory && (
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-800 border">
                        {selectedCategory}
                        <button 
                          onClick={() => setSelectedCategory('')}
                          className="ml-1 sm:ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {locationFilter && (
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-800 border">
                        Location: {locationFilter}
                        <button 
                          onClick={() => setLocationFilter('')}
                          className="ml-1 sm:ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="Relevance">Relevance</option>
                    <option value="Distance">Distance</option>
                    <option value="Rating">Rating</option>
                    <option value="Name">Name</option>
                  </select>
                </div>
                <div className="flex border border-gray-300 rounded">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-green-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                </div>
              </div>
            )}

            {/* Business Cards Grid/List */}
            {!loading && !error && (
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'} mb-8`}>
                {currentItems.map((business) => (
                  <BusinessCard key={business.id} business={business} isListView={viewMode === 'list'} />
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && !error && currentItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No businesses found matching your criteria</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setLocationFilter('');
                    setSelectedCategory('');
                    setRatingFilter('');
                  }}
                  className="mt-2 text-green-600 hover:text-green-700 underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                {/* Results info */}
                <div className="text-xs sm:text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredBusinesses.length)} of {filteredBusinesses.length} businesses
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
                          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm border rounded-lg ${
                            currentPage === pageNum
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
          </div>
        </div>
      </div>
      <Footer />
      <MobileFooter />
    </div>
  );
};

export default BusinessDirectory;