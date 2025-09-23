import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Radio, Container, Fade, Grow } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { styled, keyframes } from '@mui/material/styles';
import logo from '../../assets/image.png';

// Animated gradient background
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const BackgroundContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(-45deg, #e8f5e8, #f0f8f0, #e0f2e0, #f5f9f5)`,
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 15s ease infinite`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(76, 175, 80, 0.15) 0%, transparent 50%)',
    zIndex: 1,
  }
}));

const GlassContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(4),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '140px',
    height: '140px',
    background: 'radial-gradient(circle, rgba(76, 175, 80, 0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    zIndex: -1,
  }
}));

const StyledLogo = styled('img')(({ theme }) => ({
  height: '100px',
  width: 'auto',
  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))',
  }
}));

const WelcomeText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 700,
  fontSize: '2rem',
  marginBottom: theme.spacing(1),
  textAlign: 'center',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '3px',
    background: 'linear-gradient(90deg, transparent, #4caf50, transparent)',
    borderRadius: '2px',
  }
}));

const SubText = styled(Typography)(({ theme }) => ({
  color: '#666',
  fontSize: '1.1rem',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  fontWeight: 400,
}));

const LanguageCard = styled(Paper)(({ theme, selected }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2.5),
  borderRadius: '16px',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: selected 
    ? 'linear-gradient(135deg, #d4edc9 0%, #e8f5e8 100%)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: selected 
    ? '2px solid #4caf50' 
    : '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: selected 
    ? '0 8px 32px rgba(76, 175, 80, 0.3)' 
    : '0 4px 16px rgba(0, 0, 0, 0.1)',
  transform: selected ? 'translateY(-2px)' : 'translateY(0)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: selected 
      ? '0 12px 40px rgba(76, 175, 80, 0.4)' 
      : '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
  '&:active': {
    transform: 'translateY(-1px)',
  }
}));

const LanguageCardContent = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
});

const LanguageText = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 600,
  color: '#333',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledRadio = styled(Radio)(({ theme }) => ({
  '&.Mui-checked': {
    color: '#4caf50',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.5rem',
  },
}));

const StartButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
  borderRadius: '25px',
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  fontWeight: 700,
  textTransform: 'none',
  boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  minWidth: '200px',
  height: '56px',
  '&:hover': {
    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 32px rgba(76, 175, 80, 0.5)',
  },
  '&:active': {
    transform: 'translateY(0)',
  }
}));

const LanguageOptions = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '400px',
  marginBottom: theme.spacing(4),
}));

const LanguagePage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = React.useState('en');

  const handleSelect = (lang) => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const handleStart = () => {
    if (selectedLang) {
      navigate('/signup');
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
  ];

  return (
    <BackgroundContainer>
      <GlassContainer maxWidth="sm">
        <Fade in timeout={800}>
          <LogoContainer>
            <StyledLogo src={logo} alt="Logo" />
          </LogoContainer>
        </Fade>

        <Fade in timeout={1000} style={{ transitionDelay: '200ms' }}>
          <WelcomeText variant="h4">
            {t('welcome')}
          </WelcomeText>
        </Fade>

        <Fade in timeout={1000} style={{ transitionDelay: '400ms' }}>
          <SubText>
            {t('Select Language')}
          </SubText>
        </Fade>

        <Fade in timeout={1000} style={{ transitionDelay: '600ms' }}>
          <LanguageOptions>
            {languages.map((lang, index) => (
              <Grow 
                key={lang.code} 
                in 
                timeout={800} 
                style={{ transitionDelay: `${800 + index * 200}ms` }}
              >
                <LanguageCard 
                  selected={selectedLang === lang.code}
                  onClick={() => handleSelect(lang.code)}
                  elevation={0}
                >
                  <LanguageCardContent>
                    <LanguageText>
                      <span style={{ fontSize: '1.5rem' }}>{lang.flag}</span>
                      {lang.name}
                    </LanguageText>
                    <StyledRadio 
                      checked={selectedLang === lang.code}
                      value={lang.code}
                    />
                  </LanguageCardContent>
                </LanguageCard>
              </Grow>
            ))}
          </LanguageOptions>
        </Fade>

        <Fade in timeout={1000} style={{ transitionDelay: '1200ms' }}>
          <StartButton
            variant="contained"
            onClick={handleStart}
            size="large"
          >
            {t('start')}
          </StartButton>
        </Fade>
      </GlassContainer>
    </BackgroundContainer>
  );
};

export default LanguagePage;