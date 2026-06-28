import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { Input } from './Input'

export default function ConfirmDeleteModal({ open, onClose, onConfirm, itemLabel = 'this entry' }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const ready = text.trim().toUpperCase() === 'DELETE'

  const handleConfirm = async () => {
    if (!ready) return
    setLoading(true)
    try {
      await onConfirm()
      setText('')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setText('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Delete confirmation" width="max-w-sm">
      <div className="flex items-start gap-3 mb-4 p-3 rounded-xl bg-loss-500/10 border border-loss-500/20">
        <AlertTriangle size={18} className="text-loss-400 mt-0.5 shrink-0" />
        <p className="text-sm opacity-80">
          This will permanently delete {itemLabel}. This cannot be undone.
        </p>
      </div>
      <Input
        label='Type "DELETE" to confirm'
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="DELETE"
        autoFocus
      />
      <div className="flex gap-2 mt-4">
        <Button variant="ghost" className="flex-1" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          disabled={!ready || loading}
          onClick={handleConfirm}
        >
          {loading ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </Modal>
  )
}
