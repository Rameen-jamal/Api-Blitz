const jwt = require('jsonwebtoken');
const Team = require('../models/Team');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

const requireTeam = async (req, res, next) => {
  if (req.user.role !== 'team') {
    return res.status(403).json({ success: false, message: 'Team access required' });
  }

  try {
    const team = await Team.findById(req.user.id);
    if (!team || !team.isActive) {
      return res.status(403).json({ success: false, message: 'Team is inactive or not found' });
    }
    req.team = team;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { authenticate, requireAdmin, requireTeam };
