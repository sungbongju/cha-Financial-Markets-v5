const express = require('express');
const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json());

// CORS — Phase 2에서 확장 예정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'finbot-middleton',
    version: '0.1.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[finbot] Server running on port ${PORT}`);
});
