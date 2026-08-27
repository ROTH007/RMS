const STYLES = {
  submitted: 'bg-white/10 text-ink/70 border-ink/20',
  shortlisted: 'bg-volt/10 text-volt border-volt/30',
  interview_scheduled: 'bg-signal/20 text-ink border-signal/50',
  interviewed: 'bg-signal/20 text-ink border-signal/50',
  passed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  hired: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/40 font-semibold',
  rejected: 'bg-coral/10 text-coral border-coral/30',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block text-xs px-3 py-1 rounded-full border font-mono uppercase tracking-wide ${
        STYLES[status] || STYLES.submitted
      }`}
    >
      {status?.replace('_', ' ')}
    </span>
  )
}
