/**
 * 서버 재시작 시 초기화되는 인메모리 데이터 저장소
 * 각 라우터에서 공유 데이터에 접근할 때 이 모듈을 사용합니다.
 */
import visitsFixture from '../fixtures/visits.json';
import plansFixture from '../fixtures/plans.json';

// 방문 기록 인메모리 데이터
export const visitsStore: any[] = [...visitsFixture];

// 복약 관리 계획 인메모리 데이터
export const plansStore: any[] = [...plansFixture];

/**
 * 계획의 특정 단계에 visitId를 기록하고 상태를 completed로 변경
 */
export function updatePlanStep(planId: string, stepNumber: number, visitId: string) {
  const plan = plansStore.find(p => p.id === planId);
  if (plan) {
    const step = plan.steps.find((s: any) => s.stepNumber === stepNumber);
    if (step) {
      step.visitId = visitId;
      step.status = 'completed';
    }
  }
}
