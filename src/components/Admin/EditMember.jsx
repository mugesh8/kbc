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
  FormControlLabel,
  Checkbox,
  FormGroup,
  Switch,
  FormLabel,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Footer from '../User/Footer';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import baseurl from '../Baseurl/baseurl';
import { ArrowBack } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

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

  // State for additional forum memberships
  const [forumMemberships, setForumMemberships] = useState({
    arakattalai_member: false,
    kns_member: false,
    kbn_member: false,
    bni: false,
    rotary: false,
    lions: false,
    other_forums: ''
  });

  // State for squads
  const [squads, setSquads] = useState([
    'Govt Squad',
    'Doctor Squad',
    'Legal Squad',
    'Advisory Squad'
  ]);

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
    aadhar_no: '',
    // New fields
    status: 'Pending',
    access_level: 'Basic',
    profile_image: '',
    rejection_reason: '',
    // Pro Member fields
    pro: 'Unpro', // Changed from is_pro_member to match API
    core_pro: '', // Added to match API
    // Squad fields
    squad: '',
    squad_fields: '',
    new_squad_name: '', // Added to handle new squad names
    // Additional forum fields
    arakattalai_member: false,
    kns_member: false,
    kbn_member: false,
    bni: false,
    rotary: false,
    lions: false,
    other_forums: '',
    // Paid status fields
    paid_status: 'Unpaid',
    membership_valid_until: ''
  });

  // Pro members list for Core Pro dropdown
  const [proMembers, setProMembers] = useState([]);

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

          // Define predefined squads
          const predefinedSquads = ['Govt Squad', 'Doctor Squad', 'Legal Squad', 'Advisory Squad'];

          // Check if squad is predefined or custom
          let squadValue = memberData.squad || '';
          let newSquadNameValue = '';

          if (memberData.squad && !predefinedSquads.includes(memberData.squad)) {
            // This is a custom squad
            squadValue = memberData.squad; // Use the actual squad name
            newSquadNameValue = memberData.squad;

            // Add to squads list if not already there
            if (!squads.includes(memberData.squad)) {
              setSquads(prev => [...prev, memberData.squad]);
            }
          }

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
            aadhar_no: memberData.aadhaar || memberData.aadhar_no || '',
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
            rejection_reason: memberData.rejection_reason || '',
            // Pro Member fields - Updated to match API
            pro: memberData.pro || 'Unpro',
            core_pro: memberData.core_pro || '',
            // Squad fields - Updated to match API
            squad: squadValue,
            squad_fields: memberData.squad_fields || '',
            new_squad_name: newSquadNameValue,
            // Additional forum fields
            arakattalai_member: memberData.Arakattalai === 'Yes',
            kns_member: memberData.KNS_Member === 'Yes',
            kbn_member: memberData.KBN_Member === 'Yes',
            bni: memberData.BNI === 'Yes',
            rotary: memberData.Rotary === 'Yes',
            lions: memberData.Lions === 'Yes',
            other_forums: memberData.Other_forum || '',
            // Paid status fields
            paid_status: memberData.paid_status || 'Unpaid',
            membership_valid_until: memberData.membership_valid_until || ''
          };

          // Set forum memberships state
          setForumMemberships({
            arakattalai_member: memberData.Arakattalai === 'Yes',
            kns_member: memberData.KNS_Member === 'Yes',
            kbn_member: memberData.KBN_Member === 'Yes',
            bni: memberData.BNI === 'Yes',
            rotary: memberData.Rotary === 'Yes',
            lions: memberData.Lions === 'Yes',
            other_forums: memberData.Other_forum || ''
          });

          // Initialize custom values if existing value is not in predefined options
          const genderOptions = ['Male', 'Female', 'Others'];
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

  // Fetch Pro members for Core Pro dropdown
  useEffect(() => {
    const fetchProMembers = async () => {
      try {
        const res = await fetch(`${baseurl}/api/member/pro`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProMembers(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch pro members:', err);
      }
    };
    fetchProMembers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for squad selection
    if (name === 'squad') {
      if (value === 'add_new') {
        setFormData(prev => ({
          ...prev,
          squad: value,
          new_squad_name: ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          squad: value,
          new_squad_name: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

  const handleForumMembershipChange = (e) => {
    const { name, checked } = e.target;

    // Update forum memberships state
    setForumMemberships(prev => ({
      ...prev,
      [name]: checked
    }));

    // Update main form data
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleOtherForumsChange = (e) => {
    const { value } = e.target;

    // Update forum memberships state
    setForumMemberships(prev => ({
      ...prev,
      other_forums: value
    }));

    // Update main form data
    setFormData(prev => ({
      ...prev,
      other_forums: value
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

      // Handle squad field - if "add_new" is selected and new_squad_name has a value, use that
      if (formData.squad === 'add_new' && formData.new_squad_name) {
        formDataToSend.squad = formData.new_squad_name;

        // Add to squads list for future use
        if (!squads.includes(formData.new_squad_name)) {
          setSquads(prev => [...prev, formData.new_squad_name]);
        }
      }

      // Map forum memberships to API format
      formDataToSend.Arakattalai = formDataToSend.arakattalai_member ? 'Yes' : 'No';
      formDataToSend.KNS_Member = formDataToSend.kns_member ? 'Yes' : 'No';
      formDataToSend.KBN_Member = formDataToSend.kbn_member ? 'Yes' : 'No';
      formDataToSend.BNI = formDataToSend.bni ? 'Yes' : 'No';
      formDataToSend.Rotary = formDataToSend.rotary ? 'Yes' : 'No';
      formDataToSend.Lions = formDataToSend.lions ? 'Yes' : 'No';
      formDataToSend.Other_forum = formDataToSend.other_forums;

      // Remove old field names and temporary fields
      delete formDataToSend.arakattalai_member;
      delete formDataToSend.kns_member;
      delete formDataToSend.kbn_member;
      delete formDataToSend.bni;
      delete formDataToSend.rotary;
      delete formDataToSend.lions;
      delete formDataToSend.other_forums;
      delete formDataToSend.new_squad_name;

      // Handle paid status - if unpaid, clear membership_valid_until
      if (formDataToSend.paid_status === 'Unpaid') {
        formDataToSend.membership_valid_until = '';
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

    // Special handling for membership_valid_until - only show when paid_status is Paid
    if (fieldName === 'membership_valid_until' && formData.paid_status !== 'Paid') {
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
    paid_status: {
      label: t('Paid Status'),
      type: 'select',
      options: [
        { value: 'Unpaid', label: t('Unpaid') },
        { value: 'Paid', label: t('Paid') }
      ],
      required: true
    },
    membership_valid_until: {
      label: t('Membership Valid Until'),
      type: 'date',
      InputLabelProps: { shrink: true }
    },
    access_level: {
      label: t('Access Level'),
      type: 'select',
      options: [
        { value: 'Basic', label: t('Basic') },
        { value: 'Advanced', label: 'Advanced' }
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
    contact_no: { label: t('Contact Number'), type: 'text', required: true },
    email: { label: t('Email'), type: 'email', required: true },
    dob: { label: t('Date of Birth'), type: 'date', InputLabelProps: { shrink: true } },
    gender: {
      label: t('Gender'),
      type: 'select',
      options: [
        { value: 'Male', label: t('Male') },
        { value: 'Female', label: t('Female') },
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
    alternate_contact_no: { label: t('Alternate Contact Number'), type: 'text' },
    secondary_email: { label: t('Secondary Email'), type: 'email' },
    emergency_contact: { label: t('Emergency Contact Name'), type: 'text' },
    emergency_phone: { label: t('Emergency Contact Number'), type: 'text' },
    best_time_to_contact: {
      label: t('Best Time to Contact'),
      type: 'select',
      options: [
        { value: 'Business Hours (9 AM - 5 PM)', label: 'Business Hours (9 AM - 5 PM)' },
        { value: 'Morning (6 AM - 12 PM)', label: 'Morning (6 AM - 12 PM)' },
        { value: 'Afternoon (12 PM - 6 PM)', label: 'Afternoon (12 PM - 6 PM)' },
        { value: 'Evening (6 PM - 10 PM)', label: 'Evening (6 PM - 10 PM)' },
        { value: 'Anytime', label: 'Anytime' }
      ]
    },
    aadhar_no: { label: 'Aadhaar Number', type: 'text' },
    blood_group: { label: t('Blood Group'), type: 'text' },
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
        {/* Profile Image & Media Gallery Card */}
        <Box display="flex" gap={3} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
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

        <Box display="flex" gap={3} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Pro Member Card */}
          <Card sx={{ mb: 3, flex: 1 }}>
            <CardHeader
              title="Pro Member"
              titleTypographyProps={{ variant: "h6", color: "green", borderBottom: '2px solid #e0e0e0' }}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.pro === 'Pro'}
                    onChange={(e) => {
                      const value = e.target.checked ? 'Pro' : 'Unpro';
                      setFormData(prev => ({
                        ...prev,
                        pro: value,
                        core_pro: value === 'Pro' ? '' : prev.core_pro
                      }));
                    }}
                    name="pro" color="success"
                  />
                }
                label="Pro Member" labelPlacement="start"
                sx={{ justifyContent: 'space-between', marginLeft: 0, width: '100%' }}
              />
              {formData.pro === 'Unpro' && (
                <FormControl fullWidth margin="dense" sx={{ mt: 1 }}>
                  <InputLabel>Core Pro</InputLabel>
                  <Select
                    value={formData.core_pro || ''}
                    name="core_pro"
                    label="Core Pro"
                    onChange={handleInputChange}
                    sx={{ textAlign: 'left' }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {proMembers.map((m) => {
                      const fullName = [m.first_name].filter(Boolean).join(' ').trim() || m.first_name || m.email;
                      return (
                        <MenuItem key={m.mid} value={fullName}>{fullName}</MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

              )}
            </CardContent>
          </Card>

          {/* Squads Card */}
          <Card sx={{ mb: 3, flex: 1 }}>
            <CardHeader
              title="Squads"
              titleTypographyProps={{
                variant: "h6",
                color: "green",
                borderBottom: '2px solid #e0e0e0',
              }}
            />
            <CardContent>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Assign member to a squad.
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Select Squad</InputLabel>
                <Select
                  name="squad"
                  value={formData.squad || ""}
                  onChange={handleInputChange}
                  label="Select Squad"
                >
                  {/* Default squads */}
                  {squads.map((squad) => (
                    <MenuItem key={squad} value={squad}>{squad}</MenuItem>
                  ))}
                  <MenuItem value="add_new">Add new Squad</MenuItem>
                </Select>
              </FormControl>

              {/* Show new squad name input when "Add new Squad" is selected */}
              {formData.squad === "add_new" && (
                <TextField
                  fullWidth
                  margin="dense"
                  label="New Squad Name"
                  name="new_squad_name"
                  value={formData.new_squad_name || ""}
                  onChange={handleInputChange}
                  inputProps={{
                    style: { textAlign: "left" }
                  }}
                />
              )}

              {/* Show specialization input for predefined squads OR when new squad name has at least one character */}
              {(formData.squad && formData.squad !== "add_new") ||
                (formData.squad === "add_new" && formData.new_squad_name && formData.new_squad_name.length > 0) ? (
                <TextField
                  fullWidth
                  margin="dense"
                  label="Specialization"
                  name="squad_fields"
                  value={formData.squad_fields || ""}
                  onChange={handleInputChange}
                  inputProps={{
                    style: { textAlign: "left" }
                  }}
                />
              ) : null}
            </CardContent>
          </Card>
        </Box>

        {/* Unified Personal Details Section (mirroring UserProfilePage structure) */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Personal Details"
            titleTypographyProps={{
              variant: "h6",
              color: "green",
              borderBottom: '2px solid #e0e0e0',
            }}
          />
          <CardContent>
            {/* Basic Personal Details */}
            <Grid container spacing={2}>
              {Object.entries(personalInfoConfig).map(([fieldName, config]) => (
                <Grid item xs={12} sm={6} key={fieldName}>
                  {renderField(fieldName, config)}
                </Grid>
              ))}
            </Grid>

            {/* Address Information */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, color: '#1976d2' }}>
              Address Information
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(addressInfoConfig).map(([fieldName, config]) => (
                <Grid item xs={12} sm={6} key={fieldName}>
                  {renderField(fieldName, config)}
                </Grid>
              ))}
            </Grid>

            {/* Additional Contact Information */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, color: '#1976d2' }}>
              Additional Contact Information
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(contactInfoConfig).map(([fieldName, config]) => (
                <Grid item xs={12} sm={6} key={fieldName}>
                  {renderField(fieldName, config)}
                </Grid>
              ))}
            </Grid>

            {/* Social Media Information */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, color: '#1976d2' }}>
              Social Media Information
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(additionalInfoConfig).map(([fieldName, config]) => (
                <Grid item xs={12} sm={6} key={fieldName}>
                  {renderField(fieldName, config)}
                </Grid>
              ))}
            </Grid>

            {/* Forum Memberships */}
            <Typography variant="h6" sx={{ mt: 4, mb: 2, color: '#1976d2' }}>
              Forum Memberships
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset" fullWidth>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={forumMemberships.arakattalai_member}
                          onChange={handleForumMembershipChange}
                          name="arakattalai_member"
                          color="success"
                        />
                      }
                      label="Arakattalai Member"
                      labelPlacement="start"
                      sx={{
                        justifyContent: 'space-between',
                        marginLeft: 0,
                        marginRight: 0,
                        '& .MuiFormControlLabel-label': {
                          flex: 1
                        }
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={forumMemberships.kns_member}
                          onChange={handleForumMembershipChange}
                          name="kns_member"
                          color="success"
                        />
                      }
                      label="KNS Member"
                      labelPlacement="start"
                      sx={{
                        justifyContent: 'space-between',
                        marginLeft: 0,
                        marginRight: 0,
                        '& .MuiFormControlLabel-label': {
                          flex: 1
                        }
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={forumMemberships.kbn_member}
                          onChange={handleForumMembershipChange}
                          name="kbn_member"
                          color="success"
                        />
                      }
                      label="KBN Member"
                      labelPlacement="start"
                      sx={{
                        justifyContent: 'space-between',
                        marginLeft: 0,
                        marginRight: 0,
                        '& .MuiFormControlLabel-label': {
                          flex: 1
                        }
                      }}
                    />
                  </FormGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset" fullWidth>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={forumMemberships.bni}
                          onChange={handleForumMembershipChange}
                          name="bni"
                          color="success"
                        />
                      }
                      label="BNI"
                      labelPlacement="start"
                      sx={{
                        justifyContent: 'space-between',
                        marginLeft: 0,
                        marginRight: 0,
                        '& .MuiFormControlLabel-label': {
                          flex: 1
                        }
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={forumMemberships.rotary}
                          onChange={handleForumMembershipChange}
                          name="rotary"
                          color="success"
                        />
                      }
                      label="Rotary"
                      labelPlacement="start"
                      sx={{
                        justifyContent: 'space-between',
                        marginLeft: 0,
                        marginRight: 0,
                        '& .MuiFormControlLabel-label': {
                          flex: 1
                        }
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={forumMemberships.lions}
                          onChange={handleForumMembershipChange}
                          name="lions"
                          color="success"
                        />
                      }
                      label="Lions"
                      labelPlacement="start"
                      sx={{
                        justifyContent: 'space-between',
                        marginLeft: 0,
                        marginRight: 0,
                        '& .MuiFormControlLabel-label': {
                          flex: 1
                        }
                      }}
                    />
                  </FormGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Other Forums (Optional)"
                  name="other_forums"
                  value={forumMemberships.other_forums}
                  onChange={handleOtherForumsChange}
                  placeholder="Please specify other forum memberships"
                  inputProps={{
                    style: { textAlign: "left" }
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Access Control Card */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Access Control"
            titleTypographyProps={{
              variant: "h6",
              color: "green",
              borderBottom: '2px solid #e0e0e0',
            }}
          />
          <CardContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Manage member access level and payment status.
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(accessControlConfig).map(([fieldName, config]) => (
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