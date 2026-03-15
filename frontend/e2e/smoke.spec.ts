import { test, expect } from '@playwright/test'

test.describe('역할 선택 화면', () => {
  test('홈 화면이 로드되고 역할 선택 버튼이 표시된다', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/복약 관리/)
    await expect(page.getByRole('button', { name: /약사/ })).toBeVisible()
    // 환자 버튼: 약사 버튼 텍스트에도 '환자'가 포함되므로 고유 텍스트로 구분
    await expect(page.getByRole('button', { name: /일정 확인/ })).toBeVisible()
  })
})

test.describe('약사 화면', () => {
  test('약사 대시보드로 진입할 수 있다', async ({ page }) => {
    await page.goto('/pharmacist')
    // h1 제목으로 한정 (SideNav/BottomNav에도 '대시보드' 텍스트 존재)
    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible()
  })

  test('환자 목록 페이지가 표시된다', async ({ page }) => {
    await page.goto('/pharmacist/patients')
    // 로딩 완료 대기
    await page.waitForSelector('[data-testid="patient-list"], .card, h1, h2', { timeout: 10000 })
    await expect(page).toHaveURL(/pharmacist\/patients/)
  })

  test('복약 관리 계획 수립 페이지에 접근 가능하다', async ({ page }) => {
    await page.goto('/pharmacist/plans/new')
    await expect(page.locator('text=복약 관리 계획')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('반응형 레이아웃', () => {
  test('모바일(375px)에서 홈 화면이 정상 렌더링된다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await expect(page.getByRole('button', { name: /환자 관리 및 조제/ })).toBeVisible()
  })

  test('PC(1280px)에서 대시보드가 정상 렌더링된다', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/pharmacist')
    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible()
  })
})
