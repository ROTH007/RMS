import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import AppShell from '../components/AppShell'

const STAGES = [
  { key: 'submitted', label: 'Submitted', note: 'Awaiting screening' },
  { key: 'shortlisted', label: 'Shortlisted', note: 'Ready to schedule interview' },
  { key: 'interview_scheduled', label: 'Interview Set', note: 'Interview booked' },
  { key: 'interviewed', label: 'Interviewed', note: 'Awaiting decision' },
  { key: 'passed', label: 'Passed', note: 'Ready for orientation' },
  { key: 'hired', label: 'Hired', note: 'Employee onboarded' },
  { key: 'rejected', label: 'Rejected', note: 'Not moving forward' },
]

const STAGE_ORDER = ['submitted', 'shortlisted', 'interview_scheduled', 'interviewed', 'passed', 'hired']

const MESSAGE_TYPES = [
  { value: 'interview_invite', label: 'Interview Invite', status: 'interview_scheduled' },
  { value: 'orientation_invite', label: 'Passed → Orientation Invite', status: 'passed' },
  { value: 'further_interview', label: 'Further Interview', status: 'shortlisted' },
  { value: 'not_passed', label: 'Not Passed', status: 'rejected' },
  { value: 'selected', label: 'Selected / Hired', status: 'hired' },
]

const AVATAR_COLORS = [
  { bg: 'bg-signal/20', text: 'text-ink' },
  { bg: 'bg-volt/15', text: 'text-volt' },
  { bg: 'bg-coral/15', text: 'text-coral' },
  { bg: 'bg-ink/10', text: 'text-ink' },
]

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

