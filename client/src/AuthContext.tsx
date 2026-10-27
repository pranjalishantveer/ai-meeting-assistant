import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from './types'

type AuthState =
  | { kind: 'loading' }
  | { kind: 'authed'; user: User }
  | { kind: 'anon' }

type AuthContextValue = {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null)
  return body?.message || fallback
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ kind: 'loading' })

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('not logged in')
        return res.json() as Promise<User>
      })
      .then((user) => setState({ kind: 'authed', user }))
      .catch(() => setState({ kind: 'anon' }))
  }, [])

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error(await parseErrorMessage(res, 'Login failed'))
    const user = (await res.json()) as User
    setState({ kind: 'authed', user })
  }

  async function signup(name: string, email: string, password: string) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) throw new Error(await parseErrorMessage(res, 'Signup failed'))
    const user = (await res.json()) as User
    setState({ kind: 'authed', user })
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setState({ kind: 'anon' })
  }

  return <AuthContext.Provider value={{ state, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider')
  return ctx
}