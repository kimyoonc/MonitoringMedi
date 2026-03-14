# Sprint 2: P0 핵심 기능 구현 (MVP v1.0)

**스프린트 번호:** 2
**상태:** ⬜ 미시작
**기간:** Week 3–5
**담당 마일스톤:** M2 — MVP (v1.0)
**의존성:** Sprint 1 완료 (개발 인프라 및 뼈대 구축)

---

## 1. 스프린트 목표

복약 관리 시스템의 핵심인 **P0 필수 기능 3종(F-001, F-002, F-004)** 을 완전히 구현하여 MVP(v1.0)를 달성한다.

- **F-001**: 복약 관리 계획 수립 — 처방 정보 + 방문 횟수 입력 시 조제 단위/방문 일정 자동 계산 및 저장
- **F-002**: 단계적 조제 관리 — 이전 방문 기록 확인 후 다음 단계 조제 처리
- **F-004**: 복약 상태 기록 — 방문마다 복약 순응도/이상반응/보관상태/약사메모 입력·저장, 이력 조회

### Sprint 1에서 인계된 현황

Sprint 1에서 생성된 파일 중 Sprint 2에서 **실질적으로 완성해야 할** 항목:

| 파일 | 현재 상태 | Sprint 2 목표 |
|---|---|---|
| `frontend/src/pages/pharmacist/PlanCreatePage.tsx` | 기본 입력 폼 + 로컬 계산 미리보기만 구현. 처방 의약품 목록 미포함, 저장 시 patientId 하드코딩(`P001`) | 처방 의약품 목록 입력, 실제 API 연동, 저장 후 계획 상세 페이지 이동 |
| `frontend/src/pages/pharmacist/VisitRecordPage.tsx` | 복약 상태 폼 UI만 구현. 저장 버튼이 `navigate(-1)`만 호출 (실제 POST 없음), 보관 상태 필드 누락 | 실제 `POST /api/visits` 연동, 보관 상태 필드 추가, 조제 처리 흐름 통합 |
| `frontend/src/pages/pharmacist/PatientDetailPage.tsx` | 기본 구현 완료. 복약 관리 계획 연결(`/pharmacist/plans/new`) 라우팅 존재 | 계획 상세 뷰 및 단계별 조제 현황 표시 추가 |
| `backend/src/routes/plans.ts` | GET/POST 뼈대 구현. `POST /plans` 응답 생성 로직 있으나 DB 미저장 (Mock이므로 정상) | `storageCondition` 필드 포함, 조제 가능 여부 검증 로직 추가 |
| `backend/src/routes/visits.ts` | GET/POST/dispense 뼈대. `POST /visits` 응답에 `storageCondition` 미반영 | `storageCondition` 필드 반영, dispense 조건 검증(이전 방문 기록 확인) 추가 |

---

## 2. 작업 목록

### S2-01: 타입 정의 보완 (`frontend/src/types/index.ts`)

**설명:** Sprint 2에서 추가되는 필드와 새 인터페이스를 타입 파일에 반영한다.

**수정 내용:**
- `Plan` 인터페이스에 `patientName`, `prescriptionInfo` 필드 추가
- `PlanStep` 인터페이스에 `canDispense: boolean` 필드 추가 (이전 단계 완료 여부 기반)
- `Visit` 인터페이스에 `storageCondition: 'good' | 'poor' | 'damaged'` 필드가 이미 존재하므로 확인 후 유지
- 신규: `PlanCreateForm` 인터페이스 추가
- 신규: `VisitCreateForm` 인터페이스 추가
- 신규: `DispenseRequest` / `DispenseResult` 인터페이스 추가

**수정 파일:** `frontend/src/types/index.ts`

**산출물:** TypeScript 컴파일 에러 없이 Sprint 2 신규 컴포넌트에서 타입 임포트 가능

---

### S2-02: F-001 백엔드 — `POST /api/plans` 응답 스펙 완성

**설명:** `POST /api/plans` 엔드포인트가 처방 의약품 목록(`medications`)을 포함한 완전한 계획 객체를 반환하도록 개선한다.

**수정 파일:** `backend/src/routes/plans.ts`

**구현 상세:**

