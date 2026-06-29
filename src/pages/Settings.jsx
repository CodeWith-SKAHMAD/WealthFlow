import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, LogOut, User, KeyRound, Camera, Loader2 } from 'lucide-react'
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
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const fileInputRef = useRef(null)

  const [newPassword, setNewPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  useEffect(() => {
    if (user)
      fetchProfile(user.id).then((p) => {
        setFullName(p?.full_name || '')
        setAvatarUrl(p?.avatar_url || null)
      })
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

  const handleAvatarPick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError('')

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be under 5MB.')
      return
    }

    setAvatarUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = `${data.publicUrl}?t=${Date.now()}` // cache-bust so new image shows immediately

      await upsertProfile(user.id, { avatar_url: publicUrl })
      setAvatarUrl(publicUrl)
    } catch (err) {
      setAvatarError(
        err.message?.includes('Bucket not found')
          ? "Storage isn't set up yet — run supabase/migration_avatar.sql in the Supabase SQL editor first."
          : err.message
      )
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
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

        <div className="flex items-center gap-4 mb-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden btn-3d flex items-center justify-center text-white font-bold text-2xl">
              {avatarUploading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : user?.email ? (
                user.email[0].toUpperCase()
              ) : (
                <User size={24} />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full glass border border-white/10 hover:bg-white/10"
              title="Change profile picture"
            >
              <Camera size={13} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarPick}
            />
          </div>
          <div className="text-sm opacity-50">
            Click the camera icon to upload a profile picture.
            <br />
            JPG or PNG, up to 5MB.
          </div>
        </div>
        {avatarError && <p className="text-sm text-loss-400 mb-3">{avatarError}</p>}

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
