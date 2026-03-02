import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useCompetition } from '../../context/CompetitionContext';
import {
  Settings, Play, Pause, SkipForward, Clock, Lock, Unlock, AlertCircle
} from 'lucide-react';

const CompetitionControl = () => {
  const { competition, status, setCompetition, updateStatus } = useCompetition();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [extendMinutes, setExtendMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (competition) {
      const toLocal = (d) => {
        const dt = new Date(d);
        return dt.toISOString().slice(0, 16);
      };
      setStartTime(toLocal(competition.startTime));
      setEndTime(toLocal(competition.endTime));
    }
  }, [competition]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const saveSettings = async () => {
    if (!startTime || !endTime) {
      showMessage('error', 'Both start and end time are required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/competition', { startTime, endTime });
      setCompetition(data.data);
      updateStatus(data.data);
      showMessage('success', 'Competition settings saved');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const action = async (endpoint, label) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/competition/${endpoint}`);
      setCompetition(data.data);
      updateStatus(data.data);
      showMessage('success', `Competition ${label}`);
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const extendTime = async () => {
    if (!extendMinutes || Number(extendMinutes) <= 0) {
      showMessage('error', 'Enter valid minutes');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.put('/competition/extend', { minutes: Number(extendMinutes) });
      setCompetition(data.data);
      updateStatus(data.data);
      setExtendMinutes('');
      showMessage('success', `Extended by ${extendMinutes} minutes`);
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to extend');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    'not-started': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'active': 'bg-green-500/20 text-green-400 border-green-500/30',
    'paused': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'ended': 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-purple-400" />
        Competition Control
      </h1>

      {message.text && (
        <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm ${
          message.type === 'error'
            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
            : 'bg-green-500/10 border border-green-500/30 text-green-400'
        }`}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {message.text}
        </div>
      )}

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border ${statusColors[status]}`}>
          Status: {status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Time Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={saveSettings}
              disabled={loading}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Competition Controls */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Competition Controls</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => action('start', 'started')}
                disabled={loading || status === 'active'}
                className="py-3 bg-green-600 hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start
              </button>
              <button
                onClick={() => action('pause', 'paused')}
                disabled={loading || status !== 'active'}
                className="py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Pause
              </button>
              <button
                onClick={() => action('resume', 'resumed')}
                disabled={loading || status !== 'paused'}
                className="py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <SkipForward className="h-4 w-4" />
                Resume
              </button>
            </div>
          </div>

          {/* Extend Time */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Extend Time</h2>
            <div className="flex gap-2">
              <input
                type="number"
                value={extendMinutes}
                onChange={(e) => setExtendMinutes(e.target.value)}
                placeholder="Minutes to add"
                min="1"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={extendTime}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Extend
              </button>
            </div>
          </div>

          {/* Leaderboard Freeze */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Leaderboard Control</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => action('freeze', 'leaderboard frozen')}
                disabled={loading || competition?.leaderboardFrozen}
                className="py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Freeze
              </button>
              <button
                onClick={() => action('unfreeze', 'leaderboard unfrozen')}
                disabled={loading || !competition?.leaderboardFrozen}
                className="py-3 bg-green-600 hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Unlock className="h-4 w-4" />
                Unfreeze
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionControl;
