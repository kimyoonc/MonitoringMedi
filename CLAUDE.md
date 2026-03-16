# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요

**장기 처방 의약품 복약 관리 시스템** — 약국이 장기 처방 의약품을 복용하는 환자를 대상으로 복약 기간 전반에 걸쳐 지속적인 관리 역할을 수행할 수 있도록 지원하는 시스템입니다.

- 핵심 사용자: **약사** (관리/조제), **환자** (일정 확인/이상 반응 신고)
- 플랫폼: 반응형 웹 (모바일 375px ~ PC 1280px)
- 백엔드: Express.js + TypeScript, Prisma v6 ORM, PostgreSQL (Supabase)
- 상세 요구사항: `PRD.md` 참고

## 저장소 구조

```
.claude/
  agents/          # Claude Code 서브 에이전트 정의
  skills/          # Claude Code 스킬 정의
frontend/          # React + TypeScript SPA (Vite)
  src/
    api/           # Axios 클라이언트
    components/
      common/      # 공통 컴포넌트 (Header, Card, Badge, Button 등)
      pharmacist/  # 약사 전용 컴포넌트 (InteractionWarning 등)
    layouts/       # PharmacistLayout, PatientLayout
    pages/
      pharmacist/  # 대시보드, 환자 목록/상세, 계획 수립, 방문 기록, 교환 관리
      patient/     # 방문 일정, 이상 반응 신고
    routes/        # React Router v6 라우팅 설정
    styles/        # globals.css (CSS 변수, 브레이크포인트)
    types/         # 공통 TypeScript 타입 정의
backend/           # Express.js + TypeScript API 서버 (Prisma + PostgreSQL)
  prisma/
    schema.prisma  # Prisma 스키마 (8개 모델)
    seed.ts        # fixtures → DB 초기 데이터 삽입
  src/
    fixtures/      # 시나리오별 초기 데이터 JSON (seed 용도)
    lib/           # Prisma Client 싱글톤
    routes/        # patients, plans, visits, exchanges, interactions, dashboard, notifications
docs/
  PRD.md           # 제품 요구사항 문서 (v2.0)
  ROADMAP.md       # 프로젝트 로드맵
  sprint/          # 스프린트 문서 및 검증 보고서
    sprint{N}.md
    sprint{N}/     # 스크린샷, Playwright 보고서, deploy.md
CLAUDE.md          # Claude Code 설정 파일
```

## 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 플랫폼 | 반응형 웹 | 모바일(375px~) / 태블릿(768px) / PC(1280px) |
| 프론트엔드 | React 18 + TypeScript (Vite 5) | CSS Modules, React Router v6, Axios |
| 백엔드 | Express.js + TypeScript | Prisma v6 ORM, tsx watch |
| 데이터베이스 | PostgreSQL (Supabase) | Prisma 스키마 8개 모델, seed 초기화 |
| 프론트 배포 | Vercel | https://monitoringmedi.vercel.app |
| 백엔드 배포 | Render | https://monitoringmedi.onrender.com |
| 소스코드 | GitHub | https://github.com/kimyoonc/MonitoringMedi |

## 핵심 기능 (PRD 요약)

| 기능 ID | 기능명 | 우선순위 | 상태 |
|---|---|---|---|
| F-001 | 복약 관리 계획 수립 (방문 일정 자동 계산) | P0 | ✅ 완료 |
| F-002 | 단계적 조제 관리 | P0 | ✅ 완료 |
| F-003 | 환자 방문 일정 알림 (D-3, D-1) | P1 | ✅ 완료 |
| F-004 | 복약 상태 기록 | P0 | ✅ 완료 |
| F-005 | 의약품 교환/보충 관리 | P1 | ✅ 완료 |
| F-006 | 약물 상호작용 확인 | P1 | ✅ 완료 |
| F-007 | 복약 관리 현황 대시보드 | P1 | ✅ 완료 |

## 에이전트 파일 형식 (`.claude/agents/*.md`)

각 에이전트 파일은 YAML frontmatter로 시작합니다:

```yaml
---
name: agent-name
description: 에이전트 설명
model: inherit | opus | sonnet | haiku
color: red | blue | green | ...
memory: project   # 프로젝트 메모리 자동 주입
---
```

**중요:** 에이전트 파일에 절대 경로(`/Users/...`)를 하드코딩하지 않습니다. `memory: project`가 런타임에 올바른 경로를 자동 주입합니다.

## 스킬 파일 형식 (`.claude/skills/<name>/SKILL.md`)

```yaml
---
name: skill-name
description: 스킬 설명
---
```

## 스프린트 워크플로우

1. **prd-to-roadmap** 에이전트: `docs/PRD.md` → `docs/ROADMAP.md` 생성
2. **sprint-planner** 에이전트: ROADMAP 기반으로 `docs/sprint/sprint{N}.md` 생성
3. 구현 (writing-plans 스킬로 세부 계획 수립 → 실행)
4. **sprint-close** 에이전트: ROADMAP 업데이트 → PR 생성 → 코드 리뷰 → Playwright 검증 → 검증 보고서 저장