1. 요청 바디 파싱: `patientId`, `prescriptionId`, `totalDays`, `visitCount`, `medications[]`, `startDate`
2. `startDate`가 제공된 경우 해당 날짜 기준으로 일정 계산, 없으면 오늘 날짜 사용
3. `dispensingUnit = Math.floor(totalDays / visitCount)` 계산
4. 잔여일 처리: `remainder = totalDays % visitCount` — 마지막 단계에 잔여일 추가
5. 각 단계 `scheduledDate`는 `startDate + dispensingUnit * (i)` 일 후로 계산
6. 첫 번째 단계는 `status: 'scheduled'`, 나머지는 `status: 'pending'`
7. 응답에 `medications` 배열 포함

**추가:** `GET /api/plans/:patientId/active` — 특정 환자의 활성 계획 조회 (PatientDetailPage에서 사용)

**산출물:** `backend/src/routes/plans.ts` 수정 완료

---

### S2-03: F-001 프론트엔드 — `PlanCreatePage.tsx` 완성

**설명:** PlanCreatePage를 실제 동작하는 복약 관리 계획 수립 화면으로 완성한다.

**수정 파일:** `frontend/src/pages/pharmacist/PlanCreatePage.tsx`, `frontend/src/pages/pharmacist/PlanCreatePage.module.css`

**구현 상세:**

1. **환자 선택 필드** 추가
   - URL 파라미터 `?patientId=P001`로 진입 시 자동 선택
   - `GET /api/patients` 호출로 환자 목록 드롭다운 구성

2. **처방 정보 입력 폼**
   - 총 처방 기간 (일): 숫자 입력, 최소 7일
   - 방문 횟수: 숫자 입력, 최소 1회
   - 시작일: 날짜 입력 (기본값: 오늘)
   - 의약품 목록: 동적으로 항목 추가/삭제 가능
     - 의약품명, 1일 복용량, 단위(정/캡슐/ml), 복용 지시사항

3. **자동 계산 미리보기** (기존 기능 유지 + 개선)
   - "일정 미리보기" 버튼 클릭 시 또는 입력값 변경 시 자동 계산
   - 각 방문 단계: 차수, 예정일, 조제일수, 조제 수량(의약품별) 표시
   - 잔여일이 있을 경우 마지막 단계에 추가됨을 안내

4. **저장 처리**
   - `POST /api/plans` 호출
   - 성공 시 `/pharmacist/patients/:patientId` 로 이동 (환자 상세 페이지)
   - 실패 시 에러 메시지 표시

5. **유효성 검사**
   - 환자 선택 필수
   - 총 처방 기간 > 0 필수
   - 방문 횟수 ≥ 1 필수
   - 방문 횟수 ≤ 총 처방 기간 (방문당 최소 1일)

**라우팅 변경:** `frontend/src/routes/index.tsx`
- `/pharmacist/plans/new` → `/pharmacist/patients/:patientId/plans/new` 로 라우트 추가
- 기존 `/pharmacist/plans/new` 라우트도 하위 호환을 위해 유지

**산출물:** PlanCreatePage 기능 완성, TC-01 시나리오 충족

---

### S2-04: F-004 백엔드 — `POST /api/visits` 응답 스펙 완성

**설명:** `POST /api/visits` 엔드포인트가 모든 복약 상태 기록 필드를 반영하도록 완성한다.

**수정 파일:** `backend/src/routes/visits.ts`

**구현 상세:**

1. **`POST /api/visits` 요청 필드 전체 수용:**
   - `planId`, `patientId`, `visitDate`, `stepNumber`
   - `adherence`: `'good' | 'fair' | 'poor'`
   - `adverseReaction`: boolean
   - `adverseReactionNote`: string | null
   - `storageCondition`: `'good' | 'poor' | 'damaged'`
   - `pharmacistNote`: string
   - `dispensedMedications`: 조제 의약품 배열

2. **응답에 동일 필드 반영** (Mock이므로 요청 바디를 그대로 에코하되 id, createdAt 추가)

3. **`GET /api/patients/:patientId/visits` 엔드포인트 추가** (`patients.ts`에 구현)
   - `patientId`로 방문 이력 필터링 후 `visitDate` 내림차순 정렬 반환

**수정 파일:** `backend/src/routes/visits.ts`, `backend/src/routes/patients.ts`

**산출물:** 방문 기록 전 필드 저장 및 이력 조회 API 동작

---

### S2-05: F-002 백엔드 — 조제 가능 여부 검증 로직 추가

**설명:** `POST /api/visits/:id/dispense` 엔드포인트에 이전 방문 기록 확인 로직을 추가한다.

