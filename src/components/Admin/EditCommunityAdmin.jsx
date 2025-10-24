import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Grid, TextField, Typography, Stack, Alert,
  IconButton, InputAdornment, FormControl, FormControlLabel, InputLabel, Select, MenuItem, Chip,
  Checkbox, ListItemText, OutlinedInput, Box as MuiBox, Switch
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import baseurl from '../Baseurl/baseurl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CancelIcon from '@mui/icons-material/Cancel';

const EditCommunityAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    roles: [] // Array of objects: { roleName: string, permissions: string[] }
  });
  const [originalData, setOriginalData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const roleOptions = [
    'Member Management',
    'Category',
    'Business Management',
    'Family Information',
    'Referral System',
    'Review Testimonials',
  ];

  const permissionOptions = {
    'Member Management': ['add', 'edit', 'view', 'delete'],
    'Category': ['add', 'edit', 'view', 'delete'],
    'Business Management': ['add', 'edit', 'view', 'delete'],
    'Family Information': ['add', 'edit', 'view', 'delete'],
    'Referral System': [], // This is a boolean permission
    'Review Testimonials': [] // This is a boolean permission
  };

  // Parse role string to extract role name and permissions
  const parseRoleString = (roleString) => {
    const parts = roleString.split(' -- ');
    const roleName = parts[0];
    let permissions = [];

    if (parts.length > 1) {
      permissions = parts[1].split(',').map(p => p.trim());
    }

    return { roleName, permissions };
  };

  // Format role name and permissions into a string
  const formatRoleString = (roleName, permissions) => {
    if (permissions.length === 0) return roleName;
    return `${roleName} -- ${permissions.join(', ')}`;
  };

  // Parse the role data from API response
  const parseRoleData = (roleData) => {
    if (Array.isArray(roleData)) {
      return roleData;
    } else if (typeof roleData === 'string') {
      try {
        // Try to parse as JSON first (for stringified arrays)
        const parsed = JSON.parse(roleData);
        return Array.isArray(parsed) ? parsed : [roleData];
      } catch (error) {
        // If parsing fails, treat it as a single role string
        return [roleData];
      }
    } else {
      return [];
    }
  };

  // Fetch admin data when component mounts
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch(`${baseurl}/api/community_admin/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch admin data');

        // Parse role data safely
        const roleData = parseRoleData(data.role);
        
        // Parse role strings to extract role names and permissions
        const parsedRoles = roleData.map(roleStr => {
          const { roleName, permissions } = parseRoleString(roleStr);
          return { roleName, permissions };
        });

        // Set form data (password is left empty for security)
        setForm({
          username: data.username,
          email: data.email,
          password: '',
          roles: parsedRoles
        });

        // Store original data for reset functionality
        setOriginalData({
          username: data.username,
          email: data.email,
          roles: parsedRoles
        });
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle role selection change
  const handleRoleChange = (event) => {
    const {
      target: { value },
    } = event;

    // Convert selected values to role objects
    const newRoles = value.map(roleName => {
      // Check if this role already exists in the form
      const existingRole = form.roles.find(r => r.roleName === roleName);
      if (existingRole) {
        return existingRole;
      }
      // If it's a new role, initialize with default permissions
      return {
        roleName,
        permissions: permissionOptions[roleName] && permissionOptions[roleName].length > 0
          ? ['view'] // Default to view permission
          : [] // For boolean permissions, no specific permissions needed
      };
    });

    setForm((prev) => ({
      ...prev,
      roles: newRoles
    }));
  };

  // Handle permission change for a specific role
  const handlePermissionChange = (roleName, permission) => {
    setForm((prev) => {
      const updatedRoles = prev.roles.map(role => {
        if (role.roleName === roleName) {
          // Toggle the permission
          const updatedPermissions = role.permissions.includes(permission)
            ? role.permissions.filter(p => p !== permission)
            : [...role.permissions, permission];

          return {
            ...role,
            permissions: updatedPermissions
          };
        }
        return role;
      });

      return {
        ...prev,
        roles: updatedRoles
      };
    });
  };

  // Handle permission toggle for a specific role
  const handlePermissionToggle = (roleName, permission) => {
    setForm((prev) => {
      const updatedRoles = prev.roles.map(role => {
        if (role.roleName === roleName) {
          let updatedPermissions;
          
          if (permission) {
            // Toggle specific permission
            updatedPermissions = role.permissions.includes(permission)
              ? role.permissions.filter(p => p !== permission)
              : [...role.permissions, permission];
          } else {
            // Toggle boolean permission (access)
            updatedPermissions = role.permissions.length > 0
              ? []
              : ['access'];
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
        roles: updatedRoles
      };
    });
  };

  // Handle role removal
  const handleRoleDelete = (roleToDelete) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.filter((role) => role.roleName !== roleToDelete)
    }));
  };

  // Reset form to original data
  const handleReset = () => {
    setForm({
      ...originalData,
      password: '' // Keep password empty
    });
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Convert roles back to string format
      const roleStrings = form.roles.map(role =>
        formatRoleString(role.roleName, role.permissions)
      );

      // Prepare update payload (only include password if it was changed)
      const updatePayload = {
        username: form.username,
        email: form.email,
        role: roleStrings
      };

      if (form.password) {
        updatePayload.password = form.password;
      }

      const res = await fetch(`${baseurl}/api/community_admin/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update community admin');

      setSuccess('Community Admin updated successfully');
      setTimeout(() => navigate('/admin/CommunityAdmin'), 800);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading admin data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Edit Community Admin</Typography>
        <Button variant="outlined" onClick={() => navigate('/admin/CommunityAdmin')}>
          Back to List
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  fullWidth
                  sx={{ minWidth: 500 }}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  sx={{ minWidth: 500 }}
                  required
                />
              </Grid>
            </Grid><br />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  fullWidth
                  sx={{ minWidth: 500 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText="Leave blank to keep current password"
                />
              </Grid>
            </Grid><br />

            <Grid container spacing={2}>
              {/* Role Dropdown - Multiple Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ minWidth: 500 }} required>
                  <InputLabel id="role-label">Roles</InputLabel>
                  <Select
                    labelId="role-label"
                    multiple
                    value={form.roles.map(role => role.roleName)}
                    onChange={handleRoleChange}
                    input={<OutlinedInput label="Roles" />}
                    renderValue={(selected) => (
                      <MuiBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            onDelete={() => handleRoleDelete(value)}
                            deleteIcon={
                              <IconButton
                                size="small"
                                onMouseDown={(event) => event.stopPropagation()}
                              >
                                <CancelIcon />
                              </IconButton>
                            }
                          />
                        ))}
                      </MuiBox>
                    )}
                  >
                    {roleOptions.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid><br />

            {/* Permissions for each selected role */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Permissions
              </Typography>

              {form.roles.length > 0 ? (
                <Grid container spacing={3}>
                  {form.roles.map((role) => (
                    <Grid item xs={12} key={role.roleName}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: '#f9f9f9',
                          border: '1px solid #e0e0e0',
                          '&:hover': { boxShadow: 1 }
                        }}
                      >
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#2c387e' }}>
                          {role.roleName}
                        </Typography>

                        {permissionOptions[role.roleName] && permissionOptions[role.roleName].length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 1 }}>
                            {permissionOptions[role.roleName].map((permission) => (
                              <FormControlLabel
                                key={permission}
                                control={
                                  <Switch
                                    checked={role.permissions.includes(permission)}
                                    onChange={() => handlePermissionToggle(role.roleName, permission)}
                                    color="primary"
                                    disabled={submitting}
                                  />
                                }
                                label={permission.charAt(0).toUpperCase() + permission.slice(1)}
                              />
                            ))}
                          </Box>
                        ) : (
                          <FormControlLabel
                            control={
                              <Switch
                                checked={role.permissions.length > 0}
                                onChange={() => handlePermissionToggle(role.roleName)}
                                color="primary"
                                disabled={submitting}
                              />
                            }
                            label="Access"
                          />
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    border: '1px dashed #ccc'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No roles selected. Please select roles to configure permissions.
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-start' }}>
                <Button type="submit" variant="contained" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update'}
                </Button>
                <Button variant="text" onClick={handleReset}>
                  Reset
                </Button>
              </Stack>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            {success && (
              <Grid item xs={12}>
                <Alert severity="success">{success}</Alert>
              </Grid>
            )}
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditCommunityAdmin;