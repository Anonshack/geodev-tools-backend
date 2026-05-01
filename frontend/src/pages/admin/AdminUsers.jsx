import { useEffect, useState, useCallback, useRef } from 'react'
import { adminApi } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import {
  Trash2, ShieldCheck, ShieldOff, ChevronLeft, ChevronRight,
  Search, Star, UserX, UserCheck, RefreshCw, Eye, X,
  Mail, Phone, MapPin, Building2, Calendar, Clock,
  User as UserIcon, Key, FileText,
} from 'lucide-react'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function Badge({ children, color }) {
  const colors = {
    green:  'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400',
    red:    'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400',
    amber:  'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400',
    slate:  'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400',
    violet: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400',
  }
  return (
    <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', colors[color] || colors.slate)}>
      {children}
    </span>
  )
}

function InfoRow({ icon: Icon, label, value, mono }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-gray-500 dark:text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={clsx('text-sm text-gray-800 dark:text-slate-200 break-all', mono && 'font-mono text-xs')}>{value}</p>
      </div>
    </div>
  )
}

function UserDetailPanel({ pk, onClose, onRefresh }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    setLoading(true)
    adminApi.userDetail(pk)
      .then(({ data }) => setUser(data))
      .catch(() => toast.error('Failed to load user'))
      .finally(() => setLoading(false))
  }, [pk])

  const update = async (fields, label) => {
    setSaving(label)
    try {
      const { data } = await adminApi.userUpdate(pk, fields)
      setUser(data)
      toast.success('Updated')
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    } finally {
      setSaving(null)
    }
  }

  const deleteUser = async () => {
    if (!confirm(`Delete user "${user.username}"?\nThis cannot be undone.`)) return
    setSaving('delete')
    try {
      await adminApi.userDelete(pk)
      toast.success('User deleted')
      onRefresh()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Slide panel */}
      <div className="relative z-10 ml-auto h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UserIcon size={16} className="text-indigo-500" /> User Details
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size={28} className="text-indigo-400" />
          </div>
        ) : !user ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-slate-500">User not found</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Avatar + name section */}
            <div className="px-5 py-5 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={user.username}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-2xl">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  {user.is_superuser && (
                    <Star size={12} className="absolute -top-1 -right-1 text-amber-500 fill-amber-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{user.username}</p>
                  {(user.first_name || user.last_name) && (
                    <p className="text-sm text-gray-500 dark:text-slate-400">{[user.first_name, user.last_name].filter(Boolean).join(' ')}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <Badge color={user.is_active ? 'green' : 'red'}>{user.is_active ? 'Active' : 'Inactive'}</Badge>
                    {user.is_superuser && <Badge color="amber">Superuser</Badge>}
                    {!user.is_superuser && user.is_staff && <Badge color="indigo">Staff</Badge>}
                  </div>
                </div>
              </div>
            </div>

            {/* Info fields */}
            <div className="px-5 py-4 space-y-4">
              <InfoRow icon={Mail}      label="Email"        value={user.email} mono />
              <InfoRow icon={Phone}     label="Phone"        value={user.phone_number} mono />
              <InfoRow icon={Building2} label="Company"      value={user.company_name} />
              <InfoRow icon={MapPin}    label="Country"      value={user.country} />
              <InfoRow icon={MapPin}    label="City"         value={user.city} />
              <InfoRow icon={MapPin}    label="Address"      value={user.address} />
              <InfoRow icon={FileText}  label="Bio"          value={user.bio} />

              <div className="pt-1 border-t border-gray-100 dark:border-slate-800 space-y-4">
                <InfoRow icon={Calendar} label="Date joined"  value={formatDate(user.date_joined)} />
                <InfoRow icon={Clock}    label="Last login"   value={user.last_login ? formatDate(user.last_login) : 'Never'} />
                <InfoRow icon={Key}      label="User ID"      value={`#${user.id}`} mono />
              </div>
            </div>

            {/* Action buttons */}
            {!user.is_superuser && (
              <div className="px-5 pb-5 space-y-2 border-t border-gray-100 dark:border-slate-800 pt-4">
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">Actions</p>

                <button
                  onClick={() => update({ is_active: !user.is_active }, 'active')}
                  disabled={!!saving}
                  className={clsx(
                    'w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50',
                    user.is_active
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                  )}
                >
                  {saving === 'active' ? <Spinner size={14} /> : user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                  {user.is_active ? 'Deactivate account' : 'Activate account'}
                </button>

                <button
                  onClick={() => update({ is_staff: !user.is_staff }, 'staff')}
                  disabled={!!saving}
                  className={clsx(
                    'w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50',
                    user.is_staff
                      ? 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                  )}
                >
                  {saving === 'staff' ? <Spinner size={14} /> : user.is_staff ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                  {user.is_staff ? 'Remove staff role' : 'Grant staff role'}
                </button>

                <button
                  onClick={deleteUser}
                  disabled={!!saving}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                  {saving === 'delete' ? <Spinner size={14} /> : <Trash2 size={14} />}
                  Delete user permanently
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedPk, setSelectedPk] = useState(null)
  const debounceRef = useRef(null)

  const load = useCallback(async (p = 1, q = '') => {
    setLoading(true)
    try {
      const { data: res } = await adminApi.users(p, q)
      setData(res)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page, search) }, [page, search])

  const handleSearch = (val) => {
    setSearchInput(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(val)
      setPage(1)
    }, 400)
  }

  const totalPages = Math.ceil(data.count / 20)

  return (
    <AdminLayout>
      {selectedPk && (
        <UserDetailPanel
          pk={selectedPk}
          onClose={() => setSelectedPk(null)}
          onRefresh={() => load(page, search)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
            {data.count} {search ? 'matching' : 'registered'} users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input
              value={searchInput}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search name, email…"
              className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-indigo-500 w-56 transition-colors"
            />
          </div>
          <button
            onClick={() => load(page, search)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={28} className="text-indigo-400" />
          </div>
        ) : data.results.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-slate-500">
            {search ? `No users matching "${search}"` : 'No users found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 text-left">
                  {['User', 'Email', 'Country / City', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {data.results.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                            {user.username?.[0]?.toUpperCase()}
                          </div>
                          {user.is_superuser && (
                            <Star size={10} className="absolute -top-1 -right-1 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                            {user.is_superuser && <Badge color="amber">Superuser</Badge>}
                            {!user.is_superuser && user.is_staff && <Badge color="indigo">Staff</Badge>}
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">ID #{user.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300 text-xs">{user.email}</td>

                    {/* Location */}
                    <td className="px-4 py-3">
                      <p className="text-gray-600 dark:text-slate-300 text-xs">{user.country || '—'}</p>
                      {user.city && <p className="text-gray-400 dark:text-slate-500 text-xs">{user.city}</p>}
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">
                      {formatDate(user.date_joined)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge color={user.is_active ? 'green' : 'red'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedPk(user.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        title="View full details"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => p - 1)} disabled={!data.previous || loading}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-indigo-500 disabled:opacity-40 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500 dark:text-slate-400">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!data.next || loading}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-indigo-500 disabled:opacity-40 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </AdminLayout>
  )
}