function avatarStyle(name = '') {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

function progressFor(status) {
  if (status === 'rejected') return 100
  const idx = STAGE_ORDER.indexOf(status)
  return Math.round(((idx + 1) / STAGE_ORDER.length) * 100)
}

const emptyComposer = { openFor: null, candidate: null, messageType: '', content: '', loading: false, sending: false }
const emptyInterviewEditor = { openFor: null, scheduled_date: '', scheduled_time: '', location: '', notes: '', loading: false, saving: false }

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [composer, setComposer] = useState(emptyComposer)
  const [interviewEditor, setInterviewEditor] = useState(emptyInterviewEditor)

  async function load() {
    setLoading(true)
    const { data } = await api.get('/candidates', {
      params: { search: search || undefined, status: statusFilter || undefined },
    })
    setCandidates(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    load()
  }

  async function updateStatus(applicationId, status) {
    await api.patch(`/applications/${applicationId}/status`, { status })
    load()
  }

  async function exportExcel() {
    const res = await api.get('/onboarding/export-candidates', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'candidates-export.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // --- Message composer ---
  async function openComposer(c, messageType) {
    setComposer({ openFor: c.application_id, candidate: c, messageType, content: '', loading: true, sending: false })
    const { data } = await api.post('/messages/draft', {
      candidateId: c.id,
      applicationId: c.application_id,
      messageType,
    })
    setComposer((prev) => ({ ...prev, content: data.content, loading: false }))
  }

  function changeComposerType(messageType) {
    openComposer(composer.candidate, messageType)
  }

  function closeComposer() {
    setComposer(emptyComposer)
  }

  async function sendComposedMessage() {
    const { candidate, messageType, content } = composer
    setComposer((prev) => ({ ...prev, sending: true }))
    await api.post('/messages/send', {
      candidateId: candidate.id,
      applicationId: candidate.application_id,
      messageType,
      content,
    })
    const mapping = MESSAGE_TYPES.find((m) => m.value === messageType)
    if (mapping) {
      await api.patch(`/applications/${candidate.application_id}/status`, { status: mapping.status })
    }
    closeComposer()
    load()
  }

  // --- Interview date/time editor ---
  async function openInterviewEditor(c) {
    setInterviewEditor({ ...emptyInterviewEditor, openFor: c.application_id, loading: true })
    const { data } = await api.get(`/interviews/${c.application_id}`)
    if (data && data.scheduled_at) {
      const d = new Date(data.scheduled_at)
      setInterviewEditor({
        openFor: c.application_id,
        scheduled_date: d.toISOString().slice(0, 10),
        scheduled_time: d.toTimeString().slice(0, 5),
        location: data.location || '',
        notes: data.notes || '',
        loading: false,
        saving: false,
      })
    } else {
      setInterviewEditor((prev) => ({ ...prev, loading: false, location: data?.location || '', notes: data?.notes || '' }))
    }
  }

  function closeInterviewEditor() {
    setInterviewEditor(emptyInterviewEditor)
  }

  async function saveInterview(applicationId) {
    setInterviewEditor((prev) => ({ ...prev, saving: true }))
    const { scheduled_date, scheduled_time, location, notes } = interviewEditor
    const scheduled_at = scheduled_date ? `${scheduled_date}T${scheduled_time || '00:00'}:00` : null
    await api.put(`/interviews/${applicationId}`, { scheduled_at, location, notes })
    closeInterviewEditor()
  }

  const positions = useMemo(
    () => Array.from(new Set(candidates.map((c) => c.position_applied).filter(Boolean))),
    [candidates]
  )

  const filtered = candidates.filter((c) => {
    if (positionFilter && c.position_applied !== positionFilter) return false
    if (sourceFilter && c.source !== sourceFilter) return false
    return true
  })

  const grouped = STAGES.map((stage) => ({
    ...stage,
    candidates: filtered.filter((c) => c.status === stage.key),
  })).filter((g) => g.candidates.length > 0)

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold">Candidates</h1>
          <button
            onClick={exportExcel}
            className="text-sm bg-ink text-signal rounded-full px-4 py-2 font-medium hover:opacity-90"
          >
            Export candidates (Excel)
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 mb-8">
          <input
            placeholder="Search name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm max-w-[220px] focus:outline-none focus:ring-2 focus:ring-volt/40 focus:border-volt transition"
          />
          <FilterPill value={statusFilter} onChange={setStatusFilter}>
            <option value="">Status</option>
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </FilterPill>
          <FilterPill value={positionFilter} onChange={setPositionFilter}>
            <option value="">Position</option>
            {positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </FilterPill>
          <FilterPill value={sourceFilter} onChange={setSourceFilter}>
            <option value="">Source</option>
            <option value="web_form">Web form</option>
            <option value="qr_code">QR code</option>
          </FilterPill>
          <button type="submit" className="bg-ink text-signal rounded-full px-5 py-2 text-sm font-medium">
            Search
          </button>
        </form>

        {loading && <p className="text-ink/50">Loading…</p>}

        {!loading && grouped.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-ink/50">No candidates match yet.</div>
        )}

        <div className="space-y-10">
          {grouped.map((group) => (
            <section key={group.key}>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-display text-lg font-bold">{group.label}</h2>
                <span className="bg-ink/5 text-ink/60 text-xs font-mono rounded-full px-2 py-0.5">
                  {group.candidates.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.candidates.map((c) => {
                  const name = c.english_name || c.khmer_name || 'Unnamed'
                  const avatar = avatarStyle(name)
                  const percent = progressFor(c.status)
                  const isComposerOpen = composer.openFor === c.application_id
                  const isInterviewOpen = interviewEditor.openFor === c.application_id
                  return (
                    <div key={c.application_id} className="bg-white rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 ${avatar.bg} ${avatar.text}`}
                        >
                          {initials(name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{name}</p>
                          <p className="text-xs text-ink/50 truncate">
                            {c.position_applied || 'No position specified'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-ink/50 mb-1">
                        <span>{c.phone}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden mb-4">
                        <div
                          className={`h-full rounded-full ${c.status === 'rejected' ? 'bg-coral' : 'bg-signal'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-xs text-ink/60 truncate">{group.note}</p>
                        <select
                          value={c.status}
                          onChange={(e) => updateStatus(c.application_id, e.target.value)}
                          className="text-xs border border-ink/15 rounded-full px-2 py-1 shrink-0"
                        >
                          {STAGES.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => (isComposerOpen ? closeComposer() : openComposer(c, 'interview_invite'))}
                          className="flex-1 text-xs border border-ink/15 rounded-full px-2 py-1.5 hover:bg-ink/5"
                        >
                          ✉️ Message
                        </button>
                        <button
                          onClick={() => (isInterviewOpen ? closeInterviewEditor() : openInterviewEditor(c))}
                          className="flex-1 text-xs border border-ink/15 rounded-full px-2 py-1.5 hover:bg-ink/5"
                        >
                          🗓️ Interview
                        </button>
                      </div>

                      {isComposerOpen && (
                        <div className="mt-3 bg-paper rounded-xl p-3 space-y-2">
                          <select
                            value={composer.messageType}
                            onChange={(e) => changeComposerType(e.target.value)}
                            className="input text-xs"
                          >
                            {MESSAGE_TYPES.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                          {composer.loading ? (
                            <p className="text-xs text-ink/40">Drafting…</p>
                          ) : (
                            <textarea
                              value={composer.content}
                              onChange={(e) => setComposer((prev) => ({ ...prev, content: e.target.value }))}
                              rows={5}
                              className="input text-xs"
                            />
                          )}
                          <p className="text-[11px] text-ink/40">
                            Sending will also mark this candidate as:{' '}
                            <span className="font-medium">
                              {STAGES.find((s) => s.key === MESSAGE_TYPES.find((m) => m.value === composer.messageType)?.status)?.label}
                            </span>
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={sendComposedMessage}
                              disabled={composer.loading || composer.sending}
                              className="flex-1 bg-signal text-ink text-xs font-bold rounded-full py-2 disabled:opacity-50"
                            >
                              {composer.sending ? 'Sending…' : 'Send'}
                            </button>
                            <button onClick={closeComposer} className="text-xs text-ink/50 px-3">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {isInterviewOpen && (
                        <div className="mt-3 bg-paper rounded-xl p-3 space-y-2">
                          {interviewEditor.loading ? (
                            <p className="text-xs text-ink/40">Loading…</p>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="date"
                                  value={interviewEditor.scheduled_date}
                                  onChange={(e) => setInterviewEditor((p) => ({ ...p, scheduled_date: e.target.value }))}
                                  className="input text-xs"
                                />
                                <input
                                  type="time"
                                  value={interviewEditor.scheduled_time}
                                  onChange={(e) => setInterviewEditor((p) => ({ ...p, scheduled_time: e.target.value }))}
                                  className="input text-xs"
                                />
                              </div>
                              <input
                                placeholder="Location"
                                value={interviewEditor.location}
                                onChange={(e) => setInterviewEditor((p) => ({ ...p, location: e.target.value }))}
                                className="input text-xs"
                              />
                              <textarea
                                placeholder="Notes"
                                value={interviewEditor.notes}
                                onChange={(e) => setInterviewEditor((p) => ({ ...p, notes: e.target.value }))}
                                rows={2}
                                className="input text-xs"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveInterview(c.application_id)}
                                  disabled={interviewEditor.saving}
                                  className="flex-1 bg-ink text-signal text-xs font-bold rounded-full py-2 disabled:opacity-50"
                                >
                                  {interviewEditor.saving ? 'Saving…' : 'Save'}
                                </button>
                                <button onClick={closeInterviewEditor} className="text-xs text-ink/50 px-3">
                                  Cancel
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

function FilterPill({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volt/40 focus:border-volt transition"
    >
      {children}
    </select>
  )
}