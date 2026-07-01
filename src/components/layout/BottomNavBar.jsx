import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, WalletCards, LineChart, Bitcoin, Menu } from 'lucide-react'
import clsx from 'clsx'
import MobileMoreDrawer from './MobileMoreDrawer'

const TABS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/ledger', label: 'Ledger', icon: WalletCards },
  { to: '/stock', label: 'Stock', icon: LineChart },
  { to: '/crypto', label: 'Crypto', icon: Bitcoin },
]

export default function BottomNavBar() {
  const [moreOpen, setMoreOpen] = useState(false)
  const location = useLocation()

  const moreActive = !TABS.some((t) => (t.end ? location.pathname === t.to : location.pathname === t.to))

  return (
    <>
      <nav data-wf-bottom-nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass !rounded-none border-t border-white/10 px-1 pt-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom))]">
        <div className="flex items-stretch justify-between">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                clsx(
                  'flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl text-[11px] font-medium transition-colors',
                  isActive ? 'text-brand-400' : 'opacity-55'
                )
              }
            >
              <tab.icon size={20} strokeWidth={2.1} />
              {tab.label}
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={clsx(
              'flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl text-[11px] font-medium transition-colors',
              moreActive ? 'text-brand-400' : 'opacity-55'
            )}
          >
            <Menu size={20} strokeWidth={2.1} />
            More
          </button>
        </div>
      </nav>

      <MobileMoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  )
}
