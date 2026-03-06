const express = require('express');
const rateLimit = require('express-rate-limit');
const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const Team = require('../models/Team');
const Competition = require('../models/Competition');
const { authenticate, requireAdmin, requireTeam } = require('../middleware/auth');
const { getIO } = require('../socket');

const router = express.Router();

// Rate limiter: 5 attempts per minute per team
const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => `${req.user.id}-${req.body.challengeId}`,
  message: { success: false, message: 'Too many attempts. Max 5 per minute per challenge.' }
});

// Submit a flag (participant)
router.post('/', authenticate, requireTeam, submitLimiter, async (req, res) => {
  try {
    const { challengeId, flag } = req.body;

    if (!challengeId || !flag) {
      return res.status(400).json({ success: false, message: 'Challenge ID and flag are required' });
    }

    // Check if competition is active
    const competition = await Competition.findOne().sort({ createdAt: -1 });
    if (!competition || !competition.isActive || competition.isPaused) {
      return res.status(403).json({ success: false, message: 'Competition is not active' });
    }

    // Check if competition time has ended
    if (new Date() > new Date(competition.endTime)) {
      return res.status(403).json({ success: false, message: 'Competition has ended' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge || !challenge.isActive) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Check if already solved
    const team = await Team.findById(req.user.id);
    if (team.solvedChallenges.some(sc => sc.challengeId.toString() === challengeId.toString())) {
      return res.status(400).json({ success: false, message: 'Challenge already solved' });
    }

    const isCorrect = flag.trim() === challenge.flag.trim();

    // Record submission
    await Submission.create({
      teamId: req.user.id,
      challengeId,
      submittedFlag: flag,
      isCorrect
    });

    if (isCorrect) {
      // Update team score and solved challenges
      team.score += challenge.points;
      team.solvedChallenges.push({ challengeId, solvedAt: new Date() });
      await team.save();

      // Update challenge solved count
      challenge.solvedBy += 1;
      await challenge.save();

      // Emit leaderboard update
      try {
        const io = getIO();
        const teams = await Team.find({ isActive: true })
          .select('teamName score solvedChallenges')
          .sort({ score: -1 });
        io.emit('leaderboard:update', teams);
      } catch (socketError) {
        console.error('Socket emit error:', socketError);
      }

      return res.json({
        success: true,
        data: {
          isCorrect: true,
          message: 'Correct flag! Challenge solved!',
          pointsEarned: challenge.points,
          newScore: team.score
        }
      });
    }

    res.json({
      success: true,
      data: {
        isCorrect: false,
        message: 'Incorrect flag. Try again!'
      }
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all submissions (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { teamId, challengeId } = req.query;
    const filter = {};
    if (teamId) filter.teamId = teamId;
    if (challengeId) filter.challengeId = challengeId;

    const submissions = await Submission.find(filter)
      .populate('teamId', 'teamName username')
      .populate('challengeId', 'title category points')
      .sort({ attemptedAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get submissions by team (admin only)
router.get('/team/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const submissions = await Submission.find({ teamId: req.params.id })
      .populate('challengeId', 'title category points')
      .sort({ attemptedAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
