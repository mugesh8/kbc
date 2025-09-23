import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Rating,
  Button,
  IconButton,
  Modal,
  Grid,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { Search, Visibility, Close, FilterList, FileDownload } from '@mui/icons-material';
import * as XLSX from 'xlsx'; // Import the Excel library
import baseurl from '../Baseurl/baseurl';

const ReviewsTestimonialsManagement = () => {
  const [activeTab, setActiveTab] = useState('All Reviews');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewsData, setReviewsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabs = ['All Reviews', 'Pending', 'Approved', 'Rejected'];

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${baseurl}/api/ratings/all`, {
        method: 'GET',
        credentials: 'include',
      });
      const result = await response.json();
      if (result.data) {
        const mapped = result.data.map((item) => ({
          id: item.rid,
          reviewer: `${item.ratedBy.first_name} ${item.ratedBy.last_name}`,
          email: item.ratedBy.email,
          avatar: item.ratedBy.first_name[0],
          avatarColor: '#1976d2',
          business: item.business.company_name,
          businessType: 'Business',
          serviceType: 'Service',
          rating: item.rating,
          review: item.message,
          status: item.status.charAt(0).toUpperCase() + item.status.slice(1)
        }));
        setReviewsData(mapped);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Handle export to Excel
  const handleExport = () => {
    // Prepare data for export
    const exportData = filteredReviews.map(review => ({
      "Reviewer": review.reviewer,
      "Email": review.email,
      "Business": review.business,
      "Business Type": review.businessType,
      "Service Type": review.serviceType,
      "Rating": review.rating,
      "Review": review.review,
      "Status": review.status
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reviews");

    // Generate Excel file and download
    XLSX.writeFile(workbook, "reviews_and_testimonials.xlsx");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#FFC107';
      case 'Approved': return '#4CAF50';
      case 'Rejected': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Pending': return '#000';
      case 'Approved': return '#fff';
      case 'Rejected': return '#fff';
      default: return '#fff';
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`${baseurl}/api/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (response.ok) {
        setReviewsData((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) } : r
          )
        );
      } else {
        console.error('Error updating status:', data.error);
      }
    } catch (err) {
      console.error('Request error:', err);
    }
    setLoading(false);
  };

  const filteredReviews = reviewsData.filter((review) => {
    const matchesTab = activeTab === 'All Reviews' || review.status === activeTab;
    const matchesSearch = review.reviewer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.business.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: 800,
    bgcolor: 'background.paper',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflow: 'auto'
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
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
              Reviews and Testimonials Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and approve all reviews and testimonials from your business directory.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', md: 'auto' } }}>
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

      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{
              p: 3,
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' }
            }}>
              <TextField
                placeholder="Search reviews..."
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
                sx={{
                  color: '#666',
                  borderColor: '#ddd',
                  whiteSpace: 'nowrap'
                }}
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: '#666',
                  borderColor: '#ddd',
                  whiteSpace: 'nowrap'
                }}
              >
                Sort by
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {tabs.map((tab) => (
                <Chip
                  key={tab}
                  label={tab}
                  onClick={() => setActiveTab(tab)}
                  sx={{
                    backgroundColor: activeTab === tab ? '#4CAF50' : 'white',
                    color: activeTab === tab ? 'white' : '#666',
                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                    '&:hover': {
                      backgroundColor: activeTab === tab ? '#45a049' : '#f0f0f0',
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Reviewer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Business/Member</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Service Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Review</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReviews.map((row) => (
                  <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: row.avatarColor }}>{row.avatar}</Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 'bold' }}>{row.reviewer}</Typography>
                          <Typography variant="caption">{row.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{row.business}</TableCell>
                    <TableCell>{row.serviceType}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={row.rating} readOnly size="small" />
                        <Typography>{row.rating}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>{row.review}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        sx={{
                          backgroundColor: getStatusColor(row.status),
                          color: getStatusTextColor(row.status),
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {row.status === 'Pending' ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={loading}
                            onClick={() => handleStatusChange(row.id, 'approved')}
                          >
                            {loading ? (
                              <>
                                <CircularProgress size={16} color="inherit" />
                                &nbsp;Loading...
                              </>
                            ) : (
                              'Approve'
                            )}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            disabled={loading}
                            onClick={() => handleStatusChange(row.id, 'rejected')}
                          >
                            {loading ? (
                              <>
                                <CircularProgress size={16} color="inherit" />
                                &nbsp;Loading...
                              </>
                            ) : (
                              'Reject'
                            )}
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleViewReview(row)}
                          startIcon={<Visibility />}
                        >
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {selectedReview && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Review Details</Typography>
                <IconButton onClick={handleCloseModal}><Close /></IconButton>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: selectedReview.avatarColor, width: 60, height: 60 }}>
                      {selectedReview.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{selectedReview.reviewer}</Typography>
                      <Typography variant="body2">{selectedReview.email}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Business</Typography>
                  <Typography>{selectedReview.business}</Typography>
                  <Typography variant="subtitle2">Business Type</Typography>
                  <Typography>{selectedReview.businessType}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Service Type</Typography>
                  <Typography>{selectedReview.serviceType}</Typography>
                  <Typography variant="subtitle2">Rating</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={selectedReview.rating} readOnly />
                    <Typography>{selectedReview.rating}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Review</Typography>
                  <Typography sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    {selectedReview.review}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Chip
                      label={selectedReview.status}
                      sx={{
                        backgroundColor: getStatusColor(selectedReview.status),
                        color: getStatusTextColor(selectedReview.status)
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ReviewsTestimonialsManagement;