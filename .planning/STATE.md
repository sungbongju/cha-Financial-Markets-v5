---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: completed
stopped_at: "Checkpoint: Task 2 인간 검증 대기 (03-01-PLAN.md)"
last_updated: "2026-03-25T05:46:11.616Z"
last_activity: 2026-03-25 — Phase 2 Plan 2 완료 (DB 저장 + TTS 캐시 + 배치 스크립트)
progress:
  total_phases: 3
  completed_phases: 2
  total_plans: 5
  completed_plans: 4
  percent: 67
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-25)

**Core value:** 엑사원 localhost + Humelo 스트리밍 파이프라이닝으로 STS 레이턴시 최소화
**Current focus:** Phase 1 - 서버 환경

## Current Position

Phase: 2 of 3 (API 서버)
Plan: 2 of 2 in current phase
Status: Phase 2 Complete
Last activity: 2026-03-25 — Phase 2 Plan 2 완료 (DB 저장 + TTS 캐시 + 배치 스크립트)

Progress: [███████░░░] 67%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

*Updated after each plan completion*
| Phase 01-server-env P01 | 20 | 3 tasks | 3 files |
| Phase 02-api-server P01 | 4 | 2 tasks | 6 files |
| Phase 02-api-server P02 | 3 | 2 tasks | 5 files |
| Phase 03-frontend P01 | 2 | 1 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Setup]: student04 계정 내(sudo 없음, /home/student04/)에서만 작업
- [Setup]: Node.js 없으면 nvm으로 설치, PM2로 서비스 관리
- [Setup]: 포트 9000, nginx 리버스 프록시는 교수님 요청으로 처리
- [API]: v3 코드(sts-stream.js, humelo-tts.js 등) 재사용 — 검증된 SSE 스트리밍 로직
- [Phase 01-server-env]: npx pm2 사용 — sudo 없이 전역 설치 불가, npx로 대체
- [Phase 01-server-env]: crontab @reboot으로 pm2 resurrect — pm2 startup은 sudo 필요
- [Phase 01-server-env]: proxy_read_timeout 120s — 엑사원 LLM 응답 대기용
- [Phase 02-api-server]: EXAONE_BASE_URL 기본값=127.0.0.1:19000 (localhost 직접 호출, 네트워크 홉 0)
- [Phase 02-api-server]: AbortController.abort() + clientDisconnected 동시 실행으로 인터럽트 강화 (STS-06)
- [Phase 02-api-server]: CORS 와일드카드 * 제거, ALLOWED_ORIGINS 명시적 배열로 교체 (FE-02)
- [Phase 02-api-server P02]: 캐시 키 MD5(text.trim().toLowerCase()) — 대소문자/공백 정규화로 히트율 향상
- [Phase 02-api-server P02]: tmp→renameSync 원자적 쓰기 — 불완전 캐시 파일로 인한 오디오 재생 오류 방지
- [Phase 02-api-server P02]: 배치 스크립트 순차 실행 + 500ms 딜레이 — Humelo API 레이트 리밋 방지
- [Phase 03-frontend]: MIDDLETON_API 상수로 API base URL 중앙 관리 — fetch별 직접 URL 대신 상수 사용
- [Phase 03-frontend]: vercel.json: /api/(.*) rewrite 제거 — v5는 Vercel Functions 없음, 정적 서빙만

### Pending Todos

None yet.

### Blockers/Concerns

- nginx location 블록 추가는 교수님 승인 필요 (요청서 작성 완료, 전달 대기 중)
- Humelo DIVE Streaming 키/엔드포인트 재확인 필요 (Phase 2 시작 전)

### Resolved

- [완료] Node.js v24.14.1 + nvm Middleton 설치 확인 (Phase 1)

## Session Continuity

Last session: 2026-03-25T05:46:11.612Z
Stopped at: Checkpoint: Task 2 인간 검증 대기 (03-01-PLAN.md)
Resume file: None
