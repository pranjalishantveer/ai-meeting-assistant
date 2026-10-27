import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

const ROUTES = { login: '/login', signup: '/signup', app: '/dashboard' }

const FEATURES = [
  {
    title: 'Any format',
    text: 'Upload mp3, wav, ogg, m4a, webm, flac, opus and more. No converting needed.',
  },
  {
    title: 'Clear transcripts',
    text: 'Accurate English text, even from recordings in other spoken languages.',
  },
  {
    title: 'Fast turnaround',
    text: 'Most recordings are transcribed in well under a minute.',
  },
]

const STEPS = [
  { title: 'Upload', text: 'Drop in a meeting recording.' },
  { title: 'Transcribe', text: 'The audio is turned into text automatically.' },
  { title: 'Read', text: 'Open the finished transcript from your dashboard.' },
]

function HomePage() {
  const { state } = useAuth()
  const authed = state.kind === 'authed'

  return (
    <div className="lp">
      <header className="lp-nav">
        <Link to="/" className="lp-brand">
          <Logo />
          <span>Meeting Assistant</span>
        </Link>
        <nav className="lp-nav-links">
          <ThemeToggle />
          {authed ? (
            <Link className="lp-btn lp-btn-primary" to={ROUTES.app}>Open dashboard</Link>
          ) : (
            <>
              <Link className="lp-link" to={ROUTES.login}>Log in</Link>
              <Link className="lp-btn lp-btn-primary" to={ROUTES.signup}>Sign up</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="lp-hero">
          <span className="lp-pill">Powered by Whisper AI</span>
          <h1 className="lp-title">
            Turn recordings into transcripts, <span className="lp-accent">in minutes.</span>
          </h1>
          <p className="lp-sub">
            Upload a meeting recording and get an accurate English transcript back in minutes.
          </p>
          <div className="lp-cta">
            <Link className="lp-btn lp-btn-primary lp-btn-lg" to={authed ? ROUTES.app : ROUTES.signup}>
              {authed ? 'Go to your recordings' : 'Get started free'}
            </Link>
            {!authed && (
              <Link className="lp-btn lp-btn-ghost lp-btn-lg" to={ROUTES.login}>
                I already have an account
              </Link>
            )}
          </div>

          <div className="lp-demo" aria-hidden="true">
            <div className="lp-demo-head">
              <div>
                <div className="lp-demo-title">Weekly product sync</div>
                <div className="lp-demo-meta">Today, 10:30 AM · English</div>
              </div>
              <span className="lp-demo-badge">Done</span>
            </div>
            <p className="lp-demo-line">The team reviewed next week's plan.</p>
            <p className="lp-demo-line">The launch date was set for Friday.</p>
            <p className="lp-demo-line lp-demo-fade">The design review will happen on Monday.</p>
          </div>
        </section>

        <section className="lp-section">
          <h2 className="lp-h2">Everything you need, nothing you don't</h2>
          <div className="lp-grid">
            {FEATURES.map((f) => (
              <div className="lp-card" key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lp-section">
          <h2 className="lp-h2">How it works</h2>
          <div className="lp-grid">
            {STEPS.map((s, i) => (
              <div className="lp-card" key={s.title}>
                <div className="lp-step">{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="lp-footer">© {new Date().getFullYear()} Meeting Assistant</footer>
    </div>
  )
}

export default HomePage