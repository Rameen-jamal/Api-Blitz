import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompetitionProvider } from './context/CompetitionContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layout
import ParticipantLayout from './layouts/ParticipantLayout';

// Participant Pages
import Login from './pages/participant/Login';
import ChallengeBoard from './pages/participant/ChallengeBoard';
import ChallengeDetail from './pages/participant/ChallengeDetail';
import Leaderboard from './pages/participant/Leaderboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompetitionProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Participant Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <ParticipantLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/challenges" element={<ChallengeBoard />} />
              <Route path="/challenges/:id" element={<ChallengeDetail />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </CompetitionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
