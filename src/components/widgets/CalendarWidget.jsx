import { useState, useCallback } from 'react'
import { useInterval } from '../../hooks/useInterval'

const REFRESH_MS = 10 * 60 * 1000
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTHS_FULL = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December']

function buildMonth(year, month, today, eventDays) {
  const firstDow    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const prevDays    = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = firstDow-1; i >= 0; i--) {
    cells.push({ day: prevDays - i, other: true })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    const hasEv   = eventDays.has(`${year}-${month}-${d}`)
    cells.push({ day: d, isToday, hasEv })
  }
  let next = 1
  const total = Math.ceil((firstDow + daysInMonth) / 7) * 7
  for (let i = firstDow + daysInMonth; i < total; i++) {
    cells.push({ day: next++, other: true })
  }
  return cells
}

export default function CalendarWidget({ googleToken, calendarId = 'primary' }) {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const today = new Date()

  const fetchEvents = useCallback(async () => {
    if (!googleToken) { setLoading(false); return }
    try {
      const start = today.toISOString()
      const end   = new Date(today.getFullYear(), today.getMonth()+2, 31).toISOString()
      const res   = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events` +
        `?timeMin=${start}&timeMax=${end}&singleEvents=true&orderBy=startTime&maxResults=50`,
        { headers: { Authorization: `Bearer ${googleToken}` } }
      )
      const data = await res.json()
      setEvents(data.items || [])
    } catch { /* silent */ }
    setLoading(false)
  }, [googleToken, calendarId])

  useState(() => { fetchEvents() }, [])
  useInterval(fetchEvents, REFRESH_MS)

  const eventDays = new Set()
  const upcoming  = []
  events.forEach(ev => {
    const start = ev.start?.dateTime || ev.start?.date
    if (!start) return
    const d = new Date(start)
    eventDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
    if (d >= today) upcoming.push({ title: ev.summary, start, allDay: !ev.start?.dateTime, color: ev.colorId })
  })
  upcoming.sort((a,b) => new Date(a.start) - new Date(b.start))

  const months = [
    { year: today.getFullYear(), month: today.getMonth() },
    { year: today.getFullYear(), month: today.getMonth()+1 > 11 ? 0 : today.getMonth()+1,
      yearAdj: today.getMonth()+1 > 11 ? 1 : 0 },
  ]

  return (
    <div className="card" style={{ gridArea: 'calendar', gap: 10, overflowY: 'auto' }}>
      <div className="card-label">Calendar</div>

      {months.map(({ year, month, yearAdj=0 }, mi) => {
        const y = year + yearAdj
        const cells = buildMonth(y, month % 12, today, eventDays)
        return (
          <div key={mi}>
            <div style={s.monthTitle}>{MONTHS_FULL[month % 12]} {y}</div>
            <div style={s.grid}>
              {DAYS.map(d => <div key={d} style={s.dow}>{d}</div>)}
              {cells.map((c, i) => (
                <div key={i} style={{
                  ...s.day,
                  ...(c.isToday ? s.today : {}),
                  ...(c.other   ? s.other : {}),
                }}>
                  {c.day}
                  {c.hasEv && <div style={{ ...s.dot, background: c.isToday ? 'rgba(255,255,255,0.7)' : 'var(--accent)' }} />}
                </div>
              ))}
            </div>
            {mi === 0 && <div style={s.divider} />}
          </div>
        )
      })}

      <div style={s.divider} />
      <div className="card-label">Upcoming</div>

      {loading ? (
        [80,60,70].map((w,i) => <div key={i} className="shimmer" style={{ height:38, width:`${w}%` }} />)
      ) : upcoming.length === 0 ? (
        <div className="err-text">
          {!googleToken ? 'Connect Google Calendar in .env to see events.' : 'No upcoming events.'}
        </div>
      ) : upcoming.slice(0, 8).map((ev, i) => {
        const d = new Date(ev.start)
        const dateStr = ev.allDay
          ? `${MONTHS[d.getMonth()]} ${d.getDate()}`
          : `${MONTHS[d.getMonth()]} ${d.getDate()} · ${d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}`
        return (
          <div key={i} style={s.evItem}>
            <div style={s.evDate}>{dateStr}</div>
            <div style={s.evTitle}>{ev.title || 'Untitled'}</div>
          </div>
        )
      })}
    </div>
  )
}

const s = {
  monthTitle: { fontFamily:"'Times New Roman',serif", fontSize:13, fontWeight:600,
                letterSpacing:'-0.01em', color:'var(--text-7)', marginBottom:6 },
  grid:       { display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 },
  dow:        { fontFamily:'var(--mono)', fontSize:8, textTransform:'uppercase',
                color:'var(--text-4)', textAlign:'center', padding:'2px 0', letterSpacing:'0.05em' },
  day:        { aspectRatio:1, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, borderRadius:'50%', color:'var(--text-6)', position:'relative' },
  today:      { background:'var(--accent)', color:'#fff', fontWeight:600 },
  other:      { color:'var(--text-4)' },
  dot:        { position:'absolute', bottom:1, width:4, height:4, borderRadius:'50%' },
  divider:    { height:1, background:'var(--border-light)', margin:'4px 0' },
  evItem:     { display:'flex', alignItems:'flex-start', gap:8, padding:'5px 8px',
                borderRadius:7, borderLeft:'3px solid var(--accent)', background:'var(--accent-light)' },
  evDate:     { fontFamily:'var(--mono)', fontSize:9, color:'var(--text-4)',
                whiteSpace:'nowrap', paddingTop:1, minWidth:52 },
  evTitle:    { fontSize:11, color:'var(--text-7)', lineHeight:1.35 },
}
