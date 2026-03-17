import { useState, useEffect } from 'react';
import api from '../lib/api';
import socket from '../lib/socket';
import { Users, Target, FileText, Activity, Trophy } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats]           = useState({ totalTeams: 0, totalChallenges: 0, activeChallenges: 0, totalSubmissions: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, challengesRes, submissionsRes, leaderboardRes] = await Promise.all([
          api.get('/teams'), api.get('/challenges'), api.get('/submissions'), api.get('/leaderboard')
        ]);
        setStats({
          totalTeams:       teamsRes.data.data.length,
          totalChallenges:  challengesRes.data.data.length,
          activeChallenges: challengesRes.data.data.filter(c => c.isActive).length,
          totalSubmissions: submissionsRes.data.data.length,
        });
        setLeaderboard(leaderboardRes.data.data);
      } catch (err) { console.error('Failed to fetch dashboard data:', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleUpdate = (teams) => {
      const sorted = [...teams].map(t => {
        const lastSolvedAt = t.solvedChallenges?.length > 0
          ? new Date(Math.max(...t.solvedChallenges.map(sc => new Date(sc.solvedAt).getTime()))) : null;
        return { teamName: t.teamName, score: t.score, challengesSolved: t.solvedChallenges?.length || 0,
          lastSolvedAt: lastSolvedAt ? lastSolvedAt.toISOString() : null };
      }).sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (!a.lastSolvedAt && !b.lastSolvedAt) return 0;
        if (!a.lastSolvedAt) return 1; if (!b.lastSolvedAt) return -1;
        return new Date(a.lastSolvedAt) - new Date(b.lastSolvedAt);
      }).map((t, i) => ({ ...t, rank: i + 1 }));
      setLeaderboard(sorted);
    };
    socket.on('leaderboard:update', handleUpdate);
    return () => socket.off('leaderboard:update', handleUpdate);
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
    </div>
  );

  const statCards = [
    { label: 'Total Teams',  value: stats.totalTeams,        icon: Users,     gradient: 'from-purple-500/20 to-violet-500/10', iconColor: 'text-purple-400',  border: 'border-purple-500/20' },
    { label: 'Challenges',   value: stats.totalChallenges,   icon: Target,    gradient: 'from-violet-500/20 to-purple-500/10', iconColor: 'text-violet-400',  border: 'border-violet-500/20' },
    { label: 'Active',       value: stats.activeChallenges,  icon: Activity,  gradient: 'from-teal-500/20 to-purple-500/10',   iconColor: 'text-teal-400',    border: 'border-teal-500/20'   },
    { label: 'Submissions',  value: stats.totalSubmissions,  icon: FileText,  gradient: 'from-fuchsia-500/20 to-purple-500/10',iconColor: 'text-fuchsia-400', border: 'border-fuchsia-500/20'},
  ];

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="font-teko text-4xl font-bold text-white tracking-widest">SITUATION REPORT</h1>
        <p className="text-purple-300/50 text-sm mt-0.5 tracking-wide">Overview of competition operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, gradient, iconColor, border }, index) => (
          <div key={label} className={`glass-card rounded-xl p-5 animate-fade-in-up stagger-${index + 1} border ${border}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white font-mono">{value}</div>
            <div className="text-xs text-purple-300/50 mt-1 uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </div>

      {/* Live Leaderboard */}
      <div className="glass-card-static rounded-xl overflow-x-auto animate-fade-in-up stagger-5">
        <div className="px-6 py-4 border-b border-purple-500/20 flex items-center gap-2">
          <Trophy className="h-5 w-5" style={{ color: '#FFB800', filter: 'drop-shadow(0 0 6px rgba(255,184,0,0.6))' }} />
          <h2 className="font-teko text-xl font-semibold text-white tracking-widest">LIVE LEADERBOARD</h2>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-16">Rank</th>
              <th>Team</th>
              <th className="text-center">Solved</th>
              <th className="text-center">Last Solve</th>
              <th className="text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.rank}>
                <td className="text-purple-400 font-mono text-sm">{entry.rank}</td>
                <td className="text-white font-medium text-sm">{entry.teamName}</td>
                <td className="text-center text-purple-200 text-sm font-mono">{entry.challengesSolved}</td>
                <td className="text-center text-purple-300/50 text-xs font-mono">
                  {entry.lastSolvedAt ? new Date(entry.lastSolvedAt).toLocaleTimeString() : '—'}
                </td>
                <td className="text-right font-mono font-bold text-purple-400 text-sm text-glow">{entry.score}</td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-purple-400/30">No teams yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;