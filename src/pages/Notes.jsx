import { useState, useEffect } from 'react'
import { Plus, Pin, Trash2 } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal'
import { fetchNotes, addNote, updateNote, deleteNote } from '../lib/db'
import { useAuth } from '../context/AuthContext'

export default function Notes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await fetchNotes()
    setNotes(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const selectNote = (note) => {
    setActiveId(note.id)
    setTitle(note.title)
    setContent(note.content || '')
  }

  const startNew = () => {
    setActiveId('new')
    setTitle('')
    setContent('')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (activeId === 'new') {
        const created = await addNote({ user_id: user.id, title: title || 'Untitled note', content })
        await load()
        setActiveId(created.id)
      } else if (activeId) {
        await updateNote(activeId, { title: title || 'Untitled note', content })
        await load()
      }
    } finally {
      setSaving(false)
    }
  }

  const togglePin = async (note) => {
    await updateNote(note.id, { pinned: !note.pinned })
    await load()
  }

  const activeNote = notes.find((n) => n.id === activeId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <GlassCard className="lg:col-span-1 p-0 overflow-hidden flex flex-col max-h-[75vh]">
        <div className="p-4 pb-2 flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm opacity-80">Notes</h3>
          <Button size="sm" icon={Plus} onClick={startNew}>
            New
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {loading ? (
            <p className="text-sm opacity-40 p-4 text-center">Loading…</p>
          ) : notes.length === 0 ? (
            <p className="text-sm opacity-40 p-4 text-center">No notes yet.</p>
          ) : (
            notes.map((n) => (
              <button
                key={n.id}
                onClick={() => selectNote(n)}
                className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${
                  activeId === n.id ? 'bg-brand-500/10' : ''
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {n.pinned && <Pin size={11} className="text-amber-400 shrink-0" />}
                  <span className="text-sm font-medium truncate">{n.title}</span>
                </div>
                <p className="text-xs opacity-40 truncate mt-0.5">{n.content || 'Empty note'}</p>
              </button>
            ))
          )}
        </div>
      </GlassCard>

      <GlassCard className="lg:col-span-2">
        {activeId ? (
          <div className="flex flex-col gap-3 h-full">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title…"
              className="font-display font-semibold text-base"
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write anything…"
              rows={14}
              className="flex-1"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                {activeNote && (
                  <Button variant="ghost" icon={Pin} onClick={() => togglePin(activeNote)}>
                    {activeNote.pinned ? 'Unpin' : 'Pin'}
                  </Button>
                )}
              </div>
              {activeNote && (
                <Button variant="danger" icon={Trash2} onClick={() => setDeleting(activeNote)}>
                  Delete
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm opacity-40 py-20 text-center">
            Select a note from the list, or create a new one.
          </p>
        )}
      </GlassCard>

      <ConfirmDeleteModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        itemLabel="this note"
        onConfirm={async () => {
          await deleteNote(deleting.id)
          setActiveId(null)
          await load()
        }}
      />
    </div>
  )
}
