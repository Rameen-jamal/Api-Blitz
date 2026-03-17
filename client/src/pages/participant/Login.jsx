import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Crosshair, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      navigate('/challenges');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in-up">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crosshair className="h-11 w-11 text-purple-400 animate-text-glow" />
            <h1 className="font-teko text-6xl font-bold text-white tracking-wider">
              API <span className="text-purple-400">BLITZ</span>
            </h1>
          </div>
          <p className="text-purple-300/50 text-xs tracking-[0.25em] uppercase font-medium">
            Tactical API Competition Platform
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl animate-border-glow"
             style={{ boxShadow: '0 0 60px rgba(124,58,237,0.15), inset 0 1px 0 rgba(168,85,247,0.1)' }}>

          <h2 className="font-teko text-2xl font-semibold text-purple-200 mb-6 tracking-widest uppercase">
            Team Login
          </h2>

          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/25 rounded-lg flex items-center gap-2 text-red-400 text-sm animate-fade-in">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-purple-300/60 mb-2 tracking-[0.15em] uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 glass-input rounded-lg text-purple-100 placeholder-purple-900/60 focus:outline-none text-sm"
                placeholder="team_username"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-300/60 mb-2 tracking-[0.15em] uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 glass-input rounded-lg text-purple-100 placeholder-purple-900/60 focus:outline-none text-sm"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 btn-purple rounded-lg tracking-widest uppercase"
            >
              {loading ? 'AUTHENTICATING...' : 'DEPLOY'}
            </button>
          </form>
        </div>

        {/* Flavor */}
        <p className="text-center text-purple-900/60 text-xs mt-6 tracking-[0.2em] uppercase font-mono">
          Bravo Six, Going Dark
        </p>

      </div>
    </div>
  );
};

export default Login;