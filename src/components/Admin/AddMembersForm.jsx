import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  TextField,
  TextareaAutosize,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Radio,
  RadioGroup,
  Paper,
  Avatar,
  Chip,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  ArrowBack,
  CloudUpload,
  Delete,
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  Business,
  FamilyRestroom,
  Close,
  Add,
  Work,
  Check,
  Visibility,
  VisibilityOff,
  LocationOn
} from '@mui/icons-material';
import baseurl from '../Baseurl/baseurl';
import { useNavigate } from 'react-router-dom';

// Extracted NameAutocompleteField to top-level to avoid remounting on each FamilyModal render
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

// FamilyModal Component with fixed autofill functionality
const FamilyModal = ({
  open,
  onClose,
  familyData,
  onFamilyDataChange,
  onSubmit,
  memberSuggestions,
  maritalStatus
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Family Details
        </Typography>
        <IconButton onClick={onClose} color="error">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <NameAutocompleteField
              label="Father's Name"
              nameValue={familyData.father_name}
              contactValue={familyData.father_contact}
              suggestionsSource={memberSuggestions}
              onNameChange={(val) => onFamilyDataChange('father_name', val)}
              onContactChange={(val) => onFamilyDataChange('father_contact', val)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Father's Contact"
              value={familyData.father_contact || ''}
              onChange={(e) => onFamilyDataChange('father_contact', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <NameAutocompleteField
              label="Mother's Name"
              nameValue={familyData.mother_name}
              contactValue={familyData.mother_contact}
              suggestionsSource={memberSuggestions}
              onNameChange={(val) => onFamilyDataChange('mother_name', val)}
              onContactChange={(val) => onFamilyDataChange('mother_contact', val)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mother's Contact"
              value={familyData.mother_contact || ''}
              onChange={(e) => onFamilyDataChange('mother_contact', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Grid>
          {(['married','widowed'].includes((maritalStatus || '').toLowerCase())) && (
            <>
              <Grid item xs={12} sm={6}>
                <NameAutocompleteField
                  label="Spouse Name (if Married)"
                  nameValue={familyData.spouse_name}
                  contactValue={familyData.spouse_contact}
                  suggestionsSource={memberSuggestions}
                  onNameChange={(val) => onFamilyDataChange('spouse_name', val)}
                  onContactChange={(val) => onFamilyDataChange('spouse_contact', val)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Spouse Contact"
                  value={familyData.spouse_contact || ''}
                  onChange={(e) => onFamilyDataChange('spouse_contact', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </Grid>
            </>
          )}
          {(['married','widowed'].includes((maritalStatus || '').toLowerCase())) && (
            <>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="No. of Children"
                  type="number"
                  value={familyData.number_of_children || ''}
                  onChange={(e) => onFamilyDataChange('number_of_children', e.target.value)}
                  placeholder="2"
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Children Names (comma separated)"
                  value={familyData.children_names || ''}
                  onChange={(e) => onFamilyDataChange('children_names', e.target.value)}
                  placeholder="Chris John, Jane Doe"
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
              value={familyData.address || ''}
              onChange={(e) => onFamilyDataChange('address', e.target.value)}
              placeholder="123, ABC Road, Chennai - 600001"
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            color="success"
            onClick={onSubmit}
            sx={{ px: 4 }}
          >
            Continue
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// TagsInput Component (without label)
const TagsInput = ({ tags = [], onAdd, onRemove, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState('');

  const filteredSuggestions = suggestions
    .filter(s => s.toLowerCase().includes(inputValue.toLowerCase()))
    .filter(s => !tags.some(t => t.toLowerCase() === s.toLowerCase()))
    .slice(0, 8);

  const handleAdd = (tag) => {
    if (!tag) return;
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (tags.find(t => t.toLowerCase() === trimmed.toLowerCase())) return;
    onAdd && onAdd(trimmed);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onRemove && onRemove(tags.length - 1);
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        width: '100%',
        padding: '12px',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tags.map((tag, idx) => (
            <span key={idx} style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {tag}
              <button 
                type="button" 
                style={{ 
                  color: '#166534', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '16px'
                }} 
                onClick={() => onRemove && onRemove(idx)}
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to add tags"
            style={{
              flex: 1,
              minWidth: '120px',
              backgroundColor: 'transparent',
              outline: 'none',
              border: 'none',
              color: '#374151'
            }}
          />
        </div>
      </div>
      {filteredSuggestions.length > 0 && (
        <div style={{
          marginTop: '8px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '8px'
        }}>
          {filteredSuggestions.map((s, i) => (
            <button
              type="button"
              key={i}
              onClick={() => handleAdd(s)}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#f9fafb',
                border: '1px solid #f3f4f6',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0fdf4';
                e.target.style.color = '#166534';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.color = 'inherit';
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// BusinessProfileModal Component
const BusinessProfileModal = ({
  open,
  onClose,
  businessData,
  onBusinessDataChange,
  onSubmit,
  categories,
  handleTagAdd,
  handleTagRemove,
  handleBusinessFileUpload,
  handleRemoveBusinessProfileImage,
  handleRemoveBusinessMedia
}) => {
  const [customBusinessRegistrationType, setCustomBusinessRegistrationType] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    if (open) {
      setCustomBusinessRegistrationType('');
      setCategoryInput(businessData.category_input || '');
      // Initialize with main branch if no branches exist
      if (branches.length === 0) {
        setBranches([{
          id: 1,
          branch_name: 'Main Branch',
          contact_no: businessData.contact_no || '',
          email: businessData.email || '',
          company_address: businessData.company_address || '',
          city: businessData.city || '',
          state: businessData.state || '',
          zip_code: businessData.zip_code || '',
          is_main: true
        }]);
      }
    }
  }, [open, businessData.category_input]);

  const filteredCategories = (categories || [])
    .filter(c => c.category_name.toLowerCase().includes((categoryInput || '').toLowerCase()))
    .slice(0, 8);

  const handleSelectExistingCategory = (cid, name) => {
    onBusinessDataChange("category_id", String(cid));
    setCategoryInput(name);
    setShowCategorySuggestions(false);
  };

  const handleCategoryInputChange = (value) => {
    setCategoryInput(value);
    setShowCategorySuggestions(true);
    onBusinessDataChange("category_input", value);
    if (!value || value.trim() === '' || (businessData.category_id && value.trim().toLowerCase() !== (categories.find(c => String(c.cid) === String(businessData.category_id))?.category_name || '').toLowerCase())) {
      onBusinessDataChange("category_id", '');
    }
  };

  // Add new branch
  const handleAddBranch = () => {
    const newBranchId = branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1;
    const newBranch = {
      id: newBranchId,
      branch_name: `Branch ${newBranchId}`,
      contact_no: '',
      email: '',
      company_address: '',
      city: '',
      state: '',
      zip_code: '',
      is_main: false
    };
    setBranches(prev => [...prev, newBranch]);
  };

  // Remove branch
  const handleRemoveBranch = (branchId) => {
    setBranches(prev => prev.filter(branch => branch.id !== branchId));
  };

  // Update branch data
  const handleBranchChange = (branchId, field, value) => {
    setBranches(prev => prev.map(branch => 
      branch.id === branchId ? { ...branch, [field]: value } : branch
    ));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Business Profile Details
        </Typography>
        <IconButton onClick={onClose} color="error">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Business Details */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required sx={{ minWidth: 180, marginTop: '10px' }}>
              <InputLabel>Business Type</InputLabel>
              <Select
                label="Business Type"
                value={businessData.business_type || ''}
                onChange={(e) => onBusinessDataChange("business_type", e.target.value)}
              >
                <MenuItem value="self-employed">Self Employed</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="salary">Salary</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {(businessData.business_type === "self-employed" || businessData.business_type === "business" || businessData.business_type === "salary") && (
            <Grid item xs={12} sm={6}>
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <label style={{ display: 'block', color: '#1f2937', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => handleCategoryInputChange(e.target.value)}
                  placeholder="Type to search or add category"
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    backgroundColor: '#f9fafb',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.1)';
                    setShowCategorySuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 150)}
                />
                {showCategorySuggestions && categoryInput && filteredCategories.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    zIndex: 20,
                    marginTop: '8px',
                    width: '100%',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    maxHeight: '224px',
                    overflow: 'auto'
                  }}>
                    {filteredCategories.map(cat => (
                      <button
                        type="button"
                        key={cat.cid}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 16px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectExistingCategory(cat.cid, cat.category_name)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f0fdf4';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        {cat.category_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Company Name"
              value={businessData.company_name || ''}
              onChange={(e) => onBusinessDataChange("company_name", e.target.value)}
              placeholder="Enter company name"
              sx={{ marginTop: '10px' }}
            />
          </Grid>

       

          {(businessData.business_type === "self-employed" || businessData.business_type === "business") && (
            <>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required sx={{ minWidth: 270, marginTop: '10px' }}>
                  <InputLabel>Business Registration Type</InputLabel>
              <Select
                value={businessData.business_registration_type || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  onBusinessDataChange("business_registration_type", value);
                  if (value !== "Others") {
                    setCustomBusinessRegistrationType('');
                    onBusinessDataChange("business_registration_type_other", '');
                  }
                }}
                label="Business Registration Type"
              >
                    <MenuItem value="Proprietor">Proprietor</MenuItem>
                    <MenuItem value="Partnership">Partnership</MenuItem>
                    <MenuItem value="Private Limited">Private Limited</MenuItem>
                    <MenuItem value="Others">Others</MenuItem>
                  </Select>
                </FormControl>
                {businessData.business_registration_type === "Others" && (
                  <TextField
                    fullWidth
                    label="Specify Business Registration Type"
                    value={customBusinessRegistrationType}
                    onChange={(e) => {
                      const customValue = e.target.value;
                      setCustomBusinessRegistrationType(customValue);
                  onBusinessDataChange("business_registration_type_other", customValue);
                    }}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>

              {businessData.business_type === 'self-employed' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Work Experience (years)"
                    placeholder="Enter years of experience"
                    type="number"
                    value={businessData.experience || ''}
                    onChange={(e) => onBusinessDataChange("experience", e.target.value)}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <label style={{ display: 'block', color: '#1f2937', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  About <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <TextareaAutosize
                  minRows={4}
                  placeholder="Enter company about"
                  required
                  value={businessData.about || ""}
                  onChange={(e) => onBusinessDataChange("about", e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </Grid>
            </>
          )}

          {businessData.business_type === "salary" && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  placeholder="Enter designation"
                  required
                  value={businessData.designation || ""}
                  onChange={(e) => onBusinessDataChange("designation", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Experience (Years)"
                  placeholder="Enter years of experience"
                  required
                  value={businessData.experience || ""}
                  onChange={(e) => onBusinessDataChange("experience", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Salary"
                  placeholder="Enter salary"
                  required
                  value={businessData.salary || ""}
                  onChange={(e) => onBusinessDataChange("salary", e.target.value)}
                />
              </Grid>
            </>
          )}

          {/* Company Address & Branches Section */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Company Address & Branches
              </Typography>
              <Button
                variant="outlined"
                startIcon={<LocationOn />}
                onClick={handleAddBranch}
                color="primary"
              >
                Add Branch
              </Button>
            </Box>

            {/* Main Branch and Additional Branches */}
            {branches.map((branch, index) => (
              <Box key={branch.id} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {branch.is_main ? 'Main Branch' : `Branch ${index}`}
                  </Typography>
                  {!branch.is_main && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveBranch(branch.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  {/* Branch Name, Contact, and Email */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Branch Name"
                      placeholder="Enter branch name"
                      value={branch.branch_name || ''}
                      onChange={(e) => handleBranchChange(branch.id, 'branch_name', e.target.value)}
                      required={branch.is_main}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Contact Number"
                      placeholder="Enter contact number"
                      value={branch.contact_no || ''}
                      onChange={(e) => handleBranchChange(branch.id, 'contact_no', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Email"
                      placeholder="Enter email"
                      type="email"
                      value={branch.email || ''}
                      onChange={(e) => handleBranchChange(branch.id, 'email', e.target.value)}
                    />
                  </Grid>

                  {/* Address Fields */}
                  <Grid item xs={12}>
                    <label style={{ display: 'block', color: '#1f2937', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Company Address {branch.is_main && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <TextareaAutosize
                      minRows={3}
                      placeholder="Enter company address"
                      value={branch.company_address || ""}
                      onChange={(e) => handleBranchChange(branch.id, 'company_address', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        resize: 'vertical',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#10b981';
                        e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="City"
                      placeholder="Enter city"
                      value={branch.city || ""}
                      onChange={(e) => handleBranchChange(branch.id, 'city', e.target.value)}
                      required={branch.is_main}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="State"
                      placeholder="Enter state"
                      value={branch.state || ""}
                      onChange={(e) => handleBranchChange(branch.id, 'state', e.target.value)}
                      required={branch.is_main}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      placeholder="Enter pincode"
                      value={branch.zip_code || ""}
                      onChange={(e) => handleBranchChange(branch.id, 'zip_code', e.target.value)}
                      required={branch.is_main}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Grid>

          {/* Tags Input for all business types */}
          <Grid item xs={12}>
            <TagsInput
              tags={businessData.tags || []}
              onAdd={(tag) => handleTagAdd && handleTagAdd(tag)}
              onRemove={(tagIndex) => handleTagRemove && handleTagRemove(tagIndex)}
            />
          </Grid>

          {/* File Uploads for all business types */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Business Profile Image
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ minWidth: 200 }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleBusinessFileUpload('business_profile_image', e.target.files[0]);
                      }
                    }}
                  />
                </Button>
                {businessData.business_profile_image && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {businessData.business_profile_image.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handleRemoveBusinessProfileImage}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Media Gallery ({businessData.media_gallery?.length || 0}/5)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ minWidth: 200 }}
                >
                  Upload Media
                  <input
                    type="file"
                    hidden
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleBusinessFileUpload('media_gallery', e.target.files);
                      }
                    }}
                  />
                </Button>
              </Box>
              {businessData.media_gallery && businessData.media_gallery.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {businessData.media_gallery.map((file, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveBusinessMedia(index)}
                        color="error"
                        sx={{ p: 0.25 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              // Include branches data in the business data before submitting
              const businessDataWithBranches = {
                ...businessData,
                branches: branches
              };
              // Update the business data with branches
              Object.keys(businessDataWithBranches).forEach(key => {
                onBusinessDataChange(key, businessDataWithBranches[key]);
              });
              onSubmit();
            }}
            sx={{ px: 4 }}
          >
            Add Business Profile
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const AddNewMemberForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [familyModalOpen, setFamilyModalOpen] = useState(false);
  const [familyAdded, setFamilyAdded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);
  const [customValues, setCustomValues] = useState({
    gender: '',
    kootam: '',
    kovil: ''
  });
  const [showFamilyDetails, setShowFamilyDetails] = useState(false);
  const [memberSuggestions, setMemberSuggestions] = useState([]);
  const navigate = useNavigate();
  const [squads, setSquads] = useState([
    'Govt Squad',
    'Doctor Squad',
    'Legal Squad',
    'Advisory Squad'
  ]);
  
  // Add Pro members state
  const [proMembers, setProMembers] = useState([]);

  // Add All members state for referral dropdown
  const [allMembers, setAllMembers] = useState([]);
  const [referralSearchQuery, setReferralSearchQuery] = useState('');
  const [showReferralDropdown, setShowReferralDropdown] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseurl}/api/category/all`);
        if (!res.ok) {
          throw new Error(`Failed to fetch categories: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load categories',
          severity: 'error'
        });
      }
    };
    fetchCategories();
  }, []);

  // Fetch Pro members for Core Pro dropdown - Same as EditMember
  useEffect(() => {
    const fetchProMembers = async () => {
      try {
        const res = await fetch(`${baseurl}/api/member/pro`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProMembers(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch pro members:', err);
      }
    };
    fetchProMembers();
  }, []);

  // Fetch all members for referral dropdown
  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const res = await fetch(`${baseurl}/api/member/all`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAllMembers(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch all members:', err);
      }
    };
    fetchAllMembers();
  }, []);

  // Fetch family entries for autocomplete suggestions
  useEffect(() => {
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
    fetchMembersForSuggestions();
  }, []);

  const [formData, setFormData] = useState({
    // Step 1 - Basic Info (required fields)
    first_name: '',
    email: '',
    password: '',
    dob: '',
    gender: '',
    contact_no: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',

    // Other fields (optional)
    alternate_contact_no: '',
    join_date: '',
    aadhar_no: '',
    blood_group: '',
    marital_status: '',

    // Step 2 - Contact (all optional)
    work_phone: '',
    extension: '',
    secondary_email: '',
    emergency_contact: '',
    emergency_phone: '',
    personal_website: '',
    linkedin_profile: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    kootam: '',
    kovil: '',
    best_time_to_contact: '',

    // Step 3 - Access & Links
    access_level: 'Basic',
    status: 'Pending', // Changed to match backend default
    // Pro & Squad
    pro: 'Unpro',
    core_pro: '',
    squad: '',
    squad_fields: '',
    new_squad_name: '',
    has_referral: false,
    referral_name: '',
    referral_code: '',
    profile_image: null,
    business_profiles: [],
    family_details: {},

    // New fields from backend
    paid_status: 'Unpaid', // New field
    membership_valid_until: '', // New field
    Arakattalai: 'No', // New field
    KNS_Member: 'No', // New field
    KBN_Member: 'No', // New field
    BNI: 'No', // New field
    Rotary: 'No', // New field
    Lions: 'No', // New field
    Other_forum: '' // New field
  });

  const [familyData, setFamilyData] = useState({
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

  const [businessModalOpen, setBusinessModalOpen] = useState(false);
  const [businessProfiles, setBusinessProfiles] = useState([]);
  const [businessData, setBusinessData] = useState({
    company_name: '',
    business_type: '',
    category_id: '',
    category_input: '',
    business_registration_type: '',
    business_registration_type_other: '',
    about: '',
    company_address: '',
    city: '',
    state: '',
    zip_code: '',
    staff_size: '',
    business_work_contract: '',
    email: '',
    source: '',
    tags: [],
    designation: '',
    salary: '',
    location: '',
    experience: '',
    contact_no: '',
    business_profile_image: null,
    media_gallery: [],
    branches: [],
    exclusive_member_benefit: '' // New field
  });

  // Add profile image state
  const [profileImage, setProfileImage] = useState(null);

  // Clear spouse and children fields when marital status is Single or Divorced
  useEffect(() => {
    const status = (formData.marital_status || '');
    const shouldShowSpouseAndChildren = ['Married', 'Widowed'].includes(status);
    if (!shouldShowSpouseAndChildren && (familyData.spouse_name || familyData.spouse_contact || familyData.number_of_children || familyData.children_names)) {
      setFamilyData(prev => ({ 
        ...prev, 
        spouse_name: '', 
        spouse_contact: '', 
        number_of_children: '', 
        children_names: '' 
      }));
      setFormData(prev => ({
        ...prev,
        family_details: { 
          ...(prev.family_details || {}), 
          spouse_name: '', 
          spouse_contact: '', 
          number_of_children: '', 
          children_names: '' 
        }
      }));
    }
  }, [formData.marital_status]);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Add profile image handler
  const handleProfileImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setProfileImage(event.target.files[0]);
      setFormData(prev => ({ ...prev, profile_image: event.target.files[0] }));
    }
  };

  const steps = ['Basic Info', 'Contact', 'Access & Links'];

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFamilyInputChange = (field, value) => {
    setFamilyData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate required fields before moving to next step
    if (activeStep === 0) {
      const requiredFields = ['first_name', 'email', 'password', 'dob', 'gender', 'contact_no', 'address', 'city', 'state', 'zip_code'];
      const missingFields = requiredFields.filter(field => !formData[field]);

      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Enhanced email validation to match backend
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address (e.g., example@domain.com)');
        return;
      }

      // Validate password length
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }

    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Enhanced email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredPersonalFields = [
      'first_name', 'email', 'password',
      'contact_no', 'address', 'city', 'state', 'zip_code'
    ];

    requiredPersonalFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'Field is required';
      }
    });

    // Enhanced email validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., example@domain.com)';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // If referral is enabled, require referral code (same as Signup)
    if (formData.has_referral) {
      const code = (formData.referral_code || '').trim();
      if (!code) newErrors.referral_code = 'Referral code is required';
    }

    if (!Array.isArray(formData.business_profiles) || formData.business_profiles.length === 0) {
      newErrors.business_profiles = 'At least one business profile is required';
    }

    (formData.business_profiles || []).forEach((profile, index) => {
      if (!profile.company_name) {
        newErrors[`business_company_${index}`] = 'Company name is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the form errors',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      // Prepare all member fields according to backend - FIXED: Ensure string values
      const memberFields = [
        'first_name', 'email', 'password', 'dob', 'join_date', 
        'aadhar_no', 'blood_group', 'contact_no', 'alternate_contact_no',
        'marital_status', 'address', 'city', 'state', 'zip_code',
        'work_phone', 'extension', 'mobile_no', 'preferred_contact',
        'secondary_email', 'emergency_contact', 'emergency_phone',
        'personal_website', 'linkedin_profile', 'facebook', 'instagram',
        'twitter', 'youtube', 'best_time_to_contact',
        'referral_name', 'referral_code', 'status', 'access_level',
        'paid_status', 'Arakattalai', 'KNS_Member', 'KBN_Member', 'BNI',
        'Rotary', 'Lions', 'Other_forum', 'pro', 'squad', 'squad_fields'
      ];

      memberFields.forEach(field => {
        if (formData[field] !== null && formData[field] !== undefined && formData[field] !== '') {
          let value = formData[field];
          // Handle email fields
          if (field === 'email' || field === 'secondary_email') {
            value = value.trim().toLowerCase();
          }
          // Ensure all values are strings, not arrays
          if (Array.isArray(value)) {
            value = value[0] || ''; // Take first element if it's an array
          }
          formDataToSend.append(field, String(value));
        }
      });

      // FIXED: Handle gender, kootam, kovil as strings (not arrays)
      const genderValue = formData.gender === 'other' ? customValues.gender : formData.gender;
      if (genderValue) {
        const finalGenderValue = Array.isArray(genderValue) ? genderValue[0] : genderValue;
        formDataToSend.append('gender', String(finalGenderValue));
      }

      const kootamValue = formData.kootam === 'Others' ? customValues.kootam : formData.kootam;
      if (kootamValue) {
        const finalKootamValue = Array.isArray(kootamValue) ? kootamValue[0] : kootamValue;
        formDataToSend.append('kootam', String(finalKootamValue));
      }

      const kovilValue = formData.kovil === 'Others' ? customValues.kovil : formData.kovil;
      if (kovilValue) {
        const finalKovilValue = Array.isArray(kovilValue) ? kovilValue[0] : kovilValue;
        formDataToSend.append('kovil', String(finalKovilValue));
      }

      // Handle core_pro based on pro status (same as backend logic)
      let coreProFinal = null;
      if (formData.pro === 'Unpro') {
        coreProFinal = formData.core_pro || null;
      }
      if (coreProFinal !== null && coreProFinal !== undefined && coreProFinal !== '') {
        let finalCoreProValue = coreProFinal;
        if (Array.isArray(finalCoreProValue)) {
          finalCoreProValue = finalCoreProValue[0] || '';
        } else if (typeof finalCoreProValue === 'object') {
          // Coerce any object to string safely
          finalCoreProValue = String(finalCoreProValue);
        }
        if (finalCoreProValue !== '') {
          formDataToSend.append('core_pro', String(finalCoreProValue));
        }
      }

      // Handle membership_valid_until based on paid_status (same as backend logic)
      let membershipValidUntilFinal = null;
      if (formData.paid_status === 'Paid') {
        membershipValidUntilFinal = formData.membership_valid_until || null;
      }
      if (membershipValidUntilFinal) {
        const finalMembershipValue = Array.isArray(membershipValidUntilFinal) ? membershipValidUntilFinal[0] : membershipValidUntilFinal;
        formDataToSend.append('membership_valid_until', String(finalMembershipValue));
      }

      // Add default join_date if not provided
      if (!formData.join_date) {
        formDataToSend.append('join_date', new Date().toISOString().split('T')[0]);
      }

      // Handle profile image
      if (formData.profile_image) {
        formDataToSend.append('profile_image', formData.profile_image);
      }

      // Handle business profiles with branches structure for backend
      const businessProfilesForBackend = formData.business_profiles.map((profile, index) => {
        const { business_profile_image, media_gallery, category_input, branches, ...profileData } = profile;

        // If no category_id but category_input present, send as new_category_name
        if ((!profileData.category_id || String(profileData.category_id).trim() === '') && category_input && category_input.trim()) {
          profileData.new_category_name = category_input.trim();
        }

        // Pass through business_registration_type_other when Others is chosen
        if (profile.business_registration_type !== 'Others') {
          delete profileData.business_registration_type_other;
        }

        // Handle branches data - convert to arrays for backend
        if (branches && branches.length > 0) {
          // Extract branch names, addresses, cities, states, zip_codes from branches
          const branch_names = branches.map(branch => branch.branch_name || '');
          const company_addresses = branches.map(branch => branch.company_address || '');
          const cities = branches.map(branch => branch.city || '');
          const states = branches.map(branch => branch.state || '');
          const zip_codes = branches.map(branch => branch.zip_code || '');
          
          // Use contact numbers from branches as business_work_contract
          const business_work_contract = branches.map(branch => branch.contact_no || '');
          const emails = branches.map(branch => branch.email || '');

          profileData.branch_name = branch_names;
          profileData.company_address = company_addresses;
          profileData.city = cities;
          profileData.state = states;
          profileData.zip_code = zip_codes;
          profileData.business_work_contract = business_work_contract;
          profileData.email = emails;
        }

        // Ensure tags is a TEXT (string) for backend
        const normalizedTags = Array.isArray(profile.tags)
          ? profile.tags.join(',')
          : (typeof profile.tags === 'string' ? profile.tags : '');

        return { ...profileData, tags: normalizedTags };
      });

      formDataToSend.append('business_profiles', JSON.stringify(businessProfilesForBackend));

      // Handle business profile images and media gallery files separately
      formData.business_profiles.forEach((profile, index) => {
        if (profile.business_profile_image) {
          formDataToSend.append(`business_profile_image_${index}`, profile.business_profile_image);
        }

        // Handle media gallery files
        if (profile.media_gallery && profile.media_gallery.length > 0) {
          profile.media_gallery.forEach((file) => {
            formDataToSend.append(`media_gallery_${index}`, file);
          });
        }
      });

      // Handle family details
      if (showFamilyDetails) {
        const familyData = { ...formData.family_details };
        if (familyData.children_names && typeof familyData.children_names === 'string') {
          familyData.children_names = familyData.children_names
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        }

        formDataToSend.append('family_details', JSON.stringify(familyData));
      }

      // Log form data for debugging
      console.log('Submitting form data:', {
        email: formData.email,
        gender: formData.gender,
        kootam: formData.kootam,
        kovil: formData.kovil,
        businessProfilesCount: formData.business_profiles.length,
        hasFamily: showFamilyDetails,
        paid_status: formData.paid_status,
        pro: formData.pro
      });

      const response = await fetch(`${baseurl}/api/member/register`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => null);
        const errorMessage = errorResult?.msg || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setSnackbar({
        open: true,
        message: result.msg || 'Registration successful',
        severity: 'success'
      });
      setTimeout(() => navigate('/admin/MemberManagement'), 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Registration failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Tag handlers for business profiles
  const handleTagAdd = (tag) => {
    setBusinessData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tag]
    }));
  };

  const handleTagRemove = (tagIndex) => {
    setBusinessData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter((_, idx) => idx !== tagIndex)
    }));
  };

  const handleFamilySubmit = () => {
    console.log('Family data added:', familyData);
    setFamilyModalOpen(false);
    setFamilyAdded(true);
    setShowFamilyDetails(true);
    setFormData(prev => ({ ...prev, family_details: familyData }));
  };

  const handleRemoveFamilyProfile = () => {
    setFamilyAdded(false);
    setShowFamilyDetails(false);
    setFamilyData({
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
    setFormData(prev => ({ ...prev, family_details: {} }));
  };

  // FIXED: handleBusinessSubmit function - now adds business profile on first click
  const handleBusinessSubmit = () => {
    // Validate required fields based on business type
    if (!businessData.business_type || !businessData.company_name) {
      setError('Business type and company name are required');
      return;
    }

    // Validate category for all business types
    if (!businessData.category_id && !(businessData.category_input && businessData.category_input.trim())) {
      setError('Category is required');
      return;
    }

    if (businessData.business_type === 'self-employed' || businessData.business_type === 'business') {
      if (!businessData.about) {
        setError('About is required for this business type');
        return;
      }
    }

    if (businessData.business_type === 'salary') {
      if (!businessData.designation || !businessData.salary || !businessData.experience) {
        setError('Designation, salary, and experience are required for salary type');
        return;
      }
    }

    // Validate at least one branch has address data
    const hasValidBranch = businessData.branches && businessData.branches.some(branch => 
      branch.company_address && branch.city && branch.state && branch.zip_code
    );
    
    if (!hasValidBranch) {
      setError('At least one branch with complete address information is required');
      return;
    }

    // Add computed fields expected by backend
    const payloadBusiness = { ...businessData };
    if ((!payloadBusiness.category_id || String(payloadBusiness.category_id).trim() === '') && payloadBusiness.category_input && payloadBusiness.category_input.trim()) {
      payloadBusiness.new_category_name = payloadBusiness.category_input.trim();
    }

    // FIX: Add the current business data to the profiles array
    const newBusinessProfiles = [...businessProfiles, { ...payloadBusiness }];
    setBusinessProfiles(newBusinessProfiles);
    setFormData(prev => ({ ...prev, business_profiles: newBusinessProfiles }));

    // FIX: Reset the form data for next entry
    setBusinessData({
      company_name: '',
      business_type: '',
      category_id: '',
      category_input: '',
      business_registration_type: '',
      business_registration_type_other: '',
      about: '',
      company_address: '',
      city: '',
      state: '',
      zip_code: '',
      staff_size: '',
      business_work_contract: '',
      email: '',
      source: '',
      tags: [],
      designation: '',
      salary: '',
      location: '',
      experience: '',
      contact_no: '',
      business_profile_image: null,
      media_gallery: [],
      branches: [],
      exclusive_member_benefit: ''
    });

    // FIX: Close modal immediately after adding
    setBusinessModalOpen(false);
    setError(null);
  };

  const handleBusinessDataChange = (field, value) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
  };

  // Add file upload handlers for business profile
  const handleBusinessFileUpload = (field, file) => {
    if (field === 'media_gallery') {
      // Handle multiple files for media gallery
      const filesArray = Array.from(file);
      setBusinessData(prev => ({
        ...prev,
        media_gallery: [...(prev.media_gallery || []), ...filesArray]
      }));
    } else {
      setBusinessData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const handleRemoveBusinessProfileImage = () => {
    setBusinessData(prev => ({
      ...prev,
      business_profile_image: null
    }));
  };

  const handleRemoveBusinessMedia = (mediaIndex) => {
    setBusinessData(prev => ({
      ...prev,
      media_gallery: (prev.media_gallery || []).filter((_, idx) => idx !== mediaIndex)
    }));
  };

  const handleRemoveBusinessProfile = (index) => {
    setBusinessProfiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      business_profiles: prev.business_profiles.filter((_, i) => i !== index)
    }));
  };

  // Step 1 - Basic Info
  const renderBasicInfo = () => (
    <Box>
      {/* Profile Picture Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Profile Picture
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'grey.300',
              '& img': { objectFit: 'cover' },
            }}
            src={profileImage ? URL.createObjectURL(profileImage) : undefined}
          >
            <Business sx={{ fontSize: 40 }} />
          </Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button variant="outlined" startIcon={<CloudUpload />} component="label">
              Upload Photo
              <input type="file" hidden accept="image/*" onChange={handleProfileImageChange} />
            </Button>
            {profileImage && (
              <Button
                variant="text"
                color="error"
                size="small"
                onClick={() => {
                  setProfileImage(null);
                  setFormData(prev => ({ ...prev, profile_image: null }));
                }}
              >
                Remove
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Basic Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Basic Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Name"
              required
              value={formData.first_name}
              onChange={handleInputChange('first_name')}
              error={!!errors.first_name}
              helperText={errors.first_name}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Contact Number"
              value={formData.contact_no}
              onChange={handleInputChange('contact_no')}
              required
              error={!!errors.contact_no}
              helperText={errors.contact_no}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Email Address"
              required
              type="email"
              value={formData.email}
              onChange={(e) => {
                const value = e.target.value.trim();
                setFormData(prev => ({ ...prev, email: value }));
              }}
              error={!!errors.email}
              helperText={errors.email || (formData.email && !validateEmail(formData.email) ? "Please enter a valid email address (e.g., example@domain.com)" : "")}
              placeholder="example@domain.com"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Password"
              required
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password || "Password must be at least 8 characters long"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(prev => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={handleInputChange('dob')}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth sx={{ minWidth: 150 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, gender: value }));
                  if (value !== 'other') {
                    setCustomValues(prev => ({ ...prev, gender: '' }));
                  }
                }}
                label="Gender"
                required
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            {formData.gender === 'other' && (
              <TextField
                fullWidth
                label="Specify Gender"
                value={customValues.gender}
                onChange={(e) => {
                  const customValue = e.target.value;
                  setCustomValues(prev => ({ ...prev, gender: customValue }));
                  setFormData(prev => ({ ...prev, gender: 'other' }));
                }}
                sx={{ mt: 1 }}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth sx={{ minWidth: 150 }}>
              <InputLabel>Marital Status</InputLabel>
              <Select
                value={formData.marital_status}
                onChange={handleInputChange('marital_status')}
                label="Marital Status"
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="single">Single</MenuItem>
                <MenuItem value="married">Married</MenuItem>
                <MenuItem value="divorced">Divorced</MenuItem>
                <MenuItem value="widowed">Widowed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ minWidth: 150 }}>
              <InputLabel>Kootam</InputLabel>
              <Select
                value={formData.kootam}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, kootam: value }));
                  if (value !== 'Others') {
                    setCustomValues(prev => ({ ...prev, kootam: '' }));
                  }
                }}
                label="Kootam"
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Agamudayar">Agamudayar- அகமுடையார்</MenuItem>
                <MenuItem value="Karkathar">Karkathar- கார்காத்தார்</MenuItem>
                <MenuItem value="Kallar">Kallar - கள்ளர் </MenuItem>
                <MenuItem value="Maravar">Maravar - மறவர்</MenuItem>
                <MenuItem value="Servai">Servai - சேர்வை</MenuItem>
                <MenuItem value="Aanthuvan Kulam">Aanthuvan Kulam - அந்துவன்குலம்</MenuItem>
                <MenuItem value="Azhagu Kulam">Azhagu Kulam - அழகுக்குலம்</MenuItem>
                <MenuItem value="Aathe Kulam">Aathe Kulam - ஆதிக்குலம்</MenuItem>
                <MenuItem value="Aanthai Kulam">Aanthai Kulam - ஆந்தைக்குலம்</MenuItem>
                <MenuItem value="Aadar Kulam">Aadar Kulam - ஆடர்க்குலம்</MenuItem>
                <MenuItem value="Aavan Kulam">Aavan Kulam - ஆவன்குலம்</MenuItem>
                <MenuItem value="Eenjan Kulam">Eenjan Kulam - ஈஞ்சன்குலம்</MenuItem>
                <MenuItem value="Ozukkar Kulam">Ozukkar Kulam - ஒழுக்கர்குலம்</MenuItem>
                <MenuItem value="Oothaalar Kulam">Oothaalar Kulam - ஓதாளர்க்குலம்</MenuItem>
                <MenuItem value="Kannakkan Kulam">Kannakkan Kulam - கணக்கன்குலம்</MenuItem>
                <MenuItem value="Kannan Kulam">Kannan Kulam - கண்ணங்குலம்</MenuItem>
                <MenuItem value="Kannaanthai Kulam">Kannaanthai Kulam - கண்ணாந்தைக்குலம்</MenuItem>
                <MenuItem value="Kaadai Kulam">Kaadai Kulam - காடைக்குலம்</MenuItem>
                <MenuItem value="Kaari Kulam">Kaari Kulam - காரிக்குலம்</MenuItem>
                <MenuItem value="Keeran Kulam">Keeran Kulam - கீரன்க்குலம்</MenuItem>
                <MenuItem value="Kuzhlaayan Kulam">Kuzhlaayan Kulam - குழையன்குலம்</MenuItem>
                <MenuItem value="Koorai Kulam">Koorai Kulam - கூறைக்குலம்</MenuItem>
                <MenuItem value="Koovendhar Kulam">Koovendhar Kulam - கோவேந்தர்குலம்</MenuItem>
                <MenuItem value="Saathanthai Kulam">Saathanthai Kulam - சாத்தந்தைக்குலம்</MenuItem>
                <MenuItem value="Sellan Kulam">Sellan Kulam - செல்லன்குலம்</MenuItem>
                <MenuItem value="Semban Kulam">Semban Kulam - செம்பன்குலம்</MenuItem>
                <MenuItem value="Sengkannan Kulam">Sengkannan Kulam - செங்கண்ணன்குலம்</MenuItem>
                <MenuItem value="Sembuthan Kulam">Sembuthan Kulam - செம்பூதன்குலம்</MenuItem>
                <MenuItem value="Senkunnier Kulam">Senkunnier Kulam - செங்குன்னியர்குலம்</MenuItem>
                <MenuItem value="Sevvaayar Kulam">Sevvaayar Kulam - செவ்வாயர்குலம்</MenuItem>
                <MenuItem value="Cheran Kulam">Cheran Kulam - சேரன்குலம்</MenuItem>
                <MenuItem value="Chedan Kulam">Chedan Kulam - சேடன்குலம்</MenuItem>
                <MenuItem value="Dananjayan Kulam">Dananjayan Kulam - தனஞ்செயன்குலம்</MenuItem>
                <MenuItem value="Thazhinji Kulam">Thazhinji Kulam - தழிஞ்சிகுலம்</MenuItem>
                <MenuItem value="Thooran Kulam">Thooran Kulam - தூரன்குலம்</MenuItem>
                <MenuItem value="Devendran Kulam">Devendran Kulam - தேவேந்திரன்குலம்</MenuItem>
                <MenuItem value="Thoodar Kulam">Thoodar Kulam - தோடர்குலம்</MenuItem>
                <MenuItem value="Neerunniyar Kulam">Neerunniyar Kulam - நீருண்ணியர்குலம</MenuItem>
                <MenuItem value="Pavazhalar Kulam">Pavazhalar Kulam - பவழர்குலம்</MenuItem>
                <MenuItem value="Panayan Kulam">Panayan Kulam - பணையன்குலம்</MenuItem>
                <MenuItem value="Pathuman Kulam">Pathuman Kulam - பதுமன்குலம்</MenuItem>
                <MenuItem value="Payiran Kulam">Payiran Kulam - பயிரன்குலம்</MenuItem>
                <MenuItem value="Panagkaadar Kulam">Panagkaadar Kulam - பனங்காடர்குலம்</MenuItem>
                <MenuItem value="Pathariar Kulam">Pathariar Kulam - பதறியர்குலம்</MenuItem>
                <MenuItem value="Pandiyan Kulam">Pandiyan Kulam - பாண்டியன்குலம்</MenuItem>
                <MenuItem value="Pillar Kulam">Pillar Kulam - பில்லர்குலம்</MenuItem>
                <MenuItem value="Poosan Kulam">Poosan Kulam - பூசன்குலம்</MenuItem>
                <MenuItem value="Poochanthai Kulam">Poochanthai Kulam - பூச்சந்தைகுலம்</MenuItem>
                <MenuItem value="Periyan Kulam">Periyan Kulam - பெரியன்குலம்</MenuItem>
                <MenuItem value="Perunkudiyaan Kulam">Perunkudiyaan Kulam - பெருங்குடியான்குலம்</MenuItem>
                <MenuItem value="Porulaanthai Kulam">Porulaanthai Kulam - பொருளாந்தைக்குலம்</MenuItem>
                <MenuItem value="Ponnar Kulam">Ponnar Kulam - பொன்னர்குலம்</MenuItem>
                <MenuItem value="Maniyan Kulam">Maniyan Kulam - மணியன்குலம்</MenuItem>
                <MenuItem value="Mayilar Kulam">Mayilar Kulam - மயிலர்குலம்</MenuItem>
                <MenuItem value="Maadar Kulam">Maadar Kulam - மாடர்குலம்</MenuItem>
                <MenuItem value="Mutthan Kulam">Mutthan Kulam - முத்தன்குலம்</MenuItem>
                <MenuItem value="Muzhukathan Kulam">Muzhukathan Kulam - முழுக்காதன்குலம்</MenuItem>
                <MenuItem value="Medhi Kulam">Medhi Kulam - மேதிக்குலம்</MenuItem>
                <MenuItem value="Vannakkan Kulam">Vannakkan Kulam - வண்ணக்கன்குலம்</MenuItem>
                <MenuItem value="Villiyar Kulam">Villiyar Kulam - வில்லியர்குலம்</MenuItem>
                <MenuItem value="Vilayan Kulam">Vilayan Kulam - விளையன்குலம்</MenuItem>
                <MenuItem value="Vizhiyar Kulam">Vizhiyar Kulam - விழியர்குலம்</MenuItem>
                <MenuItem value="Venduvan Kulam">Venduvan Kulam - வெண்டுவன்குலம்</MenuItem>
                <MenuItem value="Vennag Kulam">Vennag Kulam - வெண்ணங்குலம்</MenuItem>
                <MenuItem value="Vellampar Kulam">Vellampar Kulam - வெள்ளம்பர்குலர்</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>
            {formData.kootam === 'Others' && (
              <TextField
                fullWidth
                label="Specify Kootam"
                value={customValues.kootam}
                onChange={(e) => {
                  const customValue = e.target.value;
                  setCustomValues(prev => ({ ...prev, kootam: customValue }));
                  setFormData(prev => ({ ...prev, kootam: 'Others' }));
                }}
                sx={{ mt: 1 }}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth sx={{ minWidth: 150 }}>
              <InputLabel>Kovil</InputLabel>
              <Select
                value={formData.kovil}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, kovil: value }));
                  if (value !== 'Others') {
                    setCustomValues(prev => ({ ...prev, kovil: '' }));
                  }
                }}
                label="Kovil"
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Madurai Meenakshi Amman">Madurai Meenakshi Amman</MenuItem>
                <MenuItem value="Thanjavur Brihadeeswarar">Thanjavur Brihadeeswarar</MenuItem>
                <MenuItem value="Palani Murugan">Palani Murugan</MenuItem>
                <MenuItem value="Srirangam Ranganathar">Srirangam Ranganathar</MenuItem>
                <MenuItem value="Kanchipuram Kamakshi Amman">Kanchipuram Kamakshi Amman</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>
            {formData.kovil === 'Others' && (
              <TextField
                fullWidth
                label="Specify Kovil"
                value={customValues.kovil}
                onChange={(e) => {
                  const customValue = e.target.value;
                  setCustomValues(prev => ({ ...prev, kovil: customValue }));
                  setFormData(prev => ({ ...prev, kovil: 'Others' }));
                }}
                sx={{ mt: 1 }}
              />
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Address Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Address Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={handleInputChange('address')}
              required
              error={!!errors.address}
              helperText={errors.address}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={handleInputChange('city')}
              required
              error={!!errors.city}
              helperText={errors.city}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              value={formData.state}
              onChange={handleInputChange('state')}
              required
              error={!!errors.state}
              helperText={errors.state}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Pin Code"
              value={formData.zip_code}
              onChange={handleInputChange('zip_code')}
              required
              error={!!errors.zip_code}
              helperText={errors.zip_code}
            />
          </Grid>
        </Grid>
      </Box>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">* Required fields</Typography>
      </Alert>
    </Box>
  );

  // Step 2 - Contact
  const renderContact = () => (
    <Box>
      {/* Additional Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Additional Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Alternate Contact Number"
              value={formData.alternate_contact_no}
              onChange={handleInputChange('alternate_contact_no')}
              placeholder="+91 98765 43210"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Aadhar Number"
              value={formData.aadhar_no}
              onChange={handleInputChange('aadhar_no')}
              placeholder="1234 5678 9012"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Blood Group</InputLabel>
              <Select
                value={formData.blood_group}
                onChange={handleInputChange('blood_group')}
                label="Blood Group"
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Emergency Contact Name"
              value={formData.emergency_contact}
              onChange={handleInputChange('emergency_contact')}
              placeholder="Emergency contact person name"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Emergency Contact Phone"
              value={formData.emergency_phone}
              onChange={handleInputChange('emergency_phone')}
              placeholder="+91 98765 43210"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Secondary Email"
              value={formData.secondary_email}
              onChange={(e) => {
                const value = e.target.value.trim();
                setFormData(prev => ({ ...prev, secondary_email: value }));
              }}
              error={formData.secondary_email && !validateEmail(formData.secondary_email)}
              helperText={formData.secondary_email && !validateEmail(formData.secondary_email) ? "Please enter a valid email address" : ""}
              placeholder="secondary@example.com"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Social Media & Online Presence */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Social Media & Online Presence
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Personal Website"
              value={formData.personal_website}
              onChange={handleInputChange('personal_website')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="LinkedIn Profile"
              value={formData.linkedin_profile}
              onChange={handleInputChange('linkedin_profile')}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Facebook"
              value={formData.facebook}
              onChange={handleInputChange('facebook')}
              placeholder="Facebook URL"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Instagram"
              value={formData.instagram}
              onChange={handleInputChange('instagram')}
              placeholder="Instagram URL"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Twitter"
              value={formData.twitter}
              onChange={handleInputChange('twitter')}
              placeholder="Twitter URL"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="YouTube"
              value={formData.youtube}
              onChange={handleInputChange('youtube')}
              placeholder="YouTube URL"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Best Time to Contact */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Best Time to Contact
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Best Time to Contact</InputLabel>
          <Select
            value={formData.best_time_to_contact}
            onChange={handleInputChange('best_time_to_contact')}
            label="best_time_to_contact"
          >
            <MenuItem value="morning">Morning</MenuItem>
            <MenuItem value="afternoon">Afternoon</MenuItem>
            <MenuItem value="evening">Evening</MenuItem>
            <MenuItem value="weekend">Weekend</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );

  // Step 3 - Access & Links
  const renderAccessLinks = () => (
    <Box>
      {/* Paid Status Section - NEW */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Membership Status
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Paid Status</InputLabel>
              <Select
                value={formData.paid_status}
                onChange={handleInputChange('paid_status')}
                label="Paid Status"
              >
                <MenuItem value="Unpaid">Unpaid</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {formData.paid_status === 'Paid' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Membership Valid Until"
                type="date"
                value={formData.membership_valid_until}
                onChange={handleInputChange('membership_valid_until')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}
        </Grid>
        {formData.paid_status === 'Paid' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              When status is set to "Paid", membership valid until date is required.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Pro Member */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Pro Member
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={formData.pro === 'Pro'}
              onChange={(e) => {
                const value = e.target.checked ? 'Pro' : 'Unpro';
                setFormData(prev => ({
                  ...prev,
                  pro: value,
                  core_pro: value === 'Pro' ? '' : prev.core_pro
                }));
              }}
              name="pro"
              color="success"
            />
          }
          label="Pro Member"
          labelPlacement="start"
          sx={{ justifyContent: 'space-between', marginLeft: 0, width: '100%' }}
        />
        {formData.pro === 'Unpro' && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Core Pro</InputLabel>
            <Select
              value={formData.core_pro || ''}
              name="core_pro"
              label="Core Pro"
              onChange={handleInputChange('core_pro')}
            >
              <MenuItem value="">None</MenuItem>
              {/* Updated to use proMembers from API like EditMember */}
              {proMembers.map((m) => {
                const fullName = [m.first_name].filter(Boolean).join(' ').trim() || m.first_name || m.email;
                return (
                  <MenuItem key={m.mid} value={fullName}>{fullName}</MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Squads */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Squads
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Select Squad</InputLabel>
          <Select
            name="squad"
            value={formData.squad || ''}
            onChange={(e) => {
              const value = e.target.value;
              setFormData(prev => ({ ...prev, squad: value, ...(value !== 'add_new' ? { new_squad_name: '' } : {}) }));
            }}
            label="Select Squad"
          >
            {squads.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
            <MenuItem value="add_new">Add new Squad</MenuItem>
          </Select>
        </FormControl>

        {formData.squad === 'add_new' && (
          <TextField
            fullWidth
            margin="dense"
            label="New Squad Name"
            name="new_squad_name"
            value={formData.new_squad_name || ''}
            onChange={handleInputChange('new_squad_name')}
            sx={{ mt: 2 }}
          />
        )}

        {((formData.squad && formData.squad !== 'add_new') ||
          (formData.squad === 'add_new' && formData.new_squad_name && formData.new_squad_name.length > 0)) && (
          <TextField
            fullWidth
            margin="dense"
            label="Specialization"
            name="squad_fields"
            value={formData.squad_fields || ''}
            onChange={handleInputChange('squad_fields')}
            sx={{ mt: 2 }}
          />
        )}
      </Box>

      {/* Access Level Management */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Access Level Management
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            value={formData.access_level}
            onChange={handleInputChange('access_level')}
          >
            <Grid container spacing={2}>
              {[
                {
                  value: 'Basic',
                  label: 'Basic',
                  description: 'Basic directory access',
                  features: ['View public profiles', 'Contact other members'],
                  color: 'success.light'
                },
                {
                  value: 'Advanced',
                  label: 'Advanced',
                  description: 'Enhanced permissions',
                  features: ['Manage member content', 'Review applications'],
                  color: 'success.main'
                }
              ].map((option) => (
                <Grid item xs={12} sm={4} key={option.value}>
                  <Paper
                    sx={{
                      p: 2,
                      border: formData.access_level === option.value ? 2 : 1,
                      borderColor: formData.access_level === option.value ? option.color : 'grey.300',
                      backgroundColor: formData.access_level === option.value ? `${option.color}08` : 'transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, access_level: option.value }))}
                  >
                    <FormControlLabel
                      value={option.value}
                      control={<Radio color="success" />}
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {option.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {option.description}
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            {option.features.map((feature, idx) => (
                              <Typography component="li" variant="caption" key={idx} color="text.secondary">
                                {feature}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', width: '100%' }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Application Status */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Application Status
        </Typography>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.status === 'Approved'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  status: e.target.checked ? 'Approved' : 'Pending'
                }))}
                color="success"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Auto-approve this member
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Member will be immediately active without manual review
                </Typography>
              </Box>
            }
          />
        </Box>
      </Box>

      {/* Link Member Profile */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Link Member Profile
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
              Business Profiles
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => setBusinessModalOpen(true)}
                fullWidth
                startIcon={<Add />}
              >
                Add Business Profile
              </Button>
            </Box>

            {/* Show all added business profiles */}
            {businessProfiles.map((profile, index) => (
              <Alert
                key={index}
                severity="success"
                sx={{ mt: 2 }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => handleRemoveBusinessProfile(index)}
                  >
                    <Close fontSize="inherit" />
                  </IconButton>
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business color="success" />
                  <Box>
                    <Typography>
                      {profile.company_name} - {profile.business_type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {profile.category_id} • {profile.tags?.length || 0} tags • {profile.branches?.length || 0} branches
                    </Typography>
                  </Box>
                </Box>
              </Alert>
            ))}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
              Family Profiles
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => setFamilyModalOpen(true)}
                fullWidth
              >
                Create family members
              </Button>
            </Box>

            {/* Show Family Profile Added notification */}
            {familyAdded && (
              <Alert
                severity="success"
                sx={{ mt: 2 }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={handleRemoveFamilyProfile}
                  >
                    <Close fontSize="inherit" />
                  </IconButton>
                }
              >
                Family Profile Added
              </Alert>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Referral Source */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Referral Source
        </Typography>
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!formData.has_referral}
                onChange={handleInputChange('has_referral')}
                color="success"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  Do You Have Referral
                </Typography>
              </Box>
            }
          />
        </Box>
        {formData.has_referral && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <div style={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  label="Referral Name"
                  value={referralSearchQuery}
                  onChange={(e) => {
                    setReferralSearchQuery(e.target.value);
                    setShowReferralDropdown(true);
                  }}
                  onFocus={() => {
                    setReferralSearchQuery(formData.referral_name || '');
                    setShowReferralDropdown(true);
                  }}
                  onBlur={() => setTimeout(() => setShowReferralDropdown(false), 200)}
                  placeholder="Type to search member"
                  autoComplete="off"
                />
                {showReferralDropdown && referralSearchQuery && (
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
                  }}>
                    {allMembers
                      .filter(m => {
                        const fullName = `${m.first_name} ${m.last_name}`.toLowerCase();
                        return fullName.includes(referralSearchQuery.toLowerCase());
                      })
                      .slice(0, 10)
                      .map((member) => (
                        <button
                          type="button"
                          key={member.mid}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '12px 16px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const fullName = `${member.first_name}`;
                            setFormData(prev => ({
                              ...prev,
                              referral_name: fullName,
                              referral_code: member.application_id || ''
                            }));
                            setReferralSearchQuery(fullName);
                            setShowReferralDropdown(false);
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f0fdf4';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#1f2937', fontWeight: 500 }}>
                              {member.first_name}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>
                              {member.application_id}
                            </span>
                          </div>
                        </button>
                      ))}
                    {allMembers.filter(m => {
                      const fullName = `${m.first_name}`.toLowerCase();
                      return fullName.includes(referralSearchQuery.toLowerCase());
                    }).length === 0 && (
                      <div style={{ padding: '12px 16px', color: '#6b7280', fontSize: '14px' }}>
                        No members found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Referral ID"
                value={formData.referral_code}
                placeholder="Member Application ID"
                error={!!errors.referral_code}
                helperText={errors.referral_code || "Auto-filled from selected member"}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed'
                  }
                }}
              />
            </Grid>
          </Grid>
        )}
        <Grid container spacing={3} sx={{ mt: 5 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleInputChange('status')}
                label="Status"
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/MemberManagement')}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#2E7D32' }}>
          Add New Member
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSuccess(false)}
            >
              <Close fontSize="inherit" />
            </IconButton>
          }
        >
          Member and family details registered successfully!
        </Alert>
      )}

      {/* Stepper */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': {
                        color: 'success.main',
                      },
                      '&.Mui-completed': {
                        color: 'success.main',
                      },
                    }
                  }}
                >
                  <Typography
                    variant="body2"
                    color={index <= activeStep ? 'success.main' : 'text.secondary'}
                    fontWeight={index <= activeStep ? 600 : 400}
                  >
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {activeStep === 0 && renderBasicInfo()}
          {activeStep === 1 && renderContact()}
          {activeStep === 2 && renderAccessLinks()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
              {activeStep === 2 && ' - Final Review'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} disabled={isSubmitting}>
                  Previous
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" color="success" onClick={handleNext} disabled={isSubmitting}>
                  Next Step
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isSubmitting ? 'Creating Member...' : 'Create Member'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Family Modal */}
      <FamilyModal
        open={familyModalOpen}
        onClose={() => setFamilyModalOpen(false)}
        familyData={familyData}
        onFamilyDataChange={handleFamilyInputChange}
        onSubmit={handleFamilySubmit}
        memberSuggestions={memberSuggestions}
        maritalStatus={formData.marital_status}
      />

      {/* BusinessProfileModal */}
      <BusinessProfileModal
        open={businessModalOpen}
        onClose={() => {
          setBusinessModalOpen(false);
          // Reset form when closing
          setBusinessData({
            company_name: '',
            business_type: '',
            category_id: '',
            category_input: '',
            business_registration_type: '',
            business_registration_type_other: '',
            about: '',
            company_address: '',
            city: '',
            state: '',
            zip_code: '',
            staff_size: '',
            business_work_contract: '',
            email: '',
            source: '',
            tags: [],
            designation: '',
            salary: '',
            location: '',
            experience: '',
            contact_no: '',
            business_profile_image: null,
            media_gallery: [],
            branches: [],
            exclusive_member_benefit: ''
          });
        }}
        businessData={businessData}
        onBusinessDataChange={handleBusinessDataChange}
        categories={categories}
        handleTagAdd={handleTagAdd}
        handleTagRemove={handleTagRemove}
        handleBusinessFileUpload={handleBusinessFileUpload}
        handleRemoveBusinessProfileImage={handleRemoveBusinessProfileImage}
        handleRemoveBusinessMedia={handleRemoveBusinessMedia}
        onSubmit={handleBusinessSubmit}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddNewMemberForm;