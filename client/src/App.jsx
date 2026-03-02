import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompetitionProvider } from './context/CompetitionContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import ParticipantLayout from './layouts/ParticipantLayout';
import AdminLayout from './layouts/AdminLayout';

// Participant Pages
import Login from './pages/participant/Login';
import ChallengeBoard from './pages/participant/ChallengeBoard';
import ChallengeDetail from './pages/participant/ChallengeDetail';
import Leaderboard from './pages/participant/Leaderboard';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeamManagement from './pages/admin/TeamManagement';
import ChallengeManagement from './pages/admin/ChallengeManagement';
import CompetitionControl from './pages/admin/CompetitionControl';
import SubmissionsMonitor from './pages/admin/SubmissionsMonitor';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompetitionProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Participant Routes */}
            <Route
              element={
                <ProtectedRoute role="team">
                  <ParticipantLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/challenges" element={<ChallengeBoard />} />
              <Route path="/challenges/:id" element={<ChallengeDetail />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>

            {/* Admin Routes */}
            <Route
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/teams" element={<TeamManagement />} />
              <Route path="/admin/challenges" element={<ChallengeManagement />} />
              <Route path="/admin/competition" element={<CompetitionControl />} />
              <Route path="/admin/submissions" element={<SubmissionsMonitor />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </CompetitionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
