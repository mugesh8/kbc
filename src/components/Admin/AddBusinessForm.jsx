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
    DialogActions
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import Footer from '../User/Footer';
import baseurl from '../Baseurl/baseurl';
import { ArrowBack } from '@mui/icons-material';

const AddBusinessForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const params = useParams();
    const memberIdParam = params.member_id || params.id || Object.values(params || {})[0];
    const location = useLocation();
    const memberIdState = location?.state?.member_id;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const memberIdQuery = (() => {
        try {
            const searchParams = new URLSearchParams(location?.search || '');
            return searchParams.get('member_id');
        } catch (_) { return null; }
    })();
    const memberIdFromPath = (() => {
        try {
            const match = (location?.pathname || '').match(/\/(\d+)(?:\/?$)/);
            return match && match[1] ? match[1] : null;
        } catch (_) { return null; }
    })();
    // Prefer state/query over route param and localStorage to avoid stale IDs
    const initialResolved = (memberIdState || memberIdQuery || memberIdParam || memberIdFromPath || localStorage.getItem('member_id') || '').toString();
    const [memberId, setMemberId] = useState(initialResolved);
    const [memberIdPromptOpen, setMemberIdPromptOpen] = useState(!initialResolved);
    const [memberIdInput, setMemberIdInput] = useState('');

    // If location provides a new member_id, update state (and storage)
    useEffect(() => {
        const latest = (memberIdState || memberIdQuery || memberIdParam || memberIdFromPath || '').toString();
        if (latest && latest !== memberId) {
            setMemberId(latest);
            localStorage.setItem('member_id', latest);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberIdState, memberIdQuery, memberIdParam, memberIdFromPath, location?.pathname, location?.search]);
    const profileInputRef = useRef(null);
    const fileInputRef = useRef(null);

    // State variables
    const [businesses, setBusinesses] = useState([]);
    const [currentBusinessIndex, setCurrentBusinessIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [businessDialogOpen, setBusinessDialogOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [registrationTypeOptions, setRegistrationTypeOptions] = useState([
        "proprietor", "partnership", "LLP", "private limited", "public limited", "Others"
    ]);
    const [showCustomRegistration, setShowCustomRegistration] = useState(false);
    const [customRegistrationType, setCustomRegistrationType] = useState('');
    const [registrationType, setRegistrationType] = useState('');
    const [errors, setErrors] = useState({});

    // Initial form data
    const initialFormData = {
        profileImage: '',
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
        mediaGallery: [],
        designation: '',
        salary: '',
        location: '',
        experience: '',
    };

    const [formData, setFormData] = useState(initialFormData);

    // Fetch business profiles and categories
    useEffect(() => {
        const fetchData = async () => {
            // Fetch categories
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

            // Fetch business profiles for the member
            if (memberId) {
                try {
                    const businessRes = await fetch(`${baseurl}/api/business-profile/${memberId}`);
                    if (!businessRes.ok) {
                        throw new Error(`Failed to fetch business profiles: ${businessRes.status}`);
                    }
                    const businessData = await businessRes.json();

                    if (businessData && businessData.success) {
                        const raw = businessData.data ?? businessData.profiles ?? [];
                        const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
                        const memberBusinesses = list.filter(b => Number(b.member_id) === Number(memberId));

                        setBusinesses(memberBusinesses);

                        if (memberBusinesses.length > 0) {
                            populateFormData(memberBusinesses[0]);
                        } else {
                            setFormData(initialFormData);
                        }
                    } else {
                        setBusinesses([]);
                        setFormData(initialFormData);
                    }
                } catch (error) {
                    console.error('Failed to fetch business profiles:', error);
                    setSnackbar({
                        open: true,
                        message: 'Failed to load business profiles',
                        severity: 'error'
                    });
                }
            } else {
                setMemberIdPromptOpen(true);
            }
        };

        fetchData();
    }, [memberId]);

    // Populate form data from business object
    const populateFormData = (business) => {
        setFormData({
            profileImage: business.business_profile_image || '',
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
            mediaGallery: business.media_gallery ? business.media_gallery.split(',') : [],
            designation: business.designation || '',
            salary: business.salary || '',
            location: business.location || '',
            experience: business.experience || '',
        });

        setRegistrationType(business.business_registration_type || '');
        setShowCustomRegistration(business.business_registration_type === 'Others');
        setCustomRegistrationType(business.business_registration_type === 'Others' ? business.business_registration_type : '');
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'business_registration_type') {
            setRegistrationType(value);
            setShowCustomRegistration(value === 'Others');
            if (value !== 'Others') {
                setFormData({ ...formData, [name]: value });
                setCustomRegistrationType('');
            } else {
                setFormData({ ...formData, [name]: customRegistrationType });
            }
        } else if (name === 'custom_registration_type') {
            setCustomRegistrationType(value);
            setFormData({ ...formData, business_registration_type: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Handle file changes
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'profileImage') {
            setFormData({ ...formData, profileImage: files[0] });
        } else if (name === 'mediaGallery') {
            const newFiles = Array.from(files);
            setFormData({
                ...formData,
                mediaGallery: [...formData.mediaGallery, ...newFiles]
            });
        }
    };

    // Trigger file selection
    const triggerFileSelect = (type) => {
        if (type === 'profile') {
            profileInputRef.current.click();
        } else if (type === 'gallery') {
            fileInputRef.current.click();
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if member_id is available
        if (!memberId) {
            setSnackbar({ open: true, message: 'Member ID is missing. Please try again.', severity: 'error' });
            return;
        }

        setLoading(true);

        // Validate form
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setLoading(false);
            return;
        }

        try {
            // Prepare payload to match backend: expects business_profiles array
            const profilePayload = {
                company_name: formData.company_name,
                business_type: formData.business_type,
                category_id: formData.category_id,
                business_registration_type: showCustomRegistration ? customRegistrationType : registrationType,
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
            };

            const formDataToSend = new FormData();
            formDataToSend.append('business_profiles', JSON.stringify([profilePayload]));

            // Files for index 0 as per backend contract
            if (formData.profileImage instanceof File) {
                formDataToSend.append('business_profile_image_0', formData.profileImage);
            }
            formData.mediaGallery.forEach((file) => {
                if (file instanceof File) {
                    formDataToSend.append('media_gallery_0', file);
                }
            });

            // Determine if we're creating or updating
            const currentBusiness = businesses[currentBusinessIndex];
            const url = currentBusiness && currentBusiness.id
                ? `${baseurl}/api/business-profile/${currentBusiness.id}`
                : `${baseurl}/api/business-profile/${memberId}`;

            const method = currentBusiness && currentBusiness.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formDataToSend,
            });

            const result = await response.json();

            if (result.success) {
                setSnackbar({ open: true, message: 'Business profile saved successfully', severity: 'success' });

                // Refresh business data
                const businessResponse = await fetch(`${baseurl}/api/business-profile/${memberId}`);
                const businessData = await businessResponse.json();

                if (businessData && businessData.success) {
                    const raw = businessData.data ?? businessData.profiles ?? [];
                    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
                    const memberBusinesses = list.filter(b => Number(b.member_id) === Number(memberId));

                    setBusinesses(memberBusinesses);

                    // If we just created a new business, set it as current
                    if (!currentBusiness || !currentBusiness.id) {
                        setCurrentBusinessIndex(Math.max(0, memberBusinesses.length - 1));
                        if (memberBusinesses.length > 0) {
                            populateFormData(memberBusinesses[memberBusinesses.length - 1]);
                        } else {
                            setFormData(initialFormData);
                        }
                    }
                } else {
                    setBusinesses([]);
                    setFormData(initialFormData);
                }
            } else {
                setSnackbar({ open: true, message: result.message || 'Failed to save business profile', severity: 'error' });
            }
        } catch (error) {
            console.error('Error saving business profile:', error);
            setSnackbar({ open: true, message: 'Error saving business profile', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.company_name) {
            newErrors.company_name = 'Business name is required';
        }

        if ((formData.business_type === 'self-employed' || formData.business_type === 'business') && !formData.category_id) {
            newErrors.category_id = 'Category is required';
        }

        if (showCustomRegistration && !customRegistrationType) {
            newErrors.custom_registration_type = 'Please specify registration type';
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (formData.zip_code && !/^\d{6}$/.test(formData.zip_code)) {
            newErrors.zip_code = 'Pin code must be 6 digits';
        }

        if (formData.business_starting_year && (formData.business_starting_year < 1800 || formData.business_starting_year > new Date().getFullYear())) {
            newErrors.business_starting_year = 'Invalid year';
        }

        return newErrors;
    };

    // Handle business selection
    const handleSelectBusiness = (index) => {
        setCurrentBusinessIndex(index);
        populateFormData(businesses[index]);
        setBusinessDialogOpen(false);
    };

    // Handle business removal
    const handleRemoveBusiness = async (index) => {
        const business = businesses[index];
        if (!business || !business.id) {
            // Remove unsaved business
            const newBusinesses = [...businesses];
            newBusinesses.splice(index, 1);
            setBusinesses(newBusinesses);
            if (currentBusinessIndex >= index && currentBusinessIndex > 0) {
                setCurrentBusinessIndex(currentBusinessIndex - 1);
                populateFormData(newBusinesses[currentBusinessIndex - 1]);
            } else if (newBusinesses.length === 0) {
                setFormData(initialFormData);
            }
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${baseurl}/api/business-profile/${business.id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                setSnackbar({ open: true, message: 'Business profile removed successfully', severity: 'success' });
                const newBusinesses = [...businesses];
                newBusinesses.splice(index, 1);
                setBusinesses(newBusinesses);

                if (currentBusinessIndex === index) {
                    if (newBusinesses.length > 0) {
                        setCurrentBusinessIndex(0);
                        populateFormData(newBusinesses[0]);
                    } else {
                        setCurrentBusinessIndex(0);
                        setFormData(initialFormData);
                    }
                } else if (currentBusinessIndex > index) {
                    setCurrentBusinessIndex(currentBusinessIndex - 1);
                }
            } else {
                setSnackbar({ open: true, message: result.message || 'Failed to remove business profile', severity: 'error' });
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Error removing business profile', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Handle adding a new business
    const handleAddBusiness = () => {
        const newBusinesses = [...businesses, { ...initialFormData }];
        setBusinesses(newBusinesses);
        setCurrentBusinessIndex(newBusinesses.length - 1);
        setFormData(initialFormData);
        setBusinessDialogOpen(false);
    };

    // Close snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box pb={10} >
            {/* Current Member Context Bar */}
            {/* {memberId && (
                <Box sx={{ px: 2, py: 1, bgcolor: '#f7f7f7', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Working with Member ID: {memberId}</Typography>
                    <Button size="small" onClick={() => { setMemberIdInput(''); setMemberIdPromptOpen(true); }}>Change</Button>
                </Box>
            )} */}
            {/* Member ID Prompt */}
            <Dialog open={memberIdPromptOpen} onClose={() => setMemberIdPromptOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Enter Member ID</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Member ID was not found in the URL or navigation state. Please enter the member ID to continue.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Member ID"
                        value={memberIdInput}
                        onChange={(e) => setMemberIdInput(e.target.value)}
                        type="number"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={() => setMemberIdPromptOpen(false)} sx={{ mr: 1 }}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                if (memberIdInput) {
                                    localStorage.setItem('member_id', String(memberIdInput));
                                    setMemberId(String(memberIdInput));
                                    setMemberIdPromptOpen(false);
                                }
                            }}
                        >
                            Continue
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
            {/* Header with back button and title */}
            <Box>
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
                            Add Business Details
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Business Selection Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <Box display="flex" alignItems="center">
                    <BusinessIcon sx={{ mr: 1, color: 'green' }} />
                    <Typography variant="h6">
                        {businesses[currentBusinessIndex]?.company_name || 'Add New Business'}
                    </Typography>
                </Box>
                {/* <Button
                    startIcon={<AddIcon />}
                    onClick={() => setBusinessDialogOpen(true)}
                    sx={{ color: 'green' }}
                >
                    Manage Businesses
                </Button> */}
            </Box>

            <Box p={2}>
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
                        error={!!errors.company_name}
                        helperText={errors.company_name}
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
                            error={!!errors.category_id}
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
                            {errors.category_id && (
                                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                                    {errors.category_id}
                                </Typography>
                            )}
                        </FormControl>
                    </Box>
                )}

                {/* Business Registration Type */}
                {(formData.business_type === 'self-employed' || formData.business_type === 'business') && (
                    <>
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

                        {/* Custom Registration Type Input */}
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
                )}

                {/* Salary-specific fields */}
                {formData.business_type === 'salary' && (
                    <>
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
                                            transform: 'translate(14px, -9px) scale(0.75)',
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

                {/* Remove Business Button */}
                {businesses.length > 0 && (
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
                                    <Button
                                        color="error"
                                        onClick={() => handleRemoveBusiness(index)}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddBusiness}
                            sx={{ mt: 2 }}
                        >
                            Add New Business
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBusinessDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
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

export default AddBusinessForm;