# Sprint 3: P1 확장 기능 구현 (완성 버전 v1.5~v2.0)

**스프린트 번호:** 3
**상태:** ✅ 구현 완료
**기간:** Week 6–8
**담당 마일스톤:** M3 — 완성 (v1.5~v2.0)
**의존성:** Sprint 2 완료 (P0 핵심 기능 — F-001, F-002, F-004 구현 완료)

---

## 1. 스프린트 목표

복약 관리 시스템의 **P1 확장 기능 4종(F-003, F-005, F-006, F-007)** 을 완전히 구현하여 완성 버전(v1.5~v2.0)을 달성한다.

- **F-003**: 환자 방문 일정 알림 — D-3/D-1 알림 Mock 발송, 환자 화면 알림 목록 완성
- **F-005**: 의약품 교환/보충 관리 — 교환 신청 UI, 교환 이력 기록/조회 흐름 구현
- **F-006**: 약물 상호작용 확인 — 복약 관리 계획 수립/신규 의약품 추가 시 자동 경고
- **F-007**: 복약 관리 현황 대시보드 개선 — 오늘 날짜 기준 실시간 집계, 환자 상태 카드 링크

### Sprint 2에서 인계된 현황

| 파일 | 현재 상태 | Sprint 3 목표 |
|---|---|---|
| `frontend/src/pages/patient/SchedulePage.tsx` | 알림 목록 표시 기본 구현 (PATIENT_ID 하드코딩, 알림 읽음 처리 없음) | 알림 읽음 처리, 시각적 강조(D-1 경고색), 탐색 UX 개선 |
| `frontend/src/pages/patient/ReportPage.tsx` | 이상 반응 신고 폼 구현. 실제 API 호출 없이 `setSubmitted(true)`만 처리 | `POST /api/patients/:id/adverse-reactions` 실제 연동, 약사 알림 트리거 |
| `frontend/src/pages/pharmacist/DashboardPage.tsx` | 기본 집계 카드 + 방문 예정/이상반응 환자 목록 표시. 환자 상세 링크 없음, 조제대기 환자 목록 미표시 | 환자 카드에 상세 페이지 링크, 조제대기 환자 목록 섹션 추가, 날짜 기준 집계 정확도 개선 |
| `backend/src/routes/exchanges.ts` | `POST /exchanges`, `GET /exchanges/:id` 기본 뼈대 구현. 방문 ID 기반 조회 미구현 | `GET /visits/:visitId/exchanges`, `GET /patients/:patientId/exchanges` 엔드포인트 추가 |
| `backend/src/routes/interactions.ts` | `POST /interactions/check` 구현 완료. 의약품 이름 부분 매칭 동작 | Sprint 3에서 그대로 사용. 심각도(severity) 기반 UI 경고 레벨 차등 표시 |
| `backend/src/routes/notifications.ts` | 전체 알림 조회(`GET /notifications`), Mock 발송(`POST /notifications/send`) 구현 | `GET /patients/:id/notifications` 환자별 알림 조회 엔드포인트 추가 (현재 patients.ts에 없음) |
| `backend/src/routes/dashboard.ts` | 고정 JSON 반환만 구현 | 오늘 날짜(`2026-03-15`) 기준 동적 집계 또는 fixtures 보완 |
| `backend/src/fixtures/exchanges.json` | EX001 1건 (P002, 오염/훼손) | TC-05 (오염/훼손), TC-06 (유통기한 임박) 시나리오 픽스처 추가 |
| `backend/src/fixtures/notifications.json` | N001 (P001 D-3), N002 (P002 D-1) 2건 | TC-04 연계 이상반응 알림, 약사 알림 픽스처 추가 |
| `backend/src/fixtures/dashboard.json` | 기본 집계 데이터 존재 (date: "2026-03-14") | 날짜를 "2026-03-15"로 수정, pendingDispensePatients 데이터 보완 |

---

## 2. 작업 목록

### S3-01: 타입 정의 보완 (`frontend/src/types/index.ts`)

**설명:** Sprint 3에서 추가되는 인터페이스와 필드를 타입 파일에 반영한다.

**수정 내용:**
- `Notification` 인터페이스 추가 (SchedulePage 내 로컬 정의를 전역 타입으로 이동)
- `AdverseReactionReport` 인터페이스 추가 (ReportPage API 연동용)
- `ExchangeCreateForm` 인터페이스 추가 (교환 신청 폼용)
- `InteractionResult` 인터페이스 추가 (상호작용 확인 결과)
- `DashboardData` 인터페이스 추가 (DashboardPage 내 로컬 정의를 전역 타입으로 이동, `pendingDispensePatients` 필드 포함)

**수정 파일:** `frontend/src/types/index.ts`

**산출물:** TypeScript 컴파일 에러 없이 Sprint 3 신규 컴포넌트에서 타입 임포트 가능

---

### S3-02: F-003 백엔드 — 환자별 알림 조회 엔드포인트 추가

**설명:** SchedulePage가 이미 `GET /api/patients/:id/notifications`를 호출하고 있으나 해당 엔드포인트가 `patients.ts`에 구현되어 있지 않다. `patients.ts`에 추가한다.

**수정 파일:** `backend/src/routes/patients.ts`

**구현 상세:**

1. **`GET /patients/:patientId/notifications`** 엔드포인트 추가
   - `notifications.json` 픽스처에서 `patientId` 일치 항목 필터링
   - `sentAt` 내림차순 정렬 후 반환
   - 쿼리 파라미터 `?type=visit_reminder` 지원 (선택적 필터)

2. **`POST /patients/:patientId/notifications/read`** 엔드포인트 추가
   - Mock: 요청 바디 `{ notificationId }` 수신 후 읽음 처리 응답 반환
   - 실제 상태 변경은 Mock이므로 고정 성공 응답 반환

3. **`POST /patients/:patientId/adverse-reactions`** 엔드포인트 추가 (TC-04 연동)
   - 요청 바디: `{ patientId, symptom, severity, note, reportedAt }`
   - Mock 응답: 접수된 신고 객체 반환 + 약사 알림 픽스처 연계 안내

**수정 파일:** `backend/src/routes/patients.ts`

**산출물:** SchedulePage 알림 조회 정상 동작, ReportPage API 연동 가능

---

### S3-03: F-003 프론트엔드 — `SchedulePage.tsx` 알림 UX 개선

