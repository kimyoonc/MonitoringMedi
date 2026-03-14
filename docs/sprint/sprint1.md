# Sprint 1: 프로젝트 셋업 + 핵심 인프라

**스프린트 번호:** 1
**상태:** ✅ 구현 완료 (2026-03-15)
**기간:** Week 1–2
**담당 마일스톤:** M1 — 개발 인프라 구축

---

## 1. 스프린트 목표

이후 스프린트(Sprint 2, Sprint 3)에서 기능 구현이 **즉시 시작될 수 있도록** 프론트엔드와 백엔드의 개발 기반을 완비한다.

- Vite + React + TypeScript SPA 골격 구축 (`frontend/`)
- Express.js Mock API 서버 골격 구축 (`backend/`)
- 반응형 레이아웃 브레이크포인트(375px / 768px / 1280px) 기반 설정
- 약사 화면 / 환자 화면 라우팅 분리
- Mock API 엔드포인트 뼈대 및 테스트 픽스처 데이터 정의
- 공통 컴포넌트(헤더, 내비게이션, 카드 등) 구성

---

## 2. 작업 목록

### S1-01: Vite + React + TypeScript 프로젝트 초기화

**설명:** `frontend/` 디렉토리에 Vite 기반 React + TypeScript 프로젝트를 초기화한다.

- `npm create vite@latest frontend -- --template react-ts` 로 생성
- ESLint, Prettier 설정 추가
- 절대 경로 임포트 설정 (`tsconfig.json` → `paths`, `vite.config.ts` → `resolve.alias`)
- CSS 리셋 및 기본 글로벌 스타일 설정
- `package.json`에 `dev`, `build`, `preview` 스크립트 확인

**산출물:** `frontend/` 프로젝트 초기화 완료, `npm run dev` 실행 가능

---

### S1-02: Express.js Mock 서버 초기화

**설명:** `backend/` 디렉토리에 Express.js Mock API 서버를 초기화한다.

- Node.js + TypeScript + Express.js 설정
- `ts-node-dev` 또는 `tsx`를 사용한 개발 서버 hot-reload
- CORS 설정 (프론트엔드 개발 서버 허용)
- 공통 응답 형식 정의 (`{ success: boolean, data: T, error?: string }`)
- `package.json`에 `dev`, `build`, `start` 스크립트 설정

**산출물:** `backend/` 프로젝트 초기화 완료, `npm run dev` 실행 가능

---

### S1-03: 반응형 레이아웃 기반 설정

**설명:** 모바일(375px), 태블릿(768px), PC(1280px) 3단계 반응형 브레이크포인트를 CSS 변수 및 미디어 쿼리로 정의한다.

- CSS Custom Properties로 브레이크포인트 상수 정의
- 모바일 퍼스트(Mobile First) 접근 방식 채택
- 컨테이너 최대 너비 및 패딩 정의
  - 모바일: `max-width: 375px`, 패딩 `16px`
  - 태블릿: `min-width: 768px`, 패딩 `24px`
  - PC: `min-width: 1280px`, 패딩 `40px`
- 공통 Typography 스케일 정의
- 색상 팔레트 CSS 변수 정의 (primary, secondary, success, warning, error, neutral)

**산출물:** `frontend/src/styles/` 디렉토리에 글로벌 스타일 파일 생성

---

### S1-04: 라우팅 구조 설계

**설명:** React Router v6를 사용하여 약사 화면과 환자 화면 진입점을 분리한다.

- `react-router-dom` 설치
- 라우트 구조:
  - `/pharmacist/*` — 약사 화면 (관리/조제)
  - `/patient/*` — 환자 화면 (일정 확인/신고)
  - `/` — 역할 선택 화면 (약사 / 환자)
- 각 역할별 레이아웃 컴포넌트 분리 (`PharmacistLayout`, `PatientLayout`)
- 404 처리 페이지 구성

**산출물:** `frontend/src/routes/` 라우팅 설정 완료, 각 진입점 접근 가능

---

### S1-05: Mock API 엔드포인트 뼈대 정의

**설명:** Sprint 2, Sprint 3에서 구현할 모든 기능에 대한 Mock API 엔드포인트를 뼈대 수준으로 미리 정의한다. 각 엔드포인트는 고정 JSON 응답을 반환한다.

- 라우터 파일을 기능 도메인별로 분리 (`patients`, `plans`, `visits`, `exchanges`, `interactions`, `dashboard`, `notifications`)
- 각 엔드포인트는 `fixtures/` 데이터를 읽어 응답

**산출물:** `backend/src/routes/` 엔드포인트 뼈대 전체 정의 완료 (상세 목록은 섹션 4 참고)

