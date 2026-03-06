const express = require('express');
const bcrypt = require('bcryptjs');
const Team = require('../models/Team');
const { authenticate, requireAdmin, requireTeam } = require('../middleware/auth');

const router = express.Router();

// Get all teams (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const teams = await Team.find().select('-password').sort({ score: -1 });
    res.json({ success: true, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current team profile (authenticated team)
router.get('/me', authenticate, requireTeam, async (req, res) => {
  try {
    const team = await Team.findById(req.user.id).select('-password');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a team (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { teamName, members, username, password } = req.body;

    if (!teamName || !username || !password) {
      return res.status(400).json({ success: false, message: 'Team name, username, and password are required' });
    }

    if (members && members.length > 3) {
      return res.status(400).json({ success: false, message: 'Maximum 3 members allowed' });
    }

    const existing = await Team.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const team = await Team.create({
      teamName,
      members: members || [],
      username: username.toLowerCase(),
      password
    });

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Update team (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { teamName, members, username, score } = req.body;
    const updateData = {};

    if (teamName) updateData.teamName = teamName;
    if (members) {
      if (members.length > 3) {
        return res.status(400).json({ success: false, message: 'Maximum 3 members allowed' });
      }
      updateData.members = members;
    }
    if (username) updateData.username = username.toLowerCase();
    if (score !== undefined) updateData.score = score;

    const team = await Team.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.json({ success: true, data: team });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Reset password (admin only)
router.put('/:id/reset-password', authenticate, requireAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    team.password = password;
    await team.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle team active status (admin only)
router.put('/:id/toggle', authenticate, requireAdmin, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    team.isActive = !team.isActive;
    await team.save();

    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete team (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
