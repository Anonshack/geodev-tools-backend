import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, FolderOpen, Bell, User, Cpu, LogOut, Menu, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ai-tools',      icon: Cpu,             label: 'Mock API' },
  { to: '/geo-files',     icon: FolderOpen,      label: 'Geo Files' },
  { to: '/notifications', icon: Bell,            label: 'Notifications' },
  { to: '/profile',       icon: User,            label: 'Profile' },
]

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-60 p-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8 mt-1">
        <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
          <MapPin size={15} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-none">GeoDev Tools</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Developer Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 pt-3 mt-3 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.username}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block sticky top-0 h-screen shrink-0">
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full shadow-2xl">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <MapPin size={13} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">GeoDev Tools</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="btn-ghost p-2">
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 p-5 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
