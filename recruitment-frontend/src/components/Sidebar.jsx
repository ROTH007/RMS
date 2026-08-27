import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid, Users, QrCode, Wallet, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/candidates', label: 'Candidates', icon: Users },
  { to: '/employees', label: 'Employees', icon: Wallet },
  { to: '/qr-code', label: 'QR Code', icon: QrCode },
]

export default function Sidebar() {
  const { recruiter, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className="w-60 shrink-0 bg-ink text-white min-h-screen flex flex-col px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-signal flex items-center justify-center font-display font-bold text-ink">
          N
        </div>
        <span className="font-display font-bold text-lg">Next Stop</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                active ? 'bg-signal text-ink font-semibold' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 pt-4 mt-4">
        <p className="px-3 text-xs text-white/40 mb-2 truncate">{recruiter?.name}</p>
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-coral transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  )
}