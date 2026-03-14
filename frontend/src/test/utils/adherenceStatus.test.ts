import { describe, it, expect } from 'vitest'

// 복약 순응도 상태 판단 테스트
type Adherence = 'good' | 'fair' | 'poor'

function getAdherenceLabel(adherence: Adherence): string {
  const map = { good: '양호', fair: '보통', poor: '불량' }
  return map[adherence]
}

function getAdherenceBadgeVariant(adherence: Adherence): string {
  const map = { good: 'success', fair: 'warning', poor: 'error' }
  return map[adherence]
}

function isAdverseReactionAlert(adverseReaction: boolean, severity?: string): boolean {
  if (!adverseReaction) return false
  return severity === 'severe' || severity === 'moderate' || !severity
}

describe('복약 순응도 상태 처리', () => {
  it('good은 "양호"로 표시된다', () => {
    expect(getAdherenceLabel('good')).toBe('양호')
  })

  it('fair는 "보통"으로 표시된다', () => {
    expect(getAdherenceLabel('fair')).toBe('보통')
  })

  it('poor는 "불량"으로 표시된다', () => {
    expect(getAdherenceLabel('poor')).toBe('불량')
  })

  it('good은 success 배지를 반환한다', () => {
    expect(getAdherenceBadgeVariant('good')).toBe('success')
  })

  it('poor는 error 배지를 반환한다', () => {
    expect(getAdherenceBadgeVariant('poor')).toBe('error')
  })

  it('이상반응 없으면 알림 불필요', () => {
    expect(isAdverseReactionAlert(false)).toBe(false)
  })

  it('이상반응 있으면 알림 필요', () => {
    expect(isAdverseReactionAlert(true)).toBe(true)
  })
})
