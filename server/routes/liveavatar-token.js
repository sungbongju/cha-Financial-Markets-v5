// routes/liveavatar-token.js — LiveAvatar 세션 토큰 생성 + 세션 시작
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const LIVEAVATAR_API_KEY = process.env.LIVEAVATAR_API_KEY;
  if (!LIVEAVATAR_API_KEY) {
    return res.status(500).json({ error: 'LIVEAVATAR_API_KEY not configured' });
  }

  try {
    const body = req.body || {};
    const avatarId = body.avatar_id;
    if (!avatarId) {
      return res.status(400).json({ error: 'avatar_id required' });
    }

    // Step 1: 세션 토큰 생성
    const tokenRes = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': LIVEAVATAR_API_KEY,
      },
      body: JSON.stringify({
        mode: 'LITE',
        avatar_id: avatarId,
        is_sandbox: false,
        video_settings: {
          quality: 'medium',
          encoding: 'H264',
        },
        avatar_persona: {
          language: 'ko',
          voice_settings: {
            voice_id: body.voice_id || 'b2bd6569-a537-4342-aeca-a1f15d2a2c97',
            model: 'eleven_flash_v2_5',
            speed: 1.0,
          },
        },
        interactivity_type: 'CONVERSATIONAL',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.code !== 1000) {
      return res.status(tokenRes.status || 500).json({ error: 'Token creation failed', detail: tokenData });
    }

    const sessionToken = tokenData.data.session_token;
    const sessionId = tokenData.data.session_id;

    // Step 2: 세션 시작
    const startRes = await fetch('https://api.liveavatar.com/v1/sessions/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionToken,
      },
    });

    const startData = await startRes.json();
    if (!startRes.ok || startData.code !== 1000) {
      return res.status(startRes.status || 500).json({ error: 'Session start failed', detail: startData });
    }

    return res.json({
      session_id: sessionId,
      session_token: sessionToken,
      livekit_url: startData.data.livekit_url,
      livekit_client_token: startData.data.livekit_client_token,
    });

  } catch (err) {
    console.error('[liveavatar-token] error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
