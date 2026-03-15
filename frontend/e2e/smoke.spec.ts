import { test, expect } from '@playwright/test'

test.describe('역할 선택 화면', () => {
  test('홈 화면이 로드되고 역할 선택 버튼이 표시된다', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/복약 관리/)
    await expect(page.getByRole('button', { name: /약사/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /환자/ })).toBeVisible()
  })
})

test.describe('약사 화면', () => {
  test('약사 대시보드로 진입할 수 있다', async ({ page }) => {
    await page.goto('/pharmacist')
    await expect(page.locator('text=대시보드')).toBeVisible()
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
    await expect(page.getByRole('button', { name: /약사/ })).toBeVisible()
  })

  test('PC(1280px)에서 대시보드가 정상 렌더링된다', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/pharmacist')
    await expect(page.locator('text=대시보드')).toBeVisible()
  })
})
