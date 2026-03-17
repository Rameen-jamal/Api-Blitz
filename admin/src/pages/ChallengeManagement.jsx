import { useState, useEffect } from 'react';
import api from '../lib/api';
import socket from '../lib/socket';
import { Target, Plus, Edit, Trash2, X, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';

const ChallengeManagement = () => {
  const [challenges, setChallenges]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: '', difficulty: 'easy', points: 100, flag: '', apiEndpoint: '', hints: '', isActive: true });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const fetchChallenges = async () => {
    try { const { data } = await api.get('/challenges'); setChallenges(data.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchChallenges(); }, []);
  useEffect(() => { socket.on('challenges:updated', fetchChallenges); return () => socket.off('challenges:updated', fetchChallenges); }, []);

  const showMsg = (msg, isErr = false) => {
    if (isErr) { setError(msg); setSuccess(''); } else { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const resetForm = () => setForm({ title: '', description: '', category: '', difficulty: 'easy', points: 100, flag: '', apiEndpoint: '', hints: '', isActive: true });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const payload = { ...form, points: Number(form.points), hints: form.hints ? form.hints.split('\n').filter(h => h.trim()) : [] };
    try {
      if (editingChallenge) { await api.put(`/challenges/${editingChallenge._id}`, payload); showMsg('Challenge updated'); }
      else { await api.post('/challenges', payload); showMsg('Challenge deployed'); }
      setShowForm(false); setEditingChallenge(null); resetForm(); fetchChallenges();
    } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
  };

  const startEdit = (c) => {
    setEditingChallenge(c);
    setForm({ title: c.title, description: c.description, category: c.category, difficulty: c.difficulty, points: c.points, flag: c.flag || '', apiEndpoint: c.apiEndpoint, hints: (c.hints || []).join('\n'), isActive: c.isActive });
    setShowForm(true); setError('');
  };

  const deleteChallenge = async (id) => {
    if (!confirm('Delete this challenge?')) return;
    try { await api.delete(`/challenges/${id}`); showMsg('Challenge deleted'); fetchChallenges(); }
    catch (err) { showMsg(err.response?.data?.message || 'Delete failed', true); }
  };

  const toggleChallenge = async (id) => {
    try { const { data } = await api.put(`/challenges/${id}/toggle`); showMsg(`Challenge ${data.data.isActive ? 'enabled' : 'disabled'}`); fetchChallenges(); }
    catch (err) { showMsg('Toggle failed', true); }
  };

  const diffColors = {
    easy:   'bg-teal-500/15 text-teal-400 border-teal-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    hard:   'bg-red-500/15 text-red-400 border-red-500/20',
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="font-teko text-3xl font-bold text-white tracking-widest flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-400" />MISSION OBJECTIVES
          </h1>
          <p className="text-purple-300/50 text-xs mt-0.5 tracking-wide">Create and manage API challenges</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingChallenge(null); resetForm(); setError(''); }}
          className="px-4 py-2.5 btn-purple rounded-lg flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" />ADD CHALLENGE
        </button>
      </div>

      {(error || success) && (
        <div className={`mb-4 p-3 rounded-lg text-sm animate-fade-in ${error ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-teal-500/10 border border-teal-500/30 text-teal-400'}`}>
          {error || success}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="modal-content rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-teko text-xl font-semibold text-white tracking-widest">{editingChallenge ? 'EDIT CHALLENGE' : 'NEW CHALLENGE'}</h2>
              <button onClick={() => { setShowForm(false); setEditingChallenge(null); }} className="text-purple-400/50 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-fade-in">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { label: 'Title', field: 'title', type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="block text-xs text-purple-300/60 mb-1 uppercase tracking-widest">{label}</label>
                  <input type={type} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required
                    className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-purple-300/60 mb-1 uppercase tracking-widest">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3}
                  className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-purple-300/60 mb-1 uppercase tracking-widest">Category</label>
                  <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required
                    className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-purple-300/60 mb-1 uppercase tracking-widest">Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none">
                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-purple-300/60 mb-1 uppercase tracking-widest">Points</label>
                  <input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} required
                    className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-purple-300/60 mb-1 uppercase tracking-widest">Flag</label>
                  <input type="text" value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })} required
                    className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm font-mono focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-purple-300/60 mb-1 uppercase tracking-widest">API Endpoint</label>
                <input type="text" value={form.apiEndpoint} onChange={(e) => setForm({ ...form, apiEndpoint: e.target.value })} required
                  className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm font-mono focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-purple-300/60 mb-1 uppercase tracking-widest">Hints (one per line)</label>
                <textarea value={form.hints} onChange={(e) => setForm({ ...form, hints: e.target.value })} rows={2}
                  className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none resize-none" />
              </div>
              <div className="flex items-center justify-between px-3 py-3 glass-input rounded-lg">
                <div className="flex items-center gap-2">
                  {form.isActive ? <Eye className="h-4 w-4 text-teal-400" /> : <EyeOff className="h-4 w-4 text-purple-400/40" />}
                  <span className="text-sm text-purple-200">Visible to participants</span>
                </div>
                <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-purple-500/40' : 'bg-purple-900/50'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform ${form.isActive ? 'bg-purple-400' : 'bg-purple-600/50'}`}
                    style={{ transform: form.isActive ? 'translateX(22px)' : 'translateX(2px)' }}></div>
                </button>
              </div>
              <button type="submit" className="w-full py-2.5 btn-purple rounded-lg text-sm mt-2">
                {editingChallenge ? 'SAVE CHANGES' : 'DEPLOY CHALLENGE'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card-static rounded-xl overflow-x-auto animate-fade-in-up stagger-1">
        <table className="admin-table min-w-full">
          <thead>
            <tr>
              <th>Challenge</th><th>Category</th>
              <th className="text-center">Difficulty</th><th className="text-center">Points</th>
              <th className="text-center">Solved</th><th className="text-center">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((c) => (
              <tr key={c._id}>
                <td>
                  <div className="text-white font-medium text-sm">{c.title}</div>
                  <div className="text-purple-300/40 text-xs truncate max-w-xs">{c.description}</div>
                </td>
                <td className="text-purple-200/60 text-sm">{c.category}</td>
                <td className="text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${diffColors[c.difficulty]}`}>{c.difficulty}</span>
                </td>
                <td className="text-center font-mono font-bold text-purple-400 text-sm">{c.points}</td>
                <td className="text-center text-purple-200/60 text-sm">{c.solvedBy}</td>
                <td className="text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
                    {c.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => startEdit(c)}
                      className="px-2 py-1.5 rounded-lg text-purple-300/50 hover:text-purple-300 hover:bg-purple-500/10 transition-all flex items-center gap-1 text-xs">
                      <Edit className="h-4 w-4" />Edit
                    </button>
                    <button onClick={() => toggleChallenge(c._id)}
                      className={`px-2 py-1.5 rounded-lg transition-all flex items-center gap-1 text-xs ${c.isActive ? 'text-teal-400 hover:text-orange-400 hover:bg-orange-500/10' : 'text-orange-400 hover:text-teal-400 hover:bg-teal-500/10'}`}>
                      {c.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      {c.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => deleteChallenge(c._id)}
                      className="px-2 py-1.5 rounded-lg text-purple-300/50 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-1 text-xs">
                      <Trash2 className="h-4 w-4" />Del
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {challenges.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-purple-400/30">No challenges created yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChallengeManagement;