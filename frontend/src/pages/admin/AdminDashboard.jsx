import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import {
  Users, FolderOpen, Cpu, MapPin, Bell,
  UserCheck, BellOff, TrendingUp, ArrowRight,
  ToggleRight, Copy,
} from 'lucide-react'
import { formatDate, timeAgo } from '../../utils/format'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, sub, color, to }) {
  const inner = (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-500 hover:-translate-y-0.5 transition-all cursor-pointer">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? <span className="text-gray-300 dark:text-slate-600">—</span>}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{label}</p>
        {sub != null && <p className="text-[10px] text-gray-400 dark:text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentApis, setRecentApis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.stats(),
      adminApi.users(1),
      adminApi.mockApis(1),
    ]).then(([s, u, a]) => {
      setStats(s.data)
      setRecentUsers(u.data.results?.slice(0, 5) || [])
      setRecentApis(a.data.results?.slice(0, 5) || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Platform-wide statistics and recent activity</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size={30} className="text-indigo-400" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard icon={Users}     label="Total users"    value={stats?.users}     sub={`${stats?.active_users} active`}   color="bg-indigo-600"  to="/admin/users" />
            <StatCard icon={Cpu}       label="Mock APIs"      value={stats?.mock_apis} sub={`${stats?.active_apis} active`}    color="bg-violet-600"  to="/admin/mock-apis" />
            <StatCard icon={FolderOpen} label="Geo Files"     value={stats?.files}                                              color="bg-sky-600"     to="/admin/files" />
            <StatCard icon={MapPin}    label="Locations"      value={stats?.locations}                                          color="bg-emerald-600" to="/admin/locations" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Bell}      label="Notifications"  value={stats?.notifications}                                      color="bg-amber-600"   to="/admin/notifications" />
            <StatCard icon={BellOff}   label="Unread"         value={stats?.unread_notifs}                                      color="bg-red-600"     to="/admin/notifications" />
            <StatCard icon={UserCheck} label="Staff users"    value={stats?.staff_users}                                        color="bg-pink-600"    to="/admin/users" />
            <StatCard icon={TrendingUp} label="API active %"  value={stats?.mock_apis ? `${Math.round((stats.active_apis / stats.mock_apis) * 100)}%` : '—'} color="bg-teal-600" />
          </div>

          {/* Recent sections */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users size={15} className="text-indigo-400" /> Recent users
                </h2>
                <Link to="/admin/users" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  View all <ArrowRight size={11} />
                </Link>
              </div>
              {recentUsers.length === 0 ? (
                <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-6">No users yet</p>
              ) : (
                <div className="space-y-2">
                  {recentUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs shrink-0">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.username}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {u.is_superuser && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">Superuser</span>}
                        {!u.is_superuser && u.is_staff && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400">Staff</span>}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${u.is_active ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                          {u.is_active ? 'Active' : 'Off'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Mock APIs */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Cpu size={15} className="text-violet-400" /> Recent Mock APIs
                </h2>
                <Link to="/admin/mock-apis" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  View all <ArrowRight size={11} />
                </Link>
              </div>
              {recentApis.length === 0 ? (
                <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-6">No mock APIs yet</p>
              ) : (
                <div className="space-y-2">
                  {recentApis.map(api => (
                    <div key={api.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${api.is_active ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-slate-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{api.title}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{api.owner} · {api.item_count} items · {api.hit_count} hits · {timeAgo(api.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => { navigator.clipboard.writeText(api.mock_url); toast.success('Copied!') }}
                          className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
                        >
                          <Copy size={12} />
                        </button>
                        <ToggleRight size={14} className={api.is_active ? 'text-emerald-400' : 'text-gray-300 dark:text-slate-600'} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
