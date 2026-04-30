import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { MapPin, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../../components/Spinner'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => {
    setError('')
    setForm({ ...form, [k]: e.target.value })
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const profile = await login(form)
      toast.success('Welcome back!')
      navigate(profile?.is_staff ? '/admin' : '/dashboard')
    } catch (err) {
      const data = err.response?.data
      const msg = data?.detail
        || data?.email?.[0]
        || data?.password?.[0]
        || data?.non_field_errors?.[0]
        || 'Login or password is incorrect'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <MapPin size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to GeoDev Tools</p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-5">

            {/* Error alert */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                className={`input ${error ? 'input-error' : ''}`}
                type="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  className={`input pr-10 ${error ? 'input-error' : ''}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password} onChange={set('password')} required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Spinner size={16} /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
