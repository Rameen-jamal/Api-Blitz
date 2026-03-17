import { useState, useEffect } from 'react';
import api from '../../lib/api';
import socket from '../../lib/socket';
import { useCompetition } from '../../context/CompetitionContext';
import { Trophy, Medal, AlertTriangle } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);
  const { leaderboardFrozen }         = useCompetition();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/leaderboard');
        setLeaderboard(data.data);
      } catch (err) { console.error('Failed to fetch leaderboard:', err); }
      finally { setLoading(false); }
    };
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const handleUpdate = (teams) => {
      if (!leaderboardFrozen) {
        const sorted = [...teams].map(t => {
          const lastSolvedAt = t.solvedChallenges?.length > 0
            ? new Date(Math.max(...t.solvedChallenges.map(sc => new Date(sc.solvedAt).getTime())))
            : null;
          return {
            teamName: t.teamName, score: t.score,
            challengesSolved: t.solvedChallenges?.length || 0,
            lastSolvedAt: lastSolvedAt ? lastSolvedAt.toISOString() : null,
          };
        }).sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (!a.lastSolvedAt && !b.lastSolvedAt) return 0;
          if (!a.lastSolvedAt) return 1;
          if (!b.lastSolvedAt) return -1;
          return new Date(a.lastSolvedAt) - new Date(b.lastSolvedAt);
        }).map((t, i) => ({ ...t, rank: i + 1 }));
        setLeaderboard(sorted);
      }
    };
    socket.on('leaderboard:update', handleUpdate);
    return () => socket.off('leaderboard:update', handleUpdate);
  }, [leaderboardFrozen]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="h-5 w-5" style={{ color: '#FFB800', filter: 'drop-shadow(0 0 6px rgba(255,184,0,0.7))' }} />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-500" />;
    return <span className="w-5 text-center text-purple-400 font-mono text-sm">{rank}</span>;
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="font-teko text-4xl font-bold text-white mb-1 tracking-widest flex items-center gap-3">
          <Trophy className="h-8 w-8" style={{ color: '#FFB800', filter: 'drop-shadow(0 0 8px rgba(255,184,0,0.6))' }} />
          LEADERBOARD
        </h1>
        <p className="text-purple-300 text-sm tracking-wide">
          Live operational standings — updated in real-time
        </p>
      </div>

      {/* Frozen Banner */}
      {leaderboardFrozen && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-amber-400 font-teko text-lg font-semibold tracking-widest">INTEL CLASSIFIED</p>
            <p className="text-amber-300/70 text-sm">
              Scores are frozen. Final standings will be revealed after the mission.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card-static rounded-xl overflow-hidden animate-fade-in-up stagger-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-purple-500/30">
              <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-widest w-16">Rank</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-widest">Team</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-purple-300 uppercase tracking-widest">Solved</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-purple-300 uppercase tracking-widest">Last Solve</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-purple-300 uppercase tracking-widest">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/20">
            {leaderboard.map((entry, index) => (
              <tr
                key={entry.rank}
                className={`transition-all duration-200 hover:bg-purple-500/8 animate-fade-in-up stagger-${Math.min(index + 2, 9)} ${
                  entry.rank <= 3 ? 'bg-purple-500/5' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${
                    entry.rank === 1 ? 'text-glow-amber'
                      : entry.rank === 2 ? 'text-slate-200'
                      : entry.rank === 3 ? 'text-amber-500'
                      : 'text-white'
                  }`}>
                    {entry.teamName}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-purple-200 font-mono text-sm">
                  {entry.challengesSolved}
                </td>
                <td className="px-6 py-4 text-center text-purple-300/70 text-xs font-mono">
                  {entry.lastSolvedAt ? new Date(entry.lastSolvedAt).toLocaleTimeString() : '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-mono font-bold text-purple-400 text-glow text-lg">
                    {entry.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leaderboard.length === 0 && (
          <div className="text-center py-12 text-purple-300/50 text-sm">
            No teams on the leaderboard yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;