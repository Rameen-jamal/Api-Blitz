import { useState, useEffect } from 'react';
import api from '../lib/api';
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
        const [subRes, teamRes, chalRes] = await Promise.all([api.get('/submissions'), api.get('/teams'), api.get('/challenges')]);
        setSubmissions(subRes.data.data); setTeams(teamRes.data.data); setChallenges(chalRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const fetchSubmissions = async () => {
    try { const params = {}; if (filterTeam) params.teamId = filterTeam; if (filterChallenge) params.challengeId = filterChallenge; const { data } = await api.get('/submissions', { params }); setSubmissions(data.data); }
    catch (err) { console.error(err); }
  };
  useEffect(() => { if (!loading) fetchSubmissions(); }, [filterTeam, filterChallenge]);

  const adjustScore = async (teamId) => {
    const newScore = scoreAdjust[teamId]; if (newScore === undefined || newScore === '') return;
    try { await api.put(`/teams/${teamId}`, { score: Number(newScore) }); setScoreAdjust(prev => ({ ...prev, [teamId]: '' })); const { data } = await api.get('/teams'); setTeams(data.data); }
    catch (err) { console.error(err); }
  };

  if (loading) return (<div className="flex-1 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>);

  return (
    <div className="p-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-teko text-3xl font-bold text-white tracking-wide flex items-center gap-2">
          <FileText className="h-6 w-6 text-green-400" />INTEL FEED
        </h1>
        <p className="text-gray-600 text-xs mt-0.5">Monitor all flag submissions and adjust scores</p>
      </div>

      {/* Filters */}
      <div className="glass-card-static rounded-xl p-4 mb-6 animate-fade-in-up stagger-1">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="h-4 w-4 text-gray-600" />
          <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}
            className="px-3 py-2 glass-input rounded-lg text-white text-sm focus:outline-none">
            <option value="">All Teams</option>{teams.map(t => (<option key={t._id} value={t._id}>{t.teamName}</option>))}
          </select>
          <select value={filterChallenge} onChange={(e) => setFilterChallenge(e.target.value)}
            className="px-3 py-2 glass-input rounded-lg text-white text-sm focus:outline-none">
            <option value="">All Challenges</option>{challenges.map(c => (<option key={c._id} value={c._id}>{c.title}</option>))}
          </select>
        </div>
      </div>

      {/* Score Adjustment */}
      <div className="glass-card-static rounded-xl p-5 mb-6 animate-fade-in-up stagger-2">
        <h3 className="font-teko text-lg font-semibold text-white tracking-wide mb-3">MANUAL SCORE OVERRIDE</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teams.map(team => (
            <div key={team._id} className="flex items-center gap-2">
              <span className="text-sm text-gray-400 w-28 truncate">{team.teamName}</span>
              <span className="text-xs text-gray-600 font-mono">({team.score})</span>
              <input type="number" value={scoreAdjust[team._id] || ''} onChange={(e) => setScoreAdjust(prev => ({ ...prev, [team._id]: e.target.value }))}
                placeholder="New" className="flex-1 px-2 py-1.5 glass-input rounded text-white text-sm font-mono focus:outline-none placeholder-gray-600" />
              <button onClick={() => adjustScore(team._id)} className="p-1.5 btn-green rounded transition-colors" title="Save"><Save className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="glass-card-static rounded-xl overflow-x-auto animate-fade-in-up stagger-3">
        <table className="admin-table">
          <thead><tr><th>Team</th><th>Challenge</th><th>Submitted Flag</th><th className="text-center">Result</th><th className="text-right">Time</th></tr></thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub._id}>
                <td className="text-white text-sm font-medium">{sub.teamId?.teamName || 'Unknown'}</td>
                <td className="text-gray-400 text-sm">{sub.challengeId?.title || 'Unknown'}</td>
                <td className="text-gray-500 text-sm font-mono max-w-xs truncate">{sub.submittedFlag}</td>
                <td className="text-center">
                  {sub.isCorrect
                    ? <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/15 text-green-400 rounded-full text-xs border border-green-500/20"><Check className="h-3 w-3" />Hit</span>
                    : <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/15 text-red-400 rounded-full text-xs border border-red-500/20"><X className="h-3 w-3" />Miss</span>
                  }
                </td>
                <td className="text-right text-gray-600 text-xs">{new Date(sub.attemptedAt).toLocaleString()}</td>
              </tr>
            ))}
            {submissions.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-600">No submissions yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionsMonitor;
