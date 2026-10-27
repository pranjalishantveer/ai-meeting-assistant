import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

type Mode = 'login' | 'signup'

function AuthPage({ mode }: { mode: Mode }) {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isSignup = mode === 'signup'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isSignup) {
        await signup(name, email, password)
      } else {
        await login(email, password)
      }
      const from = (location.state as { from?: string } | null)?.from || '/dashboard'
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <Link to="/" className="lp-brand">
          <Logo />
          <span>Meeting Assistant</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="auth-card">
        <h1 className="auth-title">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-subtitle">
          {isSignup ? 'Start transcribing your recordings.' : 'Log in to see your recordings.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <div className="auth-field">
              <label className="auth-label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-input"
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-input"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-input"
              minLength={isSignup ? 8 : undefined}
              required
            />
            {isSignup && <p className="auth-hint">At least 8 characters.</p>}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" disabled={submitting} className="auth-submit">
            {submitting ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? (
            <>
              Already have an account? <Link to="/login">Log in</Link>
            </>
          ) : (
            <>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default AuthPage