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
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import Footer from '../User/Footer';
import baseurl from '../Baseurl/baseurl';
import { ArrowBack } from '@mui/icons-material';

const BusinessDirectoryForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [businessProfileId, setBusinessProfileId] = useState(null);
  const [registrationType, setRegistrationType] = useState('');
  const [customRegistrationType, setCustomRegistrationType] = useState('');
  const [showCustomRegistration, setShowCustomRegistration] = useState(false);
  const [errors, setErrors] = useState({});
  const [businessDialogOpen, setBusinessDialogOpen] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [currentBusinessIndex, setCurrentBusinessIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const adminRole = typeof window !== 'undefined' ? localStorage.getItem('adminRole') : null;

  const [formData, setFormData] = useState({
    business_type: 'self-employed',
    category_id: '',
    company_name: '',
    business_registration_type: '',
    about: '',
    company_address: '',
    city: '',
    state: '',
    zip_code: '',
    business_starting_year: '',
    staff_size: '',
    business_work_contract: '',
    email: '',
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
    experience: '',
    profileImage: null,
    mediaGallery: [],
    status: 'Approved', // Added status field with default value
  });

  // Business registration type options
  const registrationTypeOptions = [
    "proprietor",
    "Partnership",
    "Others"
  ];

  // Email validation function
  const validateEmail = (email) => {
    if (!email) return true; // Empty email is valid (optional field)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form fields
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'email':
        if (value && !validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'business_starting_year':
        if (value && (value < 1900 || value > new Date().getFullYear())) {
          error = 'Please enter a valid year';
        }
        break;
      case 'zip_code':
        if (value && !/^\d{5,6}(-\d{4})?$/.test(value)) {
          error = 'Please enter a valid zip code';
        }
        break;
      default:
        break;
    }
    return error;
  };

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
        setSnackbar({
          open: true,
          message: 'Failed to load categories',
          severity: 'error'
        });
      }
    };
    fetchCategories();
  }, []);

  const [memberId, setMemberId] = useState(null);
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        // If no id is provided, initialize with an empty business
        if (!id) {
          const defaultBusiness = createEmptyBusiness();
          if (isMounted) {
            setBusinesses([defaultBusiness]);
            setFormData(defaultBusiness);
          }
          return;
        }

        const res = await fetch(`${baseurl}/api/business-profile/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        if (!data.success || !data.data) {
          throw new Error(data.msg || 'Failed to fetch business profile');
        }

        const business = data.data; // single business object
        if (isMounted) {
          setMemberId(business.member_id || null);
          const formatted = formatBusinessData(business);
          setBusinesses([formatted]);
          setFormData(formatted);
          setBusinessProfileId(business.id);
          handleRegistrationType(
            business.business_registration_type,
            registrationTypeOptions,
            setRegistrationType,
            setCustomRegistrationType,
            setShowCustomRegistration
          );
        }
      } catch (error) {
        console.error('Failed to fetch business data:', error);
        if (isMounted) {
          setSnackbar({
            open: true,
            message: `Failed to load data: ${error.message}`,
            severity: 'error'
          });
          const defaultBusiness = createEmptyBusiness();
          setBusinesses([defaultBusiness]);
          setFormData(defaultBusiness);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, t]);

  function handleRegistrationType(
    type,
    options,
    setRegType,
    setCustomType,
    setShowCustom
  ) {
    if (type) {
      const typeStr = String(type);
      const match = options.find(opt => opt.toLowerCase() === typeStr.toLowerCase());
      if (match) {
        setRegType(match);
        setShowCustom(false);
      } else {
        setRegType('Others');
        setCustomType(typeStr);
        setShowCustom(true);
      }
    }
  }

  const createEmptyBusiness = () => {
    return {
      business_type: 'self-employed',
      category_id: '',
      company_name: '',
      business_registration_type: '',
      about: '',
      company_address: '',
      city: '',
      state: '',
      zip_code: '',
      business_starting_year: '',
      staff_size: '',
      business_work_contract: '',
      email: '',
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
      experience: '',
      profileImage: null,
      mediaGallery: [],
      status: 'Approved', // Added status field with default value
      isNew: true
    };
  };

  const formatBusinessData = (business) => {
    return {
      business_type: business.business_type || 'self-employed',
      category_id: business.category_id || '',
      company_name: business.company_name || '',
      business_registration_type: business.business_registration_type || '',
      about: business.about || '',
      company_address: business.company_address || '',
      city: business.city || '',
      state: business.state || '',
      zip_code: business.zip_code || '',
      business_starting_year: business.business_starting_year || '',
      staff_size: business.staff_size || '',
      business_work_contract: business.business_work_contract || '',
      email: business.email || '',
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
      experience: business.experience || '',
      profileImage: business.business_profile_image || null,
      mediaGallery: business.media_gallery ? business.media_gallery.split(',') : [],
      status: business.status || 'Approved', // Added status field
      id: business.id,
      isNew: false
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle registration type change
    if (name === 'business_registration_type') {
      setRegistrationType(value);
      if (value === 'Others') {
        setShowCustomRegistration(true);
        if (!customRegistrationType) {
          setCustomRegistrationType('');
        }
      } else {
        setShowCustomRegistration(false);
        setCustomRegistrationType('');
        setFormData(prev => ({
          ...prev,
          business_registration_type: value
        }));
      }
    }
    // Handle custom registration type input
    else if (name === 'custom_registration_type') {
      setCustomRegistrationType(value);
      setFormData(prev => ({
        ...prev,
        business_registration_type: value
      }));
    }
    // Handle status change
    else if (name === 'status') {
      setFormData(prev => ({
        ...prev,
        status: value
      }));
    }
    // Handle all other inputs
    else {
      const error = validateField(name, value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'profileImage') {
      setFormData(prev => ({ ...prev, profileImage: files[0] }));
    } else if (name === 'mediaGallery') {
      setFormData(prev => ({ ...prev, mediaGallery: Array.from(files) }));
    }
  };

  const triggerFileSelect = (inputType) => {
    if (inputType === 'profile') {
      profileInputRef.current.click();
    } else {
      fileInputRef.current.click();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const validateForm = () => {
    const newErrors = {};
    // Validate email
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    // Validate business starting year
    if (formData.business_starting_year &&
      (formData.business_starting_year < 1900 || formData.business_starting_year > new Date().getFullYear())) {
      newErrors.business_starting_year = 'Please enter a valid year';
    }
    // Validate zip code
    if (formData.zip_code && !/^\d{5,6}(-\d{4})?$/.test(formData.zip_code)) {
      newErrors.zip_code = 'Please enter a valid zip code';
    }
    // Validate custom registration type if "Others" is selected
    if (registrationType === 'Others' && !customRegistrationType.trim()) {
      newErrors.custom_registration_type = 'Please specify the business registration type';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        setSnackbar({
          open: true,
          message: 'Please fix the validation errors before submitting',
          severity: 'error'
        });
        return;
      }
      setLoading(true);

      const isNewBusiness = !businessProfileId;
      const formDataToSend = new FormData();

      if (isNewBusiness) {
        // Create -> POST /api/business-profile/:member_id
        if (!memberId) {
          throw new Error('Member ID missing for creation');
        }
        const endpoint = `${baseurl}/api/business-profile/${memberId}`;
        const method = 'POST';

        // Build business_profiles array payload
        const profilePayload = {
          business_type: formData.business_type,
          company_name: formData.company_name,
          business_registration_type: registrationType === 'Others' ? customRegistrationType : registrationType,
          category_id: formData.category_id,
          about: formData.about,
          company_address: formData.company_address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          business_starting_year: formData.business_starting_year,
          staff_size: formData.staff_size,
          business_work_contract: formData.business_work_contract,
          email: formData.email,
          source: formData.source,
          tags: formData.tags,
          website: formData.website,
          google_link: formData.google_link,
          facebook_link: formData.facebook_link,
          instagram_link: formData.instagram_link,
          linkedin_link: formData.linkedin_link,
          designation: formData.designation,
          salary: formData.salary,
          location: formData.location,
          experience: formData.experience,
          status: formData.status, // Added status field
        };
        formDataToSend.append('business_profiles', JSON.stringify([profilePayload]));

        // Files use indexed keys for create
        if (formData.profileImage instanceof File) {
          formDataToSend.append('business_profile_image_0', formData.profileImage);
        }
        const newFiles = (formData.mediaGallery || []).filter(f => f instanceof File);
        newFiles.forEach(file => formDataToSend.append('media_gallery_0', file));

        const response = await fetch(endpoint, { method, body: formDataToSend });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', response.status, errorText);
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || data.msg || t('updateFailed'));
        }
        setSnackbar({ open: true, message: data.message || data.msg || t('updateSuccess'), severity: 'success' });
      } else {
        // Update -> PUT /api/business-profile/update/:id (per backend routes)
        const endpoint = `${baseurl}/api/business-profile/update/${businessProfileId}`;
        const method = 'PUT';

        // Send flat fields (controller accepts business_profile or direct fields)
        const profilePayload = {
          business_type: formData.business_type,
          company_name: formData.company_name,
          business_registration_type: registrationType === 'Others' ? customRegistrationType : registrationType,
          category_id: formData.category_id,
          about: formData.about,
          company_address: formData.company_address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          business_starting_year: formData.business_starting_year,
          staff_size: formData.staff_size,
          business_work_contract: formData.business_work_contract,
          email: formData.email,
          source: formData.source,
          tags: formData.tags,
          website: formData.website,
          google_link: formData.google_link,
          facebook_link: formData.facebook_link,
          instagram_link: formData.instagram_link,
          linkedin_link: formData.linkedin_link,
          designation: formData.designation,
          salary: formData.salary,
          location: formData.location,
          experience: formData.experience,
          status: formData.status, // Added status field
        };
        formDataToSend.append('business_profile', JSON.stringify(profilePayload));
        // Some multer configs only accept indexed keys; include profile_index and indexed field names
        formDataToSend.append('profile_index', '0');
        if (formData.profileImage instanceof File) {
          formDataToSend.append('business_profile_image_0', formData.profileImage);
        }
        const newFiles = (formData.mediaGallery || []).filter(f => f instanceof File);
        newFiles.forEach(file => formDataToSend.append('media_gallery_0', file));

        const response = await fetch(endpoint, { method, body: formDataToSend });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', response.status, errorText);
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || data.msg || t('updateFailed'));
        }
        setSnackbar({ open: true, message: data.message || data.msg || t('updateSuccess'), severity: 'success' });
      }
      // After success above, optionally navigate back if single
      if (businesses.length === 1) {
        setTimeout(() => navigate(-1), 2000);
      }
    } catch (error) {
      console.error('Update error details:', error);
      setSnackbar({
        open: true,
        message: error.message || t('updateFailed'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAddNewBusiness = () => {
    const newBusiness = createEmptyBusiness();
    const newBusinesses = [...businesses, newBusiness];
    setBusinesses(newBusinesses);
    setCurrentBusinessIndex(newBusinesses.length - 1);
    setFormData(newBusiness);
    setBusinessProfileId(null);
    setRegistrationType('');
    setCustomRegistrationType('');
    setShowCustomRegistration(false);
    setBusinessDialogOpen(false);

    setSnackbar({
      open: true,
      message: 'New business added. Fill in the details and save.',
      severity: 'info'
    });
  };

  const handleSelectBusiness = (index) => {
    const business = businesses[index];
    setCurrentBusinessIndex(index);
    setFormData(business);
    setBusinessProfileId(business.id || null);

    // Set registration type
    if (business.business_registration_type) {
      const isPredefinedType = registrationTypeOptions.includes(
        business.business_registration_type
      );
      if (isPredefinedType) {
        setRegistrationType(business.business_registration_type);
        setShowCustomRegistration(false);
      } else {
        setRegistrationType('Others');
        setCustomRegistrationType(business.business_registration_type);
        setShowCustomRegistration(true);
      }
    } else {
      setRegistrationType('');
      setCustomRegistrationType('');
      setShowCustomRegistration(false);
    }

    setBusinessDialogOpen(false);
  };

  const handleRemoveBusiness = (index) => {
    if (adminRole === 'community') {
      setSnackbar({ open: true, message: 'No permission to delete.', severity: 'warning' });
      return;
    }
    if (businesses.length <= 1) {
      setSnackbar({
        open: true,
        message: 'You must have at least one business.',
        severity: 'warning'
      });
      return;
    }

    const businessToRemove = businesses[index];
    const newBusinesses = businesses.filter((_, i) => i !== index);

    setBusinesses(newBusinesses);

    // If removing the current business, select the previous one
    if (index === currentBusinessIndex) {
      const newIndex = index === 0 ? 0 : index - 1;
      setCurrentBusinessIndex(newIndex);
      setFormData(newBusinesses[newIndex]);
      setBusinessProfileId(newBusinesses[newIndex].id || null);
    }

    // If the business was saved, call API to delete it
    if (businessToRemove.id) {
      deleteBusinessFromServer(businessToRemove.id);
    }
  };

  const deleteBusinessFromServer = async (id) => {
    try {
      const response = await fetch(`${baseurl}/api/business-profile/delete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete business');
      }

      setSnackbar({
        open: true,
        message: 'Business deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting business:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting business',
        severity: 'error'
      });
    }
  };

  // Determine if form should be disabled based on status
  const isFormDisabled = formData.status === 'Approved';

  // Get status color for chip
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Rejected': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <Box pb={10}>
      {/* Header with back button and title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/BusinessManagement')}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2E7D32' }}>
            Edit Business Details
          </Typography>
        </Box>
      </Box>

      {/* Business Selection Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Box display="flex" alignItems="center">
          <BusinessIcon sx={{ mr: 1, color: 'green' }} />
          <Typography variant="h6">
            {businesses[currentBusinessIndex]?.company_name || 'New Business'}
          </Typography>
        </Box>

        {/* Status Display */}
        <Chip
          label={formData.status}
          sx={{
            bgcolor: getStatusColor(formData.status),
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}
        />
      </Box>

      <Box p={2}>
        {/* Status Selection - Always enabled */}
        <Box display="flex" justifyContent="flex-start" mb={3}>
          <FormControl
            size="small"
            sx={{
              width: "50%",
              '& .MuiInputBase-root': {
                height: '40px'
              },
              textAlign: 'left'
            }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              label="Status"
              onChange={handleInputChange}
              sx={{
                "& .MuiSelect-select": {
                  textAlign: "left",
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
              disabled={isFormDisabled}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Profile Image Section */}
        {(formData.business_type === 'self-employed' || formData.business_type === 'business') && (
          <Box display="flex" flexDirection="column" alignItems="flex-start" mb={3}>
            <Avatar
              src={formData.profileImage instanceof File
                ? URL.createObjectURL(formData.profileImage)
                : formData.profileImage
                  ? `${baseurl}/${formData.profileImage}`
                  : ''}
              alt="Business Profile"
              sx={{ width: 100, height: 100, mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={() => triggerFileSelect('profile')}
              sx={{ bgcolor: 'green' }}
            >
              Upload Profile Photo
            </Button>
            <input
              type="file"
              ref={profileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              name="profileImage"
              style={{ display: 'none' }}
            />
          </Box>
        )}
        <Divider sx={{ mb: 3 }} />

        {/* Business Type */}
        <Box display="flex" flexDirection="column" alignItems="flex-start" mb={3}>
          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{ mb: 1, fontWeight: 'bold', textAlign: 'left' }}
            >
              Business Type
            </FormLabel>
            <RadioGroup
              row
              name="business_type"
              value={formData.business_type}
              onChange={handleInputChange}
            >
              <FormControlLabel
                value="self-employed"
                control={<Radio size="small" />}
                label="Self Employed"
              />
              <FormControlLabel
                value="business"
                control={<Radio size="small" />}
                label="Business"
              />
              <FormControlLabel
                value="salary"
                control={<Radio size="small" />}
                label="Salary"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* Business Name */}
        <Typography variant="h6" fontWeight="bold" mb={2} sx={{ textAlign: 'center' }}>
          Business Profile
        </Typography>
        <Box display="flex" justifyContent="flex-start" mb={3}>
          <TextField
            label="Business Name"
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            size="small"
            sx={{
              width: "50%",
              '& .MuiInputBase-root': {
                height: '40px',
              },
              '& .MuiInputLabel-root': {
                transform: 'translate(14px, 14px) scale(1)',
                '&.Mui-focused, &.MuiFormLabel-filled': {
                  transform: 'translate(14px, -9px) scale(0.75)',
                },
              },
            }}
          />
        </Box>
        <Box display="flex" justifyContent="flex-start" mb={3}>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
            size="small"
            sx={{
              width: "50%",
              '& .MuiInputBase-root': {
                height: '40px'
              },
              '& .MuiInputLabel-root': {
                transform: 'translate(14px, 14px) scale(1)',
                '&.Mui-focused, &.MuiFormLabel-filled': {
                  transform: 'translate(14px, -9px) scale(0.75)',
                }
              }
            }}
          />
        </Box>

        {/* Category Selection */}
        {(formData.business_type === 'self-employed' || formData.business_type === 'business') && (
          <Box display="flex" justifyContent="flex-start" mb={3}>
            <FormControl
              size="small"
              sx={{
                width: "50%",
                '& .MuiInputBase-root': {
                  height: '40px'
                },
                textAlign: 'left'
              }}
            >
              <InputLabel>Category</InputLabel>
              <Select
                name="category_id"
                value={formData.category_id}
                label="Category"
                onChange={handleInputChange}
                sx={{
                  "& .MuiSelect-select": {
                    textAlign: "left",
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center'
                  }
                }}
              >
                {categories.map((category) => (
                  <MenuItem
                    key={category.cid}
                    value={category.cid}
                    sx={{ justifyContent: "flex-start" }}
                  >
                    {category.category_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {(formData.business_type === 'self-employed' || formData.business_type === 'business') ? (
          <>
            {/* Business Registration Type */}
            <Box display="flex" justifyContent="flex-start" mb={3}>
              <FormControl
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  textAlign: 'left'
                }}
              >
                <InputLabel>Business Registration Type</InputLabel>
                <Select
                  name="business_registration_type"
                  value={registrationType}
                  label="Business Registration Type"
                  onChange={handleInputChange}
                  sx={{
                    "& .MuiSelect-select": {
                      textAlign: "left",
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }}
                >
                  {registrationTypeOptions.map((option) => (
                    <MenuItem key={option} value={option} sx={{ justifyContent: "flex-start" }}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Custom Registration Type Input - Only shown when "Others" is selected */}
            {showCustomRegistration && (
              <Box display="flex" justifyContent="flex-start" mb={3}>
                <TextField
                  label="Specify Business Registration Type"
                  name="custom_registration_type"
                  value={customRegistrationType}
                  onChange={handleInputChange}
                  error={!!errors.custom_registration_type}
                  helperText={errors.custom_registration_type}
                  size="small"
                  sx={{
                    width: "50%",
                    '& .MuiInputBase-root': {
                      height: '40px'
                    },
                    '& .MuiInputLabel-root': {
                      transform: 'translate(14px, 14px) scale(1)',
                      '&.Mui-focused, &.MuiFormLabel-filled': {
                        transform: 'translate(14px, -9px) scale(0.75)',
                      }
                    }
                  }}
                />
              </Box>
            )}

            {/* About Business */}
            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="About Business"
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                multiline
                rows={3}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    minHeight: '40px',
                    alignItems: 'flex-start'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>
          </>
        ) : (
          <>
            {/* Salary-specific basic fields */}
            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Salary"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                size="small"
                sx={{
                  width: '50%',
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>
          </>
        )}

        {/* Address Information */}
        {(formData.business_type === 'self-employed' || formData.business_type === 'business') && (
          <>
            <Typography variant="h6" fontWeight="bold" mb={2} sx={{ textAlign: 'center' }}>
              Address
            </Typography>
            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Company Address"
                name="company_address"
                value={formData.company_address}
                onChange={handleInputChange}
                multiline
                rows={2}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    minHeight: '40px',
                    alignItems: 'flex-start'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Box display="flex" flexDirection="row" gap={2} mb={3} sx={{ textAlign: 'left' }}>
              <TextField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
              <TextField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
              <TextField
                label="Pin Code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
                error={!!errors.zip_code}
                helperText={errors.zip_code}
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Business Starting Year"
                name="business_starting_year"
                value={formData.business_starting_year}
                onChange={handleInputChange}
                error={!!errors.business_starting_year}
                helperText={errors.business_starting_year}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Business Work Contract"
                name="business_work_contract"
                value={formData.business_work_contract}
                onChange={handleInputChange}
                multiline
                rows={2}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    minHeight: '40px',
                    alignItems: 'flex-start'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 2, textAlign: 'center', fontWeight: 'bold' }}>
              Additional Information
            </Typography>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Staff Size"
                name="staff_size"
                value={formData.staff_size}
                onChange={handleInputChange}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Referred By"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            {/* Social Media Links */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2, textAlign: 'center', fontWeight: 'bold' }}>
              Social Media & Links
            </Typography>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Tags (comma separated)"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Google Link"
                name="google_link"
                value={formData.google_link}
                onChange={handleInputChange}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -99px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Facebook Link"
                name="facebook_link"
                value={formData.facebook_link}
                onChange={handleInputChange}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="Instagram Link"
                name="instagram_link"
                value={formData.instagram_link}
                onChange={handleInputChange}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-start" mb={3}>
              <TextField
                label="LinkedIn Link"
                name="linkedin_link"
                value={formData.linkedin_link}
                onChange={handleInputChange}
                size="small"
                sx={{
                  width: "50%",
                  '& .MuiInputBase-root': {
                    height: '40px'
                  },
                  '& .MuiInputLabel-root': {
                    transform: 'translate(14px, 14px) scale(1)',
                    '&.Mui-focused, &.MuiFormLabel-filled': {
                      transform: 'translate(14px, -9px) scale(0.75)',
                    }
                  }
                }}
              />
            </Box>

            {/* Media Section */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2, textAlign: 'left' }}>
              Media
            </Typography>

            {/* Media Gallery */}
            <Box mt={3} sx={{ textAlign: 'left' }}>
              <Typography variant="body2" mb={1} sx={{ textAlign: 'left' }}>
                Upload images and videos:
              </Typography>
              <Button
                variant="contained"
                onClick={() => triggerFileSelect('gallery')}
                sx={{ bgcolor: 'green', mb: 2 }}
              >
                Upload Media
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                multiple
                name="mediaGallery"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Box display="flex" flexWrap="wrap" gap={2} sx={{ justifyContent: 'flex-start' }}>
                {formData.mediaGallery.map((media, index) => {
                  const isVideo = media instanceof File
                    ? media.type.startsWith('video/')
                    : media.match(/\.(mp4|webm|ogg)$/i);
                  const mediaUrl = media instanceof File
                    ? URL.createObjectURL(media)
                    : `${baseurl}/${media}`;
                  return isVideo ? (
                    <Box key={index} sx={{ textAlign: 'left' }}>
                      <video
                        src={mediaUrl}
                        width="150"
                        height="130"
                        controls
                        style={{ display: 'block' }}
                      />
                    </Box>
                  ) : (
                    <Box key={index} sx={{ textAlign: 'left' }}>
                      <img
                        src={mediaUrl}
                        alt={`media-${index}`}
                        width="150"
                        style={{
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </>
        )}

        {/* Save Button */}
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, bgcolor: 'green' }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t('Save Changes')}
        </Button>

        {/* Remove Business Button (only show if multiple businesses) */}
        {businesses.length > 1 && (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            onClick={() => handleRemoveBusiness(currentBusinessIndex)}
            disabled={loading}
          >
            Remove This Business
          </Button>
        )}
      </Box>

      {/* Business Selection Dialog */}
      <Dialog open={businessDialogOpen} onClose={() => setBusinessDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Businesses</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {businesses.map((business, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: currentBusinessIndex === index ? '#f5f5f5' : 'white'
                }}
              >
                <Typography>
                  {business.company_name || `Business ${index + 1}`}
                </Typography>
                <Box>
                  <Button
                    onClick={() => handleSelectBusiness(index)}
                    sx={{ mr: 1 }}
                  >
                    Select
                  </Button>
                  {businesses.length > 1 && (
                    <Button
                      color="error"
                      onClick={() => handleRemoveBusiness(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBusinessDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNewBusiness} startIcon={<AddIcon />} sx={{ color: 'green' }}>
            Add New Business
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* <Footer /> */}
    </Box>
  );
};

export default BusinessDirectoryForm;