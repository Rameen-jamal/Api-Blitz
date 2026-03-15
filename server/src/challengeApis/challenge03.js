/**
 * Challenge 03 (Hard): "Protocol: Four Locks"
 * 
 * A 4-step state machine requiring POST → PATCH → POST → GET,
 * with information passed through response headers at each step.
 * 
 * POST  /handshake → Start a handshake, receive directive in X-Directive header
 * PATCH /mode      → Set mode from directive, receive step token in X-Step-Token header
 * POST  /keys      → Submit step token (+ hidden header X-Client: api-blitz) to get keys
 * GET   /vault     → Submit both keys to open vault (flag in X-Flag header, NOT body)
 * 
 * Sessions expire after 10 minutes. Concurrent-safe via unique handshakeId.
 */
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const handshakes = new Map();

// Cleanup expired handshakes every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, hs] of handshakes) {
    if (now - hs.createdAt > 10 * 60 * 1000) handshakes.delete(id);
  }
}, 5 * 60 * 1000);

const rand = () => crypto.randomBytes(16).toString('hex');

router.get('/', (req, res) => {
  res.json({ message: 'Protocol: Four Locks. Initiate by POSTing to /handshake with your agent codename.' });
});

// Helper: validate handshake exists and is not expired
const getHandshake = (id) => {
  const hs = handshakes.get(id);
  if (!hs) return null;
  if (Date.now() - hs.createdAt > 10 * 60 * 1000) {
    handshakes.delete(id);
    return null;
  }
  return hs;
};

// Step 1: POST /handshake
router.post('/handshake', (req, res) => {
  const { agent } = req.body || {};
  if (!agent || typeof agent !== 'string' || !agent.trim()) {
    return res.status(400).json({ error: 'Missing required field: "agent" (string).' });
  }

  const handshakeId = rand();
  const directive = 'set-mode:STEALTH';
  const expectedMode = 'STEALTH';

  handshakes.set(handshakeId, {
    agent: agent.trim(),
    step: 1,
    expectedMode,
    stepToken: null,
    keyA: null,
    keyB: null,
    createdAt: Date.now(),
  });

  res.set('X-Directive', directive);
  res.json({ handshakeId, message: 'Handshake accepted.' });
});

// Step 2: PATCH /mode
router.patch('/mode', (req, res) => {
  const handshakeId = req.headers['x-handshake-id'];
  if (!handshakeId) {
    return res.status(400).json({ error: 'Missing required header: X-Handshake-Id.' });
  }

  const hs = getHandshake(handshakeId);
  if (!hs) {
    return res.status(403).json({ error: 'Invalid or expired handshake.' });
  }

  if (hs.step !== 1) {
    return res.status(400).json({
      error: `Unexpected step. Expected step 1, but handshake is at step ${hs.step}.`,
    });
  }

  const { mode } = req.body || {};
  if (!mode || typeof mode !== 'string') {
    return res.status(400).json({ error: 'Missing required field: "mode" (string).' });
  }

  if (mode !== hs.expectedMode) {
    return res.status(403).json({
      error: `Invalid mode. Directive was not followed.`,
    });
  }

  const stepToken = rand();
  hs.step = 2;
  hs.stepToken = stepToken;

  res.set('X-Step-Token', stepToken);
  res.json({ ok: true, message: 'Mode set.' });
});

// Step 3: POST /keys
router.post('/keys', (req, res) => {
  const handshakeId = req.headers['x-handshake-id'];
  const stepToken = req.headers['x-step-token'];

  if (!handshakeId) {
    return res.status(400).json({ error: 'Missing required header: X-Handshake-Id.' });
  }
  if (!stepToken) {
    return res.status(400).json({ error: 'Missing required header: X-Step-Token.' });
  }

  const hs = getHandshake(handshakeId);
  if (!hs) {
    return res.status(403).json({ error: 'Invalid or expired handshake.' });
  }

  if (hs.step !== 2) {
    return res.status(400).json({
      error: `Unexpected step. Expected step 2, but handshake is at step ${hs.step}.`,
    });
  }

  if (hs.stepToken !== stepToken) {
    return res.status(403).json({ error: 'Invalid step token.' });
  }

  const keyA = `A-${rand()}`;

  // Check for the hidden header
  const clientHeader = req.headers['x-client'];
  if (clientHeader !== 'api-blitz') {
    // Return partial keys with a hint — do NOT reveal the exact header name
    return res.json({
      keyA,
      keyB: null,
      message: 'Unrecognized client profile. Only verified clients receive full clearance.',
    });
  }

  // Full clearance — both keys
  const keyB = `B-${rand()}`;
  hs.keyA = keyA;
  hs.keyB = keyB;
  hs.step = 3;

  res.json({ keyA, keyB, message: 'Full clearance granted.' });
});

// Step 4: GET /vault
router.get('/vault', (req, res) => {
  const handshakeId = req.headers['x-handshake-id'];
  const keyA = req.headers['x-keya'];
  const keyB = req.headers['x-keyb'];

  if (!handshakeId) {
    return res.status(400).json({ error: 'Missing required header: X-Handshake-Id.' });
  }
  if (!keyA || !keyB) {
    return res.status(400).json({ error: 'Missing required headers: X-KeyA and X-KeyB.' });
  }

  const hs = getHandshake(handshakeId);
  if (!hs) {
    return res.status(403).json({ error: 'Invalid or expired handshake.' });
  }

  if (hs.step !== 3) {
    return res.status(400).json({
      error: `Unexpected step. Expected step 3, but handshake is at step ${hs.step}.`,
    });
  }

  if (hs.keyA !== keyA || hs.keyB !== keyB) {
    return res.status(403).json({ error: 'Invalid keys.' });
  }

  // Clear session after successful vault access
  handshakes.delete(handshakeId);

  // Flag is in the header, NOT the body
  res.set('X-Flag', 'BLITZ{protocol_four_locks}');
  res.json({ status: 'ok', message: 'Vault opened.' });
});

module.exports = router;
