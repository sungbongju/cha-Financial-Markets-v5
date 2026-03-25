# Requirements: 금융상품매뉴얼 v5

**Defined:** 2026-03-25
**Core Value:** 엑사원 localhost + Humelo 스트리밍 파이프라이닝으로 STS 레이턴시 최소화

## v1 Requirements

### 서버 환경

- [x] **ENV-01**: Middleton에 Node.js 환경 구축 (nvm, student04 계정 내)
- [x] **ENV-02**: Express API 서버가 PM2로 포트 9000에서 상시 실행
- [x] **ENV-03**: nginx 리버스 프록시 설정 요청서 작성 (교수님용)

### STS 파이프라인

- [x] **STS-01**: SSE 스트리밍으로 엑사원 localhost(127.0.0.1:19000) 호출 + 한국어 문장 단위 감지
- [x] **STS-02**: Humelo DIVE Streaming TTS 직접 호출 (prosody-api, 0.3초 내 첫 청크 전달)
- [x] **STS-03**: Humelo Standard TTS 폴백 (스트리밍 실패 시 supabase 엔드포인트)
- [x] **STS-04**: 엑사원 Deep thought 태그 필터링 (<thought>...</thought> 제거)
- [x] **STS-05**: 한국어 TTS 발음 후처리 (ETF→이티에프, CMA→씨엠에이 등)
- [x] **STS-06**: 인터럽트 (사용자 발화 시 현재 TTS 중단)

### 데이터

- [ ] **DATA-01**: 학교서버(aiforalab.com) DB에 대화 기록 비동기 POST 저장
- [ ] **DATA-02**: TTS 캐시 시스템 (IndexedDB, 사용자 질문 기반 키)
- [ ] **DATA-03**: 사전 생성 캐시 배치 스크립트 (38개 상품 기본 답변 mp3)

### 프론트엔드

- [ ] **FE-01**: Vercel 프론트엔드 배포 (STS API URL을 Middleton nginx 프록시로)
- [x] **FE-02**: CORS 설정 (cha-financial-markets-v5.vercel.app 허용)
- [ ] **FE-03**: STS 모드 UI (채팅 버블 + 음성 상태 표시)

## v2 Requirements

### 고도화

- **ADV-01**: WebSocket 소켓 분리 (인풋/아웃풋 독립)
- **ADV-02**: 실시간 오디오 스트리밍 (PCM 청크 직접 재생)
- **ADV-03**: Humelo 보이스클로닝 (교수님 음성)

## Out of Scope

| Feature | Reason |
|---------|--------|
| FTF 아바타 모드 | v4(LiveAvatar) 또는 OpenAvatarChat에서 별도 처리 |
| TTT 텍스트 모드 | 기존 Vercel API 그대로 유지 |
| 서버 인프라 변경 | 방화벽/nginx/시스템설정 직접 수정 안 함 |
| 학교서버 DB 스키마 변경 | 기존 api.php 그대로 사용 |
| OpenAvatarChat 통합 | 별도 프로젝트로 유지 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENV-01 | Phase 1 | Complete |
| ENV-02 | Phase 1 | Complete |
| ENV-03 | Phase 1 | Complete |
| STS-01 | Phase 2 | Complete |
| STS-02 | Phase 2 | Complete |
| STS-03 | Phase 2 | Complete |
| STS-04 | Phase 2 | Complete |
| STS-05 | Phase 2 | Complete |
| STS-06 | Phase 2 | Complete |
| DATA-01 | Phase 2 | Pending |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 2 | Pending |
| FE-01 | Phase 3 | Pending |
| FE-02 | Phase 2 | Complete |
| FE-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Traceability updated: 2026-03-25*
