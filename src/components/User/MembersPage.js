import React, { useEffect, useMemo, useState } from 'react';
import { Search, Users, MapPin, Phone, Mail, Building2, Star, Grid, List } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import baseurl from '../Baseurl/baseurl';
import { Link } from 'react-router-dom';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentUserId, setCurrentUserId] = useState(null);

  const [imageErrors, setImageErrors] = useState(new Set());

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
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseurl}/api/member/all`);
        const data = await res.json();
        if (data.success) {
          const membersData = Array.isArray(data.data) ? data.data : [];
          setMembers(membersData);
          // Debug: Log baseurl and sample member data
          console.log('Base URL:', baseurl);
          if (membersData.length > 0) {
            console.log('Sample member data:', membersData[0]);
            console.log('Sample profile image path:', membersData[0]?.profile_image);
          }
        } else {
          setError('Failed to load members');
        }
      } catch (e) {
        setError('Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // Function to construct proper image URL
  const getProfileImageUrl = (profileImage) => {
    if (!profileImage) return null;
    
    // If it's already a full URL
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    
    // If it starts with a slash, append to baseurl
    if (profileImage.startsWith('/')) {
      return `${baseurl}${profileImage}`;
    }
    
    // Otherwise, assume it's a relative path
    return `${baseurl}/${profileImage}`;
  };

  const filtered = useMemo(() => {
    let filteredMembers = members;
    
    // Filter out current user's profile (similar to HomePage business filter)
    if (currentUserId) {
      filteredMembers = filteredMembers.filter((m) => m.mid !== currentUserId);
    }
    
    // Search filter
    if (query) {
      const q = query.toLowerCase();
      filteredMembers = filteredMembers.filter((m) => {
        const first = (m.first_name || '').toLowerCase();
        const last = (m.last_name || '').toLowerCase();
        const full = `${first} ${last}`.trim();
        const kootam = (m.kootam || '').toLowerCase();
        const kovil = (m.kovil || '').toLowerCase();
        const phone = `${m.contact_no || ''} ${m.mobile_no || ''}`.toLowerCase();
        const businessNames = Array.isArray(m.BusinessProfiles)
          ? m.BusinessProfiles.map((b) => (b.company_name || '').toLowerCase()).join(' ')
          : '';
        return (
          first.includes(q) ||
          last.includes(q) ||
          full.includes(q) ||
          kootam.includes(q) ||
          kovil.includes(q) ||
          phone.includes(q) ||
          businessNames.includes(q)
        );
      });
    }

    // Sort by name
    filteredMembers.sort((a, b) => {
      return `${a.first_name || ''} ${a.last_name || ''}`.localeCompare(`${b.first_name || ''} ${b.last_name || ''}`);
    });

    return filteredMembers;
  }, [members, query, currentUserId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 pb-20 lg:pb-0">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
              Our Community Members
            </h1>
            <p className="text-green-100 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-4">
              Connect with fellow community members, discover businesses, and build meaningful relationships
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search members by name, business, kootam, kovil, phone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-5 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Controls */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {filtered.length} {filtered.length === 1 ? 'Member' : 'Members'} Found
              </h2>
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors self-start sm:self-auto"
                >
                  Clear Search
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-emerald-400 animate-pulse mx-auto"></div>
              </div>
              <p className="mt-6 text-gray-600 font-semibold text-lg">Loading members...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center mb-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map((m) => {
                  const profileImg = getProfileImageUrl(m.profile_image);
                  const businessCount = Array.isArray(m.BusinessProfiles) ? m.BusinessProfiles.length : 0;
                  const hasImageError = imageErrors.has(m.mid);
                  
                  return (
                    <div key={m.mid} className="bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden">
                      {/* Card Header with Gradient */}
                      <div className="h-20 sm:h-24 bg-gradient-to-r from-green-500 to-emerald-600 relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white p-0.5 sm:p-1 shadow-lg">
                              <div className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                {profileImg && !hasImageError ? (
                                  <img 
                                    src={profileImg} 
                                    alt={m.first_name} 
                                    className="w-full h-full object-cover"
                                    onError={() => {
                                      setImageErrors(prev => new Set([...prev, m.mid]));
                                    }}
                                    onLoad={() => {
                                      setImageErrors(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(m.mid);
                                        return newSet;
                                      });
                                    }}
                                  />
                                ) : null}
                                <span 
                                  className={`text-green-600 font-bold text-lg sm:text-xl ${profileImg && !hasImageError ? 'hidden' : 'flex'} items-center justify-center`}
                                >
                                  {(m.first_name || 'U').charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 text-white min-w-0">
                              <h3 className="text-base sm:text-lg font-bold truncate">{m.first_name} {m.last_name}</h3>
                              <p className="text-green-100 text-xs sm:text-sm truncate">{m.email || m.contact_no}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                          {(m.kootam || m.kovil) && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                              <span className="truncate">
                              {m.kootam ? `Kootam: ${m.kootam}` : ''}{m.kootam && m.kovil ? ' • ' : ''}{m.kovil ? `Kovil: ${m.kovil}` : ''}
                            </span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm sm:text-base font-medium text-gray-900">{businessCount}</p>
                                <p className="text-xs text-gray-500">Businesses</p>
                              </div>
                            </div>
                            
                            <Link 
                              to={`/member/${m.mid}`} 
                              className="px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs sm:text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filtered.map((m) => {
                  const profileImg = getProfileImageUrl(m.profile_image);
                  const businessCount = Array.isArray(m.BusinessProfiles) ? m.BusinessProfiles.length : 0;
                  const hasImageError = imageErrors.has(m.mid);
                  
                  return (
                    <div key={m.mid} className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 p-1 shadow-lg flex-shrink-0">
                          <div className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center">
                            {profileImg && !hasImageError ? (
                              <img 
                                src={profileImg} 
                                alt={m.first_name} 
                                className="w-full h-full object-cover"
                                onError={() => {
                                  setImageErrors(prev => new Set([...prev, m.mid]));
                                }}
                                onLoad={() => {
                                  setImageErrors(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(m.mid);
                                    return newSet;
                                  });
                                }}
                              />
                            ) : null}
                            <span 
                              className={`text-green-600 font-bold text-lg sm:text-2xl ${profileImg && !hasImageError ? 'hidden' : 'flex'} items-center justify-center`}
                            >
                              {(m.first_name || 'U').charAt(0)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                              <div className="min-w-0">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{m.first_name} {m.last_name}</h3>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                                  {m.email && (
                                    <div className="flex items-center gap-1 min-w-0">
                                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                      <span className="truncate">{m.email}</span>
                                    </div>
                                  )}
                                  {m.contact_no && (
                                    <div className="flex items-center gap-1 min-w-0">
                                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                      <span className="truncate">{m.contact_no}</span>
                                    </div>
                                  )}
                                </div>
                                {(m.kootam || m.kovil) && (
                                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                                    <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                    <span className="truncate">
                                      {m.kootam ? `Kootam: ${m.kootam}` : ''}{m.kootam && m.kovil ? ' • ' : ''}{m.kovil ? `Kovil: ${m.kovil}` : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="text-center">
                                  <div className="text-xl sm:text-2xl font-bold text-green-600">{businessCount}</div>
                                  <div className="text-xs text-gray-500">Businesses</div>
                                </div>
                                <Link 
                                  to={`/member/${m.mid}`} 
                                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm sm:text-base font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap"
                                >
                                  View Profile
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                );
              })}
            </div>
            )}
            
            {filtered.length === 0 && (
              <div className="text-center py-12 sm:py-20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No members found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">Try adjusting your search criteria or filters</p>
                <button
                  onClick={() => setQuery('')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                >
                  Clear Search
                </button>
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

export default MembersPage;