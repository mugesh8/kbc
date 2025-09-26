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

const FamilyInformation = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const adminRole = typeof window !== 'undefined' ? localStorage.getItem('adminRole') : null;

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

                // Filter members to only include those with family profiles
                const membersWithFamily = (data.data || []).filter(member =>
                    member.MemberFamily !== null
                );

                setMembers(membersWithFamily);

            } catch (err) {
                setError(err.message || 'An error occurred while fetching members');
                console.error('Error fetching members:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    // Filter members based on search term
    const filteredMembers = members.filter(member =>
        member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.MemberFamily?.father_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
            return {
                'First Name': member.first_name,
                'Last Name': member.last_name,
                'Email': member.email,
                'Father Name': familyProfile.father_name || 'N/A',
                'Mother Name': familyProfile.mother_name || 'N/A',
                'Spouse Name': familyProfile.spouse_name || 'N/A',
                'Children Details': familyProfile.children_details || 'N/A',
                'Contact Number': member.contact_no || 'N/A',
                'Address': `${member.address || ''}, ${member.city || ''}, ${member.state || ''} ${member.zip_code || ''}`.trim(),
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
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMembers.map((member) => {
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
                                                            {familyProfile.father_name || 'N/A'}
                                                        </Typography>
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {familyProfile.mother_name || 'N/A'}
                                                    </Typography>
                                                </TableCell>
                                                {!isMobile && (
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {familyProfile.spouse_name || 'N/A'}
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
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: '#666' }}
                                                            onClick={() => handleEditFamily(member)}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                        {adminRole !== 'community' && (
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
                            Showing {filteredMembers.length} of {members.length} families
                        </Typography>
                        <Pagination
                            count={Math.ceil(members.length / 10)}
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
                                                    secondary={selectedMember.MemberFamily?.father_name || 'Not provided'}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><Person color="action" /></ListItemIcon>
                                                <ListItemText
                                                    primary="Mother's Name"
                                                    secondary={selectedMember.MemberFamily?.mother_name || 'Not provided'}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><FamilyRestroom color="action" /></ListItemIcon>
                                                <ListItemText
                                                    primary="Spouse Name"
                                                    secondary={selectedMember.MemberFamily?.spouse_name || 'Not provided'}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><FamilyRestroom color="action" /></ListItemIcon>
                                                <ListItemText
                                                    primary="Children"
                                                    secondary={
                                                        selectedMember.MemberFamily?.children_names
                                                            ? JSON.parse(selectedMember.MemberFamily.children_names).join(', ')
                                                            : 'Not provided'
                                                    }
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
                                                    secondary={selectedMember.email || 'Not provided'}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><Phone color="action" /></ListItemIcon>
                                                <ListItemText
                                                    primary="Contact Number"
                                                    secondary={selectedMember.contact_no || 'Not provided'}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><LocationOn color="action" /></ListItemIcon>
                                                <ListItemText
                                                    primary="Address"
                                                    secondary={
                                                        selectedMember.address
                                                            ? `${selectedMember.address}, ${selectedMember.city}, ${selectedMember.state} ${selectedMember.zip_code}`
                                                            : 'Not provided'
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
        </Box>
    );
};

export default FamilyInformation;