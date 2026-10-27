import { useEffect, useState } from 'react'
import type { MeetingDetail } from './types'

type Props = {
  meetingId: string | null
  meetingTitle: string | null
}

type DetailState =
  | { kind: 'empty' }
  | { kind: 'loading' }
  | { kind: 'loaded'; detail: MeetingDetail }
  | { kind: 'error'; message: string }

function DetailPanel({ meetingId, meetingTitle }: Props) {
  const [state, setState] = useState<DetailState>({ kind: 'empty' })

  useEffect(() => {
    if (!meetingId) {
      setState({ kind: 'empty' })
      return
    }

    let cancelled = false
    setState({ kind: 'loading' })

    fetch(`/api/meetings/${meetingId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`)
        return res.json() as Promise<MeetingDetail>
      })
      .then((detail) => {
        if (!cancelled) setState({ kind: 'loaded', detail })
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ kind: 'error', message: err.message })
      })

    return () => {
      cancelled = true
    }
  }, [meetingId])

  return (
    <aside className="detail-panel">
      <h2 className="panel-heading">Transcript</h2>

      {state.kind === 'empty' && (
        <p className="muted">Select a transcribed recording to read it here.</p>
      )}
      {state.kind === 'loading' && <p className="muted">Loading…</p>}
      {state.kind === 'error' && <p className="error-text">Couldn't load transcript: {state.message}</p>}

      {state.kind === 'loaded' && (
        <>
          <p className="detail-title">{meetingTitle}</p>
          {state.detail.segments.length === 0 ? (
            <p className="muted">No transcript text was returned.</p>
          ) : (
            <div className="transcript-scroll">
              {state.detail.segments.map((seg) => (
                <p key={seg.id} className="transcript-segment">
                  {seg.text}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </aside>
  )
}

export default DetailPanel
