import type { ListState } from './useMeetings'

type Props = {
  listState: ListState
  connectionOk: boolean
}

function ReelMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="17" cy="17" r="15" stroke="#a855f7" strokeWidth="2" />
      <circle cx="17" cy="17" r="4.5" fill="#a855f7" />
      <circle cx="17" cy="7" r="2.2" fill="#a855f7" />
      <circle cx="26" cy="21.5" r="2.2" fill="#a855f7" />
      <circle cx="8" cy="21.5" r="2.2" fill="#a855f7" />
    </svg>
  )
}

function Sidebar({ listState, connectionOk }: Props) {
  const meetings = listState.kind === 'loaded' ? listState.meetings : []
  const total = meetings.length
  const completed = meetings.filter((m) => m.status === 'done').length
  const inProgress = meetings.filter((m) => m.status === 'pending' || m.status === 'transcribing').length

  function scrollToUpload() {
    const el = document.getElementById('upload-panel')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    document.getElementById('meeting-title')?.focus()
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <ReelMark />
        <span className="brand-title">Meeting Assistant</span>
      </div>

      <button type="button" className="cta-button" onClick={scrollToUpload}>
        <span className="cta-dot" />
        New recording
      </button>

      <div className="sidebar-stats">
        <div className="stat-row">
          <span className="stat-label">Total recordings</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">In progress</span>
          <span className="stat-value">{inProgress}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Transcribed</span>
          <span className="stat-value">{completed}</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <span className={`dot-indicator ${connectionOk ? 'ok' : 'err'}`} />
        <span>{connectionOk ? 'Server connected' : 'Server unreachable'}</span>
      </div>
    </aside>
  )
}

export default Sidebar
