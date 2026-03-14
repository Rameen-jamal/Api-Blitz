import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompetitionProvider } from './context/CompetitionContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layout
import AdminLayout from './layouts/AdminLayout';

// Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import TeamManagement from './pages/TeamManagement';
import ChallengeManagement from './pages/ChallengeManagement';
import CompetitionControl from './pages/CompetitionControl';
import SubmissionsMonitor from './pages/SubmissionsMonitor';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompetitionProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/teams" element={<TeamManagement />} />
              <Route path="/challenges" element={<ChallengeManagement />} />
              <Route path="/competition" element={<CompetitionControl />} />
              <Route path="/submissions" element={<SubmissionsMonitor />} />
            </Route>

            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </CompetitionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
