# OpenAI Service Design

아르바이트 권리 관리 AI 서비스 구현 프로젝트입니다. FE는 React/Vite 기반으로 전환했고, 이후 BE와 LLM 연동을 붙일 수 있도록 디렉토리를 분리했습니다.

## 디렉토리 구조

```text
FinalProject/
  FE/      React/Vite 프론트엔드
  BE/      백엔드 API 구현 예정 영역
  docs/    기획, 실행 방법, 구현 메모
```

## FE 실행

```powershell
cd FE
npm install
npm run dev
```

운영 빌드는 아래 명령으로 확인합니다.

```powershell
cd FE
npm run build
```

상세 구현 범위는 `docs/FE_PROTOTYPE.md`에 정리했습니다.
