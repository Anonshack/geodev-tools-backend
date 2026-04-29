import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Login          from './pages/auth/Login'
import Register       from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import Dashboard      from './pages/dashboard/Dashboard'
import Notifications  from './pages/dashboard/Notifications'
import GeoFiles       from './pages/dashboard/GeoFiles'
import AiTools        from './pages/dashboard/AiTools'
import Profile        from './pages/dashboard/Profile'
import MockPublic     from './pages/MockPublic'

import AdminDashboard     from './pages/admin/AdminDashboard'
import AdminUsers         from './pages/admin/AdminUsers'
import AdminFiles         from './pages/admin/AdminFiles'
import AdminMockAPIs      from './pages/admin/AdminMockAPIs'
import AdminLocations     from './pages/admin/AdminLocations'
import AdminNotifications from './pages/admin/AdminNotifications'

const Guard      = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>
const AdminGuard = ({ children }) => <AdminRoute>{children}</AdminRoute>

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { background: '#1e293b', color: '#f1f5f9', borderRadius: '10px', fontSize: '13px' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/mock/:slug"      element={<MockPublic />} />

          {/* User protected */}
          <Route path="/dashboard"     element={<Guard><Dashboard /></Guard>} />
          <Route path="/ai-tools"      element={<Guard><AiTools /></Guard>} />
          <Route path="/geo-files"     element={<Guard><GeoFiles /></Guard>} />
          <Route path="/notifications" element={<Guard><Notifications /></Guard>} />
          <Route path="/profile"       element={<Guard><Profile /></Guard>} />

          {/* Admin protected */}
          <Route path="/admin"               element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/users"         element={<AdminGuard><AdminUsers /></AdminGuard>} />
          <Route path="/admin/files"         element={<AdminGuard><AdminFiles /></AdminGuard>} />
          <Route path="/admin/mock-apis"     element={<AdminGuard><AdminMockAPIs /></AdminGuard>} />
          <Route path="/admin/locations"     element={<AdminGuard><AdminLocations /></AdminGuard>} />
          <Route path="/admin/notifications" element={<AdminGuard><AdminNotifications /></AdminGuard>} />

          {/* Redirects */}
          <Route path="/"        element={<Navigate to="/dashboard" replace />} />
          <Route path="/storage" element={<Navigate to="/geo-files" replace />} />
          <Route path="*"        element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
