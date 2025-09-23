import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Grid,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Footer from '../User/Footer';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import baseurl from '../Baseurl/baseurl';
import { ArrowBack } from '@mui/icons-material';

const EditMember = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for custom values when "Others" is selected
  const [customValues, setCustomValues] = useState({
    gender: '',
    kootam: '',
    kovil: ''
  });

  // State for profile image
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Details
    first_name: '',
    last_name: '',
    email: '',
    dob: '',
    gender: '',
    contact_no: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    // Advanced Details
    blood_group: '',
    alternate_contact_no: '',
    marital_status: '',
    work_phone: '',
    extension: '',
    mobile_no: '',
    preferred_contact: '',
    secondary_email: '',
    emergency_contact: '',
    emergency_phone: '',
    personal_website: '',
    best_time_to_contact: '',
    linkedin_profile: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    kootam: '',
    kovil: '',
    // New fields
    status: 'Pending',
    access_level: 'Basic',
    profile_image: '',
    rejection_reason: ''
  });

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setFetchLoading(true);
        const response = await fetch(`${baseurl}/api/member/${id}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.data) {
          const memberData = data.data;
          // Store member ID for update
          localStorage.setItem('memberId', memberData.mid);

          // Prepare form data
          const newFormData = {
            // Basic Details
            first_name: memberData.first_name || '',
            last_name: memberData.last_name || '',
            email: memberData.email || '',
            dob: memberData.dob || '',
            gender: memberData.gender || '',
            contact_no: memberData.contact_no || '',
            address: memberData.address || '',
            city: memberData.city || '',
            state: memberData.state || '',
            zip_code: memberData.zip_code || '',
            // Advanced Details
            blood_group: memberData.blood_group || '',
            alternate_contact_no: memberData.alternate_contact_no || '',
            marital_status: memberData.marital_status || '',
            work_phone: memberData.work_phone || '',
            extension: memberData.extension || '',
            mobile_no: memberData.mobile_no || '',
            preferred_contact: memberData.preferred_contact || '',
            secondary_email: memberData.secondary_email || '',
            emergency_contact: memberData.emergency_contact || '',
            emergency_phone: memberData.emergency_phone || '',
            personal_website: memberData.personal_website || '',
            best_time_to_contact: memberData.best_time_to_contact || '',
            linkedin_profile: memberData.linkedin_profile || '',
            facebook: memberData.facebook || '',
            instagram: memberData.instagram || '',
            twitter: memberData.twitter || '',
            youtube: memberData.youtube || '',
            kootam: memberData.kootam || '',
            kovil: memberData.kovil || '',
            // New fields
            status: memberData.status || 'Pending',
            access_level: memberData.access_level || 'Basic',
            profile_image: memberData.profile_image || '',
            rejection_reason: memberData.rejection_reason || ''
          };

          // Initialize custom values if existing value is not in predefined options
          const genderOptions = ['male', 'female', 'Others'];
          const kootamOptions = ['Agamudayar', 'Karkathar', 'Kallar', 'Maravar', 'Servai', 'Others'];
          const kovilOptions = [
            'Madurai Meenakshi Amman',
            'Thanjavur Brihadeeswarar',
            'Palani Murugan',
            'Srirangam Ranganathar',
            'Kanchipuram Kamakshi Amman',
            'Others'
          ];

          setCustomValues({
            gender: !genderOptions.includes(memberData.gender) ? memberData.gender : '',
            kootam: !kootamOptions.includes(memberData.kootam) ? memberData.kootam : '',
            kovil: !kovilOptions.includes(memberData.kovil) ? memberData.kovil : ''
          });

          // Set image preview if profile image exists
          if (memberData.profile_image) {
            setImagePreview(`${baseurl}/${memberData.profile_image}`);
          }

          setFormData(newFormData);
        } else {
          setError(data.message || 'Failed to load member data');
        }
      } catch (err) {
        console.error('Error fetching member data:', err);
        setError(`Failed to load member data: ${err.message}`);
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchMemberData();
    } else {
      setFetchLoading(false);
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomInputChange = (e) => {
    const { name, value } = e.target;
    setCustomValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Also update the main form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const memberId = localStorage.getItem('memberId');
      if (!memberId) {
        setError('Member ID not found');
        setLoading(false);
        return;
      }

      // Basic validation
      if (!formData.first_name || !formData.email) {
        setError('First name and email are required');
        setLoading(false);
        return;
      }

      // Prepare form data with custom values
      const formDataToSend = { ...formData };

      // If custom values exist, use them instead of "Others"
      if (customValues.gender && formData.gender === 'Others') {
        formDataToSend.gender = customValues.gender;
      }
      if (customValues.kootam && formData.kootam === 'Others') {
        formDataToSend.kootam = customValues.kootam;
      }
      if (customValues.kovil && formData.kovil === 'Others') {
        formDataToSend.kovil = customValues.kovil;
      }

      const formDataObj = new FormData();

      // Append only non-empty fields to avoid sending null/undefined values
      Object.entries(formDataToSend).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formDataObj.append(key, value);
        }
      });

      // Append image if selected
      if (selectedImage) {
        formDataObj.append('profile_image', selectedImage);
      }

      // Debug: Log what's being sent
      console.log('Sending form data:');
      for (let [key, value] of formDataObj.entries()) {
        console.log(key, value);
      }

      const response = await fetch(`${baseurl}/api/member/update/${memberId}`, {
        method: 'PUT',
        body: formDataObj
      });

      // Get response text first to handle both JSON and non-JSON responses
      const responseText = await response.text();
      console.log('Raw server response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }

      console.log('Parsed server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.msg || `HTTP error! status: ${response.status}`);
      }

      if (responseData.success) {
        setSuccess('Profile updated successfully');
        setTimeout(() => navigate(-1), 2000);
      } else {
        setError(responseData.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(`Failed to update profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (fieldName, config) => {
    // Special handling for rejection_reason - only show when status is Rejected
    if (fieldName === 'rejection_reason' && formData.status !== 'Rejected') {
      return null;
    }

    if (config.type === 'select') {
      // Special handling for gender, kootam, and kovil with "Others" option
      if (['gender', 'kootam', 'kovil'].includes(fieldName)) {
        const isOthersSelected = formData[fieldName] === 'Others';
        const hasCustomValue = customValues[fieldName] && !isOthersSelected;

        return (
          <div key={fieldName}>
            <FormControl fullWidth margin="dense">
              <InputLabel>{config.label}</InputLabel>
              <Select
                value={hasCustomValue ? 'Others' : (formData[fieldName] || '')}
                label={config.label}
                name={fieldName}
                onChange={handleInputChange}
                sx={{
                  "& .MuiSelect-select": {
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center"
                  }
                }}
              >
                {config.options.map(option => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{ justifyContent: "flex-start" }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(isOthersSelected || hasCustomValue) && (
              <TextField
                fullWidth
                margin="dense"
                label={`Custom ${config.label}`}
                name={fieldName}
                value={customValues[fieldName]}
                onChange={handleCustomInputChange}
                InputLabelProps={config.InputLabelProps}
                inputProps={{
                  style: { textAlign: "left" }
                }}
              />
            )}
          </div>
        );
      }

      // Regular select field
      return (
        <FormControl fullWidth margin="dense" key={fieldName}>
          <InputLabel>{config.label}</InputLabel>
          <Select
            value={formData[fieldName]}
            label={config.label}
            name={fieldName}
            onChange={handleInputChange}
            sx={{
              "& .MuiSelect-select": {
                textAlign: "left",
                display: "flex",
                alignItems: "center"
              }
            }}
          >
            {config.options.map(option => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{ justifyContent: "flex-start" }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    // Regular text field
    return (
      <TextField
        key={fieldName}
        fullWidth
        margin="dense"
        label={config.label}
        name={fieldName}
        type={config.type}
        value={formData[fieldName]}
        onChange={handleInputChange}
        required={config.required}
        multiline={config.multiline}
        rows={config.rows}
        InputLabelProps={config.InputLabelProps}
        inputProps={{
          style: { textAlign: "left" }
        }}
      />
    );
  };

  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Field configurations for different sections
  const accessControlConfig = {
    status: {
      label: t('Status'),
      type: 'select',
      options: [
        { value: 'Pending', label: t('Pending') },
        { value: 'Approved', label: t('Approved') },
        { value: 'Rejected', label: t('Rejected') }
      ],
      required: true
    },
    access_level: {
      label: t('Access Level'),
      type: 'select',
      options: [
        { value: 'Basic', label: t('Basic') },
        { value: 'Advanced', label: t('Advanced') }
      ],
      required: true
    },
    rejection_reason: {
      label: t('Rejection Reason'),
      type: 'text',
      multiline: true,
      rows: 3,
      required: formData.status === 'Rejected'
    }
  };

  const personalInfoConfig = {
    first_name: { label: t('First Name'), type: 'text', required: true },
    // last_name: { label: t('Last Name'), type: 'text' },
    email: { label: t('Email'), type: 'email', required: true },
    dob: { label: t('Date of Birth'), type: 'date', InputLabelProps: { shrink: true } },
    gender: {
      label: t('Gender'),
      type: 'select',
      options: [
        { value: 'male', label: t('Male') },
        { value: 'female', label: t('Female') },
        { value: 'Others', label: t('Others') }
      ]
    },
    kootam: {
      label: t('Kootam'),
      type: 'select',
      options: [
        { value: 'Agamudayar', label: t('Agamudayar') },
        { value: 'Karkathar', label: t('Karkathar') },
        { value: 'Kallar', label: t('Kallar') },
        { value: 'Maravar', label: t('Maravar') },
        { value: 'Servai', label: t('Servai') },
        { value: 'Others', label: t('Others') }
      ]
    },
    kovil: {
      label: t('Kovil'),
      type: 'select',
      options: [
        { value: 'Madurai Meenakshi Amman', label: t('Madurai Meenakshi Amman') },
        { value: 'Thanjavur Brihadeeswarar', label: t('Thanjavur Brihadeeswarar') },
        { value: 'Palani Murugan', label: t('Palani Murugan') },
        { value: 'Srirangam Ranganathar', label: t('Srirangam Ranganathar') },
        { value: 'Kanchipuram Kamakshi Amman', label: t('Kanchipuram Kamakshi Amman') },
        { value: 'Others', label: t('Others') }
      ]
    },
    blood_group: { label: t('Blood Group'), type: 'text' },
    marital_status: {
      label: t('Marital Status'),
      type: 'select',
      options: [
        { value: 'single', label: t('Single') },
        { value: 'married', label: t('Married') },
        { value: 'divorced', label: t('Divorced') },
        { value: 'widowed', label: t('Widowed') }
      ]
    },
  };
  const addressInfoConfig = {
    address: { label: t('Address'), type: 'text', multiline: true, rows: 3, required: true },
    city: { label: t('City'), type: 'text', required: true },
    state: { label: t('State'), type: 'text', required: true },
    zip_code: { label: t('Pin Code'), type: 'number', required: true }
  };

  const contactInfoConfig = {
    contact_no: { label: t('Contact Number'), type: 'text', required: true },
    mobile_no: { label: t('Mobile Number'), type: 'text' },
    preferred_contact: { label: t('Preferred Contact Method'), type: 'text' },
    secondary_email: { label: t('Secondary Email'), type: 'email' },
    emergency_contact: { label: t('Emergency Contact Name'), type: 'text' },
    best_time_to_contact: {
      label: t('Best Time to Contact'),
      type: 'select',
      options: [
        { value: 'morning', label: t('Morning') },
        { value: 'afternoon', label: t('Afternoon') },
        { value: 'evening', label: t('Evening') },
        { value: 'weekend', label: t('Weekend') }
      ]
    },
  };

  const additionalInfoConfig = {
    personal_website: { label: t('Personal Website'), type: 'text' },
    linkedin_profile: { label: t('LinkedIn Profile'), type: 'text' },
    facebook: { label: t('Facebook'), type: 'text' },
    instagram: { label: t('Instagram'), type: 'text' },
    twitter: { label: t('Twitter'), type: 'text' },
    youtube: { label: t('YouTube'), type: 'text' },

  };

  return (
    <Box pb={10}>
      {/* Header with back button and title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/MemberManagement')}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2E7D32' }}>
            Edit Member Details
          </Typography>
        </Box>
      </Box>

      {/* Error message at the top */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Success message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box p={2} component="form" onSubmit={handleSubmit}>
        {/* Access Control Section */}
        <Box display="flex" gap={3} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Access Control Card */}
          <Card sx={{ mb: 3, flex: 1 }}>
            <CardHeader
              title="Access Control"
              titleTypographyProps={{
                variant: "h6",
                color: "green",
                borderBottom: '2px solid #e0e0e0',
              }}
            />

            <CardContent>
              <Grid container spacing={2}>
                {Object.entries(accessControlConfig).map(([fieldName, config]) => (
                  <Grid item xs={12} sm={fieldName === 'rejection_reason' ? 12 : 6} key={fieldName}>
                    {renderField(fieldName, config)}
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Profile Image & Media Gallery Card */}
          <Card sx={{ mb: 3, flex: 1 }}>
            <CardHeader
              title="Profile Image & Media Gallery"
              titleTypographyProps={{
                variant: "h6",
                color: "green",
                borderBottom: '2px solid #e0e0e0',
              }}
            />
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={imagePreview}
                  alt="Profile"
                  sx={{ width: 80, height: 80, cursor: 'pointer' }}
                  onClick={triggerFileSelect}
                />
                <Box>
                  <Button
                    variant="outlined"
                    onClick={triggerFileSelect}
                    size="small"
                    sx={{ mb: 1 }}
                  >
                    {t('Change Image')}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <Typography variant="caption" display="block">
                    JPG, GIF or PNG. Max size of 5MB
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Personal Information Section */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Personal Information"
            titleTypographyProps={{
              variant: "h6",
              color: "green",
              borderBottom: '2px solid #e0e0e0',
            }}

          />
          <CardContent>
            <Grid container spacing={2}>
              {Object.entries(personalInfoConfig).map(([fieldName, config]) => (
                <Grid item xs={12} sm={6} key={fieldName}>
                  {renderField(fieldName, config)}
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Contact Information"
            titleTypographyProps={{
              variant: "h6",
              color: "green",
              borderBottom: '2px solid #e0e0e0',
            }}
          />
          <CardContent>
            <Grid container spacing={2}>
              {Object.entries(contactInfoConfig).map(([fieldName, config]) => (
                <Grid item xs={12} sm={6} key={fieldName}>
                  {renderField(fieldName, config)}
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Address"
            titleTypographyProps={{
              variant: "h6",
              color: "green",
              borderBottom: '2px solid #e0e0e0',
            }}
          />
          <CardContent>
            <Grid container spacing={2}>
              {Object.entries(addressInfoConfig).map(([fieldName, config]) => (
                <Grid item xs={12} sm={6} key={fieldName}>
                  {renderField(fieldName, config)}
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Additional Information Section */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Social Media"
            titleTypographyProps={{
              variant: "h6",
              color: "green",
              borderBottom: '2px solid #e0e0e0',
            }}
          />
          <CardContent>
            <Grid container spacing={2}>
              {Object.entries(additionalInfoConfig).map(([fieldName, config]) => (
                <Grid item xs={12} sm={6} key={fieldName}>
                  {renderField(fieldName, config)}
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{ bgcolor: 'green' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : t('Save Changes')}
          </Button>
        </Box>

      </Box>
    </Box>
  );
};

export default EditMember;