**수정 파일:** `backend/src/routes/visits.ts`

**구현 상세:**

1. **`POST /api/visits/:id/dispense` 검증 흐름:**
   - 해당 방문 기록의 `planId`와 `stepNumber`를 확인
   - `stepNumber > 1` 인 경우: 동일 `planId`의 `stepNumber - 1` 방문 기록이 `visits` 픽스처에 존재하는지 확인
   - 이전 방문 기록 없으면 `400 Bad Request` 반환:
     ```json
     {
       "success": false,
       "error": "이전 방문 기록이 확인되지 않아 조제를 진행할 수 없습니다.",
       "code": "PREVIOUS_VISIT_REQUIRED"
     }
     ```
   - 검증 통과 시 조제 결과 반환 (기존 로직 유지)

2. **`GET /api/plans/:id/steps` 응답에 `canDispense` 필드 추가:**
   - 각 단계에 대해 이전 단계 완료 여부 기반으로 `canDispense` 계산
   - 1단계: 항상 `canDispense: true`
   - N단계(N>1): 이전 단계의 `visitId`가 null이 아닌 경우에만 `canDispense: true`

**산출물:** 조제 가능 여부 검증 로직 동작, TC-02/TC-03 시나리오 충족

---

### S2-06: F-002/F-004 프론트엔드 — `VisitRecordPage.tsx` 완성

**설명:** VisitRecordPage를 실제 방문 기록 저장 및 조제 처리까지 완성한다.

**수정 파일:** `frontend/src/pages/pharmacist/VisitRecordPage.tsx`, `frontend/src/pages/pharmacist/VisitRecordPage.module.css`

**구현 상세:**

1. **URL 파라미터 구조 변경**
   - 기존: `/pharmacist/visits/:id` (기존 방문 기록 조회)
   - 신규 라우트 추가: `/pharmacist/patients/:patientId/visits/new?planId=PL001&step=2` (신규 방문 기록 생성)
   - 두 모드(조회 모드 / 신규 생성 모드)를 하나의 컴포넌트에서 처리

2. **신규 방문 기록 생성 모드 (F-004)**
   - URL 쿼리스트링에서 `planId`, `step` 읽기
   - `GET /api/plans/:planId`로 계획 정보 조회 후 현재 단계 정보 표시
   - **복약 상태 기록 폼 전체 구현:**
     - 복약 순응도: `양호 / 보통 / 불량` 선택
     - 이상 반응 발생 여부: 체크박스
     - 이상 반응 내용: 이상 반응 체크 시 텍스트에리어 표시 (조건부 렌더링)
     - 의약품 보관 상태: `양호 / 불량 / 훼손` 선택 (기존 VisitRecordPage에 누락된 필드)
     - 약사 메모: 텍스트에리어
   - **조제 의약품 목록 표시 및 확인**
     - 해당 단계의 조제 예정 의약품 목록 표시
     - 약사가 실제 조제 수량 확인/수정 가능

3. **저장 및 조제 처리 흐름 (F-002 통합)**
   - "방문 기록 저장" 버튼 클릭 시:
     - Step 1: `POST /api/visits` — 복약 상태 기록 저장
     - Step 2: 생성된 visitId로 `POST /api/visits/:id/dispense` — 조제 처리
     - 두 요청 모두 성공 시 성공 토스트 메시지 표시 후 환자 상세 페이지로 이동
     - 조제 불가(이전 방문 기록 없음) 오류 수신 시 오류 메시지 Modal로 표시

4. **기존 방문 기록 조회 모드 (이력 조회)**
   - URL: `/pharmacist/visits/:id`
   - 기존 방문 데이터를 읽기 전용으로 표시
   - 조제된 의약품 목록 포함

**라우팅 추가:** `frontend/src/routes/index.tsx`
- `/pharmacist/patients/:patientId/visits/new` 라우트 추가

**산출물:** VisitRecordPage 기능 완성, TC-02/TC-03 시나리오 충족

---

### S2-07: PatientDetailPage — 계획 현황 및 단계 조제 진입점 추가

**설명:** PatientDetailPage에서 복약 관리 계획 상세 및 단계별 조제 현황을 확인하고, 다음 단계 조제로 진입할 수 있도록 개선한다.

**수정 파일:** `frontend/src/pages/pharmacist/PatientDetailPage.tsx`, `frontend/src/pages/pharmacist/PatientDetailPage.module.css`

**구현 상세:**

