import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
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
  Chip,
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  Edit,
  Delete,
  TrendingUp,
  Warning,
  Person,
  PersonAdd,
  FileDownload,
  Email,
  Phone,
  LocationOn,
  Business,
  Close,
  CalendarToday,
  AccessTime,
  Work,
  FamilyRestroom
} from '@mui/icons-material';
import baseurl from '../Baseurl/baseurl';
import * as XLSX from 'xlsx';

const MemberManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingApplications: 0,
    activeMembers: 0
  });
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const adminRole = typeof window !== 'undefined' ? localStorage.getItem('adminRole') : null;

  // Check URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    
    if (tab === 'pending') {
      setActiveTab(2); // Pending tab index
      setStatusFilter('Pending');
    } else if (tab === 'approved') {
      setActiveTab(1); // Approved tab index
      setStatusFilter('Approved');
    } else if (tab === 'rejected') {
      setActiveTab(3); // Rejected tab index
      setStatusFilter('Rejected');
    }
  }, [location.search]);

  // Fetch members data
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseurl}/api/member/all`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || 'Failed to fetch members');
        }

        // Update members data
        setMembers(data.data || []);

        // Calculate stats
        const totalMembers = data.data?.length || 0;
        const pendingApplications = data.data?.filter(m => m.status === 'Pending').length || 0;
        const activeMembers = data.data?.filter(m => m.status === 'Approved').length || 0;

        setStats({
          totalMembers,
          pendingApplications,
          activeMembers
        });

      } catch (err) {
        setError(err.message || 'An error occurred while fetching members');
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Update stats data to use real data
  const statsData = [
    {
      title: 'Total Members',
      value: stats.totalMembers.toString(),
      change: 'Total registered members',
      color: '#4CAF50',
      icon: <Person />,
      positive: true
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications.toString(),
      change: 'Requires attention',
      color: '#f44336',
      icon: <Warning />,
      positive: false
    },
    {
      title: 'Active Members',
      value: stats.activeMembers.toString(),
      change: 'Currently active',
      color: '#4CAF50',
      icon: <Person />,
      positive: true
    }
  ];

  // Filter members based on search term and status
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Update status filter based on tab selection
    const statusMap = ['All', 'Approved', 'Pending', 'Rejected'];
    setStatusFilter(statusMap[newValue]);
  };

  const handleAddMember = () => {
    navigate('/admin/AddMembers');
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'Advanced': return '#4CAF50';
      case 'Basic': return '#2196F3';
      default: return '#757575';
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

  const handleEditMember = (member) => {
    navigate(`/admin/EditMember/${member.mid}`);
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (member) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${baseurl}/api/member/delete/${selectedMember.mid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      // Remove the deleted member from the list
      setMembers(prevMembers => prevMembers.filter(m => m.mid !== selectedMember.mid));
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error deleting member:', error);
      // You might want to show an error message to the user
    }
  };

  const handleExport = () => {
    // Prepare data for export with all required fields
    const exportData = filteredMembers.map(member => {
      let linkedProfile = 'None';
      if (member.business_profiles?.length > 0) {
        linkedProfile = `Business: ${member.business_profiles[0]?.company_name || 'N/A'}`;
      } else if (member.family_details) {
        linkedProfile = 'Family Profile';
      }

      return {
        'Application ID': member.application_id,
        'First Name': member.first_name,
        'Last Name': member.last_name,
        'Email': member.email,
        'Date of Birth': member.dob,
        'Gender': member.gender,
        'Join Date': new Date(member.join_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        'Aadhar Number': member.aadhar_no,
        'Blood Group': member.blood_group,
        'Contact Number': member.contact_no,
        'Alternate Contact': member.alternate_contact_no,
        'Marital Status': member.marital_status,
        'Address': member.address,
        'City': member.city,
        'State': member.state,
        'Zip Code': member.zip_code,
        'Profile Image URL': member.profile_image,
        'Work Phone': member.work_phone,
        'Extension': member.extension,
        'Mobile Number': member.mobile_no,
        'Preferred Contact': member.preferred_contact,
        'Secondary Email': member.secondary_email,
        'Emergency Contact': member.emergency_contact,
        'Emergency Phone': member.emergency_phone,
        'Personal Website': member.personal_website,
        'LinkedIn': member.linkedin_profile,
        'Facebook': member.facebook,
        'Instagram': member.instagram,
        'Twitter': member.twitter,
        'YouTube': member.youtube,
        'Kootam': member.kootam || 'N/A',
        'Best Time to Contact': member.best_time_to_contact,
        'Access Level': member.access_level,
        'Status': member.status,
        'Linked Profile': linkedProfile
      };
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');

    // Generate file and trigger download
    XLSX.writeFile(wb, `members_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
              alignItems: 'flex-start', // left-align the text
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#2E7D32', mb: 0.5 }}>
              Member Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage member records, applications, and access levels
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={handleAddMember}
              sx={{
                backgroundColor: '#4CAF50',
                '&:hover': { backgroundColor: '#45a049' },
                px: 3,
                py: 1.5,
                fontWeight: 600
              }}
            >
              Add Member
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExport} // Add this onClick handler
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: stat.positive ? '#4CAF50' : '#f44336',
                    fontWeight: 500
                  }}
                >
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
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
              <Tab label="All" />
              <Tab label="Approved" />
              <Tab label="Pending" />
              <Tab label="Rejected" />
            </Tabs>
          </Box>

          {/* Controls */}
          <Box sx={{
            p: 3,
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' }
          }}>
            <TextField
              placeholder="Search members..."
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
                  {!isSmall && <TableCell sx={{ fontWeight: 600, color: '#666' }}>Join Date</TableCell>}
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>Access Level</TableCell>
                  {!isMobile && <TableCell sx={{ fontWeight: 600, color: '#666' }}>Linked to</TableCell>}
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography>Loading members...</Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography color="error">{error}</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography>No members found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
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
                            {/* {member.first_name?.[0]}{member.last_name?.[0]} */}
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
                          <Typography variant="body2">
                            {new Date(member.join_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={member.access_level}
                          size="small"
                          sx={{
                            backgroundColor: getAccessLevelColor(member.access_level),
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                              {member.business_profiles?.length > 0 ? 'Business Profile' :
                                member.family_details ? 'Family Profile' : 'No Profile'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.business_profiles?.[0]?.company_name ||
                                member.family_details?.father_name ? 'Family Details' : 'Not linked'}
                            </Typography>
                          </Box>
                        </TableCell>
                      )}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: getStatusColor(member.status)
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {member.status}
                          </Typography>
                        </Box>
                      </TableCell>
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
                            onClick={() => handleEditMember(member)}
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
              Showing {filteredMembers.length} of {members.length} members
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

      {/* View Member Dialog */}
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
            👤 Member Profile
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
                  {selectedMember.first_name?.[0]}
                  {selectedMember.last_name?.[0]}
                </Avatar>
                <Box textAlign={{ xs: 'center', sm: 'left' }}>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedMember.first_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Member ID: {selectedMember.mid}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                    <Chip
                      label={selectedMember.status}
                      sx={{ bgcolor: getStatusColor(selectedMember.status), color: 'white' }}
                    />
                    <Chip
                      label={selectedMember.access_level}
                      sx={{ bgcolor: getAccessLevelColor(selectedMember.access_level), color: 'white' }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Details Grid */}
              <Grid container spacing={3}>
                {/* Left Panel - Personal Info */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      📇 Personal Info
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Email color="action" /></ListItemIcon>
                        <ListItemText primary="Email" secondary={selectedMember.email} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Phone color="action" /></ListItemIcon>
                        <ListItemText primary="Contact" secondary={selectedMember.contact_no || 'Not provided'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarToday color="action" /></ListItemIcon>
                        <ListItemText primary="Join Date" secondary={new Date(selectedMember.createdAt).toLocaleDateString()} />
                      </ListItem>
                    </List>
                  </Box>
                </Grid>

                {/* Right Panel - Business / Family Info or Rejection Reason */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
                    {selectedMember.status === 'Rejected' ? (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} mb={2}>
                          ❌ Rejection Details
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon><Warning color="error" /></ListItemIcon>
                            <ListItemText 
                              primary="Rejection Reason" 
                              secondary={selectedMember.rejection_reason || 'No reason provided'} 
                            />
                          </ListItem>
                        </List>
                      </>
                    ) : (
                      <>
                        <Typography variant="subtitle1" fontWeight={600} mb={2}>
                          {selectedMember.business_profiles?.length > 0 ? '🏢 Business Info' : '👨‍👩‍👧 Family Info'}
                        </Typography>
                        <List dense>
                          {selectedMember.business_profiles?.length > 0 ? (
                            <>
                              <ListItem>
                                <ListItemIcon><Business color="action" /></ListItemIcon>
                                <ListItemText primary="Company" secondary={selectedMember.business_profiles[0]?.company_name || 'Not provided'} />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon><Work color="action" /></ListItemIcon>
                                <ListItemText primary="Role" secondary={selectedMember.business_profiles[0]?.role || 'Not provided'} />
                              </ListItem>
                            </>
                          ) : (
                            <ListItem>
                              <List dense>
                                <ListItem>
                                  <ListItemIcon><FamilyRestroom color="action" /></ListItemIcon>
                                  <ListItemText
                                    primary="Father's Name"
                                    secondary={selectedMember.MemberFamily?.father_name || 'Not provided'}
                                  />
                                </ListItem>
                                <ListItem>
                                  <ListItemIcon><FamilyRestroom color="action" /></ListItemIcon>
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
                              </List>
                            </ListItem>
                          )}
                        </List>
                      </>
                    )}
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
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{
          backgroundColor: '#f5f5f5',
          color: '#d32f2f',
          borderBottom: '1px solid #e0e0e0'
        }}>
          Delete Member
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Are you sure you want to delete {selectedMember?.first_name} {selectedMember?.last_name}'s profile?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All associated data will be permanently removed.
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
    </Box>
  );
};

export default MemberManagement;