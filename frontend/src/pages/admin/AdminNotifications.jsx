import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import { Trash2, Send, ChevronLeft, ChevronRight, Bell, RefreshCw, X } from 'lucide-react'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const TYPE_COLOR = {
  system: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400',
  email:  'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400',
}

function SendModal({ onClose, onSent }) {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ user_id: '', title: '', message: '', type: 'system' })
  const [sending, setSending] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    adminApi.users(1, '')
      .then(({ data }) => setUsers(data.results || []))
      .catch(() => {})
      .finally(() => setLoadingUsers(false))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.user_id) { toast.error('Select a user'); return }
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSending(true)
    try {
      await adminApi.notificationSend({ ...form, user_id: parseInt(form.user_id) })
      toast.success('Notification sent!')
      onSent()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Send failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
            <Bell size={16} className="text-indigo-400" /> Send Notification
          </h3>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* User select */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">Recipient user</label>
            {loadingUsers ? (
              <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500 text-sm py-2">
                <Spinner size={14} /> Loading users…
              </div>
            ) : (
              <select
                value={form.user_id}
                onChange={e => setForm(s => ({ ...s, user_id: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">— Select user —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">Type</label>
            <div className="flex gap-2">
              {['system', 'email'].map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setForm(s => ({ ...s, type: t }))}
                  className={clsx(
                    'flex-1 py-2 rounded-xl text-sm font-medium border transition-colors',
                    form.type === t
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">Title</label>
            <input
              placeholder="Notification title"
              value={form.title}
              onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">Message <span className="text-gray-400 dark:text-slate-500">(optional)</span></label>
            <textarea
              placeholder="Optional message body…"
              value={form.message}
              onChange={e => setForm(s => ({ ...s, message: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={sending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {sending ? <Spinner size={14} /> : <Send size={14} />}
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminNotifications() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState({})
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await adminApi.notifications(p)
      setData(res)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [page])

  const deleteNotif = async (notif) => {
    setDeleting(s => ({ ...s, [notif.id]: true }))
    try {
      await adminApi.notificationDelete(notif.id)
      setData(d => ({ ...d, results: d.results.filter(n => n.id !== notif.id), count: d.count - 1 }))
      toast.success('Deleted')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    } finally {
      setDeleting(s => ({ ...s, [notif.id]: false }))
    }
  }

  const totalPages = Math.ceil(data.count / 20)

  return (
    <AdminLayout>
      {showModal && (
        <SendModal onClose={() => setShowModal(false)} onSent={() => load(1)} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">{data.count} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(page)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            <Send size={14} /> Send notification
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} className="text-indigo-400" /></div>
        ) : data.results.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Bell size={36} className="text-gray-300 dark:text-slate-600" />
            <p className="text-gray-400 dark:text-slate-500">No notifications yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 text-left">
                  {['User', 'Title / Message', 'Type', 'Read', 'Date', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {data.results.map(notif => (
                  <tr key={notif.id} className={clsx(
                    'transition-colors',
                    !notif.is_read
                      ? 'bg-gray-50 dark:bg-slate-700/20 hover:bg-gray-100 dark:hover:bg-slate-700/40'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700/20'
                  )}>
                    <td className="px-4 py-3">
                      <p className="text-gray-900 dark:text-white font-medium text-xs">{notif.username}</p>
                      <p className="text-gray-400 dark:text-slate-600 text-[10px]">ID #{notif.user_id}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="text-gray-900 dark:text-white text-xs font-medium truncate" title={notif.title}>{notif.title}</p>
                      {notif.message && (
                        <p className="text-gray-400 dark:text-slate-500 text-[11px] truncate mt-0.5" title={notif.message}>{notif.message}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', TYPE_COLOR[notif.type] || 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400')}>
                        {notif.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                        notif.is_read
                          ? 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                          : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                      )}>
                        {notif.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">{formatDate(notif.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteNotif(notif)}
                        disabled={deleting[notif.id]}
                        className="p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting[notif.id] ? <Spinner size={13} /> : <Trash2 size={14} />}
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
