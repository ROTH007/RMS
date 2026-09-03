import { useState } from 'react'
import api, { fileUrl } from '../api/client'

function isImageFile(url = '') {
  return /\.(jpe?g|png|gif|webp)$/i.test(url)
}

export default function CandidateDetailModal({ candidate, onClose }) {
  const [downloading, setDownloading] = useState(false)

  if (!candidate) return null
  const name = candidate.english_name || candidate.khmer_name || 'Unnamed'
  const cvUrl = candidate.cv_file_url ? fileUrl(candidate.cv_file_url) : null
  const submitted = candidate.applied_at || candidate.created_at

  async function downloadCv() {
    setDownloading(true)
    try {
      const res = await api.get(`/candidates/${candidate.id}/cv`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      const ext = candidate.cv_file_url.split('.').pop()
      a.download = `${name.replace(/\s+/g, '_')}_CV.${ext}`
      a.click()
      window.URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">{name}</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none">
            ×
          </button>
        </div>

        <div className="space-y-2 text-sm mb-6">
          <Row label="Khmer Name" value={candidate.khmer_name} />
          <Row label="English Name" value={candidate.english_name} />
          <Row label="Phone" value={candidate.phone} />
          <Row label="ID Card Number" value={candidate.id_card_number} />
          <Row
            label="ID Card Expiration"
            value={candidate.id_card_expiration ? new Date(candidate.id_card_expiration).toLocaleDateString() : null}
          />
          <Row label="Current Address" value={candidate.current_address} />
          <Row label="Position Applied" value={candidate.position_applied} />
          <Row label="Source" value={candidate.source === 'qr_code' ? 'QR code' : 'Web form'} />
          <Row label="Submitted" value={submitted ? new Date(submitted).toLocaleString() : null} />
        </div>

        <div>
          <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-2">CV / Attachment</p>
          {!cvUrl && <p className="text-sm text-ink/40">No file uploaded.</p>}
          {cvUrl && (
            <div className="space-y-3">
              {isImageFile(cvUrl) && (
                <img
                  src={cvUrl}
                  alt="Uploaded CV"
                  className="rounded-xl border border-ink/10 max-h-64 object-contain"
                />
              )}
              <button
                onClick={downloadCv}
                disabled={downloading}
                className="inline-flex items-center gap-2 bg-ink text-signal text-sm font-medium px-4 py-2 rounded-full disabled:opacity-50"
              >
                {downloading ? 'Preparing…' : '⬇️ Download CV'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4">
      <span className="text-ink/40">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}