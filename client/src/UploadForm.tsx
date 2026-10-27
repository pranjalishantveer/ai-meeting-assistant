import { useState, type DragEvent, type FormEvent } from 'react'
import type { Meeting } from './types'

type Props = {
  onUploaded: (meeting: Meeting) => void
}

type UploadState =
  | { kind: 'idle' }
  | { kind: 'uploading' }
  | { kind: 'error'; message: string }

function UploadForm({ onUploaded }: Props) {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<UploadState>({ kind: 'idle' })
  const [dragActive, setDragActive] = useState(false)

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) setFile(dropped)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!file) {
      setState({ kind: 'error', message: 'Choose an audio file first.' })
      return
    }

    setState({ kind: 'uploading' })

    const formData = new FormData()
    formData.append('audio', file)
    if (title.trim()) formData.append('title', title.trim())

    try {
      const res = await fetch('/api/meetings', { method: 'POST', body: formData })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message || `Upload failed with status ${res.status}`)
      }
      const meeting = (await res.json()) as Meeting
      onUploaded(meeting)
      setTitle('')
      setFile(null)
      setState({ kind: 'idle' })
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Upload failed',
      })
    }
  }

  return (
    <form id="upload-panel" onSubmit={handleSubmit} className="upload-card">
      <h2 className="upload-heading">New recording</h2>

      <div className="upload-fields">
        <div className="upload-field">
          <label className="upload-label" htmlFor="meeting-title">
            Title
          </label>
          <input
            id="meeting-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Meeting title (optional)"
            className="text-input"
          />
        </div>

        <div
          className={`dropzone${dragActive ? ' active' : ''}`}
          style={{ position: 'relative' }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
            }}
          />
          <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 15V4M12 4L8 8M12 4l4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="dropzone-text">
            {file ? file.name : 'Drag audio here, or click to browse'}
          </p>
        </div>
      </div>

      {state.kind === 'error' && <div className="upload-error">{state.message}</div>}

      <button
        type="submit"
        disabled={state.kind === 'uploading'}
        className={`upload-button${state.kind === 'uploading' ? ' uploading' : ''}`}
      >
        {state.kind === 'uploading' ? 'Uploading…' : 'Upload recording'}
      </button>
    </form>
  )
}

export default UploadForm