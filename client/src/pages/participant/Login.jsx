import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Crosshair, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
            <Crosshair className="h-12 w-12 text-green-400 animate-text-glow" />
            <h1 className="font-teko text-6xl font-bold text-white tracking-wider">
              API <span className="text-green-400">BLITZ</span>
            </h1>
          </div>
          <p className="text-gray-500 text-sm tracking-widest uppercase font-medium">
            Tactical API Competition Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl animate-border-glow">
          <h2 className="font-teko text-2xl font-semibold text-white mb-6 tracking-wide">
            TEAM LOGIN
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm animate-fade-in">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 tracking-wide uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 glass-input rounded-lg text-white placeholder-gray-600 focus:outline-none transition font-mono text-sm"
                placeholder="Enter team username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5 tracking-wide uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 glass-input rounded-lg text-white placeholder-gray-600 focus:outline-none transition font-mono text-sm"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-green rounded-lg text-sm tracking-wider uppercase"
            >
              {loading ? 'AUTHENTICATING...' : 'DEPLOY'}
            </button>
          </form>
        </div>

        {/* Flavor text */}
        <p className="text-center text-gray-700 text-xs mt-6 tracking-widest uppercase font-mono">
          Bravo Six, Going Dark
        </p>
      </div>
    </div>
  );
};

export default Login;
