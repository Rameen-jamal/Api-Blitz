const express = require('express');
const Competition = require('../models/Competition');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getIO } = require('../socket');

const router = express.Router();

// Get current competition state (public)
router.get('/', async (req, res) => {
  try {
    const competition = await Competition.findOne().sort({ createdAt: -1 });
    if (!competition) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({ success: true, data: competition });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create/update competition settings (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Start time and end time are required' });
    }

    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    // Upsert: find existing or create new
    let competition = await Competition.findOne().sort({ createdAt: -1 });
    if (competition) {
      competition.startTime = startTime;
      competition.endTime = endTime;
      await competition.save();
    } else {
      competition = await Competition.create({ startTime, endTime });
    }

    res.json({ success: true, data: competition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Start competition (admin only)
router.put('/start', authenticate, requireAdmin, async (req, res) => {
  try {
    const competition = await Competition.findOne().sort({ createdAt: -1 });
    if (!competition) {
      return res.status(404).json({ success: false, message: 'No competition configured' });
    }

    competition.isActive = true;
    competition.isPaused = false;
    await competition.save();

    try {
      const io = getIO();
      io.emit('competition:started', competition);
      io.emit('timer:sync', {
        endTime: competition.endTime,
        isActive: true,
        isPaused: false
      });
    } catch (e) {}

    res.json({ success: true, data: competition });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Pause competition (admin only)
router.put('/pause', authenticate, requireAdmin, async (req, res) => {
  try {
    const competition = await Competition.findOne().sort({ createdAt: -1 });
    if (!competition || !competition.isActive) {
      return res.status(400).json({ success: false, message: 'Competition is not active' });
    }

    competition.isPaused = true;
    competition.pausedTimeRemaining = new Date(competition.endTime).getTime() - Date.now();
    await competition.save();

    try {
      const io = getIO();
      io.emit('competition:paused', competition);
      io.emit('timer:sync', {
        endTime: competition.endTime,
        isActive: true,
        isPaused: true,
        pausedTimeRemaining: competition.pausedTimeRemaining
      });
    } catch (e) {}

    res.json({ success: true, data: competition });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Resume competition (admin only)
router.put('/resume', authenticate, requireAdmin, async (req, res) => {
  try {
    const competition = await Competition.findOne().sort({ createdAt: -1 });
    if (!competition || !competition.isPaused) {
      return res.status(400).json({ success: false, message: 'Competition is not paused' });
    }

    // Adjust end time based on remaining time when paused
    if (competition.pausedTimeRemaining) {
      competition.endTime = new Date(Date.now() + competition.pausedTimeRemaining);
    }
    competition.isPaused = false;
    competition.pausedTimeRemaining = null;
    await competition.save();

    try {
      const io = getIO();
      io.emit('competition:resumed', competition);
      io.emit('timer:sync', {
        endTime: competition.endTime,
        isActive: true,
        isPaused: false
      });
    } catch (e) {}

    res.json({ success: true, data: competition });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Extend time (admin only)
router.put('/extend', authenticate, requireAdmin, async (req, res) => {
  try {
    const { minutes } = req.body;
    if (!minutes || minutes <= 0) {
      return res.status(400).json({ success: false, message: 'Valid number of minutes required' });
    }

    const competition = await Competition.findOne().sort({ createdAt: -1 });
    if (!competition) {
      return res.status(404).json({ success: false, message: 'No competition configured' });
    }

    const additionalMs = minutes * 60 * 1000;
    competition.endTime = new Date(new Date(competition.endTime).getTime() + additionalMs);
    
    if (competition.isPaused && competition.pausedTimeRemaining) {
      competition.pausedTimeRemaining += additionalMs;
    }
    
    await competition.save();

    try {
      const io = getIO();
      io.emit('timer:extended', {
        endTime: competition.endTime,
        addedMinutes: minutes
      });
      io.emit('timer:sync', {
        endTime: competition.endTime,
        isActive: competition.isActive,
        isPaused: competition.isPaused,
        pausedTimeRemaining: competition.pausedTimeRemaining
      });
    } catch (e) {}

    res.json({ success: true, data: competition });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// End competition (admin only)
router.put('/end', authenticate, requireAdmin, async (req, res) => {
  try {
    const competition = await Competition.findOne().sort({ createdAt: -1 });
    if (!competition) {
      return res.status(404).json({ success: false, message: 'No competition configured' });
    }

    competition.isActive = false;
    competition.isPaused = false;
    competition.pausedTimeRemaining = null;
    await competition.save();

    try {
      const io = getIO();
      io.emit('competition:ended', competition);
      io.emit('timer:sync', {
        endTime: competition.endTime,
        isActive: false,
        isPaused: false
      });
    } catch (e) {}

    res.json({ success: true, data: competition });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reset competition (admin only)
router.delete('/reset', authenticate, requireAdmin, async (req, res) => {
  try {
    await Competition.deleteMany({});

    try {
      const io = getIO();
      io.emit('competition:reset');
      io.emit('timer:sync', {
        endTime: null,
        isActive: false,
        isPaused: false
      });
    } catch (e) {}

    res.json({ success: true, message: 'Competition reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Freeze leaderboard (admin only)
router.put('/freeze', authenticate, requireAdmin, async (req, res) => {
  try {
    const competition = await Competition.findOne().sort({ createdAt: -1 });
    if (!competition) {
      return res.status(404).json({ success: false, message: 'No competition configured' });
    }

    competition.leaderboardFrozen = true;
    await competition.save();

    try {
      const io = getIO();
      io.emit('leaderboard:frozen');
    } catch (e) {}

    res.json({ success: true, data: competition });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Unfreeze leaderboard (admin only)
router.put('/unfreeze', authenticate, requireAdmin, async (req, res) => {
  try {
    const competition = await Competition.findOne().sort({ createdAt: -1 });
    if (!competition) {
      return res.status(404).json({ success: false, message: 'No competition configured' });
    }

    competition.leaderboardFrozen = false;
    await competition.save();

    try {
      const io = getIO();
      io.emit('leaderboard:unfrozen');
    } catch (e) {}

    res.json({ success: true, data: competition });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
