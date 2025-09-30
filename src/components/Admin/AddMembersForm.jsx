import React, { useState, useEffect } from 'react';
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
  Work
} from '@mui/icons-material';
import baseurl from '../Baseurl/baseurl';
import { useNavigate } from 'react-router-dom';

// FamilyModal Component (unchanged)
const FamilyModal = ({
  open,
  onClose,
  familyData,
  onFamilyDataChange,
  onSubmit
}) => (
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
          <TextField
            fullWidth
            label="Father's Name"
            value={familyData.father_name || ''}
            onChange={(e) => onFamilyDataChange('father_name', e.target.value)}
            placeholder="Robert Brown"
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
          <TextField
            fullWidth
            label="Mother's Name"
            value={familyData.mother_name || ''}
            onChange={(e) => onFamilyDataChange('mother_name', e.target.value)}
            placeholder="Jessica"
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
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Spouse Name (if Married)"
            value={familyData.spouse_name || ''}
            onChange={(e) => onFamilyDataChange('spouse_name', e.target.value)}
            placeholder="Maria John"
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

// BusinessProfileModal Component with custom business registration type
const BusinessProfileModal = ({
  open,
  onClose,
  businessData,
  onBusinessDataChange,
  onSubmit,
  onImageChange,
  onGalleryChange,
  categories,
  handleSocialMediaToggle,
  handleSocialMediaUrlChange,
  socialMedia
}) => {
  const [customBusinessRegistrationType, setCustomBusinessRegistrationType] = useState('');

  useEffect(() => {
    if (open) {
      setCustomBusinessRegistrationType('');
    }
  }, [open]);

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
          {/* Business Profile Image */}
          <Grid item xs={12}>
            {(businessData.business_type === "self-employed" || businessData.business_type === "business") && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  Business Profile Image
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: "grey.200",
                      "& img": { objectFit: "cover" },
                    }}
                    src={
                      businessData.business_profile_image
                        ? typeof businessData.business_profile_image === 'string'
                          ? businessData.business_profile_image
                          : URL.createObjectURL(businessData.business_profile_image)
                        : null
                    }
                  >
                    <Work sx={{ fontSize: 40, color: "grey.500" }} />
                  </Avatar>
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      component="label"
                      sx={{ mb: 1 }}
                    >
                      Upload Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => onImageChange(e.target.files[0])}
                      />
                    </Button>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Recommended size: 500x500px
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Grid>

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

          {(businessData.business_type === "self-employed" || businessData.business_type === "business") && (
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required sx={{ minWidth: 150, marginTop: '10px' }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={businessData.category_id || ""}
                  label="Category"
                  onChange={(e) =>
                    onBusinessDataChange("category_id", e.target.value)
                  }
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <MenuItem key={cat.cid} value={cat.cid}>
                        {cat.category_name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No categories available</MenuItem>
                  )}
                </Select>
              </FormControl>
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
                      }
                    }}
                    label="Business Registration Type"
                  >
                    <MenuItem value="proprietor">Proprietor</MenuItem>
                    <MenuItem value="partnership">Partnership</MenuItem>
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
                      onBusinessDataChange("business_registration_type", customValue);
                    }}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>

              <Grid item xs={12}>
                <TextareaAutosize
                  minRows={4}
                  placeholder="Write about your business"
                  style={{ width: "100%", padding: "10px", fontSize: "16px" }}
                  value={businessData.about || ""}
                  onChange={(e) => onBusinessDataChange("about", e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="text"
                  label="Business Starting Year"
                  value={businessData.business_starting_year || ""}
                  onChange={(e) =>
                    onBusinessDataChange("business_starting_year", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Work Contract"
                  value={businessData.business_work_contract || ""}
                  onChange={(e) =>
                    onBusinessDataChange("business_work_contract", e.target.value)
                  }
                  placeholder="Enter business work contract"
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
                  value={businessData.designation || ""}
                  onChange={(e) => onBusinessDataChange("designation", e.target.value)}
                  placeholder="Enter designation"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="email"
                  value={businessData.email || ""}
                  onChange={(e) => onBusinessDataChange("email", e.target.value)}
                  placeholder="Enter email"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={businessData.location || ""}
                  onChange={(e) => onBusinessDataChange("location", e.target.value)}
                  placeholder="Enter location"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Experience (Years)"
                  value={businessData.experience || ""}
                  onChange={(e) => onBusinessDataChange("experience", e.target.value)}
                  placeholder="Enter years of experience"
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Salary"
                  value={businessData.salary || ""}
                  onChange={(e) => onBusinessDataChange("salary", e.target.value)}
                  placeholder="Enter salary"
                  required
                />
              </Grid>
            </>
          )}

          {(businessData.business_type === "self-employed" || businessData.business_type === "business") && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Staff Size"
                  value={businessData.staff_size || ""}
                  onChange={(e) => onBusinessDataChange("staff_size", e.target.value)}
                  placeholder="Enter number of employees"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={businessData.email || ""}
                  onChange={(e) => onBusinessDataChange("email", e.target.value)}
                  placeholder="Enter email"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tags"
                  value={businessData.tags || ""}
                  onChange={(e) => onBusinessDataChange("tags", e.target.value)}
                  placeholder="Enter tags"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Company Address"
                  value={businessData.company_address || ''}
                  onChange={(e) =>
                    onBusinessDataChange("company_address", e.target.value)
                  }
                  placeholder="Enter Company Address"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="City"
                  value={businessData.city || ''}
                  onChange={(e) => onBusinessDataChange("city", e.target.value)}
                  placeholder="City"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="State"
                  value={businessData.state || ''}
                  onChange={(e) => onBusinessDataChange("state", e.target.value)}
                  placeholder="Enter State"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Pin Code"
                  value={businessData.zip_code || ''}
                  onChange={(e) => onBusinessDataChange("zip_code", e.target.value)}
                  placeholder="Enter Pin Code"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  Social Media Platforms
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                  {[
                    { platform: 'Facebook', icon: <Facebook />, color: '#1877F2' },
                    { platform: 'Twitter', icon: <Twitter />, color: '#1DA1F2' },
                    { platform: 'Instagram', icon: <Instagram />, color: '#E4405F' },
                    { platform: 'YouTube', icon: <YouTube />, color: '#FF0000' }
                  ].map(({ platform, icon, color }) => (
                    <Button
                      key={platform}
                      variant={socialMedia.includes(platform) ? "contained" : "outlined"}
                      startIcon={icon}
                      onClick={() => handleSocialMediaToggle(platform)}
                      sx={{
                        borderColor: color,
                        color: socialMedia.includes(platform) ? 'white' : color,
                        backgroundColor: socialMedia.includes(platform) ? color : 'transparent',
                        '&:hover': {
                          backgroundColor: socialMedia.includes(platform) ? color : `${color}15`
                        }
                      }}
                    >
                      {platform}
                    </Button>
                  ))}
                </Box>
              </Grid>

              <Grid container spacing={2}>
                {socialMedia.includes('Facebook') && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Facebook Profile URL"
                      value={businessData.facebook_link || ''}
                      onChange={handleSocialMediaUrlChange('Facebook')}
                      placeholder="https://facebook.com/yourprofile"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Facebook sx={{ color: '#1877F2' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}

                {socialMedia.includes('Twitter') && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Twitter Profile URL"
                      value={businessData.twitter_link || ''}
                      onChange={handleSocialMediaUrlChange('Twitter')}
                      placeholder="https://twitter.com/yourprofile"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Twitter sx={{ color: '#1DA1F2' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}

                {socialMedia.includes('Instagram') && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Instagram Profile URL"
                      value={businessData.instagram_link || ''}
                      onChange={handleSocialMediaUrlChange('Instagram')}
                      placeholder="https://instagram.com/yourprofile"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Instagram sx={{ color: '#E4405F' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}

                {socialMedia.includes('YouTube') && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="YouTube Channel URL"
                      value={businessData.youtube_link || ''}
                      onChange={handleSocialMediaUrlChange('YouTube')}
                      placeholder="https://youtube.com/c/yourchannel"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <YouTube sx={{ color: '#FF0000' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </>
          )}

          {/* Media Gallery */}
          {(businessData.business_type === "self-employed" || businessData.business_type === "business") && (
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  Media Gallery
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Upload Media
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => onGalleryChange(Array.from(e.target.files))}
                  />
                </Button>

                {businessData.media_gallery && businessData.media_gallery.length > 0 && (
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {businessData.media_gallery.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: "relative",
                          width: 100,
                          height: 100,
                          borderRadius: 1,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        {typeof file === 'string' ? (
                          file.includes('.mp4') || file.includes('.mov') ? (
                            <Box
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "grey.100",
                              }}
                            >
                              <Typography variant="caption">Video</Typography>
                            </Box>
                          ) : (
                            <img
                              src={file}
                              alt={`Gallery ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )
                        ) : file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Gallery ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "grey.100",
                            }}
                          >
                            <Typography variant="caption">Video</Typography>
                          </Box>
                        )}

                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(0,0,0,0.5)",
                            color: "white",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                          }}
                          onClick={() => {
                            const newGallery = [...businessData.media_gallery];
                            newGallery.splice(index, 1);
                            onBusinessDataChange("media_gallery", newGallery);
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
          )}
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
            onClick={onSubmit}
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
    kovil: '',
    business_registration_type: []
  });
  const [showFamilyDetails, setShowFamilyDetails] = useState(false);
  const navigate = useNavigate();

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
    last_name: '',
    alternate_contact_no: '',
    join_date: '',
    aadhar_no: '',
    blood_group: '',
    marital_status: '',

    // Step 2 - Contact (all optional)
    work_phone: '',
    extension: '',
    mobile_no: '',
    preferred_contact: '',
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
    status: 'Approved',
    referral_name: '',
    referral_code: '',
    profile_image: null,
    business_profiles: [],
    family_details: {}
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
    business_registration_type: '',
    about: '',
    company_address: '',
    city: '',
    state: '',
    zip_code: '',
    business_starting_year: '',
    staff_size: '',
    business_work_contract: '',
    email: '',
    source: '',
    tags: '',
    designation: '',
    salary: '',
    location: '',
    experience: '',
    business_profile_image: null,
    media_gallery: [],
    socialMedia: [],
    facebook_link: '',
    twitter_link: '',
    instagram_link: '',
    youtube_link: ''
  });

  const socialMedia = businessData.socialMedia || [];

  // Add profile image state
  const [profileImage, setProfileImage] = useState(null);

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

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    formData.business_profiles.forEach((profile, index) => {
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

      // Prepare personal info with custom values
      const personalFields = [
        'first_name', 'last_name', 'email', 'password', 'dob',
        'contact_no', 'marital_status', 'address', 'city', 'state', 'zip_code',
        'referral_name', 'referral_code'
      ];

      personalFields.forEach(field => {
        if (formData[field] !== null && formData[field] !== undefined) {
          formDataToSend.append(field, formData[field]);
        }
      });

      // Handle gender with custom value
      const genderValue = formData.gender === 'other' ? customValues.gender : formData.gender;
      formDataToSend.append('gender', genderValue);

      // Handle kootam with custom value
      const kootamValue = formData.kootam === 'Others' ? customValues.kootam : formData.kootam;
      formDataToSend.append('kootam', kootamValue);

      // Handle kovil with custom value
      const kovilValue = formData.kovil === 'Others' ? customValues.kovil : formData.kovil;
      formDataToSend.append('kovil', kovilValue);

      // Add default values for required backend fields
      formDataToSend.append('status', 'Pending');
      formDataToSend.append('access_level', 'Basic');
      formDataToSend.append('join_date', new Date().toISOString().split('T')[0]);

      if (formData.profile_image) {
        formDataToSend.append('profile_image', formData.profile_image);
      }

      // Handle business profiles with custom values
      const businessProfilesForBackend = formData.business_profiles.map((profile, index) => {
        const { business_profile_image, media_gallery, ...profileData } = profile;

        // Replace business_registration_type with custom value if needed
        if (profile.business_registration_type === 'Others' && customValues.business_registration_type[index]) {
          profileData.business_registration_type = customValues.business_registration_type[index];
        }

        return profileData;
      });

      formDataToSend.append('business_profiles', JSON.stringify(businessProfilesForBackend));

      // Add business profile images separately
      formData.business_profiles.forEach((profile, index) => {
        if (profile.business_profile_image) {
          formDataToSend.append(`business_profile_image_${index}`, profile.business_profile_image);
        }

        if (profile.media_gallery && profile.media_gallery.length > 0) {
          profile.media_gallery.forEach(file => {
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
      setSnackbar({
        open: true,
        message: error.message || 'Registration failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMediaToggle = (platform) => {
    setBusinessData(prev => {
      const newSocialMedia = prev.socialMedia.includes(platform)
        ? prev.socialMedia.filter(p => p !== platform)
        : [...prev.socialMedia, platform];

      // Reset URL when platform is removed
      const urlField = `${platform.toLowerCase()}_link`;
      return {
        ...prev,
        socialMedia: newSocialMedia,
        [urlField]: prev.socialMedia.includes(platform) ? '' : prev[urlField]
      };
    });
  };

  const handleSocialMediaUrlChange = (platform) => (event) => {
    const urlField = `${platform.toLowerCase()}_link`;
    setBusinessData(prev => ({
      ...prev,
      [urlField]: event.target.value
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

  const handleBusinessSubmit = () => {
    // Validate required fields based on business type
    if (!businessData.business_type || !businessData.company_name) {
      setError('Business type and company name are required');
      return;
    }

    if (businessData.business_type === 'self-employed' || businessData.business_type === 'business') {
      if (!businessData.category_id || !businessData.business_registration_type || !businessData.about) {
        setError('Category, registration type, and about are required for this business type');
        return;
      }
    }

    if (businessData.business_type === 'salary') {
      if (!businessData.designation || !businessData.location || !businessData.salary || !businessData.experience) {
        setError('Designation, location, salary, and experience are required for salary type');
        return;
      }
    }

    // Store custom business registration type if applicable
    if (businessData.business_registration_type === 'Others') {
      const newCustomValues = { ...customValues };
      newCustomValues.business_registration_type[businessProfiles.length] = businessData.business_registration_type;
      setCustomValues(newCustomValues);
    }

    // Add the current business data to the profiles array
    setBusinessProfiles(prev => [...prev, { ...businessData }]);
    setFormData(prev => ({ ...prev, business_profiles: [...prev.business_profiles, businessData] }));

    // Reset the form data for next entry
    setBusinessData({
      company_name: '',
      business_type: '',
      category_id: '',
      business_registration_type: '',
      about: '',
      company_address: '',
      city: '',
      state: '',
      zip_code: '',
      business_starting_year: '',
      staff_size: '',
      business_work_contract: '',
      email: '',
      source: '',
      tags: '',
      designation: '',
      salary: '',
      location: '',
      experience: '',
      business_profile_image: null,
      media_gallery: [],
      socialMedia: [],
      facebook_link: '',
      twitter_link: '',
      instagram_link: '',
      youtube_link: ''
    });

    // Close modal
    setBusinessModalOpen(false);
    setError(null);
  };

  const handleRemoveBusinessProfile = (index) => {
    setBusinessProfiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      business_profiles: prev.business_profiles.filter((_, i) => i !== index)
    }));

    // Update custom values array
    const newCustomValues = { ...customValues };
    newCustomValues.business_registration_type = newCustomValues.business_registration_type.filter((_, i) => i !== index);
    setCustomValues(newCustomValues);
  };

  const handleBusinessDataChange = (field, value) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessImageChange = (file) => {
    setBusinessData(prev => ({ ...prev, business_profile_image: file }));
  };

  const handleBusinessGalleryChange = (files) => {
    setBusinessData(prev => ({
      ...prev,
      media_gallery: [...(prev.media_gallery || []), ...files]
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
          <Grid item xs={12} sm={3}>
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
              label="Email Address"
              required
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email || (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? "Please enter a valid email" : "")}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Password"
              required
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password || "Password must be at least 8 characters long"}
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
                <MenuItem value="Agamudayar">Agamudayar</MenuItem>
                <MenuItem value="Karkathar">Karkathar</MenuItem>
                <MenuItem value="Kallar">Kallar</MenuItem>
                <MenuItem value="Maravar">Maravar</MenuItem>
                <MenuItem value="Servai">Servai</MenuItem>
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
      {/* Primary Contact Information */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Primary Contact Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.last_name}
              onChange={handleInputChange('last_name')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Mobile Phone"
              value={formData.mobile_no}
              onChange={handleInputChange('mobile_no')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Preferred Contact"
              value={formData.preferred_contact}
              onChange={handleInputChange('preferred_contact')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Secondary Email"
              value={formData.secondary_email}
              onChange={handleInputChange('secondary_email')}
              error={formData.secondary_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.secondary_email)}
              helperText={formData.secondary_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.secondary_email) ? "Please enter a valid email" : ""}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Emergency Contact Name"
              value={formData.emergency_contact}
              onChange={handleInputChange('emergency_contact')}
              placeholder="Contact name"
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
                      {profile.category_id} • {profile.staff_size} employees
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
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Referral Name"
              value={formData.referral_name}
              onChange={handleInputChange('referral_name')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Referral ID"
              value={formData.referral_code}
              onChange={handleInputChange('referral_code')}
              placeholder="Member Application ID"
            />
          </Grid>
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
            business_registration_type: '',
            about: '',
            company_address: '',
            city: '',
            state: '',
            zip_code: '',
            business_starting_year: '',
            staff_size: '',
            business_work_contract: '',
            email: '',
            source: '',
            tags: '',
            designation: '',
            salary: '',
            location: '',
            experience: '',
            business_profile_image: null,
            media_gallery: [],
            socialMedia: [],
            facebook_link: '',
            twitter_link: '',
            instagram_link: '',
            youtube_link: ''
          });
        }}
        businessData={businessData}
        onBusinessDataChange={handleBusinessDataChange}
        onImageChange={handleBusinessImageChange}
        onGalleryChange={handleBusinessGalleryChange}
        onSubmit={handleBusinessSubmit}
        categories={categories}
        handleSocialMediaToggle={handleSocialMediaToggle}
        handleSocialMediaUrlChange={handleSocialMediaUrlChange}
        socialMedia={socialMedia}
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