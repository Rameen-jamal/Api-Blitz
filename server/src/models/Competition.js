const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  leaderboardFrozen: {
    type: Boolean,
    default: false
  },
  pausedTimeRemaining: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Competition', competitionSchema);