---

### S1-06: 테스트 픽스처 데이터 정의

**설명:** Mock API가 반환할 시나리오별 고정 JSON 데이터를 정의한다.

- TC-01 ~ TC-08 시나리오를 커버하는 픽스처 데이터 작성
- `backend/src/fixtures/` 디렉토리에 도메인별 JSON 파일 관리

**산출물:** `backend/src/fixtures/` 픽스처 JSON 파일 정의 완료 (상세 예시는 섹션 5 참고)

---

### S1-07: 공통 컴포넌트 구성

**설명:** 이후 스프린트에서 재사용할 공통 UI 컴포넌트를 구성한다.

- **Header:** 화면 상단 타이틀 + 뒤로가기 버튼 영역
- **BottomNav:** 모바일 하단 탭 내비게이션 (약사/환자 각각)
- **SideNav:** PC 사이드 내비게이션 (1280px 이상)
- **Card:** 정보 카드 컨테이너 (환자 정보, 처방 정보 등)
- **Badge:** 상태 표시 배지 (정상, 경고, 이상반응 등)
- **Button:** Primary / Secondary / Danger 버튼
- **Loading:** 로딩 스피너 컴포넌트
- **EmptyState:** 데이터 없음 상태 표시
- **PageLayout:** 페이지 공통 레이아웃 래퍼

**산출물:** `frontend/src/components/common/` 공통 컴포넌트 구성 완료

---

### S1-08: 개발/빌드 스크립트 설정

**설명:** 프론트엔드와 백엔드를 단일 명령어로 동시 실행할 수 있는 루트 레벨 스크립트를 구성한다.

- 루트 `package.json`에 `concurrently`를 사용한 통합 `dev` 스크립트 설정
- 프론트엔드: `http://localhost:5173`
- 백엔드: `http://localhost:3000`
- 프론트엔드의 API 프록시 설정 (`vite.config.ts` → `server.proxy`)
- `.env.example` 파일 생성 (포트, API URL 등)

**산출물:** 루트에서 `npm run dev` 단일 명령으로 프론트+백엔드 동시 기동

---

## 3. 파일/디렉토리 구조 설계

```
D:/kimyoon/claude/
├── package.json                    # 루트 — concurrently dev 스크립트
├── .env.example                    # 환경 변수 예시
├── frontend/
│   ├── package.json
│   ├── vite.config.ts              # 프록시 설정 포함
│   ├── tsconfig.json               # 절대 경로 alias 설정
│   ├── index.html
│   └── src/
│       ├── main.tsx                # 앱 진입점
│       ├── App.tsx                 # 루트 컴포넌트 + 라우터
│       ├── routes/
│       │   ├── index.tsx           # 전체 라우팅 설정
│       │   ├── pharmacist/         # 약사 화면 라우트
│       │   │   ├── index.tsx       # 약사 메인 (대시보드)
│       │   │   ├── patients/       # 환자 목록/상세
│       │   │   ├── plans/          # 복약 관리 계획
│       │   │   └── visits/         # 방문 기록
│       │   └── patient/            # 환자 화면 라우트
│       │       ├── index.tsx       # 환자 메인 (일정)
│       │       ├── schedule/       # 방문 일정
│       │       └── report/         # 이상 반응 신고
│       ├── layouts/
│       │   ├── PharmacistLayout.tsx
│       │   └── PatientLayout.tsx
│       ├── components/
│       │   └── common/
│       │       ├── Header.tsx
│       │       ├── BottomNav.tsx
│       │       ├── SideNav.tsx
│       │       ├── Card.tsx
│       │       ├── Badge.tsx
│       │       ├── Button.tsx
│       │       ├── Loading.tsx
│       │       ├── EmptyState.tsx
│       │       └── PageLayout.tsx
│       ├── styles/
│       │   ├── globals.css         # 글로벌 스타일 + CSS 변수
│       │   ├── breakpoints.css     # 반응형 브레이크포인트
│       │   └── typography.css      # 타이포그래피 스케일
│       ├── api/
│       │   └── client.ts           # Axios 또는 fetch 기반 API 클라이언트
│       └── types/
│           └── index.ts            # 공통 타입 정의
│
└── backend/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts                # 서버 진입점
        ├── app.ts                  # Express 앱 설정
        ├── routes/
        │   ├── index.ts            # 라우터 통합
        │   ├── patients.ts         # 환자 API
        │   ├── plans.ts            # 복약 관리 계획 API
        │   ├── visits.ts           # 방문 기록 API
        │   ├── exchanges.ts        # 의약품 교환 API
        │   ├── interactions.ts     # 약물 상호작용 API
        │   ├── dashboard.ts        # 대시보드 API
        │   └── notifications.ts    # 알림 API
        ├── fixtures/
        │   ├── patients.json       # 환자 픽스처 데이터
        │   ├── prescriptions.json  # 처방 픽스처 데이터
        │   ├── plans.json          # 복약 관리 계획 픽스처
        │   ├── visits.json         # 방문 기록 픽스처
        │   ├── exchanges.json      # 교환 이력 픽스처
        │   ├── interactions.json   # 약물 상호작용 픽스처
        │   ├── dashboard.json      # 대시보드 픽스처
        │   └── notifications.json  # 알림 픽스처
        └── middleware/
            ├── cors.ts             # CORS 설정
            └── errorHandler.ts     # 공통 에러 핸들러
```

