import { useState } from 'react'
import Sidebar from './Sidebar'
import UploadForm from './UploadForm'
import RecordingList from './RecordingList'
import DetailPanel from './DetailPanel'
import ThemeToggle from './ThemeToggle'
import { useMeetings } from './useMeetings'
import { timeOfDayGreeting } from './format'
import { useAuth } from './AuthContext'
import type { Meeting } from './types'

function Dashboard() {
  const { state: authState } = useAuth()
  const [refreshToken, setRefreshToken] = useState(0)
  const [selected, setSelected] = useState<Meeting | null>(null)

  const { state } = useMeetings(refreshToken)

  function handleUploaded(_meeting: Meeting) {
    setRefreshToken((n) => n + 1)
  }

  const total = state.kind === 'loaded' ? state.meetings.length : 0
  const userName = authState.kind === 'authed' ? authState.user.name : ''

  return (
    <div className="app-shell">
        <ThemeToggle />
      <Sidebar listState={state} connectionOk={state.kind === 'loaded'} />

      <main className="main">
        <UploadForm onUploaded={handleUploaded} />

        <div className="greeting-row">
          <div>
            <h1 className="greeting">
              {timeOfDayGreeting()}
              {userName ? `, ${userName.split(' ')[0]}` : ''}
            </h1>
            <p className="greeting-sub">
              {total === 0
                ? 'Upload your first recording to get started.'
                : `You have ${total} recording${total === 1 ? '' : 's'} on file.`}
            </p>
          </div>
        </div>

        <h2 className="section-heading">Recordings</h2>
        <RecordingList listState={state} selectedId={selected?.id ?? null} onSelect={setSelected} />
      </main>

      <DetailPanel meetingId={selected?.id ?? null} meetingTitle={selected?.title ?? null} />
    </div>
  )
}

export default Dashboard