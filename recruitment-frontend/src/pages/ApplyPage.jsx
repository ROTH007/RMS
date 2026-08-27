import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/client'
import { translations } from '../i18n/translations'
import LangToggle from '../components/LangToggle'
import TicketStub from '../components/TicketStub'

export default function ApplyPage() {
  const [searchParams] = useSearchParams()
  const source = searchParams.get('src') === 'qr' ? 'qr_code' : 'web_form'
  const [lang, setLang] = useState('en')
  const t = translations[lang]
  const telegramUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME

  const [form, setForm] = useState({
    khmer_name: '',
    english_name: '',
    id_card_number: '',
    id_card_expiration: '',
    current_address: '',
    phone: '',
    position_applied: searchParams.get('position') || '',
  })
  const [cvFile, setCvFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [newCandidateId, setNewCandidateId] = useState(null)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('submitting')
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      data.append('source', source)
      if (cvFile) data.append('cv', cvFile)
      const res = await api.post('/candidates', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setNewCandidateId(res.data.candidate_id)
      setStatus('success')
    } catch (err) {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <TicketStub
          stub={<p className="font-mono text-xs text-ink/50 uppercase tracking-widest">Gate opens soon</p>}
          className="max-w-md w-full"
        >
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🎟️</div>
            <h1 className="font-display text-2xl font-bold mb-2">{t.successTitle}</h1>
            <p className="text-ink/60">{t.successBody}</p>

            {telegramUsername && (
              <div className="mt-6 pt-6 border-t border-dashed border-ink/15">
                <p className="text-xs text-ink/50 mb-2">Want instant updates instead of waiting for a call?</p>
                <a
                  href={`https://t.me/${telegramUsername}${newCandidateId ? `?start=${newCandidateId}` : ''}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-ink text-signal text-sm font-medium px-4 py-2 rounded-full"
                >
                  Message us on Telegram
                </a>
                <p className="text-xs text-ink/40 mt-2">Tap the button — you'll be connected automatically.</p>
              </div>
            )}
          </div>
        </TicketStub>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col items-center">
      <div className="w-full max-w-lg flex justify-end mb-4">
        <LangToggle lang={lang} setLang={setLang} />
      </div>

      <TicketStub
        className="w-full max-w-lg"
        stub={
          <p className="font-mono text-xs text-ink/50 uppercase tracking-widest">
            {source === 'qr_code' ? 'Scanned via QR' : 'Online application'}
          </p>
        }
      >
        <div className="mb-6">
          <p className="font-mono text-xs text-volt uppercase tracking-widest mb-2">{t.appName}</p>
          <h1 className="font-display text-3xl font-bold leading-tight mb-2">{t.applyHeadline}</h1>
          <p className="text-ink/60">{t.applySub}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={t.khmerName}>
            <input value={form.khmer_name} onChange={(e) => update('khmer_name', e.target.value)} className="input" />
          </Field>
          <Field label={t.englishName}>
            <input
              required
              value={form.english_name}
              onChange={(e) => update('english_name', e.target.value)}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t.idCardNumber}>
              <input
                value={form.id_card_number}
                onChange={(e) => update('id_card_number', e.target.value)}
                className="input"
              />
            </Field>
            <Field label={t.idCardExpiration}>
              <input
                type="date"
                value={form.id_card_expiration}
                onChange={(e) => update('id_card_expiration', e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <Field label={t.currentAddress}>
            <textarea
              value={form.current_address}
              onChange={(e) => update('current_address', e.target.value)}
              className="input"
              rows={2}
            />
          </Field>
          <Field label={t.phone}>
            <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input" />
          </Field>
          <Field label={t.position}>
            <input
              value={form.position_applied}
              onChange={(e) => update('position_applied', e.target.value)}
              className="input"
            />
          </Field>
          <Field label={t.uploadCv}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCvFile(e.target.files[0])}
              className="block w-full text-sm text-ink/70 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-ink file:text-signal file:font-medium"
            />
          </Field>

          {status === 'error' && <p className="text-coral text-sm">{t.errorGeneric}</p>}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-signal text-ink font-display font-bold py-3 rounded-full hover:brightness-95 transition disabled:opacity-50"
          >
            {status === 'submitting' ? t.submitting : t.submit}
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