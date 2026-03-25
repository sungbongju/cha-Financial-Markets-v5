# nginx 리버스 프록시 설정 요청

**요청 일자:** 2026-03-25
**요청자:** student04 (finbot 프로젝트)

---

## 목적

Middleton 서버에서 실행 중인 finbot API 서버(Express, 포트 9000)를
`middleton.p-e.kr/finbot/` 경로를 통해 외부에서 접근할 수 있도록
nginx 리버스 프록시 location 블록 추가를 요청드립니다.

---

## 현재 서버 상태

| 항목 | 내용 |
|------|------|
| 서버 경로 | `/home/student04/finbot/server/index.js` |
| 바인딩 주소 | `127.0.0.1:9000` (로컬 전용, 외부 직접 접근 차단) |
| 프로세스 관리 | PM2 (`finbot-server` 이름으로 online 상태) |
| 자동 시작 | `crontab @reboot`으로 서버 재부팅 시 자동 실행 |
| 헬스체크 | `curl http://localhost:9000/health` → 200 OK |

---

## 요청하는 nginx location 블록

아래 설정을 `middleton.p-e.kr` 서버 블록 내에 추가 부탁드립니다.
**(복붙 가능)**

```nginx
location /finbot/ {
    proxy_pass http://127.0.0.1:9000/;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_cache off;
    chunked_transfer_encoding on;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 120s;
    proxy_connect_timeout 10s;
}
```

---

## 설정 후 확인 방법

nginx 설정 적용 후 아래 명령으로 동작을 확인할 수 있습니다:

```bash
curl https://middleton.p-e.kr/finbot/health
# 예상 응답:
# {"status":"ok","server":"finbot-middleton","version":"0.1.0","timestamp":"..."}
```

---

## 참고사항

| 설정 | 이유 |
|------|------|
| `proxy_buffering off` | SSE(Server-Sent Events) 스트리밍 응답 즉시 전달 필수 |
| `proxy_http_version 1.1` + `Connection ''` | keep-alive 연결 유지 (SSE 스트리밍 지원) |
| `proxy_read_timeout 120s` | LLM(엑사원) 응답 대기 시간 — 기본 60s로는 부족 |
| `chunked_transfer_encoding on` | 스트리밍 청크 전송 인코딩 활성화 |
| `proxy_pass` 끝 `/` | `/finbot/` prefix를 제거하고 서버에 전달 |

---

## WebSocket 지원 (선택 사항)

향후 WebSocket이 필요할 경우 아래 두 줄을 location 블록에 추가하면 됩니다:

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection 'upgrade';
```

현재 단계(Phase 1-2)에서는 SSE 스트리밍만 사용하므로 필수는 아닙니다.

---

*문의사항은 student04 계정으로 연락 주세요.*
