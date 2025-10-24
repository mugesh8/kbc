import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Close } from '@mui/icons-material';
import baseurl from '../Baseurl/baseurl';

// NameAutocompleteField component for family member suggestions
const NameAutocompleteField = React.memo(({ 
  label, 
  nameValue, 
  contactValue, 
  onNameChange, 
  onContactChange, 
  suggestionsSource,
  error 
}) => {
  const [localQuery, setLocalQuery] = useState(nameValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalQuery(nameValue || '');
  }, [nameValue]);

  const filtered = (suggestionsSource || [])
    .filter(s => {
      const q = (localQuery || '').toLowerCase();
      const nameMatch = (s.name || '').toLowerCase().includes(q);
      const phoneMatch = (s.phone || '').includes(localQuery || '');
      return nameMatch || phoneMatch;
    })
    .slice(0, 8);

  const handleSelect = (item) => {
    if (onNameChange) onNameChange(item.name || '');
    if (onContactChange) onContactChange(item.phone || '');
    setLocalQuery(item.name || '');
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    if (onNameChange) onNameChange(value);
    setIsOpen(!!value);
  };

  const handleFocus = () => {
    setIsOpen(!!localQuery);
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div style={{ marginBottom: '16px', position: 'relative' }}>
      <TextField
        fullWidth
        label={label}
        value={localQuery}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={`Enter ${label.toLowerCase()}`}
        error={!!error}
        helperText={error}
        inputRef={inputRef}
        autoComplete="off"
        inputProps={{ autoComplete: 'off' }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#d1d5db',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#10b981',
            },
          },
        }}
      />
      {isOpen && localQuery && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          zIndex: 20,
          marginTop: '4px',
          width: '100%',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          maxHeight: '256px',
          overflow: 'auto'
        }}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        >
          {filtered.map((item, idx) => (
            <button
              type="button"
              key={idx}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '14px'
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0fdf4';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ color: '#1f2937', fontWeight: 500 }}>{item.name}</span>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>{item.phone}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

const AddFamilyDetailsForm = ({ open, onClose, memberId, memberName, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [memberSuggestions, setMemberSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    father_name: '',
    father_contact: '',
    mother_name: '',
    mother_contact: '',
    spouse_name: '',
    spouse_contact: '',
    number_of_children: '',
    children_names: '',
    address: ''
  });

  // Fetch member details when dialog opens
  useEffect(() => {
    if (open && memberId) {
      fetchMemberDetails();
      fetchMembersForSuggestions();
    }
  }, [open, memberId]);

  const fetchMemberDetails = async () => {
    try {
      const response = await fetch(`${baseurl}/api/member/${memberId}`);
      const result = await response.json();
      if (result.success) {
        setMemberData(result.data);
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
    }
  };

  // Fetch family entries for autocomplete suggestions
  const fetchMembersForSuggestions = async () => {
    try {
      const res = await fetch(`${baseurl}/api/member-family/all`);
      if (!res.ok) return;
      const data = await res.json();
      const families = data.data || [];
      const uniq = new Map();
      families.forEach(f => {
        const candidates = [
          { name: (f.father_name || '').trim(), phone: (f.father_contact || '').trim() },
          { name: (f.mother_name || '').trim(), phone: (f.mother_contact || '').trim() },
          { name: (f.spouse_name || '').trim(), phone: (f.spouse_contact || '').trim() },
        ];
        candidates.forEach(c => {
          if (c.name) {
            const key = `${c.name}|${c.phone}`;
            if (!uniq.has(key)) uniq.set(key, c);
          }
        });
      });
      setMemberSuggestions(Array.from(uniq.values()));
    } catch (e) {
      // silent fail for suggestions
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleFamilyDataChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isMarried = memberData?.marital_status?.toLowerCase().trim() === 'married';

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Prepare children names as array if provided
      let childrenNamesArray = [];
      if (formData.children_names && formData.children_names.trim()) {
        childrenNamesArray = formData.children_names
          .split(',')
          .map(name => name.trim())
          .filter(name => name.length > 0);
      }

      const payload = {
        member_id: memberId,
        father_name: formData.father_name || '',
        father_contact: formData.father_contact || '',
        mother_name: formData.mother_name || '',
        mother_contact: formData.mother_contact || '',
        spouse_name: formData.spouse_name || '',
        spouse_contact: formData.spouse_contact || '',
        number_of_children: formData.number_of_children ? parseInt(formData.number_of_children) : 0,
        children_names: childrenNamesArray,
        address: formData.address || ''
      };

      const response = await fetch(`${baseurl}/api/member/family/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess && onSuccess();
        onClose();
        // Reset form
        setFormData({
          father_name: '',
          father_contact: '',
          mother_name: '',
          mother_contact: '',
          spouse_name: '',
          spouse_contact: '',
          number_of_children: '',
          children_names: '',
          address: ''
        });
      } else {
        setError(result.msg || 'Failed to add family details');
      }
    } catch (error) {
      console.error('Error adding family details:', error);
      setError('Failed to add family details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setFormData({
      father_name: '',
      father_contact: '',
      mother_name: '',
      mother_contact: '',
      spouse_name: '',
      spouse_contact: '',
      number_of_children: '',
      children_names: '',
      address: ''
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Add Family Details for {memberName}
        </Typography>
        <IconButton onClick={handleClose} color="error">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <NameAutocompleteField
              label="Father's Name"
              nameValue={formData.father_name}
              contactValue={formData.father_contact}
              suggestionsSource={memberSuggestions}
              onNameChange={(val) => handleFamilyDataChange('father_name', val)}
              onContactChange={(val) => handleFamilyDataChange('father_contact', val)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Father's Contact"
              value={formData.father_contact || ''}
              onChange={(e) => handleFamilyDataChange('father_contact', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <NameAutocompleteField
              label="Mother's Name"
              nameValue={formData.mother_name}
              contactValue={formData.mother_contact}
              suggestionsSource={memberSuggestions}
              onNameChange={(val) => handleFamilyDataChange('mother_name', val)}
              onContactChange={(val) => handleFamilyDataChange('mother_contact', val)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mother's Contact"
              value={formData.mother_contact || ''}
              onChange={(e) => handleFamilyDataChange('mother_contact', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Grid>
          {isMarried && (
            <>
              <Grid item xs={12} sm={6}>
                <NameAutocompleteField
                  label="Spouse Name"
                  nameValue={formData.spouse_name}
                  contactValue={formData.spouse_contact}
                  suggestionsSource={memberSuggestions}
                  onNameChange={(val) => handleFamilyDataChange('spouse_name', val)}
                  onContactChange={(val) => handleFamilyDataChange('spouse_contact', val)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Spouse Contact"
                  value={formData.spouse_contact || ''}
                  onChange={(e) => handleFamilyDataChange('spouse_contact', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </Grid>
            </>
          )}
          {isMarried && (
            <>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Number of Children"
                  type="number"
                  value={formData.number_of_children}
                  onChange={handleInputChange('number_of_children')}
                  placeholder="0"
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Children Names (comma separated)"
                  value={formData.children_names}
                  onChange={handleInputChange('children_names')}
                  placeholder="John Doe, Jane Doe"
                />
              </Grid>
            </>
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Home Address"
              multiline
              rows={2}
              value={formData.address || ''}
              onChange={(e) => handleFamilyDataChange('address', e.target.value)}
              placeholder="123, ABC Road, Chennai - 600001"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Adding...' : 'Add Family Details'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddFamilyDetailsForm;