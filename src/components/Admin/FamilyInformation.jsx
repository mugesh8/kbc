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
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Snackbar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Search,
    FilterList,
    Visibility,
    Edit,
    Delete,
    FileDownload,
    Email,
    Phone,
    LocationOn,
    Close,
    Person,
    FamilyRestroom,
    PersonAdd
} from '@mui/icons-material';
import baseurl from '../Baseurl/baseurl';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import * as XLSX from 'xlsx';
import AddFamilyDetailsForm from './AddFamilyDetailsForm';
import MemberSelectionDialog from './MemberSelectionDialog';

const FAMILY_PAGE_SIZE = 10;

const FamilyInformation = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('All');
    const [addFamilyDialogOpen, setAddFamilyDialogOpen] = useState(false);
    const [memberSelectionDialogOpen, setMemberSelectionDialogOpen] = useState(false);
    const [selectedMemberForFamily, setSelectedMemberForFamily] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const adminRole = typeof window !== 'undefined' ? localStorage.getItem('adminRole') : null;
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

    // Helper function to safely handle null/undefined/empty values
    const safeValue = (value) => {
        return (value === null || value === undefined || String(value).trim() === '') ? 'N/A' : value;
    };

    // Helper function to safely parse children names
    const parseChildrenNames = (childrenNames) => {
        if (!childrenNames || childrenNames === 'N/A') return 'N/A';
        try {
            const parsed = typeof childrenNames === 'string' ? JSON.parse(childrenNames) : childrenNames;
            return Array.isArray(parsed) && parsed.length ? parsed.join(', ') : 'N/A';
        } catch {
            return 'N/A';
        }
    };

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

                                // Find the Family Information role (case insensitive)
                                const familyRole = rolesArray.find(r =>
                                    r.toLowerCase().includes('family information')
                                );

                                if (familyRole) {
                                    // Check if it has specific permissions
                                    if (familyRole.includes('--')) {
                                        const permissionsStr = familyRole.split('--')[1].trim();
                                        const permissionList = permissionsStr.split(',').map(p => p.trim().toLowerCase());

                                        setPermissions({
                                            canView: permissionList.includes('view'),
                                            canAdd: permissionList.includes('add'),
                                            canEdit: permissionList.includes('edit'),
                                            canDelete: permissionList.includes('delete')
                                        });
                                    } else {
                                        // Only "Family Information" without specific permissions -> only view
                                        setPermissions({
                                            canView: true,
                                            canAdd: false,
                                            canEdit: false,
                                            canDelete: false
                                        });
                                    }
                                } else {
                                    // No Family Information role found - default to no permissions
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

    // Get members without family details for the dropdown
    const getMembersWithoutFamily = () => {
        return allMembers.filter(member => !member.MemberFamily);
    };

    const handleAddFamilySuccess = () => {
        setSnackbar({
            open: true,
            message: 'Family details added successfully!',
            severity: 'success'
        });

        // Refresh the members list
        const fetchMembers = async () => {
            try {
                const response = await fetch(`${baseurl}/api/member/all`);
                const data = await response.json();

                if (response.ok) {
                    setAllMembers(data.data || []);

                    const membersWithFamily = (data.data || [])
                        .filter(member => member.MemberFamily !== null)
                        .map(member => {
                            const fam = member.MemberFamily || {};
                            return {
                                ...member,
                                MemberFamily: {
                                    ...fam,
                                    father_name: safeValue(fam.father_name),
                                    father_contact: safeValue(fam.father_contact),
                                    mother_name: safeValue(fam.mother_name),
                                    mother_contact: safeValue(fam.mother_contact),
                                    spouse_name: safeValue(fam.spouse_name),
                                    spouse_contact: safeValue(fam.spouse_contact),
                                    number_of_children: fam.number_of_children ?? 0,
                                    children_names: safeValue(fam.children_names),
                                    address: safeValue(fam.address),
                                }
                            };
                        });

                    setMembers(membersWithFamily);
                }
            } catch (err) {
                console.error('Error refreshing members:', err);
            }
        };

        fetchMembers();
    };

    // Fetch members data and filter only those with family profiles
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${baseurl}/api/member/all`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.msg || 'Failed to fetch members');
                }

                // Store all members for adding family details
                setAllMembers(data.data || []);

                // Filter members to only include those with family profiles and safely handle data
                const membersWithFamily = (data.data || [])
                    .filter(member => member.MemberFamily !== null)
                    .map(member => {
                        const fam = member.MemberFamily || {};
                        return {
                            ...member,
                            MemberFamily: {
                                ...fam,
                                father_name: safeValue(fam.father_name),
                                father_contact: safeValue(fam.father_contact),
                                mother_name: safeValue(fam.mother_name),
                                mother_contact: safeValue(fam.mother_contact),
                                spouse_name: safeValue(fam.spouse_name),
                                spouse_contact: safeValue(fam.spouse_contact),
                                number_of_children: fam.number_of_children ?? 0,
                                children_names: safeValue(fam.children_names),
                                address: safeValue(fam.address),
                            }
                        };
                    });

                setMembers(membersWithFamily);

            } catch (err) {
                setError(err.message || 'An error occurred while fetching members');
                console.error('Error fetching members:', err);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if admin has view permission
        if (!permissionLoading && permissions.canView) {
            fetchMembers();
        } else if (!permissionLoading && !permissions.canView) {
            setLoading(false);
            setError('You do not have permission to view family information');
        }
    }, [permissions.canView, permissionLoading]);

    // Filter and sort members
    const filteredMembers = members.filter(member => {
        const matchesSearch = member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.MemberFamily?.father_name && member.MemberFamily.father_name !== 'N/A' && member.MemberFamily.father_name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'All' || member.status === statusFilter;

        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case 'name':
                aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
                bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
                break;
            case 'father':
                aValue = a.MemberFamily?.father_name?.toLowerCase() || '';
                bValue = b.MemberFamily?.father_name?.toLowerCase() || '';
                break;
            case 'mother':
                aValue = a.MemberFamily?.mother_name?.toLowerCase() || '';
                bValue = b.MemberFamily?.mother_name?.toLowerCase() || '';
                break;
            case 'spouse':
                aValue = a.MemberFamily?.spouse_name?.toLowerCase() || '';
                bValue = b.MemberFamily?.spouse_name?.toLowerCase() || '';
                break;
            case 'status':
                aValue = a.status || '';
                bValue = b.status || '';
                break;
            default:
                aValue = a.first_name?.toLowerCase() || '';
                bValue = b.first_name?.toLowerCase() || '';
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Pagination logic
    const totalFiltered = filteredMembers.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / FAMILY_PAGE_SIZE));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (currentPage - 1) * FAMILY_PAGE_SIZE;
    const endIndex = Math.min(startIndex + FAMILY_PAGE_SIZE, totalFiltered);
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    // Reset to page 1 when filters/search change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter, sortBy, sortOrder]);

    // Keep page in valid range
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

    const handleEditFamily = (member) => {
        navigate(`/admin/EditFamilyDetails/${member.mid}`);
    };

    const handleViewMember = (member) => {
        setSelectedMember(member);
        setViewDialogOpen(true);
    };

    const handleDeleteClick = (member) => {
        setSelectedMember(member);
        setDeleteDialogOpen(true);
    };

    // Fixed delete function
    const handleDeleteConfirm = async () => {
        if (!selectedMember || !selectedMember.MemberFamily || !selectedMember.MemberFamily.id) {
            console.error('No family ID found for deletion');
            setDeleteDialogOpen(false);
            return;
        }

        try {
            setDeleteLoading(true);
            const familyId = selectedMember.MemberFamily.id;

            const response = await fetch(`${baseurl}/api/family/delete/${familyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to delete family record');
            }

            console.log('Family record deleted successfully');

            // Update the members state by removing the deleted family record
            setMembers(prevMembers =>
                prevMembers.map(member =>
                    member.mid === selectedMember.mid
                        ? { ...member, MemberFamily: null }
                        : member
                ).filter(member => member.MemberFamily !== null)
            );

            // Close dialog and reset selected member
            setDeleteDialogOpen(false);
            setSelectedMember(null);

        } catch (error) {
            console.error('Error deleting family record:', error);
            // You might want to show an error message to the user here
            alert('Failed to delete family record: ' + error.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleExport = () => {
        // Prepare data for export
        const exportData = filteredMembers.map(member => {
            const familyProfile = member.MemberFamily || {};

            // Helper function to format address
            const formatAddress = () => {
                const address = safeValue(member.address);
                const city = safeValue(member.city);
                const state = safeValue(member.state);
                const zipCode = safeValue(member.zip_code);

                if ([address, city, state, zipCode].every(val => val === 'N/A')) {
                    return 'N/A';
                }

                return `${address === 'N/A' ? '' : address}${city === 'N/A' ? '' : `, ${city}`}${state === 'N/A' ? '' : `, ${state}`} ${zipCode === 'N/A' ? '' : zipCode}`.trim();
            };

            return {
                'First Name': member.first_name,
                'Last Name': member.last_name,
                'Email': member.email,
                'Father Name': safeValue(familyProfile.father_name),
                'Mother Name': safeValue(familyProfile.mother_name),
                'Spouse Name': safeValue(familyProfile.spouse_name),
                'Children Details': parseChildrenNames(familyProfile.children_names),
                'Contact Number': safeValue(member.contact_no),
                'Address': formatAddress(),
                'Status': member.status
            };
        });

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Families');

        // Generate file and trigger download
        XLSX.writeFile(wb, `families_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

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
                            You do not have permission to view the Family Information module.
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
                            Family Information
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage Family Records
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', md: 'auto' } }}>
                        {permissions.canAdd && (
                            <Button
                                variant="contained"
                                startIcon={<PersonAdd />}
                                onClick={() => {
                                    const membersWithoutFamily = getMembersWithoutFamily();
                                    if (membersWithoutFamily.length === 0) {
                                        setSnackbar({
                                            open: true,
                                            message: 'All members already have family details',
                                            severity: 'info'
                                        });
                                        return;
                                    }
                                    setMemberSelectionDialogOpen(true);
                                }}
                                sx={{
                                    backgroundColor: '#4CAF50',
                                    '&:hover': { backgroundColor: '#45a049' },
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600
                                }}
                            >
                                Add Family Details
                            </Button>
                        )}
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
                    <Box sx={{
                        p: 3,
                        display: 'flex',
                        gap: 2,
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'stretch', md: 'center' }
                    }}>
                        <TextField
                            placeholder="Search families..."
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
                                <MenuItem value="father">Father Name</MenuItem>
                                <MenuItem value="mother">Mother Name</MenuItem>
                                <MenuItem value="spouse">Spouse Name</MenuItem>
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
                                    {!isSmall && <TableCell sx={{ fontWeight: 600, color: '#666' }}>Father Name</TableCell>}
                                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Mother Name</TableCell>
                                    {!isMobile && <TableCell sx={{ fontWeight: 600, color: '#666' }}>Spouse Name</TableCell>}
                                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            <Typography>Loading families...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            <Typography color="error">{error}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredMembers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                            <Typography>No families found</Typography>
                                            {permissions.canAdd && getMembersWithoutFamily().length > 0 && (
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<PersonAdd />}
                                                    onClick={() => {
                                                        setMemberSelectionDialogOpen(true);
                                                    }}
                                                    sx={{ mt: 2 }}
                                                >
                                                    Add Family Details to Existing Member
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedMembers.map((member) => {
                                        const familyProfile = member.MemberFamily || {};
                                        return (
                                            <TableRow key={member.mid} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
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
                                                            src={member.profile_image ? `${baseurl}/${member.profile_image}` : undefined}
                                                        >
                                                            {member.first_name?.[0]}{member.last_name?.[0]}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                                                {`${member.first_name}`}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {member.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                {!isSmall && (
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                            {familyProfile.father_name}
                                                        </Typography>
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {familyProfile.mother_name}
                                                    </Typography>
                                                </TableCell>
                                                {!isMobile && (
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {familyProfile.spouse_name}
                                                        </Typography>
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5}>
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: '#666' }}
                                                            onClick={() => handleViewMember(member)}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                        {permissions.canEdit && (
                                                            <IconButton
                                                                size="small"
                                                                sx={{ color: '#666' }}
                                                                onClick={() => handleEditFamily(member)}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                        {permissions.canDelete && (
                                                            <IconButton
                                                                size="small"
                                                                sx={{ color: '#666' }}
                                                                onClick={() => handleDeleteClick(member)}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
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
                                ? 'Showing 0 families'
                                : `Showing ${startIndex + 1}-${endIndex} of ${totalFiltered} families (${FAMILY_PAGE_SIZE} per page)`}
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

            {/* Filter Dialog */}
            <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Filter Families</DialogTitle>
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

            {/* View Family Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: '#4CAF50',
                        color: 'white',
                        px: 3,
                        py: 2,
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        👨‍👩‍👧 Family Details
                    </Typography>
                    <IconButton onClick={() => setViewDialogOpen(false)} size="small" sx={{ color: 'white' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3, bgcolor: '#fafafa' }}>
                    {selectedMember && (
                        <Box>
                            {/* Profile Overview */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'center', sm: 'flex-start' },
                                    gap: 3,
                                    p: 2,
                                    mb: 4,
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 1,
                                }}
                            >
                                <Avatar
                                    src={selectedMember.profile_image ? `${baseurl}/${selectedMember.profile_image}` : undefined}
                                    sx={{ width: 100, height: 100, fontSize: 32 }}
                                >
                                    {selectedMember.first_name?.[0]}{selectedMember.last_name?.[0]}
                                </Avatar>
                                <Box textAlign={{ xs: 'center', sm: 'left' }}>
                                    <Typography variant="h5" fontWeight={700}>
                                        {selectedMember.first_name} {selectedMember.last_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                                        Member ID: {selectedMember.mid}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                                        <Chip
                                            label={selectedMember.status}
                                            sx={{ bgcolor: getStatusColor(selectedMember.status), color: 'white' }}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            {/* Details Grid */}
                            <Grid container spacing={3}>
                                {/* Left - Family Info */}
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={600} mb={2} color="#2E7D32">
                                            👨‍👩‍👧 Family Information
                                        </Typography>
                                        <List dense>
                                            <ListItem>
                                                <ListItemIcon><Person color="action" /></ListItemIcon>
                                                <ListItemText
                                                    primary="Father's Name"
                                                    secondary={selectedMember.MemberFamily?.father_name}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><Person color="action" /></ListItemIcon>
                                                <ListItemText
                                                    primary="Mother's Name"
                                                    secondary={selectedMember.MemberFamily?.mother_name}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><FamilyRestroom color="action" /></ListItemIcon>
                                                <ListItemText
                                                    primary="Spouse Name"
                                                    secondary={selectedMember.MemberFamily?.spouse_name}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><FamilyRestroom color="action" /></ListItemIcon>
                                                <ListItemText
                                                    primary="Children"
                                                    secondary={parseChildrenNames(selectedMember.MemberFamily?.children_names)}
                                                />
                                            </ListItem>
                                        </List>
                                    </Box>
                                </Grid>

                                {/* Right - Contact Info */}
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={600} mb={2} color="#2E7D32">
                                            ☎️ Contact Information
                                        </Typography>
                                        <List dense>
                                            <ListItem>
                                                <ListItemIcon><Email color="action" /></ListItemIcon>
                                                <ListItemText
                                                    primary="Email"
                                                    secondary={safeValue(selectedMember.email)}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><Phone color="action" /></ListItemIcon>
                                                <ListItemText
                                                    primary="Contact Number"
                                                    secondary={safeValue(selectedMember.contact_no)}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><LocationOn color="action" /></ListItemIcon>
                                                <ListItemText
                                                    primary="Address"
                                                    secondary={
                                                        selectedMember.address
                                                            ? `${safeValue(selectedMember.address)}, ${safeValue(selectedMember.city)}, ${safeValue(selectedMember.state)} ${safeValue(selectedMember.zip_code)}`
                                                            : 'N/A'
                                                    }
                                                />
                                            </ListItem>
                                        </List>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Member Selection Dialog */}
            <MemberSelectionDialog
                open={memberSelectionDialogOpen}
                onClose={() => setMemberSelectionDialogOpen(false)}
                members={getMembersWithoutFamily()}
                onSelectMember={(member) => {
                    setSelectedMemberForFamily(member);
                    setAddFamilyDialogOpen(true);
                }}
            />

            {/* Add Family Details Dialog */}
            <AddFamilyDetailsForm
                open={addFamilyDialogOpen}
                onClose={() => {
                    setAddFamilyDialogOpen(false);
                    setSelectedMemberForFamily(null);
                }}
                memberId={selectedMemberForFamily?.mid}
                memberName={selectedMemberForFamily?.first_name}
                onSuccess={handleAddFamilySuccess}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{
                    backgroundColor: '#f5f5f5',
                    color: '#d32f2f',
                    borderBottom: '1px solid #e0e0e0'
                }}>
                    Delete Family Record
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography>
                        Are you sure you want to delete this family record?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This action cannot be undone. All associated family data will be permanently removed.
                    </Typography>
                    {selectedMember && selectedMember.MemberFamily && (
                        <Typography variant="body2" sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            Family ID: {selectedMember.MemberFamily.id}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleteLoading}
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
                        disabled={deleteLoading}
                        sx={{
                            backgroundColor: '#d32f2f',
                            '&:hover': { backgroundColor: '#b71c1c' }
                        }}
                    >
                        {deleteLoading ? 'Deleting...' : 'Delete'}
                    </Button>
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

export default FamilyInformation;