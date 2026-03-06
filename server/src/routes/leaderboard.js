const express = require('express');
const Team = require('../models/Team');

const router = express.Router();

// Get current leaderboard standings (public)
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .select('teamName score solvedChallenges');

    const leaderboard = teams.map((team) => {
      const lastSolvedAt = team.solvedChallenges.length > 0
        ? new Date(Math.max(...team.solvedChallenges.map(sc => new Date(sc.solvedAt).getTime())))
        : null;
      return {
        teamName: team.teamName,
        score: team.score,
        challengesSolved: team.solvedChallenges.length,
        lastSolvedAt
      };
    });

    // Sort by score desc, then by lastSolvedAt asc (tiebreaker: earlier last-solve wins)
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (!a.lastSolvedAt && !b.lastSolvedAt) return 0;
      if (!a.lastSolvedAt) return 1;
      if (!b.lastSolvedAt) return -1;
      return a.lastSolvedAt - b.lastSolvedAt;
    });

    // Assign ranks after tiebreaker sort
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
