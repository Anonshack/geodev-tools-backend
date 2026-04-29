import { useEffect, useState } from 'react'
import { adminApi } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatBytes, formatDate } from '../../utils/format'
import toast from 'react-hot-toast'

export default function AdminFiles() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await adminApi.files(p)
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page])

  const deleteFile = async (file) => {
    if (!confirm(`Delete "${file.name}"?`)) return
    try {
      await adminApi.fileDelete(file.id)
      setData(d => ({ ...d, results: d.results.filter(f => f.id !== file.id), count: d.count - 1 }))
      toast.success('File deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const totalPages = Math.ceil(data.count / 20)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Geo Files</h1>
        <p className="text-slate-400 text-sm mt-0.5">{data.count} total files</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} className="text-indigo-400" /></div>
        ) : data.results.length === 0 ? (
          <p className="text-slate-500 text-center py-16">No files uploaded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">File</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Owner</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Uploaded</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {data.results.map(file => (
                  <tr key={file.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white truncate max-w-xs">{file.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">ID #{file.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {file.content_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatBytes(file.size)}</td>
                    <td className="px-4 py-3 text-slate-300">{file.owner || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(file.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteFile(file)}
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
