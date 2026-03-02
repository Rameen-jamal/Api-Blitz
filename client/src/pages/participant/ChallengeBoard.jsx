import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useCompetition } from '../../context/CompetitionContext';
import { Target, Users, ArrowRight, AlertTriangle } from 'lucide-react';

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ChallengeBoard = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { status } = useCompetition();

  useEffect(() => {
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

    if (status === 'active') {
      fetchChallenges();
    } else {
      setLoading(false);
    }
  }, [status]);

  const categories = ['all', ...new Set(challenges.map((c) => c.category))];
  const filtered = filter === 'all'
    ? challenges
    : challenges.filter((c) => c.category === filter);

  if (status !== 'active') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {status === 'paused' ? 'Competition Paused' : status === 'ended' ? 'Competition Ended' : 'Competition Not Started'}
          </h2>
          <p className="text-gray-400">
            {status === 'paused'
              ? 'The competition is currently paused. Please wait...'
              : status === 'ended'
              ? 'The competition has ended. Check the leaderboard!'
              : 'Challenges will appear here when the competition begins.'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Challenges</h1>
        <p className="text-gray-400">Solve API challenges to earn points</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((challenge) => (
          <Link
            key={challenge._id}
            to={`/challenges/${challenge._id}`}
            className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 animate-fade-in"
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyColors[challenge.difficulty]}`}>
                {challenge.difficulty}
              </span>
              <span className="text-2xl font-bold text-blue-400">{challenge.points}</span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {challenge.title}
            </h3>

            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {challenge.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {challenge.category}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {challenge.solvedBy} solved
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No challenges found in this category.
        </div>
      )}
    </div>
  );
};

export default ChallengeBoard;
