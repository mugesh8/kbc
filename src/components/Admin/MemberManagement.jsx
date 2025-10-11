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
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge
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
  FamilyRestroom,
  ExpandMore,
  Language,
  Public,
  Groups,
  Badge as BadgeIcon,
  Bloodtype,
  Home,
  WorkOutline,
  Emergency,
  ContactPhone,
  Schedule,
  Cake,
  Transgender,
  Favorite,
  CorporateFare,
  School,
  Group,
  Payment,
  Paid,
  MoneyOff
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
    activeMembers: 0,
    paidMembers: 0,
    unpaidMembers: 0
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
        const paidMembers = data.data?.filter(m => m.paid_status === 'Paid').length || 0;
        const unpaidMembers = data.data?.filter(m => m.paid_status === 'Unpaid').length || 0;

        setStats({
          totalMembers,
          pendingApplications,
          activeMembers,
          paidMembers,
          unpaidMembers
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
    },
    {
      title: 'Paid Members',
      value: stats.paidMembers.toString(),
      change: 'Members with paid status',
      color: '#2196F3',
      icon: <Paid />,
      positive: true
    },
    {
      title: 'Unpaid Members',
      value: stats.unpaidMembers.toString(),
      change: 'Members pending payment',
      color: '#FF9800',
      icon: <MoneyOff />,
      positive: false
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

  const getPaidStatusColor = (paidStatus) => {
    switch (paidStatus) {
      case 'Paid': return '#2196F3';
      case 'Unpaid': return '#FF9800';
      default: return '#757575';
    }
  };

  const getProMemberColor = (proStatus) => {
    switch (proStatus) {
      case 'Pro': return '#FF9800';
      case 'Unpro': return '#757575';
      default: return '#757575';
    }
  };

  const handleEditMember = (member) => {
    navigate(`/admin/EditMember/${member.mid}`);
  };

  const handleViewMember = async (member) => {
    try {
      // Fetch complete member details
      const response = await fetch(`${baseurl}/api/member/${member.mid}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSelectedMember(data.data);
      } else {
        setSelectedMember(member); // Fallback to basic data
      }
    } catch (err) {
      console.error('Error fetching member details:', err);
      setSelectedMember(member); // Fallback to basic data
    }
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
    }
  };

  const handleExport = () => {
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
        'Paid Status': member.paid_status || 'Unpaid',
        'Pro Member': member.pro || 'Unpro',
        'Linked Profile': linkedProfile
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, `members_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get forum memberships
  const getForumMemberships = (member) => {
    const forums = [];
    if (member.Arakattalai === 'Yes') forums.push('Arakattalai');
    if (member.KNS_Member === 'Yes') forums.push('KNS');
    if (member.KBN_Member === 'Yes') forums.push('KBN');
    if (member.BNI === 'Yes') forums.push('BNI');
    if (member.Rotary === 'Yes') forums.push('Rotary');
    if (member.Lions === 'Yes') forums.push('Lions');
    if (member.Other_forum) forums.push(member.Other_forum);
    return forums.length > 0 ? forums.join(', ') : 'None';
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
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
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="caption"
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
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {`${member.first_name} ${member.last_name || ''}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.email}
                            </Typography>
                            {/* Status Badges in Header Bar */}
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                              <Chip
                                label={member.status}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(member.status),
                                  color: 'white',
                                  fontWeight: 500,
                                  fontSize: '0.6rem',
                                  height: '20px'
                                }}
                              />
                              <Chip
                                label={member.paid_status || 'Unpaid'}
                                size="small"
                                sx={{
                                  backgroundColor: getPaidStatusColor(member.paid_status),
                                  color: 'white',
                                  fontWeight: 500,
                                  fontSize: '0.6rem',
                                  height: '20px',
                                  '& .MuiChip-icon': {
                                    color: 'white',
                                    fontSize: '0.8rem'
                                  }
                                }}
                              />
                              <Chip
                                label={member.pro === 'Pro' ? 'Pro' : 'Basic'}
                                size="small"
                                sx={{
                                  backgroundColor: getProMemberColor(member.pro),
                                  color: 'white',
                                  fontWeight: 500,
                                  fontSize: '0.6rem',
                                  height: '20px'
                                }}
                              />
                            </Box>
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
                            <IconButton
                              size="small"
                              sx={{ color: '#666' }}
                              onClick={() => handleDeleteClick(member)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
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

      {/* Enhanced View Member Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
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
            👤 Member Profile - {selectedMember?.first_name} {selectedMember?.last_name}
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
                  p: 3,
                  mb: 3,
                  bgcolor: 'white',
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <Avatar
                  src={selectedMember.profile_image ? `${baseurl}/${selectedMember.profile_image}` : undefined}
                  sx={{ width: 120, height: 120, fontSize: 40 }}
                >
                  {selectedMember.first_name?.[0]}
                  {selectedMember.last_name?.[0]}
                </Avatar>
                <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {selectedMember.first_name} {selectedMember.last_name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Member ID: {selectedMember.mid || selectedMember.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email: {selectedMember.email}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                    <Chip
                      label={selectedMember.status}
                      sx={{ bgcolor: getStatusColor(selectedMember.status), color: 'white', fontWeight: 600 }}
                    />
                    <Chip
                      label={selectedMember.access_level}
                      sx={{ bgcolor: getAccessLevelColor(selectedMember.access_level), color: 'white', fontWeight: 600 }}
                    />
                    <Chip
                      label={selectedMember.paid_status || 'Unpaid'}
                      sx={{ 
                        bgcolor: getPaidStatusColor(selectedMember.paid_status), 
                        color: 'white', 
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: 'white'
                        }
                      }}
                    />
                    {selectedMember.pro === 'Pro' && (
                      <Chip 
                        label="Pro Member" 
                        sx={{ bgcolor: '#FF9800', color: 'white', fontWeight: 600 }} 
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Details Accordions */}
              <Box sx={{ mt: 3 }}>
                {/* Personal Information */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BadgeIcon />
                      <Typography variant="h6" fontWeight={600}>Personal Information</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><Cake color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Date of Birth" 
                            secondary={formatDate(selectedMember.dob)} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Transgender color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Gender" 
                            secondary={selectedMember.gender || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Bloodtype color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Blood Group" 
                            secondary={selectedMember.blood_group || 'Not provided'} 
                          />
                        </ListItem>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><Favorite color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Marital Status" 
                            secondary={selectedMember.marital_status || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Groups color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Kootam" 
                            secondary={selectedMember.kootam || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CorporateFare color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Kovil" 
                            secondary={selectedMember.kovil || 'Not provided'} 
                          />
                        </ListItem>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Contact Information */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ContactPhone />
                      <Typography variant="h6" fontWeight={600}>Contact Information</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><Phone color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Primary Contact" 
                            secondary={selectedMember.contact_no || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Phone color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Mobile Number" 
                            secondary={selectedMember.mobile_no || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><WorkOutline color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Work Phone" 
                            secondary={selectedMember.work_phone || 'Not provided'} 
                          />
                        </ListItem>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><Email color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Secondary Email" 
                            secondary={selectedMember.secondary_email || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Schedule color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Best Time to Contact" 
                            secondary={selectedMember.best_time_to_contact || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><ContactPhone color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Preferred Contact" 
                            secondary={selectedMember.preferred_contact || 'Not provided'} 
                          />
                        </ListItem>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Address Information */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn />
                      <Typography variant="h6" fontWeight={600}>Address Information</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <ListItem>
                          <ListItemIcon><Home color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Full Address" 
                            secondary={selectedMember.address || 'Not provided'} 
                          />
                        </ListItem>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <ListItem>
                          <ListItemText 
                            primary="City" 
                            secondary={selectedMember.city || 'Not provided'} 
                          />
                        </ListItem>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <ListItem>
                          <ListItemText 
                            primary="State" 
                            secondary={selectedMember.state || 'Not provided'} 
                          />
                        </ListItem>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <ListItem>
                          <ListItemText 
                            primary="Zip Code" 
                            secondary={selectedMember.zip_code || 'Not provided'} 
                          />
                        </ListItem>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Professional & Squad Information */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Work />
                      <Typography variant="h6" fontWeight={600}>Professional & Squad Information</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><Business color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Squad" 
                            secondary={selectedMember.squad || 'Not assigned'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><School color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Specialization" 
                            secondary={selectedMember.squad_fields || 'Not specified'} 
                          />
                        </ListItem>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><Group color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Pro Member" 
                            secondary={selectedMember.pro === 'Pro' ? 'Yes' : 'No'} 
                          />
                        </ListItem>
                        {selectedMember.pro === 'Unpro' && selectedMember.core_pro && (
                          <ListItem>
                            <ListItemIcon><Person color="action" /></ListItemIcon>
                            <ListItemText 
                              primary="Core Pro" 
                              secondary={selectedMember.core_pro} 
                            />
                          </ListItem>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Social Media & Websites */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Public />
                      <Typography variant="h6" fontWeight={600}>Social Media & Websites</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><Language color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Personal Website" 
                            secondary={selectedMember.personal_website || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Work color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="LinkedIn" 
                            secondary={selectedMember.linkedin_profile || 'Not provided'} 
                          />
                        </ListItem>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemText 
                            primary="Facebook" 
                            secondary={selectedMember.facebook || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Instagram" 
                            secondary={selectedMember.instagram || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Twitter" 
                            secondary={selectedMember.twitter || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="YouTube" 
                            secondary={selectedMember.youtube || 'Not provided'} 
                          />
                        </ListItem>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Forum Memberships */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Groups />
                      <Typography variant="h6" fontWeight={600}>Forum Memberships</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <ListItem>
                      <ListItemText 
                        primary="Active Memberships" 
                        secondary={getForumMemberships(selectedMember)} 
                      />
                    </ListItem>
                  </AccordionDetails>
                </Accordion>

                {/* Emergency Contact */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Emergency />
                      <Typography variant="h6" fontWeight={600}>Emergency Contact</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><Person color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Emergency Contact Name" 
                            secondary={selectedMember.emergency_contact || 'Not provided'} 
                          />
                        </ListItem>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><Phone color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Emergency Phone" 
                            secondary={selectedMember.emergency_phone || 'Not provided'} 
                          />
                        </ListItem>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* System Information */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday />
                      <Typography variant="h6" fontWeight={600}>System Information</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><CalendarToday color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Join Date" 
                            secondary={formatDate(selectedMember.join_date)} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CalendarToday color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Last Updated" 
                            secondary={formatDate(selectedMember.updatedAt)} 
                          />
                        </ListItem>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><BadgeIcon color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Application ID" 
                            secondary={selectedMember.application_id || 'Not provided'} 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Work color="action" /></ListItemIcon>
                          <ListItemText 
                            primary="Paid Status" 
                            secondary={selectedMember.paid_status || 'Unpaid'} 
                          />
                        </ListItem>
                        {selectedMember.paid_status === 'Paid' && selectedMember.membership_valid_until && (
                          <ListItem>
                            <ListItemIcon><CalendarToday color="action" /></ListItemIcon>
                            <ListItemText 
                              primary="Membership Valid Until" 
                              secondary={formatDate(selectedMember.membership_valid_until)} 
                            />
                          </ListItem>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Rejection Details (if rejected) */}
                {selectedMember.status === 'Rejected' && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning color="error" />
                        <Typography variant="h6" fontWeight={600} color="error">Rejection Details</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <ListItem>
                        <ListItemIcon><Warning color="error" /></ListItemIcon>
                        <ListItemText 
                          primary="Rejection Reason" 
                          secondary={selectedMember.rejection_reason || 'No reason provided'} 
                        />
                      </ListItem>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{
              color: '#666',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => {
              setViewDialogOpen(false);
              handleEditMember(selectedMember);
            }}
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#45a049' }
            }}
          >
            Edit Member
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