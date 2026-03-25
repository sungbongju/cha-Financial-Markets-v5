# 금융상품매뉴얼 v5 — Middleton 통합 API

## What This Is

차의과학대학교 경영학전공 금융상품 상담 봇의 STS(음성대화) 백엔드를 Middleton 서버에서 직접 처리하는 통합 API 서버. 기존 v3(Vercel 경유)의 레이턴시를 줄이기 위해 LLM(엑사원) + TTS(Humelo DIVE) 호출을 한 곳에서 파이프라이닝한다.

## Core Value

**엑사원 LLM을 localhost로 호출하여 네트워크 홉을 제거하고, Humelo 스트리밍 TTS와 파이프라이닝하여 STS 음성 응답 레이턴시를 최소화한다.**

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Middleton Node.js API 서버 (Express, PM2)
- [ ] SSE 스트리밍 엔드포인트 (엑사원 스트리밍 + 문장 감지 + Humelo TTS)
- [ ] Humelo DIVE Streaming TTS 프록시 (진짜 스트리밍, 0.3초 내 재생)
- [ ] Humelo Standard TTS 폴백
- [ ] 엑사원 localhost 호출 (네트워크 홉 0)
- [ ] 학교서버 DB 저장 (비동기 백그라운드)
- [ ] CORS 설정 (Vercel 프론트엔드 허용)
- [ ] TTS 발음 후처리 (ETF→이티에프 등)
- [ ] thought 태그 필터링 (엑사원 Deep)
- [ ] 한국어 문장 경계 감지
- [ ] TTS 캐시 시스템 (IndexedDB + 사전 생성)
- [ ] Vercel 프론트엔드 (API URL만 Middleton으로 변경)
- [ ] nginx 리버스 프록시 설정 요청서 (교수님용)
- [ ] 인터럽트 (발화 중 끊기)

### Out of Scope

- FTF 아바타 모드 — v4(LiveAvatar) 또는 OpenAvatarChat에서 별도 처리
- TTT 텍스트 모드 — 기존 Vercel API 그대로 유지
- 서버 인프라 변경 — 방화벽/nginx/시스템설정 직접 수정 안 함
- 학교서버 DB 스키마 변경 — 기존 api.php 그대로 사용
- OpenAvatarChat 통합 — 별도 프로젝트로 유지

## Context

- **Middleton 서버**: 1.223.219.123:7822, student04/chacha2025, Ubuntu 22.04, RTX 3090×8
- **엑사원**: `http://127.0.0.1:19000/v1` (llm-router, localhost), model: exaone-deep-32b, api_key: router-key
- **Humelo DIVE API**: Streaming `https://prosody-api.humelo.works/api/v1/dive/stream`, Standard `https://agitvxptajouhvoatxio.supabase.co/functions/v1/dive-synthesize-v1`
- **Humelo 스트리밍 권한**: 승인 완료 (03-25)
- **학교서버 API**: `https://aiforalab.com/finmarket-api/api.php` (finmarket_db)
- **기존 v3 코드**: `cha-Financial-Markets-v3/api/` — sts-stream.js, humelo-tts.js, humelo-tts-stream.js, openai-chat.js 재사용
- **Vercel 프론트**: `cha-financial-markets-v5.vercel.app` (예정)
- **nginx**: `middleton.p-e.kr/finbot/` → localhost:9000 (교수님 설정 요청 필요)
- **student04 제약**: sudo 없음, /home/student04/ 내에서만 작업

## Constraints

- **서버 범위**: student04 계정 내에서만 작업 (서버 인프라 직접 변경 금지)
- **nginx**: 교수님한테 location 블록 추가 요청 (직접 수정 불가)
- **GPU 불필요**: API 프록시 역할만 (LLM/TTS는 외부 서비스)
- **Node.js**: Middleton에 설치 여부 확인 필요 (없으면 nvm으로 설치)
- **포트**: 9000 (내부 전용, nginx 프록시)
- **비용**: Humelo API만 유료 (엑사원/Edge TTS 무료)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Middleton에서 API 직접 처리 | Vercel 경유 시 홉 6회 → 2회로 감소, 엑사원 localhost 호출 | — Pending |
| PM2로 서비스 관리 | Docker 대비 간단, GPU 불필요 | — Pending |
| v3 코드 재사용 | 검증된 SSE 스트리밍 + 문장 감지 로직 | — Pending |
| Express.js 서버 | v3 Vercel serverless와 호환, 코드 변환 최소화 | — Pending |
| Humelo 스트리밍 우선 + Standard 폴백 | 0.3초 vs 2초 레이턴시 차이 | — Pending |

---
*Last updated: 2026-03-25 after initialization*
