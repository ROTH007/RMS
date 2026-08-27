import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/client'
import TicketStub from '../components/TicketStub'

export default function OnboardingPage() {
  const [searchParams] = useSearchParams()
  const candidateId = searchParams.get('candidate')

  const [form, setForm] = useState({
    full_legal_name: '',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    bank_name: '',
    bank_account_number: '',
    start_date_preference: '',
    notes: '',
  })
  const [status, setStatus] = useState('idle')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!candidateId) {
      setStatus('error')
      return
    }
    setStatus('submitting')
    try {
      await api.post('/onboarding', { candidate_id: candidateId, ...form })
      setStatus('success')
    } catch (err) {
      setStatus('error')
    }
  }

  if (!candidateId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <TicketStub className="max-w-md w-full">
          <p className="text-ink/60 text-center py-6">
            This link is missing some information. Please use the link your recruiter sent you.
          </p>
        </TicketStub>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <TicketStub className="max-w-md w-full">
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="font-display text-2xl font-bold mb-2">You're all set!</h1>
            <p className="text-ink/60">We've got what we need for your orientation. See you soon.</p>
          </div>
        </TicketStub>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col items-center">
      <TicketStub className="w-full max-w-lg">
        <div className="mb-6">
          <p className="font-mono text-xs text-volt uppercase tracking-widest mb-2">Almost there</p>
          <h1 className="font-display text-3xl font-bold leading-tight mb-2">Orientation details</h1>
          <p className="text-ink/60">A few last things before your first day.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full Legal Name">
            <input
              required
              value={form.full_legal_name}
              onChange={(e) => update('full_legal_name', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Date of Birth">
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => update('date_of_birth', e.target.value)}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Emergency Contact Name">
              <input
                value={form.emergency_contact_name}
                onChange={(e) => update('emergency_contact_name', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Emergency Contact Phone">
              <input
                value={form.emergency_contact_phone}
                onChange={(e) => update('emergency_contact_phone', e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bank Name">
              <input value={form.bank_name} onChange={(e) => update('bank_name', e.target.value)} className="input" />
            </Field>
            <Field label="Bank Account Number">
              <input
                value={form.bank_account_number}
                onChange={(e) => update('bank_account_number', e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <Field label="Preferred Start Date">
            <input
              type="date"
              value={form.start_date_preference}
              onChange={(e) => update('start_date_preference', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Anything else we should know?">
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="input" rows={2} />
          </Field>

          {status === 'error' && <p className="text-coral text-sm">Something went wrong. Please try again.</p>}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-signal text-ink font-display font-bold py-3 rounded-full hover:brightness-95 transition disabled:opacity-50"
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </TicketStub>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink/50 mb-1 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}