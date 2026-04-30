import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import { Trash2, ChevronLeft, ChevronRight, FolderOpen, ExternalLink, RefreshCw } from 'lucide-react'
import { formatBytes, formatDate } from '../../utils/format'
import toast from 'react-hot-toast'

const TYPE_COLOR = {
  'geo+json': 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400',
  'json':     'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
  'csv':      'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400',
  'pdf':      'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
  'zip':      'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400',
  'png':      'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400',
  'jpeg':     'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400',
  'jpg':      'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400',
}

function typeLabel(ct) {
  if (!ct) return 'FILE'
  if (ct.startsWith('image/')) return ct.split('/')[1]?.toUpperCase()
  return ct.split('/')[1]?.toUpperCase() || 'FILE'
}
function typeColor(ct) {
  if (!ct) return 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
  const sub = ct.split('/')[1] || ''
  return TYPE_COLOR[sub] || (ct.startsWith('image/')
    ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400'
    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400')
}

export default function AdminFiles() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState({})

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await adminApi.files(p)
      setData(res)
    } catch {
      toast.error('Failed to load files')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [page])

  const deleteFile = async (file) => {
    if (!confirm(`Delete "${file.name}"?\nThis cannot be undone.`)) return
    setDeleting(s => ({ ...s, [file.id]: true }))
    try {
      await adminApi.fileDelete(file.id)
      setData(d => ({ ...d, results: d.results.filter(f => f.id !== file.id), count: d.count - 1 }))
      toast.success('File deleted')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    } finally {
      setDeleting(s => ({ ...s, [file.id]: false }))
    }
  }

  const totalPages = Math.ceil(data.count / 20)

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Geo Files</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">{data.count} total files</p>
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
            <FolderOpen size={36} className="text-gray-300 dark:text-slate-600" />
            <p className="text-gray-400 dark:text-slate-500">No files uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 text-left">
                  {['File', 'Type', 'Size', 'Owner', 'Uploaded', 'Links', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {data.results.map(file => (
                  <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-medium text-gray-900 dark:text-white truncate" title={file.name}>{file.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">ID #{file.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${typeColor(file.content_type)}`}>
                        {typeLabel(file.content_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">{formatBytes(file.size)}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600 dark:text-slate-300 text-xs">{file.owner_username || '—'}</p>
                      {file.owner_email && <p className="text-gray-400 dark:text-slate-500 text-[10px] truncate max-w-[120px]">{file.owner_email}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">{formatDate(file.created_at)}</td>
                    <td className="px-4 py-3">
                      {file.url && (
                        <a
                          href={file.url} target="_blank" rel="noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors inline-flex"
                          title="Open file"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteFile(file)}
                        disabled={deleting[file.id]}
                        className="p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                        title="Delete file"
                      >
                        {deleting[file.id] ? <Spinner size={13} /> : <Trash2 size={14} />}
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
