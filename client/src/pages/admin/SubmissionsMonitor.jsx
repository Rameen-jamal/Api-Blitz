import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { FileText, Filter, Check, X, Save } from 'lucide-react';

const SubmissionsMonitor = () => {
  const [submissions, setSubmissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTeam, setFilterTeam] = useState('');
  const [filterChallenge, setFilterChallenge] = useState('');
  const [scoreAdjust, setScoreAdjust] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, teamRes, chalRes] = await Promise.all([
          api.get('/submissions'),
          api.get('/teams'),
          api.get('/challenges')
        ]);
        setSubmissions(subRes.data.data);
        setTeams(teamRes.data.data);
        setChallenges(chalRes.data.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const params = {};
      if (filterTeam) params.teamId = filterTeam;
      if (filterChallenge) params.challengeId = filterChallenge;
      const { data } = await api.get('/submissions', { params });
      setSubmissions(data.data);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
  };

  useEffect(() => {
    if (!loading) fetchSubmissions();
  }, [filterTeam, filterChallenge]);

  const adjustScore = async (teamId) => {
    const newScore = scoreAdjust[teamId];
    if (newScore === undefined || newScore === '') return;

    try {
      await api.put(`/teams/${teamId}`, { score: Number(newScore) });
      setScoreAdjust(prev => ({ ...prev, [teamId]: '' }));
      // Refresh teams
      const { data } = await api.get('/teams');
      setTeams(data.data);
    } catch (err) {
      console.error('Failed to adjust score:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-purple-400" />
        Submissions Monitor
      </h1>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Teams</option>
            {teams.map(t => (
              <option key={t._id} value={t._id}>{t.teamName}</option>
            ))}
          </select>
          <select
            value={filterChallenge}
            onChange={(e) => setFilterChallenge(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Challenges</option>
            {challenges.map(c => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Score Adjustment */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Manually Adjust Team Score</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teams.map(team => (
            <div key={team._id} className="flex items-center gap-2">
              <span className="text-sm text-gray-400 w-28 truncate">{team.teamName}</span>
              <span className="text-xs text-gray-500 font-mono">({team.score})</span>
              <input
                type="number"
                value={scoreAdjust[team._id] || ''}
                onChange={(e) => setScoreAdjust(prev => ({ ...prev, [team._id]: e.target.value }))}
                placeholder="New score"
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={() => adjustScore(team._id)}
                className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                title="Save"
              >
                <Save className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Team</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Challenge</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Submitted Flag</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Result</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {submissions.map((sub) => (
              <tr key={sub._id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-3 text-white text-sm">
                  {sub.teamId?.teamName || 'Unknown'}
                </td>
                <td className="px-6 py-3 text-gray-300 text-sm">
                  {sub.challengeId?.title || 'Unknown'}
                </td>
                <td className="px-6 py-3 text-gray-400 text-sm font-mono max-w-xs truncate">
                  {sub.submittedFlag}
                </td>
                <td className="px-6 py-3 text-center">
                  {sub.isCorrect ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                      <Check className="h-3 w-3" /> Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                      <X className="h-3 w-3" /> Wrong
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 text-right text-gray-500 text-xs">
                  {new Date(sub.attemptedAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No submissions yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionsMonitor;
