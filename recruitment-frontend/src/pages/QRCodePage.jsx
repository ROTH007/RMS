import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import AppShell from '../components/AppShell'

export default function QRCodePage() {
  const [position, setPosition] = useState('')
  const [dataUrl, setDataUrl] = useState('')

  const baseUrl = window.location.origin
  const targetUrl = `${baseUrl}/?src=qr${position ? `&position=${encodeURIComponent(position)}` : ''}`

  useEffect(() => {
    QRCode.toDataURL(targetUrl, {
      width: 320,
      margin: 2,
      color: { dark: '#14161F', light: '#F4F5FA' },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(''))
  }, [targetUrl])

  function download() {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `next-stop-qr${position ? `-${position.replace(/\s+/g, '-').toLowerCase()}` : ''}.png`
    a.click()
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-8 py-8">
        <p className="font-mono text-xs text-volt uppercase tracking-widest mb-2">Print &amp; post</p>
        <h1 className="font-display text-3xl font-bold mb-2">QR intake code</h1>
        <p className="text-ink/60 mb-8">
          Candidates scan this to open the bilingual application form on their phone. Tag it to a specific role to
          print one per store or per position — the form pre-fills automatically.
        </p>

        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6">
          <label className="w-full max-w-xs">
            <span className="block text-xs font-medium text-ink/50 mb-1 uppercase tracking-wide">
              Position (optional)
            </span>
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Sales Associate"
              className="input"
            />
          </label>

          {dataUrl && (
            <div className="p-4 bg-paper rounded-2xl border-2 border-dashed border-ink/15">
              <img src={dataUrl} alt="QR code linking to the application form" width={240} height={240} />
            </div>
          )}

          <p className="font-mono text-xs text-ink/40 break-all text-center">{targetUrl}</p>

          <button
            onClick={download}
            disabled={!dataUrl}
            className="bg-signal text-ink font-display font-bold px-6 py-3 rounded-full hover:brightness-95 transition disabled:opacity-50"
          >
            Download PNG
          </button>
        </div>
      </div>
    </AppShell>
  )
}
