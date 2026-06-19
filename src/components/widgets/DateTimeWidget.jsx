import { useState, useEffect } from 'react'

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function pad(n) { return String(n).padStart(2,'0') }

export default function DateTimeWidget() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
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

  return (
    <div className="card" style={styles.card}>
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
    background: 'var(--accent)',
    borderColor: 'var(--accent-dark)',
    justifyContent: 'center',
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