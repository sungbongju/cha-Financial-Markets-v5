---
phase: 03-frontend
plan: 02
subsystem: infra
tags: [paramiko, ssh, sftp, pm2, nodejs, deployment]

# Dependency graph
requires:
  - phase: 02-api-server
    provides: "완성된 server/ 코드 (index.js, routes/, scripts/)"
provides:
  - "Middleton 포트 9000에서 finbot-server v0.2.0 실행 중"
  - "scripts/deploy-server.py: paramiko SSH+SFTP 배포 자동화"
affects: [03-frontend]

# Tech tracking
tech-stack:
  added: [paramiko]
  patterns: [paramiko SSH+SFTP 배포, nvm source 선행 npm 실행, PM2 restart 항상 실행 후 헬스체크]

key-files:
  created:
    - scripts/deploy-server.py
  modified: []

key-decisions:
  - ".env 없어도 PM2 재시작 진행 — 서버 기동 가능, Humelo TTS만 키 없으면 실패"
  - "Windows CP949 인코딩 오류 방지: stdout을 UTF-8 TextIOWrapper로 교체"
  - "npm install 시 source ~/.nvm/nvm.sh 선행 필수 (nvm 환경 로드)"

patterns-established:
  - "배포 스크립트: 파일전송 → npm install → .env 확인(경고) → PM2 restart → 헬스체크 순서"
  - "run_cmd(): SSH exec_command 래핑, stdout/stderr 모두 출력"

requirements-completed: [FE-01]

# Metrics
duration: 3min
completed: 2026-03-25
---

# Phase 3 Plan 02: 서버 배포 Summary

**paramiko SSH+SFTP로 server/ v0.2.0을 Middleton에 배포, PM2 finbot-server 재시작 및 헬스체크 통과**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-25T05:43:55Z
- **Completed:** 2026-03-25T05:46:20Z
- **Tasks:** 1 (+ 1 auto-fix)
- **Files modified:** 1

## Accomplishments
- scripts/deploy-server.py 작성: paramiko SSH+SFTP 자동 배포
- server/ 9개 파일 Middleton /home/student04/finbot/server/에 전송
- npm install --production 원격 실행 (dotenv 포함 67패키지)
- PM2 finbot-server 재시작 → version 0.2.0 확인 (curl localhost:9000/health)

## Task Commits

Each task was committed atomically:

1. **Task 1: paramiko 배포 스크립트 작성 및 실행** - `99bf70e` (feat)
2. **Auto-fix: Windows CP949 인코딩 오류 수정** - `98475e2` (fix)

**Plan metadata:** (이후 docs 커밋)

## Files Created/Modified
- `scripts/deploy-server.py` - paramiko SSH+SFTP 배포 자동화 스크립트

## Decisions Made
- `.env` 없어도 PM2 재시작을 진행: 서버 자체는 기동 가능하고 HUMELO_API_KEY는 사용자가 별도로 설정해야 하므로, 코드 배포와 환경변수 설정을 분리함
- Windows git bash 환경에서 Python stdout이 CP949일 경우 UTF-8 TextIOWrapper로 교체하는 패턴 적용
- `source ~/.nvm/nvm.sh`를 npm/npx 명령 앞에 항상 선행: exec_command는 로그인 셸이 아니므로 nvm PATH가 없음

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Windows CP949 인코딩 오류로 스크립트 실행 실패**
- **Found during:** Task 1 검증 실행
- **Issue:** em dash(—) 등 특수문자가 Windows CP949 stdout에서 UnicodeEncodeError 발생
- **Fix:** 스크립트 상단에 stdout을 UTF-8 TextIOWrapper로 교체하는 코드 추가, em dash를 하이픈으로 교체
- **Files modified:** scripts/deploy-server.py
- **Verification:** python scripts/deploy-server.py → SUCCESS: Server is healthy. 정상 출력
- **Committed in:** 98475e2 (auto-fix 커밋)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** 기능 자체는 변경 없음, Windows 환경 호환성만 수정. 스코프 확장 없음.

## Issues Encountered
- `.env` 파일이 서버에 없어 초기 스크립트 실행 시 PM2 재시작이 건너뛰어짐. 스크립트 로직을 수정하여 .env 존재와 무관하게 PM2 재시작 진행하도록 개선.
- `source ~/.nvm/nvm.sh` 없으면 npm 명령 실패. exec_command는 비로그인 셸이므로 nvm 환경 로드 필요.

## User Setup Required

HUMELO_API_KEY 환경변수를 서버에 설정해야 Humelo TTS 라우트가 동작합니다:

```bash
echo "HUMELO_API_KEY=<your-key>" > /home/student04/finbot/server/.env
cd ~/finbot && source ~/.nvm/nvm.sh && npx pm2 restart finbot-server
curl http://localhost:9000/health
```

현재 상태: `/health` 엔드포인트는 정상 응답 (HUMELO_API_KEY 없어도 서버 기동됨)

## Next Phase Readiness
- finbot-server v0.2.0이 Middleton 포트 9000에서 실행 중
- 프론트엔드가 middleton.p-e.kr/finbot/api/* 로 요청 가능 (nginx 리버스 프록시 설정 필요)
- HUMELO_API_KEY 설정 후 Humelo TTS 스트리밍 전체 파이프라인 동작 가능

## Self-Check: PASSED

- FOUND: scripts/deploy-server.py
- FOUND: .planning/phases/03-frontend/03-02-SUMMARY.md
- FOUND: commit 99bf70e (feat: 배포 스크립트)
- FOUND: commit 98475e2 (fix: CP949 인코딩)

---
*Phase: 03-frontend*
*Completed: 2026-03-25*
