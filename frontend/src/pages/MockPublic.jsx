import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { aiApi } from '../api'
import Spinner from '../components/Spinner'
import { MapPin, Copy, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MockPublic() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    aiApi.publicData(slug)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Not found or expired'))
      .finally(() => setLoading(false))
  }, [slug])

  const jsonString = data ? JSON.stringify(data, null, 2) : ''

  const copyJson = () => {
    navigator.clipboard.writeText(jsonString)
    toast.success('JSON copied!')
  }

  const download = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `mock-${slug}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Topbar */}
      <header className="border-b border-gray-800 px-6 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <MapPin size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm text-white">GeoDev Tools</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="badge-gray text-xs">Mock API</span>
          <code className="text-xs text-gray-400 font-mono">{slug}</code>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex justify-center mt-20">
            <Spinner size={32} className="text-primary-500" />
          </div>
        )}

        {error && (
          <div className="text-center mt-20">
            <p className="text-red-400 text-lg font-medium mb-2">{error}</p>
            <p className="text-gray-500 text-sm">This mock API may have been deleted or expired.</p>
            <Link to="/" className="btn-primary mt-6 inline-flex">Go to homepage</Link>
          </div>
        )}

        {data && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-semibold text-white">
                  {Array.isArray(data) ? `${data.length} items` : '1 object'}
                </h1>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  GET /api/v1/geodev-ai/mock/{slug}/
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={copyJson} className="btn-secondary text-sm bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700">
                  <Copy size={14} /> Copy
                </button>
                <button onClick={download} className="btn-secondary text-sm bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700">
                  <Download size={14} /> Download
                </button>
              </div>
            </div>

            {/* Usage snippet */}
            <div className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
              <p className="text-xs text-gray-400 mb-2 font-medium">Usage in your project:</p>
              <code className="text-xs text-green-400 font-mono">
                fetch('{window.location.href}')
                <br />
                {'  '}.then(res =&gt; res.json())
                <br />
                {'  '}.then(data =&gt; console.log(data))
              </code>
            </div>

            {/* JSON output */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500 font-mono ml-2">response.json</span>
              </div>
              <pre className="text-xs text-gray-300 font-mono p-5 overflow-auto max-h-[70vh] leading-relaxed">
                {jsonString}
              </pre>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
