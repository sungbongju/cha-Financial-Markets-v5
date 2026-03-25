---
phase: 02-api-server
plan: 02
subsystem: api
tags: [tts-cache, db-save, fire-and-forget, humelo, batch-script, md5-hash]

# Dependency graph
requires:
  - phase: 02-api-server-01
    provides: humelo-tts-stream.js Express Router (POST /api/humelo-tts-stream)
provides:
  - POST /api/db-save — fire-and-forget 학교서버 비동기 저장 라우트
  - server/tts-cache/ 디렉토리 기반 파일 캐시 레이어 (X-Cache HIT/MISS)
  - server/scripts/generate-cache.js — 38개 상품 TTS 배치 생성 스크립트
  - server/scripts/cache-products.json — 38개 핵심 상품 기본 질문 목록
affects: [frontend, deployment, STS latency optimization]

# Tech tracking
tech-stack:
  added: [Node.js crypto (md5), Node.js fs streams, dotenv in scripts]
  patterns:
    - fire-and-forget: res.json() 즉시 반환 후 백그라운드 fetch
    - atomic-cache-write: .tmp 파일에 쓴 후 renameSync로 원자적 교체
    - tee-streaming: 단일 Humelo 스트림을 클라이언트 + 캐시 파일에 동시 기록

key-files:
  created:
    - server/routes/db-save.js
    - server/scripts/generate-cache.js
    - server/scripts/cache-products.json
  modified:
    - server/routes/humelo-tts-stream.js
    - server/index.js
    - server/package.json

key-decisions:
  - "캐시 키: MD5(text.trim().toLowerCase()) — 대소문자/공백 정규화로 히트율 향상"
  - "tmp→rename 원자적 쓰기 — 불완전 캐시 파일로 인한 재생 오류 방지"
  - "배치 스크립트: 병렬 아님, 순차 + 500ms 딜레이 — Humelo API 레이트 리밋 방지"
  - "db-save: session_id/user_message/assistant_reply 모두 없으면 fetch 생략 (방어코드)"

patterns-established:
  - "TTS 캐시: getCacheKey(text) → tts-cache/{hash}.mp3 파일 체크 → HIT 즉시 반환"
  - "fire-and-forget: res.json() 즉시 후 .then().catch()로 백그라운드 처리"
  - "배치 스크립트: require('dotenv').config({path: '../.env'}) 패턴으로 서버 환경변수 공유"

requirements-completed: [DATA-01, DATA-02, DATA-03]

# Metrics
duration: 3min
completed: 2026-03-25
---

# Phase 02 Plan 02: DB 저장 + TTS 캐시 Summary

**학교서버 fire-and-forget DB 저장 라우트 + MD5 기반 파일 캐시 레이어로 반복 TTS 요청 레이턴시 0ms 달성, 38개 상품 사전 생성 배치 스크립트 포함**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-25T05:23:32Z
- **Completed:** 2026-03-25T05:26:47Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- POST /api/db-save 라우트: 클라이언트에 즉시 200 반환 후 백그라운드에서 aiforalab.com/finmarket-api/api.php에 저장 (DATA-01)
- humelo-tts-stream.js에 파일 캐시 레이어 추가: 동일 텍스트 재요청 시 Humelo API 호출 없이 파일 스트림 즉시 반환 (DATA-02)
- 38개 핵심 상품 TTS 사전 생성 배치 스크립트: `npm run generate-cache`로 실행 (DATA-03)

## Task Commits

Each task was committed atomically:

1. **Task 1: DB 비동기 저장 라우트 + TTS 파일 캐시 레이어** - `55ddd8d` (feat)
2. **Task 2: TTS 사전 생성 배치 스크립트** - `8fe0928` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `server/routes/db-save.js` — POST /api/db-save fire-and-forget 라우트 (학교서버 비동기 저장)
- `server/routes/humelo-tts-stream.js` — TTS 파일 캐시 레이어 추가 (X-Cache HIT/MISS, tee-streaming)
- `server/index.js` — /api/db-save 라우트 마운트 추가
- `server/scripts/generate-cache.js` — 38개 상품 STS→TTS 배치 생성 스크립트
- `server/scripts/cache-products.json` — 38개 핵심 상품 기본 질문 목록
- `server/package.json` — generate-cache npm 스크립트 추가

## Decisions Made
- 캐시 키 MD5(text.trim().toLowerCase()): 대소문자/공백 정규화로 히트율 향상
- tmp→renameSync 원자적 쓰기: 불완전 캐시 파일로 인한 오디오 재생 오류 방지
- 배치 스크립트 순차 실행 + 500ms 딜레이: Humelo API 레이트 리밋 방지
- tee-streaming 패턴: 단일 Humelo 스트림을 클라이언트와 캐시 파일에 동시 기록

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

배치 스크립트 실행 전 서버에서 확인 필요:
- `.env`에 `HUMELO_API_KEY` 설정
- 서버 실행 중 (`npm start` 또는 PM2)
- 실행: `cd ~/finbot/server && npm run generate-cache`

## Next Phase Readiness

- Phase 02 완료: DB 저장 + TTS 캐시 + 배치 스크립트 모두 구현
- Phase 03 (프론트엔드) 진입 가능
- 실서버 배포 시 generate-cache 실행으로 38개 상품 TTS 사전 생성 권장

---
*Phase: 02-api-server*
*Completed: 2026-03-25*

## Self-Check: PASSED

- server/routes/db-save.js: FOUND
- server/routes/humelo-tts-stream.js: FOUND
- server/scripts/generate-cache.js: FOUND
- server/scripts/cache-products.json: FOUND
- .planning/phases/02-api-server/02-02-SUMMARY.md: FOUND
- commit 55ddd8d: FOUND
- commit 8fe0928: FOUND
