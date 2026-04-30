import { useState, useEffect, useRef } from 'react'
import { storageApi } from '../../api'
import Layout from '../../components/Layout'
import Spinner from '../../components/Spinner'
import {
  FolderOpen, Upload, Download, Trash2, FileText,
  Image, Archive, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { formatBytes, formatDate } from '../../utils/format'
import toast from 'react-hot-toast'

function FileIcon({ contentType }) {
  if (contentType?.startsWith('image/')) return <Image size={18} className="text-blue-500" />
  if (contentType === 'application/pdf') return <FileText size={18} className="text-red-500" />
  if (contentType?.includes('zip')) return <Archive size={18} className="text-yellow-500" />
  return <FileText size={18} className="text-gray-400" />
}

export default function Storage() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const { data: res } = await storageApi.list(p)
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
      await storageApi.upload(fd)
      toast.success(`"${file.name}" uploaded`)
      load(1)
      setPage(1)
    } catch (err) {
      const msg = err.response?.data?.file || err.response?.data?.detail || 'Upload failed'
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  const deleteFile = async (pk, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await storageApi.delete(pk)
      toast.success('File deleted')
      setData(d => ({ ...d, results: d.results.filter(f => f.id !== pk), count: d.count - 1 }))
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Storage</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{data.count} files</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-primary"
        >
          {uploading ? <Spinner size={16} /> : <Upload size={16} />}
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
        className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 transition-colors cursor-pointer
          ${dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={28} className={`mx-auto mb-2 ${dragOver ? 'text-primary-500' : 'text-gray-300'}`} />
        <p className={`text-sm font-medium ${dragOver ? 'text-primary-600' : 'text-gray-400'}`}>
          Drop files here or click to browse
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Max 50 MB · Images, PDF, CSV, Geo files</p>
      </div>

      {/* File list */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size={28} className="text-primary-600" /></div>
        ) : data.results.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">No files yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {/* Header row */}
            <div className="grid grid-cols-12 px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
              <div className="col-span-5">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Uploaded</div>
              <div className="col-span-1" />
            </div>
            {data.results.map(f => (
              <div key={f.id} className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <FileIcon contentType={f.content_type} />
                  <span className="text-sm font-medium text-gray-800 truncate">{f.name}</span>
                </div>
                <div className="col-span-2">
                  <span className="badge-gray text-xs">{f.content_type?.split('/')[1] || '—'}</span>
                </div>
                <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">{formatBytes(f.size)}</div>
                <div className="col-span-2 text-sm text-gray-500 dark:text-gray-400">{formatDate(f.created_at)}</div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <a
                    href={storageApi.downloadUrl(f.id)}
                    className="btn-ghost p-1.5 text-primary-600"
                    download title="Download"
                  >
                    <Download size={14} />
                  </a>
                  <button
                    onClick={() => deleteFile(f.id, f.name)}
                    className="btn-ghost p-1.5 text-red-500" title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data.count > 20 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => p - 1)} disabled={!data.previous || loading} className="btn-secondary px-3">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {Math.ceil(data.count / 20)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!data.next || loading} className="btn-secondary px-3">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </Layout>
  )
}
