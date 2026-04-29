import { useEffect, useState } from 'react'
import { adminApi } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import { Trash2, Send, ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const TYPE_COLOR = {
  system: 'bg-indigo-900/50 text-indigo-400',
  email:  'bg-emerald-900/50 text-emerald-400',
}

export default function AdminNotifications() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [sendForm, setSendForm] = useState({ user_id: '', title: '', message: '', type: 'system' })
  const [sending, setSending] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await adminApi.notifications(p)
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page])

  const deleteNotif = async (notif) => {
    try {
      await adminApi.notificationDelete(notif.id)
      setData(d => ({ ...d, results: d.results.filter(n => n.id !== notif.id), count: d.count - 1 }))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const sendNotif = async (e) => {
    e.preventDefault()
    if (!sendForm.user_id || !sendForm.title.trim()) {
      toast.error('User ID and title are required')
      return
    }
    setSending(true)
    try {
      await adminApi.notificationSend({ ...sendForm, user_id: parseInt(sendForm.user_id) })
      toast.success('Notification sent!')
      setShowForm(false)
      setSendForm({ user_id: '', title: '', message: '', type: 'system' })
      load(1)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Send failed')
    } finally {
      setSending(false)
    }
  }

  const totalPages = Math.ceil(data.count / 20)

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 text-sm mt-0.5">{data.count} total notifications</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          <Send size={14} /> Send notification
        </button>
      </div>

      {/* Send form */}
      {showForm && (
        <form onSubmit={sendNotif} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 space-y-3">
          <h3 className="text-white font-semibold text-sm mb-1">Send notification to user</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="User ID"
              value={sendForm.user_id}
              onChange={e => setSendForm(s => ({ ...s, user_id: e.target.value }))}
              className="px-3 py-2 text-sm bg-slate-900 border border-slate-600 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-indigo-500"
              required
            />
            <select
              value={sendForm.type}
              onChange={e => setSendForm(s => ({ ...s, type: e.target.value }))}
              className="px-3 py-2 text-sm bg-slate-900 border border-slate-600 text-white rounded-xl focus:outline-none focus:border-indigo-500"
            >
              <option value="system">System</option>
              <option value="email">Email</option>
            </select>
          </div>
          <input
            placeholder="Title"
            value={sendForm.title}
            onChange={e => setSendForm(s => ({ ...s, title: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-600 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-indigo-500"
            required
          />
          <textarea
            placeholder="Message (optional)"
            value={sendForm.message}
            onChange={e => setSendForm(s => ({ ...s, message: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-600 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:border-indigo-500 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={sending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              {sending ? <Spinner size={14} /> : <Send size={14} />}
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} className="text-indigo-400" /></div>
        ) : data.results.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Bell size={36} className="text-slate-600" />
            <p className="text-slate-500">No notifications yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Read</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {data.results.map(notif => (
                  <tr key={notif.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300 font-medium">{notif.username}</td>
                    <td className="px-4 py-3">
                      <p className="text-white truncate max-w-[200px]" title={notif.title}>{notif.title}</p>
                      {notif.message && (
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">{notif.message}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('text-[11px] font-semibold px-2 py-0.5 rounded-full', TYPE_COLOR[notif.type] || 'bg-slate-700 text-slate-300')}>
                        {notif.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                        notif.is_read ? 'bg-slate-700 text-slate-400' : 'bg-amber-900/50 text-amber-400'
                      )}>
                        {notif.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(notif.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteNotif(notif)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/30 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
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
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:border-indigo-500 disabled:opacity-40 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-slate-400">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!data.next || loading}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:border-indigo-500 disabled:opacity-40 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </AdminLayout>
  )
}
