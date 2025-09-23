import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import BaseUrl from '../Baseurl/baseurl';
import { useCustomTheme } from '../../context/ThemeContext';

const UpdateCredentialsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useCustomTheme();
  
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [formData, setFormData] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BaseUrl}/api/member/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.data) {
          setMember(data.data);
          setFormData(prev => ({
            ...prev,
            email: data.data.email || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching member:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load member data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [id]);

  const handleClickShowPassword = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    // Old password validation
    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Old password is required';
      isValid = false;
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BaseUrl}/api/member/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message || 'Credentials updated successfully!',
          severity: 'success'
        });
        
        // Update local storage if email changed
        if (formData.email !== member.email) {
          const memberData = JSON.parse(localStorage.getItem('memberData'));
          if (memberData) {
            localStorage.setItem('memberData', JSON.stringify({
              ...memberData,
              email: formData.email
            }));
          }
        }
      } else {
        throw new Error(data.message || 'Failed to update credentials');
      }
    } catch (err) {
      console.error('Error updating credentials:', err);
      setSnackbar({
        open: true,
        message: err.message || 'An error occurred',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && !member) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor={theme.palette.background.default}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: '100vh',
        color: theme.palette.text.primary,
        pb: 8
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(to right, #137d13, #3ad13a)',
          p: 2,
          color: '#fff',
          position: 'relative'
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#fff'
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight="bold" align="center">
          {t('Update Login Credentials')}
        </Typography>
      </Box>

      <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
        <Paper 
          elevation={3}
          sx={{
            p: 3,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary
            }}
          >
            {t('Update Email Password')}
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              variant="outlined"
              sx={{
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary
                }
              }}
              InputLabelProps={{
                style: { color: theme.palette.text.secondary }
              }}
            />

            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel 
                htmlFor="old-password" 
                sx={{ color: theme.palette.text.secondary }}
              >
                Old Password
              </InputLabel>
              <OutlinedInput
                id="old-password"
                name="oldPassword"
                type={showPassword.oldPassword ? 'text' : 'password'}
                value={formData.oldPassword}
                onChange={handleChange}
                error={!!errors.oldPassword}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleClickShowPassword('oldPassword')}
                      edge="end"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {showPassword.oldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Old Password"
                sx={{
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary
                  }
                }}
              />
              {errors.oldPassword && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.oldPassword}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel 
                htmlFor="new-password" 
                sx={{ color: theme.palette.text.secondary }}
              >
                New Password
              </InputLabel>
              <OutlinedInput
                id="new-password"
                name="newPassword"
                type={showPassword.newPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange}
                error={!!errors.newPassword}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleClickShowPassword('newPassword')}
                      edge="end"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="New Password"
                sx={{
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary
                  }
                }}
              />
              {errors.newPassword && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.newPassword}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel 
                htmlFor="confirm-password" 
                sx={{ color: theme.palette.text.secondary }}
              >
                Confirm New Password
              </InputLabel>
              <OutlinedInput
                id="confirm-password"
                name="confirmPassword"
                type={showPassword.confirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleClickShowPassword('confirmPassword')}
                      edge="end"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Confirm New Password"
                sx={{
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary
                  }
                }}
              />
              {errors.confirmPassword && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.confirmPassword}
                </Typography>
              )}
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(to right, #137d13, #3ad13a)',
                color: 'white',
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(to right, #0f6a0f, #2eb82e)'
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Credentials'}
            </Button>
          </form>
        </Paper>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {/* {t('credentialsNote') || 'Note: Changing your email will update your login username. Changing your password will log you out of all devices.'} */}
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            bgcolor: theme.palette.mode === 'dark'
              ? snackbar.severity === 'success' 
                ? theme.palette.success.dark 
                : theme.palette.error.dark
              : undefined,
            color: theme.palette.mode === 'dark' ? '#fff' : undefined
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdateCredentialsPage;