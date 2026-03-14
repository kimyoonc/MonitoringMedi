import { Router } from 'express';
import dashboardFixture from '../fixtures/dashboard.json';
import { plansStore, visitsStore } from '../store';

const router = Router();

// 대시보드 현황 조회
router.get('/', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // store에서 동적으로 집계 시도
    if (plansStore.length > 0) {
      // 오늘 방문 예정: scheduled 상태이면서 scheduledDate가 오늘인 step
      let todayVisits = 0;
      let pendingDispense = 0;

      plansStore.forEach(plan => {
        plan.steps?.forEach((step: any) => {
          if (step.scheduledDate === today && step.status === 'scheduled') {
            todayVisits++;
          }
          if (step.status === 'scheduled') {
            pendingDispense++;
          }
        });
      });

      // 이상반응 환자 수
      const adverseReactions = visitsStore.filter(v => v.adverseReaction === true).length;

      // fixtures 기반 환자 목록 데이터는 유지하면서 집계 수치만 동적 반영
      const responseData = {
        ...dashboardFixture,
        date: today,
        generatedAt: new Date().toISOString(),
        summary: {
          todayVisits: todayVisits || dashboardFixture.summary.todayVisits,
          pendingDispense: pendingDispense || dashboardFixture.summary.pendingDispense,
          adverseReactions: adverseReactions || dashboardFixture.summary.adverseReactions,
        },
      };

      return res.json({ success: true, data: responseData });
    }
  } catch {
    // store 집계 실패 시 fixtures fallback
  }

  // fixtures 고정 응답 fallback
  res.json({
    success: true,
    data: {
      ...dashboardFixture,
      generatedAt: new Date().toISOString(),
    },
  });
});

export default router;
