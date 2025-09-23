import React, { useState, useEffect } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import baseurl from '../Baseurl/baseurl';

const PersonalDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expanded, setExpanded] = useState('basic');
  
  // State for custom values when "Others" is selected
  const [customValues, setCustomValues] = useState({
    gender: '',
    kootam: '',
    kovil: ''
  });

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
    kovil: ''
  });

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setFetchLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          return;
        }
        const response = await fetch(`${baseurl}/api/member/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
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
            kovil: memberData.kovil || ''
          };
          
          // Initialize custom values if existing value is not in predefined options
          const genderOptions = ['male', 'female', 'Others'];
          const kootamOptions = ['Agamudayar', 'Karkathar', 'Kallar', 'Maravar', 'Servai', 'Others'];
          const kovilOptions = ['Madurai Meenakshi Amman', 'Thanjavur Brihadeeswarar', 'Palani Murugan', 'Srirangam Ranganathar', 'Kanchipuram Kamakshi Amman', 'Others'];
          
          setCustomValues({
            gender: !genderOptions.includes(memberData.gender) ? memberData.gender : '',
            kootam: !kootamOptions.includes(memberData.kootam) ? memberData.kootam : '',
            kovil: !kovilOptions.includes(memberData.kovil) ? memberData.kovil : ''
          });
          
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const memberId = localStorage.getItem('memberId');
      if (!token) {
        setError('Authentication required');
        return;
      }
      if (!memberId) {
        setError('Member ID not found');
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
      // Append all form data
      Object.entries(formDataToSend).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });

      const response = await fetch(`${baseurl}/api/member/update/${memberId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataObj
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success !== false) {
        setSuccess('Profile updated successfully');
        setTimeout(() => navigate(-1), 2000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(`Failed to update profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (fieldName, config) => {
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

  // Field configurations
  const basicFieldConfig = {
    first_name: { label: t('Name'), type: 'text', required: true },
    email: { label: t('email'), type: 'email', required: true },
    dob: { label: t('dob'), type: 'date', InputLabelProps: { shrink: true } },
    gender: {
      label: t('gender'),
      type: 'select',
      options: [
        { value: 'male', label: t('Male') },
        { value: 'female', label: t('Female') },
        // { value: 'other', label: t('Other') },
        { value: 'Others', label: t('Others') }
      ]
    },
    contact_no: { label: t('contactno'), type: 'text', required: true },
    address: { label: t('address'), type: 'text', multiline: true, rows: 3, required: true },
    city: { label: t('city'), type: 'text', required: true },
    state: { label: t('state'), type: 'text', required: true },
    zip_code: { label: t('Pin Code'), type: 'number', required: true }
  };

  const advancedFieldConfig = {
    last_name: { label: t('lastname'), type: 'text' },
    blood_group: { label: t('bloodgroup'), type: 'text' },
    marital_status: {
      label: t('maritalstatus'),
      type: 'select',
      options: [
        { value: 'single', label: t('Single') },
        { value: 'married', label: t('Married') },
        { value: 'divorced', label: t('Divorced') },
        { value: 'widowed', label: t('Widowed') }
      ]
    },
    mobile_no: { label: t('mobileno'), type: 'text' },
    preferred_contact: { label: t('preferredcontact'), type: 'text' },
    secondary_email: { label: t('secondaryemail'), type: 'email' },
    emergency_contact: { label: t('emergencycontact'), type: 'text' },
    personal_website: { label: t('personalwebsite'), type: 'text' },
    best_time_to_contact: {
      label: t('besttimetocontact'),
      type: 'select',
      options: [
        { value: 'morning', label: t('Morning') },
        { value: 'afternoon', label: t('Afternoon') },
        { value: 'evening', label: t('Evening') },
        { value: 'weekend', label: t('Weekend') }
      ]
    },
    linkedin_profile: { label: t('LinkedIn Profile'), type: 'text' },
    facebook: { label: t('Facebook'), type: 'text' },
    instagram: { label: t('Instagram'), type: 'text' },
    twitter: { label: t('Twitter'), type: 'text' },
    youtube: { label: t('YouTube'), type: 'text' },
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
            {t('personalDetails')}
          </Typography>
        </Box>
      </Box>
      <Box p={2} component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        {/* Basic Details Accordion */}
        <Accordion expanded={expanded === 'basic'} onChange={handleAccordionChange('basic')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">Basic Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Essential personal information
            </Typography>
            {Object.entries(basicFieldConfig).map(([fieldName, config]) =>
              renderField(fieldName, config)
            )}
          </AccordionDetails>
        </Accordion>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Advanced Details Accordion */}
        <Accordion expanded={expanded === 'advanced'} onChange={handleAccordionChange('advanced')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">Advanced Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Additional contact information and preferences
            </Typography>
            {Object.entries(advancedFieldConfig).map(([fieldName, config]) =>
              renderField(fieldName, config)
            )}
          </AccordionDetails>
        </Accordion>
        
        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={loading}
          sx={{ mt: 3, bgcolor: 'green' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t('updateChanges')}
        </Button>
      </Box>
      <Footer />
    </Box>
  );
};

export default PersonalDetailsPage;