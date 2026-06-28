import { useState, useEffect } from 'react'
import { Sun, Moon, LogOut, User, KeyRound } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { fetchProfile, upsertProfile } from '../lib/db'
import { supabase } from '../lib/supabaseClient'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  useEffect(() => {
    if (user) fetchProfile(user.id).then((p) => setFullName(p?.full_name || ''))
  }, [user])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSavedMsg('')
    try {
      await upsertProfile(user.id, { full_name: fullName })
      setSavedMsg('Saved!')
      setTimeout(() => setSavedMsg(''), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwMsg('')
    if (newPassword.length < 6) {
      setPwMsg('Password must be at least 6 characters.')
      return
    }
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPwMsg('Password updated successfully.')
      setNewPassword('')
    } catch (err) {
      setPwMsg(err.message)
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <h2 className="font-display font-bold text-xl">Profile &amp; Settings</h2>

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-brand-400" />
          <h3 className="font-display font-semibold">Profile</h3>
        </div>
        <div className="flex flex-col gap-3">
          <Input label="Email" value={user?.email || ''} disabled />
          <Input
            label="Display name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            {savedMsg && <span className="text-sm text-profit-400">{savedMsg}</span>}
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          {theme === 'dark' ? <Moon size={16} className="text-brand-400" /> : <Sun size={16} className="text-brand-400" />}
          <h3 className="font-display font-semibold">Appearance</h3>
        </div>
        <div className="flex gap-2">
          <Button variant={theme === 'dark' ? 'primary' : 'ghost'} onClick={() => setTheme('dark')} icon={Moon}>
            Dark
          </Button>
          <Button variant={theme === 'light' ? 'primary' : 'ghost'} onClick={() => setTheme('light')} icon={Sun}>
            Light
          </Button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={16} className="text-brand-400" />
          <h3 className="font-display font-semibold">Change password</h3>
        </div>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            minLength={6}
          />
          {pwMsg && (
            <p className={`text-sm ${pwMsg.includes('success') ? 'text-profit-400' : 'text-loss-400'}`}>{pwMsg}</p>
          )}
          <Button type="submit" disabled={pwLoading} className="self-start">
            {pwLoading ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </GlassCard>

      <GlassCard>
        <Button variant="danger" icon={LogOut} onClick={signOut}>
          Sign out
        </Button>
      </GlassCard>
    </div>
  )
}
