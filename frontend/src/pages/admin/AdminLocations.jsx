import { useEffect, useState } from 'react'
import { adminApi } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { formatDate } from '../../utils/format'

export default function AdminLocations() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await adminApi.locations(p)
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page])

  const totalPages = Math.ceil(data.count / 30)

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">User Locations</h1>
        <p className="text-slate-400 text-sm mt-0.5">{data.count} location records</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} className="text-indigo-400" /></div>
        ) : data.results.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <MapPin size={36} className="text-slate-600" />
            <p className="text-slate-500">No location data yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">IP</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Country</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">City</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Region</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Lat / Lon</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {data.results.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{loc.user}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{loc.ip || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{loc.country || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{loc.city || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{loc.region || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                      {loc.latitude && loc.longitude
                        ? `${parseFloat(loc.latitude).toFixed(3)}, ${parseFloat(loc.longitude).toFixed(3)}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(loc.created_at)}</td>
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
