import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import socket from '../../lib/socket';
import { useCompetition } from '../../context/CompetitionContext';
import { useAuth } from '../../context/AuthContext';
import { Target, Users, ArrowRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const difficultyColors = {
  easy:   'bg-teal-500/20 text-teal-400 border-teal-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hard:   'bg-red-500/20 text-red-400 border-red-500/30',
};

const ChallengeBoard = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [solvedMap, setSolvedMap]   = useState({});
  const { status }  = useCompetition();
  const { user }    = useAuth();

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
    if (status === 'active') fetchChallenges();
    else setLoading(false);
  }, [status]);

  useEffect(() => {
    const handleUpdate = () => {
      if (status === 'active') {
        api.get('/challenges').then(({ data }) => setChallenges(data.data)).catch(() => {});
      }
    };
    socket.on('challenges:updated', handleUpdate);
    return () => socket.off('challenges:updated', handleUpdate);
  }, [status]);

  useEffect(() => {
    const fetchSolved = async () => {
      if (user?.role !== 'team') return;
      try {
        const { data } = await api.get('/teams/me');
        const map = {};
        data.data.solvedChallenges.forEach(sc => { map[sc.challengeId] = sc.solvedAt; });
        setSolvedMap(map);
      } catch (err) { console.error('Failed to fetch team data:', err); }
    };
    if (status === 'active') fetchSolved();
  }, [status, user]);

  const categories = ['all', ...new Set(challenges.map((c) => c.category))];
  const filtered   = filter === 'all' ? challenges : challenges.filter((c) => c.category === filter);

  /* ── Status gate ── */
  if (status !== 'active') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          {/* Pulsing icon for "live" feel */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-pulse-ring" />
            <AlertTriangle className="relative h-16 w-16 text-amber-500/80" />
          </div>
          <h2 className="font-teko text-3xl font-bold text-white mb-2 tracking-widest">
            {status === 'paused'
              ? 'MISSION ON HOLD'
              : status === 'ended'
              ? 'MISSION COMPLETE'
              : 'AWAITING ORDERS'}
          </h2>
          <p className="text-purple-300 text-sm max-w-xs mx-auto">
            {status === 'paused'
              ? 'The competition is currently paused. Stand by...'
              : status === 'ended'
              ? 'The competition has ended. Check the leaderboard!'
              : 'Challenges will deploy when the mission begins.'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="font-teko text-4xl font-bold text-white mb-1 tracking-widest">
          CHALLENGES
        </h1>
        <p className="text-purple-300 text-sm tracking-wide">
          Complete objectives. Earn intel. Climb the ranks.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up stagger-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 capitalize border ${
              filter === cat
                ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                : 'bg-transparent text-purple-300/60 border-purple-900/50 hover:border-purple-500/30 hover:text-purple-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((challenge, index) => (
          <Link
            key={challenge._id}
            to={`/challenges/${challenge._id}`}
            className={`group glass-card reticle-full rounded-xl p-6 animate-fade-in-up stagger-${Math.min(index + 2, 9)} ${
              solvedMap[challenge._id] ? 'border-teal-500/30' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${difficultyColors[challenge.difficulty]}`}>
                  {challenge.difficulty}
                </span>
                {solvedMap[challenge._id] && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-500/15 text-teal-400 border border-teal-500/30">
                    <CheckCircle className="h-3 w-3" />
                    Cleared
                  </span>
                )}
              </div>
              <span className="text-2xl font-bold text-purple-400 font-mono text-glow">
                {challenge.points}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-200">
              {challenge.title}
            </h3>

            <p className="text-sm text-purple-200/60 mb-4 line-clamp-2">
              {challenge.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-purple-300/50">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />{challenge.category}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />{challenge.solvedBy} solved
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-purple-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-200" />
            </div>

            {solvedMap[challenge._id] && (
              <div className="mt-3 pt-3 border-t border-teal-500/15 flex items-center gap-1.5 text-xs text-teal-400/60">
                <Clock className="h-3 w-3" />
                Solved at {new Date(solvedMap[challenge._id]).toLocaleString()}
              </div>
            )}
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-purple-300/40 text-sm">
          No challenges found in this category.
        </div>
      )}
    </div>
  );
};

export default ChallengeBoard;