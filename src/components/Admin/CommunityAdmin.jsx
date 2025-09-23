import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import baseurl from '../Baseurl/baseurl';

const CommunityAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [admins, setAdmins] = useState([]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${baseurl}/api/community_admin/all`);
      if (!response.ok) throw new Error('Failed to load community admins');
      const data = await response.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error fetching community admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Community Admin</Typography>
        <Button variant="contained" onClick={() => navigate('/admin/CommunityAdmin/Add')}>Add Community Admin</Button>
      </Stack>

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins.map((a) => (
                    <TableRow key={a.caid} hover>
                      <TableCell>{a.caid}</TableCell>
                      <TableCell>{a.username}</TableCell>
                      <TableCell>{a.email}</TableCell>
                      <TableCell>{a.createdAt ? new Date(a.createdAt).toLocaleString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                  {admins.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No community admins found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CommunityAdmin;


