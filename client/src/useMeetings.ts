import { useEffect, useRef, useState } from 'react'
import type { Meeting } from './types'

export type ListState =
  | { kind: 'loading' }
  | { kind: 'loaded'; meetings: Meeting[] }
  | { kind: 'error'; message: string }

const IN_PROGRESS_STATUSES = new Set(['pending', 'transcribing'])

export function useMeetings(refreshToken: number) {
  const [state, setState] = useState<ListState>({ kind: 'loading' })
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function fetchMeetings() {
    return fetch('/api/meetings')
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`)
        return res.json() as Promise<Meeting[]>
      })
      .then((meetings) => {
        setState({ kind: 'loaded', meetings })
        return meetings
      })
  }

  useEffect(() => {
    let cancelled = false
    setState({ kind: 'loading' })

    fetchMeetings().catch((err: Error) => {
      if (!cancelled) setState({ kind: 'error', message: err.message })
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken])

  useEffect(() => {
    if (state.kind !== 'loaded') return

    const stillWorking = state.meetings.some((m) => IN_PROGRESS_STATUSES.has(m.status))

    if (stillWorking && !pollRef.current) {
      pollRef.current = setInterval(() => {
        fetchMeetings().catch(() => {})
      }, 3000)
    }

    if (!stillWorking && pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return { state }
}
