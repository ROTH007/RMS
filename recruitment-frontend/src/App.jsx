import { Routes, Route, Navigate } from 'react-router-dom'
import ApplyPage from './pages/ApplyPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CandidatesPage from './pages/CandidatesPage'
import EmployeesPage from './pages/EmployeesPage'
import QRCodePage from './pages/QRCodePage'
import OnboardingPage from './pages/OnboardingPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ApplyPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates"
        element={
          <ProtectedRoute>
            <CandidatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <EmployeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/qr-code"
        element={
          <ProtectedRoute>
            <QRCodePage />
          </ProtectedRoute>
        }
      />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}