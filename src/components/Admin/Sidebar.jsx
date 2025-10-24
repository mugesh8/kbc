import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ShareIcon from '@mui/icons-material/Share';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import baseurl from '../Baseurl/baseurl';

const drawerWidth = 240;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [showLogout, setShowLogout] = useState(false);
  const [adminName, setAdminName] = useState('Admin User');
  const [adminEmail, setAdminEmail] = useState('admin@businessdir.com');
  const [adminRole, setAdminRole] = useState('');
  const [adminRoles, setAdminRoles] = useState([]); // Store specific roles
  const [permissions, setPermissions] = useState({}); // Store parsed permissions

  useEffect(() => {
    const loadAdminInfo = async () => {
      try {
        const role = localStorage.getItem('adminRole');
        setAdminRole(role || '');
        const storedToken = localStorage.getItem('adminToken') || localStorage.getItem('accessToken');

        if (!storedToken) return;

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

        if (role === 'community') {
          const decoded = decodeJwt(storedToken);
          if (decoded && decoded.id) {
            const res = await fetch(`${baseurl}/api/community_admin/${decoded.id}`);
            if (res.ok) {
              const data = await res.json();
              if (data) {
                setAdminName(data.username || 'Community Admin');
                setAdminEmail(data.email || adminEmail);
                // Parse role data - it comes as a JSON string from the database
                let rolesArray = [];
                if (data.role) {
                  try {
                    // If it's a JSON string, parse it
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
                }
                setAdminRoles(rolesArray);
                
                // Parse permissions
                const parsedPermissions = {};
                rolesArray.forEach(role => {
                  if (typeof role === 'string' && role.includes('--')) {
                    const [roleName, permissionsStr] = role.split('--');
                    const permissionList = permissionsStr.split(',').map(p => p.trim().toLowerCase());
                    parsedPermissions[roleName.trim()] = permissionList;
                  } else if (typeof role === 'string') {
                    // If no specific permissions, just mark as having the role
                    parsedPermissions[role] = ['view'];
                  }
                });
                setPermissions(parsedPermissions);
              }
            }
          } else if (decoded && decoded.email) {
            setAdminEmail(decoded.email);
          }
        } else {
          // Super admin profile via protected endpoint
          const res = await fetch(`${baseurl}/api/admin/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.data) {
              const p = data.data;
              setAdminName(p.username || 'Admin User');
              setAdminEmail(p.email || adminEmail);
              // Super admin has all roles and permissions
              setAdminRoles(['super_admin']);
              setPermissions({ 
                'super_admin': ['view', 'add', 'edit', 'delete', 'manage'] 
              });
            }
          }
        }
      } catch (err) {
        // Silently ignore; fallback values will be shown
        console.error('Error loading admin info:', err);
        // Ensure adminRoles remains an array even on error
        setAdminRoles([]);
      }
    };

    loadAdminInfo();
  }, []);

  // Function to check if admin has a specific role
  const hasRole = (roleName) => {
    if (adminRole !== 'community') return true; // Super admin has all permissions
    
    // Ensure adminRoles is an array before calling .some()
    if (!Array.isArray(adminRoles) || adminRoles.length === 0) {
      return false;
    }
    
    // Check for exact match or partial match
    return adminRoles.some(role => {
      // Ensure role is a string before calling string methods
      if (typeof role !== 'string') return false;
      
      const roleLower = role.toLowerCase();
      const roleNameLower = roleName.toLowerCase();
      
      // Check if the role contains the role name (for partial matches)
      if (roleLower.includes(roleNameLower)) {
        return true;
      }
      
      // Extract the base role name (before "--") and check for exact match
      const baseRole = role.split('--')[0].trim().toLowerCase();
      return baseRole === roleNameLower;
    });
  };

  // Function to check if admin has a specific permission for a role
  const hasPermission = (roleName, permission) => {
    if (adminRole !== 'community') return true; // Super admin has all permissions
    
    // Ensure adminRoles is an array before calling .find()
    if (!Array.isArray(adminRoles) || adminRoles.length === 0) {
      return false;
    }
    
    // Find the role that matches the role name
    const role = adminRoles.find(r => {
      // Ensure r is a string before calling string methods
      if (typeof r !== 'string') return false;
      
      const roleLower = r.toLowerCase();
      const roleNameLower = roleName.toLowerCase();
      
      // Check if the role contains the role name (for partial matches)
      if (roleLower.includes(roleNameLower)) {
        return true;
      }
      
      // Extract the base role name (before "--") and check for exact match
      const baseRole = r.split('--')[0].trim().toLowerCase();
      return baseRole === roleNameLower;
    });
    
    if (!role) return false;
    
    // If the role has specific permissions
    if (typeof role === 'string' && role.includes('--')) {
      const permissionsStr = role.split('--')[1].trim();
      const permissionList = permissionsStr.split(',').map(p => p.trim().toLowerCase());
      return permissionList.includes(permission.toLowerCase());
    }
    
    // If no specific permissions, assume view permission
    return permission === 'view';
  };

  // Define menu items with role requirements
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: 'dashboard', alwaysShow: true },
    { text: 'Member Management', icon: <PeopleIcon />, path: 'MemberManagement', role: 'Member Management' },
    { text: 'Category', icon: <PeopleIcon />, path: 'Category', role: 'Category' },
    { text: 'Business Directory', icon: <BusinessIcon />, path: 'BusinessManagement', role: 'Business Management' },
    { text: 'Family Information', icon: <FamilyRestroomIcon />, path: 'FamilyInformation', role: 'Family Information' },
    { text: 'Referral System', icon: <ShareIcon />, path: 'ReferralSystem', role: 'Referral System' },
    { text: 'Review Testimonials', icon: <RateReviewIcon />, path: 'ReviewTestimonals', role: 'Review Testimonials' },
    // Only show Community Admin option for super admins
    ...(adminRole !== 'community' ? [{ text: 'Community Admin', icon: <AdminPanelSettingsIcon />, path: 'CommunityAdmin', alwaysShow: true }] : []),
  ].filter(item => item.alwaysShow || hasRole(item.role));

  const getCurrentRoute = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    return segments.length > 1 ? segments[segments.length - 1] : 'dashboard';
  };

  const isActive = (itemPath) => {
    const currentRoute = getCurrentRoute();
    return currentRoute === itemPath;
  };

  const handleNavigation = (path) => {
    navigate(`/admin/${path}`);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('adminRole');
    navigate('/admin');
  };

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#2e7d32'
    }}>
      {/* Logo Section */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40, mr: 1.5 }}>
            <BusinessIcon sx={{ color: 'white' }} />
          </Avatar>
          <Box sx={{
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'left',
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Business Directory
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Admin Panel
            </Typography>
            {adminRole && (
              <Typography variant="caption" sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                display: 'block',
                mt: 0.5
              }}>
                {adminRole === 'super' ? 'Super Admin' : 'Community Admin'}
              </Typography>
            )}
          </Box>
        </Box>
        {isMobile && (
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, px: 1 }}>
        <List sx={{ pt: 0 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mb: 0.5,
                mx: 1,
                borderRadius: 2,
                backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isActive(item.path) ? 600 : 400,
                  color: 'white',
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Admin User Section */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setShowLogout(!showLogout)}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40, mr: 1.5 }}>
            {adminName?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', textAlign: "left" }}>
              {adminName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {adminEmail}
            </Typography>
            {Array.isArray(adminRoles) && adminRoles.length > 0 && adminRole === 'community' && (
              <Typography variant="caption" sx={{ 
                color: 'rgba(255,255,255,0.6)', 
                display: 'block',
                fontSize: '0.7rem'
              }}>
                {adminRoles.length} role{adminRoles.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        </Box>

        {showLogout && (
          <Box onClick={handleLogout} sx={{ 
            mt: 1.5, 
            px: 2, 
            py: 1, 
            display: 'flex', 
            alignItems: 'center',
            borderRadius: 1,
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
          }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">Logout</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          backgroundColor: '#2e7d32',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;