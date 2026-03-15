/**
 * Challenge APIs Router
 * 
 * Mounts all challenge API sub-routers under /challenge-api/:
 *   /challenge-api/01/... → Challenge 01 (Easy)
 *   /challenge-api/02/... → Challenge 02 (Medium)
 *   /challenge-api/03/... → Challenge 03 (Hard)
 * 
 * These are NOT protected by platform JWT middleware.
 * They are public APIs used by participants via the built-in API client.
 */
const express = require('express');
const router = express.Router();

const challenge01 = require('./challenge01');
const challenge02 = require('./challenge02');
const challenge03 = require('./challenge03');

router.use('/01', challenge01);
router.use('/02', challenge02);
router.use('/03', challenge03);

// Catch-all for unknown challenge paths
router.use((req, res) => {
  res.status(404).json({
    error: 'Unknown challenge endpoint.',
    hint: 'Valid base paths: /challenge-api/01, /challenge-api/02, /challenge-api/03',
  });
});

module.exports = router;
