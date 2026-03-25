# Roadmap: 금융상품매뉴얼 v5

## Overview

Middleton 서버에 Node.js API 서버를 구축하고, 검증된 v3 코드를 Express로 포팅하여 엑사원 localhost 직접 호출과 Humelo 스트리밍 TTS 파이프라이닝을 실현한다. 마지막으로 Vercel 프론트엔드가 Middleton을 바라보도록 연결하여 STS 음성 응답 레이턴시를 최소화한다.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: 서버 환경** - Middleton에 Node.js/PM2 설치 및 서버 실행 기반 구축 (completed 2026-03-25)
- [x] **Phase 2: API 서버** - v3 코드를 Express로 포팅하여 STS 파이프라인 완성 (completed 2026-03-25)
- [ ] **Phase 3: 프론트엔드 연동** - Vercel 프론트엔드 배포 및 Middleton 연결

## Phase Details

### Phase 1: 서버 환경
**Goal**: Middleton(student04 계정)에서 Express 서버가 PM2로 상시 실행되고, nginx 프록시 요청서가 준비된다
**Depends on**: Nothing (first phase)
**Requirements**: ENV-01, ENV-02, ENV-03
**Success Criteria** (what must be TRUE):
  1. student04@Middleton에서 `node --version`과 `pm2 --version`이 정상 출력된다
  2. `curl http://localhost:9000/health`가 200 OK를 반환한다
  3. PM2가 서버 프로세스를 관리하며 재부팅 후에도 자동 시작된다
  4. nginx 리버스 프록시 location 블록 요청서가 교수님께 전달 가능한 형태로 작성되어 있다
**Plans**: 1 plan

Plans:
- [ ] 01-01-PLAN.md — nvm/Node.js 설치, Express 헬스체크 서버 PM2 실행, nginx 요청서 작성

### Phase 2: API 서버
**Goal**: v3의 검증된 SSE 스트리밍, Humelo TTS, 엑사원 호출 로직이 Middleton Express 서버에서 동작한다
**Depends on**: Phase 1
**Requirements**: STS-01, STS-02, STS-03, STS-04, STS-05, STS-06, DATA-01, DATA-02, DATA-03, FE-02
**Success Criteria** (what must be TRUE):
  1. `POST /api/sts-stream` 요청 시 엑사원 localhost에서 응답이 오고 SSE로 문장 단위 청크가 스트리밍된다
  2. 첫 번째 TTS 청크가 0.3초 이내에 클라이언트에 도달한다 (Humelo DIVE Streaming)
  3. Humelo 스트리밍 실패 시 Standard TTS로 자동 폴백되어 응답이 끊기지 않는다
  4. `<thought>` 태그와 ETF/CMA 발음 후처리가 적용된 텍스트가 TTS로 전달된다
  5. 사용자 인터럽트 요청 시 진행 중인 TTS 스트림이 즉시 중단된다
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — sts-stream, humelo-tts, humelo-tts-stream 포팅 및 CORS 설정 (Wave 1)
- [x] 02-02-PLAN.md — DB 비동기 저장, TTS 파일 캐시, 배치 스크립트 (Wave 2)

### Phase 3: 프론트엔드 연동
**Goal**: Vercel 프론트엔드가 Middleton API를 바라보며 STS 음성 대화가 엔드-투-엔드로 동작한다
**Depends on**: Phase 2
**Requirements**: FE-01, FE-03
**Success Criteria** (what must be TRUE):
  1. `cha-financial-markets-v5.vercel.app`에서 STS 모드를 시작하면 Middleton API에 요청이 도달한다
  2. 음성 질문 후 첫 번째 TTS 재생까지 체감 레이턴시가 v3(Vercel 경유)보다 줄어든다
  3. 채팅 버블에 응답 텍스트가 표시되고 음성 상태(듣는 중/생각 중/말하는 중)가 시각적으로 구분된다
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — v3 프론트엔드 복사 + Middleton API URL 교체 + Vercel 배포 (Wave 1)
- [ ] 03-02-PLAN.md — paramiko로 server/ 코드 Middleton 배포 + PM2 재시작 (Wave 1)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 서버 환경 | 1/1 | Complete   | 2026-03-25 |
| 2. API 서버 | 2/2 | Complete   | 2026-03-25 |
| 3. 프론트엔드 연동 | 1/2 | In Progress|  |
