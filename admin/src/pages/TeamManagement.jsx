import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Users, Plus, Edit, RotateCcw, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [resetPasswordId, setResetPasswordId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [form, setForm] = useState({ teamName: '', username: '', password: '', member1: '', member2: '', member3: '' });
  const [error, setError] = useState('');

  const fetchTeams = async () => {
    try { const { data } = await api.get('/teams'); setTeams(data.data); }
    catch (err) { console.error('Failed to fetch teams:', err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchTeams(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const members = [form.member1, form.member2, form.member3].filter(m => m.trim());
    try {
      if (editingTeam) { await api.put(`/teams/${editingTeam._id}`, { teamName: form.teamName, username: form.username, members }); }
      else { if (!form.password) { setError('Password is required'); return; } await api.post('/teams', { teamName: form.teamName, username: form.username, password: form.password, members }); }
      setShowForm(false); setEditingTeam(null); setForm({ teamName: '', username: '', password: '', member1: '', member2: '', member3: '' }); fetchTeams();
    } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
  };

  const startEdit = (team) => { setEditingTeam(team); setForm({ teamName: team.teamName, username: team.username, password: '', member1: team.members[0] || '', member2: team.members[1] || '', member3: team.members[2] || '' }); setShowForm(true); setError(''); };
  const toggleTeam = async (id) => { try { await api.put(`/teams/${id}/toggle`); fetchTeams(); } catch (err) { console.error(err); } };
  const deleteTeam = async (id) => { if (!confirm('Delete this team?')) return; try { await api.delete(`/teams/${id}`); fetchTeams(); } catch (err) { console.error(err); } };
  const resetPassword = async (id) => { if (!newPassword.trim()) return; try { await api.put(`/teams/${id}/reset-password`, { password: newPassword }); setResetPasswordId(null); setNewPassword(''); } catch (err) { console.error(err); } };

  if (loading) return (<div className="flex-1 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="font-teko text-3xl font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="h-6 w-6 text-green-400" />TEAM ROSTER
          </h1>
          <p className="text-gray-600 text-xs mt-0.5">Manage participating teams</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingTeam(null); setForm({ teamName: '', username: '', password: '', member1: '', member2: '', member3: '' }); setError(''); }}
          className="px-4 py-2.5 btn-green rounded-lg flex items-center gap-2 text-sm tracking-wide">
          <Plus className="h-4 w-4" />ADD TEAM
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="modal-content rounded-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-teko text-xl font-semibold text-white tracking-wide">{editingTeam ? 'EDIT TEAM' : 'NEW TEAM'}</h2>
              <button onClick={() => { setShowForm(false); setEditingTeam(null); }} className="text-gray-500 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-fade-in">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Team Name</label><input type="text" value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} required className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none" /></div>
              <div><label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Username</label><input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none" /></div>
              {!editingTeam && <div><label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm focus:outline-none" /></div>}
              <div><label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Members (up to 3)</label>
                <div className="space-y-2">
                  <input type="text" value={form.member1} onChange={(e) => setForm({ ...form, member1: e.target.value })} placeholder="Member 1" className="w-full px-3 py-2 glass-input rounded-lg text-white text-sm focus:outline-none placeholder-gray-600" />
                  <input type="text" value={form.member2} onChange={(e) => setForm({ ...form, member2: e.target.value })} placeholder="Member 2" className="w-full px-3 py-2 glass-input rounded-lg text-white text-sm focus:outline-none placeholder-gray-600" />
                  <input type="text" value={form.member3} onChange={(e) => setForm({ ...form, member3: e.target.value })} placeholder="Member 3" className="w-full px-3 py-2 glass-input rounded-lg text-white text-sm focus:outline-none placeholder-gray-600" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 btn-green rounded-lg text-sm tracking-wide mt-2">{editingTeam ? 'SAVE CHANGES' : 'CREATE TEAM'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card-static rounded-xl overflow-hidden animate-fade-in-up stagger-1">
        <table className="admin-table">
          <thead><tr><th>Team</th><th>Members</th><th className="text-center">Score</th><th className="text-center">Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team._id}>
                <td><div className="text-white font-medium text-sm">{team.teamName}</div><div className="text-gray-600 text-xs">@{team.username}</div></td>
                <td className="text-gray-400 text-sm">{team.members.join(', ') || '—'}</td>
                <td className="text-center font-mono font-bold text-green-400 text-sm">{team.score}</td>
                <td className="text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${team.isActive ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>{team.isActive ? 'Active' : 'Disabled'}</span></td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => startEdit(team)} className="p-1.5 text-gray-600 hover:text-green-400 transition-colors" title="Edit"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => { setResetPasswordId(team._id); setNewPassword(''); }} className="p-1.5 text-gray-600 hover:text-yellow-400 transition-colors" title="Reset Password"><RotateCcw className="h-4 w-4" /></button>
                    <button onClick={() => toggleTeam(team._id)} className="p-1.5 text-gray-600 hover:text-green-400 transition-colors" title="Toggle">{team.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}</button>
                    <button onClick={() => deleteTeam(team._id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {teams.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-600">No teams created yet</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Reset Password Modal */}
      {resetPasswordId && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
          <div className="modal-content rounded-2xl p-6 w-full max-w-sm mx-4 animate-scale-in">
            <h2 className="font-teko text-xl font-semibold text-white mb-4 tracking-wide">RESET PASSWORD</h2>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password"
              className="w-full px-3 py-2.5 glass-input rounded-lg text-white text-sm mb-4 focus:outline-none placeholder-gray-600" />
            <div className="flex gap-2">
              <button onClick={() => setResetPasswordId(null)} className="flex-1 py-2.5 btn-outline rounded-lg text-sm">Cancel</button>
              <button onClick={() => resetPassword(resetPasswordId)} className="flex-1 py-2.5 btn-green rounded-lg text-sm">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
