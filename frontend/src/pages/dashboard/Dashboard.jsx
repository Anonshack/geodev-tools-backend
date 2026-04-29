import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { notifyApi, filesApi, aiApi } from '../../api'
import { Bell, FolderOpen, Cpu, Sparkles, ArrowRight, Copy, ExternalLink, ChevronRight } from 'lucide-react'
import { timeAgo } from '../../utils/format'
import toast from 'react-hot-toast'
import Spinner from '../../components/Spinner'
import Layout from '../../components/Layout'

function StatCard({ icon: Icon, label, value, color, to }) {
  const inner = (
    <div className="card p-5 flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900">{value ?? <span className="text-gray-300">—</span>}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ unread: null, files: null, apis: null })
  const [recentApis, setRecentApis] = useState([])
  const [recentNotifs, setRecentNotifs] = useState([])
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      notifyApi.unreadCount(),
      notifyApi.list(1),
      filesApi.list(1),
      aiApi.myApis(1),
    ]).then(([unread, notifs, files, apis]) => {
      setStats({
        unread: unread.data.unread_count,
        files: files.data.count,
        apis: apis.data.count,
      })
      setRecentNotifs(notifs.data.results?.slice(0, 4) || [])
      setRecentApis(apis.data.results?.slice(0, 3) || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const quickGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return
    setGenerating(true)
    try {
      const { data } = await aiApi.generate({ prompt, count: 20 })
      toast.success(`${data.item_count} items generated!`)
      navigator.clipboard.writeText(data.mock_url)
      toast('URL copied to clipboard', { icon: '📋' })
      navigate('/ai-tools')
    } catch {
      toast.error('Generation failed. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  const notifTypeColor = { system: 'bg-blue-100 text-blue-600', email: 'bg-green-100 text-green-600' }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">
          Good day, <span className="text-primary-600">{user?.username}</span> 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">Your GeoDev Tools workspace overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard icon={Bell}      label="Unread notifications" value={stats.unread} color="bg-violet-500" to="/notifications" />
        <StatCard icon={FolderOpen} label="Geo files stored"   value={stats.files}  color="bg-sky-500"    to="/geo-files" />
        <StatCard icon={Cpu}       label="Mock API endpoints"  value={stats.apis}   color="bg-primary-600" to="/ai-tools" />
      </div>

      {/* Quick Generator */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-primary-600 to-primary-700 border-0 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} />
          <h2 className="font-semibold">Quick Mock API Generator</h2>
        </div>
        <p className="text-primary-100 text-xs mb-4">
          Describe your data, get a shareable endpoint in seconds
        </p>
        <form onSubmit={quickGenerate} className="flex gap-3">
          <input
            className="flex-1 px-3.5 py-2.5 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-0"
            placeholder="e.g. 20 users with id, name, email, age, country"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            type="submit"
            disabled={generating || !prompt.trim()}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-primary-700 font-semibold text-sm hover:bg-primary-50 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? <Spinner size={15} className="text-primary-600" /> : <Sparkles size={15} />}
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </form>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent APIs */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Cpu size={16} className="text-primary-600" /> Recent endpoints
            </h2>
            <Link to="/ai-tools" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Spinner size={22} className="text-primary-500" /></div>
          ) : recentApis.length === 0 ? (
            <div className="text-center py-8">
              <Cpu size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No endpoints yet</p>
              <Link to="/ai-tools" className="text-xs text-primary-600 hover:underline mt-1 inline-block">Generate your first →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApis.map(api => (
                <div key={api.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{api.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{api.item_count} items · {timeAgo(api.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { navigator.clipboard.writeText(api.mock_url); toast.success('Copied!') }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
                    >
                      <Copy size={13} />
                    </button>
                    <a href={api.mock_url} target="_blank" rel="noreferrer"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-white transition-colors"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell size={16} className="text-violet-500" /> Notifications
              {stats.unread > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                  {stats.unread}
                </span>
              )}
            </h2>
            <Link to="/notifications" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Spinner size={22} className="text-primary-500" /></div>
          ) : recentNotifs.length === 0 ? (
            <div className="text-center py-8">
              <Bell size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentNotifs.map(n => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${!n.is_read ? 'bg-violet-50' : 'hover:bg-gray-50'}`}
                >
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${!n.is_read ? 'bg-violet-500' : 'bg-gray-200'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${notifTypeColor[n.type] || 'bg-gray-100 text-gray-500'}`}>
                    {n.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
