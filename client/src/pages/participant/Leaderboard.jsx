import { useState, useEffect } from 'react';
import api from '../../lib/api';
import socket from '../../lib/socket';
import { useCompetition } from '../../context/CompetitionContext';
import { Trophy, Medal, AlertTriangle } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { leaderboardFrozen } = useCompetition();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/leaderboard');
        setLeaderboard(data.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
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
            teamName: t.teamName,
            score: t.score,
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
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 text-center text-gray-500 font-mono">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-400" />
          Leaderboard
        </h1>
        <p className="text-gray-400">Real-time competition standings</p>
      </div>

      {/* Frozen Banner */}
      {leaderboardFrozen && (
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0" />
          <div>
            <p className="text-orange-400 font-semibold">LEADERBOARD FROZEN</p>
            <p className="text-orange-300/70 text-sm">
              Scores are frozen. Final standings will be revealed after the competition.
            </p>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-16">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Solved
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Last Solve
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {leaderboard.map((entry) => (
              <tr
                key={entry.rank}
                className={`transition-colors hover:bg-gray-800/50 ${
                  entry.rank <= 3 ? 'bg-gray-800/20' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${
                    entry.rank === 1
                      ? 'text-yellow-400'
                      : entry.rank === 2
                      ? 'text-gray-200'
                      : entry.rank === 3
                      ? 'text-amber-500'
                      : 'text-gray-300'
                  }`}>
                    {entry.teamName}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-gray-400">
                  {entry.challengesSolved}
                </td>
                <td className="px-6 py-4 text-center text-gray-500 text-xs">
                  {entry.lastSolvedAt
                    ? new Date(entry.lastSolvedAt).toLocaleTimeString()
                    : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-mono font-bold text-blue-400">{entry.score}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leaderboard.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No teams on the leaderboard yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
