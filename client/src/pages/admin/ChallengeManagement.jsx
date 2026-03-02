import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Target, Plus, Edit, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react';

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', difficulty: 'easy', points: '',
    category: '', apiEndpoint: '', flag: '', uniqueFlagPerTeam: false
  });
  const [error, setError] = useState('');

  const fetchChallenges = async () => {
    try {
      const { data } = await api.get('/challenges');
      setChallenges(data.data);
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChallenges(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.description || !form.points || !form.category || !form.apiEndpoint || !form.flag) {
      setError('All fields are required');
      return;
    }

    try {
      const payload = {
        ...form,
        points: Number(form.points)
      };

      if (editingChallenge) {
        await api.put(`/challenges/${editingChallenge._id}`, payload);
      } else {
        await api.post('/challenges', payload);
      }

      setShowForm(false);
      setEditingChallenge(null);
      setForm({ title: '', description: '', difficulty: 'easy', points: '', category: '', apiEndpoint: '', flag: '', uniqueFlagPerTeam: false });
      fetchChallenges();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const startEdit = (challenge) => {
    setEditingChallenge(challenge);
    setForm({
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      points: String(challenge.points),
      category: challenge.category,
      apiEndpoint: challenge.apiEndpoint,
      flag: challenge.flag,
      uniqueFlagPerTeam: challenge.uniqueFlagPerTeam
    });
    setShowForm(true);
    setError('');
  };

  const toggleChallenge = async (id) => {
    try {
      await api.put(`/challenges/${id}/toggle`);
      fetchChallenges();
    } catch (err) {
      console.error('Failed to toggle challenge:', err);
    }
  };

  const deleteChallenge = async (id) => {
    if (!confirm('Delete this challenge?')) return;
    try {
      await api.delete(`/challenges/${id}`);
      fetchChallenges();
    } catch (err) {
      console.error('Failed to delete challenge:', err);
    }
  };

  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    hard: 'bg-red-500/20 text-red-400'
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
          <Target className="h-6 w-6 text-purple-400" />
          Challenge Management
        </h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingChallenge(null);
            setForm({ title: '', description: '', difficulty: 'easy', points: '', category: '', apiEndpoint: '', flag: '', uniqueFlagPerTeam: false });
            setError('');
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Challenge
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg mx-4 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {editingChallenge ? 'Edit Challenge' : 'Add Challenge'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingChallenge(null); }} className="text-gray-400 hover:text-white">
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
                <label className="block text-sm text-gray-300 mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Points</label>
                  <input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} required min="0" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">API Endpoint</label>
                <input type="text" value={form.apiEndpoint} onChange={(e) => setForm({ ...form, apiEndpoint: e.target.value })} required className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Flag</label>
                <input type="text" value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })} required className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="uniqueFlag" checked={form.uniqueFlagPerTeam} onChange={(e) => setForm({ ...form, uniqueFlagPerTeam: e.target.checked })} className="rounded border-gray-600" />
                <label htmlFor="uniqueFlag" className="text-sm text-gray-300">Unique flag per team</label>
              </div>
              <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                {editingChallenge ? 'Save Changes' : 'Create Challenge'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Challenge Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Title</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Difficulty</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Points</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Category</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Solved</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {challenges.map((challenge) => (
              <tr key={challenge._id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{challenge.title}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColors[challenge.difficulty]}`}>
                    {challenge.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-mono text-purple-400">{challenge.points}</td>
                <td className="px-6 py-4 text-center text-gray-400">{challenge.category}</td>
                <td className="px-6 py-4 text-center text-gray-400">{challenge.solvedBy}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    challenge.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {challenge.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => startEdit(challenge)} className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => toggleChallenge(challenge._id)} className="p-1.5 text-gray-400 hover:text-green-400 transition-colors" title="Toggle">
                      {challenge.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                    <button onClick={() => deleteChallenge(challenge._id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {challenges.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No challenges created yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChallengeManagement;
