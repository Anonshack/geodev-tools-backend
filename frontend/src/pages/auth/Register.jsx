import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { MapPin, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../../components/Spinner'

export default function Register() {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', country: 'UZ' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')

  const set = (k) => (e) => {
    setErrors(s => ({ ...s, [k]: '' }))
    setGeneralError('')
    setForm({ ...form, [k]: e.target.value })
  }

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setGeneralError('')
    setLoading(true)
    try {
      await register(form)
      await login({ email: form.email, password: form.password })
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (!data) {
        setGeneralError('Something went wrong. Please try again.')
      } else if (typeof data === 'string') {
        setGeneralError(data)
      } else if (data.detail) {
        setGeneralError(data.detail)
      } else {
        // field-level errors
        setErrors({
          username: Array.isArray(data.username) ? data.username[0] : data.username,
          email:    Array.isArray(data.email)    ? data.email[0]    : data.email,
          password: Array.isArray(data.password) ? data.password[0] : data.password,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <MapPin size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join GeoDev Tools today</p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-4">

            {/* General error */}
            {generalError && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <p className="text-sm font-medium">{generalError}</p>
              </div>
            )}

            <div>
              <label className="label">Username</label>
              <input
                className={`input ${errors.username ? 'input-error' : ''}`}
                placeholder="johndoe" value={form.username} onChange={set('username')} required
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.username}
                </p>
              )}
            </div>

            <div>
              <label className="label">Email</label>
              <input
                className={`input ${errors.email ? 'input-error' : ''}`}
                type="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="label">Country</label>
              <select className="input" value={form.country} onChange={set('country')}>
                <option value="UZ">🇺🇿 Uzbekistan</option>
                <option value="KZ">🇰🇿 Kazakhstan</option>
                <option value="TR">🇹🇷 Turkey</option>
                <option value="US">🇺🇸 United States</option>
              </select>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={set('password')} required minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.password}
                </p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading && <Spinner size={16} />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
