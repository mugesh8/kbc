import React, { useState, useEffect } from 'react';
import { Search, Grid3X3, ChevronDown, Star, ArrowLeft, MapPin, Briefcase, Users, Building2 } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import baseurl from '../Baseurl/baseurl';
import { useNavigate, Link } from 'react-router-dom';

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

const BusinessCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showBusinesses, setShowBusinesses] = useState(false);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
  const [categoryItemsPerPage] = useState(9);
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsError, setRatingsError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  // Single green gradient color scheme for all categories
  const greenColorScheme = { 
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50", 
    headerBg: "bg-gradient-to-r from-green-500 to-emerald-600",
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    buttonColor: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
    textColor: "text-green-600",
    countBg: "bg-green-100 text-green-700"
  };

  // Helpers to resolve media URLs safely (matching HomePage)
  const toAbsoluteUrl = (path) => {
    if (!path) return '';
    const trimmed = String(path).trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `${baseurl}/${trimmed.replace(/^\//, '')}`;
  };

  // Get banner image URL (matching HomePage logic)
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

  // Function to calculate average rating for a business (EXACTLY MATCHING HOMEPAGE)
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

  // Fetch ratings data (matching HomePage)
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

  // Get current user ID from localStorage (matching HomePage)
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

  // Fetch categories and business counts from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch categories, businesses, and ratings in parallel
        const [categoriesResponse, businessesResponse] = await Promise.all([
          fetch(`${baseurl}/api/category/all`),
          fetch(`${baseurl}/api/business-profile/all`)
        ]);
        
        const categoriesData = await categoriesResponse.json();
        const businessesData = await businessesResponse.json();
        
        // Fetch ratings separately
        await fetchRatings();
        
        if (categoriesData.success) {
          // Get business profiles - FIXED: Use the correct property from API response
          const profiles = Array.isArray(businessesData?.data)
            ? businessesData.data
            : Array.isArray(businessesData?.profiles)
            ? businessesData.profiles
            : [];
          
          console.log('Categories data:', categoriesData.data);
          console.log('Business profiles:', profiles);
          
          // Store businesses for later use
          setBusinesses(profiles);
          
          // Count businesses per category using both business_type and category_id
          // EXCLUDE CURRENT USER'S BUSINESSES FROM THE COUNT
          const businessCounts = {};
          profiles.forEach(business => {
            // Skip current user's own businesses (same logic as HomePage)
            if (currentUserId && business?.member_id === currentUserId) {
              return;
            }
            
            // Try to match by category_id first, then fallback to business_type
            const categoryId = business?.category_id;
            const businessType = business?.business_type;
            
            if (categoryId) {
              // Find the category name by ID
              const category = categoriesData.data.find(cat => cat.cid === categoryId);
              if (category) {
                businessCounts[category.category_name] = (businessCounts[category.category_name] || 0) + 1;
              }
            } else if (businessType) {
              // Fallback to business_type matching
              businessCounts[businessType] = (businessCounts[businessType] || 0) + 1;
            }
          });
          
          console.log('Business counts (excluding current user):', businessCounts);
          
          // Transform API data to match UI structure - USING SINGLE GREEN COLOR SCHEME
          const transformedCategories = categoriesData.data.map((category) => {
            const count = businessCounts[category.category_name] || 0;
            return {
              id: category.cid,
              name: category.category_name,
              count: `${count} ${count === 1 ? 'business' : 'businesses'}`,
              businessCount: count,
              ...greenColorScheme // Use the same green color scheme for all
            };
          }).filter(category => {
            // Only show categories that have businesses (excluding current user's)
            const count = parseInt(category.count);
            return count > 0;
          });
          
          setCategories(transformedCategories);
        } else {
          setError(categoriesData.msg || 'Failed to fetch categories');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [currentUserId]); // Add currentUserId as dependency

  // Handle category explore button click
  const handleExploreCategory = (category) => {
    setSelectedCategory(category);
    setShowBusinesses(true);
    setCurrentPage(1);
  };

  // Handle back to categories
  const handleBackToCategories = () => {
    setShowBusinesses(false);
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset category page when search term changes
  useEffect(() => {
    setCategoryCurrentPage(1);
  }, [searchTerm]);

  // Calculate pagination for categories
  const categoryTotalItems = filteredCategories.length;
  const categoryTotalPages = Math.ceil(categoryTotalItems / categoryItemsPerPage);
  const categoryStartIndex = (categoryCurrentPage - 1) * categoryItemsPerPage;
  const categoryEndIndex = categoryStartIndex + categoryItemsPerPage;
  const currentCategoryItems = filteredCategories.slice(categoryStartIndex, categoryEndIndex);

  // Filter businesses by selected category - EXCLUDE CURRENT USER'S BUSINESSES
  const filteredBusinesses = businesses.filter((business) => {
    // Hide user's own business profile (SAME LOGIC AS HOMEPAGE)
    if (currentUserId && business?.member_id === currentUserId) {
      return false;
    }

    if (!selectedCategory) return false;
    
    // Try to match by category_id first, then fallback to business_type
    const categoryId = business?.category_id;
    const businessType = business?.business_type;
    
    if (categoryId) {
      return categoryId === selectedCategory.id;
    } else if (businessType) {
      return businessType === selectedCategory.name;
    }
    
    return false;
  });

  // Calculate pagination for businesses
  const totalItems = filteredBusinesses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredBusinesses.slice(startIndex, endIndex);

  // Function to get member name (matching HomePage logic)
  const getMemberName = (business) => {
    const memberFirstName = business?.member?.first_name || business?.Member?.first_name || '';
    const memberLastName = business?.member?.last_name || business?.Member?.last_name || '';
    return [memberFirstName, memberLastName].filter(Boolean).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 pb-20 lg:pb-0">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
              {showBusinesses ? `${selectedCategory?.name} Businesses` : 'Business Categories'}
            </h1>
            <p className="text-green-100 text-base sm:text-lg">
              {showBusinesses 
                ? `Discover ${selectedCategory?.name.toLowerCase()} businesses and services` 
                : 'Discover businesses by category and industry'
              }
            </p>
          </div>

          {/* Search Section - Only show when not in business view */}
          {!showBusinesses && (
            <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search Categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Breadcrumb and Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <span className="text-gray-500">Home</span>
            <span className="mx-1 sm:mx-2 text-gray-400">/</span>
            <span className="text-green-600">Categories</span>
            {showBusinesses && (
              <>
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <span className="text-gray-900 truncate">{selectedCategory?.name}</span>
              </>
            )}
          </div>

          {/* Back button when showing businesses */}
          {showBusinesses && (
            <button
              onClick={handleBackToCategories}
              className="flex items-center text-green-600 hover:text-green-700 font-medium text-sm sm:text-base self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-emerald-400 animate-pulse mx-auto"></div>
              </div>
              <p className="mt-6 text-gray-600 font-semibold text-lg">Loading categories...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center mb-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Business Cards View - UPDATED WITH EXACT HOMEPAGE CARD DIMENSIONS AND STYLING */}
        {!loading && !error && showBusinesses && (
          <>
            {/* Results count */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {totalItems} {totalItems === 1 ? 'Business' : 'Businesses'} Found
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                in {selectedCategory?.name}
              </p>
            </div>

            {/* Business Grid - EXACT SAME CARD SIZE AND STYLING AS HOMEPAGE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {currentItems.map((business) => {
                const imageUrl = getBannerImageUrl(business);

                const title = business?.company_name || 'Business';
                const subtitle = business?.business_type || (business?.Member?.first_name || business?.member?.first_name || '');
                const memberName = getMemberName(business);

                // Get real ratings data (EXACTLY MATCHING HOMEPAGE)
                const { averageRating, reviewCount } = getBusinessRatings(business.id);
                const reviewsCount = reviewCount;
                const ratingValue = averageRating;

                return (
                  <div key={business.id} className="bg-white rounded-3xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
                    <Link to={`/details/${business.id}`}>
                      <div className="relative">
                        {/* Green header section - EXACT SAME HEIGHT AS HOMEPAGE */}
                        <div
                          className="h-32 w-full bg-green-600 flex items-center justify-center bg-cover bg-no-repeat bg-center"
                          style={{
                            backgroundImage: imageUrl ? `url(${imageUrl})` : "url('/fallback.png')",
                          }}
                        ></div>

                        {/* Avatar and member name positioned on the right side between green and white sections - EXACT SAME POSITIONING */}
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

                        {/* Content section with left alignment - EXACT SAME PADDING AND SPACING */}
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

                          {/* Business info - Updated to match HomePage style */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {business?.city && (
                              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                <MapPin className="w-3 h-3" />
                                {business.city}
                              </span>
                            )}
                            {business?.business_type && (
                              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                <Briefcase className="w-3 h-3" />
                                {business.business_type}
                              </span>
                            )}
                          </div>
                          
                          {/* Best time to contact - Added from HomePage */}
                          <div className="text-gray-700 mb-3 sm:mb-4 text-left text-xs sm:text-sm">
                            Best time to contact: <span className="font-medium">{business?.best_contact_time || 'Morning'}</span>
                          </div>
                          
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

            {/* No businesses found */}
            {currentItems.length === 0 && (
              <div className="text-center py-12 sm:py-20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No businesses found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                  No businesses found in this category
                </p>
                <button
                  onClick={handleBackToCategories}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                >
                  Back to Categories
                </button>
              </div>
            )}

            {/* Pagination Controls - EXACT SAME AS HOMEPAGE */}
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

            {/* Load More Button (alternative to pagination) - EXACT SAME AS HOMEPAGE */}
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
        )}

        {/* Categories Grid View - ALL CARDS NOW HAVE SAME GREEN COLOR */}
        {!loading && !error && !showBusinesses && (
          <>
            {/* Results count */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {categoryTotalItems} {categoryTotalItems === 1 ? 'Category' : 'Categories'} Found
              </h2>
              {searchTerm && (
                <p className="text-gray-600 text-sm sm:text-base mt-1">
                  Search results for "{searchTerm}"
                </p>
              )}
            </div>

            {/* Enhanced Categories Grid - ALL GREEN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {currentCategoryItems.map((category) => (
                <div 
                  key={category.id} 
                  className={`${greenColorScheme.bgColor} rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden`}
                >
                  {/* Category Header with Green Gradient */}
                  <div className={`h-20 sm:h-24 ${greenColorScheme.headerBg} relative`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Category Icon */}
                        <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl text-white shadow-lg ${greenColorScheme.iconBg}`}>
                          <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        
                        {/* Category Name */}
                        <div className="flex-1 min-w-0 text-left">
                          <h3 className="text-lg sm:text-xl font-bold text-white truncate">{category.name}</h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Content */}
                  <div className="p-4 sm:p-6">
                    <div className="space-y-4 sm:space-y-6">
                      
                      {/* Business Count */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl shadow-sm">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{category.businessCount}</p>
                            <p className="text-xs sm:text-sm text-gray-500">Businesses</p>
                          </div>
                        </div>
                        
                        {/* Explore Button */}
                        <button 
                          onClick={() => handleExploreCategory(category)}
                          className={`${greenColorScheme.buttonColor} text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap`}
                        >
                          Explore
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {currentCategoryItems.length === 0 && searchTerm && (
              <div className="text-center py-12 sm:py-20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No categories found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                  No categories found matching "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Pagination Controls for Categories */}
            {categoryTotalPages > 1 && (
              <div className="flex flex-col gap-4 mb-6 sm:mb-8">
                {/* Results info */}
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing {categoryStartIndex + 1}-{Math.min(categoryEndIndex, categoryTotalItems)} of {categoryTotalItems} categories
                </div>

                {/* Pagination buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-1">
                  {/* Mobile: Show only essential buttons */}
                  <div className="flex items-center gap-1 sm:hidden">
                    <button
                      onClick={() => setCategoryCurrentPage(categoryCurrentPage - 1)}
                      disabled={categoryCurrentPage === 1}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Prev
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(3, categoryTotalPages) }, (_, i) => {
                        let pageNum;
                        if (categoryTotalPages <= 3) {
                          pageNum = i + 1;
                        } else if (categoryCurrentPage <= 2) {
                          pageNum = i + 1;
                        } else if (categoryCurrentPage >= categoryTotalPages - 1) {
                          pageNum = categoryTotalPages - 2 + i;
                        } else {
                          pageNum = categoryCurrentPage - 1 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCategoryCurrentPage(pageNum)}
                            className={`px-3 py-2 text-xs border rounded-lg ${
                              categoryCurrentPage === pageNum
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
                      onClick={() => setCategoryCurrentPage(categoryCurrentPage + 1)}
                      disabled={categoryCurrentPage === categoryTotalPages}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>

                  {/* Desktop: Show full pagination */}
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={() => setCategoryCurrentPage(1)}
                      disabled={categoryCurrentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCategoryCurrentPage(categoryCurrentPage - 1)}
                      disabled={categoryCurrentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, categoryTotalPages) }, (_, i) => {
                        let pageNum;
                        if (categoryTotalPages <= 5) {
                          pageNum = i + 1;
                        } else if (categoryCurrentPage <= 3) {
                          pageNum = i + 1;
                        } else if (categoryCurrentPage >= categoryTotalPages - 2) {
                          pageNum = categoryTotalPages - 4 + i;
                        } else {
                          pageNum = categoryCurrentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCategoryCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm border rounded-lg ${
                              categoryCurrentPage === pageNum
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
                      onClick={() => setCategoryCurrentPage(categoryCurrentPage + 1)}
                      disabled={categoryCurrentPage === categoryTotalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCategoryCurrentPage(categoryTotalPages)}
                      disabled={categoryCurrentPage === categoryTotalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
      <MobileFooter />
    </div>
  );
};

export default BusinessCategories;