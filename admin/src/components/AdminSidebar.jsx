import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompetition } from '../context/CompetitionContext';
import { LayoutDashboard, Users, Target, Settings, FileText, LogOut, Shield, Timer } from 'lucide-react';

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
    { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teams',       icon: Users,            label: 'Teams' },
    { to: '/challenges',  icon: Target,           label: 'Challenges' },
    { to: '/competition', icon: Settings,         label: 'Competition' },
    { to: '/submissions', icon: FileText,         label: 'Submissions' },
  ];

  const statusColor = {
    'not-started': 'text-amber-400',
    'active':      'text-purple-300',
    'paused':      'text-orange-400',
    'ended':       'text-teal-400',
  };

  const statusLabel = {
    'not-started': 'STANDBY',
    'active':      formattedTime,
    'paused':      'HOLD',
    'ended':       'COMPLETE',
  };

  return (
    <aside className="w-64 sidebar-bg min-h-screen flex flex-col animate-slide-in-left">

      {/* Brand */}
      <div className="p-5 border-b border-purple-500/15">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center border border-purple-500/25 group-hover:border-purple-500/50 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all">
            <Shield className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <span className="font-teko font-bold text-xl text-white tracking-wide block leading-none">
              COMMAND CENTER
            </span>
            <span className="text-[10px] text-purple-400/50 uppercase tracking-widest">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Timer */}
      <div className="px-5 py-3 border-b border-purple-500/15">
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
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                : 'text-purple-300/50 hover:text-purple-300 hover:bg-purple-500/8'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-purple-500/15 space-y-2">
        {user && (
          <div className="px-3 py-2 rounded-lg glass-card-static">
            <div className="text-xs text-purple-400/50 uppercase tracking-wider">Logged in as</div>
            <div className="text-sm text-white font-medium mt-0.5">{user.username || 'Admin'}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-purple-300/40 hover:text-red-400 hover:bg-red-500/8 transition-all w-full"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;