---
phase: 02-api-server
plan: 01
subsystem: api
tags: [express, sse, streaming, humelo-tts, exaone, cors, node-fetch]

# Dependency graph
requires:
  - phase: 01-server-env
    provides: Node.js v24 + Express 설치, server/index.js 기본 골격, PM2 서비스 관리

provides:
  - POST /api/sts-stream — 엑사원 localhost SSE 스트리밍 + 한국어 문장 단위 TTS 전송
  - POST /api/humelo-tts-stream — Humelo DIVE 바이너리 오디오 스트리밍 프록시
  - POST /api/humelo-tts — Humelo Streaming→Standard 폴백 TTS (JSON audioUrl 반환)
  - CORS ALLOWED_ORIGINS — cha-financial-markets-v5.vercel.app 포함 명시적 허용
affects: [03-database-cache, frontend-sts-integration]

# Tech tracking
tech-stack:
  added: [dotenv ^16.5.0]
  patterns:
    - Express Router (module.exports = router)
    - AbortController + req.on('close') 동시 실행 — 인터럽트 강화 패턴
    - detectSentenceBoundary — 한국어 문장 경계 감지 → 최소 레이턴시 TTS 파이프라이닝
    - stripThoughtTags — 엑사원 <thought> 블록 토큰 경계 무관 안전 제거

key-files:
  created:
    - server/routes/sts-stream.js
    - server/routes/humelo-tts-stream.js
    - server/routes/humelo-tts.js
    - server/.env.example
  modified:
    - server/index.js
    - server/package.json

key-decisions:
  - "EXAONE_BASE_URL 기본값=http://127.0.0.1:19000/v1 (localhost 직접 호출, 네트워크 홉 0)"
  - "AbortController.abort() + clientDisconnected=true 동시 실행 — fetch 네트워크 레벨 즉시 취소"
  - "CORS 와일드카드 * 제거, ALLOWED_ORIGINS 명시적 배열로 교체 (non-browser 요청은 허용 유지)"
  - "Node.js v24 내장 fetch 사용 — node-fetch 패키지 추가 불필요"
  - "HUMELO_API_KEY 없으면 503 반환 (TTS 스킵 아님) — 운영 환경 설정 오류 명확히"

patterns-established:
  - "Express Router 패턴: 'use strict' + require('express').Router() + module.exports = router"
  - "SSE 스트리밍: res.flushHeaders() + while(reader.read) + sendSSE(res, event, data)"
  - "인터럽트: AbortController signal → fetch + req.on('close') → abort() 동시 호출"

requirements-completed: [STS-01, STS-02, STS-03, STS-04, STS-05, STS-06, FE-02]

# Metrics
duration: 4min
completed: 2026-03-25
---

# Phase 02 Plan 01: API 서버 라우터 포팅 Summary

**엑사원 127.0.0.1:19000 localhost 직접 호출 + AbortController 인터럽트 강화 + Humelo 스트리밍 프록시를 Express Router로 포팅하여 STS 파이프라인 완성**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-25T05:16:49Z
- **Completed:** 2026-03-25T05:20:47Z
- **Tasks:** 2 / 2
- **Files modified:** 6

## Accomplishments

- v3/api/sts-stream.js를 Express Router로 변환 — EXAONE_BASE_URL을 middleton.p-e.kr/v1에서 127.0.0.1:19000으로 교체하여 네트워크 홉 제거
- AbortController를 req.on('close')와 동시에 abort() 호출하도록 인터럽트 강화 (STS-06 개선)
- humelo-tts-stream, humelo-tts 라우터 포팅 + Streaming→Standard 폴백 로직 보존 (STS-02, STS-03)
- server/index.js CORS를 와일드카드 * 에서 ALLOWED_ORIGINS 명시적 배열로 교체 (FE-02)
- dotenv 추가, .env.example 생성

## Task Commits

1. **Task 1: sts-stream Express 라우터 포팅** — `5455e21` (feat)
2. **Task 2: humelo-tts 라우터 + CORS + 라우트 마운트** — `e088725` (feat)

## Files Created/Modified

- `server/routes/sts-stream.js` — POST /api/sts-stream (엑사원 localhost SSE + 문장 분할 + TTS 후처리)
- `server/routes/humelo-tts-stream.js` — POST /api/humelo-tts-stream (바이너리 청크 스트리밍 프록시)
- `server/routes/humelo-tts.js` — POST /api/humelo-tts (Streaming→Standard 폴백)
- `server/index.js` — dotenv 로드, CORS ALLOWED_ORIGINS, 3개 라우트 마운트
- `server/package.json` — dotenv ^16.5.0 추가
- `server/.env.example` — 환경변수 템플릿

## Decisions Made

- EXAONE_BASE_URL 기본값을 127.0.0.1:19000으로 설정 — 서버에서 실행 시 추가 환경변수 없이 localhost 직접 호출
- AbortController를 sts-stream 핸들러 최상단에 생성하여 req.on('close')와 동시 abort — fetch 네트워크 레벨에서 즉시 취소
- HUMELO_API_KEY 없을 때 503 반환 (TTS 스킵이 아닌 에러) — 운영 환경 설정 누락을 명확히 표시
- Node.js v24 내장 fetch 활용 — node-fetch 패키지 추가 불필요

## Deviations from Plan

None — 계획대로 정확히 실행됨.

## Issues Encountered

- 로컬 `npm install` 전 require('./routes/sts-stream') 실행 시 express not found 오류 — npm install 후 해결 (서버 환경에서는 이미 설치된 상태이므로 실제 배포 시 문제 없음)

## User Setup Required

서버 배포 전 다음이 필요합니다:

1. `.env` 파일 생성 (서버의 `/home/student04/finbot/server/.env`):
   ```
   HUMELO_API_KEY=<실제 키>
   PORT=9000
   ```
2. `npm install` 실행 (dotenv 추가됨)
3. `npx pm2 restart finbot-server`

## Next Phase Readiness

- STS API 엔드포인트 3개 완성 — 프론트엔드 연동 준비 완료
- 서버 배포 대기 중: SSH 접속 후 파일 전송 + PM2 restart 필요
- nginx location 블록 교수님 승인 이후 외부 접근 가능

---
*Phase: 02-api-server*
*Completed: 2026-03-25*