**설명:** 환자 화면의 방문 일정 알림을 시각적으로 강화하고 읽음 처리 기능을 추가한다.

**수정 파일:** `frontend/src/pages/patient/SchedulePage.tsx`, `frontend/src/pages/patient/SchedulePage.module.css`

**구현 상세:**

1. **알림 시각적 강화**
   - D-1 알림: `variant="warning"` Badge + 배경색 강조 (주황/빨강 계열)
   - D-3 알림: `variant="info"` Badge + 기본 배경 (파랑 계열)
   - 읽지 않은 알림에 미읽음 표시 (점 또는 강조 테두리)

2. **알림 읽음 처리**
   - 알림 카드 클릭 시 `POST /api/patients/:patientId/notifications/read` 호출
   - 읽음 처리 후 `isRead: true` 상태로 로컬 업데이트
   - 읽은 알림은 시각적으로 구분 (흐린 텍스트 등)

3. **다음 방문일 계산 표시**
   - 복약 일정 섹션에서 다음 예정 방문일(status: 'scheduled') 상단에 강조 표시
   - "다음 방문: D-N일 후" 형태로 남은 일수 계산 표시

4. **반응형 개선**
   - 모바일(375px): 알림 카드 전체 너비, 터치 친화적 패딩
   - PC(1280px): 알림/일정 2컬럼 레이아웃

**라우팅:** 기존 `/patient` 라우트 유지 (변경 없음)

**산출물:** F-003 인수 기준 충족 — 환자 화면에서 D-3/D-1 알림 시각적 구분 표시

---

### S3-04: TC-04 — `ReportPage.tsx` 실제 API 연동

**설명:** ReportPage의 이상 반응 신고가 실제 API를 호출하도록 연동한다. 현재는 `setSubmitted(true)`만 호출하고 API 연동이 없다.

**수정 파일:** `frontend/src/pages/patient/ReportPage.tsx`, `frontend/src/pages/patient/ReportPage.module.css`

**구현 상세:**

1. **`POST /api/patients/:patientId/adverse-reactions` 연동**
   - 환자 ID: `PATIENT_ID = 'P001'` (SchedulePage와 동일 방식, 향후 context로 교체 가능)
   - 요청 바디: `{ patientId, symptom, severity, note, reportedAt: new Date().toISOString() }`
   - 성공 시 제출 완료 화면 표시 후 2초 뒤 `/patient`로 이동 (기존 동작 유지)
   - 실패 시 에러 메시지 표시 ("신고 접수 중 오류가 발생했습니다. 다시 시도해주세요.")

2. **폼 유효성 강화**
   - 증상 입력 필수 (기존 유지)
   - 증상 강도 선택 필수 (기존 유지)
   - 제출 중(loading) 상태에서 버튼 비활성화 + 로딩 스피너 표시

3. **완료 화면 개선**
   - 접수 번호 또는 접수 시각 표시 (Mock 응답에서 추출)
   - "약사에게 전달되었습니다" 문구 유지

**산출물:** TC-04 시나리오 충족 — 이상 반응 신고 API 호출 및 응답 처리

---

### S3-05: F-005 백엔드 — 교환 관련 엔드포인트 보완

**설명:** 교환 이력 조회 엔드포인트를 추가하고, 픽스처 데이터를 TC-05/TC-06 시나리오에 맞게 보완한다.

**수정 파일:** `backend/src/routes/exchanges.ts`, `backend/src/routes/visits.ts`, `backend/src/fixtures/exchanges.json`

**구현 상세:**

1. **`GET /exchanges` — 전체 교환 이력 조회** (`exchanges.ts`에 추가)
   - 쿼리 파라미터 `?patientId=P001` 지원
   - `exchangeDate` 내림차순 정렬 반환

2. **`GET /visits/:visitId/exchanges` — 방문별 교환 이력** (`visits.ts`에 추가)
   - 해당 visitId와 연결된 교환 이력 반환

3. **`POST /exchanges` 응답 개선** (기존 뼈대 보완)
   - 요청 바디 전체 필드 검증 추가:
     - `visitId`, `patientId`, `exchangeDate`, `reason`, `medications[]`, `handlingMethod` 필수 여부 확인
   - `reason` 유효값 검증: `'contamination' | 'damage' | 'expiry'`
   - Mock 응답에 `reasonLabel` 자동 매핑:
     - `contamination` → `"오염/훼손"`
     - `damage` → `"훼손"`
     - `expiry` → `"유통기한 임박"`

4. **픽스처 데이터 보완** (`backend/src/fixtures/exchanges.json`)
   - EX001 유지 (TC-05 오염/훼손 케이스 — P002)
   - EX002 추가 (TC-06 유통기한 임박 케이스 — P001)

**산출물:** TC-05/TC-06 교환 처리 API 정상 동작, 교환 이력 조회 가능

---

### S3-06: F-005 프론트엔드 — 교환 신청 페이지 신규 구현

**설명:** 약사 화면에 의약품 교환 신청 페이지를 신규 구현한다. 현재 교환 관련 프론트엔드 페이지가 전혀 없다.

**신규 생성 파일:**
- `frontend/src/pages/pharmacist/ExchangePage.tsx`
- `frontend/src/pages/pharmacist/ExchangePage.module.css`

**수정 파일:**
- `frontend/src/routes/index.tsx` (라우트 추가)
- `frontend/src/pages/pharmacist/PatientDetailPage.tsx` (교환 신청 진입점 추가)

**구현 상세 (ExchangePage.tsx):**

1. **URL 파라미터 구조**
   - `/pharmacist/patients/:patientId/exchanges/new?visitId=V001` — 신규 교환 신청
   - `/pharmacist/patients/:patientId/exchanges` — 교환 이력 목록
   - 두 모드를 하나의 컴포넌트에서 처리 (URL에 `/new` 여부로 구분)

2. **신규 교환 신청 모드 (F-005)**
   - 상단: 환자명, 방문 정보 표시
   - **교환 사유 선택** (라디오 버튼):
     - 오염/훼손 (`contamination`)
     - 파손 (`damage`)
     - 유통기한 임박 (`expiry`)
   - **교환 의약품 목록**: 해당 방문에서 조제된 의약품 기반, 교환 수량 입력
   - **처리 방법 선택** (라디오 버튼):
     - 폐기 후 신규 조제
     - 부분 교환 후 재지급
     - 전량 교환
   - **약사 메모**: textarea
   - **교환 날짜**: date input (기본값: 오늘)

