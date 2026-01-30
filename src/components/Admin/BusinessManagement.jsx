import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    IconButton,
    Pagination,
    useTheme,
    useMediaQuery,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Chip,
    Collapse,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Search,
    FilterList,
    Visibility,
    Edit,
    Delete,
    FileDownload,
    Close,
    Business as BusinessIcon,
    ExpandMore,
    ExpandLess,
    InsertDriveFile as InsertDriveFileIcon,
    Add,
    CloudUpload
} from '@mui/icons-material';
import VideocamIcon from '@mui/icons-material/Videocam';

import baseurl from '../Baseurl/baseurl';
import * as XLSX from 'xlsx';

const BUSINESS_PAGE_SIZE = 10;

// TagsInput Component (without label) - same behavior as in AddMembersForm
const TagsInput = ({ tags = [], onAdd, onRemove, suggestions = [] }) => {
    const [inputValue, setInputValue] = React.useState('');

    const filteredSuggestions = suggestions
        .filter(s => s.toLowerCase().includes(inputValue.toLowerCase()))
        .filter(s => !tags.some(t => t.toLowerCase() === s.toLowerCase()))
        .slice(0, 8);

    const handleAdd = (tag) => {
        if (!tag) return;
        const trimmed = tag.trim();
        if (!trimmed) return;
        if (tags.find(t => t.toLowerCase() === trimmed.toLowerCase())) return;
        onAdd && onAdd(trimmed);
        setInputValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAdd(inputValue);
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            onRemove && onRemove(tags.length - 1);
        }
    };

    return (
        <div style={{ marginBottom: '16px' }}>
            <div style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                backgroundColor: '#f9fafb'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {tags.map((tag, idx) => (
                        <span key={idx} style={{
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            {tag}
                            <button
                                type="button"
                                style={{
                                    color: '#166534',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                                onClick={() => onRemove && onRemove(idx)}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type to add tags"
                        style={{
                            flex: 1,
                            minWidth: '120px',
                            backgroundColor: 'transparent',
                            outline: 'none',
                            border: 'none',
                            color: '#374151'
                        }}
                    />
                </div>
            </div>
            {filteredSuggestions.length > 0 && (
                <div style={{
                    marginTop: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '8px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '8px'
                }}>
                    {filteredSuggestions.map((s, i) => (
                        <button
                            type="button"
                            key={i}
                            onClick={() => handleAdd(s)}
                            style={{
                                textAlign: 'left',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                backgroundColor: '#f9fafb',
                                border: '1px solid #f3f4f6',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#f0fdf4';
                                e.target.style.color = '#166534';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#f9fafb';
                                e.target.style.color = 'inherit';
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Business Profile Modal Component
const BusinessProfileModal = ({
    open,
    onClose,
    member,
    onSubmit,
    categories
}) => {
    const [businessData, setBusinessData] = useState({
        company_name: '',
        business_type: '',
        category_id: '',
        category_input: '',
        business_registration_type: '',
        business_registration_type_other: '',
        about: '',
        company_address: '',
        city: '',
        state: '',
        zip_code: '',
        staff_size: '',
        business_work_contract: '',
        email: '',
        source: '',
        tags: [],
        designation: '',
        salary: '',
        location: '',
        experience: '',
        contact_no: '',
        business_profile_image: null,
        media_gallery: [],
        branches: [],
        exclusive_member_benefit: '',
        status: 'Approved' // Set default status to Approved
    });

    const [categoryInput, setCategoryInput] = useState('');
    const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
    const [branches, setBranches] = useState([]);
    const [customBusinessRegistrationType, setCustomBusinessRegistrationType] = useState('');

    useEffect(() => {
        if (open) {
            // Initialize with main branch
            setBranches([{
                id: 1,
                branch_name: 'Main Branch',
                contact_no: '',
                email: '',
                company_address: '',
                city: '',
                state: '',
                zip_code: '',
                is_main: true
            }]);
        }
    }, [open]);

    const filteredCategories = (categories || [])
        .filter(c => c.category_name.toLowerCase().includes((categoryInput || '').toLowerCase()))
        .slice(0, 8);

    const handleBusinessDataChange = (field, value) => {
        setBusinessData(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectExistingCategory = (cid, name) => {
        handleBusinessDataChange("category_id", String(cid));
        setCategoryInput(name);
        setShowCategorySuggestions(false);
    };

    const handleCategoryInputChange = (value) => {
        setCategoryInput(value);
        setShowCategorySuggestions(true);
        handleBusinessDataChange("category_input", value);
        if (!value || value.trim() === '' || (businessData.category_id && value.trim().toLowerCase() !== (categories.find(c => String(c.cid) === String(businessData.category_id))?.category_name || '').toLowerCase())) {
            handleBusinessDataChange("category_id", '');
        }
    };

    const handleAddBranch = () => {
        const newBranchId = branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1;
        const newBranch = {
            id: newBranchId,
            branch_name: `Branch ${newBranchId}`,
            contact_no: '',
            email: '',
            company_address: '',
            city: '',
            state: '',
            zip_code: '',
            is_main: false
        };
        setBranches(prev => [...prev, newBranch]);
    };

    const handleRemoveBranch = (branchId) => {
        setBranches(prev => prev.filter(branch => branch.id !== branchId));
    };

    const handleBranchChange = (branchId, field, value) => {
        setBranches(prev => prev.map(branch =>
            branch.id === branchId ? { ...branch, [field]: value } : branch
        ));
    };

    const handleFileUpload = (field, file) => {
        if (field === 'media_gallery') {
            const filesArray = Array.from(file);
            setBusinessData(prev => ({
                ...prev,
                media_gallery: [...(prev.media_gallery || []), ...filesArray]
            }));
        } else {
            setBusinessData(prev => ({
                ...prev,
                [field]: file
            }));
        }
    };

    const handleRemoveProfileImage = () => {
        setBusinessData(prev => ({
            ...prev,
            business_profile_image: null
        }));
    };

    const handleRemoveMedia = (mediaIndex) => {
        setBusinessData(prev => ({
            ...prev,
            media_gallery: (prev.media_gallery || []).filter((_, idx) => idx !== mediaIndex)
        }));
    };

    // Tag handlers
    const handleTagAdd = (tag) => {
        setBusinessData(prev => ({
            ...prev,
            tags: [...(prev.tags || []), tag]
        }));
    };

    const handleTagRemove = (tagIndex) => {
        setBusinessData(prev => ({
            ...prev,
            tags: (prev.tags || []).filter((_, idx) => idx !== tagIndex)
        }));
    };

    const handleSubmit = async () => {
        // Validate required fields
        if (!businessData.business_type || !businessData.company_name) {
            alert('Business type and company name are required');
            return;
        }

        if (!businessData.category_id && !(businessData.category_input && businessData.category_input.trim())) {
            alert('Category is required');
            return;
        }

        if (businessData.business_type === 'self-employed' || businessData.business_type === 'business') {
            if (!businessData.about) {
                alert('About is required for this business type');
                return;
            }
        }

        if (businessData.business_type === 'salary') {
            if (!businessData.designation || !businessData.salary || !businessData.experience) {
                alert('Designation, salary, and experience are required for salary type');
                return;
            }
        }

        // Validate at least one branch has address data
        const hasValidBranch = branches && branches.some(branch =>
            branch.company_address && branch.city && branch.state && branch.zip_code
        );

        if (!hasValidBranch) {
            alert('At least one branch with complete address information is required');
            return;
        }

        try {
            const formData = new FormData();

            // Add member_id
            formData.append('member_id', member.mid);

            // Prepare business data - Set status to "Approved"
            const businessPayload = {
                company_name: businessData.company_name,
                business_type: businessData.business_type,
                salary: businessData.salary,
                category_id: businessData.category_id,
                category_input: businessData.category_input,
                business_registration_type: businessData.business_registration_type,
                business_registration_type_other: businessData.business_registration_type_other,
                about: businessData.about,
                staff_size: businessData.staff_size,
                designation: businessData.designation,
                experience: businessData.experience,
                source: businessData.source,
                tags: Array.isArray(businessData.tags) ? businessData.tags.join(',') : businessData.tags,
                website: businessData.website,
                google_link: businessData.google_link,
                facebook_link: businessData.facebook_link,
                instagram_link: businessData.instagram_link,
                linkedin_link: businessData.linkedin_link,
                exclusive_member_benefit: businessData.exclusive_member_benefit,
                status: 'Approved' // Explicitly set status to Approved
            };

            // Handle category
            if ((!businessPayload.category_id || String(businessPayload.category_id).trim() === '') && businessPayload.category_input && businessPayload.category_input.trim()) {
                businessPayload.new_category_name = businessPayload.category_input.trim();
                delete businessPayload.category_id;
            }

            // Handle business registration type
            if (businessData.business_registration_type !== 'Others') {
                delete businessPayload.business_registration_type_other;
            }

            // Handle branches
            if (branches && branches.length > 0) {
                const branch_names = branches.map(branch => branch.branch_name || '');
                const company_addresses = branches.map(branch => branch.company_address || '');
                const cities = branches.map(branch => branch.city || '');
                const states = branches.map(branch => branch.state || '');
                const zip_codes = branches.map(branch => branch.zip_code || '');
                const business_work_contract = branches.map(branch => branch.contact_no || '');
                const emails = branches.map(branch => branch.email || '');

                businessPayload.branch_name = branch_names;
                businessPayload.company_address = company_addresses;
                businessPayload.city = cities;
                businessPayload.state = states;
                businessPayload.zip_code = zip_codes;
                businessPayload.business_work_contract = business_work_contract;
                businessPayload.email = emails;
            }

            formData.append('business_profiles', JSON.stringify([businessPayload]));

            // Handle files
            if (businessData.business_profile_image) {
                formData.append('business_profile_image_0', businessData.business_profile_image);
            }

            if (businessData.media_gallery && businessData.media_gallery.length > 0) {
                businessData.media_gallery.forEach((file, index) => {
                    formData.append(`media_gallery_0`, file);
                });
            }

            const response = await fetch(`${baseurl}/api/add-business-profile/${member.mid}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorResult = await response.json().catch(() => null);
                throw new Error(errorResult?.msg || 'Failed to add business profile');
            }

            const result = await response.json();
            alert(result.msg || 'Business profile added successfully');
            onClose();
            if (onSubmit) onSubmit();
        } catch (error) {
            console.error('Error adding business profile:', error);
            alert(error.message || 'Failed to add business profile');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: '#4CAF50',
                color: 'white'
            }}>
                <Typography variant="h6" fontWeight={600}>
                    Add Business Profile for {member?.first_name}
                </Typography>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Business Type */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required sx={{ marginTop: '10px' }}>
                            <InputLabel>Business Type</InputLabel>
                            <Select
                                label="Business Type"
                                value={businessData.business_type || ''}
                                onChange={(e) => handleBusinessDataChange("business_type", e.target.value)}
                            >
                                <MenuItem value="self-employed">Self Employed</MenuItem>
                                <MenuItem value="business">Business</MenuItem>
                                <MenuItem value="salary">Salary</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Category */}
                    {(businessData.business_type === "self-employed" || businessData.business_type === "business" || businessData.business_type === "salary") && (
                        <Grid item xs={12} sm={6}>
                            <div style={{ marginBottom: '16px', position: 'relative' }}>
                                <label style={{ display: 'block', color: '#1f2937', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                                    Category <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={categoryInput}
                                    onChange={(e) => handleCategoryInputChange(e.target.value)}
                                    placeholder="Type to search or add category"
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        outline: 'none',
                                        backgroundColor: '#f9fafb',
                                    }}
                                    onFocus={() => setShowCategorySuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 150)}
                                />
                                {showCategorySuggestions && categoryInput && filteredCategories.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        zIndex: 20,
                                        marginTop: '8px',
                                        width: '100%',
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        maxHeight: '224px',
                                        overflow: 'auto'
                                    }}>
                                        {filteredCategories.map(cat => (
                                            <button
                                                type="button"
                                                key={cat.cid}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '12px 16px',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => handleSelectExistingCategory(cat.cid, cat.category_name)}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#f0fdf4';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                {cat.category_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Grid>
                    )}

                    {/* Company Name */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            required
                            label="Company Name"
                            value={businessData.company_name || ''}
                            onChange={(e) => handleBusinessDataChange("company_name", e.target.value)}
                            placeholder="Enter company name"
                            sx={{ marginTop: '10px' }}
                        />
                    </Grid>

                    {/* Business Registration Type for self-employed and business */}
                    {(businessData.business_type === "self-employed" || businessData.business_type === "business") && (
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth sx={{ marginTop: '10px' }}>
                                <InputLabel>Business Registration Type</InputLabel>
                                <Select
                                    value={businessData.business_registration_type || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleBusinessDataChange("business_registration_type", value);
                                        if (value !== "Others") {
                                            setCustomBusinessRegistrationType('');
                                            handleBusinessDataChange("business_registration_type_other", '');
                                        }
                                    }}
                                    label="Business Registration Type"
                                >
                                    <MenuItem value="Proprietor">Proprietor</MenuItem>
                                    <MenuItem value="Partnership">Partnership</MenuItem>
                                    <MenuItem value="Private Limited">Private Limited</MenuItem>
                                    <MenuItem value="Others">Others</MenuItem>
                                </Select>
                            </FormControl>
                            {businessData.business_registration_type === "Others" && (
                                <TextField
                                    fullWidth
                                    label="Specify Business Registration Type"
                                    value={customBusinessRegistrationType}
                                    onChange={(e) => {
                                        const customValue = e.target.value;
                                        setCustomBusinessRegistrationType(customValue);
                                        handleBusinessDataChange("business_registration_type_other", customValue);
                                    }}
                                    sx={{ mt: 1 }}
                                />
                            )}
                        </Grid>
                    )}

                    {/* Work Experience for Self-Employed */}
                    {businessData.business_type === "self-employed" && (
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Work Experience (years)"
                                placeholder="Enter years of experience"
                                type="number"
                                value={businessData.experience || ''}
                                onChange={(e) => handleBusinessDataChange("experience", e.target.value)}
                                sx={{ marginTop: '10px' }}
                            />
                        </Grid>
                    )}

                    {/* About Section */}
                    {(businessData.business_type === "self-employed" || businessData.business_type === "business") && (
                        <Grid item xs={12}>
                            <label style={{ display: 'block', color: '#1f2937', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                                About <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Enter company about"
                                required
                                value={businessData.about || ""}
                                onChange={(e) => handleBusinessDataChange("about", e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    resize: 'vertical',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </Grid>
                    )}

                    {/* Salary Fields */}
                    {businessData.business_type === "salary" && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Designation"
                                    placeholder="Enter designation"
                                    required
                                    value={businessData.designation || ""}
                                    onChange={(e) => handleBusinessDataChange("designation", e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Experience (Years)"
                                    placeholder="Enter years of experience"
                                    required
                                    value={businessData.experience || ""}
                                    onChange={(e) => handleBusinessDataChange("experience", e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Salary"
                                    placeholder="Enter salary"
                                    required
                                    value={businessData.salary || ""}
                                    onChange={(e) => handleBusinessDataChange("salary", e.target.value)}
                                />
                            </Grid>
                        </>
                    )}

                    {/* Branches Section */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Company Address & Branches
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={handleAddBranch}
                                color="primary"
                            >
                                Add Branch
                            </Button>
                        </Box>

                        {branches.map((branch, index) => (
                            <Box key={branch.id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {branch.is_main ? 'Main Branch' : `Branch ${index}`}
                                    </Typography>
                                    {!branch.is_main && (
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveBranch(branch.id)}
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    )}
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Branch Name"
                                            placeholder="Enter branch name"
                                            value={branch.branch_name || ''}
                                            onChange={(e) => handleBranchChange(branch.id, 'branch_name', e.target.value)}
                                            required={branch.is_main}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Contact Number"
                                            placeholder="Enter contact number"
                                            value={branch.contact_no || ''}
                                            onChange={(e) => handleBranchChange(branch.id, 'contact_no', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            placeholder="Enter email"
                                            type="email"
                                            value={branch.email || ''}
                                            onChange={(e) => handleBranchChange(branch.id, 'email', e.target.value)}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <label style={{ display: 'block', color: '#1f2937', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                                            Company Address {branch.is_main && <span style={{ color: '#ef4444' }}>*</span>}
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="Enter company address"
                                            value={branch.company_address || ""}
                                            onChange={(e) => handleBranchChange(branch.id, 'company_address', e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '16px',
                                                resize: 'vertical',
                                                outline: 'none',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="City"
                                            placeholder="Enter city"
                                            value={branch.city || ""}
                                            onChange={(e) => handleBranchChange(branch.id, 'city', e.target.value)}
                                            required={branch.is_main}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="State"
                                            placeholder="Enter state"
                                            value={branch.state || ""}
                                            onChange={(e) => handleBranchChange(branch.id, 'state', e.target.value)}
                                            required={branch.is_main}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label="Pincode"
                                            placeholder="Enter pincode"
                                            value={branch.zip_code || ""}
                                            onChange={(e) => handleBranchChange(branch.id, 'zip_code', e.target.value)}
                                            required={branch.is_main}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                    </Grid>

                    {/* Tags Input for all business types */}
                    <Grid item xs={12}>
                        <TagsInput
                            tags={businessData.tags || []}
                            onAdd={handleTagAdd}
                            onRemove={handleTagRemove}
                        />
                    </Grid>

                    {/* File Uploads */}
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Business Profile Image
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                    sx={{ minWidth: 200 }}
                                >
                                    Upload Image
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleFileUpload('business_profile_image', e.target.files[0]);
                                            }
                                        }}
                                    />
                                </Button>
                                {businessData.business_profile_image && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {businessData.business_profile_image.name}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={handleRemoveProfileImage}
                                            color="error"
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Media Gallery ({businessData.media_gallery?.length || 0}/5)
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                    sx={{ minWidth: 200 }}
                                >
                                    Upload Media
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                handleFileUpload('media_gallery', e.target.files);
                                            }
                                        }}
                                    />
                                </Button>
                            </Box>
                            {businessData.media_gallery && businessData.media_gallery.length > 0 && (
                                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {businessData.media_gallery.map((file, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                                            <Typography variant="caption" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {file.name}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveMedia(index)}
                                                color="error"
                                                sx={{ p: 0.25 }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSubmit}
                    sx={{ px: 4 }}
                >
                    Add Business Profile
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const BusinessManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [groupedBusinesses, setGroupedBusinesses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [expandedMembers, setExpandedMembers] = useState({});
    const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
    const [currentMedia, setCurrentMedia] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [memberBusinessesDetailed, setMemberBusinessesDetailed] = useState({});
    const [addBusinessModalOpen, setAddBusinessModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);

    // State for admin permissions
    const [permissions, setPermissions] = useState({
        canView: false,
        canAdd: false,
        canEdit: false,
        canDelete: false
    });

    // State for permission loading
    const [permissionLoading, setPermissionLoading] = useState(true);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const adminRole = typeof window !== 'undefined' ? localStorage.getItem('adminRole') : null;

    // Check URL parameters on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tab = urlParams.get('tab');

        if (tab === 'pending') {
            setActiveTab('pending');
        }
    }, [location.search]);

    // Fetch admin permissions
    useEffect(() => {
        const fetchAdminPermissions = async () => {
            try {
                setPermissionLoading(true);
                const role = localStorage.getItem('adminRole');
                const storedToken = localStorage.getItem('adminToken') || localStorage.getItem('accessToken');

                if (role === 'community' && storedToken) {
                    // Helper to decode JWT payload safely
                    const decodeJwt = (token) => {
                        try {
                            const payload = token.split('.')[1];
                            const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
                            return JSON.parse(decodeURIComponent(escape(json)));
                        } catch (e) {
                            try {
                                const json = atob(token.split('.')[1]);
                                return JSON.parse(json);
                            } catch {
                                return null;
                            }
                        }
                    };

                    const decoded = decodeJwt(storedToken);
                    if (decoded && decoded.id) {
                        const res = await fetch(`${baseurl}/api/community_admin/${decoded.id}`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data && data.role) {
                                // Parse role data - it comes as a JSON string from the database
                                let rolesArray = [];
                                try {
                                    if (typeof data.role === 'string' && data.role.startsWith('[')) {
                                        rolesArray = JSON.parse(data.role);
                                    } else if (Array.isArray(data.role)) {
                                        rolesArray = data.role;
                                    } else {
                                        rolesArray = [data.role];
                                    }
                                } catch (e) {
                                    console.error('Error parsing roles:', e);
                                    rolesArray = Array.isArray(data.role) ? data.role : [data.role];
                                }

                                // Find the Business Management role (case insensitive)
                                const businessRole = rolesArray.find(r =>
                                    r.toLowerCase().includes('business management')
                                );

                                if (businessRole) {
                                    // Check if it has specific permissions
                                    if (businessRole.includes('--')) {
                                        const permissionsStr = businessRole.split('--')[1].trim();
                                        const permissionList = permissionsStr.split(',').map(p => p.trim().toLowerCase());

                                        setPermissions({
                                            canView: permissionList.includes('view'),
                                            canAdd: permissionList.includes('add'),
                                            canEdit: permissionList.includes('edit'),
                                            canDelete: permissionList.includes('delete')
                                        });
                                    } else {
                                        // Only "Business Management" without specific permissions -> only view
                                        setPermissions({
                                            canView: true,
                                            canAdd: false,
                                            canEdit: false,
                                            canDelete: false
                                        });
                                    }
                                } else {
                                    // No Business Management role found - default to no permissions
                                    setPermissions({
                                        canView: false,
                                        canAdd: false,
                                        canEdit: false,
                                        canDelete: false
                                    });
                                }
                            }
                        } else {
                            // Failed to fetch admin data - default to view permission for safety
                            console.error('Failed to fetch admin data');
                            setPermissions({
                                canView: true,
                                canAdd: false,
                                canEdit: false,
                                canDelete: false
                            });
                        }
                    } else {
                        // Failed to decode token - default to view permission for safety
                        console.error('Failed to decode token');
                        setPermissions({
                            canView: true,
                            canAdd: false,
                            canEdit: false,
                            canDelete: false
                        });
                    }
                } else if (role === 'super') {
                    // Super admin has all permissions
                    setPermissions({
                        canView: true,
                        canAdd: true,
                        canEdit: true,
                        canDelete: true
                    });
                } else {
                    // No role found - default to no permissions
                    setPermissions({
                        canView: false,
                        canAdd: false,
                        canEdit: false,
                        canDelete: false
                    });
                }
            } catch (err) {
                console.error('Error fetching admin permissions:', err);
                // Default to view permission for safety in case of errors
                setPermissions({
                    canView: true,
                    canAdd: false,
                    canEdit: false,
                    canDelete: false
                });
            } finally {
                setPermissionLoading(false);
            }
        };

        fetchAdminPermissions();
    }, []);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${baseurl}/api/category/all`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCategories(data.data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Normalize branches helper
    const normalizeBranchesArray = (branches) => {
        if (!Array.isArray(branches) || branches.length === 0) return [];

        const fields = ['branch_name', 'company_address', 'city', 'state', 'zip_code', 'email', 'business_work_contract'];

        if (branches.length === 1) {
            const b = branches[0] || {};
            const toFlatArray = (val) => {
                if (Array.isArray(val)) {
                    return (val.length === 1 && Array.isArray(val[0])) ? val[0] : val;
                }
                return (val === undefined || val === null) ? [] : [String(val)];
            };

            const arrays = fields.map((f) => toFlatArray(b[f]));
            const maxLen = Math.max(0, ...arrays.map((a) => a.length));
            if (maxLen > 1) {
                return Array.from({ length: maxLen }, (_, i) => ({
                    branch_name: arrays[0][i] || '',
                    company_address: arrays[1][i] || '',
                    city: arrays[2][i] || '',
                    state: arrays[3][i] || '',
                    zip_code: arrays[4][i] || '',
                    email: arrays[5][i] || '',
                    business_work_contract: arrays[6][i] || ''
                }));
            }
        }

        return branches.map((b) => {
            const result = { ...b };
            fields.forEach((f) => {
                const v = result[f];
                if (Array.isArray(v)) {
                    result[f] = (v.length === 1) ? (Array.isArray(v[0]) ? (v[0][0] || '') : (v[0] || '')) : String(v[0] || '');
                }
            });
            return result;
        });
    };

    const parseArrayString = (value) => {
        try {
            if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    if (parsed.length === 1 && typeof parsed[0] === 'string' && parsed[0].startsWith('[') && parsed[0].endsWith(']')) {
                        const inner = JSON.parse(parsed[0]);
                        return Array.isArray(inner) ? inner : [String(inner ?? '')];
                    }
                    return parsed.map((v) => String(v ?? ''));
                }
                return [String(parsed ?? '')];
            }
        } catch (_) { }
        if (value === undefined || value === null || value === '') return [];
        return [String(value)];
    };

    const firstFromArrayish = (value) => {
        const arr = parseArrayString(value);
        return arr.length > 0 ? arr[0] : '';
    };

    // Fetch all business profiles
    useEffect(() => {
        const fetchBusinessProfiles = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${baseurl}/api/member/all`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.msg || 'Failed to fetch members');
                }

                const grouped = {};
                (data.data || []).forEach(member => {
                    if (member.BusinessProfiles && member.BusinessProfiles.length > 0) {
                        grouped[member.mid] = {
                            member: {
                                mid: member.mid,
                                first_name: member.first_name,
                                last_name: member.last_name,
                                email: member.email,
                                profile_image: member.profile_image,
                                status: member.status,
                                contact_no: member.contact_no,
                                city: member.city,
                                state: member.state,
                                zip_code: member.zip_code
                            },
                            businesses: member.BusinessProfiles
                        };
                    }
                });

                setGroupedBusinesses(grouped);

            } catch (err) {
                setError(err.message || 'An error occurred while fetching business profiles');
                console.error('Error fetching business profiles:', err);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if admin has view permission
        if (!permissionLoading && permissions.canView) {
            fetchBusinessProfiles();
        } else if (!permissionLoading && !permissions.canView) {
            setLoading(false);
            setError('You do not have permission to view business management');
        }
    }, [permissions.canView, permissionLoading]);

    // Refresh business profiles after adding new one
    const refreshBusinessProfiles = () => {
        const fetchBusinessProfiles = async () => {
            try {
                const response = await fetch(`${baseurl}/api/member/all`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.msg || 'Failed to fetch members');
                }

                const grouped = {};
                (data.data || []).forEach(member => {
                    if (member.BusinessProfiles && member.BusinessProfiles.length > 0) {
                        grouped[member.mid] = {
                            member: {
                                mid: member.mid,
                                first_name: member.first_name,
                                last_name: member.last_name,
                                email: member.email,
                                profile_image: member.profile_image,
                                status: member.status,
                                contact_no: member.contact_no,
                                city: member.city,
                                state: member.state,
                                zip_code: member.zip_code
                            },
                            businesses: member.BusinessProfiles
                        };
                    }
                });

                setGroupedBusinesses(grouped);
                setSnackbar({
                    open: true,
                    message: 'Business profile added successfully',
                    severity: 'success'
                });
            } catch (err) {
                console.error('Error refreshing business profiles:', err);
            }
        };

        fetchBusinessProfiles();
    };

    const toggleExpand = (mid) => {
        setExpandedMembers(prev => ({
            ...prev,
            [mid]: !prev[mid]
        }));
    };

    const tabbedGroups = Object.values(groupedBusinesses)
        .map(group => {
            let filteredBusinesses = group.businesses;

            if (activeTab === 'pending') {
                filteredBusinesses = group.businesses.filter(b =>
                    (b.status || '').toLowerCase() === 'pending'
                );
            }

            return {
                ...group,
                businesses: filteredBusinesses
            };
        })
        .filter(group => group.businesses.length > 0);

    const filteredGroups = tabbedGroups.filter(group => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
            group.member.first_name?.toLowerCase().includes(searchLower) ||
            group.member.last_name?.toLowerCase().includes(searchLower) ||
            group.member.email?.toLowerCase().includes(searchLower) ||
            group.businesses.some(business =>
                (business.company_name || '').toLowerCase().includes(searchLower) ||
                (business.business_type || '').toLowerCase().includes(searchLower) ||
                (business.role || '').toLowerCase().includes(searchLower)
            )
        );

        const matchesStatus = statusFilter === 'All' || group.member.status === statusFilter;

        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case 'name':
                aValue = `${a.member.first_name} ${a.member.last_name}`.toLowerCase();
                bValue = `${b.member.first_name} ${b.member.last_name}`.toLowerCase();
                break;
            case 'company':
                aValue = a.businesses[0]?.company_name?.toLowerCase() || '';
                bValue = b.businesses[0]?.company_name?.toLowerCase() || '';
                break;
            case 'type':
                aValue = a.businesses[0]?.business_type?.toLowerCase() || '';
                bValue = b.businesses[0]?.business_type?.toLowerCase() || '';
                break;
            case 'status':
                aValue = a.member.status || '';
                bValue = b.member.status || '';
                break;
            default:
                aValue = a.member.first_name?.toLowerCase() || '';
                bValue = b.member.first_name?.toLowerCase() || '';
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Pagination logic
    const totalFiltered = filteredGroups.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / BUSINESS_PAGE_SIZE));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (currentPage - 1) * BUSINESS_PAGE_SIZE;
    const endIndex = Math.min(startIndex + BUSINESS_PAGE_SIZE, totalFiltered);
    const paginatedGroups = filteredGroups.slice(startIndex, endIndex);

    // Reset to page 1 when filters/search/tab change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter, activeTab, sortBy, sortOrder]);

    // Keep page in valid range when total pages shrinks
    useEffect(() => {
        if (totalPages > 0 && page > totalPages) {
            setPage(totalPages);
        }
    }, [totalPages, page]);

    const handlePageChange = (event, newPage) => {
        if (typeof newPage === 'number' && newPage >= 1) {
            setPage(Math.min(newPage, totalPages));
        }
    };


    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return '#4CAF50';
            case 'Pending': return '#FF9800';
            case 'Rejected': return '#f44336';
            default: return '#757575';
        }
    };

    const handleEditBusiness = (business) => {
        if (!permissions.canEdit) return;
        navigate(`/admin/BusinessDirectory/${business.id}`);
    };

    const handleAddBusiness = (member) => {
        if (!permissions.canAdd) return;
        setSelectedMember(member);
        setAddBusinessModalOpen(true);
    };

    const handleViewMember = async (member) => {
        if (!permissions.canView) return;

        setSelectedMember(member);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const response = await fetch(`${baseurl}/api/business-profile/all?member_id=${member.mid}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const data = await response.json();
            if (response.ok && data.success && Array.isArray(data.data)) {
                const normalized = data.data.map((p) => ({
                    ...p,
                    branches: normalizeBranchesArray(p.branches)
                }));
                setMemberBusinessesDetailed(prev => ({ ...prev, [member.mid]: normalized }));
            } else {
                setMemberBusinessesDetailed(prev => ({ ...prev, [member.mid]: [] }));
            }
        } catch (err) {
            console.error('Failed to load detailed businesses:', err);
            setMemberBusinessesDetailed(prev => ({ ...prev, [member.mid]: [] }));
        } finally {
            setViewDialogOpen(true);
        }
    };

    const handleDeleteClick = (business) => {
        if (!permissions.canDelete) return;

        setSelectedMember({
            ...groupedBusinesses[business.mid].member,
            businessToDelete: business
        });
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedMember || !selectedMember.businessToDelete || !permissions.canDelete) return;

        try {
            const response = await fetch(`${baseurl}/api/business/delete/${selectedMember.businessToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete business profile');
            }

            setGroupedBusinesses(prev => {
                const newGrouped = { ...prev };
                if (newGrouped[selectedMember.mid]) {
                    newGrouped[selectedMember.mid].businesses = newGrouped[selectedMember.mid].businesses.filter(
                        b => b.id !== selectedMember.businessToDelete.id
                    );

                    if (newGrouped[selectedMember.mid].businesses.length === 0) {
                        delete newGrouped[selectedMember.mid];
                    }
                }
                return newGrouped;
            });

            setDeleteDialogOpen(false);
            setSelectedMember(null);
        } catch (error) {
            console.error('Error deleting business profile:', error);
        }
    };

    const handleExport = () => {
        const exportData = [];

        Object.values(groupedBusinesses).forEach(group => {
            group.businesses.forEach(business => {
                exportData.push({
                    'First Name': group.member.first_name,
                    'Last Name': group.member.last_name,
                    'Member Email': group.member.email,
                    'Status': group.member.status,
                    'Company Name': business.company_name || 'N/A',
                    'Business Type': business.business_type || 'N/A',
                    'Role': business.role || 'N/A',
                    'Company Address': business.company_address || 'N/A',
                    'City': business.city || 'N/A',
                    'State': business.state || 'N/A',
                    'Zip Code': business.zip_code || 'N/A',
                    'Experience': business.experience || 'N/A',
                    'Staff Size': business.staff_size || 'N/A',
                    'Business Contact': business.contact || 'N/A',
                    'Business Email': business.email || 'N/A',
                    'Source': business.source || 'N/A',
                    'Profile Image': business.business_profile_image || 'N/A',
                    'Media Gallery': business.media_gallery || 'N/A',
                    'Media Type': business.media_gallery_type || 'N/A'
                });
            });
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Business Profiles');
        XLSX.writeFile(wb, `business_profiles_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const handleMediaClick = (mediaUrl) => {
        setCurrentMedia(mediaUrl);
        setMediaViewerOpen(true);
    };

    const totalBusinesses = Object.values(groupedBusinesses).reduce(
        (total, group) => total + group.businesses.length, 0
    );

    // Show loading state while checking permissions
    if (permissionLoading) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Checking permissions...
                    </Typography>
                </Card>
            </Box>
        );
    }

    // If admin doesn't have view permission, show access denied message
    if (!permissions.canView) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', p: 4 }}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: '#f44336', mb: 2 }}>
                            Access Denied
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            You do not have permission to view the Business Management module.
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ mt: 3, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
                            onClick={() => navigate('/admin/dashboard')}
                        >
                            Back to Dashboard
                        </Button>
                    </Box>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2, md: 0 }
                }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                        }}
                    >
                        <Typography variant="h4" sx={{ fontWeight: 600, color: '#2E7D32', mb: 0.5 }}>
                            Business Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage Business Records
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', md: 'auto' } }}>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownload />}
                            onClick={handleExport}
                            sx={{
                                borderColor: '#ddd',
                                color: '#666',
                                '&:hover': { borderColor: '#999', backgroundColor: '#f9f9f9' },
                                px: 3,
                                py: 1.5,
                                fontWeight: 600
                            }}
                        >
                            Export
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* Main Content Card */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 0 }}>
                    {/* Controls */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, v) => setActiveTab(v)}
                            sx={{
                                px: 3,
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '1rem'
                                },
                                '& .Mui-selected': {
                                    backgroundColor: '#4CAF50',
                                    color: 'white !important',
                                    borderRadius: '20px 20px 0 0'
                                }
                            }}
                        >
                            <Tab label="All" value="all" />
                            <Tab label="Pending" value="pending" />
                        </Tabs>
                    </Box>
                    <Box sx={{
                        p: 3,
                        display: 'flex',
                        gap: 2,
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'stretch', md: 'center' }
                    }}>
                        <TextField
                            placeholder="Search businesses..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flexGrow: { xs: 1, md: 0 }, minWidth: { md: 300 } }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={() => setFilterDialogOpen(true)}
                            sx={{
                                color: '#666',
                                borderColor: '#ddd',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Filter
                        </Button>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Sort by</InputLabel>
                            <Select
                                value={sortBy}
                                label="Sort by"
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <MenuItem value="name">Member Name</MenuItem>
                                <MenuItem value="company">Company Name</MenuItem>
                                <MenuItem value="type">Business Type</MenuItem>
                                <MenuItem value="status">Status</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="outlined"
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            sx={{
                                color: '#666',
                                borderColor: '#ddd',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </Button>
                    </Box>

                    {/* Table */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Member</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Businesses</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                            <Typography>Loading businesses...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                            <Typography color="error">{error}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredGroups.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                            <Typography>No businesses found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedGroups.map((group) => (
                                        <React.Fragment key={group.member.mid}>
                                            <TableRow
                                                sx={{
                                                    '&:hover': { backgroundColor: '#f9f9f9' },
                                                    cursor: 'pointer',
                                                    backgroundColor: expandedMembers[group.member.mid] ? '#f0f0f0' : 'inherit'
                                                }}
                                                onClick={() => toggleExpand(group.member.mid)}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                backgroundColor: '#e0e0e0',
                                                                color: '#666',
                                                                fontSize: '0.875rem',
                                                                fontWeight: 600
                                                            }}
                                                            src={group.businesses[0]?.business_profile_image ? `${baseurl}/${group.businesses[0].business_profile_image}` : undefined}
                                                        >
                                                            {!group.businesses[0]?.business_profile_image && `${group.member.first_name?.[0] || ''}${group.member.last_name?.[0] || ''}`}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                                                {`${group.member.first_name}`}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {group.member.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {group.businesses.length} business(es)
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={group.member.status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: getStatusColor(group.member.status),
                                                            color: 'white',
                                                            fontWeight: 500,
                                                            minWidth: 80
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5}>
                                                        {/* Add Business Button */}
                                                        {permissions.canAdd && (
                                                            <IconButton
                                                                size="small"
                                                                sx={{ color: '#4CAF50' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAddBusiness(group.member);
                                                                }}
                                                                title="Add Business Profile"
                                                            >
                                                                <Add fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: '#666' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewMember(group.member);
                                                            }}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: '#666' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleExpand(group.member.mid);
                                                            }}
                                                        >
                                                            {expandedMembers[group.member.mid] ? (
                                                                <ExpandLess fontSize="small" />
                                                            ) : (
                                                                <ExpandMore fontSize="small" />
                                                            )}
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>

                                            {/* Business details row */}
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    sx={{
                                                        p: 0,
                                                        backgroundColor: expandedMembers[group.member.mid] ? '#fafafa' : 'transparent',
                                                        border: 'none'
                                                    }}
                                                >
                                                    <Collapse
                                                        in={expandedMembers[group.member.mid]}
                                                        timeout="auto"
                                                        unmountOnExit
                                                    >
                                                        <Box sx={{ p: 2, backgroundColor: '#fafafa' }}>
                                                            <Typography
                                                                variant="subtitle1"
                                                                fontWeight={600}
                                                                sx={{ mb: 1, color: '#2E7D32' }}
                                                            >
                                                                Business Profiles
                                                            </Typography>

                                                            <Grid container spacing={2}>
                                                                {group.businesses.map((business) => {
                                                                    const isDisabled = activeTab === 'all' && business.status === 'Pending';

                                                                    return (
                                                                        <Grid item xs={12} md={6} key={business.id}>
                                                                            <Paper
                                                                                elevation={0}
                                                                                sx={{
                                                                                    p: 2,
                                                                                    borderRadius: 2,
                                                                                    border: '1px solid #e0e0e0',
                                                                                    position: 'relative',
                                                                                    opacity: isDisabled ? 0.6 : 1,
                                                                                    backgroundColor: isDisabled ? '#f5f5f5' : 'white',
                                                                                    cursor: isDisabled ? 'not-allowed' : 'default'
                                                                                }}
                                                                            >
                                                                                <Box sx={{
                                                                                    position: 'absolute',
                                                                                    top: 8,
                                                                                    right: 8,
                                                                                    display: 'flex',
                                                                                    gap: 0.5
                                                                                }}>
                                                                                    {permissions.canEdit && (
                                                                                        <IconButton
                                                                                            size="small"
                                                                                            sx={{
                                                                                                color: isDisabled ? '#ccc' : '#666',
                                                                                                pointerEvents: isDisabled ? 'none' : 'auto'
                                                                                            }}
                                                                                            onClick={() => handleEditBusiness(business)}
                                                                                            disabled={isDisabled}
                                                                                        >
                                                                                            <Edit fontSize="small" />
                                                                                        </IconButton>
                                                                                    )}
                                                                                    {permissions.canDelete && (
                                                                                        <IconButton
                                                                                            size="small"
                                                                                            sx={{
                                                                                                color: isDisabled ? '#ccc' : '#f44336',
                                                                                                pointerEvents: isDisabled ? 'none' : 'auto'
                                                                                            }}
                                                                                            onClick={() => handleDeleteClick({
                                                                                                ...business,
                                                                                                mid: group.member.mid
                                                                                            })}
                                                                                            disabled={isDisabled}
                                                                                        >
                                                                                            <Delete fontSize="small" />
                                                                                        </IconButton>
                                                                                    )}
                                                                                </Box>

                                                                                <Typography
                                                                                    variant="subtitle1"
                                                                                    fontWeight={600}
                                                                                    sx={{ mb: 1 }}
                                                                                >
                                                                                    {business.company_name || 'Unnamed Business'}
                                                                                    {isDisabled && (
                                                                                        <Chip
                                                                                            label="Pending Approval"
                                                                                            size="small"
                                                                                            sx={{
                                                                                                ml: 1,
                                                                                                bgcolor: '#FF9800',
                                                                                                color: 'white',
                                                                                                fontSize: '0.7rem'
                                                                                            }}
                                                                                        />
                                                                                    )}
                                                                                </Typography>

                                                                                <Grid container spacing={1}>
                                                                                    <Grid item xs={6}>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            Type
                                                                                        </Typography>
                                                                                        <Typography variant="body2">
                                                                                            {business.business_type || 'N/A'}
                                                                                        </Typography>
                                                                                    </Grid>
                                                                                    <Grid item xs={6}>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            Status
                                                                                        </Typography>
                                                                                        <Typography variant="body2">
                                                                                            <Chip
                                                                                                label={business.status || 'N/A'}
                                                                                                size="small"
                                                                                                sx={{
                                                                                                    bgcolor: getStatusColor(business.status),
                                                                                                    color: 'white',
                                                                                                    fontWeight: 500,
                                                                                                    fontSize: '0.75rem'
                                                                                                }}
                                                                                            />
                                                                                        </Typography>
                                                                                    </Grid>
                                                                                    <Grid item xs={6}>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            Experience
                                                                                        </Typography>
                                                                                        <Typography variant="body2">
                                                                                            {business.experience || 'N/A'}
                                                                                        </Typography>
                                                                                    </Grid>
                                                                                    <Grid item xs={6}>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            Category ID
                                                                                        </Typography>
                                                                                        <Typography variant="body2">
                                                                                            {business.category_id || 'N/A'}
                                                                                        </Typography>
                                                                                    </Grid>
                                                                                    <Grid item xs={6}>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            Contact
                                                                                        </Typography>
                                                                                        <Typography variant="body2">
                                                                                            {(() => {
                                                                                                if (Array.isArray(business.business_work_contract)) {
                                                                                                    return business.business_work_contract.join(', ');
                                                                                                }
                                                                                                return firstFromArrayish(business.business_work_contract) || 'N/A';
                                                                                            })()}
                                                                                        </Typography>
                                                                                    </Grid>
                                                                                    <Grid item xs={6}>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            Tags
                                                                                        </Typography>
                                                                                        <Typography variant="body2">
                                                                                            {business.tags || 'N/A'}
                                                                                        </Typography>
                                                                                    </Grid>
                                                                                </Grid>
                                                                                {/* Branches (detailed view) */}
                                                                                {(() => {
                                                                                    const detailedList = memberBusinessesDetailed[group.member.mid] || [];
                                                                                    const detailed = detailedList.find(b => b.id === business.id);
                                                                                    const branches = detailed?.branches;
                                                                                    if (!branches || branches.length === 0) return null;
                                                                                    return (
                                                                                        <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #eee' }}>
                                                                                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#2E7D32', fontWeight: 600 }}>
                                                                                                Branches ({branches.length})
                                                                                            </Typography>
                                                                                            <Grid container spacing={1.5}>
                                                                                                {branches.map((br, idx) => (
                                                                                                    <Grid item xs={12} key={idx}>
                                                                                                        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 1.25 }}>
                                                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                                                                                <Typography variant="body2" fontWeight={600}>
                                                                                                                    {idx === 0 ? 'Main Branch' : `Branch ${idx + 1}`}
                                                                                                                </Typography>
                                                                                                                {br.branch_name && (
                                                                                                                    <Chip label={br.branch_name} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                                                                                                                )}
                                                                                                            </Box>
                                                                                                            <Grid container spacing={1}>
                                                                                                                <Grid item xs={12} sm={6}>
                                                                                                                    <Typography variant="caption" color="text.secondary">Email</Typography>
                                                                                                                    <Typography variant="body2">{br.email || 'N/A'}</Typography>
                                                                                                                </Grid>
                                                                                                                <Grid item xs={12} sm={6}>
                                                                                                                    <Typography variant="caption" color="text.secondary">Contact</Typography>
                                                                                                                    <Typography variant="body2">{br.business_work_contract || 'N/A'}</Typography>
                                                                                                                </Grid>
                                                                                                                <Grid item xs={12}>
                                                                                                                    <Typography variant="caption" color="text.secondary">Address</Typography>
                                                                                                                    <Typography variant="body2">
                                                                                                                        {br.company_address || br.address ? `${br.company_address || br.address}${(br.city || br.state || br.zip_code) ? ', ' : ''}${[br.city, br.state, br.zip_code].filter(Boolean).join(' ')}` : 'N/A'}
                                                                                                                    </Typography>
                                                                                                                </Grid>
                                                                                                            </Grid>
                                                                                                        </Box>
                                                                                                    </Grid>
                                                                                                ))}
                                                                                            </Grid>
                                                                                        </Box>
                                                                                    );
                                                                                })()}
                                                                            </Paper>
                                                                        </Grid>
                                                                    );
                                                                })}
                                                            </Grid>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <Box sx={{
                        p: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 2, md: 0 }
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            {totalFiltered === 0
                                ? 'Showing 0 businesses'
                                : `Showing ${startIndex + 1}-${endIndex} of ${totalFiltered} businesses (${BUSINESS_PAGE_SIZE} per page)`}
                        </Typography>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                            siblingCount={1}
                            boundaryCount={1}
                            sx={{
                                '& .MuiPaginationItem-root.Mui-selected': {
                                    backgroundColor: '#4CAF50',
                                    color: 'white'
                                }
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Add Business Profile Modal */}
            <BusinessProfileModal
                open={addBusinessModalOpen}
                onClose={() => setAddBusinessModalOpen(false)}
                member={selectedMember}
                onSubmit={refreshBusinessProfiles}
                categories={categories}
            />

            {/* View Member Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 3,
                        py: 2,
                        bgcolor: '#4CAF50',
                        borderBottom: '1px solid #e0e0e0',
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: 4,
                            background: 'linear-gradient(90deg, #4CAF50, #2196F3)'
                        }
                    }}
                >
                    <Typography variant="h5" fontWeight={700} color="#fff">
                        {selectedMember?.first_name}'s Business Profiles
                    </Typography>
                    <IconButton
                        onClick={() => setViewDialogOpen(false)}
                        aria-label="close"
                        sx={{
                            color: '#fff',
                            backgroundColor: 'rgba(92, 107, 192, 0.1)',
                            '&:hover': {
                                backgroundColor: 'rgba(92, 107, 192, 0.2)'
                            }
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {selectedMember && groupedBusinesses[selectedMember.mid] && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Member Summary Card */}
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    border: '1px solid #e0e0e0',
                                    background: 'linear-gradient(to right, #f8fbff, #f0f7ff)'
                                }}
                            >
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Box sx={{ position: 'relative' }}>
                                                <Avatar
                                                    src={
                                                        selectedMember.profile_image
                                                            ? `${baseurl}/${selectedMember.profile_image}`
                                                            : undefined
                                                    }
                                                    sx={{
                                                        width: 100,
                                                        height: 100,
                                                        fontSize: 36,
                                                        border: '2px solid #e0e0e0',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    {selectedMember.first_name?.[0]}
                                                    {selectedMember.last_name?.[0]}
                                                </Avatar>
                                                <Chip
                                                    label={selectedMember.status}
                                                    size="small"
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: -12,
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        bgcolor: getStatusColor(selectedMember.status),
                                                        color: '#fff',
                                                        fontWeight: 600,
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                        zIndex: 1
                                                    }}
                                                />
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={9}>
                                            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="h6" fontWeight={600} color="#2c387e">
                                                    {selectedMember.first_name} {selectedMember.last_name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Member ID: {selectedMember.mid}
                                                </Typography>
                                            </Box>

                                            <Divider sx={{ my: 1.5 }} />

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <BusinessIcon sx={{ color: '#5a6ac9', mr: 1.5 }} />
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Email
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={500}>
                                                                {selectedMember.email || 'Not provided'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} md={6}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <BusinessIcon sx={{ color: '#5a6ac9', mr: 1.5 }} />
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Phone
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={500}>
                                                                {selectedMember.contact_no || 'Not provided'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <BusinessIcon sx={{ color: '#5a6ac9', mr: 1.5 }} />
                                                        <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Location
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight={500}>
                                                                {selectedMember.city ?
                                                                    `${selectedMember.city}, ${selectedMember.state} ${selectedMember.zip_code}` :
                                                                    'Not provided'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            {/* Business Profiles Section */}
                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    color="#2c387e"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2,
                                        '&::after': {
                                            content: '""',
                                            flexGrow: 1,
                                            height: '1px',
                                            backgroundColor: '#e0e0e0',
                                            ml: 2
                                        }
                                    }}
                                >
                                    <BusinessIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                                    Business Profiles ({groupedBusinesses[selectedMember.mid].businesses.length})
                                </Typography>

                                <Grid container spacing={2}>
                                    {(memberBusinessesDetailed[selectedMember.mid] && memberBusinessesDetailed[selectedMember.mid].length > 0
                                        ? memberBusinessesDetailed[selectedMember.mid]
                                        : groupedBusinesses[selectedMember.mid].businesses
                                    ).map((business, index) => (
                                        <Grid item xs={12} key={index}>
                                            <Card
                                                elevation={0}
                                                sx={{
                                                    borderRadius: 2,
                                                    border: '1px solid #e0e0e0',
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                                                    }
                                                }}
                                            >
                                                <CardContent>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        mb: 2
                                                    }}>
                                                        <Box>
                                                            <Typography
                                                                variant="h6"
                                                                fontWeight={600}
                                                                sx={{
                                                                    color: '#2c387e',
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                {business.company_name || 'Unnamed Business'}
                                                                {index === 0 && (
                                                                    <Chip
                                                                        label="Primary"
                                                                        size="small"
                                                                        sx={{
                                                                            ml: 1.5,
                                                                            bgcolor: '#e3f2fd',
                                                                            color: '#1976d2',
                                                                            fontWeight: 600,
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                )}
                                                                {activeTab === 'all' && business.status === 'Pending' && (
                                                                    <Chip
                                                                        label="Pending Approval"
                                                                        size="small"
                                                                        sx={{
                                                                            ml: 1.5,
                                                                            bgcolor: '#FF9800',
                                                                            color: 'white',
                                                                            fontWeight: 600,
                                                                            fontSize: '0.7rem'
                                                                        }}
                                                                    />
                                                                )}
                                                            </Typography>
                                                            <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                <Chip
                                                                    label={business.business_type || 'N/A'}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: '#e8f5e9',
                                                                        color: '#2e7d32',
                                                                        fontWeight: 500,
                                                                        fontSize: '0.75rem'
                                                                    }}
                                                                />
                                                                <Chip
                                                                    label={business.status || 'N/A'}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: getStatusColor(business.status),
                                                                        color: 'white',
                                                                        fontWeight: 500,
                                                                        fontSize: '0.75rem'
                                                                    }}
                                                                />
                                                                {business.business_registration_type && (
                                                                    <Chip
                                                                        label={business.business_registration_type}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: '#e3f2fd',
                                                                            color: '#1976d2',
                                                                            fontWeight: 500,
                                                                            fontSize: '0.75rem'
                                                                        }}
                                                                    />
                                                                )}
                                                                {business.category_id && (
                                                                    <Chip
                                                                        label={`Category: ${business.category_id}`}
                                                                        size="small"
                                                                        sx={{
                                                                            bgcolor: '#f3e5f5',
                                                                            color: '#7b1fa2',
                                                                            fontWeight: 500,
                                                                            fontSize: '0.75rem'
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>
                                                        </Box>

                                                        {/* Business Profile Image */}
                                                        {business.business_profile_image && (
                                                            <Avatar
                                                                src={`${baseurl}/${business.business_profile_image}`}
                                                                sx={{
                                                                    width: 80,
                                                                    height: 80,
                                                                    borderRadius: 2,
                                                                    border: '2px solid #e0e0e0',
                                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                                                }}
                                                            />
                                                        )}
                                                    </Box>

                                                    {/* Business Description */}
                                                    {business.about && (
                                                        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {business.about}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {/* Common Fields for All Business Types */}
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} md={6}>
                                                            <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                <Box sx={{ minWidth: 140 }}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Experience
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="body1" fontWeight={500}>
                                                                    {business.experience || 'N/A'}
                                                                </Typography>
                                                            </Box>

                                                            <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                <Box sx={{ minWidth: 140 }}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Tags
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="body1" fontWeight={500}>
                                                                    {business.tags || 'N/A'}
                                                                </Typography>
                                                            </Box>

                                                            {/* Show business_registration_type_other if business_registration_type is "Others" */}
                                                            {business.business_registration_type === 'Others' && business.business_registration_type_other && (
                                                                <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                    <Box sx={{ minWidth: 140 }}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Registration Type (Other)
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography variant="body1" fontWeight={500}>
                                                                        {business.business_registration_type_other || 'N/A'}
                                                                    </Typography>
                                                                </Box>
                                                            )}

                                                            <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                <Box sx={{ minWidth: 140 }}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Staff Size
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="body1" fontWeight={500}>
                                                                    {business.staff_size || 'N/A'}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>

                                                        <Grid item xs={12} md={6}>
                                                            {business.business_type === 'salary' ? (
                                                                <>
                                                                    <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                        <Box sx={{ minWidth: 140 }}>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                Designation
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="body1" fontWeight={500}>
                                                                            {business.designation || 'N/A'}
                                                                        </Typography>
                                                                    </Box>

                                                                    <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                        <Box sx={{ minWidth: 140 }}>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                Salary
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="body1" fontWeight={500}>
                                                                            {business.salary ? `₹${business.salary}` : 'N/A'}
                                                                        </Typography>
                                                                    </Box>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                        <Box sx={{ minWidth: 140 }}>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                Registration Type
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="body1" fontWeight={500}>
                                                                            {business.business_registration_type || 'N/A'}
                                                                        </Typography>
                                                                    </Box>

                                                                    {business.business_type === 'self-employed' && (
                                                                        <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                            <Box sx={{ minWidth: 140 }}>
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    Work Contact
                                                                                </Typography>
                                                                            </Box>
                                                                            <Typography variant="body1" fontWeight={500}>
                                                                                {(() => {
                                                                                    if (Array.isArray(business.business_work_contract)) {
                                                                                        return business.business_work_contract.join(', ');
                                                                                    }
                                                                                    return firstFromArrayish(business.business_work_contract) || 'N/A';
                                                                                })()}
                                                                            </Typography>
                                                                        </Box>
                                                                    )}
                                                                </>
                                                            )}
                                                        </Grid>

                                                        {/* Social Media & Links Section */}
                                                        {(business.website || business.google_link || business.facebook_link || business.instagram_link || business.linkedin_link) && (
                                                            <Grid item xs={12}>
                                                                <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                                                    <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#2c387e' }}>
                                                                        Social Media & Links
                                                                    </Typography>
                                                                    <Grid container spacing={2}>
                                                                        {business.website && (
                                                                            <Grid item xs={12} sm={6} md={4}>
                                                                                <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                                    <Box sx={{ minWidth: 100 }}>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            Website
                                                                                        </Typography>
                                                                                    </Box>
                                                                                    <Typography variant="body1" fontWeight={500}>
                                                                                        <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                                                                            {business.website}
                                                                                        </a>
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Grid>
                                                                        )}
                                                                        {business.google_link && (
                                                                            <Grid item xs={12} sm={6} md={4}>
                                                                                <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                                    <Box sx={{ minWidth: 100 }}>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            Google
                                                                                        </Typography>
                                                                                    </Box>
                                                                                    <Typography variant="body1" fontWeight={500}>
                                                                                        <a href={business.google_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                                                                            {business.google_link}
                                                                                        </a>
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Grid>
                                                                        )}
                                                                        {business.facebook_link && (
                                                                            <Grid item xs={12} sm={6} md={4}>
                                                                                <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                                    <Box sx={{ minWidth: 100 }}>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            Facebook
                                                                                        </Typography>
                                                                                    </Box>
                                                                                    <Typography variant="body1" fontWeight={500}>
                                                                                        <a href={business.facebook_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                                                                            {business.facebook_link}
                                                                                        </a>
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Grid>
                                                                        )}
                                                                        {business.instagram_link && (
                                                                            <Grid item xs={12} sm={6} md={4}>
                                                                                <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                                    <Box sx={{ minWidth: 100 }}>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            Instagram
                                                                                        </Typography>
                                                                                    </Box>
                                                                                    <Typography variant="body1" fontWeight={500}>
                                                                                        <a href={business.instagram_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                                                                            {business.instagram_link}
                                                                                        </a>
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Grid>
                                                                        )}
                                                                        {business.linkedin_link && (
                                                                            <Grid item xs={12} sm={6} md={4}>
                                                                                <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                                    <Box sx={{ minWidth: 100 }}>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            LinkedIn
                                                                                        </Typography>
                                                                                    </Box>
                                                                                    <Typography variant="body1" fontWeight={500}>
                                                                                        <a href={business.linkedin_link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                                                                            {business.linkedin_link}
                                                                                        </a>
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Grid>
                                                                        )}
                                                                    </Grid>
                                                                </Box>
                                                            </Grid>
                                                        )}

                                                        {/* Branches Section */}
                                                        {business.branches && business.branches.length > 0 && (
                                                            <Grid item xs={12}>
                                                                <Box sx={{ mt: 2 }}>
                                                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#2c387e' }}>
                                                                        Branches ({business.branches.length})
                                                                    </Typography>
                                                                    <Grid container spacing={2}>
                                                                        {business.branches.map((branch, branchIndex) => (
                                                                            <Grid item xs={12} sm={6} md={4} key={branchIndex}>
                                                                                <Card sx={{
                                                                                    border: '1px solid #e0e0e0',
                                                                                    borderRadius: 2,
                                                                                    p: 2,
                                                                                    bgcolor: '#fafafa',
                                                                                    '&:hover': { boxShadow: 2 }
                                                                                }}>
                                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#5a6ac9' }}>
                                                                                        {branch.branch_name || `Branch ${branchIndex + 1}`}
                                                                                    </Typography>
                                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                                                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                                                                            <strong>Address:</strong> {branch.company_address || 'Not provided'}
                                                                                        </Typography>
                                                                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                                                                            <strong>City:</strong> {branch.city || 'Not provided'}
                                                                                        </Typography>
                                                                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                                                                            <strong>State:</strong> {branch.state || 'Not provided'}
                                                                                        </Typography>
                                                                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                                                                            <strong>Zip:</strong> {branch.zip_code || 'Not provided'}
                                                                                        </Typography>
                                                                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                                                                            <strong>Email:</strong> {branch.email || 'Not provided'}
                                                                                        </Typography>
                                                                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                                                                            <strong>Contact:</strong> {branch.business_work_contract || 'Not provided'}
                                                                                        </Typography>
                                                                                    </Box>
                                                                                </Card>
                                                                            </Grid>
                                                                        ))}
                                                                    </Grid>
                                                                </Box>
                                                            </Grid>
                                                        )}

                                                        {/* Media Gallery Section */}
                                                        {business.media_gallery && business.media_gallery.trim() !== '' && (
                                                            <Grid item xs={12}>
                                                                <Box sx={{ display: 'flex', mt: 2 }}>
                                                                    <Box sx={{ minWidth: 140 }}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Gallery
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        flexWrap: 'wrap',
                                                                        gap: 1.5,
                                                                        flex: 1
                                                                    }}>
                                                                        {business.media_gallery.split(',').map((media, idx) => {
                                                                            const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(media);
                                                                            const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(media);

                                                                            return (
                                                                                <Box
                                                                                    key={idx}
                                                                                    sx={{
                                                                                        width: 60,
                                                                                        height: 60,
                                                                                        borderRadius: 1.5,
                                                                                        overflow: 'hidden',
                                                                                        position: 'relative',
                                                                                        border: '1px solid #e0e0e0',
                                                                                        bgcolor: '#f9f9f9',
                                                                                        cursor: 'pointer',
                                                                                        transition: 'transform 0.2s',
                                                                                        '&:hover': {
                                                                                            transform: 'scale(1.05)',
                                                                                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                                                                                        }
                                                                                    }}
                                                                                    onClick={() => handleMediaClick(media.trim())}
                                                                                >
                                                                                    {isImage ? (
                                                                                        <img
                                                                                            src={`${baseurl}/${media.trim()}`}
                                                                                            alt={`Gallery item ${idx + 1}`}
                                                                                            style={{
                                                                                                width: '100%',
                                                                                                height: '100%',
                                                                                                objectFit: 'cover'
                                                                                            }}
                                                                                        />
                                                                                    ) : isVideo ? (
                                                                                        <Box sx={{
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center',
                                                                                            width: '100%',
                                                                                            height: '100%',
                                                                                            bgcolor: '#e0e0e0'
                                                                                        }}>
                                                                                            <VideocamIcon sx={{ color: '#757575', fontSize: 24 }} />
                                                                                        </Box>
                                                                                    ) : (
                                                                                        <Box sx={{
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center',
                                                                                            width: '100%',
                                                                                            height: '100%'
                                                                                        }}>
                                                                                            <InsertDriveFileIcon sx={{ color: '#757575', fontSize: 24 }} />
                                                                                        </Box>
                                                                                    )}
                                                                                    <Box sx={{
                                                                                        position: 'absolute',
                                                                                        bottom: 0,
                                                                                        right: 0,
                                                                                        bgcolor: 'rgba(0,0,0,0.7)',
                                                                                        px: 0.5,
                                                                                        borderTopLeftRadius: 4,
                                                                                        fontSize: 10,
                                                                                        fontWeight: 500,
                                                                                        color: 'white',
                                                                                        letterSpacing: 0.5
                                                                                    }}>
                                                                                        {isImage ? 'IMG' : isVideo ? 'VID' : 'FILE'}
                                                                                    </Box>
                                                                                </Box>
                                                                            );
                                                                        })}
                                                                    </Box>
                                                                </Box>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{
                    p: 2,
                    bgcolor: '#f5f7ff',
                    borderTop: '1px solid #e0e0e0',
                    justifyContent: 'center'
                }}>
                    <Button
                        variant="contained"
                        onClick={() => setViewDialogOpen(false)}
                        sx={{
                            bgcolor: '#4CAF50',
                            minWidth: 120,
                            '&:hover': { bgcolor: '#45a049' }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{
                    backgroundColor: '#f5f5f5',
                    color: '#d32f2f',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    Delete Business Record
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography>
                        Are you sure you want to delete this business record?
                    </Typography>
                    {selectedMember?.businessToDelete && (
                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff8e1', borderRadius: 1 }}>
                            <Typography variant="subtitle2">Business Details:</Typography>
                            <Typography>
                                {selectedMember.businessToDelete.company_name || 'Unnamed Business'}
                            </Typography>
                            <Typography variant="body2">
                                {selectedMember.businessToDelete.business_type}
                            </Typography>
                        </Box>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This action cannot be undone. The business data will be permanently removed.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        sx={{
                            color: '#666',
                            '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        startIcon={<Delete />}
                        sx={{
                            backgroundColor: '#d32f2f',
                            '&:hover': { backgroundColor: '#b71c1c' }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Media Viewer Dialog */}
            <Dialog
                open={mediaViewerOpen}
                onClose={() => setMediaViewerOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Media Preview</DialogTitle>
                <DialogContent sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px'
                }}>
                    {currentMedia && (() => {
                        const ext = currentMedia.split('.').pop().toLowerCase();
                        if (['jpeg', 'jpg', 'png', 'gif', 'webp'].includes(ext)) {
                            return (
                                <img
                                    src={`${baseurl}/${currentMedia}`}
                                    alt="Full size"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '80vh',
                                        objectFit: 'contain'
                                    }}
                                />
                            );
                        } else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
                            return (
                                <video
                                    controls
                                    autoPlay
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '80vh'
                                    }}
                                >
                                    <source
                                        src={`${baseurl}/${currentMedia}`}
                                        type={`video/${ext}`}
                                    />
                                    Your browser does not support the video tag.
                                </video>
                            );
                        } else {
                            return (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <InsertDriveFileIcon sx={{
                                        fontSize: 60,
                                        color: '#757575'
                                    }} />
                                    <Typography variant="h6" sx={{ mt: 2 }}>
                                        Unsupported Media Type
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        We cannot preview this file type. You can download it manually.
                                    </Typography>
                                </Box>
                            );
                        }
                    })()}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setMediaViewerOpen(false)}
                        variant="outlined"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Filter Dialog */}
            <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Filter Businesses</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Status"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="All">All</MenuItem>
                                    <MenuItem value="Approved">Approved</MenuItem>
                                    <MenuItem value="Pending">Pending</MenuItem>
                                    <MenuItem value="Rejected">Rejected</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => setFilterDialogOpen(false)} variant="contained">Apply</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BusinessManagement;