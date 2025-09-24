import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/Admin/DashboardLayout';
import './App.css';
import './i18n';
import HomePage from './components/User/HomePage';
import SignupPage from './components/User/SignupPage';
import LoginPage from './components/User/LoginPage';
import OTPPage from './components/User/OTPPage';
// import LanguagePage from './components/User/LanguagePage'; // Commented out
import DetailsPage from './components/User/DetailsPage';
import NotificationsPage from './components/User/NotificationsPage';
import UserProfilePage from './components/User/UserProfilePage';
import ReviewPage from './components/User/ReviewPage';
import BusinessDetailsPage from './components/User/BusinessDetailsPage';
import PersonalDetailsPage from './components/User/PersonalDetailsPage';
import FamilyDetailsPage from './components/User/FamilyDetailsPage';
import UpdateCredentialsPage from './components/User/UpdateCredentialsPage';
import BusinessDetailView from './components/User/BusinessDetailsView';
import ForgotPasswordPage from './components/User/ForgotPasswordPage';
import ResetPasswordPage from './components/User/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import Browse from './components/User/Browse';
import Category from './components/User/Category';
import About from './components/User/About';
import PrivacyPolicy from './components/User/PrivacyPolicy';
import TermsAndConditions from './components/User/TermsAndConditions';
import LegalNotice from './components/User/LegalNotice';
import Contact from './components/User/Contact';
import MembersPage from './components/User/MembersPage';
import MemberDetailsPage from './components/User/MemberDetailsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} /> {/* Changed from LanguagePage to LoginPage */}
          {/* <Route path="/language" element={<LanguagePage />} /> */} {/* Commented out language route */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/otp" element={<OTPPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* User protected routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/home/:page" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/details/:id" element={
            <ProtectedRoute>
              <DetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/review/:id" element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          } />
          <Route path="/business-details/:id" element={
            <ProtectedRoute>
              <BusinessDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/personal-details/:id" element={
            <ProtectedRoute>
              <PersonalDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/family-details/:id" element={
            <ProtectedRoute>
              <FamilyDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/change-password/:id" element={
            <ProtectedRoute>
              <UpdateCredentialsPage />
            </ProtectedRoute>
          } />
          <Route path="/business-details-view/:id" element={
            <ProtectedRoute>
              <BusinessDetailView />
            </ProtectedRoute>
          } />
          
          {/* Navigation routes */}
          <Route path="/members" element={
            <ProtectedRoute>
              <MembersPage />
            </ProtectedRoute>
          } />
             <Route path="/member/:id" element={
            <ProtectedRoute>
              <MemberDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/categories" element={
            <ProtectedRoute>
              <Category />
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          } />
          <Route path="/contact" element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          } />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/legal" element={<LegalNotice />} />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={<DashboardLayout />} />
          
          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;