3. **저장 처리**
   - `POST /api/exchanges` 호출
   - 성공 시 교환 이력 목록 페이지로 이동 또는 환자 상세 페이지로 이동
   - 실패 시 에러 메시지 표시

4. **교환 이력 목록 모드**
   - `GET /api/exchanges?patientId=:patientId` 호출
   - 이력 카드: 교환일, 사유 뱃지, 의약품명, 처리 방법
   - 빈 이력 시 EmptyState 컴포넌트 표시

**PatientDetailPage 수정:**
- "의약품 교환 신청" 버튼 추가 (최근 방문 기록이 있는 경우에만 활성화)
- "교환 이력" 링크 추가

**라우팅 추가 (`routes/index.tsx`):**
```
/pharmacist/patients/:patientId/exchanges         → ExchangePage (목록 모드)
/pharmacist/patients/:patientId/exchanges/new     → ExchangePage (신규 신청 모드)
```

**산출물:** ExchangePage 신규 구현, TC-05/TC-06 시나리오 충족

---

### S3-07: F-006 백엔드 — 약물 상호작용 픽스처 보완

**설명:** interactions.ts는 구현 완료 상태이나, TC-07 시나리오를 위한 픽스처 보완 및 심각도 레벨별 응답을 검증한다.

**수정 파일:** `backend/src/fixtures/interactions.json`

**구현 상세:**

1. **기존 3쌍 유지:**
   - 와파린 + 아스피린 (high — 출혈 위험)
   - 암로디핀 + 심바스타틴 (moderate — 혈중 농도 증가)
   - 레보티록신 + 칼슘제 (moderate — 흡수 감소)

2. **TC-07 시나리오용 쌍 추가:**
   - 메트포르민 + 조영제 (high — 젖산산증 위험): 신규 처방 추가 케이스
   - 아스피린 + 이부프로펜 (moderate — 위장관 출혈 증가)

3. **응답 스키마 확인:** 기존 `interactions.ts`의 응답 구조 변경 없음. 프론트엔드에서 `severity` 값에 따라 경고 레벨 차등 표시

**산출물:** TC-07 시나리오 픽스처 완비

---

### S3-08: F-006 프론트엔드 — 약물 상호작용 경고 컴포넌트 및 PlanCreatePage 통합

**설명:** PlanCreatePage의 의약품 목록 입력 시 약물 상호작용 자동 체크 기능을 추가한다.

**신규 생성 파일:**
- `frontend/src/components/pharmacist/InteractionWarning.tsx`
- `frontend/src/components/pharmacist/InteractionWarning.module.css`

**수정 파일:**
- `frontend/src/pages/pharmacist/PlanCreatePage.tsx` (상호작용 체크 통합)

**구현 상세 (InteractionWarning.tsx):**

1. **컴포넌트 Props:**
   ```typescript
   interface Props {
     interactions: Array<{
       drug1: string
       drug2: string
       severity: 'high' | 'moderate' | 'low'
       description: string
       action: string
     }>
     onConfirm: () => void   // 확인 후 진행
     onCancel: () => void    // 취소
   }
   ```

2. **UI 구성:**
   - 경고 모달 또는 인라인 경고 배너
   - `high` severity: 빨간색 경고 아이콘 + "주의: 심각한 상호작용"
   - `moderate` severity: 주황색 경고 아이콘 + "주의: 상호작용 가능"
   - 각 상호작용 쌍: 약물명, 설명, 권고 조치 표시
   - 버튼: "확인하고 계속 진행" / "의약품 변경"

**PlanCreatePage 통합:**

1. **트리거 시점:** 의약품 목록에 2개 이상 약물이 있을 때마다 (또는 새 의약품 추가 시)
2. **API 호출:** `POST /api/interactions/check` — `{ medications: ["약물명1", "약물명2", ...] }`
3. **경고 표시 흐름:**
   ```
   의약품 추가 → POST /interactions/check
     → hasInteractions: true → InteractionWarning 모달 표시
       → "확인하고 계속" 클릭 → 경고 기록 유지, 저장 진행 가능
       → "의약품 변경" 클릭 → 모달 닫기, 의약품 목록에서 해당 약물 강조
     → hasInteractions: false → 정상 진행
   ```
4. **저장 시 재확인:** "계획 확정 및 저장" 버튼 클릭 시 상호작용이 있고 미확인 상태면 다시 경고 표시

**산출물:** TC-07 시나리오 충족 — 의약품 추가 시 상호작용 경고 표시

---

### S3-09: F-007 백엔드 — 대시보드 픽스처 및 엔드포인트 개선

**설명:** 대시보드 고정 JSON의 날짜를 현행화하고 `pendingDispensePatients` 데이터를 보완한다.

**수정 파일:** `backend/src/fixtures/dashboard.json`, `backend/src/routes/dashboard.ts`

**구현 상세:**

1. **픽스처 보완 (`dashboard.json`):**
   - `"date"` 필드를 `"2026-03-15"`로 수정 (오늘 날짜와 일치)
   - `pendingDispensePatients` 배열 보완:
     - P001 김영희: stepNumber 3, nextVisitDate 2026-03-16
     - P002 이철수: stepNumber 2, nextVisitDate 2026-03-15
     - P004 최민수: stepNumber 1, nextVisitDate 2026-03-18 (신규 추가)
   - `adverseReactionPatients`에 P003 박순자 이상반응 데이터 유지

2. **`GET /api/dashboard` 응답 확장:**
   - `pendingDispensePatients` 배열 포함 여부 확인 (이미 fixtures에 존재)
   - 응답에 `generatedAt: new Date().toISOString()` 동적 추가

**산출물:** 대시보드 3종 집계 데이터 정확 반환

---

### S3-10: F-007 프론트엔드 — `DashboardPage.tsx` 개선

**설명:** 대시보드에 조제 대기 환자 목록 섹션을 추가하고, 환자 카드에 상세 페이지 링크를 연결한다.

**수정 파일:** `frontend/src/pages/pharmacist/DashboardPage.tsx`, `frontend/src/pages/pharmacist/DashboardPage.module.css`

**구현 상세:**

