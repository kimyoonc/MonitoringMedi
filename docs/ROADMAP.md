# ROADMAP: 장기처방 의약품 분할조제 복약 관리

**문서 버전:** 3.0
**최초 작성일:** 2026-03-14
**최종 수정일:** 2026-03-15
**기반 문서:** docs/PRD.md v3.0

---

## 1. 프로젝트 개요

### 1.1 제품 설명

약국이 장기처방 의약품 분할조제를 받는 환자를 대상으로, 복약 기간 전반에 걸쳐 지속적인 관리 역할을 수행할 수 있도록 지원하는 복약 관리 시스템.

### 1.2 배포 현황

| 항목 | URL |
|---|---|
| 프론트엔드 | https://monitoringmedi.vercel.app |
| 백엔드 API | https://monitoringmedi.onrender.com |
| 소스코드 | https://github.com/kimyoonc/MonitoringMedi |

### 1.3 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 플랫폼 | 반응형 웹 | 모바일(375px~) / 태블릿(768px) / PC(1280px) |
| 프론트엔드 | React 18 + TypeScript (Vite 5) | CSS Modules, React Router v6, Axios |
| 디자인 시스템 | Apple Human Interface Guidelines | iOS 시스템 색상, backdrop-blur, spring 애니메이션 |
| 상태 관리 | Zustand | 환자/대시보드/알림 전역 상태 |
| 백엔드 | Express.js + TypeScript | Prisma v6 ORM, PostgreSQL 연동 |
| 데이터베이스 | PostgreSQL (Supabase) | 영구 저장, seed 데이터 초기화 |
| 테스트 | Vitest + Testing Library | 단위 테스트 21개 |
| CI/CD | GitHub Actions | 빌드 + 테스트 자동화 |
| 프론트 배포 | Vercel | GitHub 연동 자동 배포 |
| 백엔드 배포 | Render | Node.js Web Service (무료 플랜) |

### 1.4 핵심 기능 목록

| 기능 ID | 기능명 | 우선순위 | 상태 |
|---|---|---|---|
| F-001 | 복약 관리 계획 수립 (방문 일정 자동 계산) | P0 (필수) | ✅ 완료 |
| F-002 | 단계적 조제 관리 | P0 (필수) | ✅ 완료 |
| F-003 | 환자 방문 일정 알림 (D-3, D-1) | P1 (중요) | ✅ 완료 |
| F-004 | 복약 상태 기록 | P0 (필수) | ✅ 완료 |
| F-005 | 의약품 교환/보충 관리 | P1 (중요) | ✅ 완료 |
| F-006 | 약물 상호작용 확인 | P1 (중요) | ✅ 완료 |
| F-007 | 복약 관리 현황 대시보드 | P1 (중요) | ✅ 완료 |
| F-008 | 복약 순응도 차트 | P2 (개선) | ✅ 완료 |
| F-009 | 방문 캘린더 뷰 | P2 (개선) | ✅ 완료 |

---

## 2. 전체 마일스톤 타임라인

```
Sprint 1         Sprint 2         Sprint 3         Post-Sprint
[프로젝트 셋업]   [P0 핵심 기능]   [P1 확장 기능]   [DB연동 + UI + 추가기능]
인프라 구축       F-001,002,004    F-003,005,006    PostgreSQL, Apple HIG,
                                  007              F-008, F-009
     ↓                ↓                ↓                 ↓
  ✅ 완료          ✅ 완료          ✅ 완료           ✅ 완료
 2026-03-15      2026-03-15      2026-03-15        2026-03-15
```

| 마일스톤 | 스프린트 | 산출물 | 상태 |
|---|---|---|---|
| M1: 개발 인프라 구축 | Sprint 1 | 프로젝트 골격, Mock API 서버, 라우팅 구조, 공통 컴포넌트 | ✅ 완료 |
| M2: MVP (v1.0) | Sprint 2 | F-001 복약 관리 계획, F-002 단계적 조제, F-004 복약 기록 | ✅ 완료 |
| M3: 완성 (v2.0) | Sprint 3 | F-003 알림, F-005 교환 관리, F-006 약물 상호작용, F-007 대시보드 | ✅ 완료 |
| M4: 품질 강화 | 추가 작업 | Zustand 상태 관리, Vitest 테스트 21개, GitHub Actions CI/CD | ✅ 완료 |
| M5: DB 연동 | 추가 작업 | PostgreSQL (Supabase) + Prisma v6, 인메모리 store 제거, seed 데이터 | ✅ 완료 |
| M6: UI 개선 | 추가 작업 | Apple HIG 디자인 시스템 전면 적용, 제품명 변경, 대시보드 아이콘 | ✅ 완료 |
| M7: 기능 추가 | 추가 작업 | F-008 복약 순응도 차트, F-009 방문 캘린더 뷰, `/api/calendar` 엔드포인트 | ✅ 완료 |

