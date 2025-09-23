import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Tab
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
    Facebook,
    Instagram,
    Twitter,
    YouTube
} from '@mui/icons-material';
import VideocamIcon from '@mui/icons-material/Videocam';

import baseurl from '../Baseurl/baseurl';
import * as XLSX from 'xlsx';

const BusinessManagement = () => {
    const navigate = useNavigate();
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const adminRole = typeof window !== 'undefined' ? localStorage.getItem('adminRole') : null;

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

                // Group businesses by member
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

        fetchBusinessProfiles();
    }, []);

    // Toggle expanded state for a member
    const toggleExpand = (mid) => {
        setExpandedMembers(prev => ({
            ...prev,
            [mid]: !prev[mid]
        }));
    };

    // Apply tab filter
    const tabbedGroups = Object.values(groupedBusinesses)
        .map(group => {
            // Filter businesses based on active tab
            let filteredBusinesses = group.businesses;
            
            if (activeTab === 'pending') {
                filteredBusinesses = group.businesses.filter(b => 
                    (b.status || '').toLowerCase() === 'pending'
                );
            }
            // For 'all' tab, we keep all businesses
            
            return {
                ...group,
                businesses: filteredBusinesses
            };
        })
        .filter(group => group.businesses.length > 0);

    // Filter business profiles based on search term
    const filteredGroups = tabbedGroups.filter(group => {
        const searchLower = searchTerm.toLowerCase();
        return (
            group.member.first_name?.toLowerCase().includes(searchLower) ||
            group.member.last_name?.toLowerCase().includes(searchLower) ||
            group.member.email?.toLowerCase().includes(searchLower) ||
            group.businesses.some(business =>
                (business.company_name || '').toLowerCase().includes(searchLower) ||
                (business.business_type || '').toLowerCase().includes(searchLower) ||
                (business.role || '').toLowerCase().includes(searchLower)
            )
        );
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return '#4CAF50';
            case 'Pending': return '#FF9800';
            case 'Rejected': return '#f44336';
            default: return '#757575';
        }
    };

    const handleEditBusiness = (business) => {
        // Navigate to the business edit form with the business ID
        navigate(`/admin/BusinessDirectory/${business.id}`);
    };
    const handleAddBusiness = (memberId) => {
        // Navigate to the add business form with the MEMBER ID
        navigate(`/admin/AddBusinessDirectory/${memberId}`);
    };

    const handleViewMember = (member) => {
        setSelectedMember(member);
        setViewDialogOpen(true);
    };

    const handleDeleteClick = (business) => {
        setSelectedMember({
            ...groupedBusinesses[business.mid].member,
            businessToDelete: business
        });
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedMember || !selectedMember.businessToDelete) return;

        try {
            const response = await fetch(`${baseurl}/api/business/delete/${selectedMember.businessToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete business profile');
            }

            // Remove the deleted business from the list
            setGroupedBusinesses(prev => {
                const newGrouped = { ...prev };
                if (newGrouped[selectedMember.mid]) {
                    newGrouped[selectedMember.mid].businesses = newGrouped[selectedMember.mid].businesses.filter(
                        b => b.id !== selectedMember.businessToDelete.id
                    );

                    // Remove member if no businesses left
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
        // Prepare data for export with all required business fields
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

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Business Profiles');

        // Generate file and trigger download
        XLSX.writeFile(wb, `business_profiles_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // Handle media click
    const handleMediaClick = (mediaUrl) => {
        setCurrentMedia(mediaUrl);
        setMediaViewerOpen(true);
    };

    // Calculate total businesses count
    const totalBusinesses = Object.values(groupedBusinesses).reduce(
        (total, group) => total + group.businesses.length, 0
    );

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
                            sx={{
                                color: '#666',
                                borderColor: '#ddd',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Filter
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{
                                color: '#666',
                                borderColor: '#ddd',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Sort by
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
                                    filteredGroups.map((group) => (
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
                                                                {`${group.member.first_name} ${group.member.last_name}`}
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
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: '#666' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddBusiness(group.member.mid);
                                                            }}
                                                        >
                                                            <BusinessIcon fontSize="small" />
                                                        </IconButton>
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
                                                                    // Check if this business should be disabled
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
                                                                                    {adminRole !== 'community' && (
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
                                                                                            Role
                                                                                        </Typography>
                                                                                        <Typography variant="body2">
                                                                                            {business.role || 'N/A'}
                                                                                        </Typography>
                                                                                    </Grid>
                                                                                    <Grid item xs={12}>
                                                                                        <Typography variant="body2" color="text.secondary">
                                                                                            Contact
                                                                                        </Typography>
                                                                                        <Typography variant="body2">
                                                                                            {business.contact || group.member.contact_no || 'N/A'}
                                                                                        </Typography>
                                                                                    </Grid>
                                                                                </Grid>
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
                            Showing {filteredGroups.length} of {Object.keys(groupedBusinesses).length} members
                        </Typography>
                        <Pagination
                            count={Math.ceil(Object.keys(groupedBusinesses).length / 10)}
                            page={1}
                            color="primary"
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
                                    {groupedBusinesses[selectedMember.mid].businesses.map((business, index) => (
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

                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} md={6}>
                                                            {/* Business Type Specific Fields */}
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
                                                                                Location
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="body1" fontWeight={500}>
                                                                            {business.location || 'N/A'}
                                                                        </Typography>
                                                                    </Box>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                        <Box sx={{ minWidth: 140 }}>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                Established
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="body1" fontWeight={500}>
                                                                            {business.business_starting_year || 'N/A'}
                                                                        </Typography>
                                                                    </Box>

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

                                                                    <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                        <Box sx={{ minWidth: 140 }}>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                Work Contract
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="body1" fontWeight={500}>
                                                                            {business.business_work_contract || 'N/A'}
                                                                        </Typography>
                                                                    </Box>
                                                                </>
                                                            )}
                                                        </Grid>

                                                        <Grid item xs={12} md={6}>
                                                            <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                <Box sx={{ minWidth: 140 }}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Business Email
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="body1" fontWeight={500}>
                                                                    {business.email || 'N/A'}
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

                                                            {/* Social Media Links */}
                                                            {(business.facebook_link || business.instagram_link || business.twitter_link || business.youtube_link) && (
                                                                <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                                    <Box sx={{ minWidth: 140 }}>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Social Media
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                                        {business.facebook_link && (
                                                                            <IconButton
                                                                                size="small"
                                                                                href={business.facebook_link}
                                                                                target="_blank"
                                                                                sx={{ color: '#1877F2' }}
                                                                            >
                                                                                <Facebook />
                                                                            </IconButton>
                                                                        )}
                                                                        {business.instagram_link && (
                                                                            <IconButton
                                                                                size="small"
                                                                                href={business.instagram_link}
                                                                                target="_blank"
                                                                                sx={{ color: '#E4405F' }}
                                                                            >
                                                                                <Instagram />
                                                                            </IconButton>
                                                                        )}
                                                                        {business.twitter_link && (
                                                                            <IconButton
                                                                                size="small"
                                                                                href={business.twitter_link}
                                                                                target="_blank"
                                                                                sx={{ color: '#1DA1F2' }}
                                                                            >
                                                                                <Twitter />
                                                                            </IconButton>
                                                                        )}
                                                                        {business.youtube_link && (
                                                                            <IconButton
                                                                                size="small"
                                                                                href={business.youtube_link}
                                                                                target="_blank"
                                                                                sx={{ color: '#FF0000' }}
                                                                            >
                                                                                <YouTube />
                                                                            </IconButton>
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Grid>

                                                        <Grid item xs={12}>
                                                            <Box sx={{ display: 'flex' }}>
                                                                <Box sx={{ minWidth: 140 }}>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Address
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="body1" fontWeight={500}>
                                                                    {business.company_address ?
                                                                        `${business.company_address}, ${business.city}, ${business.state} ${business.zip_code}` :
                                                                        'Not provided'}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>

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
        </Box>
    );
};

export default BusinessManagement;