import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import {
  LayoutDashboard, Users, FolderOpen, Cpu,
  MapPin, Bell, LogOut, Menu, Shield, X,
} from 'lucide-react'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/admin',               icon: LayoutDashboard, label: 'Overview',     exact: true },
  { to: '/admin/users',         icon: Users,           label: 'Users'         },
  { to: '/admin/mock-apis',     icon: Cpu,             label: 'Mock APIs'     },
  { to: '/admin/files',         icon: FolderOpen,      label: 'Geo Files'     },
  { to: '/admin/locations',     icon: MapPin,          label: 'Locations'     },
  { to: '/admin/notifications', icon: Bell,            label: 'Notifications' },
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
    <div className="flex flex-col h-full w-64 p-4 transition-colors duration-200
      bg-white dark:bg-slate-900
      border-r border-gray-200 dark:border-slate-800">

      {/* Logo */}
      <div className="flex items-center justify-between px-2 mb-8 mt-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none text-gray-900 dark:text-white">Admin Panel</p>
            <p className="text-[10px] mt-0.5 text-gray-400 dark:text-slate-500">GeoDev Tools</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={onClose}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white'
                : 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t pt-3 mt-3 space-y-0.5 border-gray-100 dark:border-slate-800">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0
            bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">{user?.username}</p>
            <p className="text-xs truncate text-gray-400 dark:text-slate-500">{user?.email}</p>
          </div>
        </div>

        {/* Theme toggle row */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs font-medium text-gray-400 dark:text-slate-500">Theme</span>
          <ThemeToggle />
        </div>

        {/* User dashboard link */}
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
            text-gray-500 dark:text-slate-400
            hover:text-gray-900 dark:hover:text-white
            hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <LayoutDashboard size={17} />
          <span>User Dashboard</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
            text-red-500 dark:text-red-400
            hover:text-red-700 dark:hover:text-red-300
            hover:bg-red-50 dark:hover:bg-red-950/40"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen transition-colors duration-200 bg-slate-100 dark:bg-slate-950">
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40 transition-colors duration-200
          bg-white dark:bg-slate-900
          border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield size={13} className="text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">Admin Panel</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
