import { createContext, useContext, useState, useEffect } from 'react';
import socket from '../lib/socket';
import api from '../lib/api';

const CompetitionContext = createContext(null);

export const useCompetition = () => {
  const context = useContext(CompetitionContext);
  if (!context) throw new Error('useCompetition must be used within CompetitionProvider');
  return context;
};

export const CompetitionProvider = ({ children }) => {
  const [competition, setCompetition] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [leaderboardFrozen, setLeaderboardFrozen] = useState(false);
  const [status, setStatus] = useState('not-started'); // not-started, active, paused, ended

  // Fetch initial competition state
  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const { data } = await api.get('/competition');
        if (data.data) {
          setCompetition(data.data);
          setLeaderboardFrozen(data.data.leaderboardFrozen);
          updateStatus(data.data);
        }
      } catch (e) {
        console.error('Failed to fetch competition:', e);
      }
    };
    fetchCompetition();
  }, []);

  const updateStatus = (comp) => {
    if (!comp) {
      setStatus('not-started');
      return;
    }
    if (!comp.isActive) {
      setStatus('not-started');
    } else if (comp.isPaused) {
      setStatus('paused');
    } else if (new Date(comp.endTime) < new Date()) {
      setStatus('ended');
    } else {
      setStatus('active');
    }
    setLeaderboardFrozen(comp.leaderboardFrozen);
  };

  // Timer countdown
  useEffect(() => {
    if (!competition || status !== 'active') {
      setTimeLeft(null);
      return;
    }

    const tick = () => {
      const end = new Date(competition.endTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);
      setTimeLeft(diff);
      if (diff <= 0) {
        setStatus('ended');
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [competition, status]);

  // Socket events
  useEffect(() => {
    socket.on('competition:started', (comp) => {
      setCompetition(comp);
      setStatus('active');
    });

    socket.on('competition:paused', (comp) => {
      setCompetition(comp);
      setStatus('paused');
    });

    socket.on('competition:resumed', (comp) => {
      setCompetition(comp);
      setStatus('active');
    });

    socket.on('competition:ended', (comp) => {
      setCompetition(comp);
      setStatus('ended');
    });

    socket.on('competition:reset', () => {
      setCompetition(null);
      setStatus('not-started');
      setLeaderboardFrozen(false);
      setTimeLeft(null);
    });

    socket.on('timer:sync', (data) => {
      setCompetition(prev => prev ? { ...prev, ...data } : data);
      if (!data.isActive && !data.isPaused) {
        if (data.endTime && new Date(data.endTime) < new Date()) setStatus('ended');
        else setStatus('not-started');
      } else if (data.isPaused) {
        setStatus('paused');
      } else if (data.isActive) {
        setStatus('active');
      }
    });

    socket.on('timer:extended', (data) => {
      setCompetition(prev => prev ? { ...prev, endTime: data.endTime } : prev);
    });

    socket.on('leaderboard:frozen', () => {
      setLeaderboardFrozen(true);
    });

    socket.on('leaderboard:unfrozen', () => {
      setLeaderboardFrozen(false);
    });

    return () => {
      socket.off('competition:started');
      socket.off('competition:paused');
      socket.off('competition:resumed');
      socket.off('competition:ended');
      socket.off('competition:reset');
      socket.off('timer:sync');
      socket.off('timer:extended');
      socket.off('leaderboard:frozen');
      socket.off('leaderboard:unfrozen');
    };
  }, []);

  const formatTime = (ms) => {
    if (ms === null || ms === undefined) return '--:--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <CompetitionContext.Provider value={{
      competition,
      timeLeft,
      formattedTime: formatTime(timeLeft),
      leaderboardFrozen,
      status,
      setCompetition,
      updateStatus
    }}>
      {children}
    </CompetitionContext.Provider>
  );
};
