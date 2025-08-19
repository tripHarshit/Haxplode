import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/ui/Toast';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/common/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import NavigationTester from './utils/navigationTest';
import TestRunner from './utils/testRunner';
import SimpleTestRunner from './utils/simpleTestRunner';
import quickTest from './utils/quickTest';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

// Participant pages
const ParticipantDashboard = lazy(() => import('./pages/participant/ParticipantDashboard'));
const HackathonList = lazy(() => import('./pages/participant/HackathonList'));
const HackathonDetails = lazy(() => import('./pages/participant/HackathonDetails'));

// Organizer pages
const OrganizerDashboard = lazy(() => import('./pages/organizer/OrganizerDashboard'));
const CreateHackathon = lazy(() => import('./pages/organizer/CreateHackathon'));
const ManageHackathon = lazy(() => import('./pages/organizer/ManageHackathon'));

// Judge pages
const JudgeDashboard = lazy(() => import('./pages/judge/JudgeDashboard'));
const SubmissionsList = lazy(() => import('./pages/judge/SubmissionsList'));

function App() {
  useEffect(() => {
    // Initialize navigation tester for development
    if (import.meta.env.DEV) {
      console.log('🧪 Navigation testing enabled for development');
      // Make navigation tester available globally for testing
      window.navigationTester = new NavigationTester();
      window.testRunner = new TestRunner();
      window.simpleTestRunner = new SimpleTestRunner();
      
      // Add console commands for testing
      console.log('💡 Available test commands:');
      console.log('  - quickTest() - Run immediate quick test (fastest)');
      console.log('  - simpleTestRunner.runBasicTests() - Run basic functionality tests (recommended)');
      console.log('  - testRunner.runAllTests() - Run comprehensive navigation tests');
      console.log('  - navigationTester.runAllTests() - Run basic navigation tests');
      console.log('  - localStorage.getItem("haxcodeQuickTestResults") - View quick test results');
      console.log('  - localStorage.getItem("haxcodeBasicTestReport") - View basic test results');
      console.log('  - localStorage.getItem("haxcodeTestReport") - View comprehensive test results');
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              <SocketProvider>
                <ToastProvider>
                  <div className="min-h-screen bg-gradient dark:bg-gradient-dark transition-colors duration-300">
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                          <LoadingSpinner size="lg" />
                          <p className="mt-4 text-neutral-600">Loading Haxplode...</p>
                        </div>
                      </div>
                    }>
                      <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/hackathons" element={<HackathonList />} />
                
                {/* Profile and Settings routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Layout>
                      <SettingsPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Layout>
                      <NotificationsPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Protected routes with role-based access */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                
                {/* Participant routes */}
                <Route path="/participant/*" element={
                  <ProtectedRoute requiredRole="participant">
                    <Layout>
                      <Routes>
                        <Route index element={<ParticipantDashboard />} />
                        <Route path="hackathons" element={<HackathonList />} />
                        <Route path="hackathons/:id" element={<HackathonDetails />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Organizer routes */}
                <Route path="/organizer/*" element={
                  <ProtectedRoute requiredRole="organizer">
                    <Layout>
                      <Routes>
                        <Route index element={<OrganizerDashboard />} />
                        <Route path="create" element={<CreateHackathon />} />
                        <Route path="manage/:id" element={<ManageHackathon />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Judge routes */}
                <Route path="/judge/*" element={
                  <ProtectedRoute requiredRole="judge">
                    <Layout>
                      <Routes>
                        <Route index element={<JudgeDashboard />} />
                        <Route path="submissions" element={<SubmissionsList />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Admin routes (if needed in the future) */}
                <Route path="/admin" element={
                  <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
                    <Layout>
                      <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
                        <p className="text-neutral-600 mt-2">Admin features coming soon...</p>
                      </div>
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </ToastProvider>
      </SocketProvider>
    </NotificationProvider>
  </ThemeProvider>
</AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
