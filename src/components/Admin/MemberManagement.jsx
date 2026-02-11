import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Pagination,
  useTheme,
  useMediaQuery,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  Edit,
  Delete,
  TrendingUp,
  Warning,
  Person,
  PersonAdd,
  FileDownload,
  Email,
  Phone,
  LocationOn,
  Business,
  Close,
  CalendarToday,
  AccessTime,
  Work,
  FamilyRestroom,
  ExpandMore,
  Language,
  Public,
  Groups,
  Badge as BadgeIcon,
  Bloodtype,
  Home,
  WorkOutline,
  Emergency,
  ContactPhone,
  Schedule,
  Cake,
  Transgender,
  Favorite,
  CorporateFare,
  School,
  Group,
  Payment,
  Paid,
  MoneyOff,
  Shield
} from '@mui/icons-material';
import baseurl from '../Baseurl/baseurl';
import * as XLSX from 'xlsx';

const MEMBERS_PAGE_SIZE = 10;

const MemberManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingApplications: 0,
    activeMembers: 0,
    paidMembers: 0,
    unpaidMembers: 0
  });
  const [statusFilter, setStatusFilter] = useState('All');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [page, setPage] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const adminRole = typeof window !== 'undefined' ? localStorage.getItem('adminRole') : null;

  // State for admin permissions
  const [permissions, setPermissions] = useState({
    canView: false,
    canAdd: false,
    canEdit: false,
    canDelete: false
  });

  // State for permission loading
  const [permissionLoading, setPermissionLoading] = useState(true);

  // Check URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    const search = urlParams.get('search');

    if (tab === 'pending') {
      setActiveTab(2); // Pending tab index
      setStatusFilter('Pending');
    } else if (tab === 'approved') {
      setActiveTab(1); // Approved tab index
      setStatusFilter('Approved');
    } else if (tab === 'rejected') {
      setActiveTab(3); // Rejected tab index
      setStatusFilter('Rejected');
    }

    if (search) {
      setSearchTerm(search);
    }
  }, [location.search]);

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
                // Parse role data - it comes as a JSON string from the database
                let rolesArray = [];
                try {
                  if (typeof data.role === 'string' && data.role.startsWith('[')) {
                    rolesArray = JSON.parse(data.role);
                  } else if (Array.isArray(data.role)) {
                    rolesArray = data.role;
                  } else {
                    rolesArray = [data.role];
                  }
                } catch (e) {
                  console.error('Error parsing roles:', e);
                  rolesArray = Array.isArray(data.role) ? data.role : [data.role];
                }

                // Find the Member Management role (case insensitive)
                const memberRole = rolesArray.find(r =>
                  r.toLowerCase().includes('member management')
                );

                if (memberRole) {
                  // Check if it has specific permissions
                  if (memberRole.includes('--')) {
                    const permissionsStr = memberRole.split('--')[1].trim();
                    const permissionList = permissionsStr.split(',').map(p => p.trim().toLowerCase());

                    setPermissions({
                      canView: permissionList.includes('view'),
                      canAdd: permissionList.includes('add'),
                      canEdit: permissionList.includes('edit'),
                      canDelete: permissionList.includes('delete')
                    });
                  } else {
                    // Only "Member Management" without specific permissions -> only view
                    setPermissions({
                      canView: true,
                      canAdd: false,
                      canEdit: false,
                      canDelete: false
                    });
                  }
                } else {
                  // No Member Management role found - default to no permissions
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

  // Fetch members data
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseurl}/api/member/all`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || 'Failed to fetch members');
        }

        // Update members data
        setMembers(data.data || []);

        // Calculate stats
        const totalMembers = data.data?.length || 0;
        const pendingApplications = data.data?.filter(m => m.status === 'Pending').length || 0;
        const activeMembers = data.data?.filter(m => m.status === 'Approved').length || 0;
        const paidMembers = data.data?.filter(m => m.paid_status === 'Paid').length || 0;
        const unpaidMembers = data.data?.filter(m => m.paid_status === 'Unpaid').length || 0;

        setStats({
          totalMembers,
          pendingApplications,
          activeMembers,
          paidMembers,
          unpaidMembers
        });

      } catch (err) {
        setError(err.message || 'An error occurred while fetching members');
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if admin has view permission
    if (!permissionLoading && permissions.canView) {
      fetchMembers();
    } else if (!permissionLoading && !permissions.canView) {
      setLoading(false);
      setError('You do not have permission to view member management');
    }
  }, [permissions.canView, permissionLoading]);

  // Update stats data to use real data
  const statsData = [
    {
      title: 'Total Members',
      value: stats.totalMembers.toString(),
      change: 'Total registered members',
      color: '#4CAF50',
      icon: <Person />,
      positive: true
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications.toString(),
      change: 'Requires attention',
      color: '#f44336',
      icon: <Warning />,
      positive: false
    },
    {
      title: 'Active Members',
      value: stats.activeMembers.toString(),
      change: 'Currently active',
      color: '#4CAF50',
      icon: <Person />,
      positive: true
    },
    {
      title: 'Paid Members',
      value: stats.paidMembers.toString(),
      change: 'Members with paid status',
      color: '#2196F3',
      icon: <Paid />,
      positive: true
    },
    {
      title: 'Unpaid Members',
      value: stats.unpaidMembers.toString(),
      change: 'Members pending payment',
      color: '#FF9800',
      icon: <MoneyOff />,
      positive: false
    }
  ];

  // Filter and sort members
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.contact_no?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'name':
        aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
        bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
        break;
      case 'email':
        aValue = a.email?.toLowerCase() || '';
        bValue = b.email?.toLowerCase() || '';
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;

      case 'accessLevel':
        aValue = a.access_level || '';
        bValue = b.access_level || '';
        break;
      default:
        aValue = a.first_name?.toLowerCase() || '';
        bValue = b.first_name?.toLowerCase() || '';
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Paginate: show MEMBERS_PAGE_SIZE (10) per page
  const totalFiltered = filteredMembers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / MEMBERS_PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * MEMBERS_PAGE_SIZE;
  const endIndex = Math.min(startIndex + MEMBERS_PAGE_SIZE, totalFiltered);

  // Reset to page 1 when filters/search/tab change (not when only page changes)
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, activeTab, sortBy, sortOrder]);

  // Keep page in valid range when total pages shrinks (e.g. after filter)
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handlePageChange = (event, newPage) => {
    if (typeof newPage === 'number' && newPage >= 1) {
      setPage(Math.min(newPage, totalPages));
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Update status filter based on tab selection
    const statusMap = ['All', 'Approved', 'Pending', 'Rejected'];
    setStatusFilter(statusMap[newValue]);
  };

  const handleAddMember = () => {
    if (!permissions.canAdd) return;
    navigate('/admin/AddMembers');
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'Advanced': return '#4CAF50';
      case 'Basic': return '#2196F3';
      default: return '#757575';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Rejected': return '#f44336';
      default: return '#757575';
    }
  };

  const getPaidStatusColor = (paidStatus) => {
    switch (paidStatus) {
      case 'Paid': return '#2196F3';
      case 'Unpaid': return '#FF9800';
      default: return '#757575';
    }
  };

  const getPaidStatusIcon = (paidStatus) => {
    switch (paidStatus) {
      case 'Paid': return <Paid />;
      case 'Unpaid': return <MoneyOff />;
      default: return <Payment />;
    }
  };

  const getProMemberColor = (proStatus) => {
    switch (proStatus) {
      case 'Pro': return '#FF9800';
      case 'Unpro': return '#757575';
      default: return '#757575';
    }
  };

  const handleEditMember = (member) => {
    if (!permissions.canEdit) return;
    navigate(`/admin/EditMember/${member.mid}`);
  };

  const handleViewMember = async (member) => {
    if (!permissions.canView) return;

    try {
      // Fetch complete member details with all personal information
      const response = await fetch(`${baseurl}/api/member/${member.mid}`);
      const data = await response.json();

      if (response.ok && data.success) {
        // Transform the API data to match the profile page structure
        const completeMemberData = transformMemberApiData(data.data);
        setSelectedMember(completeMemberData);
      } else {
        // Fallback to basic data with transformation
        setSelectedMember(transformMemberApiData(member));
      }
    } catch (err) {
      console.error('Error fetching member details:', err);
      // Fallback to basic data with transformation
      setSelectedMember(transformMemberApiData(member));
    }
    setViewDialogOpen(true);
  };

  // Transform API data to match profile page structure
  const transformMemberApiData = (apiData) => {
    if (!apiData) return null;

    // Address parsing
    let streetAddress = '';
    let city = '';
    let state = '';
    let pinCode = '';

    if (apiData.address) {
      streetAddress = apiData.address;
    }
    if (apiData.city) {
      city = apiData.city;
    }
    if (apiData.state) {
      state = apiData.state;
    }
    if (apiData.zip_code) {
      pinCode = apiData.zip_code;
    }

    // Gender handling
    const predefinedGenders = ['Male', 'Female', 'Other'];
    let gender = apiData.gender || '';
    let genderOther = '';
    if (gender && !predefinedGenders.includes(gender)) {
      genderOther = gender;
      gender = 'Other';
    }

    // Kootam handling
    const predefinedKootams = ['Agamudayar', 'Karkathar', 'Kallar', 'Maravar', 'Servai'];
    let kootam = apiData.kootam || '';
    let kootamOther = '';
    if (kootam && !predefinedKootams.includes(kootam)) {
      kootamOther = kootam;
      kootam = 'Others';
    }

    // Kovil handling
    const predefinedKovils = ['Madurai Meenakshi Amman', 'Thanjavur Brihadeeswarar', 'Palani Murugan', 'Srirangam Ranganathar', 'Kanchipuram Kamakshi Amman'];
    let kovil = apiData.kovil || '';
    let kovilOther = '';
    if (kovil && !predefinedKovils.includes(kovil)) {
      kovilOther = kovil;
      kovil = 'Others';
    }

    // Referral information
    const hasReferral = !!apiData.Referral;
    const referralName = apiData.Referral?.referral_name || '';
    const referralCode = apiData.Referral?.referral_code || '';

    return {
      // Basic info
      mid: apiData.mid,
      first_name: apiData.first_name,
      last_name: apiData.last_name,
      email: apiData.email,
      contact_no: apiData.contact_no,
      profile_image: apiData.profile_image,
      status: apiData.status,
      access_level: apiData.access_level,
      paid_status: apiData.paid_status,
      pro: apiData.pro,

      // Personal details matching profile page structure
      personal: {
        fullName: `${apiData.first_name || ''} ${apiData.last_name || ''}`.trim(),
        email: apiData.email || '',
        phone: apiData.contact_no || '',
        dateOfBirth: apiData.dob || '',
        gender: gender,
        genderOther: genderOther,
        maritalStatus: apiData.marital_status || '',
        aadhaar: apiData.aadhar_no || '',
        bloodGroup: apiData.blood_group || '',
        alternativeContact: apiData.alternate_contact_no || '',
        streetAddress: streetAddress,
        city: city,
        state: state,
        pinCode: pinCode,
        website: apiData.personal_website || '',
        linkedin: apiData.linkedin_profile || '',
        workPhone: apiData.work_phone || '',
        extension: apiData.extension || '',
        mobileNumber: apiData.mobile_no || '',
        preferredContact: apiData.preferred_contact || '',
        secondaryEmail: apiData.secondary_email || '',
        emergencyContact: apiData.emergency_contact || '',
        emergencyPhone: apiData.emergency_phone || '',
        bestTimeToContact: apiData.best_time_to_contact || '',
        personalWebsite: apiData.personal_website || '',
        linkedinProfile: apiData.linkedin_profile || '',
        facebook: apiData.facebook || '',
        instagram: apiData.instagram || '',
        twitter: apiData.twitter || '',
        youtube: apiData.youtube || '',
        kootam: kootam,
        kootamOther: kootamOther,
        kovil: kovil,
        kovilOther: kovilOther,
        Arakattalai: apiData.Arakattalai || 'No',
        KNS_Member: apiData.KNS_Member || 'No',
        KBN_Member: apiData.KBN_Member || 'No',
        BNI: apiData.BNI || 'No',
        Rotary: apiData.Rotary || 'No',
        Lions: apiData.Lions || 'No',
        Other_forum: apiData.Other_forum || '',
        hasReferral: hasReferral,
        referralName: referralName,
        referralCode: referralCode,
        accessLevel: apiData.access_level || '',
        status: apiData.status || '',
        paidStatus: apiData.paid_status || 'Unpaid',
        joinDate: apiData.join_date || apiData.createdAt || '',
        createdAt: apiData.createdAt || '',
        updatedAt: apiData.updatedAt || '',
      },

      // System info
      application_id: apiData.application_id,
      join_date: apiData.join_date,
      updatedAt: apiData.updatedAt,
      membership_valid_until: apiData.membership_valid_until,
      rejection_reason: apiData.rejection_reason,

      // Additional fields from API
      ...apiData
    };
  };

  const handleDeleteClick = (member) => {
    if (!permissions.canDelete) return;

    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMember || !permissions.canDelete) return;

    try {
      const response = await fetch(`${baseurl}/api/member/delete/${selectedMember.mid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      // Remove the deleted member from the list
      setMembers(prevMembers => prevMembers.filter(m => m.mid !== selectedMember.mid));
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const handleExport = () => {
    const exportData = filteredMembers.map(member => {
      let linkedProfile = 'None';
      if (member.business_profiles?.length > 0) {
        linkedProfile = `Business: ${member.business_profiles[0]?.company_name || 'N/A'}`;
      } else if (member.family_details) {
        linkedProfile = 'Family Profile';
      }

      return {
        'Application ID': member.application_id,
        'First Name': member.first_name,
        'Last Name': member.last_name,
        'Email': member.email,
        'Date of Birth': member.dob,
        'Gender': member.gender,
        'Join Date': new Date(member.join_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        'Aadhar Number': member.aadhar_no,
        'Blood Group': member.blood_group,
        'Contact Number': member.contact_no,
        'Alternate Contact': member.alternate_contact_no,
        'Marital Status': member.marital_status,
        'Address': member.address,
        'City': member.city,
        'State': member.state,
        'Zip Code': member.zip_code,
        'Profile Image URL': member.profile_image,
        'Work Phone': member.work_phone,
        'Extension': member.extension,
        'Mobile Number': member.mobile_no,
        'Preferred Contact': member.preferred_contact,
        'Secondary Email': member.secondary_email,
        'Emergency Contact': member.emergency_contact,
        'Emergency Phone': member.emergency_phone,
        'Personal Website': member.personal_website,
        'LinkedIn': member.linkedin_profile,
        'Facebook': member.facebook,
        'Instagram': member.instagram,
        'Twitter': member.twitter,
        'YouTube': member.youtube,
        'Kootam': member.kootam || 'N/A',
        'Best Time to Contact': member.best_time_to_contact,
        'Access Level': member.access_level,
        'Status': member.status,
        'Paid Status': member.paid_status || 'Unpaid',
        'Pro Member': member.pro || 'Unpro',
        'Linked Profile': linkedProfile
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, `members_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get forum memberships
  const getForumMemberships = (member) => {
    const forums = [];
    if (member.Arakattalai === 'Yes') forums.push('Arakattalai');
    if (member.KNS_Member === 'Yes') forums.push('KNS');
    if (member.KBN_Member === 'Yes') forums.push('KBN');
    if (member.BNI === 'Yes') forums.push('BNI');
    if (member.Rotary === 'Yes') forums.push('Rotary');
    if (member.Lions === 'Yes') forums.push('Lions');
    if (member.Other_forum) forums.push(member.Other_forum);
    return forums.length > 0 ? forums.join(', ') : 'None';
  };

  // Custom styled input field for view mode
  const ViewField = ({ label, value, icon }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem', fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon && React.cloneElement(icon, { sx: { color: 'text.secondary', fontSize: '1rem' } })}
        <Typography variant="body1" sx={{
          p: 1,
          backgroundColor: 'grey.50',
          borderRadius: 1,
          flex: 1,
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {value || 'Not provided'}
        </Typography>
      </Box>
    </Box>
  );

  // Custom styled select field for view mode
  const ViewSelectField = ({ label, value, options, icon }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.75rem', fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon && React.cloneElement(icon, { sx: { color: 'text.secondary', fontSize: '1rem' } })}
        <Typography variant="body1" sx={{
          p: 1,
          backgroundColor: 'grey.50',
          borderRadius: 1,
          flex: 1,
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {value ? (options.find(opt => opt.value === value)?.label || value) : 'Not provided'}
        </Typography>
      </Box>
    </Box>
  );

  // Toggle switch for view mode
  const ViewToggleField = ({ label, checked, icon }) => (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon && React.cloneElement(icon, { sx: { color: 'text.secondary', fontSize: '1rem' } })}
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Chip
        label={checked ? 'Yes' : 'No'}
        size="small"
        color={checked ? 'success' : 'default'}
        variant={checked ? 'filled' : 'outlined'}
      />
    </Box>
  );

  // Show loading state while checking permissions
  if (permissionLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
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
            <Typography variant="body1" color="text.secondary">
              You do not have permission to view the Member Management module.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
              onClick={() => navigate('/admin/dashboard')}
            >
              Back to Dashboard
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#2E7D32', mb: 0.5 }}>
              Member Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage member records, applications, and access levels
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', md: 'auto' } }}>
            {permissions.canAdd && (
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={handleAddMember}
                sx={{
                  backgroundColor: '#4CAF50',
                  '&:hover': { backgroundColor: '#45a049' },
                  px: 3,
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                Add Member
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: stat.positive ? '#4CAF50' : '#f44336',
                    fontWeight: 500
                  }}
                >
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                px: 3,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem'
                },
                '& .Mui-selected': {
                  backgroundColor: '#4CAF50',
                  color: 'white !important',
                  borderRadius: '20px 20px 0 0'
                }
              }}
            >
              <Tab label="All" />
              <Tab label="Approved" />
              <Tab label="Pending" />
              <Tab label="Rejected" />
            </Tabs>
          </Box>

          {/* Controls */}
          <Box sx={{
            p: 3,
            display: 'flex',
            gap: 2,
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' }
          }}>
            <TextField
              placeholder="Search members..."
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
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilterDialogOpen(true)}
              sx={{
                color: '#666',
                borderColor: '#ddd',
                whiteSpace: 'nowrap'
              }}
            >
              Filter
            </Button>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="accessLevel">Access Level</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              sx={{
                color: '#666',
                borderColor: '#ddd',
                whiteSpace: 'nowrap'
              }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>Member</TableCell>
                  {!isSmall && <TableCell sx={{ fontWeight: 600, color: '#666' }}>Contact</TableCell>}
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>Access Level</TableCell>
                  {!isMobile && <TableCell sx={{ fontWeight: 600, color: '#666' }}>Kootam</TableCell>}
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#666' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography>Loading members...</Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography color="error">{error}</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography>No members found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.slice(startIndex, endIndex).map((member) => (
                    <TableRow key={member.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: '#e0e0e0',
                              color: '#666',
                              fontSize: '0.875rem',
                              fontWeight: 600
                            }}
                            src={member.profile_image ? `${baseurl}/${member.profile_image}` : undefined}
                          >
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {`${member.first_name} ${member.last_name || ''}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.email}
                            </Typography>
                            {/* Status Badges in Header Bar */}
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                              <Chip
                                label={member.status}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(member.status),
                                  color: 'white',
                                  fontWeight: 500,
                                  fontSize: '0.6rem',
                                  height: '20px'
                                }}
                              />
                              <Chip
                                label={member.paid_status || 'Unpaid'}
                                size="small"
                                icon={getPaidStatusIcon(member.paid_status)}
                                sx={{
                                  backgroundColor: getPaidStatusColor(member.paid_status),
                                  color: 'white',
                                  fontWeight: 500,
                                  fontSize: '0.6rem',
                                  height: '20px',
                                  '& .MuiChip-icon': {
                                    color: 'white',
                                    fontSize: '0.8rem'
                                  }
                                }}
                              />
                              <Chip
                                label={member.pro === 'Pro' ? 'Pro' : 'Basic'}
                                size="small"
                                sx={{
                                  backgroundColor: getProMemberColor(member.pro),
                                  color: 'white',
                                  fontWeight: 500,
                                  fontSize: '0.6rem',
                                  height: '20px'
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      {!isSmall && (
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                              {member.contact_no || 'No contact'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.city || 'Location not set'}
                            </Typography>
                          </Box>
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={member.access_level}
                          size="small"
                          sx={{
                            backgroundColor: getAccessLevelColor(member.access_level),
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                              {member.kootam || 'Not specified'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.kovil || 'Kovil not set'}
                            </Typography>
                          </Box>
                        </TableCell>
                      )}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: getStatusColor(member.status)
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {member.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {permissions.canView && (
                            <IconButton
                              size="small"
                              sx={{ color: '#666' }}
                              onClick={() => handleViewMember(member)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          )}
                          {permissions.canEdit && (
                            <IconButton
                              size="small"
                              sx={{ color: '#666' }}
                              onClick={() => handleEditMember(member)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                          {permissions.canDelete && (
                            <IconButton
                              size="small"
                              sx={{ color: '#666' }}
                              onClick={() => handleDeleteClick(member)}
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

          {/* Pagination */}
          <Box sx={{
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 0 }
          }}>
            <Typography variant="body2" color="text.secondary">
              {totalFiltered === 0
                ? 'Showing 0 members'
                : `Showing ${startIndex + 1}-${endIndex} of ${totalFiltered} members (${MEMBERS_PAGE_SIZE} per page)`}
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              siblingCount={1}
              boundaryCount={1}
              sx={{
                '& .MuiPaginationItem-root.Mui-selected': {
                  backgroundColor: '#4CAF50',
                  color: 'white'
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter Members</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setFilterDialogOpen(false)} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced View Member Dialog - Matching Profile Page Personal Details */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: '#4CAF50',
            color: 'white',
            px: 3,
            py: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            👤 Member Profile - {selectedMember?.first_name} {selectedMember?.last_name}
          </Typography>
          <IconButton onClick={() => setViewDialogOpen(false)} size="small" sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, bgcolor: '#fafafa' }}>
          {selectedMember && (
            <Box>
              {/* Profile Overview */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'center', sm: 'flex-start' },
                  gap: 3,
                  p: 3,
                  mb: 2,
                  bgcolor: 'white',
                  borderRadius: 0,
                }}
              >
                <Avatar
                  src={selectedMember.profile_image ? `${baseurl}/${selectedMember.profile_image}` : undefined}
                  sx={{ width: 120, height: 120, fontSize: 40 }}
                >
                  {selectedMember.first_name?.[0]}
                  {selectedMember.last_name?.[0]}
                </Avatar>
                <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {selectedMember.first_name} {selectedMember.last_name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Member ID: {selectedMember.mid || selectedMember.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email: {selectedMember.email}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                    <Chip
                      label={selectedMember.status}
                      sx={{ bgcolor: getStatusColor(selectedMember.status), color: 'white', fontWeight: 600 }}
                    />
                    <Chip
                      label={selectedMember.access_level}
                      sx={{ bgcolor: getAccessLevelColor(selectedMember.access_level), color: 'white', fontWeight: 600 }}
                    />
                    <Chip
                      label={selectedMember.paid_status || 'Unpaid'}
                      sx={{
                        bgcolor: getPaidStatusColor(selectedMember.paid_status),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                    {selectedMember.pro === 'Pro' && (
                      <Chip
                        label="Pro Member"
                        sx={{ bgcolor: '#FF9800', color: 'white', fontWeight: 600 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Personal Details - Matching Profile Page Layout */}
              <Box sx={{ p: 3 }}>
                <Card sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
                      Personal Details
                    </Typography>

                    {/* Basic Information Grid - 3 columns matching profile page */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Full Name"
                          value={selectedMember.personal?.fullName}
                          icon={<Person />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Email"
                          value={selectedMember.personal?.email}
                          icon={<Email />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Phone Number"
                          value={selectedMember.personal?.phone}
                          icon={<Phone />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Date of Birth"
                          value={formatDate(selectedMember.personal?.dateOfBirth)}
                          icon={<Cake />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewSelectField
                          label="Gender"
                          value={selectedMember.personal?.gender}
                          options={[
                            { value: 'Male', label: 'Male' },
                            { value: 'Female', label: 'Female' },
                            { value: 'Other', label: 'Other' }
                          ]}
                          icon={<Transgender />}
                        />
                        {selectedMember.personal?.gender === 'Other' && (
                          <ViewField
                            label="Specify Gender"
                            value={selectedMember.personal?.genderOther}
                          />
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewSelectField
                          label="Marital Status"
                          value={selectedMember.personal?.maritalStatus}
                          options={[
                            { value: 'single', label: 'Single' },
                            { value: 'married', label: 'Married' },
                            { value: 'divorced', label: 'Divorced' },
                            { value: 'widowed', label: 'Widowed' }
                          ]}
                          icon={<Favorite />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewSelectField
                          label="Kootam"
                          value={selectedMember.personal?.kootam}
                          options={[
                            { value: 'Agamudayar', label: 'Agamudayar' },
                            { value: 'Karkathar', label: 'Karkathar' },
                            { value: 'Kallar', label: 'Kallar' },
                            { value: 'Maravar', label: 'Maravar' },
                            { value: 'Servai', label: 'Servai' },
                            { value: 'Others', label: 'Others' }
                          ]}
                          icon={<Groups />}
                        />
                        {selectedMember.personal?.kootam === 'Others' && (
                          <ViewField
                            label="Specify Kootam"
                            value={selectedMember.personal?.kootamOther}
                          />
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewSelectField
                          label="Kovil"
                          value={selectedMember.personal?.kovil}
                          options={[
                            { value: 'Madurai Meenakshi Amman', label: 'Madurai Meenakshi Amman' },
                            { value: 'Thanjavur Brihadeeswarar', label: 'Thanjavur Brihadeeswarar' },
                            { value: 'Palani Murugan', label: 'Palani Murugan' },
                            { value: 'Srirangam Ranganathar', label: 'Srirangam Ranganathar' },
                            { value: 'Kanchipuram Kamakshi Amman', label: 'Kanchipuram Kamakshi Amman' },
                            { value: 'Others', label: 'Others' }
                          ]}
                          icon={<CorporateFare />}
                        />
                        {selectedMember.personal?.kovil === 'Others' && (
                          <ViewField
                            label="Specify Kovil"
                            value={selectedMember.personal?.kovilOther}
                          />
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewSelectField
                          label="Status"
                          value={selectedMember.personal?.status}
                          options={['Approved', 'Pending', 'Rejected']}
                          icon={<BadgeIcon />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewSelectField
                          label="Access Level"
                          value={selectedMember.personal?.accessLevel}
                          options={['Basic', 'Premium', 'Admin']}
                          icon={<Shield />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewSelectField
                          label="Paid Status"
                          value={selectedMember.personal?.paidStatus}
                          options={['Paid', 'Unpaid']}
                          icon={<Payment />}
                        />
                      </Grid>
                    </Grid>

                    {/* Address Information */}
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3, mb: 2 }}>
                      Address Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <ViewField
                          label="Street Address"
                          value={selectedMember.personal?.streetAddress}
                          icon={<LocationOn />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="City"
                          value={selectedMember.personal?.city}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="State"
                          value={selectedMember.personal?.state}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Pin Code"
                          value={selectedMember.personal?.pinCode}
                        />
                      </Grid>
                    </Grid>

                    {/* Additional Information */}
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3, mb: 2 }}>
                      Additional Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Aadhaar Number"
                          value={selectedMember.personal?.aadhaar}
                          icon={<BadgeIcon />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Blood Group"
                          value={selectedMember.personal?.bloodGroup}
                          icon={<Bloodtype />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Alternative Contact"
                          value={selectedMember.personal?.alternativeContact}
                          icon={<Phone />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Secondary Email"
                          value={selectedMember.personal?.secondaryEmail}
                          icon={<Email />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Emergency Contact Name"
                          value={selectedMember.personal?.emergencyContact}
                          icon={<Emergency />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Emergency Contact Number"
                          value={selectedMember.personal?.emergencyPhone}
                          icon={<Phone />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewSelectField
                          label="Best Time to Contact"
                          value={selectedMember.personal?.bestTimeToContact}
                          options={[
                            'Business Hours (9 AM - 5 PM)',
                            'Morning (6 AM - 12 PM)',
                            'Afternoon (12 PM - 6 PM)',
                            'Evening (6 PM - 10 PM)',
                            'Anytime'
                          ]}
                          icon={<Schedule />}
                        />
                      </Grid>
                    </Grid>

                    {/* Social Media Information */}
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3, mb: 2 }}>
                      Social Media Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Website"
                          value={selectedMember.personal?.website}
                          icon={<Language />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="LinkedIn"
                          value={selectedMember.personal?.linkedin}
                          icon={<Work />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="LinkedIn Profile"
                          value={selectedMember.personal?.linkedinProfile}
                          icon={<Work />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Facebook"
                          value={selectedMember.personal?.facebook}
                          icon={<Public />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Instagram"
                          value={selectedMember.personal?.instagram}
                          icon={<Public />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Twitter"
                          value={selectedMember.personal?.twitter}
                          icon={<Public />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="YouTube"
                          value={selectedMember.personal?.youtube}
                          icon={<Public />}
                        />
                      </Grid>
                    </Grid>

                    {/* Forum Memberships */}
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3, mb: 2 }}>
                      Forum Memberships
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewToggleField
                          label="Arakattalai"
                          checked={selectedMember.personal?.Arakattalai === 'Yes'}
                          icon={<Groups />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewToggleField
                          label="KNS Member"
                          checked={selectedMember.personal?.KNS_Member === 'Yes'}
                          icon={<Groups />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewToggleField
                          label="KBN Member"
                          checked={selectedMember.personal?.KBN_Member === 'Yes'}
                          icon={<Groups />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewToggleField
                          label="BNI"
                          checked={selectedMember.personal?.BNI === 'Yes'}
                          icon={<Groups />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewToggleField
                          label="Rotary"
                          checked={selectedMember.personal?.Rotary === 'Yes'}
                          icon={<Groups />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewToggleField
                          label="Lions"
                          checked={selectedMember.personal?.Lions === 'Yes'}
                          icon={<Groups />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Other Forum"
                          value={selectedMember.personal?.Other_forum}
                          icon={<Groups />}
                        />
                      </Grid>
                    </Grid>

                    {/* Referral Information */}
                    {selectedMember.personal?.hasReferral && (
                      <>
                        <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3, mb: 2 }}>
                          Referral Information
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={4}>
                            <ViewField
                              label="Referral Name"
                              value={selectedMember.personal?.referralName}
                              icon={<Person />}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={4}>
                            <ViewField
                              label="Referral Code"
                              value={selectedMember.personal?.referralCode}
                              icon={<BadgeIcon />}
                            />
                          </Grid>
                        </Grid>
                      </>
                    )}

                    {/* System Information */}
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 3, mb: 2 }}>
                      System Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Join Date"
                          value={formatDate(selectedMember.personal?.joinDate)}
                          icon={<CalendarToday />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Last Updated"
                          value={formatDate(selectedMember.personal?.updatedAt)}
                          icon={<CalendarToday />}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <ViewField
                          label="Application ID"
                          value={selectedMember.application_id}
                          icon={<BadgeIcon />}
                        />
                      </Grid>
                      {selectedMember.personal?.paidStatus === 'Paid' && selectedMember.membership_valid_until && (
                        <Grid item xs={12} sm={6} md={4}>
                          <ViewField
                            label="Membership Valid Until"
                            value={formatDate(selectedMember.membership_valid_until)}
                            icon={<CalendarToday />}
                          />
                        </Grid>
                      )}
                    </Grid>

                    {/* Rejection Details */}
                    {selectedMember.status === 'Rejected' && selectedMember.rejection_reason && (
                      <>
                        <Typography variant="h6" color="error" gutterBottom sx={{ mt: 3, mb: 2 }}>
                          Rejection Details
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <ViewField
                              label="Rejection Reason"
                              value={selectedMember.rejection_reason}
                              icon={<Warning />}
                            />
                          </Grid>
                        </Grid>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{
              color: '#666',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            Close
          </Button>
          {permissions.canEdit && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => {
                setViewDialogOpen(false);
                handleEditMember(selectedMember);
              }}
              sx={{
                backgroundColor: '#4CAF50',
                '&:hover': { backgroundColor: '#45a049' }
              }}
            >
              Edit Member
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{
          backgroundColor: '#f5f5f5',
          color: '#d32f2f',
          borderBottom: '1px solid #e0e0e0'
        }}>
          Delete Member
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>
            Are you sure you want to delete {selectedMember?.first_name} {selectedMember?.last_name}'s profile?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All associated data will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: '#666',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            sx={{
              backgroundColor: '#d32f2f',
              '&:hover': { backgroundColor: '#b71c1c' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemberManagement;