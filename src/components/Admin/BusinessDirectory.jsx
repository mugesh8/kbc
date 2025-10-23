import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  Grid,
  Paper,
  FormHelperText
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack,
  Add,
  Business,
  Delete,
  CameraAlt,
  Videocam,
  Visibility,
  Close,
  LocationOn
} from '@mui/icons-material';
import baseurl from '../Baseurl/baseurl';

// Branch Location Component - Matching ProfilePage structure
const BranchLocation = ({ 
  branch, 
  index, 
  onUpdate, 
  onRemove,
  disabled = false
}) => {
  const handleChange = (field, value) => {
    onUpdate(index, field, value);
  };

  const handleNumericChange = (field, value) => {
    // Only allow numeric input for zip_code and phone fields
    if (field === 'zip_code' || field === 'business_work_contract') {
      const numericValue = value.replace(/\D/g, '');
      onUpdate(index, field, numericValue);
    } else {
      onUpdate(index, field, value);
    }
  };

  return (
    <Card sx={{ 
      mb: 3, 
      p: 3, 
      border: '1px solid #e0e0e0', 
      borderRadius: 2,
      position: 'relative',
      backgroundColor: index === 0 ? '#f8f9fa' : 'white'
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
          {index === 0 ? 'Main Branch' : `Branch ${index}`}
          {index === 0 && (
            <Chip 
              label="Main" 
              size="small" 
              color="primary" 
              sx={{ ml: 2, fontSize: '0.75rem' }}
            />
          )}
        </Typography>
        {!disabled && index > 0 && (
          <IconButton 
            onClick={() => onRemove(index)}
            color="error"
            size="small"
            sx={{ 
              bgcolor: 'error.light',
              '&:hover': { bgcolor: 'error.main' }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      <Grid container spacing={3}>
        {/* Branch Name and Contact */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Branch Name"
            placeholder="e.g., Head Office, Downtown Branch"
            value={branch.branch_name || branch.branchName || ''}
            onChange={(e) => handleChange('branch_name', e.target.value)}
            size="medium"
            disabled={disabled}
            variant="outlined"
            helperText={index === 0 ? "Main branch name" : "Branch display name"}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contact Number"
            placeholder="Enter branch contact number"
            value={branch.business_work_contract || branch.workContact || ''}
            onChange={(e) => handleNumericChange('business_work_contract', e.target.value)}
            size="medium"
            disabled={disabled}
            variant="outlined"
            inputProps={{ maxLength: 15 }}
          />
        </Grid>

        {/* Branch Email */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Branch Email"
            placeholder="branch@company.com"
            value={branch.email || branch.businessEmail || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            size="medium"
            disabled={disabled}
            type="email"
            variant="outlined"
          />
        </Grid>
        
        {/* Address */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Complete Address"
            placeholder="Enter complete branch address"
            value={branch.company_address || branch.address || ''}
            onChange={(e) => handleChange('company_address', e.target.value)}
            multiline
            rows={2}
            size="medium"
            disabled={disabled}
            variant="outlined"
          />
        </Grid>
        
        {/* Location Details */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="City"
            placeholder="Enter city"
            value={branch.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            size="medium"
            disabled={disabled}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="State"
            placeholder="Enter state"
            value={branch.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            size="medium"
            disabled={disabled}
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Pin Code"
            placeholder="123456"
            value={branch.zip_code || ''}
            onChange={(e) => handleNumericChange('zip_code', e.target.value)}
            size="medium"
            disabled={disabled}
            inputProps={{ maxLength: 6 }}
            variant="outlined"
          />
        </Grid>
      </Grid>
    </Card>
  );
};

// Media Preview Component
const MediaPreviewComponent = ({ media, onRemove, editable = false, onClick }) => {
  const getFullMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return '';
    if (mediaUrl.startsWith('blob:') || mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      return mediaUrl;
    }
    return `${baseurl}/${mediaUrl}`;
  };

  const fullUrl = getFullMediaUrl(media.url);
  
  if (media.type === 'video') {
    return (
      <Paper elevation={2} sx={{ position: 'relative', cursor: 'pointer', height: 120 }}>
        <video
          src={fullUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onClick={onClick}
          onError={(e) => {
            console.error('Video load error:', e);
          }}
        />
        {editable && (
          <>
            <IconButton
              size="small"
              onClick={onRemove}
              sx={{ 
                position: 'absolute', 
                top: 4, 
                right: 4, 
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
            <Chip
              icon={<Videocam />}
              label="Video"
              size="small"
              sx={{ position: 'absolute', top: 4, left: 4, bgcolor: 'primary.main', color: 'white' }}
            />
          </>
        )}
      </Paper>
    );
  } else {
    return (
      <Paper elevation={2} sx={{ position: 'relative', cursor: 'pointer', height: 120 }}>
        <img
          src={fullUrl}
          alt={media.name || 'Media'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onClick={onClick}
          onError={(e) => {
            console.error('Image load error:', e);
          }}
        />
        {editable && (
          <>
            <IconButton
              size="small"
              onClick={onRemove}
              sx={{ 
                position: 'absolute', 
                top: 4, 
                right: 4, 
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
            <Chip
              icon={<CameraAlt />}
              label="Image"
              size="small"
              sx={{ position: 'absolute', top: 4, left: 4, bgcolor: 'success.main', color: 'white' }}
            />
          </>
        )}
      </Paper>
    );
  }
};

const BusinessDirectoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});
  const [memberId, setMemberId] = useState(null);
  const [categoryInput, setCategoryInput] = useState('');
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  
  // Media handling states
  const profileImageInputRef = useRef(null);
  const mediaGalleryInputRef = useRef(null);
  const [removedMediaGallery, setRemovedMediaGallery] = useState([]);
  const [mediaPreview, setMediaPreview] = useState({ isOpen: false, media: null, type: 'image' });

  // Business registration type options
  const registrationTypeOptions = ["Proprietor", "Partnership", "Private Limited", "Others"];

  const [formData, setFormData] = useState({
    business_type: 'self-employed',
    company_name: '',
    category_id: '',
    business_registration_type: '',
    business_registration_type_other: '',
    experience: '',
    staff_size: '',
    about: '',
    business_profile_image: null,
    profileImageFile: null,
    profileImageType: 'image',
    media_gallery: [],
    mediaGalleryFiles: [],
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
    status: 'Approved',
    // Branches array matching ProfilePage structure
    branches: [{
      branch_name: 'Main Branch',
      business_work_contract: '',
      email: '',
      company_address: '',
      city: '',
      state: '',
      zip_code: ''
    }]
  });

  // Branch management handlers - matching ProfilePage structure
  const handleAddBranch = useCallback(() => {
    setFormData(prevData => ({
      ...prevData,
      branches: [
        ...(prevData.branches || []),
        {
          branch_name: `Branch ${(prevData.branches?.length || 0)}`,
          business_work_contract: "",
          email: "",
          company_address: "",
          city: "",
          state: "",
          zip_code: ""
        }
      ]
    }));
  }, []);

  const handleUpdateBranch = useCallback((index, field, value) => {
    setFormData(prevData => {
      const updatedBranches = [...(prevData.branches || [])];
      updatedBranches[index] = {
        ...updatedBranches[index],
        [field]: value
      };
      
      return {
        ...prevData,
        branches: updatedBranches
      };
    });
  }, []);

  const handleRemoveBranch = useCallback((index) => {
    setFormData(prevData => {
      const updatedBranches = [...(prevData.branches || [])];
      
      // Don't remove the first branch (main branch)
      if (index === 0) return prevData;
      
      updatedBranches.splice(index, 1);
      
      return {
        ...prevData,
        branches: updatedBranches
      };
    });
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseurl}/api/category/all`);
        if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        showSnackbar('Failed to load categories', 'error');
      }
    };
    fetchCategories();
  }, []);

  // Fetch business data
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!id) {
        // New business - get memberId from localStorage
        const memberData = JSON.parse(localStorage.getItem('memberData'));
        const storedMemberId = memberData?.mid || localStorage.getItem('memberId');
        if (storedMemberId) setMemberId(storedMemberId);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${baseurl}/api/business-profile/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch business data');
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success || data.profile) {
          const businessData = data.profile || data.data;
          const business = transformBusinessData(businessData);
          console.log('Transformed data:', business);
          setFormData(business);
          setMemberId(businessData.member_id);
        }
      } catch (error) {
        console.error('Failed to fetch business data:', error);
        showSnackbar('Failed to load business data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [id]);

  // Sync category input display name from selected id when categories or selection changes
  useEffect(() => {
    const selected = categories.find(c => String(c.cid) === String(formData.category_id || ''));
    if (selected) {
      setCategoryInput(selected.category_name || '');
    } else if (!formData.category_id) {
      setCategoryInput(prev => prev); // keep what user typed
    }
  }, [categories, formData.category_id]);

  const transformBusinessData = (apiData) => {
    console.log('Raw API data:', apiData);
    
    // Parse media gallery
    let mediaGallery = [];
    if (apiData.media_gallery) {
      const mediaUrls = apiData.media_gallery.split(',').filter(url => url.trim());
      mediaGallery = mediaUrls.map(url => {
        const trimmedUrl = url.trim();
        const isVideo = trimmedUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i);
        return {
          url: trimmedUrl,
          type: isVideo ? 'video' : 'image',
          name: trimmedUrl.split('/').pop(),
          isNew: false
        };
      });
    }

    // Parse branches data - prefer structured branches array if present
    let branches = [];
    if (Array.isArray(apiData.branches) && apiData.branches.length > 0) {
      branches = apiData.branches.map((b) => ({
        branch_name: b.branch_name || b.branchName || '',
        business_work_contract: b.business_work_contract || b.workContact || '',
        email: b.email || b.businessEmail || '',
        company_address: b.company_address || b.address || '',
        city: b.city || '',
        state: b.state || '',
        zip_code: b.zip_code || ''
      })).filter((b) => (
        b.branch_name || b.company_address || b.city || b.state || b.zip_code || b.email || b.business_work_contract
      ));
    } else {
      // Fallback: handle JSON string arrays from legacy API
      const parseArray = (val) => {
        if (!val) return [];
        try {
          const parsed = JSON.parse(val);
          if (!Array.isArray(parsed)) return [];
          // Normalize nested arrays like [["a","b"]] into ["a","b"]
          const normalized = (parsed.length === 1 && Array.isArray(parsed[0])) ? parsed[0] : parsed;
          // Ensure we always return array of strings
          return normalized.map((v) => {
            if (v == null) return '';
            if (Array.isArray(v)) return (v[0] ?? '').toString();
            return v.toString();
          });
        } catch {
          return [];
        }
      };

      const branchNames = parseArray(apiData.branch_name);
      const companyAddresses = parseArray(apiData.company_address);
      const cities = parseArray(apiData.city);
      const states = parseArray(apiData.state);
      const zips = parseArray(apiData.zip_code);
      const emails = parseArray(apiData.email);
      const workContacts = parseArray(apiData.business_work_contract);

      if (branchNames.length > 0 || companyAddresses.length > 0 || cities.length > 0) {
        const maxLength = Math.max(
          branchNames.length,
          companyAddresses.length,
          cities.length,
          states.length,
          zips.length,
          emails.length,
          workContacts.length
        );

        branches = Array.from({ length: maxLength }, (_, i) => ({
          branch_name: branchNames[i] || '',
          company_address: companyAddresses[i] || '',
          city: cities[i] || '',
          state: states[i] || '',
          zip_code: zips[i] || '',
          email: emails[i] || '',
          business_work_contract: workContacts[i] || '',
        })).filter(
          (b) =>
            b.branch_name ||
            b.company_address ||
            b.city ||
            b.state ||
            b.zip_code ||
            b.email ||
            b.business_work_contract
        );
      }
    }

    // If no branches, create default main branch
    if (branches.length === 0) {
      branches = [{
        branch_name: 'Main Branch',
        business_work_contract: '',
        email: '',
        company_address: '',
        city: '',
        state: '',
        zip_code: ''
      }];
    }

    // FIXED: Determine registration type - check if it's "Others" and has other value
    let business_registration_type = apiData.business_registration_type || '';
    let business_registration_type_other = apiData.business_registration_type_other || '';
    
    // If business_registration_type is not in the predefined options, treat it as "Others"
    if (business_registration_type && !registrationTypeOptions.includes(business_registration_type)) {
      business_registration_type_other = business_registration_type;
      business_registration_type = 'Others';
    }

    // Determine profile image type
    const profileImageUrl = apiData.business_profile_image || null;
    const isProfileVideo = profileImageUrl && profileImageUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i);

    // Use first branch data for main form fields if branches exist
    const firstBranch = branches.length > 0 ? branches[0] : {};
    
    const transformedData = {
      business_type: apiData.business_type || 'self-employed',
      company_name: apiData.company_name || '',
      category_id: apiData.category_id?.toString() || '',
      business_registration_type: business_registration_type,
      business_registration_type_other: business_registration_type_other,
      experience: apiData.experience?.toString() || '',
      company_address: firstBranch.company_address || '',
      email: firstBranch.email || '',
      staff_size: apiData.staff_size?.toString() || '',
      about: apiData.about || '',
      business_profile_image: profileImageUrl,
      profileImageType: isProfileVideo ? 'video' : 'image',
      profileImageFile: null,
      media_gallery: mediaGallery,
      mediaGalleryFiles: [],
      city: firstBranch.city || '',
      state: firstBranch.state || '',
      zip_code: firstBranch.zip_code || '',
      business_work_contract: firstBranch.business_work_contract || '',
      source: apiData.source || '',
      tags: apiData.tags || '',
      website: apiData.website || '',
      google_link: apiData.google_link || '',
      facebook_link: apiData.facebook_link || '',
      instagram_link: apiData.instagram_link || '',
      linkedin_link: apiData.linkedin_link || '',
      designation: apiData.designation || '',
      salary: apiData.salary?.toString() || '',
      location: apiData.location || '',
      status: apiData.status || 'Approved',
      branches: branches
    };

    console.log('Final transformed data:', transformedData);
    return transformedData;
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Media handling functions
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        showSnackbar('Please select an image or video file for profile picture', 'error');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        business_profile_image: previewUrl,
        profileImageFile: file,
        profileImageType: isImage ? 'image' : 'video'
      }));
    }
  };

  // Category input handlers
  const handleCategoryInputChange = (e) => {
    const value = e.target.value || '';
    setCategoryInput(value);
    setShowCategorySuggestions(true);
    const matchedSelectedName = (categories.find(c => String(c.cid) === String(formData.category_id))?.category_name || '').toLowerCase();
    if (value.trim() === '' || value.trim().toLowerCase() !== matchedSelectedName) {
      setFormData(prev => ({ ...prev, category_id: '' }));
    }
  };

  const handleSelectExistingCategory = (cid, name) => {
    setFormData(prev => ({ ...prev, category_id: String(cid) }));
    setCategoryInput(name || '');
    setShowCategorySuggestions(false);
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

      setFormData(prev => ({
        ...prev,
        media_gallery: [...prev.media_gallery, ...newFiles]
      }));
    }
  };

  const handleRemoveMediaGalleryItem = (index) => {
    const item = formData.media_gallery[index];
    if (item.isNew) {
      URL.revokeObjectURL(item.url);
    } else {
      setRemovedMediaGallery(prev => [...prev, item.url]);
    }

    setFormData(prev => ({
      ...prev,
      media_gallery: prev.media_gallery.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveProfileImage = () => {
    const currentProfileImage = formData.business_profile_image;
    if (currentProfileImage && !currentProfileImage.startsWith('blob:')) {
      setRemovedMediaGallery(prev => [...prev, currentProfileImage]);
    } else if (currentProfileImage) {
      URL.revokeObjectURL(currentProfileImage);
    }

    setFormData(prev => ({
      ...prev,
      business_profile_image: null,
      profileImageFile: null,
      profileImageType: 'image'
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
    setMediaPreview({ isOpen: false, media: null, type: 'image' });
  };

  // Get full media URL helper function
  const getFullMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return '';
    if (mediaUrl.startsWith('blob:') || mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      return mediaUrl;
    }
    return `${baseurl}/${mediaUrl}`;
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Business name is required';
    }

    if (!formData.category_id && (formData.business_type === 'self-employed' || formData.business_type === 'business')) {
      newErrors.category_id = 'Category is required';
    }

    if (formData.business_type === 'salary') {
      if (!formData.designation.trim()) {
        newErrors.designation = 'Designation is required for salary type';
      }
      // Location is no longer required/used for salary type
    }

    // Validate branches
    if (formData.branches && formData.branches.length > 0) {
      formData.branches.forEach((branch, index) => {
        if (!branch.branch_name || (typeof branch.branch_name === 'string' && !branch.branch_name.trim())) {
          newErrors[`branch_${index}_name`] = `Branch ${index === 0 ? 'Main' : index} name is required`;
        }
        if (!branch.company_address || (typeof branch.company_address === 'string' && !branch.company_address.trim())) {
          newErrors[`branch_${index}_address`] = `Branch ${index === 0 ? 'Main' : index} address is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the validation errors before submitting', 'error');
      return;
    }

    try {
      setLoading(true);

      // Prepare business data for API - align with UserProfilePage structure
      const businessPayload = {
        business_type: formData.business_type,
        company_name: formData.company_name,
        business_registration_type: formData.business_registration_type === 'Others' 
          ? formData.business_registration_type_other 
          : formData.business_registration_type,
        business_registration_type_other: formData.business_registration_type === 'Others' 
          ? formData.business_registration_type_other 
          : '',
        experience: formData.experience || '',
        staff_size: formData.staff_size || '',
        about: formData.about || '',
        category_id: formData.category_id ? parseInt(formData.category_id) : '',
        source: formData.source || '',
        tags: formData.tags || '',
        website: formData.website || '',
        google_link: formData.google_link || '',
        facebook_link: formData.facebook_link || '',
        instagram_link: formData.instagram_link || '',
        linkedin_link: formData.linkedin_link || '',
        designation: formData.designation || '',
        salary: formData.salary || '',
        location: formData.location || '',
        status: formData.status,
        // Send branches as array of objects (per-branch editing)
        branches: (formData.branches && formData.branches.length > 0)
          ? formData.branches.map(b => ({
              branch_name: b.branch_name || b.branchName || '',
              business_work_contract: b.business_work_contract || b.workContact || '',
              email: b.email || b.businessEmail || '',
              company_address: b.company_address || b.address || '',
              city: b.city || '',
              state: b.state || '',
              zip_code: b.zip_code || ''
            }))
          : [{
              branch_name: 'Main Branch',
              business_work_contract: '',
              email: '',
              company_address: '',
              city: '',
              state: '',
              zip_code: ''
            }]
      };

      // Create FormData with correct field names
      const formDataToSend = new FormData();

      // For update, send as business_profile field
      if (id) {
        formDataToSend.append('business_profile', JSON.stringify(businessPayload));
      } else {
        // For new business, send as business_profiles array (URL contains memberId)
        formDataToSend.append('business_profiles', JSON.stringify([businessPayload]));
      }

      // Add profile image with correct field name
      if (formData.profileImageFile) {
        formDataToSend.append('profile_image', formData.profileImageFile);
      }

      // Add media gallery files with correct field name
      formData.media_gallery.forEach(media => {
        if (media.isNew && media.file) {
          formDataToSend.append('media_gallery', media.file);
        }
      });

      // Add removed media gallery items
      if (removedMediaGallery.length > 0) {
        formDataToSend.append('removed_media', JSON.stringify(removedMediaGallery));
      }

      let url, method;
      if (id) {
        // Update existing business
        url = `${baseurl}/api/business-profile/update/${id}`;
        method = 'PUT';
      } else {
        // Create new business
        if (!memberId) {
          showSnackbar('Member ID not found', 'error');
          return;
        }
        url = `${baseurl}/api/business-profile/${memberId}`;
        method = 'POST';
      }

      console.log('Submitting to:', url);
      console.log('Method:', method);
      console.log('Payload:', businessPayload);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      const result = await response.json();
      console.log('Response:', result);

      if (!response.ok) {
        throw new Error(result?.msg || result?.message || `Server returned ${response.status}`);
      }

      if (result.success) {
        setRemovedMediaGallery([]);
        showSnackbar(id ? 'Business updated successfully' : 'Business created successfully');
        setTimeout(() => navigate('/admin/BusinessManagement'), 1500);
      } else {
        throw new Error(result.msg || result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Business operation error:', error);
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  if (loading && !formData.company_name) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/BusinessManagement')}
          disabled={loading}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2E7D32' }}>
            {id ? 'Edit Business' : 'Add New Business'}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {id ? 'Update business information and branch details' : 'Create new business with multiple branch locations'}
          </Typography>
        </Box>
      </Box>

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          {/* Status Selection */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleInputChange}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            
            <Chip 
              label={formData.status} 
              color={getStatusColor(formData.status)}
              variant="filled"
              sx={{ fontSize: '0.9rem', padding: '8px 16px' }}
            />
          </Box>

          {/* Business Type */}
          <Box mb={4}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.1rem', display: 'block' }}>
              Business Type
            </FormLabel>
            <RadioGroup
              row
              name="business_type"
              value={formData.business_type}
              onChange={handleInputChange}
              sx={{ gap: 3 }}
            >
              <FormControlLabel value="self-employed" control={<Radio />} label="Self Employed" />
              <FormControlLabel value="business" control={<Radio />} label="Business" />
              <FormControlLabel value="salary" control={<Radio />} label="Salary" />
            </RadioGroup>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Basic Information Section */}
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
              Basic Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Business Name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  error={!!errors.company_name}
                  helperText={errors.company_name}
                  size="medium"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    label="Category"
                    value={categoryInput}
                    onChange={handleCategoryInputChange}
                    onFocus={() => setShowCategorySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 120)}
                    size="medium"
                    placeholder="Type to search and select category"
                    error={!!errors.category_id}
                    helperText={errors.category_id}
                    required
                  />
                  {showCategorySuggestions && (categoryInput || '').length > 0 && (
                    <Paper elevation={3} sx={{ position: 'absolute', zIndex: 10, width: '100%', mt: 1, maxHeight: 240, overflowY: 'auto' }}>
                      {categories
                        .filter(c => (c.category_name || '').toLowerCase().includes((categoryInput || '').toLowerCase()))
                        .slice(0, 10)
                        .map(c => (
                          <MenuItem 
                            key={c.cid} 
                            onMouseDown={(e) => e.preventDefault()} 
                            onClick={() => handleSelectExistingCategory(c.cid, c.category_name)}
                          >
                            {c.category_name}
                          </MenuItem>
                        ))}
                      {categories.filter(c => (c.category_name || '').toLowerCase().includes((categoryInput || '').toLowerCase())).length === 0 && (
                        <Box sx={{ p: 1.5 }}>
                          <Typography variant="body2" color="text.secondary">No matches</Typography>
                        </Box>
                      )}
                    </Paper>
                  )}
                </Box>
              </Grid>

              {formData.business_type === 'salary' ? (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      error={!!errors.designation}
                      helperText={errors.designation}
                      size="medium"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Salary"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Experience (years)"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      size="medium"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tags (comma separated)"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      size="medium"
                      placeholder="tag1, tag2, tag3"
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="medium" error={!!errors.business_registration_type}>
                      <InputLabel>Business Registration Type</InputLabel>
                      <Select
                        name="business_registration_type"
                        value={formData.business_registration_type}
                        label="Business Registration Type"
                        onChange={handleInputChange}
                      >
                        {registrationTypeOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.business_registration_type && (
                        <FormHelperText>{errors.business_registration_type}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {formData.business_registration_type === 'Others' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Specify Registration Type"
                        name="business_registration_type_other"
                        value={formData.business_registration_type_other}
                        onChange={handleInputChange}
                        size="medium"
                        placeholder="Enter your registration type"
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Staff Size"
                      name="staff_size"
                      value={formData.staff_size}
                      onChange={handleInputChange}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Experience (years)"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      size="medium"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>

          {/* Description Section */}
          <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              {formData.business_type === 'salary' ? 'Job Description' : 'About Business'}
            </Typography>
            <TextField
              fullWidth
              label={formData.business_type === 'salary' ? 'Job Description' : 'About Business'}
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              multiline
              rows={4}
              size="medium"
            />
          </Box>

          {/* Branches Section for all business types (including salary) */}
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
              {formData.business_type === 'salary' ? 'Office Branches' : 'Business Branches'}
            </Typography>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Branch Locations ({formData.branches?.length || 0})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddBranch}
                sx={{ mb: 2 }}
              >
                Add Another Branch
              </Button>
            </Box>

            {formData.branches && formData.branches.map((branch, index) => (
              <BranchLocation
                key={index}
                branch={branch}
                index={index}
                onUpdate={handleUpdateBranch}
                onRemove={handleRemoveBranch}
                disabled={false}
              />
            ))}
          </Box>

          {/* Social Media Links for non-salary types */}
          {(formData.business_type === 'self-employed' || formData.business_type === 'business') && (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
                Social Media & Links
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tags (comma separated)"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    size="medium"
                    placeholder="tag1, tag2, tag3"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    size="medium"
                    placeholder="https://example.com"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="GMap Link"
                    name="google_link"
                    value={formData.google_link}
                    onChange={handleInputChange}
                    size="medium"
                    placeholder="https://g.page/your-business"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Facebook Link"
                    name="facebook_link"
                    value={formData.facebook_link}
                    onChange={handleInputChange}
                    size="medium"
                    placeholder="https://facebook.com/your-business"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Instagram Link"
                    name="instagram_link"
                    value={formData.instagram_link}
                    onChange={handleInputChange}
                    size="medium"
                    placeholder="https://instagram.com/your-business"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn Link"
                    name="linkedin_link"
                    value={formData.linkedin_link}
                    onChange={handleInputChange}
                    size="medium"
                    placeholder="https://linkedin.com/company/your-business"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Media Section */}
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
              Media
            </Typography>

            {/* Profile Image - visible for all business types */}
            <Box mb={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Profile Image
              </Typography>
              <Box display="flex" alignItems="center" gap={3}>
                {formData.business_profile_image ? (
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    {formData.profileImageType === 'video' ? (
                      <video
                        src={getFullMediaUrl(formData.business_profile_image)}
                        style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%', cursor: 'pointer' }}
                        onClick={() => openMediaPreview(formData.business_profile_image, formData.profileImageType)}
                      />
                    ) : (
                      <Avatar
                        src={getFullMediaUrl(formData.business_profile_image)}
                        sx={{ width: 120, height: 120, cursor: 'pointer' }}
                        onClick={() => openMediaPreview(formData.business_profile_image, formData.profileImageType)}
                      >
                        <Business sx={{ fontSize: 50 }} />
                      </Avatar>
                    )}
                  </Box>
                ) : (
                  <Avatar sx={{ width: 120, height: 120, bgcolor: 'grey.300' }}>
                    <Business sx={{ fontSize: 50, color: 'grey.600' }} />
                  </Avatar>
                )}
                
                <Box display="flex" gap={2} flexDirection="column">
                  <Button
                    variant="contained"
                    onClick={() => profileImageInputRef.current?.click()}
                    startIcon={<CameraAlt />}
                    sx={{ width: 'fit-content' }}
                  >
                    Upload Profile Image/Video
                  </Button>
                  {formData.business_profile_image && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveProfileImage}
                      startIcon={<Delete />}
                      sx={{ width: 'fit-content' }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
                
                <input
                  type="file"
                  ref={profileImageInputRef}
                  onChange={handleProfileImageChange}
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                />
              </Box>
            </Box>

            {/* Media Gallery */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Media Gallery
              </Typography>
              
              <Button
                variant="outlined"
                onClick={() => mediaGalleryInputRef.current?.click()}
                startIcon={<Add />}
                sx={{ mb: 3 }}
              >
                Add Media (Images & Videos)
              </Button>
              
              <input
                type="file"
                ref={mediaGalleryInputRef}
                onChange={handleMediaGalleryChange}
                accept="image/*,video/*"
                multiple
                style={{ display: 'none' }}
              />

              <Grid container spacing={2}>
                {formData.media_gallery.map((media, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <MediaPreviewComponent
                      media={media}
                      onRemove={() => handleRemoveMediaGalleryItem(index)}
                      editable={true}
                      onClick={() => openMediaPreview(media.url, media.type)}
                    />
                  </Grid>
                ))}
              </Grid>

              {formData.media_gallery.length === 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center', fontStyle: 'italic' }}>
                  No media files added. Click "Add Media" to upload images or videos.
                </Typography>
              )}
            </Box>
          </Box>

          {/* Submit Buttons */}
          <Box mt={4} display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/BusinessManagement')}
              disabled={loading}
              size="large"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ bgcolor: 'success.main', minWidth: 150 }}
              size="large"
            >
              {loading ? 'Saving...' : (id ? 'Update Business' : 'Create Business')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Media Preview Dialog */}
      <Dialog 
        open={mediaPreview.isOpen} 
        onClose={closeMediaPreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Media Preview
          <IconButton onClick={closeMediaPreview}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            {mediaPreview.type === 'video' ? (
              <video
                src={mediaPreview.media}
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '70vh' }}
              />
            ) : (
              <img
                src={mediaPreview.media}
                alt="Preview"
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMediaPreview} size="large">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BusinessDirectoryForm;