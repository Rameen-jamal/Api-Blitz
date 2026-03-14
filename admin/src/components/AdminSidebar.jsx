import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompetition } from '../context/CompetitionContext';
import {
  LayoutDashboard, Users, Target, Settings, FileText, LogOut, Shield, Timer
} from 'lucide-react';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const { formattedTime, status } = useCompetition();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teams', icon: Users, label: 'Teams' },
    { to: '/challenges', icon: Target, label: 'Challenges' },
    { to: '/competition', icon: Settings, label: 'Competition' },
    { to: '/submissions', icon: FileText, label: 'Submissions' },
  ];

  const statusColor = {
    'not-started': 'text-yellow-400',
    'active': 'text-green-400',
    'paused': 'text-orange-400',
    'ended': 'text-red-400'
  };

  const statusLabel = {
    'not-started': 'STANDBY',
    'active': formattedTime,
    'paused': 'HOLD',
    'ended': 'COMPLETE'
  };

  return (
    <aside className="w-64 sidebar-bg min-h-screen flex flex-col animate-slide-in-left">
      {/* Brand */}
      <div className="p-5 border-b border-green-500/10">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center border border-green-500/20 group-hover:border-green-500/40 transition-all">
            <Shield className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <span className="font-teko font-bold text-xl text-white tracking-wide block leading-none">
              COMMAND CENTER
            </span>
            <span className="text-[10px] text-gray-600 uppercase tracking-widest">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Timer */}
      <div className="px-5 py-3 border-b border-green-500/10">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg glass-input text-xs font-mono font-bold ${statusColor[status]} ${status === 'active' ? 'animate-glow-pulse' : ''}`}>
          <Timer className="h-3.5 w-3.5" />
          <span className="tracking-wider">{statusLabel[status]}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 mt-1">
        {links.map(({ to, icon: Icon, label }, index) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 animate-fade-in stagger-${index + 1} ${
              location.pathname === to
                ? 'bg-green-500/15 text-green-400 border border-green-500/20 shadow-[0_0_12px_rgba(74,222,128,0.08)]'
                : 'text-gray-500 hover:text-green-300 hover:bg-green-500/5'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-green-500/10 space-y-2">
        {user && (
          <div className="px-3 py-2 rounded-lg glass-card-static">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Logged in as</div>
            <div className="text-sm text-white font-medium mt-0.5">{user.username || 'Admin'}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition-all w-full"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