---

## 4. Mock API 엔드포인트 목록

### 공통 응답 형식

```json
{
  "success": true,
  "data": { ... }
}
```

에러 시:

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

---

### 4.1 환자 API (`/api/patients`)

| 메서드 | 경로 | 설명 | TC |
|---|---|---|---|
| GET | `/api/patients` | 전체 환자 목록 조회 | TC-08 |
| GET | `/api/patients/:id` | 환자 상세 조회 | TC-01 |
| POST | `/api/patients` | 신규 환자 등록 | TC-01 |
| GET | `/api/patients/:id/visits` | 환자 방문 이력 조회 | TC-03 |
| GET | `/api/patients/:id/notifications` | 환자 알림 목록 조회 | F-003 |

---

### 4.2 복약 관리 계획 API (`/api/plans`)

| 메서드 | 경로 | 설명 | TC |
|---|---|---|---|
| POST | `/api/plans` | 복약 관리 계획 생성 | TC-01 |
| GET | `/api/plans/:id` | 계획 상세 조회 | TC-01 |
| GET | `/api/plans/:id/steps` | 조제 단계 목록 조회 | TC-02 |
| PUT | `/api/plans/:id` | 계획 수정 | - |

---

### 4.3 방문 기록 API (`/api/visits`)

| 메서드 | 경로 | 설명 | TC |
|---|---|---|---|
| POST | `/api/visits` | 방문 기록 저장 | TC-02 |
| GET | `/api/visits/:id` | 방문 기록 상세 조회 | TC-03 |
| POST | `/api/visits/:id/dispense` | 단계별 조제 처리 | TC-02 |
| GET | `/api/visits/:id/exchanges` | 해당 방문의 교환 이력 조회 | TC-05 |

---

### 4.4 의약품 교환 API (`/api/exchanges`)

| 메서드 | 경로 | 설명 | TC |
|---|---|---|---|
| POST | `/api/exchanges` | 의약품 교환 처리 | TC-05, TC-06 |
| GET | `/api/exchanges/:id` | 교환 이력 상세 조회 | TC-05 |

---

### 4.5 약물 상호작용 API (`/api/interactions`)

| 메서드 | 경로 | 설명 | TC |
|---|---|---|---|
| POST | `/api/interactions/check` | 약물 상호작용 확인 | TC-07 |

---

### 4.6 대시보드 API (`/api/dashboard`)

| 메서드 | 경로 | 설명 | TC |
|---|---|---|---|
| GET | `/api/dashboard` | 전체 현황 집계 데이터 조회 | TC-08 |

---

### 4.7 알림 API (`/api/notifications`)

| 메서드 | 경로 | 설명 | TC |
|---|---|---|---|
| GET | `/api/notifications` | 알림 목록 조회 (환자 ID 쿼리) | F-003 |
| POST | `/api/notifications/send` | 알림 발송 (Mock 처리) | F-003 |

---

## 5. 테스트 픽스처 데이터 예시

### 5.1 환자 데이터 (`fixtures/patients.json`)

```json
[
  {
    "id": "P001",
    "name": "김영희",
    "birthDate": "1965-03-22",
    "phone": "010-1234-5678",
    "address": "서울시 강남구 테헤란로 123",
    "conditions": ["고혈압", "당뇨"],
    "registeredAt": "2026-01-15",
    "status": "active"
  },
  {
    "id": "P002",
    "name": "이철수",
    "birthDate": "1958-07-10",
    "phone": "010-9876-5432",
    "address": "서울시 서초구 반포대로 56",
    "conditions": ["고지혈증", "관절염"],
    "registeredAt": "2026-02-03",
    "status": "active"
  },
  {
    "id": "P003",
    "name": "박순자",
    "birthDate": "1970-11-30",
    "phone": "010-5555-7777",
    "address": "서울시 송파구 올림픽로 200",
    "conditions": ["갑상선 기능 저하증"],
    "registeredAt": "2026-02-20",
    "status": "adverse_reaction"
  }
]
```

