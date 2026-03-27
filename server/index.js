require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 9000;

// JSON body 파싱 (POST만, GET은 무시)
app.use((req, res, next) => {
  if (req.method === 'GET') return next();
  express.json()(req, res, next);
});

// CORS — 명시적 허용 도메인 (FE-02)
const ALLOWED_ORIGINS = [
  'https://cha-financial-markets-v5.vercel.app',
  'https://sungbongju.github.io',
  'https://aiforalab.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // curl 등 non-browser 요청 허용 (개발/테스트용)
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── API 라우트 ──
app.use('/api', require('./routes/sts-stream'));
app.use('/api', require('./routes/humelo-tts-stream'));
app.use('/api', require('./routes/humelo-tts'));
app.use('/api', require('./routes/db-save'));
app.use('/api/liveavatar-token', require('./routes/liveavatar-token'));
app.use('/api/liveavatar-session', require('./routes/liveavatar-session'));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'finbot-middleton',
    version: '0.2.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[finbot] Server running on port ${PORT}`);
});
