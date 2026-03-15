# 장기 처방 의약품 복약 관리 시스템

약국이 장기 처방 의약품을 복용하는 환자를 대상으로 복약 기간 전반에 걸쳐 지속적인 관리 역할을 수행할 수 있도록 지원하는 반응형 웹 시스템입니다.

[![CI](https://github.com/kimyoonc/MonitoringMedi/actions/workflows/ci.yml/badge.svg)](https://github.com/kimyoonc/MonitoringMedi/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-21%20passed-brightgreen)](https://github.com/kimyoonc/MonitoringMedi/tree/main/frontend/src/test)
[![Vitest](https://img.shields.io/badge/vitest-21%2F21-brightgreen)](https://github.com/kimyoonc/MonitoringMedi/tree/main/frontend/src/test)
[![Playwright](https://img.shields.io/badge/e2e-playwright-blue)](https://github.com/kimyoonc/MonitoringMedi/tree/main/frontend/e2e)
[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://monitoringmedi.vercel.app)

---

## 배포 URL

| 환경 | URL |
|---|---|
| 프론트엔드 | https://monitoringmedi.vercel.app |
| 백엔드 API | https://monitoringmedi.onrender.com |
| 소스코드 | https://github.com/kimyoonc/MonitoringMedi |

---

## 기술 스택

| 영역 | 기술 | 상세 |
|---|---|---|
| 프론트엔드 | React 18 + TypeScript (Vite 5) | CSS Modules, React Router v6, Axios |
| 상태 관리 | **Zustand** | patientStore, dashboardStore, notificationStore |
| 백엔드 | Express.js + TypeScript | Prisma v6 ORM |
| 데이터베이스 | **PostgreSQL (Supabase)** | 영구 저장, 8개 모델 정의 |
| 단위 테스트 | **Vitest + Testing Library** | 21개 테스트 (4 파일) |
| E2E 테스트 | **Playwright** | 6개 시나리오 (Desktop + Mobile) |
| CI/CD | **GitHub Actions** | 빌드 + 단위테스트 + E2E + Prisma 검증 |
| 프론트 배포 | Vercel | GitHub 연동 자동 배포 |
| 백엔드 배포 | Render | Node.js Web Service |
| AI 워크플로우 | **Claude Code (.claude/)** | 4개 에이전트, 2개 스킬 |

---

## 핵심 기능

| 기능 | 설명 |
|---|---|
| F-001 복약 관리 계획 수립 | 처방 기간·방문 횟수 입력 → 방문 일정 자동 계산 |
| F-002 단계적 조제 관리 | 이전 방문 완료 후 다음 단계 조제 허용 (PREVIOUS_VISIT_REQUIRED 검증) |
| F-003 방문 일정 알림 | D-3/D-1 배지 표시, 읽음 처리 |
| F-004 복약 상태 기록 | 순응도·이상반응·보관상태·약사메모 저장 |
| F-005 의약품 교환 관리 | 오염/훼손/유통기한 임박 사유별 교환 신청 |
| F-006 약물 상호작용 확인 | 계획 수립 시 실시간 경고 (debounce 500ms) |
| F-007 복약 관리 대시보드 | 오늘 방문·조제 대기·이상반응 환자 3종 집계 |

---

## 프로젝트 구조

```
.
├── .claude/                    # Claude Code AI 에이전트/스킬 정의
│   ├── agents/                 # prd-to-roadmap, sprint-planner, sprint-close, code-reviewer
│   └── skills/                 # karpathy-guidelines, writing-plans
├── .github/workflows/
│   └── ci.yml                  # GitHub Actions: 빌드 + Vitest + Playwright + Prisma
├── frontend/                   # React 18 + TypeScript SPA
│   ├── src/
│   │   ├── store/              # Zustand 전역 상태 (patient, dashboard, notification)
│   │   ├── components/common/  # Header, Card, Badge, Button, Toast, Loading, EmptyState
│   │   ├── pages/pharmacist/   # 대시보드, 환자목록/상세, 계획수립, 방문기록, 교환관리
│   │   └── pages/patient/      # 방문일정, 이상반응 신고
│   ├── e2e/                    # Playwright E2E 테스트 (smoke.spec.ts)
│   └── src/test/               # Vitest 단위 테스트 (21개)
│       └── utils/              # planCalculator, canDispense, interactionCheck, adherenceStatus
├── backend/                    # Express.js + TypeScript
│   ├── prisma/
│   │   ├── schema.prisma       # 8개 모델 (Patient, Plan, PlanStep, Visit, Exchange, ...)
│   │   └── seed.ts             # fixtures → PostgreSQL 초기 데이터
│   └── src/
│       ├── lib/prisma.ts       # PrismaClient 싱글톤
│       └── routes/             # 7개 도메인 라우터 (Prisma 쿼리)
└── docs/
    ├── PRD.md                  # 제품 요구사항 문서 v2.1
    ├── ROADMAP.md              # 프로젝트 로드맵 v2.1
    └── sprint/                 # sprint1~3 계획 + 완료 검증 기록
        └── sprint{N}/deploy.md # API 검증, 테스트 결과, CI 결과
```

---

## 로컬 실행

### 사전 요구사항
- Node.js 20+
- PostgreSQL (또는 Supabase 계정)

### 환경 변수 설정
```bash
# backend/.env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### 실행

```bash
# 루트에서 프론트엔드 + 백엔드 동시 실행
npm run dev

# 프론트엔드만 (http://localhost:5173)
cd frontend && npm run dev

# 백엔드만 (http://localhost:3000)
cd backend && npm run dev
```

### DB 초기화

```bash
cd backend
npx prisma db push      # 스키마 적용
npm run db:seed         # 초기 데이터 삽입
```

---

## 테스트

### 단위 테스트 (Vitest) — 21/21

```bash
cd frontend && npm run test -- --run
```

```
✓ planCalculator.test.ts    5 tests  3ms
✓ canDispense.test.ts       4 tests  2ms
✓ interactionCheck.test.ts  5 tests  4ms
✓ adherenceStatus.test.ts   7 tests  2ms

Test Files: 4 passed (4)
Tests:      21 passed (21)
Duration:   1.86s
```

### E2E 테스트 (Playwright)

```bash
cd frontend && npm run e2e
```

테스트 시나리오:
- 역할 선택 화면 렌더링
- 약사 대시보드 / 환자 목록 / 계획 수립 페이지 접근
- 반응형 레이아웃 (모바일 375px, PC 1280px)

---

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`):

| 단계 | 내용 |
|---|---|
| 단위 테스트 | Vitest 21개 (`--reporter=verbose`) |
| E2E 테스트 | Playwright Chromium + Mobile |
| 프론트 빌드 | `vite build` |
| 백엔드 빌드 | `tsc` TypeScript 컴파일 |
| Prisma 검증 | `prisma generate` 클라이언트 생성 |

---

## AI 워크플로우 (.claude/)

본 프로젝트는 Claude Code 에이전트/스킬로 개발되었습니다:

| 에이전트/스킬 | 역할 |
|---|---|
| `prd-to-roadmap` | PRD.md → ROADMAP.md 자동 생성 |
| `sprint-planner` | ROADMAP 기반 스프린트 계획 수립 |
| `sprint-close` | PR 생성 + Playwright 검증 + 보고서 저장 |
| `code-reviewer` | Critical/Important/Suggestion 분류 리뷰 |
| `karpathy-guidelines` | 구현 품질 가이드라인 |
| `writing-plans` | 세부 구현 계획 수립 |

---

## 문서

- [PRD.md](docs/PRD.md) — 제품 요구사항 정의서 v2.1
- [ROADMAP.md](docs/ROADMAP.md) — 스프린트 로드맵 v2.1
- [CLAUDE.md](CLAUDE.md) — Claude Code 설정 및 개발 가이드
- [Sprint 1 완료 보고서](docs/sprint/sprint1/deploy.md)
- [Sprint 2 완료 보고서](docs/sprint/sprint2/deploy.md)
- [Sprint 3 완료 보고서](docs/sprint/sprint3/deploy.md)
- [Playwright 검증 보고서](docs/sprint/sprint3/playwright-report.md)
