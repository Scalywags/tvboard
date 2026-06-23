import { useState, useEffect } from 'react'

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function pad(n) { return String(n).padStart(2,'0') }

export default function DateTimeWidget() {
  const [now, setNow]     = useState(new Date())
  const [secs, setSecs]   = useState(new Date().getSeconds())

  // Minute-synced tick for the clock display
  useEffect(() => {
    const msUntilNextMinute = 60000 - (Date.now() % 60000)
    let interval
    const timeout = setTimeout(() => {
      setNow(new Date())
      interval = setInterval(() => setNow(new Date()), 60000)
    }, msUntilNextMinute)
    return () => { clearTimeout(timeout); clearInterval(interval) }
  }, [])

  // Second-level tick just for the progress bar
  useEffect(() => {
    const id = setInterval(() => setSecs(new Date().getSeconds()), 1000)
    return () => clearInterval(id)
  }, [])

  const rawH = now.getHours()
  const hh   = pad(rawH > 12 ? rawH - 12 : rawH === 0 ? 12 : rawH)
  const mm   = pad(now.getMinutes())
  const ampm = rawH >= 12 ? 'PM' : 'AM'
  const dow  = DAYS[now.getDay()]
  const mon  = MONTHS[now.getMonth()]
  const d    = pad(now.getDate())
  const mN   = pad(now.getMonth() + 1)
  const y    = now.getFullYear()

  const pct = (secs / 60) * 100

  return (
    <div className="card" style={{
      ...styles.card,
      background: `linear-gradient(to right, #1e3457 ${pct}%, var(--accent) ${pct}%)`,
    }}>
      <div style={styles.row}>
        <div style={styles.time}>
          {hh}:{mm}<span style={styles.ampm}> {ampm}</span>
        </div>
        <div style={styles.right}>
          <div style={styles.date}>{dow}, {mon} {parseInt(d)}</div>
          <div style={styles.dateMono}>{d}-{mN}-{y}</div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    borderColor: 'var(--accent-dark)',
    justifyContent: 'center',
    transition: 'background 0.5s linear',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  time: {
    fontFamily: "'Times New Roman', serif",
    fontSize: 'clamp(2.2rem, 4vw, 3.6rem)',
    fontWeight: 400,
    letterSpacing: '-0.03em',
    color: '#fff',
    lineHeight: 1,
  },
  ampm: {
    fontSize: '1.2rem',
    opacity: 0.6,
    letterSpacing: '0.02em',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  date: {
    fontFamily: "'Times New Roman', serif",
    fontSize: '16px',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: '0.01em',
  },
  dateMono: {
    fontFamily: 'var(--mono)',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: '0.06em',
  },
}