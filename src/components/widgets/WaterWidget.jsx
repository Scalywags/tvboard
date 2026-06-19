import { useState, useCallback } from 'react'
import { useInterval } from '../../hooks/useInterval'

const REFRESH_MS = 60 * 60 * 1000

// Lake Travis: site 08154500, gage height ft (param 00065)
// Barton Springs: site 08155500, discharge cfs (param 00060)
const SITES = [
  {
    id:      '08154500',
    param:   '00065',
    label:   'Lake Travis',
    unit:    'ft',
    max:     25,    // approximate full-pool gage height
    color:   'var(--accent)',
  },
  {
    id:      '08155500',
    param:   '00060',
    label:   'Barton Springs',
    unit:    'cfs',
    max:     120,   // typical high-flow benchmark
    color:   '#3b82f6',
  },
]

function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})
}

export default function WaterWidget() {
  const [readings, setReadings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetch_ = useCallback(async () => {
    try {
      const results = await Promise.all(
        SITES.map(async site => {
          const res  = await fetch(
            `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${site.id}&parameterCd=${site.param}`
          )
          const data = await res.json()
          const ts   = data?.value?.timeSeries?.[0]
          const val  = parseFloat(ts?.values?.[0]?.value?.[0]?.value ?? 0)
          const time = ts?.values?.[0]?.value?.[0]?.dateTime
          return { ...site, val, time }
        })
      )
      setReadings(results)
      setError(null)
    } catch(e) {
      setError(e.message)
    }
    setLoading(false)
  }, [])

  useState(() => { fetch_() }, [])
  useInterval(fetch_, REFRESH_MS)

  return (
    <div className="card" style={{ gridArea: 'water', gap: 10 }}>
      <div className="card-label">Water Levels</div>

      {loading && [1,2].map(i => <div key={i} className="shimmer" style={{ height:42 }} />)}
      {error   && <div className="err-text">Unavailable — {error}</div>}

      {!loading && !error && readings.map(r => (
        <div key={r.id} style={s.row}>
          <div style={s.header}>
            <span style={s.name}>{r.label}</span>
            <span style={{ ...s.val, color: r.color }}>
              {r.val.toFixed(r.unit==='ft'?1:0)} {r.unit}
            </span>
          </div>
          <div style={s.track}>
            <div style={{
              ...s.fill,
              width: `${Math.min(100, Math.max(0, (r.val / r.max) * 100))}%`,
              background: r.color,
            }} />
          </div>
          <div style={s.meta}>
            {r.time ? `as of ${fmtTime(r.time)}` : ''}
            {r.id === '08154500' && (
              <span style={{ marginLeft:8, color:'var(--text-5)' }}>
                · LCRA gage height
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const s = {
  row:    { display:'flex', flexDirection:'column', gap:4 },
  header: { display:'flex', justifyContent:'space-between', alignItems:'baseline' },
  name:   { fontSize:12, fontWeight:600, color:'var(--text-7)' },
  val:    { fontFamily:'var(--mono)', fontSize:12 },
  track:  { height:5, background:'var(--border-light)', borderRadius:3, overflow:'hidden' },
  fill:   { height:'100%', borderRadius:3, transition:'width 0.5s ease' },
  meta:   { fontFamily:'var(--mono)', fontSize:8, color:'var(--text-4)', letterSpacing:'0.06em' },
}
