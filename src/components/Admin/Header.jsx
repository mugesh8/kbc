import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  InputAdornment,
  Box,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';

const Header = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      // Determine which page to navigate to based on current location
      const currentPath = location.pathname;

      if (currentPath.includes('MemberManagement')) {
        // Stay on Member Management and apply search
        navigate(`/admin/MemberManagement?search=${encodeURIComponent(searchTerm)}`);
      } else if (currentPath.includes('BusinessManagement') || currentPath.includes('BusinessDirectory')) {
        // Navigate to Business Management with search
        navigate(`/admin/BusinessManagement?search=${encodeURIComponent(searchTerm)}`);
      } else if (currentPath.includes('FamilyInformation')) {
        // Navigate to Family Information with search
        navigate(`/admin/FamilyInformation?search=${encodeURIComponent(searchTerm)}`);
      } else {
        // Default: navigate to Member Management with search
        navigate(`/admin/MemberManagement?search=${encodeURIComponent(searchTerm)}`);
      }
    }
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#f5f5f5',
        color: '#333',
        borderBottom: '1px solid #e0e0e0',
        zIndex: theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{
        justifyContent: 'space-between',
        py: { xs: 1, sm: 1.5 },
        px: { xs: 2, sm: 3 }
      }}>
        {/* Left side - Title */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start', // Align items to the left
            gap: 1, // spacing between Typography elements
          }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Business Directory
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              display: { xs: 'none', sm: 'block' } // hides subtitle on extra small screens
            }}
          >
            Welcome back! Here's what's happening in your business directory.
          </Typography>
        </Box>


        {/* Right side - Search */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search Members, businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: '200px', sm: '300px' },
              backgroundColor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#2e7d32',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#2e7d32',
                  borderWidth: 1,
                },
              },
              '& .MuiInputBase-input': {
                fontSize: '0.875rem',
              }
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;