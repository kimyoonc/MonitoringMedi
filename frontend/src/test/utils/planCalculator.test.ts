import { describe, it, expect } from 'vitest'

// 복약 관리 계획 일정 계산 로직 테스트
function calcSchedule(totalDays: number, visitCount: number) {
  const unit = Math.floor(totalDays / visitCount)
  const remainder = totalDays % visitCount
  const today = new Date('2026-03-15')
  return Array.from({ length: visitCount }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + unit * i)
    const days = i === visitCount - 1 ? unit + remainder : unit
    return {
      stepNumber: i + 1,
      date: date.toISOString().split('T')[0],
      days,
    }
  })
}

describe('복약 관리 계획 일정 계산', () => {
  it('90일 처방 3회 방문 시 30일씩 3단계로 나뉜다', () => {
    const steps = calcSchedule(90, 3)
    expect(steps).toHaveLength(3)
    expect(steps[0].days).toBe(30)
    expect(steps[1].days).toBe(30)
    expect(steps[2].days).toBe(30)
  })

  it('91일 처방 3회 방문 시 잔여 1일은 마지막 단계에 추가된다', () => {
    const steps = calcSchedule(91, 3)
    expect(steps[0].days).toBe(30)
    expect(steps[1].days).toBe(30)
    expect(steps[2].days).toBe(31)
  })

  it('60일 처방 2회 방문 시 30일씩 2단계로 나뉜다', () => {
    const steps = calcSchedule(60, 2)
    expect(steps).toHaveLength(2)
    expect(steps[0].days).toBe(30)
    expect(steps[1].days).toBe(30)
  })

  it('방문 횟수만큼 단계가 생성된다', () => {
    const steps = calcSchedule(90, 3)
    steps.forEach((step, i) => {
      expect(step.stepNumber).toBe(i + 1)
    })
  })

  it('각 방문일은 이전 방문일로부터 조제단위 일수 이후이다', () => {
    const steps = calcSchedule(90, 3)
    const date0 = new Date(steps[0].date)
    const date1 = new Date(steps[1].date)
    const diffDays = (date1.getTime() - date0.getTime()) / (1000 * 60 * 60 * 24)
    expect(diffDays).toBe(30)
  })
})
