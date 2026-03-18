---
name: commit
description: 변경된 파일을 분석하여 커밋 메시지를 자동 작성하고 커밋한다. 타입(feat/fix/docs/ux/perf/test/refactor), 범위, 설명을 포함한다.
---

# Commit 스킬

## 실행 절차

1. `git status`와 `git diff`로 변경 내용 파악
2. `git log --oneline -5`로 기존 커밋 메시지 스타일 확인
3. 변경 타입 분류:
   - `feat` — 새 기능 추가
   - `fix` — 버그 수정
   - `ux` — UI/UX 개선
   - `perf` — 성능 개선
   - `test` — 테스트 추가/수정
   - `refactor` — 리팩터링 (기능 변화 없음)
   - `docs` — 문서 수정
   - `chore` — 빌드 설정, 의존성 등
4. 커밋 메시지 작성 후 커밋 실행

## 커밋 메시지 형식

```
<타입>: <한국어로 간결한 설명>

[선택] 상세 내용 (변경 이유, 영향 범위 등)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## 규칙

- 제목은 50자 이내, 마침표 없음
- `.md` 파일만 변경된 경우 빌드 실행 불필요 — 바로 커밋
- 소스 코드 변경이 포함된 경우 `npm run build` 성공 확인 후 커밋
- 민감 정보(.env, credentials)가 포함된 파일은 커밋하지 않음
