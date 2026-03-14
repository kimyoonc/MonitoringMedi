import { describe, it, expect } from 'vitest'

// 약물 상호작용 체크 로직 테스트
interface InteractionPair {
  drug1: string
  drug2: string
  severity: 'high' | 'moderate' | 'low'
  description: string
  action: string
}

const mockPairs: InteractionPair[] = [
  { drug1: '와파린', drug2: '아스피린', severity: 'high', description: '출혈 위험 증가', action: '약사 확인 필수' },
  { drug1: '암로디핀', drug2: '심바스타틴', severity: 'moderate', description: '혈중 농도 증가 가능', action: '용량 모니터링' },
]

function checkInteractions(medications: string[], pairs: InteractionPair[]) {
  return pairs.filter(pair =>
    medications.includes(pair.drug1) && medications.includes(pair.drug2)
  )
}

describe('약물 상호작용 확인', () => {
  it('상호작용 없는 의약품 조합은 빈 배열 반환', () => {
    const result = checkInteractions(['암로디핀', '메트포르민'], mockPairs)
    expect(result).toHaveLength(0)
  })

  it('와파린 + 아스피린 조합은 high 경고 반환', () => {
    const result = checkInteractions(['와파린', '아스피린'], mockPairs)
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('high')
  })

  it('암로디핀 + 심바스타틴 조합은 moderate 경고 반환', () => {
    const result = checkInteractions(['암로디핀', '심바스타틴'], mockPairs)
    expect(result).toHaveLength(1)
    expect(result[0].severity).toBe('moderate')
  })

  it('단일 의약품만 있으면 상호작용 없음', () => {
    const result = checkInteractions(['와파린'], mockPairs)
    expect(result).toHaveLength(0)
  })

  it('여러 상호작용 쌍이 동시에 포함되면 모두 반환', () => {
    const result = checkInteractions(['와파린', '아스피린', '암로디핀', '심바스타틴'], mockPairs)
    expect(result).toHaveLength(2)
  })
})
