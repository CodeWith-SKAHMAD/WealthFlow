import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MarketSessionBar from './MarketSessionBar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <MarketSessionBar />
        <main className="animate-fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