1. **복약 관리 계획 현황 섹션 추가**
   - `GET /api/plans?patientId=:id` 또는 `GET /api/plans/patient/:id/active` 호출
   - 활성 계획의 단계 목록을 타임라인 형태로 표시:
     - 각 단계: 차수, 예정일, 상태 뱃지(완료/예정/대기), 조제일수
     - 완료된 단계: 방문 기록 상세 링크
     - 다음 조제 가능한 단계: "조제 진행" 버튼 활성화
     - 조제 불가 단계(이전 단계 미완료): 버튼 비활성화 + 툴팁 "이전 방문 기록 필요"

2. **"복약 관리 계획 수립" 버튼 개선**
   - 활성 계획이 없는 경우에만 표시
   - 클릭 시 `/pharmacist/patients/:id/plans/new` 로 이동

3. **방문 이력 섹션 개선**
   - 기존 방문 이력 카드에 `storageCondition` 뱃지 추가
   - 방문 이력 카드 클릭 시 방문 기록 상세 페이지(`/pharmacist/visits/:visitId`)로 이동

**산출물:** PatientDetailPage에서 전체 복약 관리 흐름 탐색 가능

---

### S2-08: 픽스처 데이터 보완

**설명:** Sprint 2 시나리오(TC-01, TC-02, TC-03)를 정확히 재현하기 위한 픽스처 데이터를 보완한다.

**수정 파일:** `backend/src/fixtures/visits.json`, `backend/src/fixtures/plans.json`

**보완 내용:**

1. `visits.json` — 기존 V001, V002에 `storageCondition` 필드 추가
2. TC-02 시나리오용: 1차 방문 기록 없는 계획 픽스처 추가 (조제 불가 케이스)
3. TC-03 시나리오용: 2차 방문 진행 중 상태 계획 픽스처 추가

**산출물:** TC-01~TC-03 픽스처 데이터 완비

---

### S2-09: 반응형 레이아웃 검증 및 CSS 보완

**설명:** Sprint 2에서 신규/수정된 페이지들의 모바일(375px) / PC(1280px) 레이아웃을 검증하고 보완한다.

**검증 대상 화면:**
- PlanCreatePage (의약품 목록 동적 추가 UI의 모바일 대응)
- VisitRecordPage (조제 의약품 목록의 모바일 대응)
- PatientDetailPage (계획 타임라인의 모바일 스크롤 대응)

**산출물:** 3개 페이지 모바일/PC 레이아웃 이상 없음

---

## 3. 기능별 상세 구현 스펙

### 3.1 F-001: 복약 관리 계획 수립

#### 입력 → 계산 → 저장 흐름

```
[사용자 입력]
  ├── 환자 선택 (patientId)
  ├── 총 처방 기간 (totalDays: 정수, 예: 90)
  ├── 방문 횟수 (visitCount: 정수, 예: 3)
  ├── 시작일 (startDate: YYYY-MM-DD, 기본: 오늘)
  └── 의약품 목록 (medications: [{name, dailyDose, unit, instructions}])

[자동 계산]
  dispensingUnit = Math.floor(totalDays / visitCount)    // 기본 조제일수
  remainder      = totalDays % visitCount                // 잔여일 (마지막 단계에 추가)

  steps[i] = {
    stepNumber:    i + 1,
    scheduledDate: startDate + dispensingUnit * i 일 후,
    dispenseDays:  dispensingUnit + (i === visitCount-1 ? remainder : 0),
    status:        i === 0 ? 'scheduled' : 'pending',
    visitId:       null
  }

[저장]
  POST /api/plans → Plan 객체 반환 → 환자 상세 페이지로 이동
```

#### 계산 예시

| 입력 | 계산 결과 |
|---|---|
| totalDays=90, visitCount=3, startDate=2026-03-15 | 1차: 2026-03-15 (30일), 2차: 2026-04-14 (30일), 3차: 2026-05-14 (30일) |
| totalDays=90, visitCount=4, startDate=2026-03-15 | 1차: 2026-03-15 (22일), 2차: 2026-04-06 (22일), 3차: 2026-04-28 (22일), 4차: 2026-05-20 (24일, +2 잔여일) |
| totalDays=30, visitCount=2, startDate=2026-03-15 | 1차: 2026-03-15 (15일), 2차: 2026-03-30 (15일) |

---

### 3.2 F-002: 단계적 조제 관리

#### 조제 가능 여부 판단 규칙

