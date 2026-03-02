const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Difficulty is required']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  apiEndpoint: {
    type: String,
    required: [true, 'API endpoint is required']
  },
  flag: {
    type: String,
    required: [true, 'Flag is required']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  uniqueFlagPerTeam: {
    type: Boolean,
    default: false
  },
  solvedBy: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Challenge', challengeSchema);