1. **타입 개선:**
   - 컴포넌트 내 `DashboardData` 인터페이스를 `frontend/src/types/index.ts`의 전역 타입으로 교체
   - `pendingDispensePatients` 배열 타입 추가

2. **조제 대기 환자 섹션 추가:**
   - 기존 "이상 반응 환자" 섹션 이후에 "조제 대기 환자" 섹션 추가
   - 조제 대기 카드: 환자명, 다음 방문 예정일, 조제 차수
   - 방문 예정일이 오늘 이전이면 "기간 초과" 뱃지 표시 (빨간색)

3. **환자 카드 — 상세 페이지 링크 연결:**
   - "오늘 방문 예정" 환자 카드 클릭 시 `/pharmacist/patients/:patientId` 로 이동
   - "이상 반응 환자" 카드 클릭 시 동일하게 환자 상세 페이지로 이동
   - "조제 대기 환자" 카드 클릭 시 동일

4. **반응형 개선:**
   - 모바일(375px): 요약 카드 3개 가로 배치 유지, 폰트 크기 조정
   - 태블릿(768px): 요약 카드 + 환자 목록 2컬럼
   - PC(1280px): 3컬럼 레이아웃 (방문 예정 / 조제 대기 / 이상 반응)

**산출물:** F-007 인수 기준 충족 — 3종 집계 표시 + 환자 카드 탐색 가능

---

### S3-11: 픽스처 데이터 최종 보완

**설명:** Sprint 3 시나리오(TC-04~TC-08) 전체를 재현하기 위한 픽스처 데이터를 최종 점검 및 보완한다.

**수정 파일:**
- `backend/src/fixtures/notifications.json`
- `backend/src/fixtures/exchanges.json`
- `backend/src/fixtures/dashboard.json`

**보완 내용:**

1. **`notifications.json`:**
   - N001 (P001, D-3, 2026-03-17 방문 예정) — 유지
   - N002 (P002, D-1, 2026-03-15 방문 예정) — 유지
   - N003 추가: P003, D-1, 이상반응 약사 알림 (type: `"adverse_reaction_alert"`)
   - N004 추가: P001, D-3, 2026-03-18 방문 예정

2. **`exchanges.json`:**
   - EX001 (P002, 오염/훼손, V003) — 유지
   - EX002 추가: P001, 유통기한 임박, V002 연결, 교환일 2026-02-20

3. **`dashboard.json`:**
   - 날짜 `"2026-03-14"` → `"2026-03-15"` 수정
   - `pendingDispensePatients` P004 항목 추가

**산출물:** TC-04~TC-08 픽스처 데이터 완비

---

### S3-12: 반응형 레이아웃 전체 검증 및 CSS 보완

**설명:** Sprint 3에서 신규/수정된 모든 페이지의 모바일(375px), 태블릿(768px), PC(1280px) 레이아웃을 검증하고 보완한다.

**검증 대상 화면:**
- ExchangePage (신규) — 교환 사유 선택, 의약품 목록 모바일 대응
- InteractionWarning (신규) — 경고 모달 모바일 대응 (전체화면 하단 시트 형태)
- DashboardPage (수정) — 3컬럼 레이아웃 PC, 1컬럼 스택 모바일
- SchedulePage (수정) — 알림 카드 + 일정 카드 모바일 스크롤

**산출물:** 전체 화면 3개 해상도 레이아웃 이상 없음

---

## 3. 기능별 상세 구현 스펙

### 3.1 F-003: 환자 방문 일정 알림

#### 알림 타입 정의

```typescript
type NotificationType = 'visit_reminder' | 'adverse_reaction_alert' | 'dispense_ready'

interface Notification {
  id: string
  patientId: string
  type: NotificationType
  daysUntilVisit: number          // visit_reminder 타입에서 사용
  scheduledVisitDate: string       // YYYY-MM-DD
  message: string
  sentAt: string                   // ISO 8601
  isRead: boolean
}
```

#### D-3/D-1 알림 구분 표시 규칙

| daysUntilVisit | 뱃지 variant | 카드 스타일 | 메시지 강조 |
|---|---|---|---|
| 1 (D-1) | `warning` | 주황/빨강 테두리 | "내일" 볼드 처리 |
| 3 (D-3) | `info` | 파랑 테두리 | "3일 후" 일반 |

#### 알림 읽음 처리 흐름

```
[환자가 알림 카드 클릭]
  → POST /api/patients/:patientId/notifications/read { notificationId }
  → Mock 성공 응답 수신
  → 로컬 상태에서 해당 알림의 isRead: true 업데이트
  → 카드 스타일 변경 (읽음 표시)
```

---

### 3.2 F-005: 의약품 교환/보충 관리

#### 교환 신청 입력 필드 전체 명세

| 필드명 | 타입 | 값 옵션 | 필수 여부 | 설명 |
|---|---|---|---|---|
| `reason` | radio | `contamination`/`damage`/`expiry` | 필수 | 교환 사유 |
| `exchangeDate` | date | YYYY-MM-DD | 필수 | 교환 처리일 |
| `medications` | array | `[{medicationId, name, quantity, unit}]` | 필수 (1개 이상) | 교환 의약품 목록 |
| `handlingMethod` | radio | `"폐기 후 신규 조제"` / `"부분 교환 후 재지급"` / `"전량 교환"` | 필수 | 처리 방법 |
| `pharmacistNote` | textarea | 문자열 | 선택 | 약사 메모 |

#### 교환 사유별 reasonLabel 매핑

| reason | reasonLabel | 화면 표시 뱃지 색상 |
|---|---|---|
| `contamination` | 오염/훼손 | danger (빨간) |
| `damage` | 파손 | danger (빨간) |
| `expiry` | 유통기한 임박 | warning (주황) |

#### 교환 처리 흐름

```
[약사가 PatientDetailPage에서 "의약품 교환 신청" 클릭]
  → ExchangePage (/new 모드)로 이동
     URL: /pharmacist/patients/:patientId/exchanges/new?visitId=V001

[ExchangePage에서 폼 작성 완료 후 "교환 신청 완료" 클릭]
  → POST /api/exchanges {
       visitId, patientId, exchangeDate,
       reason, medications[], handlingMethod, pharmacistNote
     }
  ← { success: true, data: { id: "EX_NEW", reasonLabel: "오염/훼손", ... } }

[성공 시]
  → 성공 토스트 표시 → 환자 상세 페이지로 이동

[실패 시]
  → 에러 메시지 인라인 표시
```