```
단계 N의 조제 가능 여부:
  - N = 1: 항상 가능 (canDispense: true)
  - N > 1: plan.steps[N-2].visitId !== null 인 경우에만 가능
           즉, 이전 단계(N-1차)의 방문 기록이 존재해야 함
```

#### 조제 처리 흐름 (프론트엔드 관점)

```
[약사가 PatientDetailPage에서 "조제 진행" 클릭]
  → VisitRecordPage (신규 생성 모드)로 이동
     URL: /pharmacist/patients/:patientId/visits/new?planId=PL001&step=2

[VisitRecordPage에서 폼 작성 완료 후 "방문 기록 저장" 클릭]
  → 1. POST /api/visits { planId, patientId, stepNumber, adherence, ... }
       ← { success: true, data: { id: "V_NEW", ... } }
  → 2. POST /api/visits/V_NEW/dispense { medications: [...] }
       ← 성공: { success: true, data: { dispensedAt, ... } }
       ← 실패: { success: false, error: "이전 방문 기록이 확인되지 않아...", code: "PREVIOUS_VISIT_REQUIRED" }

[성공 시]
  → 성공 토스트 표시 → /pharmacist/patients/:patientId 로 이동

[조제 불가 오류 시]
  → 오류 Modal 표시: "이전 방문 기록이 확인되지 않아 조제를 진행할 수 없습니다."
  → Modal 닫기 후 VisitRecordPage 유지 (환자 복약 기록만 저장됨)
```

---

### 3.3 F-004: 복약 상태 기록

#### 입력 필드 전체 명세

| 필드명 | 타입 | 값 옵션 | 필수 여부 | 설명 |
|---|---|---|---|---|
| `adherence` | select | `good`/`fair`/`poor` | 필수 | 복약 순응도 (양호/보통/불량) |
| `adverseReaction` | checkbox | true/false | 필수 | 이상 반응 발생 여부 |
| `adverseReactionNote` | textarea | 문자열 | 조건부 필수 | `adverseReaction=true` 시 필수 |
| `storageCondition` | select | `good`/`poor`/`damaged` | 필수 | 의약품 보관 상태 (양호/불량/훼손) |
| `pharmacistNote` | textarea | 문자열 | 선택 | 약사 메모/상담 내용 |

#### 방문 이력 조회

- `GET /api/patients/:patientId/visits` 호출
- 응답: `visitDate` 내림차순 정렬된 방문 기록 배열
- 표시 항목: 방문일, 차수, 복약 순응도 뱃지, 이상반응 여부, 약사 메모 요약

---

## 4. Mock API 응답 스펙

### 공통 응답 형식 (Sprint 1 정의 유지)

```json
// 성공
{ "success": true, "data": { ... } }

// 실패
{ "success": false, "error": "에러 메시지", "code": "ERROR_CODE" }
```

---

### 4.1 `POST /api/plans` — 복약 관리 계획 생성

**요청 바디:**
```json
{
  "patientId": "P001",
  "totalDays": 90,
  "visitCount": 3,
  "startDate": "2026-03-15",
  "medications": [
    {
      "name": "암로디핀 5mg",
      "category": "고혈압",
      "dailyDose": 1,
      "unit": "정",
      "instructions": "아침 식후 복용"
    }
  ]
}
```

