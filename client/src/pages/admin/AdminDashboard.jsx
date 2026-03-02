import { useState, useEffect } from 'react';
import api from '../../lib/api';
import socket from '../../lib/socket';
import { Users, Target, FileText, TrendingUp, Trophy } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalChallenges: 0,
    activeChallenges: 0,
    totalSubmissions: 0
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, challengesRes, submissionsRes, leaderboardRes] = await Promise.all([
          api.get('/teams'),
          api.get('/challenges'),
          api.get('/submissions'),
          api.get('/leaderboard')
        ]);

        setStats({
          totalTeams: teamsRes.data.data.length,
          totalChallenges: challengesRes.data.data.length,
          activeChallenges: challengesRes.data.data.filter(c => c.isActive).length,
          totalSubmissions: submissionsRes.data.data.length
        });
        setLeaderboard(leaderboardRes.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleUpdate = (teams) => {
      const sorted = [...teams]
        .sort((a, b) => b.score - a.score)
        .map((t, i) => ({
          rank: i + 1,
          teamName: t.teamName,
          score: t.score,
          challengesSolved: t.solvedChallenges?.length || 0
        }));
      setLeaderboard(sorted);
    };

    socket.on('leaderboard:update', handleUpdate);
    return () => socket.off('leaderboard:update', handleUpdate);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Teams', value: stats.totalTeams, icon: Users, color: 'blue' },
    { label: 'Total Challenges', value: stats.totalChallenges, icon: Target, color: 'purple' },
    { label: 'Active Challenges', value: stats.activeChallenges, icon: TrendingUp, color: 'green' },
    { label: 'Total Submissions', value: stats.totalSubmissions, icon: FileText, color: 'orange' },
  ];

  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl border p-6 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-2">
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm opacity-80">{label}</div>
          </div>
        ))}
      </div>

      {/* Live Leaderboard */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">Live Leaderboard</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase w-16">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Team</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Solved</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {leaderboard.map((entry) => (
              <tr key={entry.rank} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-3 text-gray-400 font-mono">{entry.rank}</td>
                <td className="px-6 py-3 text-white font-medium">{entry.teamName}</td>
                <td className="px-6 py-3 text-center text-gray-400">{entry.challengesSolved}</td>
                <td className="px-6 py-3 text-right font-mono font-bold text-purple-400">{entry.score}</td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No teams yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
