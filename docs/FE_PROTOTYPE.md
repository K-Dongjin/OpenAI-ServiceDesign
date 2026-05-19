# 알바권리 AI FE Prototype

아르바이트를 처음 시작하는 사용자가 근무 조건을 저장하고, 출퇴근 기록과 예상 급여를 확인하며, 계약서/급여/퇴사 상황에 대한 상담 초안을 볼 수 있는 React/Vite 프론트엔드 프로토타입입니다.

## 실행

```powershell
cd FE
npm install
npm run dev
```

빌드 검증은 아래 명령을 사용합니다.

```powershell
cd FE
npm run build
```

## 현재 구현 범위

- 홈 대시보드
- BE health check 연결 상태 표시
- 알바 시작 전 근무 조건 입력 및 jobs API 저장/조회
- 계약서, 최저임금, 주휴수당, 휴게시간 체크리스트
- 날짜별 출퇴근 기록 입력 및 work-logs API 저장/조회/삭제
- 월별 예상 급여와 실제 입금액 비교
- 계약서/급여/퇴사 질문에 대한 챗봇 응답 프로토타입

근무 조건은 BE `jobs` API에, 근무 기록은 BE `work-logs` API에 우선 저장합니다. BE 연결 실패 시에는 브라우저 저장소인 `localStorage`를 fallback으로 사용하므로 입력 흐름은 유지됩니다.

## 코드 구조

```text
FE/src/
  api/         BE API 클라이언트
  components/  공통 UI
  pages/       화면 단위 컴포넌트
  utils/       급여 계산, 저장소, 챗봇 응답 로직
```

## 참고 데이터

2026년 최저임금 기본값은 최저임금위원회 공개 자료의 시간급 10,320원을 기준으로 설정했습니다. 앱 화면에서 기준 시급은 직접 수정할 수 있습니다.

- 출처: https://www.minimumwage.go.kr/customer/notice/view.do?bultnId=4657