## 핵심 에이전트 역할

| 에이전트 | 역할 | 주요 입력 | 주요 출력 |
|----------|------|-----------|-----------|
| `prd-to-roadmap` | PRD → 로드맵 변환 | `docs/PRD.md` | `docs/ROADMAP.md` |
| `sprint-planner` | 스프린트 계획 수립 | `ROADMAP.md` | `docs/sprint/sprint{N}.md` |
| `sprint-close` | 스프린트 마무리 | 현재 브랜치 | PR, 검증 보고서 |
| `code-reviewer` | 코드 리뷰 | 구현 완료 단계 | 이슈 분류 보고 (Critical/Important/Suggestion) |

## Playwright MCP 검증

`sprint-close` 및 `prd-to-roadmap` 에이전트는 Playwright MCP 도구(`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_console_messages`, `browser_network_requests` 등)를 사용하여 `npm run dev` 실행 상태에서 UI를 직접 검증합니다. 검증 결과는 `docs/sprint/sprint{N}/playwright-report.md`에 저장합니다.

**이 프로젝트의 주요 검증 시나리오:**
- TC-01: 환자 신규 등록 및 복약 관리 계획 수립
- TC-02~03: 정기 방문 및 단계별 조제
- TC-04: 이상 반응 신고 접수
- TC-05~06: 의약품 교환 요청 (오염/훼손/유통기한)
- TC-07: 약물 상호작용 경고
- TC-08: 대시보드 환자 현황 조회
- 반응형 레이아웃: 모바일(375px), 태블릿(768px), PC(1280px)

## 언어 및 커뮤니케이션 규칙

- 기본 응답 언어: 한국어
- 코드 주석: 한국어로 작성
- 커밋 메시지: 한국어로 작성
- 문서화: 한국어로 작성
- 변수명/함수명: 영어 (코드 표준 준수)

## 날짜/시간 처리 규칙

- **기준 타임존: KST (UTC+9)** — 날짜 계산은 항상 한국 시간 기준으로 처리한다.
- 백엔드에서 "오늘 날짜"를 구할 때는 `new Date().toISOString()`(UTC) 대신 아래 방식을 사용한다:
  ```typescript
  const kstToday = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
  ```
- 날짜를 DB에 저장할 때도 KST 기준 `YYYY-MM-DD` 문자열로 저장한다.
- 프론트엔드에서 기본 날짜 값을 설정할 때도 동일한 방식으로 KST 기준 오늘 날짜를 사용한다.

## 개발시 유의해야할 사항

- sprint 관련 문서 구조:
  - 스프린트 계획/완료 문서: `docs/sprint/sprint{n}.md`
  - 스프린트 첨부 파일 (스크린샷, 보고서 등): `docs/sprint/sprint{n}/`
- sprint 개발이 plan 모드로 진행될 때는 다음을 꼭 준수합니다.
  - karpathy-guidelines skill을 준수하세요.
  - sprint 가 새로 시작될 때는 새로 branch를 sprint{n} 이름으로 생성하고 해당 브랜치에서 작업해주세요. (worktree 사용하지 말아주세요)
  - 다음과 같이 agent를 활용합니다.
    1. sprint-planner agent가 계획 수립 작업을 수행하도록 해주세요.
    2. 구현/검증 단계에서는 각 task의 내용에 따라 적절한 agent가 있는지 확인 한 후 적극 활용해주세요.
    3. 스프린트 구현이 완료되면 sprint-close agent를 사용하여 마무리 작업(ROADMAP 업데이트, PR 생성, 코드 리뷰, 자동 검증)을 수행해주세요.

- 스프린트 검증 원칙 — **자동화 가능한 항목은 sprint-close 시점에 직접 실행**:
  - ✅ **자동 실행**: Mock API 응답 검증 (curl/fetch) — 서버 실행 중이면 sprint-close agent가 직접 실행
  - ✅ **자동 실행**: Playwright MCP로 주요 시나리오(TC-01~TC-08) UI 검증
  - ✅ **자동 실행**: 반응형 레이아웃 스냅샷 — 375px/768px/1280px 기준
  - ❌ **수동 필요**: `npm run dev` 서버 기동 — 새 코드 반영을 위한 재시작 (타이밍을 사용자가 결정)
  - ❌ **수동 필요**: 브라우저 실제 사용성 확인 (터치 이벤트, 스크롤 동작 등)
  - sprint-close agent는 자동 실행 항목을 실행하고 결과를 deploy.md에 기록해야 합니다.
  - deploy.md에는 "자동 검증 완료" 항목과 "수동 검증 필요" 항목을 명확히 구분하여 기재합니다.

- 사용자가 직접 수행해야 하는 작업은 deploy.md 파일을 생성하거나 기존에 존재하는 deploy.md에 수행해야하는 작업을 자세히 정리해주세요.
- 체크리스트 작성 형식:
  - 완료 항목: `- ✅ 항목 내용`
  - 미완료 항목: `- ⬜ 항목 내용`
  - GFM `[x]`/`[ ]` 대신 이모지를 사용하여 마크다운 미리보기에서 시각적 구분을 보장합니다.
