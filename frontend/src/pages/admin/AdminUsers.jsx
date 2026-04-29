import { useEffect, useState } from 'react'
import { adminApi } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import { Trash2, ShieldCheck, ShieldOff, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminUsers() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await adminApi.users(p)
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page])

  const toggleActive = async (user) => {
    try {
      await adminApi.userUpdate(user.id, { is_active: !user.is_active })
      setData(d => ({
        ...d,
        results: d.results.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u),
      }))
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`)
    } catch {
      toast.error('Failed to update user')
    }
  }

  const deleteUser = async (user) => {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return
    try {
      await adminApi.userDelete(user.id)
      setData(d => ({ ...d, results: d.results.filter(u => u.id !== user.id), count: d.count - 1 }))
      toast.success('User deleted')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    }
  }

  const totalPages = Math.ceil(data.count / 20)

  const filtered = search.trim()
    ? data.results.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : data.results

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-0.5">{data.count} registered users</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="pl-9 pr-4 py-2 text-sm bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-indigo-500 w-52"
          />
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={28} className="text-indigo-400" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 text-center py-16">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Country</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-900 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.username}</p>
                          {user.is_staff && (
                            <span className="text-[10px] text-indigo-400 font-medium">Staff</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{user.email}</td>
                    <td className="px-4 py-3 text-slate-400">{user.country || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(user.date_joined)}</td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                        user.is_active
                          ? 'bg-emerald-900/50 text-emerald-400'
                          : 'bg-red-900/50 text-red-400'
                      )}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActive(user)}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                          className={clsx(
                            'p-1.5 rounded-lg transition-colors',
                            user.is_active
                              ? 'text-amber-400 hover:bg-amber-900/30'
                              : 'text-emerald-400 hover:bg-emerald-900/30'
                          )}
                        >
                          {user.is_active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        </button>
                        <button
                          onClick={() => deleteUser(user)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={!data.previous || loading}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:border-indigo-500 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-slate-400">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!data.next || loading}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:border-indigo-500 disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </AdminLayout>
  )
}
