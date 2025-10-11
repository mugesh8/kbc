import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  User, Building2, Users, Edit3,
  Phone, Camera, Save, Plus,
  Eye, ExternalLink, Shield, CheckCircle,
  Trash2, ChevronDown, Video, File, X, CreditCard, Calendar,
  XCircle, MapPin
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import baseurl from '../Baseurl/baseurl';
import { useParams } from 'react-router-dom';

// BranchLocation component for managing multiple branches
const BranchLocation = ({ 
  branch, 
  index, 
  onUpdate, 
  onRemove,
  disabled
}) => {
  const handleChange = (field, value) => {
    onUpdate(index, field, value);
  };

  const handleNumericChange = (field, value) => {
    const digitsOnly = value.replace(/\D+/g, '');
    onUpdate(index, field, digitsOnly);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white relative mb-6">
      {index > 0 && !disabled && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-4 right-4 text-red-500 hover:text-red-600"
          aria-label="Remove branch"
        >
          <XCircle className="w-6 h-6" />
        </button>
      )}
      
      <h4 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-orange-600" />
        Branch {index + 1} {index === 0 && <span className="text-sm text-gray-500 ml-2">(Main Branch)</span>}
      </h4>

      <div className="space-y-6">
        {/* Branch Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Branch Name</label>
            <input
              placeholder="e.g., Head Office, Downtown Branch"
              value={branch.branchName || branch.branch_name || ''}
              onChange={(e) => handleChange('branch_name', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${disabled ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Contact Number</label>
            <input
              placeholder="Enter branch contact number"
              value={branch.workContact || branch.business_work_contract || ''}
              onChange={(e) => handleNumericChange('business_work_contract', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${disabled ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            placeholder="Enter branch email"
            type="email"
            value={branch.email || branch.businessEmail || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${disabled ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
          />
        </div>

        {/* Branch Address */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Complete Address</label>
          <textarea
            rows={3}
            placeholder="Enter complete branch address"
            value={branch.address || branch.company_address || ''}
            onChange={(e) => handleChange('company_address', e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${disabled ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
            style={{ resize: "vertical" }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              placeholder="City"
              value={branch.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${disabled ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              placeholder="State"
              value={branch.state || ''}
              onChange={(e) => handleChange('state', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${disabled ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Pin Code</label>
            <input
              placeholder="Pin Code"
              value={branch.zip_code || ''}
              onChange={(e) => handleNumericChange('zip_code', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${disabled ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { id } = useParams();
  const [editingSection, setEditingSection] = useState(null);

  // Branch management handlers
  const handleAddBranch = () => {
    setProfileData((prevData) => ({
      ...prevData,
      business: {
        ...prevData.business,
        branches: [
          ...(prevData.business.branches || []),
          {
            branch_name: "",
            business_work_contract: "",
            email: "",
            company_address: "",
            city: "",
            state: "",
            zip_code: ""
          }
        ]
      }
    }));
  };

  const handleUpdateBranch = (index, field, value) => {
    setProfileData((prevData) => {
      const updatedBranches = [...(prevData.business.branches || [])];
      updatedBranches[index] = {
        ...updatedBranches[index],
        [field]: value
      };
      
      return {
        ...prevData,
        business: {
          ...prevData.business,
          branches: updatedBranches
        }
      };
    });
  };

  const handleRemoveBranch = (index) => {
    setProfileData((prevData) => {
      const updatedBranches = [...(prevData.business.branches || [])];
      updatedBranches.splice(index, 1);
      
      return {
        ...prevData,
        business: {
          ...prevData.business,
          branches: updatedBranches
        }
      };
    });
  };

  const [profileData, setProfileData] = useState({
    personal: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      genderOther: '',
      maritalStatus: '',
      aadhaar: '',
      bloodGroup: '',
      alternativeContact: '',
      streetAddress: '',
      city: '',
      state: '',
      pinCode: '',
      website: '',
      linkedin: '',
      workPhone: '',
      extension: '',
      mobileNumber: '',
      preferredContact: '',
      secondaryEmail: '',
      emergencyContact: '',
      emergencyPhone: '',
      bestTimeToContact: '',
      personalWebsite: '',
      linkedinProfile: '',
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      kootam: '',
      kootamOther: '',
      kovil: '',
      kovilOther: '',
      Arakattalai: 'No',
      KNS_Member: 'No',
      KBN_Member: 'No',
      BNI: 'No',
      Rotary: 'No',
      Lions: 'No',
      Other_forum: '',
      hasReferral: false,
      referralName: '',
      referralCode: '',
      accessLevel: '',
      status: '',
      paidStatus: '',
      joinDate: '',
      createdAt: '',
      updatedAt: ''
    },
    business: {
      id: null,
      businessName: '',
      businessType: 'self-employed',
      registrationNumber: '',
      registrationNumberOther: '',
      // branches: [
      //   {
      //     branch_name: "Main Branch",
      //     business_work_contract: "",
      //     email: "",
      //     address: "",
      //     city: "",
      //     state: "",
      //     zip_code: ""
      //   }
      // ],
      startingYear: '',
      experience: '',
      businessAddress: '',
      businessPhone: '',
      businessEmail: '',
      staffSize: '',
      description: '',
      profileImage: null,
      profileImageFile: null,
      profileImageType: 'image',
      mediaGallery: [],
      mediaGalleryFiles: [],
      isNew: false,
      category_id: '',
      branchName: '',
      email: '',  
      city: '',
      state: '',
      zip_code: '',
      business_work_contract: '',
      source: '',
      tags: '',
      website: '',
      google_link: '',
      facebook_link: '',
      // Add branches array for multiple locations
      branches: [{
        branch_name: 'Main Branch',
        business_work_contract: '',
        email: '',
        company_address: '',
        city: '',
        state: '',
        zip_code: ''
      }],
      instagram_link: '',
      linkedin_link: '',
      designation: '',
      salary: '',
      location: '',
    },
    family: {
      fatherName: '',
      fatherContact: '',
      motherName: '',
      motherContact: '',
      spouseName: '',
      spouseContact: '',
      numberOfChildren: '',
      anniversaryDate: '',
      emergencyContact: '',
      childrenNames: '',
      familyAddress: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [memberId, setMemberId] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [businessProfiles, setBusinessProfiles] = useState([]);
  const [loadingBusiness, setLoadingBusiness] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const fileInputRef = useRef(null);

  // Media handling states
  const [removedMediaGallery, setRemovedMediaGallery] = useState([]);
  const profileImageInputRef = useRef(null);
  const mediaGalleryInputRef = useRef(null);

  // Media preview modal states
  const [mediaPreview, setMediaPreview] = useState({
    isOpen: false,
    media: null,
    type: 'image'
  });

  // Change password modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format relative time function
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Paid Status Badge Component
  const PaidStatusBadge = React.memo(({ status }) => {
    let bgColor = '';
    let textColor = '';
    let icon = null;

    switch (status?.toLowerCase()) {
      case 'paid':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        icon = <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
        break;
      case 'unpaid':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        icon = <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />;
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />;
    }

    return (
      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} flex items-center space-x-1`}>
        {icon}
        <span>{status || 'Unknown'}</span>
      </span>
    );
  });

  // Initialize member ID from URL params or localStorage
  useEffect(() => {
    const urlId = id;
    const storedId = localStorage.getItem('memberId');
    const memberData = JSON.parse(localStorage.getItem('memberData'));
    const storedMemberId = memberData?.mid || storedId;
    if (urlId) {
      setMemberId(urlId);
    } else if (storedMemberId) {
      setMemberId(storedMemberId);
    } else {
      setError('Member ID not found');
      setLoading(false);
    }
  }, [id]);
  
  // Fetch ratings data
  useEffect(() => {
    if (!memberId) return;
    
    const fetchRatings = async () => {
      try {
        const response = await fetch(`${baseurl}/api/ratings/all`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ratings: ${response.status}`);
        }
        
        const ratingsData = await response.json();
        
        if (ratingsData && ratingsData.data && Array.isArray(ratingsData.data)) {
          // Filter ratings for this member's businesses
          const memberBusinessIds = businessProfiles.map(business => business.id);
          const memberRatings = ratingsData.data.filter(rating => 
            memberBusinessIds.includes(rating.business_id) && 
            rating.status === 'approved'
          );
          
          setRatings(memberRatings);
          
          // Calculate average rating
          if (memberRatings.length > 0) {
            const total = memberRatings.reduce((sum, rating) => sum + rating.rating, 0);
            const avg = total / memberRatings.length;
            setAverageRating(Math.round(avg * 10) / 10); // Round to 1 decimal place
          }
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };
    
    if (businessProfiles.length > 0) {
      fetchRatings();
    }
  }, [memberId, businessProfiles]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseurl}/api/category/all`);
        if (!res.ok) {
          throw new Error(`Failed to fetch categories: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch profile data when memberId is available
  useEffect(() => {
    if (memberId) {
      fetchProfileData();
      fetchBusinessProfiles();
      fetchFamilyDetails();
    }
  }, [memberId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${baseurl}/api/member/${memberId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const data = await response.json();
      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          personal: transformPersonalApiData(data.data)
        }));
        if (data.data.profile_image) {
          setProfileImage(`${baseurl}/${data.data.profile_image}`);
        }
      }
    } catch (err) {
      setError('Failed to load profile data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/member/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch family details: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const memberData = data.data.find(member => member.mid === parseInt(memberId));
        if (memberData && memberData.MemberFamily) {
          // Normalize children names: handle raw string, JSON string, or array
          const rawChildren = memberData.MemberFamily.children_names;
          let childrenNames = '';
          if (Array.isArray(rawChildren)) {
            childrenNames = rawChildren.join(', ');
          } else if (typeof rawChildren === 'string') {
            try {
              const parsed = JSON.parse(rawChildren);
              childrenNames = Array.isArray(parsed) ? parsed.join(', ') : rawChildren;
            } catch {
              childrenNames = rawChildren;
            }
          }

          setProfileData(prev => ({
            ...prev,
            family: {
              fatherName: memberData.MemberFamily.father_name || '',
              fatherContact: memberData.MemberFamily.father_contact || '',
              motherName: memberData.MemberFamily.mother_name || '',
              motherContact: memberData.MemberFamily.mother_contact || '',
              spouseName: memberData.MemberFamily.spouse_name || '',
              spouseContact: memberData.MemberFamily.spouse_contact || '',
              numberOfChildren: memberData.MemberFamily.number_of_children || '',
              anniversaryDate: '',
              emergencyContact: '',
              childrenNames,
              familyAddress: memberData.MemberFamily.address || ''
            }
          }));
          return true;
        }
      }

      throw new Error('Family data not found in primary endpoint');
    } catch (err) {
      console.error('Failed to load family details from primary endpoint:', err);

      try {
        const fallbackResponse = await fetch(`${baseurl}/api/member/${memberId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!fallbackResponse.ok) {
          throw new Error('Fallback endpoint also failed');
        }

        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success && fallbackData.data.MemberFamily) {
          const rawChildren = fallbackData.data.MemberFamily.children_names;
          let childrenNames = '';
          if (Array.isArray(rawChildren)) {
            childrenNames = rawChildren.join(', ');
          } else if (typeof rawChildren === 'string') {
            try {
              const parsed = JSON.parse(rawChildren);
              childrenNames = Array.isArray(parsed) ? parsed.join(', ') : rawChildren;
            } catch {
              childrenNames = rawChildren;
            }
          }

          setProfileData(prev => ({
            ...prev,
            family: {
              fatherName: fallbackData.data.MemberFamily.father_name || '',
              fatherContact: fallbackData.data.MemberFamily.father_contact || '',
              motherName: fallbackData.data.MemberFamily.mother_name || '',
              motherContact: fallbackData.data.MemberFamily.mother_contact || '',
              spouseName: fallbackData.data.MemberFamily.spouse_name || '',
              spouseContact: fallbackData.data.MemberFamily.spouse_contact || '',
              numberOfChildren: fallbackData.data.MemberFamily.number_of_children || '',
              anniversaryDate: '',
              emergencyContact: '',
              childrenNames,
              familyAddress: fallbackData.data.MemberFamily.address || ''
            }
          }));
          return true;
        }
      } catch (fallbackErr) {
        console.error('Fallback endpoint also failed:', fallbackErr);

        setProfileData(prev => ({
          ...prev,
          family: {
            fatherName: '',
            fatherContact: '',
            motherName: '',
            motherContact: '',
            spouseName: '',
            spouseContact: '',
            numberOfChildren: '',
            anniversaryDate: '',
            emergencyContact: '',
            childrenNames: '',
            familyAddress: ''
          }
        }));
        return false;
      }
    }
  };

  const transformPersonalApiData = (apiData) => {
    let streetAddress = '';
    let city = '';
    let state = '';
    let pinCode = '';
    if (apiData.address) {
      streetAddress = apiData.address;
    }
    if (apiData.city) {
      city = apiData.city;
    }
    if (apiData.state) {
      state = apiData.state;
    }
    if (apiData.zip_code) {
      pinCode = apiData.zip_code;
    }
    if (!city && !state && !pinCode && apiData.address) {
      const addressParts = apiData.address.split(', ');
      if (addressParts.length >= 1) {
        streetAddress = addressParts[0];
      }
      if (addressParts.length >= 2) {
        city = addressParts[1];
      }
      if (addressParts.length >= 3) {
        const stateAndPin = addressParts[2].split(' ');
        if (stateAndPin.length >= 1) {
          state = stateAndPin[0];
        }
        if (stateAndPin.length >= 2) {
          pinCode = stateAndPin[1];
        }
      }
    }

    const predefinedGenders = ['Male', 'Female', 'Other'];
    const predefinedKootams = ['Agamudayar', 'Karkathar', 'Kallar', 'Maravar', 'Servai'];
    const predefinedKovils = ['Madurai Meenakshi Amman', 'Thanjavur Brihadeeswarar', 'Palani Murugan', 'Srirangam Ranganathar', 'Kanchipuram Kamakshi Amman'];

    let gender = apiData.gender || '';
    let genderOther = '';
    if (gender && !predefinedGenders.includes(gender)) {
      genderOther = gender;
      gender = 'Other';
    }

    let kootam = apiData.kootam || '';
    let kootamOther = '';
    if (kootam && !predefinedKootams.includes(kootam)) {
      kootamOther = kootam;
      kootam = 'Others';
    }

    let kovil = apiData.kovil || '';
    let kovilOther = '';
    if (kovil && !predefinedKovils.includes(kovil)) {
      kovilOther = kovil;
      kovil = 'Others';
    }

    const hasReferral = !!apiData.Referral;
    const referralName = apiData.Referral?.referral_name || '';
    const referralCode = apiData.Referral?.referral_code || '';
   
    return {
      fullName: `${apiData.first_name || ''} ${apiData.last_name || ''}`.trim(),
      email: apiData.email || '',
      phone: apiData.contact_no || '',
      dateOfBirth: apiData.dob || '',
      gender: gender,
      genderOther: genderOther,
      maritalStatus: apiData.marital_status || '',
      aadhaar: apiData.aadhar_no || '',
      bloodGroup: apiData.blood_group || '',
      alternativeContact: apiData.alternate_contact_no || '',
      streetAddress: streetAddress,
      city: city,
      state: state,
      pinCode: pinCode,
      website: apiData.personal_website || '',
      linkedin: apiData.linkedin_profile || '',
      workPhone: apiData.work_phone || '',
      extension: apiData.extension || '',
      mobileNumber: apiData.mobile_no || '',
      preferredContact: apiData.preferred_contact || '',
      secondaryEmail: apiData.secondary_email || '',
      emergencyContact: apiData.emergency_contact || '',
      emergencyPhone: apiData.emergency_phone || '',
      bestTimeToContact: apiData.best_time_to_contact || '',
      personalWebsite: apiData.personal_website || '',
      linkedinProfile: apiData.linkedin_profile || '',
      facebook: apiData.facebook || '',
      instagram: apiData.instagram || '',
      twitter: apiData.twitter || '',
      youtube: apiData.youtube || '',
      kootam: kootam,
      kootamOther: kootamOther,
      kovil: kovil,
      kovilOther: kovilOther,
      Arakattalai: apiData.Arakattalai || 'No',
      KNS_Member: apiData.KNS_Member || 'No',
      KBN_Member: apiData.KBN_Member || 'No',
      BNI: apiData.BNI || 'No',
      Rotary: apiData.Rotary || 'No',
      Lions: apiData.Lions || 'No',
      Other_forum: apiData.Other_forum || '',
      hasReferral: hasReferral,
      referralName: referralName,
      referralCode: referralCode,
      accessLevel: apiData.access_level || '',
      status: apiData.status || '',
      paidStatus: apiData.paid_status || 'Unpaid',
      joinDate: apiData.join_date || apiData.createdAt || '',
      createdAt: apiData.createdAt || '',
      updatedAt: apiData.updatedAt || '',
    };
  };


// const transformPersonalApiData = (apiData) => {
//   // Helper function to safely parse stringified arrays like ["value"]
//   const parseIfArrayString = (value) => {
//     try {
//       if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
//         const parsed = JSON.parse(value);
//         return Array.isArray(parsed) ? parsed : [parsed];
//       }
//       if (value === '[null]') return [];
//       return value ? [value] : [];
//     } catch (e) {
//       return value ? [value] : [];
//     }
//   };

//   // ✅ Parse array-like fields first
//   const parsedBranchName = parseIfArrayString(apiData.branch_name);
//   const parsedCity = parseIfArrayString(apiData.city);
//   const parsedState = parseIfArrayString(apiData.state);
//   const parsedZip = parseIfArrayString(apiData.zip_code);
//   const parsedEmail = parseIfArrayString(apiData.email);
//   const parsedContract = parseIfArrayString(apiData.business_work_contract);
//   const parsedLocation = parseIfArrayString(apiData.location);
//   const parsedCompanyAddress = parseIfArrayString(apiData.company_address);

//   // Address handling
//   let streetAddress = '';
//   let city = '';
//   let state = '';
//   let pinCode = '';

//   if (apiData.address) {
//     streetAddress = apiData.address;
//   }
//   if (parsedCity.length > 0) {
//     city = parsedCity[0];
//   } else if (apiData.city) {
//     city = apiData.city;
//   }
//   if (parsedState.length > 0) {
//     state = parsedState[0];
//   } else if (apiData.state) {
//     state = apiData.state;
//   }
//   if (parsedZip.length > 0) {
//     pinCode = parsedZip[0];
//   } else if (apiData.zip_code) {
//     pinCode = apiData.zip_code;
//   }

//   if (!city && !state && !pinCode && apiData.address) {
//     const addressParts = apiData.address.split(', ');
//     if (addressParts.length >= 1) {
//       streetAddress = addressParts[0];
//     }
//     if (addressParts.length >= 2) {
//       city = addressParts[1];
//     }
//     if (addressParts.length >= 3) {
//       const stateAndPin = addressParts[2].split(' ');
//       if (stateAndPin.length >= 1) {
//         state = stateAndPin[0];
//       }
//       if (stateAndPin.length >= 2) {
//         pinCode = stateAndPin[1];
//       }
//     }
//   }

//   // Predefined lists
//   const predefinedGenders = ['Male', 'Female', 'Other'];
//   const predefinedKootams = ['Agamudayar', 'Karkathar', 'Kallar', 'Maravar', 'Servai'];
//   const predefinedKovils = ['Madurai Meenakshi Amman', 'Thanjavur Brihadeeswarar', 'Palani Murugan', 'Srirangam Ranganathar', 'Kanchipuram Kamakshi Amman'];

//   let gender = apiData.gender || '';
//   let genderOther = '';
//   if (gender && !predefinedGenders.includes(gender)) {
//     genderOther = gender;
//     gender = 'Other';
//   }

//   let kootam = apiData.kootam || '';
//   let kootamOther = '';
//   if (kootam && !predefinedKootams.includes(kootam)) {
//     kootamOther = kootam;
//     kootam = 'Others';
//   }

//   let kovil = apiData.kovil || '';
//   let kovilOther = '';
//   if (kovil && !predefinedKovils.includes(kovil)) {
//     kovilOther = kovil;
//     kovil = 'Others';
//   }

//   const hasReferral = !!apiData.Referral;
//   const referralName = apiData.Referral?.referral_name || '';
//   const referralCode = apiData.Referral?.referral_code || '';

//   // ✅ Final transformed object
//   return {
//     fullName: `${apiData.first_name || ''} ${apiData.last_name || ''}`.trim(),
//     email: parsedEmail.length ? parsedEmail : (apiData.email ? [apiData.email] : []),
//     phone: apiData.contact_no || '',
//     dateOfBirth: apiData.dob || '',
//     gender: gender,
//     genderOther: genderOther,
//     maritalStatus: apiData.marital_status || '',
//     aadhaar: apiData.aadhar_no || '',
//     bloodGroup: apiData.blood_group || '',
//     alternativeContact: apiData.alternate_contact_no || '',
//     streetAddress: streetAddress,
//     city: parsedCity.length ? parsedCity : city,
//     state: parsedState.length ? parsedState : state,
//     pinCode: parsedZip.length ? parsedZip : pinCode,
//     branch_name: parsedBranchName,
//     company_address: parsedCompanyAddress,
//     business_work_contract: parsedContract,
//     location: parsedLocation,
//     website: apiData.personal_website || '',
//     linkedin: apiData.linkedin_profile || '',
//     workPhone: apiData.work_phone || '',
//     extension: apiData.extension || '',
//     mobileNumber: apiData.mobile_no || '',
//     preferredContact: apiData.preferred_contact || '',
//     secondaryEmail: apiData.secondary_email || '',
//     emergencyContact: apiData.emergency_contact || '',
//     emergencyPhone: apiData.emergency_phone || '',
//     bestTimeToContact: apiData.best_time_to_contact || '',
//     personalWebsite: apiData.personal_website || '',
//     linkedinProfile: apiData.linkedin_profile || '',
//     facebook: apiData.facebook || '',
//     instagram: apiData.instagram || '',
//     twitter: apiData.twitter || '',
//     youtube: apiData.youtube || '',
//     kootam: kootam,
//     kootamOther: kootamOther,
//     kovil: kovil,
//     kovilOther: kovilOther,
//     Arakattalai: apiData.Arakattalai || 'No',
//     KNS_Member: apiData.KNS_Member || 'No',
//     KBN_Member: apiData.KBN_Member || 'No',
//     BNI: apiData.BNI || 'No',
//     Rotary: apiData.Rotary || 'No',
//     Lions: apiData.Lions || 'No',
//     Other_forum: apiData.Other_forum || '',
//     hasReferral: hasReferral,
//     referralName: referralName,
//     referralCode: referralCode,
//     accessLevel: apiData.access_level || '',
//     status: apiData.status || '',
//     paidStatus: apiData.paid_status || 'Unpaid',
//     joinDate: apiData.join_date || apiData.createdAt || '',
//     createdAt: apiData.createdAt || '',
//     updatedAt: apiData.updatedAt || '',
//   };
// };

  const fetchBusinessProfiles = async () => {
    try {
      setLoadingBusiness(true);
      const response = await fetch(`${baseurl}/api/business-profile/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch business profiles: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const memberBusinessProfiles = data.data.filter(
          business => business.member_id === parseInt(memberId)
        );

        const predefinedRegistrationTypes = ['proprietor', 'partnership', 'Others'];

        const transformedBusinesses = memberBusinessProfiles.map(business => {
          // Normalize registration type from backend → UI values
          const rawReg = (business.business_registration_type || '').toString().trim();
          let registrationNumber = '';
          let registrationNumberOther = '';

          if (rawReg) {
            const lower = rawReg.toLowerCase();
            if (lower === 'proprietor') {
              registrationNumber = 'proprietor';
            } else if (lower === 'partnership') {
              registrationNumber = 'partnership';
            } else if (
              lower === 'private limited' ||
              lower === 'private_limited' ||
              lower === 'private-limited' ||
              lower === 'pvt ltd' ||
              lower === 'pvt. ltd' ||
              lower === 'pvt. ltd.' ||
              lower === 'pvtltd'
            ) {
              registrationNumber = 'private_limited';
            } else if (lower === 'others' || lower === 'other') {
              registrationNumber = 'Others';
            } else {
              // Custom value → treat as Others with an additional field
              registrationNumber = 'Others';
              registrationNumberOther = rawReg;
            }
          }

          // Parse media gallery - handle both images and videos
          let mediaGallery = [];
          if (business.media_gallery) {
            mediaGallery = business.media_gallery.split(',').map(item => {
              const url = item.trim();
              const isVideo = url.match(/\.(mp4|webm|ogg|mov|avi)$/i);
              return {
                url: url,
                type: isVideo ? 'video' : 'image',
                name: url.split('/').pop(),
                isNew: false
              };
            });
          }

          // Determine profile image type
          const profileImageUrl = business.business_profile_image || null;
          const isProfileVideo = profileImageUrl && profileImageUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i);

          return {
            id: business.id,
            businessName: business.company_name || '',
            businessType: business.business_type || 'self-employed',
            registrationNumber: registrationNumber,
            registrationNumberOther: registrationNumberOther,
            startingYear: business.business_starting_year || '',
            experience: business.experience || '',
            businessAddress: business.company_address || '',
            businessPhone: '',
            businessEmail: business.email || '',
            staffSize: business.staff_size || '',
            description: business.about || '',
            profileImage: profileImageUrl,
            profileImageType: isProfileVideo ? 'video' : 'image',
            profileImageFile: null,
            mediaGallery: mediaGallery,
            mediaGalleryFiles: [],
            branches: business.branches || [{
              branchName: business.branch_name || "Main Branch",
              workContact: business.business_work_contract || '',
              email: business.email || '',
              address: business.company_address || '',
              city: business.city || '',
              state: business.state || '',
              zip_code: business.zip_code || ''
            }],
            isNew: false,
            category_id: business.category_id || '',
            city: business.city || '',
            state: business.state || '',
            zip_code: business.zip_code || '',
            business_work_contract: business.business_work_contract || '',
            source: business.source || '',
            tags: business.tags || '',
            website: business.website || '',
            google_link: business.google_link || '',
            facebook_link: business.facebook_link || '',
            instagram_link: business.instagram_link || '',
            linkedin_link: business.linkedin_link || '',
            designation: business.designation || '',
            salary: business.salary || '',
            location: business.location || '',
          };
        });

        setBusinessProfiles(transformedBusinesses);

        if (transformedBusinesses.length > 0) {
          setSelectedBusinessId(transformedBusinesses[0].id);
          setProfileData(prev => ({
            ...prev,
            business: transformedBusinesses[0]
          }));
        } else {
          handleAddNewBusiness();
        }
      } else {
        setBusinessProfiles([]);
        handleAddNewBusiness();
      }
    } catch (err) {
      console.error('Failed to load business profiles:', err);
      setBusinessProfiles([]);
      handleAddNewBusiness();
    } finally {
      setLoadingBusiness(false);
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
  };

  // Enhanced media handling functions
  const handleProfileImageClick = () => {
    if (editingSection === 'business') {
      profileImageInputRef.current.click();
    } else if (profileData.business.profileImage) {
      openMediaPreview(profileData.business.profileImage, profileData.business.profileImageType);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isImage = file.type.startsWith('image/');

      if (!isImage) {
        setError('Please select an image file for profile picture');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        business: {
          ...prev.business,
          profileImage: previewUrl,
          profileImageFile: file,
          profileImageType: 'image'
        }
      }));
    }
  };

  const handleMediaGalleryAddClick = () => {
    if (editingSection === 'business') {
      mediaGalleryInputRef.current.click();
    }
  };

  const handleMediaGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map(file => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const previewUrl = URL.createObjectURL(file);

        return {
          file: file,
          url: previewUrl,
          type: isImage ? 'image' : (isVideo ? 'video' : 'file'),
          name: file.name,
          isNew: true
        };
      });

      setProfileData(prev => ({
        ...prev,
        business: {
          ...prev.business,
          mediaGallery: [...prev.business.mediaGallery, ...newFiles]
        }
      }));
    }
  };

  const handleRemoveMediaGalleryItem = (index) => {
    const item = profileData.business.mediaGallery[index];

    if (item.isNew) {
      URL.revokeObjectURL(item.url);
    } else {
      setRemovedMediaGallery(prev => [...prev, item.url]);
    }

    setProfileData(prev => ({
      ...prev,
      business: {
        ...prev.business,
        mediaGallery: prev.business.mediaGallery.filter((_, i) => i !== index)
      }
    }));
  };

  const handleRemoveProfileImage = () => {
    const currentProfileImage = profileData.business.profileImage;

    if (currentProfileImage && !currentProfileImage.startsWith('blob:')) {
      setRemovedMediaGallery(prev => [...prev, currentProfileImage]);
    } else if (currentProfileImage) {
      URL.revokeObjectURL(currentProfileImage);
    }

    setProfileData(prev => ({
      ...prev,
      business: {
        ...prev.business,
        profileImage: null,
        profileImageFile: null,
        profileImageType: 'image'
      }
    }));
  };

  // Media preview functions
  const openMediaPreview = (mediaUrl, mediaType) => {
    setMediaPreview({
      isOpen: true,
      media: mediaUrl.startsWith('blob:') ? mediaUrl : `${baseurl}/${mediaUrl}`,
      type: mediaType
    });
  };

  const closeMediaPreview = () => {
    setMediaPreview({
      isOpen: false,
      media: null,
      type: 'image'
    });
  };

  const MediaPreviewComponent = ({ media, onRemove, editable = false, onClick }) => {
    if (media.type === 'video') {
      return (
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
          <video
            src={media.url.startsWith('blob:') ? media.url : `${baseurl}/${media.url}`}
            className="w-full h-full object-cover"
            onClick={onClick}
          />
          {editable && (
            <>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1">
                <Video className="w-3 h-3" />
              </div>
            </>
          )}
          {!editable && (
            <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1">
              <Video className="w-3 h-3" />
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
          <img
            src={media.url.startsWith('blob:') ? media.url : `${baseurl}/${media.url}`}
            alt={media.name || 'Media'}
            className="w-full h-full object-cover"
            onClick={onClick}
          />
          {editable && (
            <>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                <Camera className="w-3 h-3" />
              </div>
            </>
          )}
          {!editable && (
            <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
              <Camera className="w-3 h-3" />
            </div>
          )}
        </div>
      );
    }
  };

  // CORRECTED handleSave function
  const handleSave = async (section) => {
    try {
      setLoading(true);
      setError('');
      if (!memberId) {
        throw new Error('Member ID is missing');
      }
  
      if (section === 'business') {
        const businessData = profileData.business;
          const apiData = {
          business_type: businessData.businessType,
          company_name: businessData.businessName,
          // Persist registration type per backend rules:
          // - For known types keep normalized string
          // - For Others, send the custom text from registrationNumberOther
          business_registration_type:
            businessData.registrationNumber === 'Others'
              ? (businessData.registrationNumberOther || 'Others')
              : (businessData.registrationNumber === 'private_limited'
                  ? 'Private Limited'
                  : (businessData.registrationNumber || '')),
          business_starting_year: businessData.startingYear,
          experience: businessData.experience,
          branch_name: businessData.branchName,
          company_address: businessData.businessAddress,
          email: businessData.businessEmail,
          staff_size: businessData.staffSize,
            // Only include about for non-salary types
            ...(businessData.businessType !== 'salary' ? { about: businessData.description } : {}),
          category_id: businessData.category_id,
          city: businessData.city,
          state: businessData.state,
          zip_code: businessData.zip_code,
          business_work_contract: businessData.business_work_contract,
          source: businessData.source,
          tags: businessData.tags,
          website: businessData.website,
          google_link: businessData.google_link,
          facebook_link: businessData.facebook_link,
          instagram_link: businessData.instagram_link,
          linkedin_link: businessData.linkedin_link,
          designation: businessData.designation,
          salary: businessData.salary,
            // location intentionally omitted from UI for salary; keep if preexisting
            location: businessData.location,
          // Add branches data to API payload
          branches: businessData.branches || [{
            branch_name: businessData.branchName || "",
            business_work_contract: businessData.business_work_contract || "",
            email: businessData.businessEmail || "",
            company_address: businessData.businessAddress || "",
            city: businessData.city || "",
            state: businessData.state || "",
            zip_code: businessData.zip_code || ""
          }]
        };
        const formData = new FormData();
        formData.append('business_profile', JSON.stringify(apiData));
  
        if (businessData.profileImageFile) {
          formData.append('profile_image', businessData.profileImageFile);
        }
        businessData.mediaGallery.forEach((media) => {
          if (media.isNew && media.file) {
            formData.append('media_gallery', media.file);
          }
        });
        if (removedMediaGallery.length > 0) {
          formData.append('removed_media', JSON.stringify(removedMediaGallery));
        }
        let url, method;
        if (businessData.id) {
          url = `${baseurl}/api/business-profile/update/${businessData.id}`;
          method = 'PUT';
        } else {
          url = `${baseurl}/api/business-profile/${memberId}`;
          method = 'POST';
          formData.append('business_profiles', JSON.stringify([apiData]));
        }
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.message || `Server returned ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setRemovedMediaGallery([]);
          setSuccess('Business information updated successfully');
          setEditingSection(null);
          fetchBusinessProfiles();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error(result.message || 'Update failed');
        }
      } else if (section === 'personal') {
        const apiData = prepareDataForApi('personal', profileData.personal);
  
        const response = await fetch(`${baseurl}/api/member/update/${memberId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(apiData)
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.message || `Server returned ${response.status}`);
        }
  
        const result = await response.json();
  
        if (result.success) {
          setSuccess('Personal information updated successfully');
          setEditingSection(null);
          fetchProfileData(); // Refetch to get the latest data
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error(result.message || 'Update failed');
        }
      } else if (section === 'family') {
        const family = profileData.family;
        const maritalStatus = (profileData.personal.maritalStatus || '').toLowerCase();

        const numberOfChildrenParsed = parseInt(family.numberOfChildren, 10);
        // Convert UI string → array (handles both raw arrays and string)
        let childrenArray = [];
        if (Array.isArray(family.childrenNames)) {
          childrenArray = family.childrenNames.map((n) => `${n}`.trim()).filter((n) => n.length > 0);
        } else if (typeof family.childrenNames === 'string') {
          try {
            const parsed = JSON.parse(family.childrenNames);
            if (Array.isArray(parsed)) {
              childrenArray = parsed.map((n) => `${n}`.trim()).filter((n) => n.length > 0);
            } else {
              childrenArray = family.childrenNames.split(',').map((n) => n.trim()).filter((n) => n.length > 0);
            }
          } catch {
            childrenArray = family.childrenNames.split(',').map((n) => n.trim()).filter((n) => n.length > 0);
          }
        }

        const payload = {
          member_id: parseInt(memberId, 10),
          father_name: family.fatherName || null,
          father_contact: family.fatherContact || null,
          mother_name: family.motherName || null,
          mother_contact: family.motherContact || null,
          address: family.familyAddress || null,
          marital_status: maritalStatus,
        };

        if (maritalStatus === 'married') {
          payload.spouse_name = family.spouseName || null;
          payload.spouse_contact = family.spouseContact || null;
          payload.number_of_children = isNaN(numberOfChildrenParsed) ? 0 : numberOfChildrenParsed;
          if (payload.number_of_children > 0) {
            payload.children_names = childrenArray;
          }
        }

        const response = await fetch(`${baseurl}/api/family-details/update/${memberId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData?.message || `Server returned ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setSuccess('Family details updated successfully');
          setEditingSection(null);
          await fetchFamilyDetails();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error(result.message || 'Update failed');
        }
      }
  
    } catch (err) {
      setError(err.message);
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepareDataForApi = (section, data) => {
    if (section === 'personal') {
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const gender = data.gender === 'Other' ? data.genderOther : data.gender;
      const kootam = data.kootam === 'Others' ? data.kootamOther : data.kootam;
      const kovil = data.kovil === 'Others' ? data.kovilOther : data.kovil;

      const apiData = {
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        contact_no: data.phone,
        dob: data.dateOfBirth,
        gender: gender,
        marital_status: data.maritalStatus,
        blood_group: data.bloodGroup,
        alternate_contact_no: data.alternativeContact,
        address: data.streetAddress,
        city: data.city,
        state: data.state,
        zip_code: data.pinCode,
        personal_website: data.website,
        linkedin_profile: data.linkedin,
        work_phone: data.workPhone,
        extension: data.extension,
        mobile_no: data.mobileNumber,
        preferred_contact: data.preferredContact,
        secondary_email: data.secondaryEmail,
        emergency_contact: data.emergencyContact,
        emergency_phone: data.emergencyPhone,
        best_time_to_contact: data.bestTimeToContact,
        facebook: data.facebook,
        instagram: data.instagram,
        twitter: data.twitter,
        youtube: data.youtube,
        kootam: kootam,
        kovil: kovil,
        access_level: data.accessLevel,
        status: data.status,
        paid_status: data.paidStatus,
        // Aadhaar information
        aadhaar: data.aadhaar,
        aadhar_no: data.aadhaar || data.aadhar_no, // Map both fields to ensure compatibility
        // Forum membership fields
        Arakattalai: data.Arakattalai,
        KNS_Member: data.KNS_Member,
        KBN_Member: data.KBN_Member,
        BNI: data.BNI,
        Rotary: data.Rotary,
        Lions: data.Lions,
        Other_forum: data.Other_forum
      };

      Object.keys(apiData).forEach(key => {
        if (apiData[key] === '' || apiData[key] === null || apiData[key] === undefined) {
          delete apiData[key];
        }
      });

      return apiData;
    }
    return data;
  };

  const handleCancel = () => {
    setEditingSection(null);
    fetchProfileData();
    fetchBusinessProfiles();
    fetchFamilyDetails();
    setRemovedMediaGallery([]);
  };

  const handleInputChange = useCallback((section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }, []);

  // Memoized handlers
  const personalHandlers = useMemo(() => ({
    fullName: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, fullName: value } })),
    email: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, email: value } })),
    phone: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, phone: value } })),
    dateOfBirth: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, dateOfBirth: value } })),
    gender: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, gender: value } })),
    genderOther: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, genderOther: value } })),
    maritalStatus: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, maritalStatus: value } })),
    kootam: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, kootam: value } })),
    kootamOther: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, kootamOther: value } })),
    kovil: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, kovil: value } })),
    kovilOther: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, kovilOther: value } })),
    Arakattalai: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, Arakattalai: value } })),
    KNS_Member: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, KNS_Member: value } })),
    KBN_Member: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, KBN_Member: value } })),
    BNI: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, BNI: value } })),
    Rotary: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, Rotary: value } })),
    Lions: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, Lions: value } })),
    Other_forum: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, Other_forum: value } })),
    status: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, status: value } })),
    accessLevel: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, accessLevel: value } })),
    paidStatus: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, paidStatus: value } })),
    streetAddress: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, streetAddress: value } })),
    city: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, city: value } })),
    state: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, state: value } })),
    pinCode: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, pinCode: value } })),
    alternativeContact: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, alternativeContact: value } })),
    aadhaar: (value) => setProfileData(prev => ({ 
      ...prev, 
      personal: { 
        ...prev.personal, 
        aadhaar: value,
        aadhar_no: value // Sync both fields
      } 
    })),
    aadhar_no: (value) => setProfileData(prev => ({ 
      ...prev, 
      personal: { 
        ...prev.personal, 
        aadhar_no: value,
        aadhaar: value // Sync both fields
      } 
    })),
    bloodGroup: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, bloodGroup: value } })),
    mobileNumber: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, mobileNumber: value } })),
    preferredContact: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, preferredContact: value } })),
    secondaryEmail: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, secondaryEmail: value } })),
    emergencyContact: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, emergencyContact: value } })),
    emergencyPhone: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, emergencyPhone: value } })),
    bestTimeToContact: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, bestTimeToContact: value } })),
    website: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, website: value } })),
    linkedin: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, linkedin: value } })),
    personalWebsite: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, personalWebsite: value } })),
    linkedinProfile: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, linkedinProfile: value } })),
    facebook: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, facebook: value } })),
    instagram: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, instagram: value } })),
    twitter: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, twitter: value } })),
    youtube: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, youtube: value } })),
    Arakattalai: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, Arakattalai: value } })),
    KNS_Member: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, KNS_Member: value } })),
    KBN_Member: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, KBN_Member: value } })),
    BNI: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, BNI: value } })),
    Rotary: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, Rotary: value } })),
    Lions: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, Lions: value } })),
    Other_forum: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, Other_forum: value } })),
    pro: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, pro: value } })),
    paidStatus: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, paidStatus: value } })),
    referralName: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, referralName: value } })),
    referralCode: (value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, referralCode: value } }))
  }), []);

  const businessHandlers = useMemo(() => ({
    businessName: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, businessName: value } })),
    category_id: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, category_id: value } })),
    designation: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, designation: value } })),
    businessEmail: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, businessEmail: value } })),
    salary: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, salary: value } })),
    location: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, location: value } })),
    experience: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, experience: value } })),
    registrationNumber: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, registrationNumber: value } })),
    registrationNumberOther: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, registrationNumberOther: value } })),
    startingYear: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, startingYear: value } })),
    staffSize: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, staffSize: value } })),
    description: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, description: value } })),
    businessAddress: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, businessAddress: value } })),
    city: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, city: value } })),
    state: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, state: value } })),
    zip_code: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, zip_code: value } })),
    business_work_contract: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, business_work_contract: value } })),
    tags: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, tags: value } })),
    website: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, website: value } })),
    google_link: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, google_link: value } })),
    facebook_link: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, facebook_link: value } })),
    instagram_link: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, instagram_link: value } })),
    linkedin_link: (value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, linkedin_link: value } }))
  }), []);

  const familyHandlers = useMemo(() => ({
    fatherName: (value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, fatherName: value } })),
    fatherContact: (value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, fatherContact: value } })),
    motherName: (value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, motherName: value } })),
    motherContact: (value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, motherContact: value } })),
    spouseName: (value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, spouseName: value } })),
    spouseContact: (value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, spouseContact: value } })),
    numberOfChildren: (value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, numberOfChildren: value } })),
    anniversaryDate: (value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, anniversaryDate: value } })),
    emergencyContact: (value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, emergencyContact: value } })),
    childrenNames: (value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, childrenNames: value } })),
    familyAddress: (value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, familyAddress: value } }))
  }), []);

  const InputField = React.memo(({ label, value, onChange, type = "text", required = false, disabled = false }) => {
    const [localValue, setLocalValue] = React.useState(value);
    const inputRef = React.useRef(null);

    React.useEffect(() => {
      if (value !== localValue && document.activeElement !== inputRef.current) {
        setLocalValue(value);
      }
    }, [value]);

    const handleChange = (e) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
    };

    const handleBlur = () => {
      if (localValue !== value) {
        onChange(localValue);
      }
    };

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={inputRef}
          type={type}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${disabled ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
        />
      </div>
    );
  });

  const SelectField = React.memo(({ label, value, onChange, options, disabled = false }) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${disabled ? 'bg-gray-50 text-gray-600' : 'bg-white'
          }`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  ));

  const StatusBadge = React.memo(({ status }) => {
    let bgColor = '';
    let textColor = '';
    switch (status?.toLowerCase()) {
      case 'approved':
        bgColor = 'bg-green-500';
        textColor = 'text-white';
        break;
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'rejected':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status || 'Unknown'}
      </span>
    );
  });

  const AccessLevelBadge = React.memo(({ level }) => {
    let bgColor = '';
    let textColor = '';
    switch (level?.toLowerCase()) {
      case 'basic':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'premium':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'admin':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {level || 'Basic'}
      </span>
    );
  });

  const isPersonalEditing = editingSection === 'personal';
  const isPersonalDisabled = !isPersonalEditing;

  const PersonalFormSection = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
      <InputField
        label="Full Name"
        value={profileData.personal.fullName}
        onChange={personalHandlers.fullName}
        disabled={isPersonalDisabled}
        required
      />
      <InputField
        label="Email"
        value={profileData.personal.email}
        onChange={personalHandlers.email}
        disabled={isPersonalDisabled}
        type="email"
        required
      />
      <InputField
        label="Phone Number"
        value={profileData.personal.phone}
        onChange={personalHandlers.phone}
        disabled={isPersonalDisabled}
        required
      />
      <InputField
        label="Date of Birth"
        value={profileData.personal.dateOfBirth}
        onChange={personalHandlers.dateOfBirth}
        disabled={isPersonalDisabled}
        type="date"
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Gender</label>
        <select
          value={profileData.personal.gender}
          onChange={(e) => personalHandlers.gender(e.target.value)}
          disabled={isPersonalDisabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${isPersonalDisabled ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {profileData.personal.gender === 'Other' && isPersonalEditing && (
        <InputField
          label="Specify Gender"
          value={profileData.personal.genderOther}
          onChange={personalHandlers.genderOther}
          disabled={isPersonalDisabled}
        />
      )}

      <SelectField
        label="Marital Status"
        value={profileData.personal.maritalStatus}
        onChange={personalHandlers.maritalStatus}
        options={['Single', 'Married', 'Divorced', 'Widowed']}
        disabled={isPersonalDisabled}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Kootam</label>
        <select
          value={profileData.personal.kootam}
          onChange={(e) => personalHandlers.kootam(e.target.value)}
          disabled={isPersonalDisabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${isPersonalDisabled ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
        >
          <option value="">Select Kootam</option>
          <option value="Agamudayar">Agamudayar</option>
          <option value="Karkathar">Karkathar</option>
          <option value="Kallar">Kallar</option>
          <option value="Maravar">Maravar</option>
          <option value="Servai">Servai</option>
          <option value="Others">Others</option>
        </select>
      </div>

      {profileData.personal.kootam === 'Others' && isPersonalEditing && (
        <InputField
          label="Specify Kootam"
          value={profileData.personal.kootamOther}
          onChange={personalHandlers.kootamOther}
          disabled={isPersonalDisabled}
        />
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Kovil</label>
        <select
          value={profileData.personal.kovil}
          onChange={(e) => personalHandlers.kovil(e.target.value)}
          disabled={isPersonalDisabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${isPersonalDisabled ? 'bg-gray-50 text-gray-600' : 'bg-white'
            }`}
        >
          <option value="">Select Kovil</option>
          <option value="Madurai Meenakshi Amman">Madurai Meenakshi Amman</option>
          <option value="Thanjavur Brihadeeswarar">Thanjavur Brihadeeswarar</option>
          <option value="Palani Murugan">Palani Murugan</option>
          <option value="Srirangam Ranganathar">Srirangam Ranganathar</option>
          <option value="Kanchipuram Kamakshi Amman">Kanchipuram Kamakshi Amman</option>
          <option value="Others">Others</option>
        </select>
      </div>

      {profileData.personal.kovil === 'Others' && isPersonalEditing && (
        <InputField
          label="Specify Kovil"
          value={profileData.personal.kovilOther}
          onChange={personalHandlers.kovilOther}
          disabled={isPersonalDisabled}
        />
      )}

      <SelectField
        label="Status"
        value={profileData.personal.status}
        onChange={personalHandlers.status}
        options={['Approved', 'Pending', 'Rejected']}
        disabled={isPersonalDisabled}
      />
      <SelectField
        label="Access Level"
        value={profileData.personal.accessLevel}
        onChange={personalHandlers.accessLevel}
        options={['Basic', 'Premium', 'Admin']}
        disabled={isPersonalDisabled}
      />
      <SelectField
        label="Paid Status"
        value={profileData.personal.paidStatus}
        onChange={personalHandlers.paidStatus}
        options={['Paid', 'Unpaid']}
        disabled={isPersonalDisabled}
      />
    </div>
  ), [profileData.personal, isPersonalEditing, isPersonalDisabled, personalHandlers]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);
      uploadProfileImage(file);
    }
  };

  const uploadProfileImage = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('profile_image', file);

      const response = await fetch(`${baseurl}/api/member/update/${memberId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile image');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Profile image updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(result.message || 'Image upload failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Image upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleBusinessSelect = (businessId) => {
    if (businessId === 'new') {
      handleAddNewBusiness();
      return;
    }

    const business = businessProfiles.find(b => b.id === parseInt(businessId));
    if (business) {
      setSelectedBusinessId(business.id);
      setProfileData(prev => ({
        ...prev,
        business: business
      }));
      setEditingSection(null);
    }
  };

  const handleAddNewBusiness = () => {
    const newBusiness = {
      id: null,
      businessName: '',
      businessType: 'self-employed',
      registrationNumber: '',
      registrationNumberOther: '',
      startingYear: '',
      experience: '',
      businessAddress: '',
      businessPhone: '',
      businessEmail: '',
      staffSize: '',
      description: '',
      profileImage: null,
      profileImageFile: null,
      profileImageType: 'image',
      mediaGallery: [],
      mediaGalleryFiles: [],
      isNew: true,
      category_id: '',
      city: '',
      state: '',
      zip_code: '',
      business_work_contract: '',
      source: '',
      tags: '',
      website: '',
      google_link: '',
      facebook_link: '',
      instagram_link: '',
      linkedin_link: '',
      designation: '',
      salary: '',
      location: '',
    };

    setProfileData(prev => ({
      ...prev,
      business: newBusiness
    }));
    setSelectedBusinessId('new');
    setEditingSection('business');
  };

  const handleDeleteBusiness = async (businessId) => {
    if (!window.confirm('Are you sure you want to delete this business profile?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/api/business-profile/delete/${businessId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete business profile');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Business profile deleted successfully');
        fetchBusinessProfiles();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    if (passwordError) setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/api/member/change-password/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to change password');
      }

      const result = await response.json();
      if (result.success) {
        setPasswordSuccess('Password changed successfully');
        setTimeout(() => {
          setShowChangePasswordModal(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        throw new Error(result.message || 'Password change failed');
      }
    } catch (err) {
      setPasswordError(err.message);
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  const closePasswordModal = () => {
    setShowChangePasswordModal(false);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  if (loading && !profileData.personal.fullName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error && !memberId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4">My Profile</h1>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
                {success}
              </div>
            )}
            <div className="bg-white/10 rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white/80">Member Since</p>
                  <p className="text-sm sm:text-lg font-bold text-white">
                    {formatDate(profileData.personal.joinDate || profileData.personal.createdAt) || 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white/80">Businesses</p>
                  <p className="text-sm sm:text-lg font-bold text-white">{businessProfiles.length} Verified</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white/80">Rating</p>
                  <p className="text-sm sm:text-lg font-bold text-white">
                    {averageRating > 0 ? `${averageRating.toFixed(1)} ⭐` : 'No ratings'}
                    {ratings.length > 0 && <span className="text-xs ml-1">({ratings.length})</span>}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white/80">Last Updated</p>
                  <p className="text-sm sm:text-lg font-bold text-white">
                    {formatRelativeTime(profileData.personal.updatedAt) || 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white/80">Payment Status</p>
                  <div className="flex justify-center mt-1">
                    <PaidStatusBadge status={profileData.personal.paidStatus} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-20 lg:pb-8">
        {/* Personal Details Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 sm:px-6 py-4 border-b border-green-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Personal Details</h2>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <StatusBadge status={profileData.personal.status} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <AccessLevelBadge level={profileData.personal.accessLevel} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <PaidStatusBadge status={profileData.personal.paidStatus} />
                  </div>
                </div>
                <button
                  onClick={() => editingSection === 'personal' ? handleSave('personal') : handleEdit('personal')}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 border-2 border-green-500 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                  disabled={loading}
                >
                  {loading && editingSection === 'personal' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                  ) : editingSection === 'personal' ? (
                    <Save className="w-4 h-4" />
                  ) : (
                    <Edit3 className="w-4 h-4" />
                  )}
                  <span className="text-xs sm:text-sm font-medium">
                    {editingSection === 'personal' ? 'Save' : 'Edit'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {PersonalFormSection}

            <div className="mt-6 space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-blue-600">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left">
                <InputField
                  label="Street Address"
                  value={profileData.personal.streetAddress}
                  onChange={personalHandlers.streetAddress}
                  disabled={isPersonalDisabled}
                />
                <InputField
                  label="City"
                  value={profileData.personal.city}
                  onChange={personalHandlers.city}
                  disabled={isPersonalDisabled}
                />
                <InputField
                  label="State"
                  value={profileData.personal.state}
                  onChange={personalHandlers.state}
                  disabled={isPersonalDisabled}
                />
                <InputField
                  label="Pin Code"
                  value={profileData.personal.pinCode}
                  onChange={personalHandlers.pinCode}
                  disabled={isPersonalDisabled}
                />
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-blue-600 mb-4 sm:mb-5">
                Additional Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
                <InputField
                  label="Aadhaar Number"
                  value={profileData.personal.aadhaar}
                  onChange={personalHandlers.aadhaar}
                  disabled={editingSection !== 'personal'}
                />
                <InputField
                  label="Blood Group"
                  value={profileData.personal.bloodGroup}
                  onChange={personalHandlers.bloodGroup}
                  disabled={editingSection !== 'personal'}
                />
                <InputField
                  label="Alternative Contact"
                  value={profileData.personal.alternativeContact}
                  onChange={personalHandlers.alternativeContact}
                  disabled={editingSection !== 'personal'}
                />
                <InputField
                  label="Secondary Email"
                  value={profileData.personal.secondaryEmail}
                  onChange={personalHandlers.secondaryEmail}
                  disabled={editingSection !== 'personal'}
                  type="email"
                />
                <InputField
                  label="Emergency Contact Name"
                  value={profileData.personal.emergencyContact}
                  onChange={personalHandlers.emergencyContact}
                  disabled={editingSection !== 'personal'}
                />
                <InputField
                  label="Emergency Contact Number"
                  value={profileData.personal.emergencyPhone}
                  onChange={personalHandlers.emergencyPhone}
                  disabled={editingSection !== 'personal'}
                />
                <SelectField
                  label="Best Time to Contact"
                  value={profileData.personal.bestTimeToContact}
                  onChange={personalHandlers.bestTimeToContact}
                  options={['Business Hours (9 AM - 5 PM)', 'Morning (6 AM - 12 PM)', 'Afternoon (12 PM - 6 PM)', 'Evening (6 PM - 10 PM)', 'Anytime']}
                  disabled={editingSection !== 'personal'}
                />
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-blue-600 mb-4">Social Media Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left">
                <InputField
                  label="Website"
                  value={profileData.personal.website}
                  onChange={personalHandlers.website}
                  disabled={editingSection !== 'personal'}
                />
                <InputField
                  label="LinkedIn"
                  value={profileData.personal.linkedin}
                  onChange={personalHandlers.linkedin}
                  disabled={editingSection !== 'personal'}
                />
                <InputField
                  label="Personal Website"
                  value={profileData.personal.personalWebsite}
                  onChange={personalHandlers.personalWebsite}
                  disabled={editingSection !== 'personal'}
                />
                <InputField
                  label="LinkedIn Profile"
                  value={profileData.personal.linkedinProfile}
                  onChange={personalHandlers.linkedinProfile}
                  disabled={editingSection !== 'personal'}
                />
                <InputField
                  label="Facebook"
                  value={profileData.personal.facebook}
                  onChange={personalHandlers.facebook}
                  disabled={editingSection !== 'personal'}
                />
                <InputField
                  label="Instagram"
                  value={profileData.personal.instagram}
                  onChange={personalHandlers.instagram}
                  disabled={editingSection !== 'personal'}
                />
                <InputField
                  label="Twitter"
                  value={profileData.personal.twitter}
                  onChange={personalHandlers.twitter}
                  disabled={editingSection !== 'personal'}
                />
                <InputField
                  label="YouTube"
                  value={profileData.personal.youtube}
                  onChange={personalHandlers.youtube}
                  disabled={editingSection !== 'personal'}
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-blue-600">Forum Memberships</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Arakattalai</label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={profileData.personal.Arakattalai === 'Yes'}
                        onChange={(e) => personalHandlers.Arakattalai(e.target.checked ? 'Yes' : 'No')}
                        disabled={editingSection !== 'personal'}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">KNS Member</label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={profileData.personal.KNS_Member === 'Yes'}
                        onChange={(e) => personalHandlers.KNS_Member(e.target.checked ? 'Yes' : 'No')}
                        disabled={editingSection !== 'personal'}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">KBN Member</label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={profileData.personal.KBN_Member === 'Yes'}
                        onChange={(e) => personalHandlers.KBN_Member(e.target.checked ? 'Yes' : 'No')}
                        disabled={editingSection !== 'personal'}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">BNI</label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={profileData.personal.BNI === 'Yes'}
                        onChange={(e) => personalHandlers.BNI(e.target.checked ? 'Yes' : 'No')}
                        disabled={editingSection !== 'personal'}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Rotary</label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={profileData.personal.Rotary === 'Yes'}
                        onChange={(e) => personalHandlers.Rotary(e.target.checked ? 'Yes' : 'No')}
                        disabled={editingSection !== 'personal'}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Lions</label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={profileData.personal.Lions === 'Yes'}
                        onChange={(e) => personalHandlers.Lions(e.target.checked ? 'Yes' : 'No')}
                        disabled={editingSection !== 'personal'}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <InputField
                  label="Other Forum"
                  value={profileData.personal.Other_forum}
                  onChange={personalHandlers.Other_forum}
                  disabled={editingSection !== 'personal'}
                />
              </div>
            </div>

            {profileData.personal.hasReferral && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-blue-600 mb-4">Referral Information</h3>
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <InputField
                      label="Referral Name"
                      value={profileData.personal.referralName}
                      onChange={personalHandlers.referralName}
                      disabled
                    />
                    <InputField
                      label="Referral Code"
                      value={profileData.personal.referralCode}
                      onChange={personalHandlers.referralCode}
                      disabled
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg sm:text-2xl">
                    {profileData.personal.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Profile Picture</h3>
                <button
                  onClick={triggerFileInput}
                  className="mt-2 flex items-center space-x-2 bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Change Photo</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {editingSection === 'personal' && (
              <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => handleSave('personal')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Personal'}
                </button>
                <button
                  onClick={handleCancel}
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="border-2 border-blue-500 text-blue-500 hover:bg-blue-50 px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Change Password
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Business Details Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 sm:px-6 py-4 border-b border-orange-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Business Details</h2>
                </div>
              </div>
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => editingSection === 'business' ? handleSave('business') : handleEdit('business')}
                  className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                  disabled={loading}
                >
                  {loading && editingSection === 'business' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  ) : editingSection === 'business' ? (
                    <Save className="w-4 h-4" />
                  ) : (
                    <Edit3 className="w-4 h-4" />
                  )}
                  <span className="text-xs sm:text-sm font-medium">
                    {editingSection === 'business' ? 'Save' : 'Edit'}
                  </span>
                </button>
                <button
                  onClick={handleAddNewBusiness}
                  className="flex items-center space-x-1 sm:space-x-2 bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">Add New</span>
                </button>
              </div>
            </div>
          </div>

          {businessProfiles.length > 0 && (
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <label className="text-sm font-medium text-gray-700">Select Business:</label>
                <div className="relative">
                  <select
                    value={selectedBusinessId || ''}
                    onChange={(e) => handleBusinessSelect(e.target.value)}
                    className="appearance-none w-full sm:w-64 bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {businessProfiles.map(business => (
                      <option key={business.id} value={business.id}>
                        {business.businessName} ({business.businessType})
                      </option>
                    ))}
                    <option value="new">+ Add New Business</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6">
            {loadingBusiness ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <>
                <h3 className="text-base sm:text-lg font-bold text-orange-600 mb-4">
                  {profileData.business.isNew ? 'New Business' : 'Primary Business'}
                </h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">Business Type</label>
                  <div className="flex flex-wrap gap-4">
                    {['self-employed', 'business', 'salary'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="businessType"
                          value={type}
                          checked={profileData.business.businessType === type}
                          onChange={() => handleInputChange('business', 'businessType', type)}
                          disabled={editingSection !== 'business'}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {type.replace('-', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
                  <InputField
                    label="Business Name"
                    value={profileData.business.businessName}
                    onChange={businessHandlers.businessName}
                    disabled={editingSection !== 'business'}
                  />

                  <SelectField
                    label="Category"
                    value={profileData.business.category_id}
                    onChange={businessHandlers.category_id}
                    options={categories.map(cat => ({ value: cat.cid, label: cat.category_name }))}
                    disabled={editingSection !== 'business'}
                  />

                  {profileData.business.businessType === 'salary' ? (
                    <>
                      <InputField
                        label="Designation"
                        value={profileData.business.designation}
                        onChange={businessHandlers.designation}
                        disabled={editingSection !== 'business'}
                      />
                      {/* <InputField
                        label="Business Email"
                        value={profileData.business.businessEmail}
                        onChange={businessHandlers.businessEmail}
                        disabled={editingSection !== 'business'}
                      /> */}
                      <InputField
                        label="Salary"
                        value={profileData.business.salary}
                        onChange={businessHandlers.salary}
                        disabled={editingSection !== 'business'}
                      />
                      <InputField
                        label="Experience (years)"
                        value={profileData.business.experience}
                        onChange={businessHandlers.experience}
                        disabled={editingSection !== 'business'}
                      />
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Business Registration Type</label>
                        <select
                          value={profileData.business.registrationNumber === 'Others'
                            ? 'Others'
                            : (profileData.business.registrationNumber || '').toString().toLowerCase()}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Keep exact options for select; store normalized in state
                            if (value === 'Others') {
                              businessHandlers.registrationNumber('Others');
                            } else {
                              businessHandlers.registrationNumber(value); // 'proprietor' | 'partnership'
                            }
                          }}
                          disabled={editingSection !== 'business'}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${editingSection !== 'business' ? 'bg-gray-50 text-gray-600' : 'bg-white'
                            }`}
                        >
                          <option value="">Select Registration Type</option>
                          <option value="proprietor">Proprietor</option>
                          <option value="partnership">Partnership</option>
                          <option value="private_limited">Private Limited</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>

                      {profileData.business.registrationNumber === 'Others' && editingSection === 'business' && (
                        <InputField
                          label="Specify Registration Type"
                          value={profileData.business.registrationNumberOther}
                          onChange={businessHandlers.registrationNumberOther}
                          disabled={editingSection !== 'business'}
                        />
                      )}


                      {/* <InputField
                        label="Business Email"
                        value={profileData.business.businessEmail}
                        onChange={businessHandlers.businessEmail}
                        disabled={editingSection !== 'business'}
                      /> */}
                      <InputField
                        label="Staff Size"
                        value={profileData.business.staffSize}
                        onChange={businessHandlers.staffSize}
                        disabled={editingSection !== 'business'}
                      />
                      <InputField
                        label="Experience (years)"
                        value={profileData.business.experience}
                        onChange={businessHandlers.experience}
                        disabled={editingSection !== 'business'}
                      />
                    </>
                  )}
                </div>

                <div className="mt-6 space-y-4 text-left">
                  {profileData.business.businessType !== 'salary' && (
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        About Business
                      </label>
                      <textarea
                        value={profileData.business.description}
                        onChange={(e) => businessHandlers.description(e.target.value)}
                        disabled={editingSection !== 'business'}
                        rows={3}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${editingSection !== 'business' ? 'bg-gray-50 text-gray-600' : 'bg-white'
                          }`}
                      />
                    </div>
                  )}

                  {/* <InputField
                    label={profileData.business.businessType === 'salary' ? 'Office Address' : 'Business Address'}
                    value={profileData.business.businessAddress}
                    onChange={businessHandlers.businessAddress}
                    disabled={editingSection !== 'business'}
                  /> */}

                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <InputField
                      label="City"
                      value={profileData.business.city}
                      onChange={businessHandlers.city}
                      disabled={editingSection !== 'business'}
                    />
                    <InputField
                      label="State"
                      value={profileData.business.state}
                      onChange={businessHandlers.state}
                      disabled={editingSection !== 'business'}
                    />
                    <InputField
                      label="Pin Code"
                      value={profileData.business.zip_code}
                      onChange={businessHandlers.zip_code}
                      disabled={editingSection !== 'business'}
                    />
                    {profileData.business.businessType !== 'salary' && (
                      <InputField
                        label="Business Work Contact"
                        value={profileData.business.business_work_contract}
                        onChange={businessHandlers.business_work_contract}
                        disabled={editingSection !== 'business'}
                      />
                    )}
                  </div> */}

                  {/* Branch Locations Section */}
                  <div className="mt-8">
                    <h4 className="text-base sm:text-lg font-semibold text-orange-600 mb-4">Branch Locations</h4>
                    
                    {/* Branch List */}
                    {profileData.business.branches && profileData.business.branches.map((branch, index) => (
                      <BranchLocation
                        key={index}
                        branch={branch}
                        index={index}
                        onUpdate={handleUpdateBranch}
                        onRemove={handleRemoveBranch}
                        disabled={editingSection !== 'business'}
                      />
                    ))}
                    
                    {/* Add Branch Button */}
                    {editingSection === 'business' && (
                      <button
                        type="button"
                        onClick={handleAddBranch}
                        className="mt-4 flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add Another Branch</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-6">
                    <h4 className="text-base sm:text-lg font-semibold text-blue-600 mb-4 mt-5 text-center">Social Media & Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <InputField
                        label="Tags (comma separated)"
                        value={profileData.business.tags}
                        onChange={businessHandlers.tags}
                        disabled={editingSection !== 'business'}
                      />
                      <InputField
                        label="Website"
                        value={profileData.business.website}
                        onChange={businessHandlers.website}
                        disabled={editingSection !== 'business'}
                      />
                      <InputField
                        label="Google Link"
                        value={profileData.business.google_link}
                        onChange={businessHandlers.google_link}
                        disabled={editingSection !== 'business'}
                      />
                      <InputField
                        label="Facebook Link"
                        value={profileData.business.facebook_link}
                        onChange={businessHandlers.facebook_link}
                        disabled={editingSection !== 'business'}
                      />
                      <InputField
                        label="Instagram Link"
                        value={profileData.business.instagram_link}
                        onChange={businessHandlers.instagram_link}
                        disabled={editingSection !== 'business'}
                      />
                      <InputField
                        label="LinkedIn Link"
                        value={profileData.business.linkedin_link}
                        onChange={businessHandlers.linkedin_link}
                        disabled={editingSection !== 'business'}
                      />
                    </div>
                  </div>
                </div>

                {/* Enhanced Media Section for Images and Videos */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 text-left">
                    {profileData.business.businessType === 'salary' ? 'Professional Media' : 'Business Media'}
                  </h4>

                  {/* Profile Image Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {profileData.business.businessType === 'salary' ? 'Profile Photo' : 'Business Profile Image'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {profileData.business.profileImage ? (
                        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                          <img
                            src={profileData.business.profileImage.startsWith('blob:')
                              ? profileData.business.profileImage
                              : `${baseurl}/${profileData.business.profileImage}`}
                            alt={profileData.business.businessType === 'salary' ? 'Professional Photo' : 'Business Logo'}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => openMediaPreview(profileData.business.profileImage, 'image')}
                          />
                          {editingSection === 'business' && (
                            <>
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-opacity"
                                  onClick={handleRemoveProfileImage}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                                <Camera className="w-3 h-3" />
                              </div>
                            </>
                          )}
                          {!editingSection === 'business' && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                              <Camera className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                          <span className="text-sm">No {profileData.business.businessType === 'salary' ? 'Profile' : 'Logo'}</span>
                        </div>
                      )}

                      {editingSection === 'business' && (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => profileImageInputRef.current.click()}
                            className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <Camera className="w-4 h-4" />
                            <span className="text-sm">Upload Image</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Media Gallery Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Media Gallery (Images & Videos)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {profileData.business.mediaGallery.map((media, index) => (
                        <MediaPreviewComponent
                          key={index}
                          media={media}
                          onRemove={() => handleRemoveMediaGalleryItem(index)}
                          editable={editingSection === 'business'}
                          onClick={() => openMediaPreview(media.url, media.type)}
                        />
                      ))}

                      {editingSection === 'business' && (
                        <div
                          className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50"
                          onClick={handleMediaGalleryAddClick}
                        >
                          <div className="text-center">
                            <Plus className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                            <span className="text-sm text-gray-500">Add Media</span>
                            <p className="text-xs text-gray-400 mt-1">Images & Videos</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {editingSection === 'business' && profileData.business.mediaGallery.length === 0 && (
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        No media files added. Click "Add Media" to upload images or videos.
                      </p>
                    )}
                  </div>

                  {/* Hidden file inputs */}
                  <input
                    type="file"
                    ref={profileImageInputRef}
                    onChange={handleProfileImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={mediaGalleryInputRef}
                    onChange={handleMediaGalleryChange}
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                  />
                </div>

                {editingSection === 'business' && (
                  <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                    <button
                      onClick={() => handleSave('business')}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Business'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    {!profileData.business.isNew && (
                      <button
                        onClick={() => handleDeleteBusiness(profileData.business.id)}
                        className="border-2 border-red-500 text-red-500 hover:bg-red-50 px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors flex items-center text-sm sm:text-base"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-1 sm:mr-2" />
                        Delete
                      </button>
                    )}
                    <button className="border-2 border-blue-500 text-blue-500 hover:bg-blue-50 px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base">
                      <Eye className="w-4 h-4 inline mr-1 sm:mr-2" />
                      View Public
                    </button>
                    <button className="border-2 border-purple-500 text-purple-500 hover:bg-purple-50 px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base">
                      <ExternalLink className="w-4 h-4 inline mr-1 sm:mr-2" />
                      Manage Listings
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Family Details Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 sm:px-6 py-4 border-b border-purple-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Family Details</h2>
                </div>
              </div>
              <button
                onClick={() => editingSection === 'family' ? handleSave('family') : handleEdit('family')}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 border-2 border-purple-500 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading && editingSection === 'family' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                ) : editingSection === 'family' ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <Edit3 className="w-4 h-4" />
                )}
                <span className="text-xs sm:text-sm font-medium">
                  {editingSection === 'family' ? 'Save' : 'Edit'}
                </span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left">
              <InputField
                label="Father Name"
                value={profileData.family.fatherName}
                onChange={familyHandlers.fatherName}
                disabled={editingSection !== 'family'}
              />
              <InputField
                label="Father Contact"
                value={profileData.family.fatherContact}
                onChange={familyHandlers.fatherContact}
                disabled={editingSection !== 'family'}
              />
              <InputField
                label="Mother Name"
                value={profileData.family.motherName}
                onChange={familyHandlers.motherName}
                disabled={editingSection !== 'family'}
              />
              <InputField
                label="Mother Contact"
                value={profileData.family.motherContact}
                onChange={familyHandlers.motherContact}
                disabled={editingSection !== 'family'}
              />
              <InputField
                label="Spouse Name"
                value={profileData.family.spouseName}
                onChange={familyHandlers.spouseName}
                disabled={editingSection !== 'family'}
              />
              <InputField
                label="Spouse Contact"
                value={profileData.family.spouseContact}
                onChange={familyHandlers.spouseContact}
                disabled={editingSection !== 'family'}
              />
              <InputField
                label="Number of Children"
                value={profileData.family.numberOfChildren}
                onChange={familyHandlers.numberOfChildren}
                disabled={editingSection !== 'family'}
              />
              
              
              <InputField
                label="Children Names"
                value={profileData.family.childrenNames}
                onChange={familyHandlers.childrenNames}
                disabled={editingSection !== 'family'}
              />
            </div>

            <div className="mt-6 text-left">
              <InputField
                label="Family Address"
                value={profileData.family.familyAddress}
                onChange={familyHandlers.familyAddress}
                disabled={editingSection !== 'family'}
              />
            </div>

            {editingSection === 'family' && (
              <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => handleSave('family')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Family'}
                </button>
                <button
                  onClick={handleCancel}
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Preview Modal */}
      {mediaPreview.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            <button
              onClick={closeMediaPreview}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="bg-black rounded-lg overflow-hidden">
              {mediaPreview.type === 'video' ? (
                <video
                  src={mediaPreview.media}
                  className="w-full h-auto max-h-[80vh]"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={mediaPreview.media}
                  alt="Preview"
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={closeMediaPreview}
                className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {passwordSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <MobileFooter />
    </div>
  );
};
export default ProfilePage;