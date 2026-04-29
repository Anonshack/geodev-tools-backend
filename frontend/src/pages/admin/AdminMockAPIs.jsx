import { useEffect, useState } from 'react'
import { adminApi } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import { Trash2, ToggleLeft, ToggleRight, Copy, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminMockAPIs() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await adminApi.mockApis(p)
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page])

  const toggle = async (api) => {
    try {
      const { data: updated } = await adminApi.mockApiToggle(api.id)
      setData(d => ({ ...d, results: d.results.map(a => a.id === api.id ? updated : a) }))
      toast.success(`API ${updated.is_active ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Toggle failed')
    }
  }

  const deleteApi = async (api) => {
    if (!confirm(`Delete "${api.title}"?`)) return
    try {
      await adminApi.mockApiDelete(api.id)
      setData(d => ({ ...d, results: d.results.filter(a => a.id !== api.id), count: d.count - 1 }))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const totalPages = Math.ceil(data.count / 20)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mock APIs</h1>
        <p className="text-slate-400 text-sm mt-0.5">{data.count} total endpoints</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} className="text-indigo-400" /></div>
        ) : data.results.length === 0 ? (
          <p className="text-slate-500 text-center py-16">No mock APIs yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Owner</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hits</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {data.results.map(api => (
                  <tr key={api.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white truncate max-w-[180px]" title={api.title}>{api.title}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{api.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{api.owner || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{api.item_count}</td>
                    <td className="px-4 py-3 text-slate-400">{api.hit_count}</td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                        api.is_active
                          ? 'bg-emerald-900/50 text-emerald-400'
                          : 'bg-slate-700 text-slate-400'
                      )}>
                        {api.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(api.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { navigator.clipboard.writeText(api.mock_url); toast.success('Copied!') }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                          title="Copy URL"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => toggle(api)}
                          title={api.is_active ? 'Deactivate' : 'Activate'}
                          className={clsx(
                            'p-1.5 rounded-lg transition-colors',
                            api.is_active ? 'text-amber-400 hover:bg-amber-900/30' : 'text-emerald-400 hover:bg-emerald-900/30'
                          )}
                        >
                          {api.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        <button
                          onClick={() => deleteApi(api)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
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
