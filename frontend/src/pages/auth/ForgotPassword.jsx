import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../../api'
import { MapPin, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../../components/Spinner'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.passwordResetRequest(email)
      setSent(true)
    } catch (err) {
      const msg = err.response?.data?.email || err.response?.data?.detail || 'Something went wrong'
      toast.error(Array.isArray(msg) ? msg[0] : msg)
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
          <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
          <p className="text-gray-500 text-sm mt-1">We'll send a reset link to your email</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-primary-600 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Check your email</h2>
              <p className="text-gray-500 text-sm">
                We've sent a reset link to <strong>{email}</strong>
              </p>
              <Link to="/login" className="btn-primary mt-6 w-full">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <input
                  className="input" type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading && <Spinner size={16} />}
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-primary-600 hover:underline">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