**성공 응답 (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "PL_1710499200000",
    "patientId": "P001",
    "prescriptionId": "RX_1710499200000",
    "totalVisits": 3,
    "dispensingUnit": 30,
    "medications": [
      {
        "name": "암로디핀 5mg",
        "category": "고혈압",
        "dailyDose": 1,
        "unit": "정",
        "instructions": "아침 식후 복용"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "scheduledDate": "2026-03-15",
        "dispenseDays": 30,
        "status": "scheduled",
        "visitId": null,
        "canDispense": true
      },
      {
        "stepNumber": 2,
        "scheduledDate": "2026-04-14",
        "dispenseDays": 30,
        "status": "pending",
        "visitId": null,
        "canDispense": false
      },
      {
        "stepNumber": 3,
        "scheduledDate": "2026-05-14",
        "dispenseDays": 30,
        "status": "pending",
        "visitId": null,
        "canDispense": false
      }
    ],
    "createdAt": "2026-03-15"
  }
}
```

**유효성 실패 응답 (400 Bad Request):**
```json
{
  "success": false,
  "error": "방문 횟수는 총 처방 기간보다 클 수 없습니다.",
  "code": "INVALID_VISIT_COUNT"
}
```

---

### 4.2 `GET /api/plans/:id` — 복약 관리 계획 상세 조회

**성공 응답 (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "PL001",
    "patientId": "P001",
    "prescriptionId": "RX001",
    "totalVisits": 3,
    "dispensingUnit": 30,
    "medications": [
      { "name": "암로디핀 5mg", "category": "고혈압", "dailyDose": 1, "unit": "정", "instructions": "아침 식후 복용" },
      { "name": "메트포르민 500mg", "category": "당뇨", "dailyDose": 2, "unit": "정", "instructions": "아침/저녁 식후 복용" }
    ],
    "steps": [
      { "stepNumber": 1, "scheduledDate": "2026-01-15", "dispenseDays": 30, "status": "completed", "visitId": "V001", "canDispense": true },
      { "stepNumber": 2, "scheduledDate": "2026-02-14", "dispenseDays": 30, "status": "completed", "visitId": "V002", "canDispense": true },
      { "stepNumber": 3, "scheduledDate": "2026-03-16", "dispenseDays": 30, "status": "scheduled", "visitId": null, "canDispense": true }
    ],
    "createdAt": "2026-01-15"
  }
}
```

**실패 응답 (404 Not Found):**
```json
{
  "success": false,
  "error": "복약 관리 계획을 찾을 수 없습니다."
}
```

---

### 4.3 `POST /api/visits` — 방문 기록 저장

**요청 바디:**
```json
{
  "planId": "PL001",
  "patientId": "P001",
  "visitDate": "2026-03-15",
  "stepNumber": 3,
  "adherence": "good",
  "adverseReaction": false,
  "adverseReactionNote": null,
  "storageCondition": "good",
  "pharmacistNote": "복약 순응도 양호. 이상 없음.",
  "dispensedMedications": [
    { "medicationId": "M001", "name": "암로디핀 5mg", "quantity": 30, "unit": "정" },
    { "medicationId": "M002", "name": "메트포르민 500mg", "quantity": 60, "unit": "정" }
  ]
}
```

**성공 응답 (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "V_1710499200000",
    "planId": "PL001",
    "patientId": "P001",
    "visitDate": "2026-03-15",
    "stepNumber": 3,
    "adherence": "good",
    "adverseReaction": false,
    "adverseReactionNote": null,
    "storageCondition": "good",
    "pharmacistNote": "복약 순응도 양호. 이상 없음.",
    "dispensedMedications": [
      { "medicationId": "M001", "name": "암로디핀 5mg", "quantity": 30, "unit": "정" },
      { "medicationId": "M002", "name": "메트포르민 500mg", "quantity": 60, "unit": "정" }
    ],
    "createdAt": "2026-03-15T10:00:00Z"
  }
}
```

---

### 4.4 `POST /api/visits/:id/dispense` — 단계별 조제 처리

**요청 바디:**
```json
{
  "medications": [
    { "medicationId": "M001", "name": "암로디핀 5mg", "quantity": 30, "unit": "정" },
    { "medicationId": "M002", "name": "메트포르민 500mg", "quantity": 60, "unit": "정" }
  ]
}
```

**성공 응답 (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "V001",
    "planId": "PL001",
    "patientId": "P001",
    "visitDate": "2026-03-15",
    "stepNumber": 3,
    "dispensedAt": "2026-03-15T10:05:00Z",
    "dispensedMedications": [
      { "medicationId": "M001", "name": "암로디핀 5mg", "quantity": 30, "unit": "정" },
      { "medicationId": "M002", "name": "메트포르민 500mg", "quantity": 60, "unit": "정" }
    ]
  }
}
```

**조제 불가 응답 (400 Bad Request):**
```json
{
  "success": false,
  "error": "이전 방문 기록이 확인되지 않아 조제를 진행할 수 없습니다.",
  "code": "PREVIOUS_VISIT_REQUIRED"
}
```

---

### 4.5 `GET /api/patients/:patientId/visits` — 환자 방문 이력 조회

**성공 응답 (200 OK):**
```json
{
  "success": true,
  "data": [
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
    },
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
    }
  ]
}
```

---

## 5. 완료 기준

### 5.1 TC-01: 환자 신규 등록 및 복약 관리 계획 수립

