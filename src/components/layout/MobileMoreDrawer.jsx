import { NavLink } from 'react-router-dom'
import {
  Layers,
  Calculator,
  ArrowLeftRight,
  StickyNote,
  ListOrdered,
  FileBarChart,
  PieChart,
  Settings,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import Logo from '../ui/Logo'

const MORE_ITEMS = [
  { to: '/etf', label: 'ETF', icon: Layers },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/currency-converter', label: 'Currency Converter', icon: ArrowLeftRight },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/transactions', label: 'All Transactions', icon: ListOrdered },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/pnl', label: 'Unrealized & Realized PnL', icon: PieChart },
  { to: '/settings', label: 'Profile & Settings', icon: Settings },
]

export default function MobileMoreDrawer({ open, onClose }) {
  if (!open) return null

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-up" onClick={onClose} />
      <div className="absolute bottom-0 inset-x-0 glass !rounded-t-3xl !rounded-b-none border-t border-white/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] max-h-[80vh] overflow-y-auto animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" />
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 opacity-60 hover:opacity-100">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {MORE_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'btn-3d text-white' : 'glass-inset opacity-80'
                )
              }
            >
              <item.icon size={17} strokeWidth={2.1} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}
