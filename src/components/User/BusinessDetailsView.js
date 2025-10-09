import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Divider,
    Stack,
    CircularProgress,
    IconButton,
    Avatar,
    useTheme
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useTranslation } from 'react-i18next';
import {
    Phone, WhatsApp, Email, Share
} from '@mui/icons-material';
import { useCustomTheme } from '../../context/ThemeContext';
import baseurl from '../Baseurl/baseurl';

const BusinessDetailView = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const { mode } = useCustomTheme();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loggedInMember, setLoggedInMember] = useState(null);
    const [chipFilter, setChipFilter] = useState('');
    const [categories, setCategories] = useState({});

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('memberData'));
        const token = localStorage.getItem('token');

        if (stored?.mid && token) {
            fetch(`${baseurl}/api/member/${stored.mid}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.data) {
                        setLoggedInMember(data.data);
                    } else {
                        setLoggedInMember(stored);
                    }
                })
                .catch(() => setLoggedInMember(stored));
        }
    }, []);

    // Fetch all categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${baseurl}/api/category/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    // Create a mapping of category IDs to category names
                    const categoriesMap = {};
                    data.data.forEach(category => {
                        categoriesMap[category.cid] = category.category_name;
                    });
                    setCategories(categoriesMap);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
    }, []);

    // Set chipFilter based on member status
    useEffect(() => {
        if (loggedInMember) {
            if (loggedInMember.status === 'Pending') {
                setChipFilter('Business Type');
            } else {
                setChipFilter('All');
            }
        }
    }, [loggedInMember]);

    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${baseurl}/api/member/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setMember(data.data);
                }
            } catch (err) {
                console.error('Error fetching member:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMemberData();
    }, [id]);

    const handleShare = () => {
        const primaryBusiness = member?.BusinessProfiles?.[0];
        if (primaryBusiness && navigator.share) {
            navigator
                .share({
                    title: primaryBusiness.company_name,
                    text: `Check out ${primaryBusiness.company_name}`,
                    url: window.location.href
                })
                .catch((error) => console.error('Error sharing:', error));
        } else {
            alert('Sharing is not supported on this device.');
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    textAlign: 'center',
                    mt: 4,
                    bgcolor: theme.palette.background.default,
                    minHeight: '100vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                maxWidth: 500,
                mx: 'auto',
                p: 3,
                pb: 8,
                fontFamily: "'Poppins', sans-serif",
                bgcolor: theme.palette.background.default,
                color: theme.palette.text.primary,
                minHeight: '100vh'
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(to right, #137d13, #3ad13a)',
                    borderRadius: 1,
                    mb: 2
                }}
            >
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ p: 2 }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <IconButton onClick={() => navigate(-1)} sx={{ color: '#fff' }}>
                            <ArrowBackIosNewIcon />
                        </IconButton>
                        <Typography fontSize={14} fontWeight={600} sx={{ color: '#fff' }}>
                            {t('Business Details')}
                        </Typography>

                    </Box>
                    <Avatar
                        src={
                            loggedInMember?.profile_image
                                ? `${baseurl}/${loggedInMember.profile_image}`
                                : undefined
                        }
                        sx={{
                            bgcolor: theme.palette.background.paper,
                            color: theme.palette.primary.main,
                            fontWeight: 600
                        }}
                    >
                        {!loggedInMember?.profile_image && loggedInMember?.first_name?.[0]}
                    </Avatar>
                </Box>
            </Box>

            {/* Business Profiles */}
            {!member || !Array.isArray(member.BusinessProfiles) || member.BusinessProfiles.length === 0 ? (
                <Box
                    sx={{
                        textAlign: 'center',
                        mt: 4,
                        p: 3,
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 2
                    }}
                >
                    <Typography color={theme.palette.text.primary}>
                        No business details found.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ textAlign: "left" }}>
                    {member.BusinessProfiles.map((profile, index) => {
                        // Common fields for all business types
                        const commonDetails = [
                            { label: 'Business Name', value: profile.company_name },
                            { label: 'Business Type', value: profile.business_type },
                            { label: 'Category', value: categories[profile.category_id] || 'Loading...' },
                            { label: 'Experience', value: profile.experience },
                            { label: 'Business Work Contract', value: profile.business_work_contract },
                            { label: 'Tags', value: profile.tags },
                            { label: 'Website', value: profile.website },
                            { label: 'Google Link', value: profile.google_link },
                            { label: 'Facebook Link', value: profile.facebook_link },
                            { label: 'Instagram Link', value: profile.instagram_link },
                            { label: 'LinkedIn Link', value: profile.linkedin_link }
                        ];

                        // Business type specific fields
                        const businessTypeSpecificDetails = [];
                        
                        if (profile.business_type === 'salary') {
                            businessTypeSpecificDetails.push(
                                { label: 'Designation', value: profile.designation },
                                { label: 'Salary', value: profile.salary },
                                { label: 'Location', value: profile.location }
                            );
                        } else {
                            businessTypeSpecificDetails.push(
                                { label: 'Registration Type', value: profile.business_registration_type },
                                { label: 'Staff Size', value: profile.staff_size },
                                { label: 'Business Starting Year', value: profile.business_starting_year },
                                { label: 'Company Address', value: `${profile.company_address},\n${profile.city}, ${profile.state} ${profile.zip_code}` }
                            );
                        }

                        // Additional fields
                        const additionalDetails = [
                            { label: 'About', value: profile.about, fullWidth: true },
                            { label: 'Your Role', value: profile.role },
                            { label: 'Contact', value: profile.contact },
                            { label: 'Email', value: profile.email },
                            { label: 'Source', value: profile.source }
                        ];

                        const details = [...commonDetails, ...businessTypeSpecificDetails, ...additionalDetails];

                        const mediaGallery = profile.media_gallery
                            ? profile.media_gallery.split(',').map((item) => item.trim())
                            : [];

                        return (
                            <Box
                                key={index}
                                sx={{
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: '8px',
                                    p: 3,
                                    backgroundColor: theme.palette.background.paper,
                                    boxShadow: theme.shadows[1],
                                    mb: 3
                                }}
                            >

                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '18px',
                                        color: theme.palette.text.primary,
                                        mb: 1
                                    }}
                                >
                                    Business Info #{index + 1}
                                </Typography>

                                <Divider sx={{ mb: 2, bgcolor: theme.palette.divider }} />

                                {/* Business Profile Image */}
                                {profile.business_profile_image && (
                                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                                        <img
                                            src={`${baseurl}/${profile.business_profile_image}`}
                                            alt="Business"
                                            style={{
                                                maxWidth: '100%',
                                                borderRadius: '6px',
                                                maxHeight: '300px',
                                                // objectFit: 'cover'
                                            }}
                                        />
                                    </Box>
                                )}

                                {/* Business Details */}
                                <Stack spacing={1.6}>
                                    {details.map(({ label, value, fullWidth }) => (
                                        value && (
                                            fullWidth ? (
                                                // Special layout for About field
                                                <Box key={label} sx={{ mb: 2 }}>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: theme.palette.text.secondary,
                                                            mb: 1
                                                        }}
                                                    >
                                                        {label}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            textAlign: "left",
                                                            color: theme.palette.text.primary
                                                        }}
                                                    >
                                                        {value || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                // Standard layout for other fields
                                                <Box
                                                    key={label}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        lineHeight: 1.5
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            width: '50%',
                                                            color: theme.palette.text.secondary,
                                                            fontSize: '15px'
                                                        }}
                                                    >
                                                        {label}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            width: '50%',
                                                            textAlign: 'right',
                                                            fontWeight:
                                                                ['Business Name', 'Business Type', 'Your Role', 'Company Address'].includes(label)
                                                                    ? 600
                                                                    : 400,
                                                            whiteSpace: 'normal',       // allow wrapping
                                                            wordBreak: 'break-word',    // break long words/URLs
                                                            overflowWrap: 'anywhere',   // modern fallback
                                                            fontSize: '15px',
                                                            color: theme.palette.text.primary
                                                        }}

                                                    >
                                                        {value || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            )
                                        )
                                    ))}
                                </Stack>

                                {/* Media Gallery */}
                                {mediaGallery.length > 0 && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography fontWeight={600} mb={1} color={theme.palette.text.primary}>
                                            Media Gallery:
                                        </Typography>
                                        <Stack spacing={1}>
                                            {mediaGallery.map((media, i) => {
                                                const isVideo = media.endsWith('.mp4');
                                                return isVideo ? (
                                                    <video
                                                        key={i}
                                                        controls
                                                        style={{
                                                            width: '50%',
                                                            borderRadius: 4,
                                                            backgroundColor: theme.palette.grey[900],
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        <source src={`${baseurl}/${media}`} type="video/mp4" />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                ) : (
                                                    <img
                                                        key={i}
                                                        src={`${baseurl}/${media}`}
                                                        alt={`media-${i}`}
                                                        style={{
                                                            width: '50%',
                                                            borderRadius: 4,
                                                            backgroundColor:
                                                                theme.palette.mode === 'dark'
                                                                    ? theme.palette.grey[900]
                                                                    : theme.palette.grey[100]
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* Bottom Bar */}
            {member?.BusinessProfiles?.length > 0 && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: theme.palette.background.paper,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        zIndex: 999
                    }}
                >
                    <Box
                        sx={{
                            maxWidth: 500,
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-around',
                            py: 1
                        }}
                    >
                        <IconButton
                            component="a"
                            href={`tel:${member.BusinessProfiles[0]?.contact || ''}`}
                            aria-label="Call"
                            sx={{
                                color: theme.palette.mode === 'dark'
                                    ? theme.palette.success.light
                                    : theme.palette.success.main
                            }}
                        >
                            <Phone />
                        </IconButton>

                        <IconButton
                            component="a"
                            href={`mailto:${member.BusinessProfiles[0]?.email || ''}`}
                            aria-label="Email"
                            sx={{
                                color: theme.palette.mode === 'dark'
                                    ? theme.palette.success.light
                                    : theme.palette.success.main
                            }}
                        >
                            <Email />
                        </IconButton>

                        <IconButton
                            component="a"
                            href={`https://wa.me/${member.BusinessProfiles[0]?.contact || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="WhatsApp"
                            sx={{
                                color: theme.palette.mode === 'dark'
                                    ? theme.palette.success.light
                                    : theme.palette.success.main
                            }}
                        >
                            <WhatsApp />
                        </IconButton>

                        <IconButton
                            onClick={handleShare}
                            aria-label="Share"
                            sx={{
                                color: theme.palette.mode === 'dark'
                                    ? theme.palette.success.light
                                    : theme.palette.success.main
                            }}
                        >
                            <Share />
                        </IconButton>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default BusinessDetailView;