'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_URL = 'http://127.0.0.1:9000';
const CACHE_DIR = path.join(__dirname, '../tts-cache');
const PRODUCTS = require('./cache-products.json');

function getCacheKey(text) {
  return crypto.createHash('md5').update(text.trim().toLowerCase()).digest('hex');
}

// SSE 파싱 헬퍼 — Node.js fetch로 SSE 읽기
async function fetchSTSText(question) {
  const res = await fetch(`${BASE_URL}/api/sts-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: question, history: [] })
  });
  if (!res.ok) throw new Error(`STS HTTP ${res.status}`);

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', sentences = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const d = JSON.parse(line.slice(6));
        if (d.sentence) sentences.push(d.sentence);
      } catch {}
    }
  }
  return sentences.join(' ');
}

async function main() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  let generated = 0, skipped = 0, errors = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const { product, question } = PRODUCTS[i];
    const prefix = `[${i+1}/${PRODUCTS.length}] ${product}`;
    try {
      // 1. STS 텍스트 생성
      const text = await fetchSTSText(question);
      if (!text) { console.log(`${prefix} → EMPTY (skip)`); errors++; continue; }

      // 2. 캐시 파일 존재 여부 확인
      const cacheKey = getCacheKey(text);
      const cachePath = path.join(CACHE_DIR, cacheKey + '.mp3');
      if (fs.existsSync(cachePath)) {
        console.log(`${prefix} → CACHED (${cacheKey.slice(0, 8)})`);
        skipped++;
        continue;
      }

      // 3. TTS 생성
      const ttsRes = await fetch(`${BASE_URL}/api/humelo-tts-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!ttsRes.ok) throw new Error(`TTS HTTP ${ttsRes.status}`);

      const buffer = Buffer.from(await ttsRes.arrayBuffer());
      if (buffer.length < 100) throw new Error('TTS response too small');

      fs.writeFileSync(cachePath, buffer);
      console.log(`${prefix} → GENERATED (${buffer.length} bytes, ${cacheKey.slice(0, 8)})`);
      generated++;

      // 레이트 리밋 방지: 500ms 딜레이
      await new Promise(r => setTimeout(r, 500));

    } catch (e) {
      console.error(`${prefix} → ERROR: ${e.message}`);
      errors++;
    }
  }

  console.log(`\n완료: ${generated}개 생성, ${skipped}개 캐시 재사용, ${errors}개 오류`);
}

main().catch(console.error);
