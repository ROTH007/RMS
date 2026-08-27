import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import AppShell from '../components/AppShell'

const COLORS = { ink: '#14161F', signal: '#C6FF3D', volt: '#5B3DF5', coral: '#FF5C72', muted: '#B9BBC6' }
const PIE_COLORS = [COLORS.volt, COLORS.signal, COLORS.coral, COLORS.muted]

const STATUS_LABEL = {
  submitted: 'Submitted',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Set',
  interviewed: 'Interviewed',
  passed: 'Passed',
  hired: 'Hired',
  rejected: 'Rejected',
}

const STATUS_COLOR = {
  submitted: 'bg-ink/5 text-ink/60',
  shortlisted: 'bg-volt/10 text-volt',
  interview_scheduled: 'bg-signal/20 text-ink',
  interviewed: 'bg-signal/20 text-ink',
  passed: 'bg-emerald-500/10 text-emerald-600',
  hired: 'bg-emerald-500/15 text-emerald-700',
  rejected: 'bg-coral/10 text-coral',
}

function pctChange(curr, prev) {
  if (!prev) return null
  return Math.round(((curr - prev) / prev) * 100)
}

function initials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || '?'
  )
}

export default function DashboardPage() {
  const { recruiter } = useAuth()
  const [stats, setStats] = useState([])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/stats/monthly'), api.get('/candidates')])
      .then(([statsRes, candidatesRes]) => {
        setStats(statsRes.data)
        setCandidates(candidatesRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const latest = stats[0]
  const prev = stats[1]

  const trendData = useMemo(
    () =>
      [...stats].reverse().map((s) => ({
        month: new Date(s.month).toLocaleDateString('en-US', { month: 'short' }),
        submitted: Number(s.submitted),
        hired: Number(s.hired),
      })),
    [stats]
  )

  const positionData = useMemo(() => {
    const counts = {}
    candidates.forEach((c) => {
      const key = c.position_applied || 'Unspecified'
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, value]) => ({ name, value }))
  }, [candidates])

  const statusData = useMemo(() => {
    const order = ['submitted', 'shortlisted', 'interview_scheduled', 'interviewed', 'passed', 'hired', 'rejected']
    const counts = {}
    candidates.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1
    })
    return order
      .filter((key) => counts[key])
      .map((key) => ({ name: STATUS_LABEL[key], value: counts[key], key }))
  }, [candidates])

  const upcomingInterviews = candidates.filter((c) => c.status === 'interview_scheduled').slice(0, 5)
  const recentCandidates = candidates.slice(0, 6)

  return (
    <AppShell>
      <div className="px-8 py-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs text-volt uppercase tracking-widest mb-1">This month</p>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          </div>
          <div className="text-right">
            <p className="font-semibold">{recruiter?.name}</p>
            <p className="text-xs text-ink/40">Recruiter</p>
          </div>
        </div>

        {loading && <p className="text-ink/50">Loading…</p>}

        {!loading && !latest && (
          <div className="bg-white rounded-2xl p-10 text-center text-ink/50">
            No applications yet. Once candidates apply, your dashboard fills in here.
          </div>
        )}

        {latest && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  label="Applicant"
                  value={latest.submitted}
                  change={pctChange(latest.submitted, prev?.submitted)}
                  data={trendData}
                  dataKey="submitted"
                  color={COLORS.volt}
                />
                <StatCard
                  label="Interviewed"
                  value={latest.interviewed}
                  change={pctChange(latest.interviewed, prev?.interviewed)}
                  data={trendData}
                  dataKey="hired"
                  color={COLORS.signal}
                />
                <StatCard
                  label="Hired"
                  value={latest.hired}
                  change={pctChange(latest.hired, prev?.hired)}
                  data={trendData}
                  dataKey="hired"
                  color={COLORS.coral}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5">
                  <p className="font-display font-bold mb-1">Open positions</p>
                  <p className="text-xs text-ink/40 mb-4">By role, all time</p>
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-28 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={positionData} dataKey="value" innerRadius={32} outerRadius={54} paddingAngle={3}>
                            {positionData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1 min-w-0">
                      {positionData.map((p, i) => (
                        <div key={p.name} className="flex items-center gap-2 text-xs">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-ink/60 truncate">{p.name}</span>
                          <span className="text-ink/40 ml-auto">{p.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5">
                  <p className="font-display font-bold mb-1">Overview</p>
                  <p className="text-xs text-ink/40 mb-4">Submissions by month</p>
                  <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9294A3' }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="submitted" stroke={COLORS.volt} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5">
                <p className="font-display font-bold mb-1">Candidate pipeline</p>
                <p className="text-xs text-ink/40 mb-4">Where everyone stands right now</p>
                <div style={{ height: statusData.length * 40 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData} layout="vertical" margin={{ left: 0, right: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        tick={{ fontSize: 11, fill: '#14161F' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
                        {statusData.map((entry) => (
                          <Cell
                            key={entry.key}
                            fill={entry.key === 'hired' ? COLORS.signal : entry.key === 'rejected' ? COLORS.coral : COLORS.volt}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-display font-bold">Recent candidates</p>
                  <Link to="/candidates" className="text-xs text-volt font-medium hover:underline">
                    See all
                  </Link>
                </div>
                <div className="space-y-1">
                  {recentCandidates.map((c) => {
                    const name = c.english_name || c.khmer_name || 'Unnamed'
                    return (
                      <div
                        key={c.application_id}
                        className="flex items-center gap-3 py-2 border-b border-ink/5 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-xs font-display font-bold shrink-0">
                          {initials(name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{name}</p>
                          <p className="text-xs text-ink/40 truncate">{c.position_applied || 'No position specified'}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_COLOR[c.status]}`}>
                          {STATUS_LABEL[c.status]}
                        </span>
                      </div>
                    )
                  })}
                  {recentCandidates.length === 0 && <p className="text-sm text-ink/40">No candidates yet.</p>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-ink text-white rounded-2xl p-5">
                <p className="font-display font-bold mb-1">Upcoming interviews</p>
                <p className="text-xs text-white/40 mb-4">Candidates marked "Interview Set"</p>
                <div className="space-y-3">
                  {upcomingInterviews.map((c) => {
                    const name = c.english_name || c.khmer_name || 'Unnamed'
                    return (
                      <div key={c.application_id} className="bg-white/5 rounded-xl p-3">
                        <p className="text-sm font-semibold">{name}</p>
                        <p className="text-xs text-white/50">{c.position_applied || 'No position specified'}</p>
                      </div>
                    )
                  })}
                  {upcomingInterviews.length === 0 && <p className="text-sm text-white/40">None scheduled yet.</p>}
                </div>
              </div>

              <ActionCard
                to="/candidates"
                title="Screen candidates"
                body="Review applications, move people through stages."
              />
              <ActionCard to="/qr-code" title="Print a QR code" body="Generate an intake code for a store or position." />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function StatCard({ label, value, change, data, dataKey, color }) {
  return (
    <div className="bg-white rounded-2xl p-5">
      <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-2">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="font-display text-3xl font-bold">{value}</p>
          {change !== null && (
            <p className={`text-xs font-medium mt-1 ${change >= 0 ? 'text-emerald-600' : 'text-coral'}`}>
              {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% last month
            </p>
          )}
        </div>
        <div className="w-16 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function ActionCard({ to, title, body }) {
  return (
    <Link to={to} className="block bg-white rounded-2xl p-5 hover:bg-ink hover:text-white transition-colors group">
      <p className="font-display font-bold mb-1">{title}</p>
      <p className="text-sm text-ink/50 group-hover:text-white/60">{body}</p>
    </Link>
  )
}