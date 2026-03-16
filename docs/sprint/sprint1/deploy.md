# Sprint 1 배포 가이드

## 자동 검증 완료

- ✅ 루트 package.json (concurrently 설정)
- ✅ backend/ 전체 파일 구조 생성
  - ✅ package.json, tsconfig.json
  - ✅ src/index.ts, src/app.ts
  - ✅ src/routes/index.ts + 7개 라우터 (patients, plans, visits, exchanges, interactions, dashboard, notifications)
  - ✅ src/fixtures/ 7개 JSON 픽스처 파일
- ✅ frontend/ 전체 파일 구조 생성
  - ✅ package.json, tsconfig.json, tsconfig.node.json, vite.config.ts, index.html
  - ✅ src/main.tsx, src/App.tsx
  - ✅ src/styles/globals.css
  - ✅ src/api/client.ts
  - ✅ src/types/index.ts
  - ✅ src/routes/index.tsx
  - ✅ src/layouts/ (PharmacistLayout, PatientLayout + CSS 모듈)
  - ✅ src/components/common/ (Header, BottomNav, SideNav, Card, Badge, Button, Loading, EmptyState + CSS 모듈)
  - ✅ src/pages/ (RoleSelectPage, NotFoundPage + CSS 모듈)
  - ✅ src/pages/pharmacist/ (DashboardPage, PatientListPage, PatientDetailPage, PlanCreatePage, VisitRecordPage + CSS 모듈)
  - ✅ src/pages/patient/ (SchedulePage, ReportPage + CSS 모듈)

## 수동 검증 필요

아래 항목은 사용자가 직접 수행해야 합니다.

### 1. 의존성 설치

루트 디렉토리에서 순서대로 실행:

```bash
# 루트 의존성 (concurrently)
cd <프로젝트 루트>
npm install

# 백엔드 의존성
cd backend
npm install

# 프론트엔드 의존성
cd frontend
npm install
```

### 2. 개발 서버 실행

루트 디렉토리에서:

```bash
npm run dev
```

- 백엔드: http://localhost:3000
- 프론트엔드: http://localhost:5173

### 3. 브라우저 검증 체크리스트

- ⬜ http://localhost:5173 접속 → 역할 선택 화면 표시 확인
- ⬜ 약사 버튼 클릭 → /pharmacist 대시보드 이동 확인
- ⬜ 대시보드 요약 카드 (오늘 방문 3건, 조제 대기 5건, 이상반응 1건) 표시 확인
- ⬜ 환자 관리 탭 → 환자 목록 3명 표시 확인
- ⬜ 환자 클릭 → 환자 상세 화면 이동 확인
- ⬜ 방문 이력 목록 표시 확인
- ⬜ 복약 관리 계획 수립 → 일정 미리보기 기능 확인
- ⬜ 환자 버튼 클릭 → /patient 방문 일정 화면 이동 확인
- ⬜ 알림 (D-3 배지) 표시 확인
- ⬜ 복약 일정 (1차 완료, 2차 완료, 3차 예정) 표시 확인
- ⬜ 이상 반응 신고 탭 → 신고 폼 입력 및 접수 확인

### 4. API 응답 검증 (서버 실행 후)

```bash
curl http://localhost:3000/api/dashboard
curl http://localhost:3000/api/patients
curl http://localhost:3000/api/plans/PL001
curl http://localhost:3000/api/notifications
```

### 5. 반응형 레이아웃 확인

- ⬜ 모바일(375px): 하단 네비게이션 표시, 사이드바 숨김
- ⬜ 태블릿(768px): 역할 선택 카드 가로 배치
- ⬜ PC(1280px): 사이드바 표시, 하단 네비게이션 숨김
