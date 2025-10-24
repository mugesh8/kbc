import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  TextField,
  InputAdornment,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  List,
  CardContent,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  FileDownload as FileDownloadIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import baseurl from '../Baseurl/baseurl';
import * as XLSX from 'xlsx';
import Person from '@mui/icons-material/Person';
import QrCode2 from '@mui/icons-material/QrCode2';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Badge from '@mui/icons-material/Badge';
import Phone from '@mui/icons-material/Phone';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';

const ViewModal = ({ open, onClose, member }) => {
  if (!member) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#4CAF50'; // Green
      case 'inactive':
        return '#9E9E9E'; // Grey
      case 'pending':
        return '#FF9800'; // Orange
      case 'rejected':
      case 'blocked':
        return '#F44336'; // Red
      default:
        return '#2196F3'; // Blue (default)
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getColorFromString = (str) => {
    const colors = [
      '#4CAF50', '#2196F3', '#9C27B0',
      '#FF5722', '#607D8B', '#795548',
      '#3F51B5', '#009688', '#FF9800'
    ];
    const index = str ? str.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
          🧾 Referral Details
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: '#fafafa' }}>
        <Box>
          {/* Member Overview */}
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
              src={member.profile_image ? `${baseurl}/${member.profile_image.replace(/\\/g, '/')}` : undefined}
              sx={{
                backgroundColor: getColorFromString(member.first_name),
                width: 100,
                height: 100,
                fontSize: 32,
                fontWeight: 600,
              }}
            >
              {!member.profile_image && getInitials(member.first_name, member.last_name)}
            </Avatar>

            <Box textAlign={{ xs: 'center', sm: 'left' }}>
              <Typography variant="h5" fontWeight={700}>
                {member.first_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {member.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: { xs: 'center', sm: 'flex-start' }, flexWrap: 'wrap' }}>
                <Chip label={member.status} sx={{ bgcolor: getStatusColor(member.status), color: 'white' }} />
              </Box>
            </Box>
          </Box>

          {/* Referral Info */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  📢 Referral Info
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><Person color="action" /></ListItemIcon>
                    <ListItemText primary="Referrer Name" secondary={member.Referral?.referral_name || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><QrCode2 color="action" /></ListItemIcon>
                    <ListItemText primary="Referral Code" secondary={member.Referral?.referral_code || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CalendarMonth color="action" /></ListItemIcon>
                    <ListItemText primary="Join Date" secondary={formatDate(member.join_date)} />
                  </ListItem>
                </List>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  📄 Additional Info
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>  <DisplaySettingsIcon color="action" /></ListItemIcon>
                    <ListItemText primary="Application ID" secondary={member.application_id || 'N/A'} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><Phone color="action" /></ListItemIcon>
                    <ListItemText primary="Contact Number" secondary={member.contact_no || 'N/A'} />
                  </ListItem>
                </List>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f0f0f0' }}>
        <Button variant="outlined" onClick={onClose} sx={{
                          bgcolor: '#4CAF50',
                          minWidth: 120,
                          '&:hover': { bgcolor: '#45a049' },
                          color: "#fff",
                           py: 1.5, px: 4 
                      }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const EditModal = ({ open, onClose, member, onSubmit }) => {
  const [status, setStatus] = useState(member?.status || 'Pending');

  useEffect(() => {
    if (member) {
      setStatus(member.status || 'Pending');
    }
  }, [member]);

  if (!member) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Edit Referral</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Member Name"
                  value={`${member.first_name || ''} ${member.last_name || ''}`}
                  variant="outlined"
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={member.email || ''}
                  variant="outlined"
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Referrer Name"
                  value={member.Referral?.referral_name || ''}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Referral Code"
                  value={member.Referral?.referral_code || ''}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const ReferralSystemComponent = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [referralData, setReferralData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const adminRole = typeof window !== 'undefined' ? localStorage.getItem('adminRole') : null;

  // Fetch referral data from API
  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseurl}/api/member/all`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || 'Failed to fetch referral data');
        }

        // Filter members that have referral information
        const membersWithReferral = data.data.filter(member =>
          member.Referral && Object.keys(member.Referral).length > 0
        );

        setReferralData(membersWithReferral);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching referral data');
        console.error('Error fetching referral data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, []);

  // Handle export to Excel
  const handleExport = () => {
    // Prepare data for export
    const exportData = filteredReferralData.map(member => ({
      "Member Name": `${member.first_name} ${member.last_name}`,
      "Email": member.email,
      "Referrer": member.Referral?.referral_name || 'N/A',
      "Referral Code": member.Referral?.referral_code || 'N/A',
      "Join Date": formatDate(member.join_date),
      "Status": member.status || 'Pending',
      "Application ID": member.application_id || 'N/A',
      "Contact": member.contact_no || 'N/A'
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Referral Members");

    // Generate Excel file and download
    XLSX.writeFile(workbook, "referral_members.xlsx");
  };

  const handleViewModalOpen = (member) => {
    setSelectedMember(member);
    setViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedMember(null);
  };

  const handleEditModalOpen = (member) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedMember(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Add your edit submission logic here
    handleEditModalClose();
  };

  const handleDelete = async (member) => {
    if (window.confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}?`)) {
      try {
        const response = await fetch(`${baseurl}/api/member/delete/${member.mid}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.msg || 'Failed to delete member');
        }

        // Remove the deleted member from the state
        setReferralData(referralData.filter(m => m.mid !== member.mid));

        alert('Member deleted successfully');
      } catch (err) {
        alert(err.message);
        console.error('Error deleting member:', err);
      }
    }
  };

  const getStatusChip = (status) => {
    let color, bgColor;
    const displayStatus = status || 'Pending';

    switch (displayStatus) {
      case 'Approved':
        color = '#2E7D32';
        bgColor = '#E8F5E8';
        break;
      case 'Pending':
        color = '#F57C00';
        bgColor = '#FFF3E0';
        break;
      case 'Rejected':
        color = '#D32F2F';
        bgColor = '#FFEBEE';
        break;
      default:
        color = '#666';
        bgColor = '#F5F5F5';
    }

    return (
      <Chip
        label={displayStatus}
        size="small"
        sx={{
          backgroundColor: bgColor,
          color: color,
          fontWeight: 500,
          fontSize: '12px',
          height: '24px',
          borderRadius: '12px'
        }}
      />
    );
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getColorFromString = (str) => {
    const colors = [
      '#4CAF50', '#2196F3', '#9C27B0',
      '#FF5722', '#607D8B', '#795548',
      '#3F51B5', '#009688', '#FF9800'
    ];
    const index = str ? str.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter, sort and paginate referral data
  const filteredReferralData = referralData.filter(member => {
    if (!member) return false;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      (member.first_name?.toLowerCase().includes(searchLower)) ||
      (member.last_name?.toLowerCase().includes(searchLower)) ||
      (member.email?.toLowerCase().includes(searchLower)) ||
      (member.Referral?.referral_name?.toLowerCase().includes(searchLower)) ||
      (member.Referral?.referral_code?.toLowerCase().includes(searchLower))
    );
    
    const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
        bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
        break;
      case 'email':
        aValue = a.email?.toLowerCase() || '';
        bValue = b.email?.toLowerCase() || '';
        break;
      case 'referrer':
        aValue = a.Referral?.referral_name?.toLowerCase() || '';
        bValue = b.Referral?.referral_name?.toLowerCase() || '';
        break;
      case 'code':
        aValue = a.Referral?.referral_code?.toLowerCase() || '';
        bValue = b.Referral?.referral_code?.toLowerCase() || '';
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

  // Pagination calculations
  const pageCount = Math.ceil(filteredReferralData.length / itemsPerPage);
  const paginatedData = filteredReferralData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Referral Data
        </Typography>
        <Typography variant="body1" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
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
              Referral System
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage referral members and track referral performance.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
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

      {/* Referral Members Section */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Search Bar */}
          <Box
            sx={{
              p: 3,
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' }
            }}
          >
            <TextField
              placeholder="Search members..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
              sx={{ flexGrow: { xs: 1, md: 0 }, minWidth: { md: 300 } }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
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
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="referrer">Referrer</MenuItem>
                <MenuItem value="code">Referral Code</MenuItem>
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
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#555' }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#555' }}>Referrer</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#555' }}>Referral Code</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#555' }}>Join Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#555' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#555' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1">
                        {searchTerm
                          ? 'No matching referrals found'
                          : 'No referral data available'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((member) => (
                    <TableRow
                      key={member.mid}
                      sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              backgroundColor: getColorFromString(member.first_name),
                              width: 40,
                              height: 40,
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                          >
                            {getInitials(member.first_name, member.last_name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
                              {member.first_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              {member.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                          {member.Referral?.referral_name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#333' }}>
                          {member.Referral?.referral_code || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#333' }}>
                          {formatDate(member.join_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(member.status)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewModalOpen(member)}
                            sx={{
                              backgroundColor: '#2196F3',
                              color: 'white',
                              width: 32,
                              height: 32,
                              '&:hover': { backgroundColor: '#1976D2' }
                            }}
                          >
                            <InfoIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(member)}
                              sx={{
                                backgroundColor: '#F44336',
                                color: 'white',
                                width: 32,
                                height: 32,
                                '&:hover': { backgroundColor: '#D32F2F' }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderTop: '1px solid #eee'
            }}
          >
            <Typography variant="body2" sx={{ color: '#666' }}>
              Showing {paginatedData.length} of {filteredReferralData.length} entries
            </Typography>
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              size="small"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '14px'
                },
                '& .Mui-selected': {
                  backgroundColor: '#4CAF50 !important',
                  color: 'white'
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>
      
      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Referrals</DialogTitle>
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
      
      <ViewModal
        open={viewModalOpen}
        onClose={handleViewModalClose}
        member={selectedMember}
      />
      <EditModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        member={selectedMember}
        onSubmit={handleEditSubmit}
      />
    </Box>
  );
};

export default ReferralSystemComponent;
