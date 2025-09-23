// import React from 'react';
// import { Box, Typography, TextField, Button } from '@mui/material';
// import { useTranslation } from 'react-i18next';

// const OTPPage = () => {
//   const { t } = useTranslation();

//   return (
//     <Box sx={{ maxWidth: 400, mx: 'auto', bgcolor: '#fff', p: 3, height: '100vh' }}>
//       <Box sx={{ textAlign: 'center', bgcolor: 'green', py: 2, borderRadius: 1 }}>
//         <Typography color="white" variant="h6">LOGO</Typography>
//       </Box>

//       <Typography variant="h5" color="green" mt={4}>{t('verify')}</Typography>
//       <Typography mt={1}>{t('enterOtp')}</Typography>

//       <TextField fullWidth margin="dense" placeholder="•  •  •  •  •  •" inputProps={{ maxLength: 6, style: { letterSpacing: '1em', textAlign: 'center' } }} />

//       <Button fullWidth variant="contained" sx={{ mt: 3, backgroundColor: 'green', borderRadius: 25 }}>
//         {t('verify')}
//       </Button>

//       <Typography textAlign="center" mt={2}>
//         {t('resendOtp')}
//       </Typography>
//     </Box>
//   );
// };

// export default OTPPage;

import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate

const OTPPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // ✅ Initialize navigation

  const handleVerify = () => {
    // You can add OTP validation logic here
    navigate('/home'); // ✅ Navigate to Home page
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', bgcolor: '#fff', p: 3, height: '100vh' }}>
      <Box sx={{ textAlign: 'center', bgcolor: 'green', py: 2, borderRadius: 1 }}>
        <Typography color="white" variant="h6">LOGO</Typography>
      </Box>

      <Typography variant="h5" color="green" mt={4}>{t('verify')}</Typography>
      <Typography mt={1}>{t('enterOtp')}</Typography>

      <TextField
        fullWidth
        margin="dense"
        placeholder="•  •  •  •  •  •"
        inputProps={{
          maxLength: 6,
          style: { letterSpacing: '1em', textAlign: 'center' }
        }}
      />

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3, backgroundColor: 'green', borderRadius: 25 }}
        onClick={handleVerify} // ✅ Click handler
      >
        {t('verify')}
      </Button>

      <Typography textAlign="center" mt={2}>
        {t('resendOtp')}
      </Typography>
    </Box>
  );
};

export default OTPPage;
