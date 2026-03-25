---
phase: 03-frontend
plan: 01
subsystem: ui
tags: [html, vercel, middleton, humelo-tts, kakao-login, sts, sse]

# Dependency graph
requires:
  - phase: 02-api-server
    provides: Middleton nginx 프록시 (sts-stream, humelo-tts-stream, humelo-tts 엔드포인트)
provides:
  - STS 음성 대화 UI (public/index.html) — Middleton API URL로 연결
  - 카카오 로그인 (public/js/auth.js) — finmarket_db 연동
  - Vercel 정적 서빙 설정 (vercel.json)
affects: [Vercel 배포, cha-financial-markets-v5.vercel.app]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "MIDDLETON_API 상수로 API base URL 중앙 관리 — URL 교체 시 1곳만 수정"
    - "Vercel outputDirectory=public + rewrites로 정적 SPA 서빙"

key-files:
  created:
    - public/index.html
    - public/js/auth.js
    - vercel.json
  modified: []

key-decisions:
  - "API URL을 각 fetch에 하드코딩하지 않고 MIDDLETON_API 상수로 관리 — 유지보수성 향상"
  - "TTT/FTF 모드의 /api/openai-chat, /api/heygen-* URL은 건드리지 않음 (v5는 STS 전용)"
  - "SAVE_CHAT_API (aiforalab.com) 유지 — 학교서버 직접 호출"
  - "vercel.json에서 /api/(.*) rewrite 제거 — v5는 Vercel Functions 없음"

patterns-established:
  - "MIDDLETON_API 상수 패턴: const MIDDLETON_API = 'https://middleton.p-e.kr/finbot'"

requirements-completed: [FE-01, FE-03]

# Metrics
duration: 2min
completed: 2026-03-25
---

# Phase 3 Plan 01: 프론트엔드 Middleton 연결 Summary

**v3 STS 프론트엔드를 v5에 복사하고 모든 STS API fetch를 MIDDLETON_API 상수 기반 절대경로로 교체하여 Vercel 정적 배포 준비 완료**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-25T05:43:14Z
- **Completed:** 2026-03-25T05:45:11Z
- **Tasks:** 1/2 완료 (Task 2는 인간 검증 대기 중)
- **Files modified:** 3

## Accomplishments

- v3 index.html (2880줄) + auth.js를 v5 public/ 에 복사
- MIDDLETON_API 상수 추가 (줄 1559, SAVE_CHAT_API 바로 위)
- STS 관련 fetch URL 5곳 교체: sts-stream(1) + humelo-tts-stream(1) + humelo-tts(3)
- vercel.json 작성: outputDirectory=public, API rewrite 제거
- GitHub push → Vercel 자동 배포 트리거 (master 브랜치)

## Task Commits

Each task was committed atomically:

1. **Task 1: v3 프론트엔드 복사 + Middleton API URL 교체 + vercel.json** - `5663b57` (feat)

## Files Created/Modified

- `public/index.html` - v3 전체 복사 + MIDDLETON_API 상수 + 5곳 URL 교체 (2883줄)
- `public/js/auth.js` - 카카오 로그인 모듈 (finmarket_db 연동, 266줄)
- `vercel.json` - Vercel 정적 서빙 설정 (outputDirectory=public)

## Decisions Made

- MIDDLETON_API 상수로 API base URL 중앙 관리 — plan에서는 각 fetch에 직접 URL을 제안했으나, 상수 방식이 유지보수성 면에서 우수함
- STS fallback 경로의 humelo-tts fetch(줄 2283)도 교체 — plan에 명시되지 않았으나 STS 코드 경로이므로 일관성을 위해 적용

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] STS fallback 경로 humelo-tts URL 교체**
- **Found during:** Task 1 (URL 교체 작업 중)
- **Issue:** plan에서 명시한 4곳 외에 STS 블로킹 폴백 경로(줄 2283)에도 `fetch('/api/humelo-tts'` 존재
- **Fix:** `fetch(MIDDLETON_API + '/api/humelo-tts'`로 교체
- **Files modified:** public/index.html
- **Verification:** `grep -n "MIDDLETON_API" public/index.html` → 5곳 확인
- **Committed in:** 5663b57 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 - missing critical)
**Impact on plan:** STS 폴백 경로 일관성 확보. 범위 내 수정.

## Issues Encountered

없음 — 계획대로 진행됨

## User Setup Required

없음 — Vercel에 환경변수 없음 (v5는 정적 파일만 배포)

## Next Phase Readiness

- Vercel 배포 완료 (master → Vercel 자동 배포 트리거됨)
- Task 2: https://cha-financial-markets-v5.vercel.app 접속 후 STS E2E 동작 확인 필요
- 확인 항목: STS 모드 버튼 → 마이크 → 질문 → Network 탭에서 middleton.p-e.kr/finbot/api/sts-stream 요청 확인
- nginx 설정이 완료된 상태이면 즉시 테스트 가능

## Self-Check: PASSED

- FOUND: public/index.html
- FOUND: public/js/auth.js
- FOUND: vercel.json
- FOUND commit: 5663b57

---
*Phase: 03-frontend*
*Completed: 2026-03-25*
