import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  WalletCards,
  LineChart,
  Layers,
  Bitcoin,
  Calculator,
  ArrowLeftRight,
  StickyNote,
  ListOrdered,
  FileBarChart,
  PieChart,
  Settings,
  X,
} from 'lucide-react'
import Logo from '../ui/Logo'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/ledger', label: 'Ledger', icon: WalletCards },
  { to: '/stock', label: 'Stock', icon: LineChart },
  { to: '/etf', label: 'ETF', icon: Layers },
  { to: '/crypto', label: 'Crypto', icon: Bitcoin },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/currency-converter', label: 'Currency Converter', icon: ArrowLeftRight },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/transactions', label: 'All Transactions', icon: ListOrdered },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/pnl', label: 'Unrealized & Realized PnL', icon: PieChart },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={clsx(
          'fixed lg:sticky top-0 left-0 h-screen w-72 shrink-0 z-50 lg:z-0',
          'flex flex-col gap-1 p-4 transition-transform duration-300',
          'glass !rounded-none lg:!rounded-r-3xl border-r border-white/5',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-2 py-3 mb-2">
          <Logo size="sm" />
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'btn-3d text-white shadow-lg'
                    : 'opacity-70 hover:opacity-100 hover:bg-white/5'
                )
              }
            >
              <item.icon size={17} strokeWidth={2.1} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-2 border-t border-white/5 pt-4',
              isActive ? 'text-brand-400' : 'opacity-70 hover:opacity-100 hover:bg-white/5'
            )
          }
        >
          <Settings size={17} strokeWidth={2.1} />
          Profile &amp; Settings
        </NavLink>
      </aside>
    </>
  )
}
