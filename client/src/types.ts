export type User = {
  id: string
  name: string
  email: string
}

export type Meeting = {
  id: string
  title: string
  status: string
  audioPath: string
  language: string
  createdAt: string
}

export type TranscriptSegment = {
  id: string
  text: string
  startMs: number | null
  speaker: string | null
}

export type MeetingDetail = Meeting & {
  segments: TranscriptSegment[]
}

export type LanguageOption = {
  code: string
  label: string
}
