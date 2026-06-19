import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.title}>The Board</div>
        <div style={styles.sub}>board.jackscalise.com</div>

        {sent ? (
          <p style={styles.sent}>
            Check your email for a magic link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={styles.input}
              autoFocus
            />
            {error && <div style={styles.error}>{error}</div>}
            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    width: '100vw', height: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)',
  },
  card: {
    background: 'var(--card)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius)',
    padding: '40px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '360px',
  },
  title: {
    fontFamily: "'Times New Roman', serif",
    fontSize: '1.8rem',
    letterSpacing: '-0.02em',
    color: 'var(--accent)',
    fontWeight: 400,
  },
  sub: {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    letterSpacing: '0.08em',
    color: 'var(--text-4)',
    marginBottom: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    fontFamily: 'var(--serif)',
    fontSize: '14px',
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    outline: 'none',
    color: 'var(--text-7)',
    background: 'var(--card)',
    width: '100%',
  },
  btn: {
    fontFamily: 'var(--serif)',
    fontSize: '14px',
    padding: '10px 16px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '4px',
  },
  error: {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    color: '#e11d48',
    letterSpacing: '0.04em',
  },
  sent: {
    fontFamily: 'var(--serif)',
    fontSize: '13px',
    color: 'var(--text-6)',
    lineHeight: 1.5,
  },
}
