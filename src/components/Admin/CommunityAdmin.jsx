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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Visibility,
  Edit,
  Delete,
  PersonAdd,
  FileDownload,
  Email,
  Close,
  CalendarToday,
  ExpandMore,
  Badge as BadgeIcon,
  AdminPanelSettings,
  Security,
  Group,
  Save
} from '@mui/icons-material';
import baseurl from '../Baseurl/baseurl';
import * as XLSX from 'xlsx';

const CommunityAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const rowsPerPage = 10;

  // Role to permission mapping
  const rolePermissionMap = {
    "Member Management": "memberManagement",
    "Category": "category",
    "Business Management": "businessManagement",
    "Family Information": "familyInformation",
    "Referral System": "referralSystem",
    "Review Testimonials": "reviewTestimonials"
  };

  // Permission options for each role
  const permissionOptions = {
    "Member Management": ['add', 'edit', 'view', 'delete'],
    "Category": ['add', 'edit', 'view', 'delete'],
    "Business Management": ['add', 'edit', 'view', 'delete'],
    "Family Information": ['add', 'edit', 'view', 'delete'],
    "Referral System": [], // Boolean permission
    "Review Testimonials": [] // Boolean permission
  };

  // Parse role string to extract role name and permissions
  const parseRoleString = (roleString) => {
    if (!roleString || typeof roleString !== 'string') {
      return { roleName: 'Unknown Role', permissions: [] };
    }
    
    const parts = roleString.split(' -- ');
    const roleName = parts[0] || 'Unknown Role';
    let permissions = [];

    if (parts.length > 1) {
      permissions = parts[1].split(',').map(p => p.trim()).filter(p => p);
    }

    return { roleName, permissions };
  };

  // Format role name and permissions into a string
  const formatRoleString = (roleName, permissions) => {
    if (!permissions || permissions.length === 0) return roleName;
    return `${roleName} -- ${permissions.join(', ')}`;
  };

  // Safe array access helper
  const safeArray = (array) => {
    return Array.isArray(array) ? array : [];
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${baseurl}/api/community_admin/all`);
      if (!response.ok) throw new Error('Failed to load community admins');
      const data = await response.json();

      // Process each admin to ensure proper role structure
      const processedAdmins = safeArray(data).map(admin => {
        // Parse role data - it comes as a JSON string from the database
        let roles = [];
        if (admin.role) {
          try {
            if (typeof admin.role === 'string' && admin.role.startsWith('[')) {
              roles = JSON.parse(admin.role);
            } else if (Array.isArray(admin.role)) {
              roles = admin.role;
            } else {
              roles = [admin.role];
            }
          } catch (e) {
            console.error('Error parsing roles for admin:', admin.caid, e);
            roles = Array.isArray(admin.role) ? admin.role : [admin.role];
          }
        }
        
        // Parse roles to extract permissions
        const parsedRoles = roles.map(roleStr => {
          return parseRoleString(roleStr);
        });

        return {
          ...admin,
          role: roles, // Ensure role is always an array
          parsedRoles // Store parsed roles for easier access
        };
      });

      setAdmins(processedAdmins);
    } catch (err) {
      setError(err.message || 'Error fetching community admins');
      setAdmins([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter admins based on search term
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAddAdmin = () => {
    navigate('/admin/CommunityAdmin/Add');
  };

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
    setViewDialogOpen(true);
  };

  const handleEditAdmin = (admin) => {
    navigate(`/admin/CommunityAdmin/Edit/${admin.caid}`);
  };

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${baseurl}/api/community_admin/delete/${selectedAdmin.caid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete community admin');
      }

      setAdmins(prevAdmins => prevAdmins.filter(a => a.caid !== selectedAdmin.caid));
      setDeleteDialogOpen(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error('Error deleting community admin:', error);
    }
  };

  const handleExport = () => {
    const exportData = filteredAdmins.map(admin => ({
      'Admin ID': admin.caid,
      'Username': admin.username,
      'Email': admin.email,
      'Roles': safeArray(admin.role).join(', '),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Community Admins');
    XLSX.writeFile(wb, `community_admins_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Calculate paginated admins
  const paginatedAdmins = filteredAdmins.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Handle permission toggle
  const handlePermissionToggle = (roleName, permission = null) => {
    if (!selectedAdmin) return;

    setSelectedAdmin(prev => {
      // Create a deep copy of parsed roles
      const updatedParsedRoles = safeArray(prev.parsedRoles).map(role => {
        if (role.roleName === roleName) {
          // For boolean permissions (like Referral System)
          if (!permission) {
            // Toggle the boolean permission
            return {
              ...role,
              permissions: safeArray(role.permissions).length > 0 ? [] : ['access']
            };
          }

          // For action-based permissions (add, edit, view, delete)
          const updatedPermissions = [...safeArray(role.permissions)];
          const permissionIndex = updatedPermissions.indexOf(permission);

          if (permissionIndex > -1) {
            // Remove permission if it exists
            updatedPermissions.splice(permissionIndex, 1);
          } else {
            // Add permission if it doesn't exist
            updatedPermissions.push(permission);
          }

          return {
            ...role,
            permissions: updatedPermissions
          };
        }
        return role;
      });

      return {
        ...prev,
        parsedRoles: updatedParsedRoles
      };
    });
  };

  // Save permissions
  const handleSavePermissions = async () => {
    if (!selectedAdmin) return;

    try {
      setPermissionsLoading(true);

      // Convert parsed roles back to role strings
      const updatedRoles = safeArray(selectedAdmin.parsedRoles).map(role => {
        return formatRoleString(role.roleName, safeArray(role.permissions));
      });

      // Prepare the update payload
      const updatePayload = {
        ...selectedAdmin,
        role: updatedRoles
      };

      const response = await fetch(`${baseurl}/api/community_admin/update/${selectedAdmin.caid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to update permissions');
      }

      // Update the admin in the admins list
      setAdmins(prevAdmins =>
        prevAdmins.map(admin =>
          admin.caid === selectedAdmin.caid
            ? { ...admin, role: updatedRoles, parsedRoles: selectedAdmin.parsedRoles }
            : admin
        )
      );

      // Update the selected admin to reflect changes
      setSelectedAdmin(prev => ({
        ...prev,
        role: updatedRoles
      }));

      // Show success message
      alert('Permissions updated successfully');
      setViewDialogOpen(false);
      navigate('/admin/CommunityAdmin');
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Error updating permissions: ' + error.message);
    } finally {
      setPermissionsLoading(false);
    }
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
              Community Admin Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage community administrators and their permissions
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={handleAddAdmin}
              sx={{
                backgroundColor: '#4CAF50',
                '&:hover': { backgroundColor: '#45a049' },
                px: 3,
                py: 1.5,
                fontWeight: 600
              }}
            >
              Add Community Admin
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
              placeholder="Search admins..."
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
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>S.No</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>Admin Details</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>Roles</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography>Loading community admins...</Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="error">{error}</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography>No community admins found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAdmins.map((admin, index) => (
                    <TableRow key={admin.caid} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell>
                        {(page - 1) * rowsPerPage + index + 1}
                      </TableCell>
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
                          >
                            {admin.username?.[0]?.toUpperCase() || 'A'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {admin.username || 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {admin.email || 'No email provided'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {safeArray(admin.parsedRoles).map((role, idx) => (
                            <Chip
                              key={idx}
                              label={role.roleName}
                              size="small"
                              sx={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '0.75rem',
                                mb: 0.5
                              }}
                            />
                          ))}
                          {safeArray(admin.parsedRoles).length === 0 && (
                            <Typography variant="caption" color="text.secondary">
                              No roles assigned
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            sx={{ color: '#666' }}
                            onClick={() => handleViewAdmin(admin)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: '#666' }}
                            onClick={() => handleEditAdmin(admin)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: '#f44336' }}
                            onClick={() => handleDeleteClick(admin)}
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
              Showing {paginatedAdmins.length} of {filteredAdmins.length} admins (Page {page} of {Math.ceil(filteredAdmins.length / rowsPerPage)})
            </Typography>
            <Pagination
              count={Math.ceil(filteredAdmins.length / rowsPerPage)}
              page={page}
              onChange={handleChangePage}
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

      {/* View Admin Dialog */}
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
            Community Admin Details
          </Typography>
          <IconButton onClick={() => setViewDialogOpen(false)} size="small" sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: '#fafafa' }}>
          {selectedAdmin && (
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
                  sx={{ width: 120, height: 120, fontSize: 40 }}
                >
                  {selectedAdmin.username?.[0]?.toUpperCase() || 'A'}
                </Avatar>
                <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {selectedAdmin.username || 'Unknown User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email: {selectedAdmin.email || 'No email provided'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                    {safeArray(selectedAdmin.parsedRoles).map((role, idx) => (
                      <Chip
                        key={idx}
                        label={role.roleName}
                        sx={{ bgcolor: '#4CAF50', color: 'white', fontWeight: 600 }}
                      />
                    ))}
                    {safeArray(selectedAdmin.parsedRoles).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No roles assigned
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Details Accordions */}
              <Box sx={{ mt: 3 }}>
                {/* Account Information */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BadgeIcon />
                      <Typography variant="h6" fontWeight={600}>Account Information</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><AdminPanelSettings color="action" /></ListItemIcon>
                          <ListItemText
                            primary="Username"
                            secondary={selectedAdmin.username || 'Not provided'}
                          />
                        </ListItem>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><Email color="action" /></ListItemIcon>
                          <ListItemText
                            primary="Email"
                            secondary={selectedAdmin.email || 'Not provided'}
                          />
                        </ListItem>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Roles and Permissions */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Group />
                      <Typography variant="h6" fontWeight={600}>Roles and Permissions</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {safeArray(selectedAdmin.parsedRoles).map((role, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon><Group color="action" /></ListItemIcon>
                          <ListItemText
                            primary={`Role ${idx + 1}`}
                            secondary={role.roleName}
                          />
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {safeArray(role.permissions).map((perm, pIdx) => (
                              <Chip
                                key={pIdx}
                                label={perm}
                                size="small"
                                sx={{
                                  backgroundColor: '#e0f2f1',
                                  color: '#00796b',
                                  fontWeight: 500,
                                  fontSize: '0.7rem',
                                  mb: 0.5
                                }}
                              />
                            ))}
                            {safeArray(role.permissions).length === 0 && (
                              <Typography variant="caption" color="text.secondary">
                                No permissions
                              </Typography>
                            )}
                          </Stack>
                        </ListItem>
                      ))}
                      {safeArray(selectedAdmin.parsedRoles).length === 0 && (
                        <ListItem>
                          <ListItemText
                            primary="No roles assigned"
                            secondary="This admin doesn't have any roles assigned yet."
                          />
                        </ListItem>
                      )}
                    </List>
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
                            primary="Created At"
                            secondary={formatDate(selectedAdmin.createdAt)}
                          />
                        </ListItem>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ListItem>
                          <ListItemIcon><CalendarToday color="action" /></ListItemIcon>
                          <ListItemText
                            primary="Last Updated"
                            secondary={formatDate(selectedAdmin.updatedAt)}
                          />
                        </ListItem>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Permissions Management */}
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security />
                      <Typography variant="h6" fontWeight={600}>Permissions Management</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {safeArray(selectedAdmin.parsedRoles).map((role) => {
                        const permissionKey = rolePermissionMap[role.roleName];
                        if (!permissionKey) return null;

                        return (
                          <Grid item xs={12} md={6} key={role.roleName}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                              {role.roleName}
                            </Typography>

                            {permissionOptions[role.roleName] && permissionOptions[role.roleName].length > 0 ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 1 }}>
                                {permissionOptions[role.roleName].map(action => (
                                  <FormControlLabel
                                    key={action}
                                    control={
                                      <Switch
                                        checked={safeArray(role.permissions).includes(action)}
                                        onChange={() => handlePermissionToggle(role.roleName, action)}
                                        color="primary"
                                      />
                                    }
                                    label={action.charAt(0).toUpperCase() + action.slice(1)}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={safeArray(role.permissions).length > 0}
                                    onChange={() => handlePermissionToggle(role.roleName)}
                                    color="primary"
                                  />
                                }
                                label="Access"
                              />
                            )}
                          </Grid>
                        );
                      })}
                      {safeArray(selectedAdmin.parsedRoles).length === 0 && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" align="center">
                            No roles available for permission management
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
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
              handleEditAdmin(selectedAdmin);
            }}
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#45a049' }
            }}
          >
            Edit Admin
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
          Delete Community Admin
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Are you sure you want to delete {selectedAdmin?.username}'s account?
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

export default CommunityAdmin;