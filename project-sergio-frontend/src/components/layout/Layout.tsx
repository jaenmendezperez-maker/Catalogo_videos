import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const FULL_SCREEN_ROUTES = ['/login', '/registro']

function Layout() {
  const { pathname } = useLocation()
  const isFullScreen = FULL_SCREEN_ROUTES.includes(pathname)

  if (isFullScreen) return <Outlet />

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff]">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout