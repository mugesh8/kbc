import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Add,
  Visibility,
  Edit,
  Delete,
  FileDownload,
  Close
} from '@mui/icons-material';
import baseurl from '../Baseurl/baseurl';
import * as XLSX from 'xlsx';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_name: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // State for admin permissions
  const [permissions, setPermissions] = useState({
    canView: false,
    canAdd: false,
    canEdit: false,
    canDelete: false
  });
  
  // State for permission loading
  const [permissionLoading, setPermissionLoading] = useState(true);

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
                // Find the Category role (case insensitive)
                const categoryRole = data.role.find(r => {
                  const roleLower = r.toLowerCase();
                  return roleLower.includes('category') || roleLower.includes('categories');
                });
                
                if (categoryRole) {
                  // Check if it has specific permissions
                  if (categoryRole.includes('--')) {
                    const permissionsStr = categoryRole.split('--')[1].trim();
                    const permissionList = permissionsStr.split(',').map(p => p.trim().toLowerCase());
                    
                    setPermissions({
                      canView: true, // If they have any category permission, they can view
                      canAdd: permissionList.includes('add'),
                      canEdit: permissionList.includes('edit'),
                      canDelete: permissionList.includes('delete')
                    });
                  } else {
                    // Only "Category" without specific permissions -> only view
                    setPermissions({
                      canView: true,
                      canAdd: false,
                      canEdit: false,
                      canDelete: false
                    });
                  }
                } else {
                  // No Category role found - default to no permissions
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

  // Fetch categories when permissions are loaded
  useEffect(() => {
    // Only fetch if admin has view permission
    if (!permissionLoading && permissions.canView) {
      fetchCategories();
    } else if (!permissionLoading && !permissions.canView) {
      setLoading(false);
      setError('You do not have permission to view category management');
    }
  }, [permissions.canView, permissionLoading]);

  // Fetch categories data
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/api/category/all`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to fetch categories');
      }

      setCategories(data.data || []);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (category = null) => {
    if (category) {
      setFormData({ category_name: category.category_name });
      setSelectedCategory(category);
    } else {
      setFormData({ category_name: '' });
      setSelectedCategory(null);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({ category_name: '' });
    setSelectedCategory(null);
    setFormErrors({});
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.category_name.trim()) {
      errors.category_name = 'Category name is required';
    } else if (formData.category_name.trim().length < 2) {
      errors.category_name = 'Category name must be at least 2 characters long';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('accessToken');
      const url = selectedCategory 
        ? `${baseurl}/api/category/update/${selectedCategory.cid}`
        : `${baseurl}/api/category/register`;

      const response = await fetch(url, {
        method: selectedCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to save category');
      }

      setSnackbar({
        open: true,
        message: selectedCategory ? 'Category updated successfully' : 'Category created successfully',
        severity: 'success'
      });

      handleCloseDialog();
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save category',
        severity: 'error'
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('accessToken');
      const response = await fetch(`${baseurl}/api/category/delete/${selectedCategory.cid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setSnackbar({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success'
      });

      handleCloseDeleteDialog();
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete category',
        severity: 'error'
      });
    }
  };

  const handleExport = () => {
    const exportData = categories.map(category => ({
      'ID': category.cid,
      'Category Name': category.category_name,
      'Created At': new Date(category.createdAt).toLocaleDateString(),
      'Updated At': new Date(category.updatedAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Categories');
    XLSX.writeFile(wb, `categories_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show loading state while checking permissions
  if (permissionLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', p: 4, textAlign: 'center' }}>
          <CircularProgress size={24} sx={{ mb: 2 }} />
          <Typography variant="h6">
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
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You do not have permission to view the Category Management module.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 3, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
              onClick={() => window.location.reload()}
            >
              Refresh Page
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#2E7D32', mb: 0.5 }}>
              Category Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage category records
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', md: 'auto' } }}>
            {permissions.canAdd && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  backgroundColor: '#4CAF50',
                  '&:hover': { backgroundColor: '#45a049' },
                  px: 3,
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                Add Category
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
              placeholder="Search categories..."
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
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>Category Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                      <Typography color="error">{error}</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                      <Typography>No categories found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category, index) => (
                    <TableRow key={category.cid} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell>
                        <Typography variant="body2">
                          {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {category.category_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {permissions.canView && (
                            <IconButton
                              size="small"
                              sx={{ color: '#666' }}
                              onClick={() => handleViewCategory(category)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          )}
                          {permissions.canEdit && (
                            <IconButton
                              size="small"
                              sx={{ color: '#666' }}
                              onClick={() => handleOpenDialog(category)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                          {permissions.canDelete && (
                            <IconButton
                              size="small"
                              sx={{ color: '#f44336' }}
                              onClick={() => handleDeleteClick(category)}
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
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={formData.category_name}
            onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
            error={!!formErrors.category_name}
            helperText={formErrors.category_name}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Category Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Category Details
          <IconButton
            aria-label="close"
            onClick={handleCloseViewDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedCategory && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Category Name:</strong> {selectedCategory.category_name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "{selectedCategory?.category_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <Alert 
          severity={snackbar.severity} 
          onClose={handleCloseSnackbar}
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16, 
            minWidth: 300,
            zIndex: 9999 
          }}
        >
          {snackbar.message}
        </Alert>
      )}
    </Box>
  );
};

export default Category;