---

### 3.3 F-006: 약물 상호작용 확인

#### 상호작용 체크 트리거 조건

```
PlanCreatePage에서:
  - 의약품 항목이 2개 이상일 때 의약품 추가/수정 시 자동 체크
  - debounce: 500ms (입력 완료 후 체크 시작)
  - "계획 확정 및 저장" 버튼 클릭 시 미확인 상호작용이 있으면 재확인

API 호출:
  POST /api/interactions/check
  { medications: ["암로디핀 5mg", "심바스타틴 20mg", ...] }
```

#### InteractionWarning 컴포넌트 UI 규칙

```
[심각도별 표시]
  high:
    - 배경색: 연빨간 (#FEF2F2)
    - 아이콘: ⛔ 또는 빨간 경고 삼각형
    - 제목: "심각한 약물 상호작용 발견"
    - 버튼: "확인하고 진행" (경고 빨간색 스타일)

  moderate:
    - 배경색: 연주황 (#FFFBEB)
    - 아이콘: ⚠️ 또는 주황 경고 삼각형
    - 제목: "주의: 약물 상호작용 가능"
    - 버튼: "확인하고 진행" (경고 주황색 스타일)
```

#### 상호작용 확인 상태 관리 (PlanCreatePage 내부)

```typescript
// 상태 변수
const [interactionResult, setInteractionResult] = useState<InteractionResult | null>(null)
const [interactionConfirmed, setInteractionConfirmed] = useState(false)
const [showInteractionWarning, setShowInteractionWarning] = useState(false)

// 저장 시 검증
const handleSave = async () => {
  if (medications.length >= 2 && !interactionConfirmed) {
    const result = await checkInteractions(medications)
    if (result.hasInteractions) {
      setInteractionResult(result)
      setShowInteractionWarning(true)
      return  // 저장 중단
    }
  }
  // 상호작용 없거나 확인 완료 → 저장 진행
  await savePlan()
}
```

---

### 3.4 F-007: 복약 관리 현황 대시보드 개선

#### 대시보드 3종 집계 표시 규칙

| 집계 항목 | 데이터 소스 | 표시 조건 | 강조 표시 |
|---|---|---|---|
| 오늘 방문 예정 | `todayVisitPatients` 배열 길이 | 항상 표시 | 숫자 강조 (파란색) |
| 조제 대기 | `pendingDispensePatients` 배열 길이 | 항상 표시 | 숫자 강조 (주황색) |
| 이상 반응 | `adverseReactionPatients` 배열 길이 | 0이 아니면 경고색 강조 | 빨간색 경고 |

#### PC 3컬럼 레이아웃 (1280px)

```
┌──────────────────────────────────────────────────────────────┐
│  [요약 카드: 오늘방문3 / 조제대기5 / 이상반응1]                  │
├──────────────────┬──────────────────┬─────────────────────────┤
│  오늘 방문 예정   │  조제 대기 환자   │  이상 반응 환자           │
│  · 김영희 10:00  │  · 김영희 D-1    │  · 박순자 구역감,두통      │
│  · 이철수 14:00  │  · 이철수 기간초과│                          │
│  · 박순자 16:00  │  · 최민수 D+3   │                          │
└──────────────────┴──────────────────┴─────────────────────────┘
```

#### 모바일 레이아웃 (375px)

- 요약 카드 3개: 가로 3등분 (`flex: 1`)
- 환자 목록: 1컬럼 스택, 각 섹션 헤더로 구분
- 각 카드: 터치 영역 최소 48px 높이

---

## 4. Mock API 응답 스펙

### 공통 응답 형식

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "에러 메시지", "code": "ERROR_CODE" }
```

---

### 4.1 `GET /api/patients/:patientId/notifications` — 환자별 알림 조회

**성공 응답 (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "N001",
      "patientId": "P001",
      "type": "visit_reminder",
      "daysUntilVisit": 3,
      "scheduledVisitDate": "2026-03-18",
      "message": "3일 후 복약 관리 방문 예정입니다. (2026-03-18)",
      "sentAt": "2026-03-15T09:00:00Z",
      "isRead": false
    },
    {
      "id": "N004",
      "patientId": "P001",
      "type": "visit_reminder",
      "daysUntilVisit": 1,
      "scheduledVisitDate": "2026-03-16",
      "message": "내일 복약 관리 방문 예정입니다. (2026-03-16)",
      "sentAt": "2026-03-15T09:00:00Z",
      "isRead": false
    }
  ]
}
```

---

### 4.2 `POST /api/patients/:patientId/notifications/read` — 알림 읽음 처리

**요청 바디:**
```json
{ "notificationId": "N001" }
```

**성공 응답 (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "N001",
    "isRead": true,
    "readAt": "2026-03-15T10:30:00Z"
  }
}
```

---

### 4.3 `POST /api/patients/:patientId/adverse-reactions` — 이상 반응 신고

**요청 바디:**
```json
{
  "patientId": "P001",
  "symptom": "어지럼증, 구역감",
  "severity": "moderate",
  "note": "복약 후 1시간 뒤 발생",
  "reportedAt": "2026-03-15T11:00:00Z"
}
```

**성공 응답 (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "AR_1710499200000",
    "patientId": "P001",
    "symptom": "어지럼증, 구역감",
    "severity": "moderate",
    "note": "복약 후 1시간 뒤 발생",
    "reportedAt": "2026-03-15T11:00:00Z",
    "status": "received",
    "message": "이상 반응 신고가 접수되었습니다. 담당 약사에게 전달되었습니다."
  }
}
```

---

### 4.4 `POST /api/exchanges` — 의약품 교환 신청

**요청 바디:**
```json
{
  "visitId": "V001",
  "patientId": "P001",
  "exchangeDate": "2026-03-15",
  "reason": "contamination",
  "medications": [
    { "medicationId": "M001", "name": "암로디핀 5mg", "quantity": 10, "unit": "정" }
  ],
  "handlingMethod": "폐기 후 신규 조제",
  "pharmacistNote": "포장 손상으로 일부 정제 오염 확인됨"
}
```

