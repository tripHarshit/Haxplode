import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/LoginPage";
import Register from "./pages/auth/RegisterPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ParticipantDashboard from "./pages/participant/ParticipantDashboard";
import HackathonList from "./pages/participant/HackathonList";
import HackathonDetails from "./pages/participant/HackathonDetails";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import CreateHackathon from "./pages/organizer/CreateHackathon";
import JudgeDashboard from "./pages/judge/JudgeDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/common/Layout";


function App() {
  return (
    <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Participant Routes */}
        <Route
          path="/participant"
          element={
            <ProtectedRoute requiredRole="Participant">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ParticipantDashboard />} />
          <Route path="hackathons" element={<HackathonList />} />
          <Route path="hackathons/:id" element={<HackathonDetails />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Organizer Routes */}
        <Route
          path="/organizer"
          element={
            <ProtectedRoute requiredRole="Organizer">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OrganizerDashboard />} />
          <Route path="create-hackathon" element={<CreateHackathon />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Judge Routes */}
        <Route
          path="/judge"
          element={
            <ProtectedRoute requiredRole="Judge">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<JudgeDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;
