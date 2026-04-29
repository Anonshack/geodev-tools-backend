import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api'
import AdminLayout from '../../components/AdminLayout'
import Spinner from '../../components/Spinner'
import {
  Users, FolderOpen, Cpu, MapPin, Bell,
  UserCheck, BellOff, Activity,
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color, to }) {
  const inner = (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-600 transition-all hover:-translate-y-0.5 cursor-pointer">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white">{value ?? <span className="text-slate-600">—</span>}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
        {sub != null && (
          <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.stats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Platform-wide statistics</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size={30} className="text-indigo-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Users} label="Total users" value={stats?.users}
              sub={`${stats?.active_users} active`}
              color="bg-indigo-600" to="/admin/users"
            />
            <StatCard
              icon={Cpu} label="Mock APIs" value={stats?.mock_apis}
              sub={`${stats?.active_apis} active`}
              color="bg-violet-600" to="/admin/mock-apis"
            />
            <StatCard
              icon={FolderOpen} label="Geo Files" value={stats?.files}
              color="bg-sky-600" to="/admin/files"
            />
            <StatCard
              icon={MapPin} label="Locations" value={stats?.locations}
              color="bg-emerald-600" to="/admin/locations"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Bell} label="Notifications" value={stats?.notifications}
              color="bg-amber-600" to="/admin/notifications"
            />
            <StatCard
              icon={BellOff} label="Unread notifs" value={stats?.unread_notifs}
              color="bg-red-600" to="/admin/notifications"
            />
            <StatCard
              icon={UserCheck} label="Staff users" value={stats?.staff_users}
              color="bg-pink-600" to="/admin/users"
            />
            <StatCard
              icon={Activity} label="Active APIs %" value={
                stats?.mock_apis
                  ? `${Math.round((stats.active_apis / stats.mock_apis) * 100)}%`
                  : '—'
              }
              color="bg-teal-600"
            />
          </div>
        </>
      )}
    </AdminLayout>
  )
}