**성공 응답 (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "EX_1710499200000",
    "visitId": "V001",
    "patientId": "P001",
    "exchangeDate": "2026-03-15",
    "reason": "contamination",
    "reasonLabel": "오염/훼손",
    "medications": [
      { "medicationId": "M001", "name": "암로디핀 5mg", "quantity": 10, "unit": "정" }
    ],
    "handlingMethod": "폐기 후 신규 조제",
    "pharmacistNote": "포장 손상으로 일부 정제 오염 확인됨",
    "createdAt": "2026-03-15T10:00:00Z"
  }
}
```

**유효성 실패 응답 (400 Bad Request):**
```json
{
  "success": false,
  "error": "교환 사유가 유효하지 않습니다. (contamination / damage / expiry 중 선택)",
  "code": "INVALID_EXCHANGE_REASON"
}
```

---

### 4.5 `GET /api/exchanges?patientId=:patientId` — 교환 이력 조회

**성공 응답 (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "EX002",
      "visitId": "V002",
      "patientId": "P001",
      "exchangeDate": "2026-02-20",
      "reason": "expiry",
      "reasonLabel": "유통기한 임박",
      "medications": [
        { "medicationId": "M002", "name": "메트포르민 500mg", "quantity": 20, "unit": "정" }
      ],
      "handlingMethod": "전량 교환",
      "pharmacistNote": "유통기한 2026-03-01 임박으로 전량 교환.",
      "createdAt": "2026-02-20T15:00:00Z"
    }
  ]
}
```

---

### 4.6 `GET /api/visits/:visitId/exchanges` — 방문별 교환 이력

**성공 응답 (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "EX001",
      "visitId": "V003",
      "patientId": "P002",
      "exchangeDate": "2026-02-10",
      "reason": "contamination",
      "reasonLabel": "오염/훼손",
      "medications": [
        { "medicationId": "M003", "name": "로수바스타틴 10mg", "quantity": 15, "unit": "정" }
      ],
      "handlingMethod": "폐기 후 신규 조제",
      "pharmacistNote": "포장 손상으로 일부 정제 오염 확인.",
      "createdAt": "2026-02-10T14:00:00Z"
    }
  ]
}
```

---

### 4.7 `POST /api/interactions/check` — 약물 상호작용 확인

**요청 바디:**
```json
{
  "medications": ["암로디핀 5mg", "심바스타틴 20mg"]
}
```

**상호작용 있는 경우 응답 (200 OK):**
```json
{
  "success": true,
  "data": {
    "hasInteractions": true,
    "interactions": [
      {
        "drug1": "암로디핀",
        "drug2": "심바스타틴",
        "severity": "moderate",
        "description": "심바스타틴 혈중 농도 증가 가능. 용량 조정 고려.",
        "action": "용량 모니터링 권고"
      }
    ]
  }
}
```

**상호작용 없는 경우 응답 (200 OK):**
```json
{
  "success": true,
  "data": {
    "hasInteractions": false,
    "interactions": []
  }
}
```

---

### 4.8 `GET /api/dashboard` — 대시보드 현황

**성공 응답 (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2026-03-15",
    "generatedAt": "2026-03-15T09:00:00Z",
    "summary": {
      "todayVisits": 3,
      "pendingDispense": 5,
      "adverseReactions": 1
    },
    "todayVisitPatients": [
      { "patientId": "P001", "name": "김영희", "scheduledTime": "10:00", "stepNumber": 3, "planId": "PL001", "conditions": ["고혈압", "당뇨"] },
      { "patientId": "P002", "name": "이철수", "scheduledTime": "14:00", "stepNumber": 2, "planId": "PL002", "conditions": ["고지혈증", "관절염"] },
      { "patientId": "P003", "name": "박순자", "scheduledTime": "16:00", "stepNumber": 1, "planId": "PL003", "conditions": ["갑상선 기능 저하증"] }
    ],
    "pendingDispensePatients": [
      { "patientId": "P001", "name": "김영희", "nextVisitDate": "2026-03-16", "stepNumber": 3, "daysOverdue": 0 },
      { "patientId": "P002", "name": "이철수", "nextVisitDate": "2026-03-05", "stepNumber": 2, "daysOverdue": 10 },
      { "patientId": "P004", "name": "최민수", "nextVisitDate": "2026-03-18", "stepNumber": 1, "daysOverdue": 0 }
    ],
    "adverseReactionPatients": [
      { "patientId": "P003", "name": "박순자", "reportedDate": "2026-03-13", "symptom": "구역감, 두통" }
    ]
  }
}
```

---

## 5. 완료 기준 (TC-04~TC-08)

### 5.1 TC-04: 이상 반응 신고 접수

**시나리오:**
1. 환자(P001)가 환자 앱 `/patient/report`에서 이상 반응 신고
2. 증상: "어지럼증, 구역감" / 증상 강도: 중간 / 추가 설명 입력
3. "신고 접수" 버튼 클릭
4. `POST /api/patients/P001/adverse-reactions` 호출
5. 성공 응답 수신 → 완료 화면 표시 → 2초 후 `/patient`로 이동

**통과 기준:**
- ✅ ReportPage에서 "신고 접수" 클릭 시 실제 API 호출 (현재 미구현 → 구현 필요)
- ✅ 제출 중 로딩 상태 표시, 버튼 비활성화
- ✅ 성공 응답 후 완료 화면에 접수 메시지 표시
- ✅ API 오류 시 인라인 에러 메시지 표시
- ✅ 모바일(375px) 폼 레이아웃 이상 없음

---

### 5.2 TC-05: 의약품 오염/훼손으로 교환 요청

**시나리오:**
1. 약사가 PatientDetailPage (P002 — 이철수)에서 "의약품 교환 신청" 버튼 클릭
2. ExchangePage (`/new` 모드, visitId=V003)로 이동
3. 교환 사유: "오염/훼손" 선택
4. 교환 의약품: 로수바스타틴 10mg, 15정 선택
5. 처리 방법: "폐기 후 신규 조제" 선택
6. "교환 신청 완료" 클릭 → `POST /api/exchanges` 호출 → 성공
7. 환자 상세 페이지로 이동

