import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Home from './pages/Home'
import Ledger from './pages/Ledger'
import Stock from './pages/Stock'
import Etf from './pages/Etf'
import Crypto from './pages/Crypto'
import Calculator from './pages/Calculator'
import CurrencyConverter from './pages/CurrencyConverter'
import Notes from './pages/Notes'
import AllTransactions from './pages/AllTransactions'
import Reports from './pages/Reports'
import PnL from './pages/PnL'
import Settings from './pages/Settings'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/ledger" element={<Ledger />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/etf" element={<Etf />} />
        <Route path="/crypto" element={<Crypto />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/currency-converter" element={<CurrencyConverter />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/transactions" element={<AllTransactions />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/pnl" element={<PnL />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
