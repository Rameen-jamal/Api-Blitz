/**
 * Challenge 02 (Medium): "Two-Step Access Token"
 * 
 * POST /session → Create session, get sessionId + nonce (in X-Session-Nonce header)
 * POST /token   → Exchange sessionId + nonce for an access token
 * GET  /vault   → Use access token to retrieve the flag
 * 
 * Sessions expire after 10 minutes. Multiple teams can use concurrently
 * because each session is keyed by a unique sessionId.
 */
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const sessions = new Map();

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > 10 * 60 * 1000) sessions.delete(id);
  }
}, 5 * 60 * 1000);

const rand = () => crypto.randomBytes(16).toString('hex');

router.get('/', (req, res) => {
  res.json({ message: 'Two-Step Access Token service. Start by POSTing to /session with your team name.' });
});

// Step 1: Create a session
router.post('/session', (req, res) => {
  const { team } = req.body || {};
  if (!team || typeof team !== 'string' || !team.trim()) {
    return res.status(400).json({ error: 'Missing required field: "team" (string).' });
  }

  const sessionId = rand();
  const nonce = rand();

  sessions.set(sessionId, {
    team: team.trim(),
    nonce,
    token: null,
    createdAt: Date.now(),
  });

  res.set('X-Session-Nonce', nonce);
  res.json({ sessionId });
});

// Step 2: Exchange session + nonce for a token
router.post('/token', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const nonce = req.headers['x-session-nonce'];

  if (!sessionId || !nonce) {
    return res.status(400).json({
      error: 'Missing required headers: X-Session-Id and X-Session-Nonce.',
    });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(403).json({ error: 'Invalid or expired session.' });
  }

  if (Date.now() - session.createdAt > 10 * 60 * 1000) {
    sessions.delete(sessionId);
    return res.status(403).json({ error: 'Session expired.' });
  }

  if (session.nonce !== nonce) {
    return res.status(403).json({ error: 'Invalid nonce.' });
  }

  const accessToken = rand();
  session.token = accessToken;

  res.json({ accessToken });
});

// Step 3: Access the vault
router.get('/vault', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(400).json({
      error: 'Missing required header: Authorization: Bearer <token>.',
    });
  }

  const token = authHeader.slice(7);

  // Search for the session that owns this token
  let found = null;
  for (const [id, session] of sessions) {
    if (session.token === token) {
      // Check expiry
      if (Date.now() - session.createdAt > 10 * 60 * 1000) {
        sessions.delete(id);
        break;
      }
      found = session;
      break;
    }
  }

  if (!found) {
    return res.status(403).json({ error: 'Invalid or expired access token.' });
  }

  res.json({ flag: 'BLITZ{two_step_access_token}' });
});

module.exports = router;