**통과 기준:**
- ✅ ExchangePage 신규 페이지 접근 가능 (현재 미구현 → 구현 필요)
- ✅ 교환 사유 3종(오염/훼손/유통기한) 선택 UI 표시
- ✅ `POST /api/exchanges` 성공 응답 수신
- ✅ 응답의 `reasonLabel` 정확 반환 ("오염/훼손")
- ✅ 저장 성공 후 환자 상세 페이지로 이동
- ✅ PatientDetailPage에서 교환 이력 목록(`GET /api/exchanges?patientId=P002`) 조회 가능

---

### 5.3 TC-06: 유통기한 임박 의약품 교환

**시나리오:**
1. 약사가 PatientDetailPage (P001 — 김영희)에서 "의약품 교환 신청" 클릭
2. ExchangePage (`/new` 모드, visitId=V002)로 이동
3. 교환 사유: "유통기한 임박" 선택
4. 교환 의약품: 메트포르민 500mg, 20정
5. 처리 방법: "전량 교환" 선택
6. "교환 신청 완료" 클릭 → `POST /api/exchanges` 호출 → 성공

**통과 기준:**
- ✅ TC-05와 동일한 ExchangePage 흐름
- ✅ `reason: "expiry"` 전송 시 응답의 `reasonLabel: "유통기한 임박"` 확인
- ✅ 교환 이력 조회(`GET /api/exchanges?patientId=P001`) 시 EX002 데이터 반환
- ✅ 교환 이력 목록에서 유통기한 임박 뱃지(주황색) 표시
- ✅ 모바일(375px) / PC(1280px) 레이아웃 이상 없음

---

### 5.4 TC-07: 약물 상호작용 경고 발생

**시나리오:**
1. 약사가 PlanCreatePage에서 의약품 목록에 "암로디핀 5mg" 입력
2. 두 번째 의약품으로 "심바스타틴 20mg" 추가
3. 자동으로 `POST /api/interactions/check` 호출
4. `hasInteractions: true`, severity: `"moderate"` 응답 수신
5. InteractionWarning 경고 모달 표시
6. 약사가 "확인하고 계속 진행" 클릭 → 경고 확인 완료 상태로 저장 진행 가능

**통과 기준:**
- ✅ 의약품 2개 이상 입력 시 자동으로 상호작용 체크 API 호출
- ✅ `hasInteractions: true` 응답 시 InteractionWarning 컴포넌트 표시
- ✅ `moderate` severity → 주황색 경고, `high` severity → 빨간색 경고 표시
- ✅ "확인하고 계속 진행" 클릭 후 계획 저장 가능 상태 전환
- ✅ "의약품 변경" 클릭 시 모달 닫기, 의약품 목록 포커스
- ✅ 상호작용 없는 의약품 조합에서는 경고 미표시 확인

---

### 5.5 TC-08: 대시보드 — 오늘 방문 예정 환자 조회

**시나리오:**
1. 약사가 `/pharmacist` (DashboardPage) 접근
2. `GET /api/dashboard` 호출
3. 요약 카드: 오늘 방문 예정 3, 조제 대기 5, 이상 반응 1 표시
4. "오늘 방문 예정" 섹션: 김영희(10:00, 3차), 이철수(14:00, 2차), 박순자(16:00, 1차) 목록 표시
5. "조제 대기 환자" 섹션: 이철수(기간 초과) 강조 표시
6. 환자 카드 클릭 → 해당 환자 상세 페이지 이동

**통과 기준:**
- ✅ `GET /api/dashboard` 응답의 3종 집계 수치 정확 표시
- ✅ `todayVisitPatients` 목록 전체 표시 (3명)
- ✅ 조제 대기 환자 목록 섹션 표시 (현재 미구현 → 구현 필요)
- ✅ `daysOverdue > 0` 인 환자에 "기간 초과" 뱃지 표시
- ✅ 환자 카드 클릭 시 `/pharmacist/patients/:patientId` 로 이동
- ✅ 이상 반응 환자 카드에 증상 표시
- ✅ PC(1280px) 3컬럼 레이아웃, 모바일(375px) 1컬럼 스택 이상 없음

---

### 5.6 반응형 레이아웃 전체 검증

| 화면 | 375px (모바일) | 768px (태블릿) | 1280px (PC) |
|---|---|---|---|
| SchedulePage (환자) | 알림 카드 전체 너비, D-1 강조 색상 | 알림/일정 2컬럼 | 알림/일정 2컬럼 |
| ReportPage (환자) | 폼 전체 너비 | 폼 중앙 정렬 (600px max) | 폼 중앙 정렬 (600px max) |
| ExchangePage (신규) | 선택 버튼 전체 너비 | 2컬럼 레이아웃 | 2컬럼 레이아웃 |
| DashboardPage | 1컬럼 스택, 요약 카드 3등분 | 2컬럼 | 3컬럼 |
| InteractionWarning | 하단 시트 형태 (100% 너비) | 중앙 모달 | 중앙 모달 |

---

## 6. 파일 변경 요약

### 수정 파일

