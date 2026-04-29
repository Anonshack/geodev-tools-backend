import { useState, useEffect } from 'react'
import { notifyApi } from '../../api'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import { Bell, CheckCheck, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { timeAgo } from '../../utils/format'
import toast from 'react-hot-toast'

export default function Notifications() {
  const [data, setData] = useState({ results: [], count: 0, unread_count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await notifyApi.list(p)
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page])

  const markRead = async (pk) => {
    await notifyApi.markRead(pk)
    setData(d => ({
      ...d,
      results: d.results.map(n => n.id === pk ? { ...n, is_read: true } : n),
      unread_count: Math.max(0, d.unread_count - 1),
    }))
  }

  const markAll = async () => {
    await notifyApi.markAllRead()
    toast.success('All marked as read')
    setData(d => ({
      ...d,
      results: d.results.map(n => ({ ...n, is_read: true })),
      unread_count: 0,
    }))
  }

  const remove = async (pk) => {
    await notifyApi.delete(pk)
    setData(d => ({ ...d, results: d.results.filter(n => n.id !== pk), count: d.count - 1 }))
    toast.success('Deleted')
  }

  const typeColor = { system: 'badge-blue', email: 'badge-green' }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data.count} total · {data.unread_count} unread
          </p>
        </div>
        {data.unread_count > 0 && (
          <button onClick={markAll} className="btn-secondary text-sm">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="card divide-y divide-gray-50">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={28} className="text-primary-600" />
          </div>
        ) : data.results.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No notifications</p>
          </div>
        ) : (
          data.results.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-primary-50/40' : ''}`}
            >
              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.is_read ? 'bg-primary-500' : 'bg-gray-200'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-sm text-gray-900">{n.title}</p>
                  <span className={typeColor[n.type] || 'badge-gray'}>{n.type}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} className="btn-ghost p-1.5 text-primary-600" title="Mark as read">
                    <CheckCheck size={14} />
                  </button>
                )}
                <button onClick={() => remove(n.id)} className="btn-ghost p-1.5 text-red-500" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data.count > 20 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage(p => p - 1)} disabled={!data.previous || loading}
            className="btn-secondary px-3"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)} disabled={!data.next || loading}
            className="btn-secondary px-3"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </Layout>
  )
}
