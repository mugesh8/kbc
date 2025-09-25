import React, { useState, useEffect } from 'react';
import { Search, Grid3X3, ChevronDown, Star, ArrowLeft } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import baseurl from '../Baseurl/baseurl';
import { useNavigate, Link } from 'react-router-dom';

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
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  // Color schemes for different categories
  const colorSchemes = [
    { bgColor: "bg-green-100", iconBg: "bg-green-500", buttonColor: "bg-green-500 hover:bg-green-600" },
    { bgColor: "bg-blue-100", iconBg: "bg-blue-500", buttonColor: "bg-blue-500 hover:bg-blue-600" },
    { bgColor: "bg-orange-100", iconBg: "bg-orange-500", buttonColor: "bg-orange-500 hover:bg-orange-600" },
    { bgColor: "bg-purple-100", iconBg: "bg-purple-500", buttonColor: "bg-purple-500 hover:bg-purple-600" },
    { bgColor: "bg-red-100", iconBg: "bg-red-500", buttonColor: "bg-red-500 hover:bg-red-600" },
    { bgColor: "bg-teal-100", iconBg: "bg-teal-500", buttonColor: "bg-teal-500 hover:bg-teal-600" },
    { bgColor: "bg-indigo-100", iconBg: "bg-indigo-500", buttonColor: "bg-indigo-500 hover:bg-indigo-600" },
    { bgColor: "bg-pink-100", iconBg: "bg-pink-500", buttonColor: "bg-pink-500 hover:bg-pink-600" },
    { bgColor: "bg-yellow-100", iconBg: "bg-yellow-500", buttonColor: "bg-yellow-500 hover:bg-yellow-600" },
    { bgColor: "bg-gray-100", iconBg: "bg-gray-500", buttonColor: "bg-gray-500 hover:bg-gray-600" }
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

  // Fetch categories and business counts from API
  useEffect(() => {
    const fetchCategories = async () => {
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
        
        if (ratingsData.success || ratingsData.data) {
          setRatings(ratingsData.data || []);
        }
        
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
          
          // Transform API data to match UI structure
          const transformedCategories = categoriesData.data.map((category, index) => {
            const count = businessCounts[category.category_name] || 0;
            return {
              id: category.cid,
              name: category.category_name,
              count: `${count} ${count === 1 ? 'business' : 'businesses'}`,
              description: `Explore ${category.category_name.toLowerCase()} businesses and services`,
              ...colorSchemes[index % colorSchemes.length]
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

  // Function to get banner image from media gallery
  const getBannerImage = (business) => {
    if (!business?.media_gallery) return null;
    
    try {
      // media_gallery is a comma-separated string of image paths
      const mediaArray = business.media_gallery.split(',');
      const firstImage = mediaArray[0]?.trim();
      
      if (firstImage) {
        return firstImage.startsWith('http') 
          ? firstImage 
          : `${baseurl}/${firstImage}`;
      }
    } catch (error) {
      console.error('Error parsing media gallery:', error);
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {showBusinesses ? `${selectedCategory?.name} Businesses` : 'Business Categories'}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            {showBusinesses ? `Discover ${selectedCategory?.name.toLowerCase()} businesses and services` : 'Discover businesses by category and industry'}
          </p>
          
          {/* Breadcrumb */}
          <div className="flex items-center mt-3 sm:mt-4 text-xs sm:text-sm">
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
              className="mt-3 sm:mt-4 flex items-center text-green-600 hover:text-green-700 font-medium text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </button>
          )}
        </div>

        {/* Controls */}
        {!showBusinesses && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input 
                type="text" 
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
            <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-red-500 hover:text-red-700 underline text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Business Cards View */}
        {!loading && !error && showBusinesses && (
          <>
            {/* Results count */}
            <div className="mb-4 sm:mb-6">
              <p className="text-gray-600 text-sm sm:text-base">
                Showing {totalItems} {totalItems === 1 ? 'business' : 'businesses'} in {selectedCategory?.name}
              </p>
            </div>

            {/* Business Grid - Same design as HomePage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {currentItems.map((business) => {
                // Get profile image
                const profileImageUrl = business?.business_profile_image
                  ? business.business_profile_image.startsWith('http')
                    ? business.business_profile_image
                    : `${baseurl}/${business.business_profile_image}`
                  : business?.Member?.profile_image
                  ? business.Member.profile_image.startsWith('http')
                    ? business.Member.profile_image
                    : `${baseurl}/${business.Member.profile_image}`
                  : '';

                // Get banner image from media gallery - FIXED: Use actual API data
                const bannerImageUrl = getBannerImage(business);
                
                const title = business?.company_name || 'Business';
                const subtitle = business?.business_type === 'salary' 
                  ? business?.designation || 'Professional'
                  : business?.business_type || (business?.Member?.first_name || 'Business');
                
                // Get real ratings data (matching HomePage approach)
                const { averageRating, reviewCount } = getBusinessRatings(business.id);
                const reviewsCount = reviewCount;
                const ratingValue = averageRating;
                
                return (
                  <div key={business.id} className="bg-white rounded-3xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
                    <Link to={`/details/${business.id}`}>
                      <div className="relative">
                        {/* Green header section with actual banner image */}
                        <div
                          className="h-24 sm:h-32 w-full bg-green-600 flex items-center justify-center bg-cover bg-no-repeat bg-center"
                          style={{
                            backgroundImage: bannerImageUrl 
                              ? `url(${bannerImageUrl})`
                              : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          }}
                        ></div>

                        {/* Avatar positioned on the left side between green and white sections */}
                        <div className="absolute left-4 sm:left-6 top-16 sm:top-20 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-md border-2 border-white z-10">
                          {profileImageUrl ? (
                            <img 
                              src={profileImageUrl} 
                              alt={title} 
                              className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-full" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-bold text-sm sm:text-lg">
                                {title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content section with left alignment */}
                        <div className="px-3 sm:px-4 pt-10 sm:pt-12 pb-3 text-left">
                          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2 text-left truncate">{title}</h3>
                          <p className="text-gray-600 text-sm sm:text-base mb-3 text-left truncate">{subtitle}</p>
                          
                          {/* Rating section */}
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

                          {/* Business info */}
                          <div className="text-gray-700 mb-3 sm:mb-4 text-left text-xs sm:text-sm">
                            Location: <span className="font-medium">{business?.city || business?.location || 'Not specified'}</span>
                          </div>
                          
                          <button className="inline-flex items-center px-4 sm:px-7 py-1.5 sm:py-2 rounded-full bg-green-600 text-white text-xs sm:text-sm font-medium hover:bg-green-700 transition">
                            View Details
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* No businesses found */}
            {currentItems.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 text-base sm:text-lg">No businesses found in this category</p>
                <button 
                  onClick={handleBackToCategories}
                  className="mt-2 text-green-600 hover:text-green-700 underline text-sm sm:text-base"
                >
                  Back to Categories
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-4 mb-6 sm:mb-8">
                {/* Results info */}
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} businesses
                </div>

                {/* Pagination buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-1">
                  {/* Mobile: Show only essential buttons */}
                  <div className="flex items-center gap-1 sm:hidden">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Prev
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage <= 2) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 1) {
                          pageNum = totalPages - 2 + i;
                        } else {
                          pageNum = currentPage - 1 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-xs border rounded-lg ${
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
                      className="px-3 py-2 text-xs border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>

                  {/* Desktop: Show full pagination */}
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                            className={`px-3 py-2 text-sm border rounded-lg ${
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
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
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

        {/* Categories Grid View */}
        {!loading && !error && !showBusinesses && (
          <>
            {/* Results count */}
            <div className="mb-4 sm:mb-6">
              <p className="text-gray-600 text-sm sm:text-base">
                Showing {categoryTotalItems} {categoryTotalItems === 1 ? 'category' : 'categories'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {currentCategoryItems.map((category) => (
                <div key={category.id} className={`${category.bgColor} rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200`}>
                  {/* Header */}
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600 text-xs sm:text-sm">{category.count}</p>
                      <div className={`${category.iconBg} text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium`}>
                        {category.count.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Explore Button */}
                  <button 
                    onClick={() => handleExploreCategory(category)}
                    className={`${category.buttonColor} text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 w-full sm:w-auto`}
                  >
                    Explore
                  </button>
                </div>
              ))}
            </div>

            {/* No Results */}
            {currentCategoryItems.length === 0 && searchTerm && (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 text-base sm:text-lg">No categories found matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-green-600 hover:text-green-700 underline text-sm sm:text-base"
                >
                  Clear search
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