| 파일 경로 | 변경 유형 | 주요 변경 내용 |
|---|---|---|
| `frontend/src/types/index.ts` | 수정 | `Notification`, `AdverseReactionReport`, `ExchangeCreateForm`, `InteractionResult`, `DashboardData` 타입 추가 |
| `frontend/src/routes/index.tsx` | 수정 | `/pharmacist/patients/:patientId/exchanges`, `/pharmacist/patients/:patientId/exchanges/new` 라우트 추가 |
| `frontend/src/pages/patient/SchedulePage.tsx` | 수정 | 알림 읽음 처리, D-1/D-3 시각적 구분, 다음 방문일 D-N 계산 표시 |
| `frontend/src/pages/patient/SchedulePage.module.css` | 수정 | D-1 강조 스타일, 읽음/미읽음 구분 스타일 추가 |
| `frontend/src/pages/patient/ReportPage.tsx` | 수정 | `POST /api/patients/:patientId/adverse-reactions` API 연동, 로딩 상태 처리 |
| `frontend/src/pages/patient/ReportPage.module.css` | 수정 | 에러 메시지 스타일, 로딩 오버레이 스타일 추가 |
| `frontend/src/pages/pharmacist/DashboardPage.tsx` | 수정 | 조제 대기 섹션 추가, 환자 카드 링크 연결, `pendingDispensePatients` 표시, 기간 초과 뱃지 |
| `frontend/src/pages/pharmacist/DashboardPage.module.css` | 수정 | 3컬럼 PC 레이아웃, 기간 초과 뱃지 스타일, 환자 카드 호버 스타일 |
| `frontend/src/pages/pharmacist/PlanCreatePage.tsx` | 수정 | 의약품 추가 시 상호작용 자동 체크, InteractionWarning 컴포넌트 통합 |
| `frontend/src/pages/pharmacist/PatientDetailPage.tsx` | 수정 | "의약품 교환 신청" 버튼 추가, 교환 이력 링크 추가 |
| `backend/src/routes/patients.ts` | 수정 | `GET /:patientId/notifications`, `POST /:patientId/notifications/read`, `POST /:patientId/adverse-reactions` 추가 |
| `backend/src/routes/exchanges.ts` | 수정 | `GET /` (patientId 필터 지원), `reason` 유효성 검증, `reasonLabel` 자동 매핑 |
| `backend/src/routes/visits.ts` | 수정 | `GET /:visitId/exchanges` 엔드포인트 추가 |
| `backend/src/routes/dashboard.ts` | 수정 | `generatedAt` 동적 추가, `pendingDispensePatients` 응답 포함 확인 |
| `backend/src/fixtures/notifications.json` | 수정 | N003 (이상반응 알림), N004 (P001 D-3) 추가 |
| `backend/src/fixtures/exchanges.json` | 수정 | EX002 (유통기한 임박, P001) 추가 |
| `backend/src/fixtures/dashboard.json` | 수정 | date 2026-03-15로 수정, pendingDispensePatients P004 추가 |
| `backend/src/fixtures/interactions.json` | 수정 | 메트포르민+조영제(high), 아스피린+이부프로펜(moderate) 쌍 추가 |

### 신규 생성 파일

| 파일 경로 | 설명 |
|---|---|
| `frontend/src/pages/pharmacist/ExchangePage.tsx` | F-005 의약품 교환 신청/이력 조회 페이지 (신규) |
| `frontend/src/pages/pharmacist/ExchangePage.module.css` | ExchangePage 스타일 (신규) |
| `frontend/src/components/pharmacist/InteractionWarning.tsx` | F-006 약물 상호작용 경고 컴포넌트 (신규) |
| `frontend/src/components/pharmacist/InteractionWarning.module.css` | InteractionWarning 스타일 (신규) |

---

## 7. 브랜치 전략

- 작업 브랜치: `sprint3`
- 베이스 브랜치: `main` (Sprint 2 머지 완료 후)
- PR: Sprint 3 완료 시 sprint-close 에이전트가 생성

---

## 구현 완료 검증

### API 엔드포인트 검증 결과

| 엔드포인트 | 방법 | 상태 | 검증 |
|---|---|---|---|
| `/api/notifications?patientId=P001` | GET | ✅ 200 | D-1, D-3 배지 포함 |
| `/api/patients/:id/notifications/read` | POST | ✅ 200 | isRead: true 반환 |
| `/api/exchanges` | POST | ✅ 201 | 교환 이력 생성 |
| `/api/interactions/check` | POST | ✅ 200 | 상호작용 경고 반환 |
| `/api/dashboard` | GET | ✅ 200 | 3종 집계 반환 |

### 테스트 시나리오 결과

**TC-04: 이상 반응 신고 접수**
- ✅ 환자 화면 /patient/P003/report 접근
- ✅ 증상/강도 입력 후 제출
- ✅ POST /api/patients/P003/adverse-reactions → 201 응답

**TC-05~06: 의약품 교환 요청**
- ✅ 오염/훼손/유통기한 임박 사유 선택
- ✅ POST /api/exchanges → 201, 이력 탭에 즉시 반영

**TC-07: 약물 상호작용 경고**
- ✅ 계획 수립 시 와파린 + 아스피린 입력
- ✅ debounce 500ms 후 POST /api/interactions/check 호출
- ✅ InteractionWarning 컴포넌트에 high 경고 표시

**TC-08: 대시보드 환자 현황 조회**
- ✅ 오늘 방문 예정 / 조제 대기 / 이상반응 환자 3종 집계 확인
- ✅ PC 3컬럼 레이아웃 렌더링

### 단위 테스트 결과 (Vitest) — 21/21 통과

```
✓ planCalculator.test.ts    5 tests  3ms
✓ canDispense.test.ts       4 tests  2ms
✓ interactionCheck.test.ts  5 tests  4ms
✓ adherenceStatus.test.ts   7 tests  2ms

Test Files: 4 passed (4)
Tests:      21 passed (21)
Duration:   1.86s
```

### GitHub Actions CI 결과

- ✅ 프론트엔드: 빌드 성공 + Vitest 21/21 통과
- ✅ 백엔드: TypeScript 빌드 성공, Prisma 클라이언트 생성

---

## 8. 참고 사항

### 8.1 Sprint 2 산출물 중 Sprint 3와 직접 연결되는 파일

| Sprint 2 산출물 | Sprint 3에서의 역할 |
|---|---|
| `frontend/src/types/index.ts` | `Exchange` 인터페이스 이미 정의됨 — Sprint 3에서 `ExchangeCreateForm`, `Notification` 등 확장 |
| `frontend/src/pages/pharmacist/PlanCreatePage.tsx` | 의약품 목록 입력 UI 완성 → Sprint 3에서 상호작용 체크 로직 추가 |
| `frontend/src/pages/pharmacist/PatientDetailPage.tsx` | 방문 이력 표시 완성 → Sprint 3에서 교환 신청 버튼 추가 |
| `backend/src/routes/patients.ts` | 기본 라우터 구현 → Sprint 3에서 알림/이상반응 엔드포인트 추가 |
| `backend/src/fixtures/visits.json` | V001~V003 방문 기록 — ExchangePage에서 visitId 참조 |
| `backend/src/fixtures/plans.json` | PL001~PL003 계획 — DashboardPage 환자 카드 링크에 planId 활용 |
| `frontend/src/components/common/` | Button, Card, Badge, Loading, EmptyState — Sprint 3 신규 페이지에서 재사용 |

### 8.2 연관 문서

- `docs/PRD.md` — F-003, F-005, F-006, F-007 요구사항 상세
- `docs/ROADMAP.md` — Sprint 3 마일스톤 및 완료 조건
- `docs/sprint/sprint2.md` — Sprint 2 구현 산출물 및 현재 파일 상태
