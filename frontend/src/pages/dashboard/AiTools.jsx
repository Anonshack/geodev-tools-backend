import { useState, useEffect } from 'react'
import { aiApi } from '../../api'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import {
  Cpu, Sparkles, Copy, Trash2, RefreshCw, ExternalLink,
  ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { timeAgo } from '../../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const EXAMPLE_PROMPTS = [
  'Generate 20 users with fields: id, name, email, age, country, avatar_url',
  'Generate 15 products with fields: id, title, price, category, in_stock, rating',
  'Create an API with Users (id, name, email, country, avatar_url) and Books (book_id, book_name, author, date, pdf_url)',
  'Create endpoints: employees (id, name, department, salary, is_active) and departments (id, name, budget, location)',
]

function MockApiCard({ api, onDelete, onToggle, onRegenerate }) {
  const [regenerating, setRegen] = useState(false)
  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!') }

  const regen = async () => {
    setRegen(true)
    try { await onRegenerate(api.id, api.item_count) }
    finally { setRegen(false) }
  }

  const isMulti = api.endpoints && api.endpoints.length > 0

  return (
    <div className={clsx('card p-5 transition-opacity', !api.is_active && 'opacity-60')}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">{api.title}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {timeAgo(api.created_at)} · {api.item_count} items{isMulti ? ` · ${api.endpoints.length} endpoints` : ''} · {api.hit_count} hits
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {api.is_expired && <span className="badge-red">Expired</span>}
          {api.admin_disabled && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
              Admin disabled
            </span>
          )}
          {!api.is_active && !api.admin_disabled && <span className="badge-gray">Inactive</span>}
          {isMulti && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700">MULTI</span>}
        </div>
      </div>

      {/* Single main URL for both single and multi */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 flex items-center gap-2 mb-2">
        <code className="text-xs text-primary-700 font-mono flex-1 truncate">{api.mock_url}</code>
        <button onClick={() => copy(api.mock_url)} className="text-gray-400 hover:text-gray-600 shrink-0"><Copy size={13} /></button>
        <a href={api.mock_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600 shrink-0"><ExternalLink size={13} /></a>
      </div>

      {/* Sub-endpoint pills for multi */}
      {isMulti && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {api.endpoints.map(ep => (
            <a
              key={ep}
              href={api.endpoint_urls[ep]}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-100 transition-colors"
            >
              /{ep}
            </a>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={regen} disabled={regenerating} className="btn-secondary text-xs px-3 py-1.5">
          {regenerating ? <Spinner size={12} /> : <RefreshCw size={12} />} Regenerate
        </button>
        {api.admin_disabled ? (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 cursor-not-allowed select-none">
            <ToggleLeft size={12} /> Blocked by admin
          </span>
        ) : (
          <button onClick={() => onToggle(api.id)} className="btn-secondary text-xs px-3 py-1.5">
            {api.is_active ? <ToggleRight size={12} className="text-primary-600" /> : <ToggleLeft size={12} />}
            {api.is_active ? 'Deactivate' : 'Activate'}
          </button>
        )}
        <button onClick={() => onDelete(api.id)} className="btn-ghost text-xs px-3 py-1.5 text-red-500 hover:bg-red-50">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  )
}

export default function AiTools() {
  const [prompt, setPrompt] = useState('')
  const [count, setCount] = useState(20)
  const [generating, setGenerating] = useState(false)
  const [apis, setApis] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [listLoading, setListLoading] = useState(true)
  const [generated, setGenerated] = useState(null)

  const loadApis = async (p = 1) => {
    setListLoading(true)
    try {
      const { data } = await aiApi.myApis(p)
      setApis(data)
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => { loadApis(page) }, [page])

  const generate = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return
    setGenerating(true)
    setGenerated(null)
    try {
      const { data } = await aiApi.generate({ prompt, count })
      setGenerated(data)
      toast.success(`${data.item_count} items generated!`)
      loadApis(1)
      setPage(1)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Generation failed. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (pk) => {
    if (!confirm('Delete this Mock API?')) return
    await aiApi.delete(pk)
    toast.success('Deleted')
    setApis(d => ({ ...d, results: d.results.filter(a => a.id !== pk), count: d.count - 1 }))
  }

  const handleToggle = async (pk) => {
    await aiApi.toggle(pk)
    setApis(d => ({
      ...d,
      results: d.results.map(a => a.id === pk ? { ...a, is_active: !a.is_active } : a),
    }))
  }

  const handleRegenerate = async (pk, itemCount) => {
    const { data } = await aiApi.regenerate(pk, itemCount)
    setApis(d => ({
      ...d,
      results: d.results.map(a => a.id === pk ? { ...a, item_count: data.item_count } : a),
    }))
    toast.success('Regenerated!')
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mock API Generator</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Describe your data → AI generates it → get a permanent REST endpoint
        </p>
      </div>

      {/* Generator */}
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={18} className="text-primary-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Generate new endpoint</h2>
        </div>

        <form onSubmit={generate} className="space-y-4">
          <div>
            <label className="label">Describe your data</label>
            <textarea
              className="input resize-none h-28"
              placeholder="e.g. Generate 50 products with fields: id, title, price, category, rating, in_stock"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </div>

          {/* Example prompts */}
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button
                key={i} type="button"
                onClick={() => setPrompt(ex)}
                className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                {ex.slice(0, 35)}…
              </button>
            ))}
          </div>

          <div className="flex items-end gap-4">
            <div className="w-36">
              <label className="label">Item count</label>
              <input
                type="number" className="input" min={1} max={500}
                value={count} onChange={(e) => setCount(Number(e.target.value))}
              />
            </div>
            <button type="submit" disabled={generating || !prompt.trim()} className="btn-primary">
              {generating ? <Spinner size={16} /> : <Cpu size={16} />}
              {generating ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </form>

        {/* Result */}
        {generating && (
          <div className="mt-6 flex items-center gap-3 text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
            <Spinner size={18} className="text-primary-600" />
            AI is generating your data… this takes ~5-10 seconds
          </div>
        )}

        {generated && (
          <div className="mt-6 bg-primary-50 border border-primary-100 rounded-xl p-5">
            <p className="text-sm font-semibold text-primary-800 dark:text-primary-300 mb-3">
              ✅ {generated.item_count} items generated!
              {generated.endpoints && <span className="ml-2 text-xs font-normal text-primary-600">({generated.endpoints.join(', ')})</span>}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Your public link:</p>
            <div className="bg-white rounded-lg px-3 py-2.5 flex items-center gap-2 border border-primary-200">
              <code className="text-xs text-primary-700 font-mono flex-1 break-all">{generated.mock_url}</code>
              <button onClick={() => { navigator.clipboard.writeText(generated.mock_url); toast.success('Copied!') }} className="text-primary-500 hover:text-primary-700 shrink-0"><Copy size={14} /></button>
              <a href={generated.mock_url} target="_blank" rel="noreferrer" className="text-primary-500 hover:text-primary-700 shrink-0"><ExternalLink size={14} /></a>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {generated.endpoints
                ? `Open the link → click ${generated.endpoints.map(e => `"${e}"`).join(' or ')} to see the data.`
                : `Use fetch('${generated.mock_url}') in your project.`}
            </p>
          </div>
        )}
      </div>

      {/* My APIs list */}
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">My Mock APIs ({apis.count})</h2>

        {listLoading ? (
          <div className="flex justify-center py-10"><Spinner size={28} className="text-primary-600" /></div>
        ) : apis.results.length === 0 ? (
          <div className="card text-center py-16">
            <Cpu size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">No mock APIs yet. Generate your first one above!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {apis.results.map(api => (
              <MockApiCard
                key={api.id} api={api}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onRegenerate={handleRegenerate}
              />
            ))}
          </div>
        )}

        {apis.count > 20 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => setPage(p => p - 1)} disabled={!apis.previous || listLoading} className="btn-secondary px-3">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={!apis.next || listLoading} className="btn-secondary px-3">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
