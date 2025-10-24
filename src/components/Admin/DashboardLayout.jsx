import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

// Layout Components
import Header from './Header';
import Sidebar from './Sidebar';

// Pages
import Dashboard from './Dashboard';
import MemberManagement from './MemberManagement';
import BusinessDirectory from './BusinessDirectory';
import ReferralSystem from './ReferralSystem';
import ReviewTestimonals from './ReviewTestimonals';
import AddMembersForm from './AddMembersForm';
import EditMemberForm from './EditMember';
import BusinessManagement from './BusinessManagement';
import FamilyInformation from './FamilyInformation';
import EditFamily from './EditFamily';
import AdminLoginPage from './AdminLoginPage';

// Route Guard
import ProtectedRoute from '../ProtectedRoute';
import Category from './Category';
import AddBusinessForm from './AddBusinessForm';
import CommunityAdmin from './CommunityAdmin';
import AddCommunityAdmin from './AddCommunityAdmin';
import EditCommunityAdmin from './EditCommunityAdmin';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === '/admin';

  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);
  const handleSidebarClose = () => setSidebarOpen(false);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {!isLoginPage && <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />}

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {!isLoginPage && <Header onMenuClick={handleSidebarToggle} />}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
            p: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <Routes>
            {/* Login Route */}
            <Route
              path=""
              element={
                localStorage.getItem('adminToken') ? (
                  <Navigate to="dashboard" />
                ) : (
                  <AdminLoginPage />
                )
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute type="admin">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="MemberManagement"
              element={
                <ProtectedRoute type="admin">
                  <MemberManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="AddMembers"
              element={
                <ProtectedRoute type="admin">
                  <AddMembersForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="Category"
              element={
                <ProtectedRoute type="admin">
                  <Category />
                </ProtectedRoute>
              }
            />
            <Route
              path="EditMember/:id"
              element={
                <ProtectedRoute type="admin">
                  <EditMemberForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="BusinessDirectory/:id"
              element={
                <ProtectedRoute type="admin">
                  <BusinessDirectory />
                </ProtectedRoute>
              }
            />
            <Route
              path="AddBusinessDirectory/:id"
              element={
                <ProtectedRoute type="admin">
                  <AddBusinessForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="BusinessManagement"
              element={
                <ProtectedRoute type="admin">
                  <BusinessManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="FamilyInformation"
              element={
                <ProtectedRoute type="admin">
                  <FamilyInformation />
                </ProtectedRoute>
              }
            />
            <Route
              path="EditFamilyDetails/:id"
              element={
                <ProtectedRoute type="admin">
                  <EditFamily />
                </ProtectedRoute>
              }
            />
            <Route
              path="ReferralSystem"
              element={
                <ProtectedRoute type="admin">
                  <ReferralSystem />
                </ProtectedRoute>
              }
            />
            <Route
              path="ReviewTestimonals"
              element={
                <ProtectedRoute type="admin">
                  <ReviewTestimonals />
                </ProtectedRoute>
              }
            />
            <Route
              path="CommunityAdmin"
              element={
                <ProtectedRoute type="admin">
                  <CommunityAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="CommunityAdmin/Add"
              element={
                <ProtectedRoute type="admin">
                  <AddCommunityAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="CommunityAdmin/Edit/:id"
              element={
                <ProtectedRoute type="admin">
                  <EditCommunityAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="ApplicationTracking"
              element={
                <ProtectedRoute type="admin">
                  <div>Application Tracking Page</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="Reports"
              element={
                <ProtectedRoute type="admin">
                  <div>Reports Page</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;