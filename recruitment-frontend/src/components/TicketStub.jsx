export default function TicketStub({ children, stub, className = '' }) {
  return (
    <div className={`relative bg-white rounded-2xl shadow-sm overflow-hidden ${className}`}>
      <div className="p-6">{children}</div>
      {stub && (
        <>
          <div className="relative flex items-center h-3">
            <div className="absolute -left-3 w-6 h-6 rounded-full bg-paper" />
            <div className="flex-1 border-t-2 border-dashed border-ink/15 mx-3" />
            <div className="absolute -right-3 w-6 h-6 rounded-full bg-paper" />
          </div>
          <div className="px-6 py-4 bg-ink/[0.03]">{stub}</div>
        </>
      )}
    </div>
  )
}
