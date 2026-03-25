---
phase: 01-server-env
plan: 01
subsystem: infra
tags: [nvm, nodejs, express, pm2, nginx, sse, crontab]

# Dependency graph
requires: []
provides:
  - Express 헬스체크 서버 포트 9000 (127.0.0.1 바인딩, PM2 관리)
  - nvm + Node.js v24.14.1 on Middleton student04 계정
  - crontab @reboot 기반 PM2 자동 시작
  - nginx location /finbot/ 요청서 (SSE 스트리밍 설정 포함)
affects:
  - 02-api-server
  - 03-frontend

# Tech tracking
tech-stack:
  added: [express@latest, nvm, pm2 (npx), crontab]
  patterns:
    - 127.0.0.1 바인딩으로 직접 외부 노출 차단, nginx 프록시만 허용
    - npx pm2 사용 (전역 설치 없이)
    - crontab @reboot으로 pm2 resurrect (sudo pm2 startup 대체)

key-files:
  created:
    - server/index.js
    - server/package.json
    - docs/nginx-proxy-request.md
  modified: []

key-decisions:
  - "npx pm2 사용 — sudo 없이 전역 설치 불가, npx로 대체"
  - "crontab @reboot으로 pm2 resurrect — pm2 startup은 sudo 필요"
  - "127.0.0.1:9000 바인딩 — 직접 외부 접근 차단, nginx 프록시 전용"
  - "proxy_read_timeout 120s — 엑사원 LLM 응답 대기 (기본 60s 부족)"

patterns-established:
  - "SSE 패턴: proxy_buffering off + proxy_http_version 1.1 + Connection '' 필수"
  - "PM2 자동시작: crontab @reboot + pm2 resurrect (sudo 없는 환경)"

requirements-completed: [ENV-01, ENV-02, ENV-03]

# Metrics
duration: ~20min (continuation — Task 3만 신규 실행)
completed: 2026-03-25
---

# Phase 1 Plan 1: Server Environment Summary

**nvm + Node.js v24.14.1, PM2 finbot-server, crontab 자동시작, nginx SSE 프록시 요청서를 Middleton student04 계정에 구축**

## Performance

- **Duration:** ~20min (Task 1-2는 이전 세션, Task 3 신규)
- **Started:** 2026-03-25T04:59:47Z
- **Completed:** 2026-03-25T05:00:00Z (approx)
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Middleton student04 계정에 nvm + Node.js v24.14.1 설치 완료
- Express 헬스체크 서버 (포트 9000, 127.0.0.1 바인딩) PM2로 상시 실행
- crontab @reboot으로 재부팅 후 자동 시작 설정 (sudo 없이)
- 교수님께 전달 가능한 nginx location 블록 요청서 작성 (SSE 스트리밍 설정 포함)

## Task Commits

각 태스크는 개별 커밋으로 완료:

1. **Task 1: Middleton Node.js/nvm 환경 구축** - `6feb3d9` (feat)
2. **Task 2: Express 헬스체크 서버 PM2 실행** - `fa864f8` (feat)
3. **Task 3: nginx 리버스 프록시 요청서 작성** - `38ca890` (docs)

## Files Created/Modified

- `server/index.js` — Express 헬스체크 서버 (GET /health, 포트 9000)
- `server/package.json` — finbot-server 프로젝트 메타데이터, express 의존성
- `docs/nginx-proxy-request.md` — 교수님용 nginx location 블록 요청서

## Decisions Made

- **npx pm2 사용**: sudo 없이 전역 npm 설치 불가 → npx pm2로 대체
- **crontab @reboot**: `pm2 startup`은 sudo 필요 → crontab `@reboot pm2 resurrect`로 대체
- **127.0.0.1 바인딩**: 포트 9000을 로컬 전용으로 제한, nginx 프록시를 통해서만 외부 노출
- **proxy_read_timeout 120s**: 엑사원 LLM 응답이 최대 ~30s 소요 → 기본 nginx 60s timeout 부족

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Checkpoint: Task 1-2 완료 후 사람이 직접 SSH 접속하여 서버 상태를 확인했으며 approved 응답 받음
  - Node.js v24.14.1 확인 (v20.x/v22.x 예상보다 최신 버전)
  - PM2 finbot-server online 상태 확인
  - curl localhost:9000/health 200 OK 확인

## User Setup Required

nginx 설정은 교수님(서버 관리자)이 직접 적용해야 합니다.
요청서 위치: `docs/nginx-proxy-request.md`

적용 후 확인:
```bash
curl https://middleton.p-e.kr/finbot/health
# {"status":"ok","server":"finbot-middleton","version":"0.1.0","timestamp":"..."}
```

## Next Phase Readiness

- Phase 2 (API 서버) 진입 가능: Node.js + PM2 환경 준비 완료
- nginx 설정은 교수님 승인 후 완료 예정 (비동기 진행 가능)
- Phase 2에서 server/index.js에 엑사원 + Humelo SSE 스트리밍 라우트 추가 예정
- Humelo DIVE Streaming 키/엔드포인트 재확인 필요 (Phase 2 시작 전)

---
*Phase: 01-server-env*
*Completed: 2026-03-25*

## Self-Check: PASSED

- FOUND: docs/nginx-proxy-request.md
- FOUND: server/index.js
- FOUND: server/package.json
- FOUND: .planning/phases/01-server-env/01-01-SUMMARY.md
- FOUND commit: 6feb3d9 (Task 1)
- FOUND commit: fa864f8 (Task 2)
- FOUND commit: 38ca890 (Task 3)
