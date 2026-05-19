# API 설계 문서

알바권리 AI 서비스의 FE-BE 연동을 위한 MVP API 계약입니다. 현재 FE는 `localStorage`에 근무 조건, 근무 기록, 급여 확인값, 상담 메시지를 저장하고 있으므로, BE 1차 구현은 이 상태 모델을 서버 저장/API 응답으로 옮기는 것을 목표로 합니다.

## 기본 규칙

- Base URL: `/api/v1`
- Request/Response 형식: JSON
- 날짜 형식: `YYYY-MM-DD`
- 월 형식: `YYYY-MM`
- 시간 형식: `HH:mm` 24시간 표기
- 금액 단위: 원, 정수
- 시간 단위: 시간은 소수 허용, 휴게시간은 분 단위 정수
- 인증: MVP에서는 미적용. 추후 사용자 계정이 생기면 모든 리소스는 사용자 단위로 격리합니다.

## 공통 응답

성공 응답은 각 API의 리소스 객체를 그대로 반환합니다.

에러 응답은 아래 형식을 사용합니다.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값을 확인하세요.",
    "details": [
      {
        "field": "hourlyWage",
        "message": "시급은 0 이상이어야 합니다."
      }
    ]
  }
}
```

주요 상태 코드:

- `200 OK`: 조회, 수정, 계산 성공
- `201 Created`: 생성 성공
- `204 No Content`: 삭제 성공
- `400 Bad Request`: 요청 형식 또는 검증 실패
- `404 Not Found`: 리소스 없음
- `500 Internal Server Error`: 서버 오류

## 데이터 모델

### Job

근무지와 근무 조건입니다.

```json
{
  "id": "job_01HZX...",
  "workplace": "카페 오후 알바",
  "hourlyWage": 10320,
  "minimumWage": 10320,
  "startDate": "2026-05-19",
  "payDay": 25,
  "weeklyDays": 3,
  "dailyHours": 5,
  "contractStatus": "none",
  "weeklyIncluded": false,
  "createdAt": "2026-05-19T06:00:00.000Z",
  "updatedAt": "2026-05-19T06:00:00.000Z"
}
```

`contractStatus` 값:

- `none`: 아직 작성 전
- `planned`: 작성 예정
- `signed`: 작성 완료

### WorkLog

하루 단위 근무 기록입니다.

```json
{
  "id": "log_01HZY...",
  "jobId": "job_01HZX...",
  "date": "2026-05-20",
  "clockIn": "18:00",
  "clockOut": "23:30",
  "breakMinutes": 30,
  "memo": "30분 연장",
  "workedHours": 5,
  "createdAt": "2026-05-20T14:40:00.000Z",
  "updatedAt": "2026-05-20T14:40:00.000Z"
}
```

`workedHours`는 서버가 계산해 응답합니다. `clockOut`이 `clockIn`보다 이르거나 같으면 익일 퇴근으로 계산합니다.

### PayrollResult

월별 급여 계산 결과입니다.

```json
{
  "jobId": "job_01HZX...",
  "month": "2026-05",
  "totalHours": 72,
  "basePay": 743040,
  "weeklyAllowance": 82560,
  "expectedPay": 825600,
  "actualPaid": 720000,
  "difference": -105600,
  "notes": [
    "세금, 4대보험, 식대, 지각 및 조퇴 처리에 따라 실제 입금액은 달라질 수 있습니다.",
    "차이가 있으면 급여명세서와 공제 내역을 먼저 확인하세요."
  ]
}
```

### CheckItem

시작 전 점검 항목입니다.

```json
{
  "status": "warn",
  "title": "주휴수당 가능성",
  "body": "예정 근무가 주 15시간 이상입니다. 주휴수당 포함 여부와 개근 조건을 확인하세요."
}
```

`status` 값:

- `ok`
- `warn`
- `danger`

### ChatMessage

상담 메시지입니다.

```json
{
  "id": "msg_01HZZ...",
  "role": "assistant",
  "text": "근로계약서는 근무 시작 전에 작성하는 것이 안전합니다.",
  "createdAt": "2026-05-19T07:00:00.000Z"
}
```

`role` 값:

- `user`
- `assistant`

## API 목록

### 상태 확인

#### `GET /health`

서버 상태를 확인합니다.

Response:

```json
{
  "status": "ok",
  "service": "openai-service-design-be"
}
```

## 근무 조건 API

### `GET /api/v1/jobs`

저장된 근무 조건 목록을 조회합니다. MVP에서는 여러 근무지를 대비해 배열로 반환합니다.

Response:

```json
{
  "jobs": [
    {
      "id": "job_01HZX...",
      "workplace": "카페 오후 알바",
      "hourlyWage": 10320,
      "minimumWage": 10320,
      "startDate": "2026-05-19",
      "payDay": 25,
      "weeklyDays": 3,
      "dailyHours": 5,
      "contractStatus": "none",
      "weeklyIncluded": false,
      "createdAt": "2026-05-19T06:00:00.000Z",
      "updatedAt": "2026-05-19T06:00:00.000Z"
    }
  ]
}
```

### `POST /api/v1/jobs`

근무 조건을 생성합니다.

Request:

```json
{
  "workplace": "카페 오후 알바",
  "hourlyWage": 10320,
  "minimumWage": 10320,
  "startDate": "2026-05-19",
  "payDay": 25,
  "weeklyDays": 3,
  "dailyHours": 5,
  "contractStatus": "none",
  "weeklyIncluded": false
}
```

Response: `201 Created`

```json
{
  "id": "job_01HZX...",
  "workplace": "카페 오후 알바",
  "hourlyWage": 10320,
  "minimumWage": 10320,
  "startDate": "2026-05-19",
  "payDay": 25,
  "weeklyDays": 3,
  "dailyHours": 5,
  "contractStatus": "none",
  "weeklyIncluded": false,
  "createdAt": "2026-05-19T06:00:00.000Z",
  "updatedAt": "2026-05-19T06:00:00.000Z"
}
```

### `GET /api/v1/jobs/{jobId}`

근무 조건 하나를 조회합니다.

### `PATCH /api/v1/jobs/{jobId}`

근무 조건을 수정합니다. 부분 수정만 보냅니다.

Request:

```json
{
  "hourlyWage": 11000,
  "contractStatus": "signed"
}
```

### `DELETE /api/v1/jobs/{jobId}`

근무 조건을 삭제합니다. 연결된 근무 기록도 함께 삭제할지 여부는 BE 구현 시 정책을 정해야 합니다. MVP에서는 함께 삭제합니다.

Response: `204 No Content`

## 시작 전 점검 API

### `GET /api/v1/jobs/{jobId}/checks`

근무 조건을 바탕으로 시작 전 체크리스트를 반환합니다.

Response:

```json
{
  "jobId": "job_01HZX...",
  "checks": [
    {
      "status": "danger",
      "title": "근로계약서",
      "body": "시급, 근무시간, 휴게시간, 임금 지급일, 주휴수당 포함 여부를 먼저 확인하세요."
    },
    {
      "status": "ok",
      "title": "최저임금 비교",
      "body": "입력한 시급은 기준 시급 10,320원 이상입니다."
    }
  ]
}
```

## 근무 기록 API

### `GET /api/v1/jobs/{jobId}/work-logs`

근무 기록 목록을 조회합니다.

Query:

- `month`: 선택, `YYYY-MM`

Example:

```text
GET /api/v1/jobs/job_01HZX.../work-logs?month=2026-05
```

Response:

```json
{
  "logs": [
    {
      "id": "log_01HZY...",
      "jobId": "job_01HZX...",
      "date": "2026-05-20",
      "clockIn": "18:00",
      "clockOut": "23:30",
      "breakMinutes": 30,
      "memo": "30분 연장",
      "workedHours": 5,
      "createdAt": "2026-05-20T14:40:00.000Z",
      "updatedAt": "2026-05-20T14:40:00.000Z"
    }
  ],
  "totalHours": 5
}
```

### `POST /api/v1/jobs/{jobId}/work-logs`

근무 기록을 추가합니다.

Request:

```json
{
  "date": "2026-05-20",
  "clockIn": "18:00",
  "clockOut": "23:30",
  "breakMinutes": 30,
  "memo": "30분 연장"
}
```

Response: `201 Created`

```json
{
  "id": "log_01HZY...",
  "jobId": "job_01HZX...",
  "date": "2026-05-20",
  "clockIn": "18:00",
  "clockOut": "23:30",
  "breakMinutes": 30,
  "memo": "30분 연장",
  "workedHours": 5,
  "createdAt": "2026-05-20T14:40:00.000Z",
  "updatedAt": "2026-05-20T14:40:00.000Z"
}
```

### `PATCH /api/v1/work-logs/{logId}`

근무 기록을 수정합니다.

### `DELETE /api/v1/work-logs/{logId}`

근무 기록을 삭제합니다.

Response: `204 No Content`

## 급여 계산 API

### `GET /api/v1/jobs/{jobId}/payroll`

저장된 근무 기록을 바탕으로 월별 예상 급여를 계산합니다.

Query:

- `month`: 필수, `YYYY-MM`
- `actualPaid`: 선택, 실제 입금액

Example:

```text
GET /api/v1/jobs/job_01HZX.../payroll?month=2026-05&actualPaid=720000
```

Response:

```json
{
  "jobId": "job_01HZX...",
  "month": "2026-05",
  "totalHours": 72,
  "basePay": 743040,
  "weeklyAllowance": 82560,
  "expectedPay": 825600,
  "actualPaid": 720000,
  "difference": -105600,
  "notes": [
    "세금, 4대보험, 식대, 지각 및 조퇴 처리에 따라 실제 입금액은 달라질 수 있습니다.",
    "차이가 있으면 급여명세서와 공제 내역을 먼저 확인하세요."
  ]
}
```

계산 정책:

- `basePay = totalHours * hourlyWage`
- `weeklyIncluded = true`이면 주휴수당은 `0`으로 계산하고, UI에서는 포함 표시를 사용합니다.
- `weeklyIncluded = false`이고 주 단위 근무시간이 15시간 이상이면 주휴수당 후보로 계산합니다.
- MVP의 주휴수당 계산은 `min(8, weeklyHours / 5) * hourlyWage`를 사용합니다.
- 세금, 4대보험, 식대, 지각, 조퇴는 실제 공제 계산에 반영하지 않고 안내 문구로만 제공합니다.

### `POST /api/v1/payroll/preview`

저장하지 않은 입력값으로 급여를 미리 계산합니다. FE 입력 중 실시간 계산이나 테스트에 사용합니다.

Request:

```json
{
  "job": {
    "hourlyWage": 10320,
    "weeklyIncluded": false
  },
  "logs": [
    {
      "date": "2026-05-20",
      "clockIn": "18:00",
      "clockOut": "23:30",
      "breakMinutes": 30
    }
  ],
  "month": "2026-05",
  "actualPaid": 720000
}
```

Response: `PayrollResult`

## 챗봇 API

### `POST /api/v1/chat/messages`

사용자 질문과 저장된 근무 정보를 바탕으로 상담 답변을 생성합니다. MVP에서는 규칙 기반 응답으로 시작하고, 이후 LLM API를 연결합니다.

Request:

```json
{
  "jobId": "job_01HZX...",
  "message": "알바를 시작하는데 계약서는 다음 주에 쓰자고 하는데 괜찮아?",
  "context": {
    "month": "2026-05"
  }
}
```

Response:

```json
{
  "userMessage": {
    "id": "msg_01HZZ_USER",
    "role": "user",
    "text": "알바를 시작하는데 계약서는 다음 주에 쓰자고 하는데 괜찮아?",
    "createdAt": "2026-05-19T07:00:00.000Z"
  },
  "assistantMessage": {
    "id": "msg_01HZZ_ASSISTANT",
    "role": "assistant",
    "text": "근로계약서는 근무 시작 전에 작성하는 것이 안전합니다. 시급, 근무시간, 휴게시간, 임금 지급일, 주휴수당 포함 여부를 먼저 확인하세요.",
    "createdAt": "2026-05-19T07:00:01.000Z"
  },
  "recommendedActions": [
    "근로계약서 작성 요청",
    "시급과 주휴수당 포함 여부 확인"
  ],
  "officialLinks": [
    {
      "label": "고용노동부 고객상담센터",
      "url": "https://1350.moel.go.kr/"
    }
  ]
}
```

### `GET /api/v1/chat/messages`

상담 메시지 기록을 조회합니다.

Query:

- `jobId`: 선택
- `limit`: 선택, 기본 50

## 참고 정보 API

### `GET /api/v1/references/minimum-wages`

연도별 최저임금 정보를 조회합니다.

Query:

- `year`: 선택

Response:

```json
{
  "items": [
    {
      "year": 2026,
      "hourlyWage": 10320,
      "source": "최저임금위원회",
      "sourceUrl": "https://www.minimumwage.go.kr/customer/notice/view.do?bultnId=4657"
    }
  ]
}
```

### `GET /api/v1/references/consultation-links`

공식 상담기관 링크를 조회합니다.

Response:

```json
{
  "items": [
    {
      "label": "고용노동부 고객상담센터",
      "phone": "1350",
      "url": "https://1350.moel.go.kr/"
    },
    {
      "label": "노동포털",
      "url": "https://labor.moel.go.kr/"
    }
  ]
}
```

## MVP 구현 순서

1. `GET /health`
2. `POST /api/v1/jobs`, `GET /api/v1/jobs`, `PATCH /api/v1/jobs/{jobId}`
3. `POST /api/v1/jobs/{jobId}/work-logs`, `GET /api/v1/jobs/{jobId}/work-logs`
4. `GET /api/v1/jobs/{jobId}/payroll`
5. `GET /api/v1/jobs/{jobId}/checks`
6. `POST /api/v1/chat/messages`
7. 참고 정보 API

## FE 연동 전환 메모

현재 FE의 `localStorage` 상태를 아래 순서로 API로 대체합니다.

- `job` 상태: `GET /api/v1/jobs`, `POST /api/v1/jobs`, `PATCH /api/v1/jobs/{jobId}`
- `logs` 상태: `GET /api/v1/jobs/{jobId}/work-logs`, `POST /api/v1/jobs/{jobId}/work-logs`, `DELETE /api/v1/work-logs/{logId}`
- `payroll` 계산: `GET /api/v1/jobs/{jobId}/payroll`
- `messages` 상태: `POST /api/v1/chat/messages`, `GET /api/v1/chat/messages`

API 전환 중에도 FE 계산 로직은 임시 fallback으로 유지할 수 있지만, 최종 계산 기준은 BE 응답으로 통일합니다.
