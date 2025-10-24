import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, Grid, TextField, Typography, Stack, Alert,
  IconButton, InputAdornment, FormControl, FormControlLabel, InputLabel, Select, MenuItem, Chip,
  Checkbox, ListItemText, OutlinedInput, Box as MuiBox
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import baseurl from '../Baseurl/baseurl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CancelIcon from '@mui/icons-material/Cancel';

const AddCommunityAdmin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    roles: [] // Array of objects: { roleName: string, permissions: string[] }
  });
  const [submitting, setSubmitting] = useState(false);
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

  // Format role name and permissions into a string
  const formatRoleString = (roleName, permissions) => {
    if (permissions.length === 0) return roleName;
    return `${roleName} -- ${permissions.join(', ')}`;
  };

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

  // Handle role removal
  const handleRoleDelete = (roleToDelete) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.filter((role) => role.roleName !== roleToDelete)
    }));
  };

  // Reset form to initial state
  const handleReset = () => {
    setForm({
      username: '',
      email: '',
      password: '',
      roles: [] // Reset to empty array
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

      const res = await fetch(`${baseurl}/api/community_admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: roleStrings
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add community admin');
      setSuccess('Community Admin created successfully');
      setTimeout(() => navigate('/admin/CommunityAdmin'), 800);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Add Community Admin</Typography>
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
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

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
                            mouseLeaveDelay={500}
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
                          <Grid container spacing={1}>
                            {permissionOptions[role.roleName].map((permission) => (
                              <Grid item key={permission}>
                                <Chip
                                  label={permission}
                                  clickable
                                  color={role.permissions.includes(permission) ? "primary" : "default"}
                                  onClick={() => handlePermissionChange(role.roleName, permission)}
                                  variant={role.permissions.includes(permission) ? "filled" : "outlined"}
                                  sx={{
                                    '&.MuiChip-colorPrimary': { bgcolor: '#4caf50' },
                                    '&.MuiChip-clickable': { cursor: 'pointer' }
                                  }}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={role.permissions.length > 0}
                                onChange={() => handlePermissionChange(role.roleName, 'access')}
                                color="primary"
                              />
                            }
                            label="Grant Access"
                            sx={{ mt: 1 }}
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

            <Grid item xs={12}>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="text" onClick={handleReset}>
                  Cancel
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

export default AddCommunityAdmin;