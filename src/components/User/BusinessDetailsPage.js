import React, { useState, useEffect } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Footer from './Footer';
import baseurl from '../Baseurl/baseurl';

const BusinessDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [businessProfileId, setBusinessProfileId] = useState(null);
  const [expanded, setExpanded] = useState('basic');
  const [registrationType, setRegistrationType] = useState('');
  const [customRegistrationType, setCustomRegistrationType] = useState('');
  const [showCustomRegistration, setShowCustomRegistration] = useState(false);

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
  });

  const [errors, setErrors] = useState({});

  // Business registration type options
  const registrationTypeOptions = [
    "proprietor",
    "Partnership",
    "Others"
  ];

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

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
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseurl}/api/category/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const res = await fetch(`${baseurl}/api/member/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch member data: ${res.status}`);
        }
        const data = await res.json();
        const businessProfiles = data?.data?.BusinessProfiles;
        if (!businessProfiles || businessProfiles.length === 0) {
          throw new Error('Business profile not found.');
        }
        const business = businessProfiles[0];
        setBusinessProfileId(business.id);

        // Check if business registration type is one of the predefined options
        const isPredefinedType = registrationTypeOptions.includes(business.business_registration_type);

        setFormData({
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
        });

        // Set registration type state
        if (business.business_registration_type) {
          if (isPredefinedType) {
            setRegistrationType(business.business_registration_type);
            setShowCustomRegistration(false);
          } else {
            setRegistrationType('Others');
            setCustomRegistrationType(business.business_registration_type);
            setShowCustomRegistration(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch business data:', error);
        setSnackbar({
          open: true,
          message: error.message || t('failedToLoadData'),
          severity: 'error'
        });
      }
    };
    fetchData();
  }, [id, t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle registration type change
    if (name === 'business_registration_type') {
      setRegistrationType(value);
      if (value === 'Others') {
        setShowCustomRegistration(true);
        // Keep the existing custom value if it exists
        if (!customRegistrationType) {
          setCustomRegistrationType('');
        }
      } else {
        setShowCustomRegistration(false);
        setCustomRegistrationType('');
        // Update form data with the selected predefined type
        setFormData(prev => ({
          ...prev,
          business_registration_type: value
        }));
      }
    }
    // Handle custom registration type input
    else if (name === 'custom_registration_type') {
      setCustomRegistrationType(value);
      // Update form data with the custom value
      setFormData(prev => ({
        ...prev,
        business_registration_type: value
      }));
    }
    // Handle all other inputs
    else {
      // Validate the field as user types
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
      // Validate form before submission
      if (!validateForm()) {
        setSnackbar({
          open: true,
          message: 'Please fix the validation errors before submitting',
          severity: 'error'
        });
        return;
      }
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error(t('pleaseLogin'));
      if (!businessProfileId) throw new Error(t('businessProfileNotFound'));
      const formDataToSend = new FormData();
      formDataToSend.append('business_type', formData.business_type);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('company_name', formData.company_name);

      // Handle business registration type
      if (registrationType === 'Others') {
        formDataToSend.append('business_registration_type', customRegistrationType);
      } else {
        formDataToSend.append('business_registration_type', registrationType);
      }

      // Self-employed specific fields
      if (formData.business_type === 'self-employed') {
        formDataToSend.append('about', formData.about);
        formDataToSend.append('company_address', formData.company_address);
        formDataToSend.append('city', formData.city);
        formDataToSend.append('state', formData.state);
        formDataToSend.append('zip_code', formData.zip_code);
        formDataToSend.append('business_starting_year', formData.business_starting_year);
        formDataToSend.append('business_work_contract', formData.business_work_contract);
      }
      // Salary specific fields
      if (formData.business_type === 'salary') {
        formDataToSend.append('designation', formData.designation);
        formDataToSend.append('salary', formData.salary);
        formDataToSend.append('location', formData.location);
        formDataToSend.append('experience', formData.experience);
      }
      // Common fields - only add email if it's valid
      if (formData.business_type === 'self-employed') {
        formDataToSend.append('staff_size', formData.staff_size);
        if (formData.email && validateEmail(formData.email)) {
          formDataToSend.append('email', formData.email);
        }
        formDataToSend.append('source', formData.source);
        formDataToSend.append('tags', formData.tags);
        formDataToSend.append('website', formData.website);
        formDataToSend.append('google_link', formData.google_link);
        formDataToSend.append('facebook_link', formData.facebook_link);
        formDataToSend.append('instagram_link', formData.instagram_link);
        formDataToSend.append('linkedin_link', formData.linkedin_link);
      }
      if (formData.profileImage instanceof File) {
        formDataToSend.append('business_profile_image', formData.profileImage);
      }
      if (formData.mediaGallery.length > 0 && formData.mediaGallery[0] instanceof File) {
        formData.mediaGallery.forEach(file => {
          formDataToSend.append('media_gallery', file);
        });
      }
      // Log the request for debugging
      console.log('Updating business profile with ID:', businessProfileId);
      console.log('API Endpoint:', `${baseurl}/api/business-profile/update/${businessProfileId}`);
      const response = await fetch(`${baseurl}/api/business-profile/update/${businessProfileId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend
      });
      // Check response status before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || data.msg || t('updateFailed'));
      }
      setSnackbar({
        open: true,
        message: data.message || data.msg || t('updateSuccess'),
        severity: 'success'
      });
      setTimeout(() => navigate(-1), 2000);
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

  return (
    <Box pb={10}>
      <Box sx={{ bgcolor: 'green', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={1} sx={{ p: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography fontSize={14} fontWeight={600}>
            {t('businessDetails')}
          </Typography>
        </Box>
      </Box>
      <Box p={2}>
        {/* Basic Details Accordion */}
        <Accordion expanded={expanded === 'basic'} onChange={handleAccordionChange('basic')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">Basic Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* Business Type Selection */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Business Type</FormLabel>
              <RadioGroup
                row
                name="business_type"
                value={formData.business_type}
                onChange={handleInputChange}
              >
                <FormControlLabel value="self-employed" control={<Radio />} label="Self Employed" />
                <FormControlLabel value="business" control={<Radio />} label="Business" />
                <FormControlLabel value="salary" control={<Radio />} label="Salary" />
              </RadioGroup>
            </FormControl>
            {/* Category Selection - Only for self-employed */}
            {(formData.business_type === 'self-employed' || formData.business_type === 'business') && (
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category_id"
                  value={formData.category_id}
                  label="Category"
                  onChange={handleInputChange}
                  sx={{
                    "& .MuiSelect-select": { textAlign: "left" }
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem
                      key={category.cid}
                      value={category.cid}
                    >
                      {category.category_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {/* Company Name - Common for both types */}
            <TextField
              fullWidth
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleInputChange}
              size="small"
              sx={{ mb: 2 }}
            />
            {/* Conditional Fields Based on Business Type */}
            {formData.business_type === 'self-employed' ? (
              <>
                {/* Business Registration Type */}
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Business Registration Type</InputLabel>
                  <Select
                    name="business_registration_type"
                    value={registrationType}
                    label="Business Registration Type"
                    onChange={handleInputChange}
                    sx={{
                      "& .MuiSelect-select": { textAlign: "left" }
                    }}
                  >
                    {registrationTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Custom Registration Type Input - Only shown when "Others" is selected */}
                {showCustomRegistration && (
                  <TextField
                    fullWidth
                    label="Specify Business Registration Type"
                    name="custom_registration_type"
                    value={customRegistrationType}
                    onChange={handleInputChange}
                    error={!!errors.custom_registration_type}
                    helperText={errors.custom_registration_type}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                )}

                {/* About Business */}
                <TextField
                  fullWidth
                  label="About Business"
                  name="about"
                  value={formData.about}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </>
            ) : (
              <>
                {/* Salary-specific basic fields */}
                <TextField
                  fullWidth
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </>
            )}
          </AccordionDetails>
        </Accordion>
        {/* Advanced Details Accordion - Only for self-employed */}
        {(formData.business_type === 'self-employed' || formData.business_type === 'business') && (
          <>
            <Divider sx={{ my: 2 }} />
            <Accordion expanded={expanded === 'advanced'} onChange={handleAccordionChange('advanced')}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">Advanced Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Address Section */}
                <Typography variant="h6" gutterBottom>Address Information</Typography>
                <TextField
                  fullWidth
                  label="Company Address"
                  name="company_address"
                  value={formData.company_address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Box display="flex" gap={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Pin Code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    error={!!errors.zip_code}
                    helperText={errors.zip_code}
                    size="small"
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Business Starting Year"
                  name="business_starting_year"
                  value={formData.business_starting_year}
                  onChange={handleInputChange}
                  error={!!errors.business_starting_year}
                  helperText={errors.business_starting_year}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Business Work Contract"
                  name="business_work_contract"
                  value={formData.business_work_contract}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  size="small"
                  sx={{ mb: 2 }}
                />
                {/* Common Advanced Fields */}
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Additional Information</Typography>
                <TextField
                  fullWidth
                  label="Staff Size"
                  name="staff_size"
                  value={formData.staff_size}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Referred By"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ mb: 2 }}
                />
                {/* Social Media Links */}
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Social Media & Links</Typography>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Box display="flex" gap={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Google Link"
                    name="google_link"
                    value={formData.google_link}
                    onChange={handleInputChange}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Facebook Link"
                    name="facebook_link"
                    value={formData.facebook_link}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Box>
                <Box display="flex" gap={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Instagram Link"
                    name="instagram_link"
                    value={formData.instagram_link}
                    onChange={handleInputChange}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="LinkedIn Link"
                    name="linkedin_link"
                    value={formData.linkedin_link}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Box>
                {/* Media Section */}
                <Typography variant="h6" gutterBottom sx={{ mt: 2, textAlign: 'left' }}>Media</Typography>
                {/* Profile Image */}
                <Box mt={1} sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" mb={1} sx={{ textAlign: 'left' }}>Business Profile Image:</Typography>
                  <input
                    type="file"
                    accept="image/*"
                    name="profileImage"
                    onChange={handleFileChange}
                    style={{ marginBottom: '1rem' }}
                  />
                  {formData.profileImage && (
                    <Box sx={{ textAlign: 'left' }}>
                      <img
                        src={formData.profileImage instanceof File
                          ? URL.createObjectURL(formData.profileImage)
                          : `${baseurl}/${formData.profileImage}`}
                        alt="Business"
                        style={{
                          width: '100%',
                          maxWidth: 100,
                          height: 'auto',
                          display: 'block'
                        }}
                      />
                    </Box>
                  )}
                </Box>
                {/* Media Gallery */}
                <Box mt={3} sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" mb={1} sx={{ textAlign: 'left' }}>Upload images and videos:</Typography>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    name="mediaGallery"
                    onChange={handleFileChange}
                    style={{ marginBottom: '1rem' }}
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
              </AccordionDetails>
            </Accordion>
          </>
        )}
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, bgcolor: 'green' }}
          onClick={handleSubmit}
          disabled={loading || !businessProfileId}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t('updateChanges')}
        </Button>
      </Box>
      <Footer />
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
    </Box>
  );
};

export default BusinessDetailsPage;