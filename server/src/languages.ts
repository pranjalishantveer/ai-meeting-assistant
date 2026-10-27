// Target languages the transcript can be produced in. "en" is the default --
// Whisper's translate mode natively outputs English from any spoken language,
// so that path needs no extra step. Any other target runs one extra
// translation pass through an LLM (see src/translate.ts).
export type LanguageOption = { code: string; label: string }

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'kn', label: 'Kannada' },
]

const BY_CODE = new Map(SUPPORTED_LANGUAGES.map((l) => [l.code, l]))

export function isSupportedLanguage(code: string): boolean {
  return BY_CODE.has(code)
}

export function languageLabel(code: string): string {
  return BY_CODE.get(code)?.label ?? code
}