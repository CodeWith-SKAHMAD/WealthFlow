import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, ArrowLeftRight, User, LogOut } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { getRate } from '../../lib/currency'
import { fetchProfile } from '../../lib/db'
import Logo from '../ui/Logo'

export default function TopBar() {
  const { theme, toggleTheme } = useTheme()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [rate, setRate] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    let active = true
    getRate('USD', 'EUR')
      .then((r) => active && setRate(r))
      .catch(() => active && setRate(null))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!user) return
    let active = true
    fetchProfile(user.id)
      .then((p) => active && setAvatarUrl(p?.avatar_url || null))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [user])

  return (
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="lg:hidden">
        <Logo size="sm" showText={false} />
      </div>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-2.5">
        <button
          onClick={() => navigate('/currency-converter')}
          className="flex items-center gap-2 glass-inset hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
          title="Open currency converter"
        >
          <ArrowLeftRight size={14} className="text-brand-400" />
          <span className="numeric hidden sm:inline">
            1 USD = {rate ? rate.toFixed(4) : '…'} EUR
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl glass-inset hover:bg-white/10 transition-colors"
          title="Toggle dark / light mode"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-10 h-10 rounded-xl btn-3d flex items-center justify-center text-white font-semibold text-sm overflow-hidden"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : user?.email ? (
              user.email[0].toUpperCase()
            ) : (
              <User size={16} />
            )}
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 glass !rounded-xl p-2 z-50 animate-fade-up">
                <div className="px-3 py-2 text-xs opacity-60 truncate border-b border-white/5 mb-1">
                  {user?.email}
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    navigate('/settings')
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-left"
                >
                  <User size={15} /> Profile &amp; Settings
                </button>
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-loss-500/15 text-loss-400 text-sm text-left"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
