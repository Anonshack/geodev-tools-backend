import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login         from './pages/auth/Login'
import Register      from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import Dashboard     from './pages/dashboard/Dashboard'
import Notifications from './pages/dashboard/Notifications'
import GeoFiles      from './pages/dashboard/GeoFiles'
import AiTools       from './pages/dashboard/AiTools'
import Profile       from './pages/dashboard/Profile'
import MockPublic    from './pages/MockPublic'

const Guard = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>

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

          {/* Protected */}
          <Route path="/dashboard"     element={<Guard><Dashboard /></Guard>} />
          <Route path="/ai-tools"      element={<Guard><AiTools /></Guard>} />
          <Route path="/geo-files"     element={<Guard><GeoFiles /></Guard>} />
          <Route path="/notifications" element={<Guard><Notifications /></Guard>} />
          <Route path="/profile"       element={<Guard><Profile /></Guard>} />

          {/* Redirects */}
          <Route path="/"        element={<Navigate to="/dashboard" replace />} />
          <Route path="/storage" element={<Navigate to="/geo-files" replace />} />
          <Route path="*"        element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
