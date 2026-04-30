import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import { ChevronLeft, ChevronRight, MapPin, RefreshCw, ExternalLink } from 'lucide-react'
import { formatDate } from '../../utils/format'
import toast from 'react-hot-toast'

export default function AdminLocations() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await adminApi.locations(p)
      setData(res)
    } catch {
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [page])

  const totalPages = Math.ceil(data.count / 30)

  const mapsLink = (lat, lon) =>
    `https://www.google.com/maps?q=${lat},${lon}`

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Locations</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">{data.count} location records</p>
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
            <MapPin size={36} className="text-gray-300 dark:text-slate-600" />
            <p className="text-gray-400 dark:text-slate-500">No location data yet</p>
            <p className="text-gray-400 dark:text-slate-500 text-xs">Locations are saved automatically on login</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 text-left">
                  {['User', 'IP Address', 'Country', 'City / Region', 'Coordinates', 'Saved', 'Map'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {data.results.map(loc => {
                  const hasCoords = loc.latitude && loc.longitude
                  return (
                    <tr key={loc.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{loc.user}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-400">
                        {loc.ip || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-600 dark:text-slate-300 text-xs">{loc.country || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-600 dark:text-slate-300 text-xs">{loc.city || '—'}</p>
                        {loc.region && <p className="text-gray-400 dark:text-slate-500 text-[10px]">{loc.region}</p>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 dark:text-slate-500">
                        {hasCoords
                          ? `${parseFloat(loc.latitude).toFixed(4)}, ${parseFloat(loc.longitude).toFixed(4)}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">
                        {formatDate(loc.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {hasCoords ? (
                          <a
                            href={mapsLink(loc.latitude, loc.longitude)}
                            target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors inline-flex"
                            title="Open in Google Maps"
                          >
                            <ExternalLink size={13} />
                          </a>
                        ) : (
                          <span className="text-gray-300 dark:text-slate-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
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
