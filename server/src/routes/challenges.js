const express = require('express');
const Challenge = require('../models/Challenge');
const { authenticate, requireAdmin, requireTeam } = require('../middleware/auth');
const { getIO } = require('../socket');

const router = express.Router();

// Get all active challenges (participant) or all challenges (admin)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const challenges = await Challenge.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: challenges });
    }

    // Participant: only active challenges, exclude flag
    const challenges = await Challenge.find({ isActive: true })
      .select('-flag')
      .sort({ category: 1, difficulty: 1 });

    res.json({ success: true, data: challenges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single challenge (participant: no flag, admin: full)
router.get('/:id', authenticate, async (req, res) => {
  try {
    let challenge;
    if (req.user.role === 'admin') {
      challenge = await Challenge.findById(req.params.id);
    } else {
      challenge = await Challenge.findOne({ _id: req.params.id, isActive: true }).select('-flag');
    }

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create challenge (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, difficulty, points, category, apiEndpoint, flag, uniqueFlagPerTeam } = req.body;

    if (!title || !description || !difficulty || !points || !category || !apiEndpoint || !flag) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const challenge = await Challenge.create({
      title,
      description,
      difficulty,
      points,
      category,
      apiEndpoint,
      flag,
      uniqueFlagPerTeam: uniqueFlagPerTeam || false
    });

    try { getIO().emit('challenges:updated'); } catch (e) {}
    res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Update challenge (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    try { getIO().emit('challenges:updated'); } catch (e) {}
    res.json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Toggle challenge active status (admin only)
router.put('/:id/toggle', authenticate, requireAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    challenge.isActive = !challenge.isActive;
    await challenge.save();

    try { getIO().emit('challenges:updated'); } catch (e) {}
    res.json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete challenge (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    try { getIO().emit('challenges:updated'); } catch (e) {}
    res.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