**시나리오:**
1. 약사가 환자 목록 화면(`/pharmacist/patients`)에서 기존 환자 선택
2. 환자 상세 화면에서 "복약 관리 계획 수립" 버튼 클릭
3. PlanCreatePage에서 다음 입력:
   - 총 처방 기간: 90일
   - 방문 횟수: 3회
   - 시작일: 2026-03-15
   - 의약품: 암로디핀 5mg (1정, 아침 식후)
4. "일정 미리보기" 확인: 3단계 (30일씩) 일정이 계산됨
5. "계획 확정 및 저장" 클릭 → `POST /api/plans` 호출 → 성공

**통과 기준:**
- ✅ PlanCreatePage에서 처방 기간 + 방문 횟수 입력 시 단계별 방문 일정 자동 계산
- ✅ 잔여일이 있는 경우 마지막 단계에 반영
- ✅ 의약품 목록 1개 이상 입력 가능
- ✅ `POST /api/plans` 호출 후 성공 응답 수신
- ✅ 저장 성공 후 환자 상세 페이지로 이동, 계획 타임라인 표시

---

### 5.2 TC-02: 1차 방문 — 정상 조제

**시나리오:**
1. 약사가 환자 상세 화면(P001 — 김영희)에서 복약 관리 계획 확인
2. PL003 계획 (1단계 예정 중, 이전 방문 없음) 에서 "조제 진행" 버튼 클릭
3. VisitRecordPage에서 복약 상태 기록:
   - 복약 순응도: 양호
   - 이상 반응: 없음
   - 보관 상태: 양호
   - 약사 메모: "1차 복약 지도 완료"
4. "방문 기록 저장" 클릭
5. `POST /api/visits` → 성공 → `POST /api/visits/V_NEW/dispense` → 성공

**통과 기준:**
- ✅ VisitRecordPage에 보관 상태 필드 표시
- ✅ 1단계이므로 이전 방문 기록 없이 조제 진행 가능
- ✅ `POST /api/visits` 호출 시 전체 필드(storageCondition 포함) 전송
- ✅ `POST /api/visits/:id/dispense` 성공 응답 수신
- ✅ 저장 성공 후 환자 상세 페이지로 이동, 방문 이력에 신규 기록 표시

---

### 5.3 TC-03: 정기 방문 — 복약 상태 정상 (2단계 조제)

**시나리오:**
1. 약사가 환자 상세 화면(P001 — 김영희, PL001 계획)에서 3단계 확인
   - 1단계: 완료 (V001), 2단계: 완료 (V002), 3단계: 예정 → `canDispense: true`
2. 3단계 "조제 진행" 버튼 클릭 (이전 2단계 완료 확인됨)
3. VisitRecordPage에서:
   - 복약 순응도: 보통
   - 이상 반응: 없음
   - 보관 상태: 양호
4. "방문 기록 저장" 클릭
5. `POST /api/visits` → `POST /api/visits/V_NEW/dispense` → 성공

**이전 방문 기록 없는 케이스 (조제 불가 검증):**
1. PL002 계획 (P002 — 이철수, 2단계 예정, 1단계 visitId=V003 완료됨)에서 2단계 "조제 진행"
2. `POST /api/visits/:id/dispense` 호출 시 이전 단계 visitId 확인 → 통과
3. (음성 케이스) PL003 계획 (P003 — 박순자, 1단계 visitId=null) 에서 2단계 버튼은 비활성화 상태

**통과 기준:**
- ✅ 이전 단계 visitId 존재 시 조제 진행 가능 (`canDispense: true`)
- ✅ 이전 단계 visitId 없는 경우 PatientDetailPage에서 "조제 진행" 버튼 비활성화
- ✅ `POST /api/visits/:id/dispense` 호출 시 백엔드 검증 동작
- ✅ 방문 이력 목록에 신규 기록 누적 표시
- ✅ 모바일(375px) / PC(1280px) 레이아웃 이상 없음

---

### 5.4 전체 Sprint 2 완료 조건

