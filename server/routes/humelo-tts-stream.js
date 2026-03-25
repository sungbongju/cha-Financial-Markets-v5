'use strict';

// server/routes/humelo-tts-stream.js — Humelo DIVE Streaming 바이너리 프록시 (Express Router)
// v3/api/humelo-tts-stream.js를 Express Router로 변환
// 오디오 청크를 받자마자 클라이언트로 바로 전달 → 0.3초 내 재생 시작 (STS-02)
// TTS 파일 캐시 레이어 추가 — 동일 텍스트 반복 요청 시 즉시 반환 (DATA-02)

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(__dirname, '../tts-cache');
fs.mkdirSync(CACHE_DIR, { recursive: true });

function getCacheKey(text) {
  return crypto.createHash('md5').update(text.trim().toLowerCase()).digest('hex');
}

router.post('/humelo-tts-stream', async (req, res) => {
  const HUMELO_API_KEY = process.env.HUMELO_API_KEY;
  if (!HUMELO_API_KEY) {
    return res.status(503).json({ error: 'HUMELO_API_KEY not configured' });
  }

  const { text, voiceName = '시아', speed = 1.05, emotion = 'neutral' } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text required' });

  const cacheKey = getCacheKey(text);
  const cachePath = path.join(CACHE_DIR, cacheKey + '.mp3');

  // 캐시 히트: 파일이 있으면 즉시 스트림 반환
  if (fs.existsSync(cachePath)) {
    console.log('[tts-cache] HIT:', cacheKey.slice(0, 8));
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Cache', 'HIT');
    fs.createReadStream(cachePath).pipe(res);
    return;
  }

  // 캐시 미스: Humelo API 호출 후 캐시 저장 + 클라이언트 전달 동시 진행
  try {
    const ttsRes = await fetch('https://prosody-api.humelo.works/api/v1/dive/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': HUMELO_API_KEY
      },
      body: JSON.stringify({
        text,
        mode: 'preset',
        lang: 'ko',
        speed,
        voiceName,
        emotion,
        outputFormat: 'mp3_48000_128'
      })
    });

    if (!ttsRes.ok) {
      return res.status(ttsRes.status).json({ error: 'Humelo streaming failed', status: ttsRes.status });
    }

    // 오디오 스트림을 그대로 클라이언트에 전달 + 캐시 파일에도 동시 기록
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Cache', 'MISS');

    const reader = ttsRes.body.getReader();
    const cacheStream = fs.createWriteStream(cachePath + '.tmp');
    let cacheError = false;
    cacheStream.on('error', (e) => {
      cacheError = true;
      console.warn('[tts-cache] write error:', e.message);
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
      if (!cacheError) cacheStream.write(Buffer.from(value));
    }

    cacheStream.end();
    // tmp → 실제 파일로 rename (불완전 파일 방지)
    if (!cacheError) {
      try {
        fs.renameSync(cachePath + '.tmp', cachePath);
        console.log('[tts-cache] saved:', cacheKey.slice(0, 8));
      } catch (renameErr) {
        console.warn('[tts-cache] rename error:', renameErr.message);
      }
    } else {
      // 오류 발생 시 tmp 파일 정리
      try { fs.unlinkSync(cachePath + '.tmp'); } catch {}
    }

    res.end();
  } catch (error) {
    console.error('[humelo-tts-stream] error:', error.message);
    // 오류 시 tmp 파일 정리
    try { fs.unlinkSync(cachePath + '.tmp'); } catch {}
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.end();
    }
  }
});

module.exports = router;
