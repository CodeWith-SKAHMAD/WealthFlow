import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import MarketSessionBar from './MarketSessionBar'
import BottomNavBar from './BottomNavBar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0 p-4 lg:p-6 pb-24 lg:pb-6 max-w-[1600px] mx-auto w-full">
        <TopBar />
        <MarketSessionBar />
        <main className="animate-fade-up">
          <Outlet />
        </main>
      </div>
      <BottomNavBar />
    </div>
  )
}
