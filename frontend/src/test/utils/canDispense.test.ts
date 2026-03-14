import { describe, it, expect } from 'vitest'

// canDispense 판단 로직 테스트
interface PlanStep {
  stepNumber: number
  visitId: string | null
  status: string
}

function canDispense(steps: PlanStep[], stepNumber: number): boolean {
  if (stepNumber === 1) return true
  const prevStep = steps.find(s => s.stepNumber === stepNumber - 1)
  return prevStep?.visitId !== null && prevStep?.visitId !== undefined
}

describe('단계별 조제 가능 여부 판단 (canDispense)', () => {
  it('1단계는 항상 조제 가능하다', () => {
    const steps: PlanStep[] = [
      { stepNumber: 1, visitId: null, status: 'scheduled' },
    ]
    expect(canDispense(steps, 1)).toBe(true)
  })

  it('이전 단계 방문 기록이 없으면 조제 불가', () => {
    const steps: PlanStep[] = [
      { stepNumber: 1, visitId: null, status: 'scheduled' },
      { stepNumber: 2, visitId: null, status: 'pending' },
    ]
    expect(canDispense(steps, 2)).toBe(false)
  })

  it('이전 단계 방문 기록이 있으면 조제 가능', () => {
    const steps: PlanStep[] = [
      { stepNumber: 1, visitId: 'V001', status: 'completed' },
      { stepNumber: 2, visitId: null, status: 'scheduled' },
    ]
    expect(canDispense(steps, 2)).toBe(true)
  })

  it('3단계는 2단계 visitId가 있어야 조제 가능', () => {
    const steps: PlanStep[] = [
      { stepNumber: 1, visitId: 'V001', status: 'completed' },
      { stepNumber: 2, visitId: 'V002', status: 'completed' },
      { stepNumber: 3, visitId: null, status: 'scheduled' },
    ]
    expect(canDispense(steps, 3)).toBe(true)
  })
})
