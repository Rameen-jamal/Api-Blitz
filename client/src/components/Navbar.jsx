import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompetition } from '../context/CompetitionContext';
import { Timer, Trophy, LayoutGrid, LogOut, Zap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { formattedTime, status } = useCompetition();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const statusLabel = {
    'not-started': 'Not Started',
    'active': formattedTime,
    'paused': 'PAUSED',
    'ended': 'ENDED'
  };

  const statusColor = {
    'not-started': 'text-yellow-400',
    'active': 'text-green-400',
    'paused': 'text-orange-400',
    'ended': 'text-red-400'
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/challenges" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-500" />
            <span className="font-bold text-xl text-white">API Blitz</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/challenges"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/challenges')
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <LayoutGrid className="inline h-4 w-4 mr-1" />
              Challenges
            </Link>
            <Link
              to="/leaderboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/leaderboard')
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Trophy className="inline h-4 w-4 mr-1" />
              Leaderboard
            </Link>
          </div>

          {/* Timer + User */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 ${statusColor[status]}`}>
              <Timer className="h-4 w-4" />
              <span className="font-mono text-sm font-semibold">{statusLabel[status]}</span>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {user.teamName || user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