---

### 5.2 처방 데이터 (`fixtures/prescriptions.json`)

```json
[
  {
    "id": "RX001",
    "patientId": "P001",
    "issuedDate": "2026-01-15",
    "totalDays": 90,
    "medications": [
      {
        "id": "M001",
        "name": "암로디핀 5mg",
        "category": "고혈압",
        "dailyDose": 1,
        "unit": "정",
        "instructions": "아침 식후 복용"
      },
      {
        "id": "M002",
        "name": "메트포르민 500mg",
        "category": "당뇨",
        "dailyDose": 2,
        "unit": "정",
        "instructions": "아침/저녁 식후 복용"
      }
    ],
    "status": "active"
  }
]
```

---

### 5.3 복약 관리 계획 데이터 (`fixtures/plans.json`)

```json
[
  {
    "id": "PL001",
    "prescriptionId": "RX001",
    "patientId": "P001",
    "totalVisits": 3,
    "dispensingUnit": 30,
    "steps": [
      {
        "stepNumber": 1,
        "scheduledDate": "2026-01-15",
        "dispenseDays": 30,
        "status": "completed",
        "visitId": "V001"
      },
      {
        "stepNumber": 2,
        "scheduledDate": "2026-02-14",
        "dispenseDays": 30,
        "status": "completed",
        "visitId": "V002"
      },
      {
        "stepNumber": 3,
        "scheduledDate": "2026-03-16",
        "dispenseDays": 30,
        "status": "scheduled",
        "visitId": null
      }
    ],
    "createdAt": "2026-01-15"
  }
]
```

---

### 5.4 방문 기록 데이터 (`fixtures/visits.json`)

```json
[
  {
    "id": "V001",
    "planId": "PL001",
    "patientId": "P001",
    "visitDate": "2026-01-15",
    "stepNumber": 1,
    "adherence": "good",
    "adverseReaction": false,
    "adverseReactionNote": null,
    "storageCondition": "good",
    "pharmacistNote": "복약 순응도 양호. 특이사항 없음.",
    "dispensedMedications": [
      { "medicationId": "M001", "quantity": 30, "unit": "정" },
      { "medicationId": "M002", "quantity": 60, "unit": "정" }
    ],
    "createdAt": "2026-01-15T10:30:00Z"
  },
  {
    "id": "V002",
    "planId": "PL001",
    "patientId": "P001",
    "visitDate": "2026-02-14",
    "stepNumber": 2,
    "adherence": "fair",
    "adverseReaction": true,
    "adverseReactionNote": "가끔 어지럼증 호소. 복용 시간 조정 권고.",
    "storageCondition": "good",
    "pharmacistNote": "이상 반응 기록. 증상 지속 시 재방문 권고.",
    "dispensedMedications": [
      { "medicationId": "M001", "quantity": 30, "unit": "정" },
      { "medicationId": "M002", "quantity": 60, "unit": "정" }
    ],
    "createdAt": "2026-02-14T11:00:00Z"
  }
]
```

---

### 5.5 의약품 교환 이력 데이터 (`fixtures/exchanges.json`)

```json
[
  {
    "id": "EX001",
    "visitId": "V003",
    "patientId": "P002",
    "exchangeDate": "2026-02-10",
    "reason": "contamination",
    "reasonLabel": "오염/훼손",
    "medications": [
      { "medicationId": "M003", "quantity": 15, "unit": "정" }
    ],
    "handlingMethod": "폐기 후 신규 조제",
    "pharmacistNote": "포장 손상으로 일부 정제 오염 확인.",
    "createdAt": "2026-02-10T14:00:00Z"
  }
]
```

---

### 5.6 약물 상호작용 데이터 (`fixtures/interactions.json`)

```json
{
  "pairs": [
    {
      "drug1": "와파린",
      "drug2": "아스피린",
      "severity": "high",
      "description": "출혈 위험 증가. 병용 시 주의 필요.",
      "action": "약사 확인 필수"
    },
    {
      "drug1": "암로디핀",
      "drug2": "심바스타틴",
      "severity": "moderate",
      "description": "심바스타틴 혈중 농도 증가 가능. 용량 조정 고려.",
      "action": "용량 모니터링 권고"
    }
  ]
}
```

---

### 5.7 대시보드 데이터 (`fixtures/dashboard.json`)

