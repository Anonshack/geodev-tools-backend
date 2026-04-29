import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { profileApi } from '../../api'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import { Camera, Save, Lock, Key, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../../api'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'

function Section({ title, children }) {
  return (
    <div className="card p-6 mb-5">
      <h2 className="font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-50">{title}</h2>
      {children}
    </div>
  )
}

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [keyLoading, setKeyLoading] = useState(false)
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false })
  const [pwErrors, setPwErrors] = useState({})
  const imgRef = useRef()

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    company_name: user?.company_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    city: user?.city || '',
    bio: user?.bio || '',
  })

  const [pw, setPw] = useState({ old_password: '', new_password: '', confirm_password: '' })

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const setPwField = (k) => (e) => setPw({ ...pw, [k]: e.target.value })

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      await profileApi.update(fd)
      await refreshUser()
      toast.success('Profile updated')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPwErrors({})
    setPwSaving(true)
    try {
      await profileApi.changePassword(pw)
      toast.success('Password changed')
      setPw({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPwErrors(err.response?.data || {})
    } finally {
      setPwSaving(false)
    }
  }

  const uploadAvatar = async (file) => {
    if (!file) return
    const fd = new FormData()
    fd.append('profile_image', file)
    try {
      await profileApi.update(fd)
      await refreshUser()
      toast.success('Avatar updated')
    } catch {
      toast.error('Upload failed')
    }
  }

  const generateKey = async () => {
    setKeyLoading(true)
    try {
      await authApi.generateApiKey()
      await refreshUser()
      toast.success('New API key generated')
    } catch {
      toast.error('Failed')
    } finally {
      setKeyLoading(false)
    }
  }

  const avatarUrl = user?.profile_image?.startsWith('http')
    ? user.profile_image
    : user?.profile_image
      ? user.profile_image
      : null

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account settings</p>
      </div>

      <div className="max-w-2xl">
        {/* Avatar + info */}
        <Section title="Account">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary-100 flex items-center justify-center">
                {avatarUrl
                  ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <span className="text-3xl font-bold text-primary-600">{user?.username?.[0]?.toUpperCase()}</span>
                }
              </div>
              <button
                onClick={() => imgRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm"
              >
                <Camera size={13} className="text-gray-500" />
              </button>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadAvatar(e.target.files[0])} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Joined {formatDate(user?.date_joined)}</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First name</label>
                <input className="input" value={form.first_name} onChange={set('first_name')} placeholder="John" />
              </div>
              <div>
                <label className="label">Last name</label>
                <input className="input" value={form.last_name} onChange={set('last_name')} placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input" value={form.company_name} onChange={set('company_name')} placeholder="GeoDev LLC" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone_number} onChange={set('phone_number')} placeholder="+998 90 000 00 00" />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" value={form.city} onChange={set('city')} placeholder="Tashkent" />
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input resize-none h-20" value={form.bio} onChange={set('bio')} placeholder="Tell something about yourself" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Spinner size={16} /> : <Save size={16} />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </Section>

        {/* Change password */}
        <Section title="Change Password">
          <form onSubmit={changePassword} className="space-y-4">
            {[
              { k: 'old_password', label: 'Current password', field: 'old' },
              { k: 'new_password', label: 'New password', field: 'new' },
              { k: 'confirm_password', label: 'Confirm new password', field: 'confirm' },
            ].map(({ k, label, field }) => (
              <div key={k}>
                <label className="label">{label}</label>
                <div className="relative">
                  <input
                    type={showPw[field] ? 'text' : 'password'}
                    className={`input pr-10 ${pwErrors[k] ? 'input-error' : ''}`}
                    value={pw[k]} onChange={setPwField(k)} required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPw(s => ({ ...s, [field]: !s[field] }))}
                  >
                    {showPw[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {pwErrors[k] && <p className="text-red-500 text-xs mt-1">{pwErrors[k]}</p>}
              </div>
            ))}
            <button type="submit" disabled={pwSaving} className="btn-primary">
              {pwSaving ? <Spinner size={16} /> : <Lock size={16} />}
              {pwSaving ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </Section>

        {/* API Key */}
        <Section title="API Key">
          <p className="text-sm text-gray-500 mb-4">
            Use this key to authenticate with GeoDev Tools API from external services.
          </p>
          {user?.api_key ? (
            <div className="bg-gray-50 rounded-xl p-3.5 flex items-center gap-3 mb-4 border border-gray-100">
              <code className="text-xs font-mono text-gray-700 break-all flex-1">{user.api_key}</code>
              <button
                onClick={() => { navigator.clipboard.writeText(user.api_key); toast.success('Copied!') }}
                className="text-primary-600 hover:text-primary-700 text-xs font-medium shrink-0"
              >
                Copy
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">No API key. Generate one below.</p>
          )}
          <button onClick={generateKey} disabled={keyLoading} className="btn-secondary">
            {keyLoading ? <Spinner size={16} /> : <RefreshCw size={16} />}
            {user?.api_key ? 'Regenerate key' : 'Generate key'}
          </button>
        </Section>
      </div>
    </Layout>
  )
}