---

## 3. 스프린트 상세 계획

### Sprint 1: 프로젝트 셋업 + 핵심 인프라

**목표:** 개발 환경 구성 및 프론트엔드/백엔드 기본 골격 구축.

**상태:** ✅ 구현 완료 (2026-03-15)

| 작업 | 설명 | 상태 |
|---|---|---|
| S1-01 | Vite + React + TypeScript 프로젝트 초기화 | ✅ |
| S1-02 | Express.js Mock 서버 초기화 (tsx watch) | ✅ |
| S1-03 | 반응형 레이아웃 기반 설정 (375px / 768px / 1280px) | ✅ |
| S1-04 | React Router v6 라우팅 구조 (약사 `/pharmacist`, 환자 `/patient`) | ✅ |
| S1-05 | Mock API 엔드포인트 뼈대 (7개 도메인, 17개 엔드포인트) | ✅ |
| S1-06 | 테스트 픽스처 데이터 (TC-01~TC-08 커버) | ✅ |
| S1-07 | 공통 컴포넌트 8종 (Header, BottomNav, SideNav, Card, Badge, Button, Loading, EmptyState) | ✅ |
| S1-08 | 루트 `npm run dev` 동시 기동 (concurrently) | ✅ |

---

### Sprint 2: P0 핵심 기능 구현

**목표:** 복약 관리 시스템의 핵심인 P0 기능 3종(F-001, F-002, F-004) 완전 구현.

**상태:** ✅ 구현 완료 (2026-03-15)

| 기능 | 구현 내용 | 상태 |
|---|---|---|
| F-001 | 환자 드롭다운, 처방 기간/방문 횟수 입력, 잔여일 포함 일정 자동 계산, POST /api/plans 연동 | ✅ |
| F-002 | canDispense 검증, 이전 단계 미완료 시 PREVIOUS_VISIT_REQUIRED 오류, 단계별 버튼 활성화 | ✅ |
| F-004 | 복약 순응도/이상반응/보관상태/약사메모 저장, 환자 상세 타임라인 이력 조회 | ✅ |

---

### Sprint 3: P1 확장 기능 구현

**목표:** P1 기능 4종(F-003, F-005, F-006, F-007) 구현하여 완성 버전(v2.0) 달성.

**상태:** ✅ 구현 완료 (2026-03-15)

| 기능 | 구현 내용 | 상태 |
|---|---|---|
| F-003 | D-1 warning / D-3 info 배지, 읽음 처리 API 연동, 이상반응 신고 API 연동 | ✅ |
| F-005 | ExchangePage (교환 신청/이력 탭), 사유별 배지, POST /api/exchanges 연동 | ✅ |
| F-006 | InteractionWarning 컴포넌트, PlanCreatePage 실시간 체크 (debounce 500ms) | ✅ |
| F-007 | 조제 대기 섹션, 환자 카드 링크, PC 3컬럼 레이아웃, 교환 관리 네비 추가 | ✅ |

---

### Post-Sprint: DB 연동 + UI 개선 + 기능 추가

**상태:** ✅ 구현 완료 (2026-03-15)

#### M5: PostgreSQL DB 연동

| 작업 | 상태 |
|---|---|
| Prisma v6 스키마 정의 (8개 모델) | ✅ |
| Supabase PostgreSQL 연결 (세션 풀러 5432) | ✅ |
| 백엔드 라우터 전체 Prisma 쿼리로 교체 | ✅ |
| seed 데이터 초기화 스크립트 | ✅ |
| Render 환경변수 설정 및 배포 | ✅ |

#### M6: Apple HIG 디자인 시스템 적용

| 작업 | 상태 |
|---|---|
| globals.css: iOS 시스템 색상, 8pt 그리드, SF Pro 폰트 스택 | ✅ |
| Header: 반투명 backdrop-blur 네비게이션 바 | ✅ |
| BottomNav: iOS 탭 바 (반투명, 홈 인디케이터 공간) | ✅ |
| SideNav: macOS 스타일 사이드바 | ✅ |
| 전체 22개 CSS 모듈 Apple HIG 스타일 재작성 | ✅ |
| 대시보드 요약 카드: SVG 아이콘 + 그라디언트 배경 | ✅ |
| 제품명 변경: '장기처방 의약품 분할조제 복약 관리' | ✅ |

