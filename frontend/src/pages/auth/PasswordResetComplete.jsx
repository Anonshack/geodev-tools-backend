import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api'
import { MapPin, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../../components/Spinner'

export default function PasswordResetComplete() {
  const { uidb64, token } = useParams()
  const navigate = useNavigate()

  const [validating, setValidating] = useState(true)
  const [valid, setValid] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ new_password: '', confirm_password: '' })
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState({ new: false, confirm: false })

  useEffect(() => {
    authApi.passwordResetConfirm(uidb64, token)
      .then(() => setValid(true))
      .catch(() => setValid(false))
      .finally(() => setValidating(false))
  }, [uidb64, token])

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (form.new_password !== form.confirm_password) {
      setErrors({ confirm_password: 'Passwords do not match' })
      return
    }
    setLoading(true)
    try {
      await authApi.passwordResetComplete({
        uidb64,
        token,
        new_password: form.new_password,
        confirm_password: form.confirm_password,
      })
      setDone(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      const data = err.response?.data
      if (data?.error) {
        const msg = Array.isArray(data.error) ? data.error[0] : data.error
        toast.error(msg)
      } else {
        setErrors(data || {})
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
          <h1 className="text-2xl font-bold text-gray-900">New password</h1>
          <p className="text-gray-500 text-sm mt-1">Choose a strong password for your account</p>
        </div>

        <div className="card p-8">
          {/* Validating token */}
          {validating && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Spinner size={28} className="text-primary-600" />
              <p className="text-sm text-gray-500">Verifying reset link…</p>
            </div>
          )}

          {/* Invalid / expired token */}
          {!validating && !valid && (
            <div className="text-center py-4">
              <XCircle size={48} className="text-red-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Link expired or invalid</h2>
              <p className="text-gray-500 text-sm mb-6">
                This password reset link has already been used or has expired.
              </p>
              <Link to="/forgot-password" className="btn-primary w-full">
                Request a new link
              </Link>
            </div>
          )}

          {/* Done */}
          {done && (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-primary-600 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Password updated!</h2>
              <p className="text-gray-500 text-sm">Redirecting you to login…</p>
            </div>
          )}

          {/* Form */}
          {!validating && valid && !done && (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="label">New password</label>
                <div className="relative">
                  <input
                    type={show.new ? 'text' : 'password'}
                    className={`input pr-10 ${errors.new_password ? 'input-error' : ''}`}
                    placeholder="Min. 8 characters"
                    value={form.new_password}
                    onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                    required minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShow(s => ({ ...s, new: !s.new }))}
                  >
                    {show.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="text-red-500 text-xs mt-1">{errors.new_password}</p>
                )}
              </div>

              <div>
                <label className="label">Confirm password</label>
                <div className="relative">
                  <input
                    type={show.confirm ? 'text' : 'password'}
                    className={`input pr-10 ${errors.confirm_password ? 'input-error' : ''}`}
                    placeholder="Repeat new password"
                    value={form.confirm_password}
                    onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                  >
                    {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading && <Spinner size={16} />}
                {loading ? 'Resetting…' : 'Reset password'}
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
