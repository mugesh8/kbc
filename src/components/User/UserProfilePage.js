import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  User, Building2, Users, Edit3,
  Phone, Camera, Save, Plus,
  Eye, ExternalLink, Shield, CheckCircle,
  Trash2, ChevronDown
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import baseurl from '../Baseurl/baseurl';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
  const { id } = useParams();
  const [editingSection, setEditingSection] = useState(null);
  
  // Debug: Log when component re-renders
  // console.log('ProfilePage re-rendered', { editingSection, timestamp: Date.now() });
  const [profileData, setProfileData] = useState({
    personal: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      genderOther: '', // For custom gender input
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
      kootamOther: '', // For custom kootam input
      kovil: '',
      kovilOther: '', // For custom kovil input
      hasReferral: false,
      referralName: '',
      referralCode: '',
      accessLevel: '',
      status: ''
    },
    business: {
      id: null,
      businessName: '',
      businessType: 'self-employed',
      registrationNumber: '',
      registrationNumberOther: '', // For custom registration type
      startingYear: '',
      experience: '',
      businessAddress: '',
      businessPhone: '',
      businessEmail: '',
      staffSize: '',
      description: '',
      profileImage: null,
      mediaGallery: [],
      isNew: false,
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
  const fileInputRef = useRef(null);
  
  // Image handling states
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [newMediaGallery, setNewMediaGallery] = useState([]);
  const [removedMediaGallery, setRemovedMediaGallery] = useState([]);
  const profileImageInputRef = useRef(null);
  const mediaGalleryInputRef = useRef(null);
  
  // Change password modal states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
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
      // First, try the new endpoint that returns all members
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
        // Find the current member in the data array
        const memberData = data.data.find(member => member.mid === parseInt(memberId));
        if (memberData && memberData.MemberFamily) {
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
              anniversaryDate: '', // This field is not in the provided MemberFamily
              emergencyContact: '', // This field is not in the provided MemberFamily
              childrenNames: memberData.MemberFamily.children_names || '',
              familyAddress: memberData.MemberFamily.address || ''
            }
          }));
          return true;
        }
      }
      
      // If we reach here, try the fallback endpoint
      throw new Error('Family data not found in primary endpoint');
    } catch (err) {
      console.error('Failed to load family details from primary endpoint:', err);
      
      // Try fallback endpoint
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
              anniversaryDate: '', // This field is not in the provided MemberFamily
              emergencyContact: '', // This field is not in the provided MemberFamily
              childrenNames: fallbackData.data.MemberFamily.children_names || '',
              familyAddress: fallbackData.data.MemberFamily.address || ''
            }
          }));
          return true;
        }
      } catch (fallbackErr) {
        console.error('Fallback endpoint also failed:', fallbackErr);
        
        // If both endpoints fail, initialize with empty family data
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
    
    // Check for custom values
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
    
    // Check for referral data
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
      hasReferral: hasReferral,
      referralName: referralName,
      referralCode: referralCode,
      accessLevel: apiData.access_level || '',
      status: apiData.status || ''
    };
  };
  
  const fetchBusinessProfiles = async () => {
    try {
      setLoadingBusiness(true);
      // Try the primary endpoint first
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
        // Filter businesses by member_id
        const memberBusinessProfiles = data.data.filter(
          business => business.member_id === parseInt(memberId)
        );
        
        const predefinedRegistrationTypes = ['proprietor', 'partnership', 'Others'];
        
        const transformedBusinesses = memberBusinessProfiles.map(business => {
          let registrationNumber = business.business_registration_type || '';
          let registrationNumberOther = '';
          
          if (registrationNumber && !predefinedRegistrationTypes.includes(registrationNumber)) {
            registrationNumberOther = registrationNumber;
            registrationNumber = 'Others';
          }
          
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
            profileImage: business.business_profile_image || null,
            mediaGallery: business.media_gallery ? business.media_gallery.split(',') : [],
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
        
        // Set the first business as selected if there are businesses
        if (transformedBusinesses.length > 0) {
          setSelectedBusinessId(transformedBusinesses[0].id);
          setProfileData(prev => ({
            ...prev,
            business: transformedBusinesses[0]
          }));
        } else {
          // If no businesses, create a new one
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
  
  // Image handling functions
  const handleProfileImageClick = () => {
    if (editingSection === 'business') {
      profileImageInputRef.current.click();
    }
  };
  
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfileImage(file);
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        business: {
          ...prev.business,
          profileImage: previewUrl
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
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setNewMediaGallery(prev => [...prev, ...files]);
      setProfileData(prev => ({
        ...prev,
        business: {
          ...prev.business,
          mediaGallery: [...prev.business.mediaGallery, ...previewUrls]
        }
      }));
    }
  };
  
  const handleRemoveMediaGalleryImage = (index) => {
    const imageUrl = profileData.business.mediaGallery[index];
    // Check if it's an existing image (server URL) or a new one (blob URL)
    if (!imageUrl.startsWith('blob:')) {
      // It's an existing image - mark for removal
      setRemovedMediaGallery(prev => [...prev, imageUrl]);
    } else {
      // It's a new image that hasn't been uploaded yet
      const existingCount = profileData.business.mediaGallery.length - newMediaGallery.length;
      if (index >= existingCount) {
        const newIndex = index - existingCount;
        const updatedNewMedia = [...newMediaGallery];
        updatedNewMedia.splice(newIndex, 1);
        setNewMediaGallery(updatedNewMedia);
      }
    }
    // Remove from display
    setProfileData(prev => ({
      ...prev,
      business: {
        ...prev.business,
        mediaGallery: prev.business.mediaGallery.filter((_, i) => i !== index)
      }
    }));
  };
  
  const handleSave = async (section) => {
    try {
      setLoading(true);
      setError('');
      if (!memberId) {
        throw new Error('Member ID is missing');
      }
      
      if (section === 'family') {
        const familyData = profileData.family;
        const dataToSend = {
          father_name: familyData.fatherName,
          father_contact: familyData.fatherContact,
          mother_name: familyData.motherName,
          mother_contact: familyData.motherContact,
          spouse_name: familyData.spouseName,
          spouse_contact: familyData.spouseContact,
          number_of_children: familyData.numberOfChildren,
          children_names: familyData.childrenNames,
          address: familyData.familyAddress
        };
        
        const response = await fetch(`http://localhost:8000/api/family-details/update/${memberId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(dataToSend)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error response:', errorData);
          throw new Error(errorData?.message || `Server returned ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (result.success) {
          setSuccess('Family information updated successfully');
          setEditingSection(null);
          fetchFamilyDetails(); // Refresh family data
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error(result.message || 'Update failed');
        }
      } else if (section === 'business') {
        const businessData = profileData.business;
        const apiData = {
          business_type: businessData.businessType,
          company_name: businessData.businessName,
          business_registration_type: businessData.registrationNumber === 'Others' 
            ? businessData.registrationNumberOther 
            : businessData.registrationNumber,
          business_starting_year: businessData.startingYear,
          experience: businessData.experience,
          company_address: businessData.businessAddress,
          email: businessData.businessEmail,
          staff_size: businessData.staffSize,
          about: businessData.description,
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
          location: businessData.location,
        };
        
        let url, method;
        if (businessData.id) {
          url = `${baseurl}/api/business-profile/update/${businessData.id}`;
          method = 'PUT';
        } else {
          url = `${baseurl}/api/business-profile/${memberId}`;
          method = 'POST';
        }
        
        // First, update the business data
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ business_profiles: [apiData] })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error response:', errorData);
          throw new Error(errorData?.message || `Server returned ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (result.success) {
          const businessId = businessData.id || result.data?.id;
          
          // Create a FormData for image operations with the correct field names
          const imageFormData = new FormData();
          // Add business profile data as JSON string
          imageFormData.append('business_profile', JSON.stringify(apiData));
          // Add profile index for multer
          imageFormData.append('profile_index', '0');
          
          // Add business profile image if exists
          if (newProfileImage) {
            imageFormData.append('business_profile_image_0', newProfileImage);
          }
          
          // Add media gallery images if exist
          if (newMediaGallery.length > 0) {
            newMediaGallery.forEach(file => {
              imageFormData.append('media_gallery_0', file);
            });
          }
          
          // Only make the image upload request if we have images to process
          if (newProfileImage || newMediaGallery.length > 0) {
            try {
              const imageResponse = await fetch(`${baseurl}/api/business-profile/update/${businessId}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: imageFormData
              });
              
              if (!imageResponse.ok) {
                const errorData = await imageResponse.json();
                console.error('Image upload error response:', errorData);
                throw new Error(errorData?.message || `Failed to upload images: ${imageResponse.status}`);
              }
            } catch (err) {
              console.error('Error uploading images:', err);
              // Don't throw here - we still want to consider the save successful
              // even if image upload fails, but show a warning
              setError(`Business data saved but there was an issue with images: ${err.message}`);
            }
          }
          
          // Reset image states
          setNewProfileImage(null);
          setNewMediaGallery([]);
          setRemovedMediaGallery([]);
          
          setSuccess('Business information updated successfully');
          setEditingSection(null);
          fetchBusinessProfiles();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error(result.message || 'Update failed');
        }
      } else {
        const dataToSend = prepareDataForApi(section, profileData[section]);
        
        const response = await fetch(`${baseurl}/api/member/update/${memberId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(dataToSend)
        });
        
        let errorData;
        if (!response.ok) {
          try {
            errorData = await response.json();
            console.error('Server error response:', errorData);
          } catch (e) {
            console.error('Failed to parse error response:', e);
          }
          throw new Error(errorData?.message || errorData?.error || `Server returned ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (result.success) {
          setSuccess(`${section} information updated successfully`);
          setEditingSection(null);
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
      
      // Handle custom values
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
        status: data.status
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
    // Reset image states
    setNewProfileImage(null);
    setNewMediaGallery([]);
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

  // Create individual memoized handlers for each field to prevent re-renders
  const personalHandlers = {
    fullName: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, fullName: value } })), []),
    email: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, email: value } })), []),
    phone: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, phone: value } })), []),
    dateOfBirth: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, dateOfBirth: value } })), []),
    gender: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, gender: value } })), []),
    genderOther: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, genderOther: value } })), []),
    maritalStatus: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, maritalStatus: value } })), []),
    kootam: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, kootam: value } })), []),
    kootamOther: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, kootamOther: value } })), []),
    kovil: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, kovil: value } })), []),
    kovilOther: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, kovilOther: value } })), []),
    status: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, status: value } })), []),
    accessLevel: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, accessLevel: value } })), []),
    streetAddress: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, streetAddress: value } })), []),
    city: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, city: value } })), []),
    state: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, state: value } })), []),
    pinCode: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, pinCode: value } })), []),
    aadhaar: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, aadhaar: value } })), []),
    bloodGroup: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, bloodGroup: value } })), []),
    mobileNumber: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, mobileNumber: value } })), []),
    preferredContact: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, preferredContact: value } })), []),
    secondaryEmail: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, secondaryEmail: value } })), []),
    emergencyContact: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, emergencyContact: value } })), []),
    bestTimeToContact: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, bestTimeToContact: value } })), []),
    website: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, website: value } })), []),
    linkedin: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, linkedin: value } })), []),
    personalWebsite: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, personalWebsite: value } })), []),
    linkedinProfile: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, linkedinProfile: value } })), []),
    facebook: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, facebook: value } })), []),
    instagram: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, instagram: value } })), []),
    twitter: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, twitter: value } })), []),
    youtube: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, youtube: value } })), []),
    referralName: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, referralName: value } })), []),
    referralCode: useCallback((value) => setProfileData(prev => ({ ...prev, personal: { ...prev.personal, referralCode: value } })), [])
  };

  const businessHandlers = {
    businessName: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, businessName: value } })), []),
    category_id: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, category_id: value } })), []),
    designation: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, designation: value } })), []),
    businessEmail: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, businessEmail: value } })), []),
    salary: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, salary: value } })), []),
    location: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, location: value } })), []),
    registrationNumber: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, registrationNumber: value } })), []),
    registrationNumberOther: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, registrationNumberOther: value } })), []),
    startingYear: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, startingYear: value } })), []),
    staffSize: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, staffSize: value } })), []),
    description: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, description: value } })), []),
    businessAddress: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, businessAddress: value } })), []),
    city: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, city: value } })), []),
    state: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, state: value } })), []),
    zip_code: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, zip_code: value } })), []),
    business_work_contract: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, business_work_contract: value } })), []),
    tags: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, tags: value } })), []),
    website: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, website: value } })), []),
    google_link: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, google_link: value } })), []),
    facebook_link: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, facebook_link: value } })), []),
    instagram_link: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, instagram_link: value } })), []),
    linkedin_link: useCallback((value) => setProfileData(prev => ({ ...prev, business: { ...prev.business, linkedin_link: value } })), [])
  };

  const familyHandlers = {
    fatherName: useCallback((value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, fatherName: value } })), []),
    fatherContact: useCallback((value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, fatherContact: value } })), []),
    motherName: useCallback((value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, motherName: value } })), []),
    motherContact: useCallback((value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, motherContact: value } })), []),
    spouseName: useCallback((value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, spouseName: value } })), []),
    spouseContact: useCallback((value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, spouseContact: value } })), []),
    numberOfChildren: useCallback((value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, numberOfChildren: value } })), []),
    anniversaryDate: useCallback((value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, anniversaryDate: value } })), []),
    emergencyContact: useCallback((value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, emergencyContact: value } })), []),
    childrenNames: useCallback((value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, childrenNames: value } })), []),
    familyAddress: useCallback((value) => setProfileData(prev => ({ ...prev, family: { ...prev.family, familyAddress: value } })), [])
  };

  const InputField = React.memo(({ label, value, onChange, type = "text", required = false, disabled = false }) => {
    const [localValue, setLocalValue] = React.useState(value);
    const inputRef = React.useRef(null);
    
    // Update local value when prop value changes (but not during typing)
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
    
    // console.log(`InputField ${label} re-rendered`, { value, localValue, disabled, timestamp: Date.now() });
    
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
  
  const CheckboxField = React.memo(({ label, checked, onChange, disabled = false }) => (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
      />
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  ));
  
  const StatusBadge = React.memo(({ status }) => {
    let bgColor = '';
    let textColor = '';
    switch (status?.toLowerCase()) {
      case 'approved':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
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

  // Memoize the disabled state to prevent unnecessary re-renders
  const isPersonalEditing = editingSection === 'personal';
  const isPersonalDisabled = !isPersonalEditing;

  // Memoize the personal form section to prevent re-renders
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
      
      {/* Gender Field with Others Option */}
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
      
      {/* Custom Gender Input */}
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
      
      {/* Kootam Field with Others Option */}
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
      
      {/* Custom Kootam Input */}
      {profileData.personal.kootam === 'Others' && isPersonalEditing && (
        <InputField
          label="Specify Kootam"
          value={profileData.personal.kootamOther}
          onChange={personalHandlers.kootamOther}
          disabled={isPersonalDisabled}
        />
      )}
      
      {/* Kovil Field with Others Option */}
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
      
      {/* Custom Kovil Input */}
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
    // Create a new empty business form
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
      mediaGallery: [],
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
  
  // Change password functions
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
    // Clear errors when user starts typing
    if (passwordError) setPasswordError('');
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validation
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
            <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8">Manage your personal, business, and family information</p>
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-medium text-white/80">Member Since</p>
                  <p className="text-sm sm:text-lg font-bold text-white">March 2022</p>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-medium text-white/80">Businesses</p>
                  <p className="text-sm sm:text-lg font-bold text-white">{businessProfiles.length} Verified</p>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-medium text-white/80">Rating</p>
                  <p className="text-sm sm:text-lg font-bold text-white">4.8 ⭐</p>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-medium text-white/80">Last Updated</p>
                  <p className="text-sm sm:text-lg font-bold text-white">2 days ago</p>
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
                  <p className="text-xs sm:text-sm text-gray-600">Your personal information and contact details</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <StatusBadge status={profileData.personal.status} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-white" />
                    <AccessLevelBadge level={profileData.personal.accessLevel} />
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
                  label="Mobile Number"
                  value={profileData.personal.mobileNumber}
                  onChange={personalHandlers.mobileNumber}
                  disabled={editingSection !== 'personal'}
                />
                <InputField
                  label="Prefered Contact"
                  value={profileData.personal.preferredContact}
                  onChange={personalHandlers.preferredContact}
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
            
            {/* Only show Referral Information if the user has a referral */}
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
                  <p className="text-xs sm:text-sm text-gray-600">Your business information and professional profile</p>
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
          
          {/* Business Selection Dropdown */}
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
                
                {/* Business Type */}
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
                  
                  {/* Category field */}
                  {(profileData.business.businessType === 'self-employed' || profileData.business.businessType === 'business') && (
                    <SelectField
                      label="Category"
                      value={profileData.business.category_id}
                      onChange={businessHandlers.category_id}
                      options={categories.map(cat => ({ value: cat.cid, label: cat.category_name }))}
                      disabled={editingSection !== 'business'}
                    />
                  )}
                  
                  {/* Conditional fields based on business type */}
                  {profileData.business.businessType === 'salary' ? (
                    <>
                      <InputField
                        label="Designation"
                        value={profileData.business.designation}
                        onChange={businessHandlers.designation}
                        disabled={editingSection !== 'business'}
                      />
                      <InputField
                        label="Business Email"
                        value={profileData.business.businessEmail}
                        onChange={businessHandlers.businessEmail}
                        disabled={editingSection !== 'business'}
                      />
                      <InputField
                        label="Salary"
                        value={profileData.business.salary}
                        onChange={businessHandlers.salary}
                        disabled={editingSection !== 'business'}
                      />
                      <InputField
                        label="Location"
                        value={profileData.business.location}
                        onChange={businessHandlers.location}
                        disabled={editingSection !== 'business'}
                      />
                    </>
                  ) : (
                    <>
                      {/* Business Registration Type with Others Option */}
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Business Registration Type</label>
                        <select
                          value={profileData.business.registrationNumber}
                          onChange={(e) => businessHandlers.registrationNumber(e.target.value)}
                          disabled={editingSection !== 'business'}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${editingSection !== 'business' ? 'bg-gray-50 text-gray-600' : 'bg-white'
                            }`}
                        >
                          <option value="">Select Registration Type</option>
                          <option value="proprietor">Proprietor</option>
                          <option value="partnership">Partnership</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      
                      {/* Custom Registration Type Input */}
                      {profileData.business.registrationNumber === 'Others' && editingSection === 'business' && (
                        <InputField
                          label="Specify Registration Type"
                          value={profileData.business.registrationNumberOther}
                          onChange={businessHandlers.registrationNumberOther}
                          disabled={editingSection !== 'business'}
                        />
                      )}
                      
                      <InputField
                        label="Business Starting Year"
                        value={profileData.business.startingYear}
                        onChange={businessHandlers.startingYear}
                        disabled={editingSection !== 'business'}
                      />
                      <InputField
                        label="Business Email"
                        value={profileData.business.businessEmail}
                        onChange={businessHandlers.businessEmail}
                        disabled={editingSection !== 'business'}
                      />
                      <InputField
                        label="Staff Size"
                        value={profileData.business.staffSize}
                        onChange={businessHandlers.staffSize}
                        disabled={editingSection !== 'business'}
                      />
                    </>
                  )}
                </div>
                
                {/* Additional fields for self-employed and business types */}
                {(profileData.business.businessType === 'self-employed' || profileData.business.businessType === 'business') && (
                  <>
                    <div className="mt-6 space-y-4 text-left">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">About Business</label>
                        <textarea
                          value={profileData.business.description}
                          onChange={(e) => businessHandlers.description(e.target.value)}
                          disabled={editingSection !== 'business'}
                          rows={3}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${editingSection !== 'business' ? 'bg-gray-50 text-gray-600' : 'bg-white'
                            }`}
                        />
                      </div>
                      <InputField
                        label="Business Address"
                        value={profileData.business.businessAddress}
                        onChange={businessHandlers.businessAddress}
                        disabled={editingSection !== 'business'}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                        <InputField
                          label="Business Work Contact"
                          value={profileData.business.business_work_contract}
                          onChange={businessHandlers.business_work_contract}
                          disabled={editingSection !== 'business'}
                        />
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
                    
                    {/* Business Images Section */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 text-left">Business Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {/* Profile Image */}
                        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {profileData.business.profileImage ? (
                            <img
                              src={profileData.business.profileImage.startsWith('blob:')
                                ? profileData.business.profileImage
                                : `${baseurl}/${profileData.business.profileImage}`}
                              alt="Business Logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-500 text-sm">No Logo</span>
                            </div>
                          )}
                          {editingSection === 'business' && (
                            <>
                              <div
                                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={handleProfileImageClick}
                              >
                                <Camera className="w-6 h-6 text-white" />
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* Media Gallery Images */}
                        {profileData.business.mediaGallery.map((media, index) => (
                          <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={media.startsWith('blob:')
                                ? media
                                : `${baseurl}/${media}`}
                              alt={`Business ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {editingSection === 'business' && (
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                onClick={() => handleRemoveMediaGalleryImage(index)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {/* Add New Image Button */}
                        {editingSection === 'business' && (
                          <div
                            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50"
                            onClick={handleMediaGalleryAddClick}
                          >
                            <div className="text-center">
                              <Plus className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                              <span className="text-sm text-gray-500">Add Image</span>
                            </div>
                          </div>
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
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                    </div>
                  </>
                )}
                
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
                  <p className="text-xs sm:text-sm text-gray-600">Your family information and emergency contacts</p>
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
                label="Anniversary Date"
                value={profileData.family.anniversaryDate}
                onChange={familyHandlers.anniversaryDate}
                disabled={editingSection !== 'family'}
                type="date"
              />
              <InputField
                label="Emergency Contact"
                value={profileData.family.emergencyContact}
                onChange={familyHandlers.emergencyContact}
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