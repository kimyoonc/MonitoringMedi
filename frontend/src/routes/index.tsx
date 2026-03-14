import { Routes, Route } from 'react-router-dom'
import PharmacistLayout from '@/layouts/PharmacistLayout'
import PatientLayout from '@/layouts/PatientLayout'
import RoleSelectPage from '@/pages/RoleSelectPage'
import PharmacistDashboard from '@/pages/pharmacist/DashboardPage'
import PatientListPage from '@/pages/pharmacist/PatientListPage'
import PatientDetailPage from '@/pages/pharmacist/PatientDetailPage'
import PlanCreatePage from '@/pages/pharmacist/PlanCreatePage'
import VisitRecordPage from '@/pages/pharmacist/VisitRecordPage'
import PatientSchedulePage from '@/pages/patient/SchedulePage'
import PatientReportPage from '@/pages/patient/ReportPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelectPage />} />
      <Route path="/pharmacist" element={<PharmacistLayout />}>
        <Route index element={<PharmacistDashboard />} />
        <Route path="patients" element={<PatientListPage />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />
        <Route path="patients/:id/plans/new" element={<PlanCreatePage />} />
        <Route path="patients/:patientId/visits/new" element={<VisitRecordPage />} />
        <Route path="plans/new" element={<PlanCreatePage />} />
        <Route path="visits/:id" element={<VisitRecordPage />} />
      </Route>
      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<PatientSchedulePage />} />
        <Route path="report" element={<PatientReportPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