```json
{
  "date": "2026-03-14",
  "summary": {
    "todayVisits": 3,
    "pendingDispense": 5,
    "adverseReactions": 1
  },
  "todayVisitPatients": [
    {
      "patientId": "P001",
      "name": "김영희",
      "scheduledTime": "10:00",
      "stepNumber": 3,
      "planId": "PL001"
    },
    {
      "patientId": "P002",
      "name": "이철수",
      "scheduledTime": "14:00",
      "stepNumber": 2,
      "planId": "PL002"
    },
    {
      "patientId": "P003",
      "name": "박순자",
      "scheduledTime": "16:00",
      "stepNumber": 1,
      "planId": "PL003"
    }
  ],
  "adverseReactionPatients": [
    {
      "patientId": "P003",
      "name": "박순자",
      "reportedDate": "2026-03-13",
      "symptom": "구역감, 두통"
    }
  ]
}
```

---

### 5.8 알림 데이터 (`fixtures/notifications.json`)

```json
[
  {
    "id": "N001",
    "patientId": "P001",
    "type": "visit_reminder",
    "daysUntilVisit": 3,
    "scheduledVisitDate": "2026-03-17",
    "message": "3일 후 복약 관리 방문 예정입니다. (2026-03-17)",
    "sentAt": "2026-03-14T09:00:00Z",
    "isRead": false
  },
  {
    "id": "N002",
    "patientId": "P002",
    "type": "visit_reminder",
    "daysUntilVisit": 1,
    "scheduledVisitDate": "2026-03-15",
    "message": "내일 복약 관리 방문 예정입니다. (2026-03-15)",
    "sentAt": "2026-03-14T09:00:00Z",
    "isRead": false
  }
]
```

---

## 6. 완료 기준

Sprint 1은 아래 모든 항목이 충족될 때 완료로 간주한다.

### 6.1 기능 완료 조건

- ✅ 루트 `npm run dev` 단일 명령으로 프론트엔드(포트 5173)와 백엔드(포트 3000) 동시 기동
- ✅ 브라우저에서 `http://localhost:5173` 접근 시 역할 선택 화면 정상 렌더링
- ✅ `/pharmacist` 경로로 약사 화면 진입 가능, `/patient` 경로로 환자 화면 진입 가능
- ✅ Mock API 전체 엔드포인트 호출 시 고정 JSON 응답 반환 (curl 또는 fetch로 확인)
- ✅ 모바일(375px), 태블릿(768px), PC(1280px) 기본 레이아웃 렌더링 이상 없음
- ✅ 공통 컴포넌트(Header, BottomNav, Card, Button 등) 각 화면에 정상 적용

### 6.2 기술 완료 조건

- ✅ `frontend/` TypeScript 컴파일 에러 없음 (`npm run build` 성공)
- ✅ `backend/` TypeScript 컴파일 에러 없음
- ✅ ESLint 에러 없음 (경고는 허용)
- ✅ 픽스처 JSON 파일 전체 도메인 커버 (patients, prescriptions, plans, visits, exchanges, interactions, dashboard, notifications)

### 6.3 Sprint 2 시작 준비 조건

- ✅ F-001 구현에 필요한 `POST /api/plans`, `GET /api/plans/:id` 엔드포인트 응답 확인
- ✅ F-002 구현에 필요한 `GET /api/plans/:id/steps`, `POST /api/visits/:id/dispense` 엔드포인트 응답 확인
- ✅ F-004 구현에 필요한 `POST /api/visits`, `GET /api/patients/:id/visits` 엔드포인트 응답 확인

---

## 7. 참고 사항

### 7.1 브랜치 전략

- 작업 브랜치: `sprint1`
- 베이스 브랜치: `main`

### 7.2 의존성 목록 (예상)

**frontend/**

| 패키지 | 용도 |
|---|---|
| react, react-dom | UI 프레임워크 |
| react-router-dom v6 | 라우팅 |
| typescript | 타입 시스템 |
| vite | 빌드 도구 |
| axios | HTTP 클라이언트 |

**backend/**

| 패키지 | 용도 |
|---|---|
| express | 웹 프레임워크 |
| cors | CORS 처리 |
| typescript | 타입 시스템 |
| tsx 또는 ts-node-dev | 개발 서버 |
| @types/express, @types/cors | 타입 정의 |

**루트**

| 패키지 | 용도 |
|---|---|
| concurrently | 프론트/백 동시 실행 |

### 7.3 연관 문서

- `docs/PRD.md` — 제품 요구사항 상세
- `docs/ROADMAP.md` — 전체 스프린트 계획 및 마일스톤
- `docs/sprint/sprint2.md` — Sprint 2 계획 (Sprint 1 완료 후 작성)
