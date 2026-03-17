import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompetition } from '../context/CompetitionContext';
import { Timer, Trophy, LayoutGrid, LogOut, Crosshair } from 'lucide-react';

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
    'not-started': 'STANDBY',
    'active': formattedTime,
    'paused': 'HOLD',
    'ended': 'MISSION COMPLETE'
  };

  const statusColor = {
    'not-started': 'text-amber-400 border-amber-500/30',
    'active':      'text-purple-300 border-purple-500/40',
    'paused':      'text-orange-400 border-orange-500/30',
    'ended':       'text-teal-400 border-teal-500/30'
  };

  return (
    <nav className="glass-card-static sticky top-0 z-50 border-b border-t-0 border-l-0 border-r-0 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/challenges" className="flex items-center gap-2.5 group">
            <Crosshair className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="font-teko font-bold text-2xl text-white tracking-wide group-hover:text-purple-300 transition-colors">
              API <span className="text-purple-400">BLITZ</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/challenges"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isActive('/challenges')
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/35'
                  : 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/8'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Challenges
            </Link>
            <Link
              to="/leaderboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                isActive('/leaderboard')
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/35'
                  : 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/8'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>
          </div>

          {/* Timer + User */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg glass-input border ${statusColor[status]} ${status === 'active' ? 'animate-glow-pulse' : ''}`}>
              <Timer className="h-4 w-4" />
              <span className="font-mono text-sm font-bold tracking-wider">{statusLabel[status]}</span>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-purple-300/70 font-medium">
                  {user.teamName || user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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