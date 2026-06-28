import { useEffect } from 'react'
import { X } from 'lucide-react'
import GlassCard from './GlassCard'

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-up"
        onClick={onClose}
      />
      <GlassCard
        className={`relative w-full ${width} max-h-[90vh] overflow-y-auto animate-fade-up`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </GlassCard>
    </div>
  )
}
