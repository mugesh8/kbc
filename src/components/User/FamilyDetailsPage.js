import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Footer from './Footer';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import baseurl from '../Baseurl/baseurl';

const FamilyDetailsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    father_name: '',
    father_contact: '',
    mother_name: '',
    mother_contact: '',
    spouse_name: '',
    spouse_contact: '',
    number_of_children: '',
    children_names: '',
    family_address: '',
    marital_status: ''
  });

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setFetchLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Authentication required');
          return;
        }

        const response = await fetch(`${baseurl}/api/member/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          const memberData = data.data;

          localStorage.setItem('memberId', memberData.mid);

          setFormData(prev => ({
            ...prev,
            father_name: memberData.MemberFamily?.father_name || '',
            father_contact: memberData.MemberFamily?.father_contact || '',
            mother_name: memberData.MemberFamily?.mother_name || '',
            mother_contact: memberData.MemberFamily?.mother_contact || '',
            spouse_name: memberData.MemberFamily?.spouse_name || '',
            spouse_contact: memberData.MemberFamily?.spouse_contact || '',
            number_of_children: memberData.MemberFamily?.number_of_children || '',
            children_names: memberData.MemberFamily?.children_names
              ? JSON.parse(memberData.MemberFamily.children_names).join(', ')
              : '',
            family_address: memberData.MemberFamily?.address || '',
            marital_status: memberData.marital_status || ''
          }));
        } else {
          setError(data.message || 'Failed to load member data');
        }
      } catch (err) {
        console.error('Error fetching member data:', err);
        setError(`Failed to load member data: ${err.message}`);
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchMemberData();
    } else {
      setFetchLoading(false);
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const memberId = localStorage.getItem('memberId');

      if (!token) {
        setError('Authentication required');
        return;
      }

      if (!memberId) {
        setError('Member ID not found');
        return;
      }

      const familyDataToSend = {
        member_id: parseInt(memberId),
        father_name: formData.father_name,
        father_contact: formData.father_contact,
        mother_name: formData.mother_name,
        mother_contact: formData.mother_contact,
        spouse_name: formData.spouse_name,
        spouse_contact: formData.spouse_contact,
        number_of_children: parseInt(formData.number_of_children) || 0,
        children_names: formData.children_names
          ? formData.children_names.split(',').map(name => name.trim())
          : [],
        address: formData.family_address,
        marital_status: formData.marital_status
      };

      const response = await fetch(`${baseurl}/api/family-details/update/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(familyDataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success !== false) {
        setSuccess('Family details updated successfully');
        setTimeout(() => navigate(-1), 2000);
      } else {
        setError(data.message || 'Failed to update family details');
      }
    } catch (err) {
      console.error('Error updating family details:', err);
      setError(`Failed to update family details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box pb={10}>
      <Box sx={{ bgcolor: 'green', color: 'white', p: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography fontSize={14} fontWeight={600}>
            {t('personalDetails')}
          </Typography>
        </Box>
      </Box>

      <Box p={2} component="form" onSubmit={handleSubmit}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Typography fontWeight="bold" mt={2}>{t('Family Details')}</Typography>

        <TextField
          fullWidth
          margin="dense"
          label={t('fathername')}
          name="father_name"
          value={formData.father_name}
          onChange={handleInputChange}
        />

        <TextField
          fullWidth
          margin="dense"
          label={t('fathercontact')}
          name="father_contact"
          value={formData.father_contact}
          onChange={handleInputChange}
        />

        <TextField
          fullWidth
          margin="dense"
          label={t('mothername')}
          name="mother_name"
          value={formData.mother_name}
          onChange={handleInputChange}
        />

        <TextField
          fullWidth
          margin="dense"
          label={t('mothercontact')}
          name="mother_contact"
          value={formData.mother_contact}
          onChange={handleInputChange}
        />

        <TextField
          fullWidth
          margin="dense"
          label={t('spousename')}
          name="spouse_name"
          value={formData.spouse_name}
          onChange={handleInputChange}
        />

        <TextField
          fullWidth
          margin="dense"
          label={t('spousecontact')}
          name="spouse_contact"
          value={formData.spouse_contact}
          onChange={handleInputChange}
        />

        <TextField
          fullWidth
          margin="dense"
          label={t('numberofchildren')}
          name="number_of_children"
          type="number"
          value={formData.number_of_children}
          onChange={handleInputChange}
        />

        <TextField
          fullWidth
          margin="dense"
          label={t('childrennames')}
          name="children_names"
          value={formData.children_names}
          onChange={handleInputChange}
          helperText="Separate names by comma (e.g. Anu, Arjun)"
        />

        <TextField
          fullWidth
          margin="dense"
          label={t('familyaddress')}
          name="family_address"
          value={formData.family_address}
          onChange={handleInputChange}
          multiline
          rows={3}
        />

        <TextField
          fullWidth
          margin="dense"
          label={t('maritalstatus')}
          name="marital_status"
          value={formData.marital_status}
          onChange={handleInputChange}
        />

        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={loading}
          sx={{ mt: 3, bgcolor: 'green' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t('updateChanges')}
        </Button>
      </Box>

      <Footer />
    </Box>
  );
};

export default FamilyDetailsPage;
