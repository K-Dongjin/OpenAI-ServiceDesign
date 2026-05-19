# BE

알바권리 AI 서비스의 Express 기반 백엔드입니다. 현재는 DB 없이 메모리 저장소로 동작하며, 서버 재시작 시 데이터가 초기화됩니다.

## 실행

```powershell
cd BE
npm install
npm run dev
```

기본 포트는 `4000`입니다.

```text
http://127.0.0.1:4000
```

## 검증

```powershell
cd BE
npm run check
npm run smoke
```

## 현재 구현 범위

- `GET /health`
- `GET /api/v1/jobs`
- `POST /api/v1/jobs`
- `GET /api/v1/jobs/:jobId`
- `PATCH /api/v1/jobs/:jobId`
- `DELETE /api/v1/jobs/:jobId`
- `GET /api/v1/jobs/:jobId/checks`
- `GET /api/v1/jobs/:jobId/work-logs`
- `POST /api/v1/jobs/:jobId/work-logs`
- `PATCH /api/v1/work-logs/:logId`
- `DELETE /api/v1/work-logs/:logId`
- `GET /api/v1/jobs/:jobId/payroll`
- `POST /api/v1/payroll/preview`
- `POST /api/v1/chat/messages`
- `GET /api/v1/chat/messages`
- `GET /api/v1/references/minimum-wages`
- `GET /api/v1/references/consultation-links`

상세 API 계약은 `docs/API.md`를 기준으로 합니다.
