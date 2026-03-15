import { useState, useEffect } from 'react';
import { useCompetition } from '../context/CompetitionContext';
import { Settings, Play, Pause, Square, RotateCcw, Clock, Lock, Unlock, AlertTriangle, Save, Calendar } from 'lucide-react';
import api from '../lib/api';

const CompetitionControl = () => {
  const { status, formattedTime, competition, leaderboardFrozen, fetchStatus } = useCompetition();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [extendMinutes, setExtendMinutes] = useState(30);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Populate datetime inputs when competition data loads
  useEffect(() => {
    if (competition) {
      if (competition.startTime) {
        setStartTime(toLocalDatetime(competition.startTime));
      }
      if (competition.endTime) {
        setEndTime(toLocalDatetime(competition.endTime));
      }
    }
  }, [competition]);

  // Convert ISO date to datetime-local format
  const toLocalDatetime = (isoStr) => {
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const showMsg = (msg, isErr = false) => {
    if (isErr) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  // Save start/end times
  const saveSettings = async () => {
    if (!startTime || !endTime) { showMsg('Both start and end times are required', true); return; }
    if (new Date(endTime) <= new Date(startTime)) { showMsg('End time must be after start time', true); return; }
    try {
      await api.post('/competition', { startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString() });
      showMsg('Settings saved!');
      fetchStatus();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed to save', true); }
  };

  const startComp = async () => {
    try {
      await api.put('/competition/start');
      showMsg('Competition started!');
      fetchStatus();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
  };

  const pauseComp = async () => {
    try {
      await api.put('/competition/pause');
      showMsg('Competition paused');
      fetchStatus();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
  };

  const resumeComp = async () => {
    try {
      await api.put('/competition/resume');
      showMsg('Competition resumed');
      fetchStatus();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
  };

  const endComp = async () => {
    if (!confirm('End the competition?')) return;
    try {
      await api.put('/competition/end');
      showMsg('Competition ended');
      fetchStatus();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
  };

  const extendTime = async () => {
    if (!extendMinutes || extendMinutes <= 0) { showMsg('Enter valid minutes', true); return; }
    try {
      await api.put('/competition/extend', { minutes: Number(extendMinutes) });
      showMsg(`Extended by ${extendMinutes} minutes`);
      setExtendMinutes(30);
      fetchStatus();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
  };

  const toggleFreeze = async () => {
    try {
      if (leaderboardFrozen) {
        await api.put('/competition/unfreeze');
        showMsg('Leaderboard unfrozen');
      } else {
        await api.put('/competition/freeze');
        showMsg('Leaderboard frozen');
      }
      fetchStatus();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
  };

  const resetComp = async () => {
    if (!confirm('Reset the entire competition? This cannot be undone.')) return;
    try {
      await api.delete('/competition/reset');
      showMsg('Competition reset');
      setStartTime('');
      setEndTime('');
      fetchStatus();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed', true); }
  };

  const statusConfig = {
    'not-started': { label: 'STANDBY', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    'active': { label: 'LIVE', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    'paused': { label: 'HOLD', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    'ended': { label: 'COMPLETE', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  };
  const sc = statusConfig[status] || statusConfig['not-started'];

  return (
    <div className="p-8">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="font-teko text-3xl font-bold text-white tracking-wide flex items-center gap-2">
          <Settings className="h-6 w-6 text-green-400" />OPERATIONS CENTER
        </h1>
        <p className="text-gray-600 text-xs mt-0.5">Control competition state and parameters</p>
      </div>

      {(error || success) && (
        <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm animate-fade-in ${error ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-green-500/10 border border-green-500/30 text-green-400'}`}>
          {error ? <AlertTriangle className="h-4 w-4" /> : null}{error || success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="glass-card-static rounded-xl p-6 animate-fade-in-up stagger-1">
          <h2 className="font-teko text-lg font-semibold text-white tracking-wide mb-4">STATUS</h2>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${sc.bg} ${sc.color} mb-4`}>
            <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-400 animate-pulse' : status === 'paused' ? 'bg-orange-400' : status === 'ended' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
            <span className="font-teko text-lg font-bold tracking-wider">{sc.label}</span>
          </div>
          {(status === 'active' || status === 'paused') && (
            <div className="mt-2">
              <div className={`flex items-center gap-2 font-mono text-2xl font-bold px-3 py-2 rounded-lg glass-input inline-flex ${status === 'active' ? 'text-green-400 animate-glow-pulse' : 'text-orange-400'}`}>
                <Clock className="h-5 w-5" />{formattedTime}
              </div>
            </div>
          )}
          <div className="mt-4 flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${leaderboardFrozen ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-gray-500/10 border-gray-500/20 text-gray-500'}`}>
              {leaderboardFrozen ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              {leaderboardFrozen ? 'Intel Frozen' : 'Intel Live'}
            </span>
          </div>
        </div>

        {/* Schedule & Actions Card */}
        <div className="glass-card-static rounded-xl p-6 animate-fade-in-up stagger-2">
          <h2 className="font-teko text-lg font-semibold text-white tracking-wide mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-400" />SCHEDULE & ACTIONS
          </h2>

          {/* Datetime pickers — always visible so admin can adjust */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none"
              />
            </div>
            <button onClick={saveSettings} className="w-full py-2.5 btn-outline rounded-lg text-sm flex items-center justify-center gap-2">
              <Save className="h-4 w-4" />Save Settings
            </button>
          </div>

          {/* Action buttons based on status */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-green-500/10">
            {status === 'not-started' && competition && (
              <button onClick={startComp} className="col-span-2 py-3 btn-green rounded-lg text-sm tracking-wide flex items-center justify-center gap-2">
                <Play className="h-4 w-4" />START MISSION
              </button>
            )}
            {status === 'active' && <>
              <button onClick={pauseComp} className="py-2.5 btn-outline rounded-lg text-sm flex items-center justify-center gap-2"><Pause className="h-4 w-4" />Pause</button>
              <button onClick={endComp} className="py-2.5 bg-red-500/15 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-red-500/25 transition-colors"><Square className="h-4 w-4" />End</button>
            </>}
            {status === 'paused' && <>
              <button onClick={resumeComp} className="py-2.5 btn-green rounded-lg text-sm flex items-center justify-center gap-2"><Play className="h-4 w-4" />Resume</button>
              <button onClick={endComp} className="py-2.5 bg-red-500/15 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-red-500/25 transition-colors"><Square className="h-4 w-4" />End</button>
            </>}
            {(status === 'active' || status === 'paused') && (
              <button onClick={toggleFreeze} className="col-span-2 py-2.5 btn-outline rounded-lg text-sm flex items-center justify-center gap-2 mt-1">
                {leaderboardFrozen ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {leaderboardFrozen ? 'Unfreeze Intel' : 'Freeze Intel'}
              </button>
            )}
          </div>
        </div>

        {/* Tools Card */}
        <div className="glass-card-static rounded-xl p-6 animate-fade-in-up stagger-3">
          <h2 className="font-teko text-lg font-semibold text-white tracking-wide mb-4">TOOLS</h2>
          {(status === 'active' || status === 'paused') && (
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Extend Time (min)</label>
              <div className="flex gap-2">
                <input type="number" value={extendMinutes} onChange={(e) => setExtendMinutes(e.target.value)}
                  className="flex-1 px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none font-mono" />
                <button onClick={extendTime} className="px-4 py-2.5 btn-green rounded-lg text-sm tracking-wide flex items-center gap-1">
                  <Clock className="h-4 w-4" />Extend
                </button>
              </div>
            </div>
          )}
          <div className="pt-4 border-t border-green-500/10">
            <button onClick={resetComp} className="w-full py-2.5 bg-red-500/15 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-red-500/25 transition-colors">
              <RotateCcw className="h-4 w-4" />RESET ALL
            </button>
            <p className="text-gray-700 text-xs mt-2 text-center">This action is irreversible</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionControl;
