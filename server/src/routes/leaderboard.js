const express = require('express');
const Team = require('../models/Team');

const router = express.Router();

// Get current leaderboard standings (public)
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .select('teamName score solvedChallenges')
      .sort({ score: -1, createdAt: 1 });

    const leaderboard = teams.map((team, index) => ({
      rank: index + 1,
      teamName: team.teamName,
      score: team.score,
      challengesSolved: team.solvedChallenges.length
    }));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
