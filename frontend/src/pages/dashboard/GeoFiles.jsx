import { useState, useEffect, useRef } from 'react'
import { filesApi } from '../../api'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import {
  Upload, Trash2, Download, Copy, ExternalLink,
  FileText, Image, Archive, Database, Map,
  ChevronLeft, ChevronRight, FolderOpen,
} from 'lucide-react'
import { formatBytes, formatDate } from '../../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const GEO_TYPES = {
  'application/geo+json':            { label: 'GeoJSON', color: 'bg-green-100 text-green-700',  icon: Map },
  'application/json':                { label: 'JSON',    color: 'bg-blue-100 text-blue-700',    icon: Database },
  'text/csv':                        { label: 'CSV',     color: 'bg-yellow-100 text-yellow-700', icon: FileText },
  'text/plain':                      { label: 'TXT',     color: 'bg-gray-100 text-gray-600',    icon: FileText },
  'application/pdf':                 { label: 'PDF',     color: 'bg-red-100 text-red-600',      icon: FileText },
  'application/zip':                 { label: 'ZIP',     color: 'bg-orange-100 text-orange-700', icon: Archive },
  'application/x-zip-compressed':   { label: 'ZIP',     color: 'bg-orange-100 text-orange-700', icon: Archive },
  'application/octet-stream':        { label: 'Binary',  color: 'bg-purple-100 text-purple-700', icon: Database },
}

function getTypeInfo(ct) {
  if (!ct) return { label: 'File', color: 'bg-gray-100 text-gray-600', icon: FileText }
  if (ct.startsWith('image/')) return { label: 'Image', color: 'bg-sky-100 text-sky-700', icon: Image }
  return GEO_TYPES[ct] || { label: ct.split('/')[1]?.toUpperCase() || 'File', color: 'bg-gray-100 text-gray-600', icon: FileText }
}

function FileCard({ file, onDelete }) {
  const typeInfo = getTypeInfo(file.content_type)
  const Icon = typeInfo.icon
  const publicUrl = window.location.origin + filesApi.publicUrl(file.id)

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    toast.success('Public URL copied!')
  }

  return (
    <div className="card p-4 flex flex-col gap-3 hover:shadow-md transition-all hover:-translate-y-0.5">
      {/* Top */}
      <div className="flex items-start gap-3">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', typeInfo.color)}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={file.name}>{file.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={clsx('text-[10px] font-medium px-1.5 py-0.5 rounded-full', typeInfo.color)}>
              {typeInfo.label}
            </span>
            <span className="text-xs text-gray-400">{formatBytes(file.size)}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">{formatDate(file.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Public URL */}
      <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
        <code className="text-[11px] text-primary-700 font-mono flex-1 truncate">
          {filesApi.publicUrl(file.id)}
        </code>
        <button onClick={copyPublicUrl} className="text-gray-400 hover:text-primary-600 transition-colors shrink-0" title="Copy public URL">
          <Copy size={13} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={filesApi.downloadUrl(file.id)}
          className="btn-secondary text-xs px-3 py-1.5 flex-1 justify-center"
          download
        >
          <Download size={12} /> Download
        </a>
        <a
          href={publicUrl} target="_blank" rel="noreferrer"
          className="btn-ghost text-xs px-3 py-1.5 text-primary-600"
          title="Open public link"
        >
          <ExternalLink size={12} />
        </a>
        <button
          onClick={() => onDelete(file.id, file.name)}
          className="btn-ghost text-xs px-3 py-1.5 text-red-500 hover:bg-red-50"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

export default function GeoFiles() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await filesApi.list(p)
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page])

  const uploadFile = async (file) => {
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    setUploading(true)
    try {
      const { data: newFile } = await filesApi.upload(fd)
      toast.success(`"${file.name}" uploaded`)
      setData(d => ({ ...d, results: [newFile, ...d.results], count: d.count + 1 }))
    } catch (err) {
      const msg = err.response?.data?.file || err.response?.data?.detail || 'Upload failed'
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setUploading(false)
    }
  }

  const deleteFile = async (pk, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await filesApi.delete(pk)
      toast.success('File deleted')
      setData(d => ({ ...d, results: d.results.filter(f => f.id !== pk), count: d.count - 1 }))
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const totalPages = Math.ceil(data.count / 20)

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Geo Files</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Upload geo data files — each gets a permanent public URL
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-primary"
        >
          {uploading ? <Spinner size={15} /> : <Upload size={15} />}
          {uploading ? 'Uploading…' : 'Upload file'}
        </button>
        <input
          ref={fileRef} type="file" className="hidden"
          onChange={(e) => uploadFile(e.target.files[0])}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-2xl p-10 text-center mb-7 transition-all cursor-pointer select-none',
          dragOver
            ? 'border-primary-400 bg-primary-50 scale-[1.01]'
            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
        )}
      >
        <Upload size={30} className={clsx('mx-auto mb-2.5 transition-colors', dragOver ? 'text-primary-500' : 'text-gray-300')} />
        <p className={clsx('text-sm font-semibold transition-colors', dragOver ? 'text-primary-700' : 'text-gray-500')}>
          Drop your file here, or click to browse
        </p>
        <p className="text-xs text-gray-400 mt-1.5">
          GeoJSON · Shapefile · CSV · KML · GPX · PDF · Images · ZIP — max 50 MB
        </p>
        <p className="text-xs text-primary-500 font-medium mt-3">
          Every file gets a shareable public URL instantly
        </p>
      </div>

      {/* Files grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size={30} className="text-primary-600" />
        </div>
      ) : data.results.length === 0 ? (
        <div className="card text-center py-20">
          <FolderOpen size={44} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No files yet</p>
          <p className="text-gray-300 text-sm mt-1">Upload your first geo data file above</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">{data.count} file{data.count !== 1 ? 's' : ''}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.results.map(f => (
              <FileCard key={f.id} file={f} onDelete={deleteFile} />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={!data.previous || loading}
            className="btn-secondary px-3"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!data.next || loading}
            className="btn-secondary px-3"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </Layout>
  )
}
