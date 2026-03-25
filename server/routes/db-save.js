'use strict';
const express = require('express');
const router = express.Router();

const DB_API_URL = 'https://aiforalab.com/finmarket-api/api.php';

// POST /api/db-save — fire-and-forget, 항상 200 즉시 반환
router.post('/db-save', (req, res) => {
  const { session_id, user_message, assistant_reply, mode = 'sts' } = req.body || {};

  // 클라이언트에는 즉시 200 반환 (비동기 처리)
  res.json({ queued: true });

  // 백그라운드에서 학교서버에 저장 (실패해도 클라이언트 무관)
  if (session_id && user_message && assistant_reply) {
    fetch(DB_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_chat', session_id, user_message, assistant_reply, mode })
    })
    .then(r => { if (!r.ok) console.warn('[db-save] HTTP', r.status); })
    .catch(e => console.warn('[db-save] error:', e.message));
  }
});

module.exports = router;
