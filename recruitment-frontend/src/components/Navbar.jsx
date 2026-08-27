import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { recruiter, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-ink text-white">
      <Link to="/dashboard" className="font-display font-bold text-lg tracking-tight">
        Next Stop
      </Link>
      {recruiter && (
        <div className="flex items-center gap-6 text-sm">
          <Link to="/dashboard" className="hover:text-signal transition-colors">
            Dashboard
          </Link>
          <Link to="/candidates" className="hover:text-signal transition-colors">
            Candidates
          </Link>
          <Link to="/qr-code" className="hover:text-signal transition-colors">
            QR Code
          </Link>
          <span className="text-white/50 hidden sm:inline">{recruiter.name}</span>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="border border-white/20 rounded-full px-3 py-1 hover:border-coral hover:text-coral transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  )
}
