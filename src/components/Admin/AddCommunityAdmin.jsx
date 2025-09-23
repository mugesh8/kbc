import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Grid, TextField, Typography, Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import baseurl from '../Baseurl/baseurl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const AddCommunityAdmin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await fetch(`${baseurl}/api/community_admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
        <Button variant="outlined" onClick={() => navigate('/admin/CommunityAdmin')}>Back to List</Button>
      </Stack>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField 
                  label="Password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  value={form.password} 
                  onChange={handleChange} 
                  fullWidth 
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
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <Button type="submit" variant="contained" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
                  <Button variant="text" onClick={() => navigate('/admin/CommunityAdmin')}>Cancel</Button>
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
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddCommunityAdmin;


