import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import {
  Trash2, ToggleLeft, ToggleRight, Copy, ExternalLink,
  ChevronLeft, ChevronRight, Cpu, RefreshCw,
} from 'lucide-react'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminMockAPIs() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await adminApi.mockApis(p)
      setData(res)
    } catch {
      toast.error('Failed to load mock APIs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [page])

  const busy = (id) => actionLoading[id]
  const setBusy = (id, val) => setActionLoading(s => ({ ...s, [id]: val }))

  const toggle = async (api) => {
    setBusy(api.id, 'toggle')
    try {
      const { data: updated } = await adminApi.mockApiToggle(api.id)
      setData(d => ({ ...d, results: d.results.map(a => a.id === api.id ? updated : a) }))
      toast.success(`"${api.title}" ${updated.is_active ? 'activated' : 'deactivated'}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Toggle failed')
    } finally {
      setBusy(api.id, null)
    }
  }

  const deleteApi = async (api) => {
    if (!confirm(`Delete "${api.title}"?\nThis cannot be undone.`)) return
    setBusy(api.id, 'delete')
    try {
      await adminApi.mockApiDelete(api.id)
      setData(d => ({ ...d, results: d.results.filter(a => a.id !== api.id), count: d.count - 1 }))
      toast.success('Mock API deleted')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    } finally {
      setBusy(api.id, null)
    }
  }

  const copy = (url) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied!')
  }

  const totalPages = Math.ceil(data.count / 20)

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mock APIs</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">{data.count} total endpoints</p>
        </div>
        <button
          onClick={() => load(page)}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} className="text-indigo-400" /></div>
        ) : data.results.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Cpu size={36} className="text-gray-300 dark:text-slate-600" />
            <p className="text-gray-400 dark:text-slate-500">No mock APIs yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 text-left">
                  {['Title / Slug', 'Owner', 'Items', 'Hits', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {data.results.map(api => (
                  <tr key={api.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="font-medium text-gray-900 dark:text-white truncate" title={api.title}>{api.title}</p>
                      <code className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">{api.slug}</code>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600 dark:text-slate-300 text-xs">{api.owner || '—'}</p>
                      {api.owner_id && <p className="text-gray-400 dark:text-slate-500 text-[10px]">ID #{api.owner_id}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-300 font-mono text-xs">{api.item_count}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 font-mono text-xs">{api.hit_count}</td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                        api.is_active
                          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                      )}>
                        {api.is_active ? 'Active' : 'Off'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">{formatDate(api.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copy(api.mock_url)}
                          className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          title="Copy URL"
                        >
                          <Copy size={13} />
                        </button>
                        <a
                          href={api.mock_url} target="_blank" rel="noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          title="Open URL"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          onClick={() => toggle(api)}
                          disabled={!!busy(api.id)}
                          title={api.is_active ? 'Deactivate' : 'Activate'}
                          className={clsx(
                            'p-1.5 rounded-lg transition-colors disabled:opacity-50',
                            api.is_active
                              ? 'text-amber-500 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                              : 'text-emerald-500 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                          )}
                        >
                          {busy(api.id) === 'toggle'
                            ? <Spinner size={13} />
                            : api.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        <button
                          onClick={() => deleteApi(api)}
                          disabled={!!busy(api.id)}
                          className="p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {busy(api.id) === 'delete' ? <Spinner size={13} /> : <Trash2 size={13} />}
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
