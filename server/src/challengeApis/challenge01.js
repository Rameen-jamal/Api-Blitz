/**
 * Challenge 01 (Easy): "Warmup: Status Clearance"
 * 
 * GET /ping  → Returns service status
 * GET /flag  → Returns the flag directly
 */
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Status Clearance service. Try checking /ping for system status.' });
});

router.get('/ping', (req, res) => {
  res.json({ ok: true, message: 'Service online. Check /flag.' });
});

router.get('/flag', (req, res) => {
  res.json({ flag: 'BLITZ{warmup_status_clearance}' });
});

module.exports = router;
