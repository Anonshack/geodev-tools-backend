import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import {
  LayoutDashboard, FolderOpen, Bell, User, Cpu,
  LogOut, Menu, MapPin, Shield, X,
} from 'lucide-react'
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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 w-60 p-4 transition-colors duration-200">
      {/* Logo + close (mobile) */}
      <div className="flex items-center justify-between px-2 mb-8 mt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <MapPin size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm leading-none">GeoDev Tools</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Developer Platform</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden btn-ghost p-1.5">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={onClose}
            className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3 space-y-0.5">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm shrink-0">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.username}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Theme</span>
          <ThemeToggle />
        </div>

        {user?.is_staff && (
          <NavLink to="/admin" className="sidebar-link text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300">
            <Shield size={17} />
            <span>Admin Panel</span>
          </NavLink>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300"
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
    <div className="flex min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block sticky top-0 h-screen shrink-0">
        <SidebarContent onClose={null} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full shadow-2xl">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <MapPin size={13} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">GeoDev Tools</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={() => setMobileOpen(true)} className="btn-ghost p-2">
              <Menu size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
