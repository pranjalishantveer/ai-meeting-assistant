import type { ListState } from './useMeetings'
import type { Meeting } from './types'
import { formatRelativeTime } from './format'

type Props = {
  listState: ListState
  selectedId: string | null
  onSelect: (meeting: Meeting) => void
}

function StatusTag({ status }: { status: string }) {
  if (status === 'done') return <span className="tag done">Transcribed</span>
  if (status === 'failed') return <span className="tag failed">Failed</span>
  return (
    <span className="tag working">
      <span className="spinner" />
      {status === 'transcribing' ? 'Transcribing' : 'Pending'}
    </span>
  )
}

function RecordingList({ listState, selectedId, onSelect }: Props) {
  if (listState.kind === 'loading') {
    return <p className="muted">Loading…</p>
  }

  if (listState.kind === 'error') {
    return <p className="error-text">Couldn't load recordings: {listState.message}</p>
  }

  if (listState.meetings.length === 0) {
    return (
      <div className="empty-state">
        <p>No recordings yet.</p>
        <p className="muted">Upload your first one above to get started.</p>
      </div>
    )
  }

  return (
    <div className="recording-list">
      {listState.meetings.map((m) => {
        const clickable = m.status === 'done'
        return (
          <div
            key={m.id}
            className={`recording-row${clickable ? ' clickable' : ''}${selectedId === m.id ? ' selected' : ''}`}
            onClick={() => clickable && onSelect(m)}
          >
            <div className="recording-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M19 11a7 7 0 0 1-14 0M12 18v3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="recording-main">
              <div className="recording-title">{m.title}</div>
              <div className="recording-time">{formatRelativeTime(m.createdAt)}</div>
            </div>
            <StatusTag status={m.status} />
          </div>
        )
      })}
    </div>
  )
}

export default RecordingList
