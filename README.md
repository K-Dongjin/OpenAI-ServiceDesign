# OpenAI Service Design

아르바이트 권리 관리 AI 서비스 구현 프로젝트입니다. FE는 React/Vite 기반으로 전환했고, 이후 BE와 LLM 연동을 붙일 수 있도록 디렉토리를 분리했습니다.

## 디렉토리 구조

```text
FinalProject/
  FE/      React/Vite 프론트엔드
  BE/      Express 백엔드 API
  docs/    기획, 실행 방법, 구현 메모
```

## FE 실행

```powershell
cd FE
npm install
npm run dev
```

FE는 기본적으로 `http://127.0.0.1:4000`의 BE API와 연동합니다. 앱 시작 시 `GET /health`, `GET /api/v1/jobs`, `GET /api/v1/jobs/:jobId/work-logs`를 호출하고, 근무 조건과 근무 기록 저장 시 BE API를 사용합니다. 다른 BE 주소를 사용할 때는 `VITE_API_BASE_URL`을 설정합니다.

운영 빌드는 아래 명령으로 확인합니다.

```powershell
cd FE
npm run build
```

상세 구현 범위는 `docs/FE_PROTOTYPE.md`에 정리했습니다.

## BE 실행

```powershell
cd BE
npm install
npm run dev
```

API 계약은 `docs/API.md`에 정리했습니다.
