import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { recruiter } = useAuth()
  if (!recruiter) return <Navigate to="/login" replace />
  return children
}
