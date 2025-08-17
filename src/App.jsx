import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/common/Layout';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

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
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gradient">
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-neutral-600">Loading Haxcode...</p>
                </div>
              </div>
            }>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/hackathons" element={<HackathonList />} />
                
                {/* Protected routes with role-based access */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                
                {/* Participant routes */}
                <Route path="/participant" element={
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
                <Route path="/organizer" element={
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
                <Route path="/judge" element={
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
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
