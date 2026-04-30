import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { aiApi } from '../api'
import Spinner from '../components/Spinner'
import ThemeToggle from '../components/ThemeToggle'
import { MapPin, Copy, Download, ArrowLeft, ExternalLink, Database } from 'lucide-react'
import toast from 'react-hot-toast'

/* ── JSON Viewer ─────────────────────────────────────────────────── */
function JsonViewer({ data, slug, endpoint, onBack }) {
  const jsonString = JSON.stringify(data, null, 2)
  const count = Array.isArray(data) ? data.length : 1
  const path = endpoint
    ? `/api/v1/geodev-ai/mock/${slug}/${endpoint}/`
    : `/api/v1/geodev-ai/mock/${slug}/`
  const fetchUrl = `${window.location.origin}${path}`

  const copyJson = () => { navigator.clipboard.writeText(jsonString); toast.success('JSON copied!') }
  const download = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${endpoint || slug}.json`
    a.click()
  }

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-5 transition-colors"
        >
          <ArrowLeft size={14} /> Back to endpoints
        </button>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {endpoint || 'Response'}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
            {count} items · GET {path}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              text-gray-700 dark:text-gray-200
              hover:bg-gray-50 dark:hover:bg-gray-700
              transition-colors"
          >
            <Copy size={13} /> Copy
          </button>
          <button
            onClick={download}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              text-gray-700 dark:text-gray-200
              hover:bg-gray-50 dark:hover:bg-gray-700
              transition-colors"
          >
            <Download size={13} /> Download
          </button>
        </div>
      </div>

      {/* Fetch snippet */}
      <div className="rounded-xl p-4 mb-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Fetch in your project:</p>
        <code className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
          fetch('{fetchUrl}')<br />
          {'  '}.then(r =&gt; r.json())<br />
          {'  '}.then(data =&gt; console.log(data))
        </code>
      </div>

      {/* JSON output */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono ml-2">response.json</span>
        </div>
        <pre className="text-xs text-gray-800 dark:text-gray-300 font-mono p-5 overflow-auto max-h-[60vh] leading-relaxed">
          {jsonString}
        </pre>
      </div>
    </div>
  )
}

/* ── Multi-endpoint landing ───────────────────────────────────────── */
const EP_COLORS = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-600',
  'from-sky-500 to-cyan-600',
  'from-purple-500 to-fuchsia-600',
]

function MultiLanding({ data, slug, onSelect }) {
  const endpoints = Object.keys(data)

  return (
    <div>
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 dark:bg-primary-600/20 border border-primary-200 dark:border-primary-500/30 rounded-2xl mb-4">
          <Database size={24} className="text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Mock API</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {endpoints.length} endpoints available · click one to explore the data
        </p>
        <code className="text-xs text-gray-400 dark:text-gray-600 font-mono mt-2 block">/mock/{slug}/</code>
      </div>

      {/* Endpoint cards */}
      <div className={`grid gap-4 ${endpoints.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} max-w-2xl mx-auto`}>
        {endpoints.map((ep, i) => {
          const count = Array.isArray(data[ep]) ? data[ep].length : 0
          const color = EP_COLORS[i % EP_COLORS.length]
          const directUrl = `${window.location.origin}/api/v1/geodev-ai/mock/${slug}/${ep}/`

          return (
            <div
              key={ep}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5 transition-all"
            >
              {/* Color header */}
              <div className={`bg-gradient-to-br ${color} p-6 flex items-center justify-center`}>
                <span className="text-3xl font-bold text-white/90 capitalize">
                  {ep[0].toUpperCase()}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white capitalize mb-0.5">{ep}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{count} items · JSON array</p>

                <button
                  onClick={() => onSelect(ep)}
                  className={`w-full py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${color} hover:opacity-90 transition-opacity mb-2`}
                >
                  View data
                </button>

                <div className="flex items-center gap-1.5">
                  <code className="text-[10px] text-gray-400 dark:text-gray-600 font-mono flex-1 truncate">/{ep}/</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(directUrl); toast.success('URL copied!') }}
                    className="text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                  >
                    <Copy size={11} />
                  </button>
                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                  >
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* URL index */}
      <div className="mt-10 max-w-2xl mx-auto bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-3">Direct endpoint URLs:</p>
        <div className="space-y-2">
          {endpoints.map(ep => {
            const url = `${window.location.origin}/api/v1/geodev-ai/mock/${slug}/${ep}/`
            return (
              <div key={ep} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 w-20 shrink-0 capitalize">{ep}</span>
                <code className="text-xs text-gray-500 dark:text-gray-400 font-mono flex-1 truncate">{url}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(url); toast.success('Copied!') }}
                  className="text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 transition-colors"
                >
                  <Copy size={11} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function MockPublic() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeEndpoint, setActiveEndpoint] = useState(null)

  useEffect(() => {
    aiApi.publicData(slug)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Not found or expired'))
      .finally(() => setLoading(false))
  }, [slug])

  const isMulti = data && typeof data === 'object' && !Array.isArray(data)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3.5 flex items-center justify-between transition-colors duration-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <MapPin size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-white">GeoDev Tools</span>
        </Link>

        <div className="flex items-center gap-3">
          {isMulti && activeEndpoint && (
            <button
              onClick={() => setActiveEndpoint(null)}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={12} /> All endpoints
            </button>
          )}
          <code className="text-xs text-gray-400 dark:text-gray-500 font-mono hidden sm:block">{slug}</code>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400">
            {isMulti ? `${Object.keys(data).length} endpoints` : 'MOCK API'}
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center mt-20">
            <Spinner size={32} className="text-primary-500" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center mt-20">
            <p className="text-red-500 dark:text-red-400 text-lg font-medium mb-2">{error}</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              This mock API may have been deleted or expired.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Go to homepage
            </Link>
          </div>
        )}

        {/* Single endpoint */}
        {data && !isMulti && (
          <JsonViewer data={data} slug={slug} endpoint={null} onBack={null} />
        )}

        {/* Multi — landing */}
        {data && isMulti && !activeEndpoint && (
          <MultiLanding data={data} slug={slug} onSelect={setActiveEndpoint} />
        )}

        {/* Multi — viewer */}
        {data && isMulti && activeEndpoint && (
          <JsonViewer
            data={data[activeEndpoint]}
            slug={slug}
            endpoint={activeEndpoint}
            onBack={() => setActiveEndpoint(null)}
          />
        )}
      </main>
    </div>
  )
}
