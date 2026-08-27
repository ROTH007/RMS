export default function LangToggle({ lang, setLang }) {
  return (
    <div className="inline-flex rounded-full border border-ink/15 p-1 bg-white">
      {['en', 'kh'].map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            lang === l ? 'bg-ink text-signal' : 'text-ink/50'
          }`}
        >
          {l === 'en' ? 'EN' : 'ខ្មែរ'}
        </button>
      ))}
    </div>
  )
}
