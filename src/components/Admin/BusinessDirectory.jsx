import React, { useState, useEffect, useRef } from 'react';
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
  Paper
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
  Close
} from '@mui/icons-material';
import baseurl from '../Baseurl/baseurl';

const BusinessDirectoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});
  const [memberId, setMemberId] = useState(null);
  
  // Media handling states
  const profileImageInputRef = useRef(null);
  const mediaGalleryInputRef = useRef(null);
  const [removedMediaGallery, setRemovedMediaGallery] = useState([]);
  const [mediaPreview, setMediaPreview] = useState({ isOpen: false, media: null, type: 'image' });

  const [formData, setFormData] = useState({
    business_type: 'self-employed',
    businessName: '',
    category_id: '',
    registrationNumber: '',
    registrationNumberOther: '',
    startingYear: '',
    experience: '',
    businessAddress: '',
    businessEmail: '',
    staffSize: '',
    description: '',
    profileImage: null,
    profileImageFile: null,
    profileImageType: 'image',
    mediaGallery: [],
    mediaGalleryFiles: [],
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
    status: 'Approved'
  });

  // Business registration type options
  const registrationTypeOptions = ["proprietor", "partnership", "Others"];

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

    // Determine registration type
    let registrationNumber = apiData.business_registration_type || '';
    let registrationNumberOther = '';
    if (registrationNumber && !registrationTypeOptions.includes(registrationNumber)) {
      registrationNumberOther = registrationNumber;
      registrationNumber = 'Others';
    }

    // Determine profile image type
    const profileImageUrl = apiData.business_profile_image || null;
    const isProfileVideo = profileImageUrl && profileImageUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i);

    const transformedData = {
      business_type: apiData.business_type || 'self-employed',
      businessName: apiData.company_name || '',
      category_id: apiData.category_id?.toString() || '',
      registrationNumber: registrationNumber,
      registrationNumberOther: registrationNumberOther,
      startingYear: apiData.business_starting_year?.toString() || '',
      experience: apiData.experience?.toString() || '',
      businessAddress: apiData.company_address || '',
      businessEmail: apiData.email || '',
      staffSize: apiData.staff_size?.toString() || '',
      description: apiData.about || '',
      profileImage: profileImageUrl,
      profileImageType: isProfileVideo ? 'video' : 'image',
      profileImageFile: null,
      mediaGallery: mediaGallery,
      mediaGalleryFiles: [],
      city: apiData.city || '',
      state: apiData.state || '',
      zip_code: apiData.zip_code || '',
      business_work_contract: apiData.business_work_contract || '',
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
      status: apiData.status || 'Approved'
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
        profileImage: previewUrl,
        profileImageFile: file,
        profileImageType: isImage ? 'image' : 'video'
      }));
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

      setFormData(prev => ({
        ...prev,
        mediaGallery: [...prev.mediaGallery, ...newFiles]
      }));
    }
  };

  const handleRemoveMediaGalleryItem = (index) => {
    const item = formData.mediaGallery[index];
    if (item.isNew) {
      URL.revokeObjectURL(item.url);
    } else {
      setRemovedMediaGallery(prev => [...prev, item.url]);
    }

    setFormData(prev => ({
      ...prev,
      mediaGallery: prev.mediaGallery.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveProfileImage = () => {
    const currentProfileImage = formData.profileImage;
    if (currentProfileImage && !currentProfileImage.startsWith('blob:')) {
      setRemovedMediaGallery(prev => [...prev, currentProfileImage]);
    } else if (currentProfileImage) {
      URL.revokeObjectURL(currentProfileImage);
    }

    setFormData(prev => ({
      ...prev,
      profileImage: null,
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

  // Media Preview Component
  const MediaPreviewComponent = ({ media, onRemove, editable = false, onClick }) => {
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
              console.log('Video URL:', fullUrl);
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
              console.log('Image URL:', fullUrl);
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

  // Simplified validation - only check required fields
  const validateForm = () => {
    const newErrors = {};
    
    // Only validate business name as required
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    
    // Optional email validation only if provided
    if (formData.businessEmail && formData.businessEmail.trim() && 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Please enter a valid email address';
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

      // Prepare business data for API - match the backend structure
      const businessPayload = {
        member_id: memberId,
        company_name: formData.businessName,
        business_type: formData.business_type,
        business_registration_type: formData.registrationNumber === 'Others' 
          ? formData.registrationNumberOther 
          : formData.registrationNumber,
        business_starting_year: formData.startingYear ? parseInt(formData.startingYear) : null,
        experience: formData.experience || null,
        company_address: formData.businessAddress || null,
        email: formData.businessEmail || null,
        staff_size: formData.staffSize || null,
        about: formData.description || null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        business_work_contract: formData.business_work_contract || null,
        source: formData.source || null,
        tags: formData.tags || null,
        website: formData.website || null,
        google_link: formData.google_link || null,
        facebook_link: formData.facebook_link || null,
        instagram_link: formData.instagram_link || null,
        linkedin_link: formData.linkedin_link || null,
        designation: formData.designation || null,
        salary: formData.salary || null,
        location: formData.location || null,
        status: formData.status
      };

      // Create FormData with correct field names
      const formDataToSend = new FormData();

      // For update, send as business_profile field
      if (id) {
        formDataToSend.append('business_profile', JSON.stringify(businessPayload));
      } else {
        // For new business, send as business_profiles array
        formDataToSend.append('business_profiles', JSON.stringify([businessPayload]));
      }

      // Add profile image with correct field name
      if (formData.profileImageFile) {
        formDataToSend.append('business_profile_image', formData.profileImageFile);
      }

      // Add media gallery files with correct field name
      formData.mediaGallery.forEach(media => {
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

      // Log FormData contents for debugging
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`FormData key: ${key}, value type: ${typeof value}`);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type - let browser set it with boundary
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

  if (loading && !formData.businessName) {
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
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  error={!!errors.businessName}
                  helperText={errors.businessName}
                  size="medium"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Business Email"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleInputChange}
                  error={!!errors.businessEmail}
                  helperText={errors.businessEmail}
                  size="medium"
                />
              </Grid>

              {(formData.business_type === 'self-employed' || formData.business_type === 'business') && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="medium">
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category_id"
                      value={formData.category_id}
                      label="Category"
                      onChange={handleInputChange}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.cid} value={category.cid.toString()}>
                          {category.category_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {formData.business_type === 'salary' ? (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      size="medium"
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
                      label="Location"
                      name="location"
                      value={formData.location}
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
              ) : (
                <>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="medium">
                      <InputLabel>Business Registration Type</InputLabel>
                      <Select
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        label="Business Registration Type"
                        onChange={handleInputChange}
                      >
                        {registrationTypeOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.registrationNumber === 'Others' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Specify Registration Type"
                        name="registrationNumberOther"
                        value={formData.registrationNumberOther}
                        onChange={handleInputChange}
                        size="medium"
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Business Starting Year"
                      name="startingYear"
                      value={formData.startingYear}
                      onChange={handleInputChange}
                      size="medium"
                      type="number"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Staff Size"
                      name="staffSize"
                      value={formData.staffSize}
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
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              size="medium"
            />
          </Box>

          {/* Address Information for Business/Self-employed */}
          {(formData.business_type === 'self-employed' || formData.business_type === 'business') && (
            <>
              <Box mb={4}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
                  Address Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Business Address"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      size="medium"
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Pin Code"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleInputChange}
                      size="medium"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Business Work Contract */}
              <Box mb={4}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Business Work Contract
                </Typography>
                <TextField
                  fullWidth
                  label="Business Work Contract"
                  name="business_work_contract"
                  value={formData.business_work_contract}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  size="medium"
                />
              </Box>

              {/* Social Media Links */}
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
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Google Link"
                      name="google_link"
                      value={formData.google_link}
                      onChange={handleInputChange}
                      size="medium"
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
                    />
                  </Grid>
                </Grid>
              </Box>
            </>
          )}

          {/* Media Section */}
          <Box mb={4}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
              Media
            </Typography>

            {/* Profile Image */}
            {(formData.business_type === 'self-employed' || formData.business_type === 'business') && (
              <Box mb={4}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Profile Image
                </Typography>
                <Box display="flex" alignItems="center" gap={3}>
                  {formData.profileImage ? (
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      {formData.profileImageType === 'video' ? (
                        <video
                          src={getFullMediaUrl(formData.profileImage)}
                          style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%', cursor: 'pointer' }}
                          onClick={() => openMediaPreview(formData.profileImage, formData.profileImageType)}
                        />
                      ) : (
                        <Avatar
                          src={getFullMediaUrl(formData.profileImage)}
                          sx={{ width: 120, height: 120, cursor: 'pointer' }}
                          onClick={() => openMediaPreview(formData.profileImage, formData.profileImageType)}
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
                    {formData.profileImage && (
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
            )}

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
                {formData.mediaGallery.map((media, index) => (
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

              {formData.mediaGallery.length === 0 && (
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