| 항목 | 기준 |
|---|---|
| F-001 자동 계산 | 처방 기간 + 방문 횟수 입력 → 단계별 일정 자동 계산 화면 표시 |
| F-001 저장 | `POST /api/plans` 호출 성공, 응답에 `steps` 배열 포함 |
| F-002 조제 가능 여부 | 이전 방문 없는 2단계 이상은 조제 진행 버튼 비활성화 |
| F-002 조제 처리 | `POST /api/visits/:id/dispense` 성공, 이전 방문 없는 케이스 400 반환 |
| F-004 전체 필드 저장 | `storageCondition` 포함 모든 필드 `POST /api/visits`로 전송 |
| F-004 이력 조회 | `GET /api/patients/:id/visits` 방문 이력 목록 PatientDetailPage에 표시 |
| TC-01 ~ TC-03 | 3개 시나리오 전체 동작 확인 |
| 반응형 | 모바일(375px), PC(1280px) 신규 화면 레이아웃 이상 없음 |
| TypeScript | `npm run build` 프론트엔드/백엔드 컴파일 에러 없음 |

---

## 6. 파일 변경 요약

### 수정 파일

| 파일 경로 | 변경 유형 | 주요 변경 내용 |
|---|---|---|
| `frontend/src/types/index.ts` | 수정 | `PlanCreateForm`, `VisitCreateForm`, `DispenseRequest` 타입 추가; `PlanStep.canDispense` 필드 추가 |
| `frontend/src/routes/index.tsx` | 수정 | `/pharmacist/patients/:patientId/plans/new`, `/pharmacist/patients/:patientId/visits/new` 라우트 추가 |
| `frontend/src/pages/pharmacist/PlanCreatePage.tsx` | 수정 | 환자 선택 드롭다운, 의약품 목록 동적 추가, 실제 API 연동, 저장 후 이동 로직 구현 |
| `frontend/src/pages/pharmacist/PlanCreatePage.module.css` | 수정 | 의약품 목록, 일정 미리보기 스타일 추가 |
| `frontend/src/pages/pharmacist/VisitRecordPage.tsx` | 수정 | 신규/조회 모드 분리, storageCondition 필드 추가, 실제 API 연동 (POST visits + dispense) |
| `frontend/src/pages/pharmacist/VisitRecordPage.module.css` | 수정 | 조제 의약품 목록, 오류 Modal 스타일 추가 |
| `frontend/src/pages/pharmacist/PatientDetailPage.tsx` | 수정 | 복약 관리 계획 타임라인 섹션 추가, 조제 진행 버튼 활성화 로직 |
| `frontend/src/pages/pharmacist/PatientDetailPage.module.css` | 수정 | 계획 타임라인 스타일 추가 |
| `backend/src/routes/plans.ts` | 수정 | `medications` 포함 응답, 잔여일 처리, `canDispense` 계산, `GET /:patientId/active` 추가 |
| `backend/src/routes/visits.ts` | 수정 | `storageCondition` 필드 반영, dispense 이전 방문 검증 로직 추가 |
| `backend/src/routes/patients.ts` | 수정 | `GET /:id/visits` 엔드포인트 — patientId 기반 필터링 + 내림차순 정렬 구현 |
| `backend/src/fixtures/visits.json` | 수정 | `storageCondition` 필드 추가, TC-02/TC-03 케이스 픽스처 추가 |

### 신규 생성 파일

없음 (기존 파일 수정으로 구현 완료 가능)

---

## 7. 브랜치 전략

- 작업 브랜치: `sprint2`
- 베이스 브랜치: `main` (Sprint 1 머지 완료 후)
- PR: Sprint 2 완료 시 sprint-close 에이전트가 생성

---

## 8. 참고 사항

### 8.1 Sprint 1 산출물 중 Sprint 2와 직접 연결되는 파일

| Sprint 1 산출물 | Sprint 2에서의 역할 |
|---|---|
| `frontend/src/types/index.ts` | `Plan`, `Visit`, `PlanStep` 타입 이미 정의됨 — Sprint 2에서 확장 |
| `backend/src/fixtures/plans.json` | PL001(P001 3단계, 3차 조제 예정), PL002(P002 2단계 예정), PL003(P003 1단계 미조제) — TC 시나리오 재현에 그대로 활용 |
| `backend/src/fixtures/visits.json` | V001, V002 (P001 1/2차 완료) — storageCondition 필드만 추가 후 활용 |
| `frontend/src/components/common/` | Button, Card, Badge, Loading 등 공통 컴포넌트 Sprint 2 신규 폼에서 재사용 |

### 8.2 연관 문서

- `docs/PRD.md` — F-001, F-002, F-004 요구사항 상세
- `docs/ROADMAP.md` — Sprint 2 마일스톤 및 완료 조건
- `docs/sprint/sprint1.md` — Sprint 1 구현 산출물 및 픽스처 데이터 정의
