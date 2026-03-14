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
  const [form, setForm] = useState({
    teamName: '', username: '', password: '',
    member1: '', member2: '', member3: ''
  });
  const [error, setError] = useState('');

  const fetchTeams = async () => {
    try {
      const { data } = await api.get('/teams');
      setTeams(data.data);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const members = [form.member1, form.member2, form.member3].filter(m => m.trim());

    try {
      if (editingTeam) {
        await api.put(`/teams/${editingTeam._id}`, {
          teamName: form.teamName,
          username: form.username,
          members
        });
      } else {
        if (!form.password) {
          setError('Password is required');
          return;
        }
        await api.post('/teams', {
          teamName: form.teamName,
          username: form.username,
          password: form.password,
          members
        });
      }
      setShowForm(false);
      setEditingTeam(null);
      setForm({ teamName: '', username: '', password: '', member1: '', member2: '', member3: '' });
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const startEdit = (team) => {
    setEditingTeam(team);
    setForm({
      teamName: team.teamName,
      username: team.username,
      password: '',
      member1: team.members[0] || '',
      member2: team.members[1] || '',
      member3: team.members[2] || '',
    });
    setShowForm(true);
    setError('');
  };

  const toggleTeam = async (id) => {
    try {
      await api.put(`/teams/${id}/toggle`);
      fetchTeams();
    } catch (err) {
      console.error('Failed to toggle team:', err);
    }
  };

  const deleteTeam = async (id) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    try {
      await api.delete(`/teams/${id}`);
      fetchTeams();
    } catch (err) {
      console.error('Failed to delete team:', err);
    }
  };

  const resetPassword = async (id) => {
    if (!newPassword.trim()) return;
    try {
      await api.put(`/teams/${id}/reset-password`, { password: newPassword });
      setResetPasswordId(null);
      setNewPassword('');
    } catch (err) {
      console.error('Failed to reset password:', err);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-400" />
          Team Management
        </h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingTeam(null);
            setForm({ teamName: '', username: '', password: '', member1: '', member2: '', member3: '' });
            setError('');
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Team
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {editingTeam ? 'Edit Team' : 'Add Team'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingTeam(null); }} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Team Name</label>
                <input
                  type="text"
                  value={form.teamName}
                  onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {!editingTeam && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-300 mb-1">Members (up to 3)</label>
                <div className="space-y-2">
                  <input type="text" value={form.member1} onChange={(e) => setForm({ ...form, member1: e.target.value })} placeholder="Member 1" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <input type="text" value={form.member2} onChange={(e) => setForm({ ...form, member2: e.target.value })} placeholder="Member 2" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  <input type="text" value={form.member3} onChange={(e) => setForm({ ...form, member3: e.target.value })} placeholder="Member 3" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                {editingTeam ? 'Save Changes' : 'Create Team'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Teams Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Team</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Members</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Score</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {teams.map((team) => (
              <tr key={team._id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-white font-medium">{team.teamName}</div>
                    <div className="text-gray-500 text-xs">@{team.username}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {team.members.join(', ') || '—'}
                </td>
                <td className="px-6 py-4 text-center font-mono font-bold text-purple-400">{team.score}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    team.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {team.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => startEdit(team)} className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setResetPasswordId(team._id); setNewPassword(''); }} className="p-1.5 text-gray-400 hover:text-yellow-400 transition-colors" title="Reset Password">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button onClick={() => toggleTeam(team._id)} className="p-1.5 text-gray-400 hover:text-green-400 transition-colors" title="Toggle Status">
                      {team.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                    <button onClick={() => deleteTeam(team._id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No teams created yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reset Password Modal */}
      {resetPasswordId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold text-white mb-4">Reset Password</h2>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setResetPasswordId(null)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                Cancel
              </button>
              <button onClick={() => resetPassword(resetPasswordId)} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