#### M7: 추가 기능

| 기능 | 구현 내용 | 상태 |
|---|---|---|
| F-008 복약 순응도 차트 | 순수 SVG 막대 차트, 방문 차수별 추이, 요약 통계, PatientDetailPage 삽입 | ✅ |
| F-009 방문 캘린더 뷰 | GET /api/calendar 엔드포인트, 월별 달력, 날짜 클릭 패널, 환자 상세 이동 | ✅ |

---

## 4. 기능별 진행 현황

| 기능 ID | 기능명 | 우선순위 | 스프린트 | 상태 |
|---|---|---|---|---|
| 인프라 | 프로젝트 셋업 및 Mock API 서버 | - | Sprint 1 | ✅ 완료 |
| F-001 | 복약 관리 계획 수립 | P0 | Sprint 2 | ✅ 완료 |
| F-002 | 단계적 조제 관리 | P0 | Sprint 2 | ✅ 완료 |
| F-004 | 복약 상태 기록 | P0 | Sprint 2 | ✅ 완료 |
| F-003 | 환자 방문 일정 알림 | P1 | Sprint 3 | ✅ 완료 |
| F-005 | 의약품 교환/보충 관리 | P1 | Sprint 3 | ✅ 완료 |
| F-006 | 약물 상호작용 확인 | P1 | Sprint 3 | ✅ 완료 |
| F-007 | 복약 관리 현황 대시보드 | P1 | Sprint 3 | ✅ 완료 |
| 테스트 | Vitest 단위 테스트 21개 | - | 추가 작업 | ✅ 완료 |
| 상태관리 | Zustand 스토어 3개 | - | 추가 작업 | ✅ 완료 |
| CI/CD | GitHub Actions 파이프라인 | - | 추가 작업 | ✅ 완료 |
| DB | PostgreSQL (Supabase) + Prisma v6 | - | 추가 작업 | ✅ 완료 |
| UI | Apple HIG 디자인 시스템 | - | 추가 작업 | ✅ 완료 |
| F-008 | 복약 순응도 차트 | P2 | 추가 작업 | ✅ 완료 |
| F-009 | 방문 캘린더 뷰 | P2 | 추가 작업 | ✅ 완료 |

---

## 5. 검증 계획 요약

| 테스트 케이스 | 시나리오 | 담당 스프린트 | 상태 |
|---|---|---|---|
| TC-01 | 환자 신규 등록 및 복약 관리 계획 수립 | Sprint 2 | ✅ |
| TC-02 | 1차 방문 - 정상 조제 | Sprint 2 | ✅ |
| TC-03 | 정기 방문 - 복약 상태 정상 | Sprint 2 | ✅ |
| TC-04 | 이상 반응 신고 접수 | Sprint 3 | ✅ |
| TC-05 | 의약품 오염/훼손으로 교환 요청 | Sprint 3 | ✅ |
| TC-06 | 유통기한 임박 의약품 교환 | Sprint 3 | ✅ |
| TC-07 | 약물 상호작용 경고 발생 | Sprint 3 | ✅ |
| TC-08 | 대시보드 - 오늘 방문 예정 환자 조회 | Sprint 3 | ✅ |
| TC-09 | 환자 상세 - 복약 순응도 차트 조회 | 추가 작업 | ✅ |
| TC-10 | 캘린더 - 월별 방문 일정 조회 및 날짜 클릭 | 추가 작업 | ✅ |

**단위 테스트 (Vitest):** planCalculator, canDispense, interactionCheck, adherenceStatus — 21개 통과

**반응형 레이아웃:** 모바일(375px), 태블릿(768px), PC(1280px) — 전 스프린트 공통

---

## 6. 향후 과제

| 항목 | 내용 | 상태 |
|---|---|---|
| 실 DB 연동 | PostgreSQL (Supabase) + Prisma v6 ORM | ✅ 완료 |
| UI 개선 | Apple HIG 디자인 시스템 적용 | ✅ 완료 |
| 기능 추가 | 복약 순응도 차트, 방문 캘린더 뷰 | ✅ 완료 |
| 사용자 인증 | 약사/환자 로그인, JWT 기반 권한 관리 | ⬜ 미정 |
| DUR 연동 | 의약품 안전나라 DUR API 실 연동 | ⬜ 미정 |
| 푸시 알림 | Web Push API 또는 FCM 기반 실제 알림 발송 | ⬜ 미정 |
| 다중 약국 지원 | 약국별 데이터 분리, 관리자 대시보드 | ⬜ 미정 |
