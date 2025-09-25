import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, Phone, Mail, MapPin, Building2, Users, Heart, Shield, 
  Award, Clock, Globe, ChevronDown, ChevronUp, Star, Briefcase,
  Calendar, Home, MessageCircle, ExternalLink, ArrowLeft
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import baseurl from '../Baseurl/baseurl';

const MemberDetailsPage = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personalInfo: true,
    contactInfo: false,
    familyInfo: false,
    businesses: true,
    culturalInfo: false
  });

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseurl}/api/member/${id}`);
        const data = await res.json();
        if (data.success) {
          setMember(data.data);
        } else {
          setError('Failed to load member');
        }
      } catch (e) {
        setError('Failed to load member');
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fixed profile image URL construction
  const getProfileImageUrl = () => {
    if (!member?.profile_image) return null;
    
    let imagePath = member.profile_image;
    
    // Remove any leading slashes to avoid double slashes in URL
    if (imagePath.startsWith('/')) {
      imagePath = imagePath.substring(1);
    }
    
    // Construct the full URL
    return `${baseurl}/${imagePath}`;
  };

  const profileImg = getProfileImageUrl();
  const family = member?.MemberFamily || member?.family;
  const businesses = member?.BusinessProfiles || member?.businesses || [];

  // Helper function to format children names
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

  // Collapsible Card Component
  const CollapsibleCard = ({ title, isExpanded, onToggle, icon: Icon, children, gradient = false }) => {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
        <button
          onClick={onToggle}
          className={`w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between transition-all duration-300 ${
            gradient ? 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100' : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50'
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {Icon && (
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-md">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            )}
            <h3 className="font-bold text-base sm:text-lg text-gray-800">{title}</h3>
          </div>
          <div className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-green-100 rotate-180' : 'bg-gray-100'}`}>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
          </div>
        </button>
        {isExpanded && (
          <div className="border-t border-gray-100">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 pb-20 lg:pb-0">
      <Header />
      
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link 
            to="/members" 
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Members</span>
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
                <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-emerald-400 animate-pulse mx-auto"></div>
              </div>
              <p className="mt-6 text-gray-600 font-semibold text-lg">Loading member details...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center mb-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && member && (
          <>
            {/* Enhanced Hero Section - ALL LEFT ALIGNED */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden mb-6 sm:mb-8">
              {/* Mobile Layout - Left Aligned */}
              <div className="block sm:hidden">
                {/* Green Background */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-20 relative">
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                
                {/* Profile Content - Left Aligned */}
                <div className="relative px-4 pb-6 -mt-8">
                  {/* Profile Image - Left Aligned */}
                  <div className="flex justify-start mb-4">
                    <div className="relative">
                      <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-2xl">
                        <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                          {profileImg && !imageError ? (
                            <img 
                              src={profileImg} 
                              alt={member.first_name} 
                              className="w-full h-full object-cover"
                              onError={() => setImageError(true)}
                            />
                          ) : (
                            <div className="flex items-center justify-center">
                              <User className="w-10 h-10 text-green-600" />
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Status indicator */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Member Info - Left Aligned */}
                  <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                      {member.first_name} {member.last_name}
                    </h1>
                    <div className="flex flex-col gap-2 items-start">
                      {member.email && (
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                          {member.email}
                        </span>
                      )}
                      {member.contact_no && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                          {member.contact_no}
                        </span>
                      )}
                      {(member.kootam || member.kovil) && (
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                          {member.kootam || member.kovil}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop/Tablet Layout - Left Aligned */}
              <div className="hidden sm:block">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-32 relative">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex flex-row items-end gap-6">
                      {/* Profile Image */}
                      <div className="relative">
                        <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-2xl sm:rounded-3xl p-1 shadow-2xl">
                          <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                            {profileImg && !imageError ? (
                              <img 
                                src={profileImg} 
                                alt={member.first_name} 
                                className="w-full h-full object-cover"
                                onError={() => setImageError(true)}
                              />
                            ) : (
                              <div className="flex items-center justify-center">
                                <User className="w-12 h-12 text-green-600" />
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Status indicator */}
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      {/* Member Info - Left Aligned */}
                      <div className="flex-1 text-left text-white min-w-0">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-lg">
                          {member.first_name} {member.last_name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          {member.email && (
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium text-sm border border-white/30">
                              {member.email}
                            </span>
                          )}
                          {member.contact_no && (
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium text-sm border border-white/30">
                              {member.contact_no}
                            </span>
                          )}
                          {(member.kootam || member.kovil) && (
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium text-sm border border-white/30">
                              {member.kootam || member.kovil}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid - Left Aligned */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Personal Information - Left Aligned */}
                <CollapsibleCard
                  title="Personal Information"
                  isExpanded={expandedSections.personalInfo}
                  onToggle={() => toggleSection('personalInfo')}
                  icon={User}
                  gradient={true}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block text-sm sm:text-base">Full Name</span>
                          <p className="text-gray-600 text-sm sm:text-base">{member.first_name} {member.last_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <Calendar className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block">Date of Birth</span>
                          <p className="text-gray-600">{member.dob || 'Not available'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block">Gender</span>
                          <p className="text-gray-600">{member.gender || 'Not available'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-pink-100 rounded-lg flex-shrink-0">
                          <Heart className="w-4 h-4 text-pink-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block">Marital Status</span>
                          <p className="text-gray-600">{member.marital_status || 'Not available'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                          <Shield className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block">Blood Group</span>
                          <p className="text-gray-600">{member.blood_group || 'Not available'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                          <Award className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block">Access Level</span>
                          <div className="mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.access_level?.toLowerCase() === 'admin' ? 'bg-red-100 text-red-800' :
                              member.access_level?.toLowerCase() === 'premium' ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {member.access_level || 'Basic'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                          <Shield className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block">Status</span>
                          <div className="mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' :
                              member.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              member.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleCard>

                {/* Contact Information - Left Aligned */}
                <CollapsibleCard
                  title="Contact Information"
                  isExpanded={expandedSections.contactInfo}
                  onToggle={() => toggleSection('contactInfo')}
                  icon={Phone}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block">Primary Contact</span>
                          {member.contact_no ? (
                            <a href={`tel:${member.contact_no}`} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">
                              {member.contact_no}
                            </a>
                          ) : (
                            <p className="text-gray-600">Not available</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block">Mobile Number</span>
                          {member.mobile_no ? (
                            <a href={`tel:${member.mobile_no}`} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">
                              {member.mobile_no}
                            </a>
                          ) : (
                            <p className="text-gray-600">Not available</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                          <Mail className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block">Email Address</span>
                          <p className="text-gray-600 break-words">{member.email || 'Not available'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                          <Phone className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block">Alternative Contact</span>
                          {member.alternate_contact_no ? (
                            <a href={`tel:${member.alternate_contact_no}`} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">
                              {member.alternate_contact_no}
                            </a>
                          ) : (
                            <p className="text-gray-600">Not available</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
                          <Briefcase className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block">Work Phone</span>
                          {member.work_phone ? (
                            <a href={`tel:${member.work_phone}`} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">
                              {member.work_phone}
                            </a>
                          ) : (
                            <p className="text-gray-600">Not available</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-cyan-100 rounded-lg flex-shrink-0">
                          <Clock className="w-4 h-4 text-cyan-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block">Best Time to Contact</span>
                          <p className="text-gray-600">{member.best_time_to_contact || 'Not available'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleCard>

                {/* Businesses - Left Aligned */}
                <CollapsibleCard
                  title={`Businesses (${businesses.length})`}
                  isExpanded={expandedSections.businesses}
                  onToggle={() => toggleSection('businesses')}
                  icon={Building2}
                >
                  {Array.isArray(businesses) && businesses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {businesses.map((b) => (
                        <div key={b.id} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-lg transition-all duration-300">
                          <div className="flex flex-col gap-2 sm:gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{b.company_name}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 mb-2">{b.business_type || b.designation || ''}</p>
                              {b.business_type && (
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {b.business_type}
                                </span>
                              )}
                            </div>
                            <div className="flex justify-start">
                              <Link 
                                to={`/details/${b.id}`} 
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-left py-6 sm:py-8">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center">
                          <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm sm:text-base">No businesses listed</p>
                          <p className="text-gray-400 text-xs sm:text-sm mt-1">This member hasn't added any business information yet.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CollapsibleCard>
              </div>

              {/* Right Column - Sidebar - Left Aligned */}
              <div className="space-y-4 sm:space-y-6">
                {/* Family Information - Left Aligned */}
                <CollapsibleCard
                  title="Family Information"
                  isExpanded={expandedSections.familyInfo}
                  onToggle={() => toggleSection('familyInfo')}
                  icon={Users}
                >
                  {family ? (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-green-800 text-left border-b pb-2">Parents</h4>
                        {family.father_name && (
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-gray-800">Father: </span>
                              <span className="text-gray-600">{family.father_name}</span>
                            </div>
                          </div>
                        )}
                        {family.father_contact && (
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-gray-800">Father Contact: </span>
                              <a href={`tel:${family.father_contact}`} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">
                                {family.father_contact}
                              </a>
                            </div>
                          </div>
                        )}
                        {family.mother_name && (
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-gray-800">Mother: </span>
                              <span className="text-gray-600">{family.mother_name}</span>
                            </div>
                          </div>
                        )}
                        {family.mother_contact && (
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-gray-800">Mother Contact: </span>
                              <a href={`tel:${family.mother_contact}`} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">
                                {family.mother_contact}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-green-800 text-left border-b pb-2">Spouse & Children</h4>
                        {family.spouse_name && (
                          <div className="flex items-start gap-2">
                            <Heart className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-gray-800">Spouse: </span>
                              <span className="text-gray-600">{family.spouse_name}</span>
                            </div>
                          </div>
                        )}
                        {family.spouse_contact && (
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-gray-800">Spouse Contact: </span>
                              <a href={`tel:${family.spouse_contact}`} className="text-green-700 hover:text-green-800 underline-offset-2 hover:underline">
                                {family.spouse_contact}
                              </a>
                            </div>
                          </div>
                        )}
                        {typeof family.number_of_children === 'number' && (
                          <div className="flex items-start gap-2">
                            <Users className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-gray-800">Children: </span>
                              <span className="text-gray-600">{family.number_of_children}</span>
                            </div>
                          </div>
                        )}
                        {family.children_names && (
                          <div className="flex items-start gap-2">
                            <Users className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-gray-800">Children Names: </span>
                              <span className="text-gray-600">{formatChildrenNames(family.children_names)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {family.address && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-gray-800">Family Address: </span>
                              <span className="text-gray-600">{family.address}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-left py-6 sm:py-8">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center">
                          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm sm:text-base">No family information available</p>
                          <p className="text-gray-400 text-xs sm:text-sm mt-1">Family details haven't been added yet.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CollapsibleCard>

                {/* Cultural Information - Left Aligned */}
                <CollapsibleCard
                  title="Cultural Information"
                  isExpanded={expandedSections.culturalInfo}
                  onToggle={() => toggleSection('culturalInfo')}
                  icon={Building2}
                >
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0">
                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-gray-800 block text-sm sm:text-base">Kootam</span>
                        <p className="text-gray-600 text-sm sm:text-base">{member.kootam || 'Not available'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                        <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-gray-800 block text-sm sm:text-base">Kovil</span>
                        <p className="text-gray-600 text-sm sm:text-base">{member.kovil || 'Not available'}</p>
                      </div>
                    </div>
                    {member.aadhar_no && (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-gray-800 block text-sm sm:text-base">Aadhaar Number</span>
                          <p className="text-gray-600 text-sm sm:text-base">{member.aadhar_no}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleCard>
              </div>
            </div>
          </>
        )}
      </div>
      
      <Footer />
      <MobileFooter />
    </div>
  );
};

export default MemberDetailsPage;