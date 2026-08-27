const STAGES = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview_scheduled', label: 'Interview Set' },
  { key: 'interviewed', label: 'Interviewed' },
  { key: 'passed', label: 'Passed' },
  { key: 'hired', label: 'Hired' },
]

export default function FunnelBar({ counts }) {
  return (
    <div className="bg-ink rounded-2xl p-6 flex gap-1 overflow-x-auto">
      {STAGES.map((stage, i) => {
        const value = counts[stage.key] || 0
        const filled = value > 0
        return (
          <div key={stage.key} className="flex-1 min-w-[120px] relative">
            {i > 0 && (
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-paper z-10" />
            )}
            <div
              className={`rounded-xl px-3 py-4 text-center border transition-colors ${
                filled ? 'border-signal bg-signal/5' : 'border-white/10'
              }`}
            >
              <div className={`font-mono text-2xl ${filled ? 'text-signal' : 'text-white/30'}`}>
                {String(value).padStart(2, '0')}
              </div>
              <div className="text-white/60 text-xs mt-1 uppercase tracking-wide">{stage.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
