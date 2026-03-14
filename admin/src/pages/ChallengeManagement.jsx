import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Target, Plus, Edit, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: '', difficulty: 'easy', points: 100, flag: '', apiEndpoint: '', hints: '' });
  const [error, setError] = useState('');

  const fetchChallenges = async () => { try { const { data } = await api.get('/challenges'); setChallenges(data.data); } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchChallenges(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const payload = { ...form, points: Number(form.points), hints: form.hints ? form.hints.split('\n').filter(h => h.trim()) : [] };
    try {
      if (editingChallenge) { await api.put(`/challenges/${editingChallenge._id}`, payload); }
      else { await api.post('/challenges', payload); }
      setShowForm(false); setEditingChallenge(null); setForm({ title: '', description: '', category: '', difficulty: 'easy', points: 100, flag: '', apiEndpoint: '', hints: '' }); fetchChallenges();
    } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
  };

  const startEdit = (c) => { setEditingChallenge(c); setForm({ title: c.title, description: c.description, category: c.category, difficulty: c.difficulty, points: c.points, flag: c.flag || '', apiEndpoint: c.apiEndpoint, hints: (c.hints || []).join('\n') }); setShowForm(true); setError(''); };
  const deleteChallenge = async (id) => { if (!confirm('Delete this challenge?')) return; try { await api.delete(`/challenges/${id}`); fetchChallenges(); } catch (err) { console.error(err); } };
  const toggleChallenge = async (id) => { try { await api.put(`/challenges/${id}/toggle`); fetchChallenges(); } catch (err) { console.error(err); } };

  const diffColors = { easy: 'bg-green-500/15 text-green-400 border-green-500/20', medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20', hard: 'bg-red-500/15 text-red-400 border-red-500/20' };

  if (loading) return (<div className="flex-1 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="font-teko text-3xl font-bold text-white tracking-wide flex items-center gap-2"><Target className="h-6 w-6 text-green-400" />MISSION OBJECTIVES</h1>
          <p className="text-gray-600 text-xs mt-0.5">Create and manage API challenges</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingChallenge(null); setForm({ title: '', description: '', category: '', difficulty: 'easy', points: 100, flag: '', apiEndpoint: '', hints: '' }); setError(''); }}
          className="px-4 py-2.5 btn-green rounded-lg flex items-center gap-2 text-sm tracking-wide"><Plus className="h-4 w-4" />ADD CHALLENGE</button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="modal-content rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-teko text-xl font-semibold text-white tracking-wide">{editingChallenge ? 'EDIT CHALLENGE' : 'NEW CHALLENGE'}</h2>
              <button onClick={() => { setShowForm(false); setEditingChallenge(null); }} className="text-gray-500 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-fade-in">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none" /></div>
              <div><label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Category</label><input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none" /></div>
                <div><label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Difficulty</label><select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Points</label><input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} required className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none" /></div>
                <div><label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Flag</label><input type="text" value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })} required className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm font-mono focus:outline-none" /></div>
              </div>
              <div><label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">API Endpoint</label><input type="text" value={form.apiEndpoint} onChange={(e) => setForm({ ...form, apiEndpoint: e.target.value })} required className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm font-mono focus:outline-none" /></div>
              <div><label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Hints (one per line)</label><textarea value={form.hints} onChange={(e) => setForm({ ...form, hints: e.target.value })} rows={2} className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none resize-none" /></div>
              <button type="submit" className="w-full py-2.5 btn-green rounded-lg text-sm tracking-wide mt-2">{editingChallenge ? 'SAVE CHANGES' : 'DEPLOY CHALLENGE'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card-static rounded-xl overflow-hidden animate-fade-in-up stagger-1">
        <table className="admin-table">
          <thead><tr><th>Challenge</th><th>Category</th><th className="text-center">Difficulty</th><th className="text-center">Points</th><th className="text-center">Solved</th><th className="text-center">Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {challenges.map((c) => (
              <tr key={c._id}>
                <td><div className="text-white font-medium text-sm">{c.title}</div><div className="text-gray-600 text-xs truncate max-w-xs">{c.description}</div></td>
                <td className="text-gray-400 text-sm">{c.category}</td>
                <td className="text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${diffColors[c.difficulty]}`}>{c.difficulty}</span></td>
                <td className="text-center font-mono font-bold text-green-400 text-sm">{c.points}</td>
                <td className="text-center text-gray-500 text-sm">{c.solvedBy}</td>
                <td className="text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>{c.isActive ? 'Active' : 'Hidden'}</span></td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => startEdit(c)} className="p-1.5 text-gray-600 hover:text-green-400 transition-colors"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => toggleChallenge(c._id)} className="p-1.5 text-gray-600 hover:text-green-400 transition-colors">{c.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}</button>
                    <button onClick={() => deleteChallenge(c._id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {challenges.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-600">No challenges created yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChallengeManagement;
