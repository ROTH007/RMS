import { useEffect, useState } from 'react'
import api from '../api/client'
import AppShell from '../components/AppShell'

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

function formatMoney(v) {
  if (v === null || v === undefined || v === '') return '—'
  return `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [payments, setPayments] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ position: '', salary: '' })
  const [paymentForm, setPaymentForm] = useState({ amount: '', pay_period: '' })

  async function load() {
    setLoading(true)
    const { data } = await api.get('/employees', { params: { status: statusFilter || undefined } })
    setEmployees(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  async function toggleExpand(id) {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    const { data } = await api.get(`/employees/${id}`)
    setPayments((p) => ({ ...p, [id]: data.payments }))
  }

  function startEdit(emp) {
    setEditingId(emp.id)
    setEditForm({ position: emp.position || '', salary: emp.salary ?? '' })
  }

  async function saveEdit(id) {
    await api.patch(`/employees/${id}`, {
      position: editForm.position,
      salary: editForm.salary === '' ? null : Number(editForm.salary),
    })
    setEditingId(null)
    load()
  }

  async function removeEmployee(id, name) {
    if (!window.confirm(`Remove ${name} from employees? This can't be undone.`)) return
    await api.delete(`/employees/${id}`)
    load()
  }

  async function toggleActive(emp) {
    await api.patch(`/employees/${emp.id}`, {
      employment_status: emp.employment_status === 'active' ? 'terminated' : 'active',
    })
    load()
  }

  async function recordPayment(id) {
    if (!paymentForm.amount) return
    await api.post(`/employees/${id}/payments`, {
      amount: Number(paymentForm.amount),
      pay_period: paymentForm.pay_period || undefined,
    })
    setPaymentForm({ amount: '', pay_period: '' })
    const { data } = await api.get(`/employees/${id}`)
    setPayments((p) => ({ ...p, [id]: data.payments }))
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold">Employees</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>

        {loading && <p className="text-ink/50">Loading…</p>}

        {!loading && employees.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-ink/50">
            No employees yet — mark a candidate as "Hired" on the Candidates page to add one here.
          </div>
        )}

        <div className="space-y-4">
          {employees.map((emp) => {
            const name = emp.english_name || emp.khmer_name || 'Unnamed'
            const isEditing = editingId === emp.id
            const isExpanded = expandedId === emp.id
            return (
              <div key={emp.id} className="bg-white rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-signal/20 flex items-center justify-center font-display font-bold text-sm shrink-0">
                      {initials(name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{name}</p>
                      <p className="text-xs text-ink/50 truncate">
                        {emp.position || 'No position set'} · Hired{' '}
                        {emp.hire_date ? new Date(emp.hire_date).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-mono uppercase tracking-wide ${
                        emp.employment_status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-coral/10 text-coral'
                      }`}
                    >
                      {emp.employment_status}
                    </span>
                    <span className="font-display font-bold">{formatMoney(emp.salary)}</span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-4 flex flex-wrap items-end gap-3 bg-paper rounded-xl p-4">
                    <label className="text-xs">
                      <span className="block text-ink/50 mb-1">Position</span>
                      <input
                        value={editForm.position}
                        onChange={(e) => setEditForm((f) => ({ ...f, position: e.target.value }))}
                        className="input"
                      />
                    </label>
                    <label className="text-xs">
                      <span className="block text-ink/50 mb-1">Monthly salary</span>
                      <input
                        type="number"
                        value={editForm.salary}
                        onChange={(e) => setEditForm((f) => ({ ...f, salary: e.target.value }))}
                        className="input"
                      />
                    </label>
                    <button
                      onClick={() => saveEdit(emp.id)}
                      className="bg-ink text-signal px-4 py-2 rounded-full text-sm font-medium"
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-sm text-ink/50 px-2">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => startEdit(emp)}
                      className="text-xs border border-ink/15 rounded-full px-3 py-1.5 hover:bg-ink/5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(emp)}
                      className="text-xs border border-ink/15 rounded-full px-3 py-1.5 hover:bg-ink/5"
                    >
                      Mark {emp.employment_status === 'active' ? 'terminated' : 'active'}
                    </button>
                    <button
                      onClick={() => toggleExpand(emp.id)}
                      className="text-xs border border-ink/15 rounded-full px-3 py-1.5 hover:bg-ink/5"
                    >
                      {isExpanded ? 'Hide payments' : 'Salary payments'}
                    </button>
                    <button
                      onClick={() => removeEmployee(emp.id, name)}
                      className="text-xs border border-coral/30 text-coral rounded-full px-3 py-1.5 hover:bg-coral/5 ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-4 border-t border-ink/10 pt-4">
                    <div className="space-y-1 mb-3">
                      {(payments[emp.id] || []).map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-sm">
                          <span className="text-ink/60">
                            {p.pay_period || new Date(p.paid_at).toLocaleDateString()}
                          </span>
                          <span className="font-mono">{formatMoney(p.amount)}</span>
                        </div>
                      ))}
                      {(payments[emp.id] || []).length === 0 && (
                        <p className="text-sm text-ink/40">No payments recorded yet.</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <label className="text-xs">
                        <span className="block text-ink/50 mb-1">Amount</span>
                        <input
                          type="number"
                          placeholder={emp.salary || '0.00'}
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                          className="input"
                        />
                      </label>
                      <label className="text-xs">
                        <span className="block text-ink/50 mb-1">Period (optional)</span>
                        <input
                          placeholder="e.g. Aug 2026"
                          value={paymentForm.pay_period}
                          onChange={(e) => setPaymentForm((f) => ({ ...f, pay_period: e.target.value }))}
                          className="input"
                        />
                      </label>
                      <button
                        onClick={() => recordPayment(emp.id)}
                        className="bg-signal text-ink px-4 py-2 rounded-full text-sm font-bold"
                      >
                        Record payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}