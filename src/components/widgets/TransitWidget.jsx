import { useState, useCallback } from 'react'
import { useInterval } from '../../hooks/useInterval'
import cfg from '../../lib/config'

const REFRESH_MS = 5 * 60 * 1000

function isCommuteTime() {
  const now = new Date()
  const dow  = now.getDay()   // 0=Sun
  const hour = now.getHours()
  return dow >= 1 && dow <= 5 && hour >= 5 && hour < 12
}

async function getRoutes(origin, dest, mode = 'driving', alternatives = false) {
  const url = `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${encodeURIComponent(origin)}` +
    `&destination=${encodeURIComponent(dest)}` +
    `&mode=${mode}&departure_time=now` +
    `${alternatives ? '&alternatives=true' : ''}` +
    `&key=${cfg.googleKey}`
  const res  = await fetch(url)
  const data = await res.json()
  return data.routes || []
}

export default function TransitWidget() {
  const [routes, setRoutes]   = useState([])
  const [label, setLabel]     = useState('Transit')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetch_ = useCallback(async () => {
    if (!cfg.googleKey) {
      setError('Add VITE_GOOGLE_API_KEY to .env')
      setLoading(false)
      return
    }

    try {
      if (isCommuteTime()) {
        setLabel('Commute to Work')
        const rs = await getRoutes(cfg.home, cfg.work, 'driving', true)
        const sorted = rs
          .map(r => ({
            name:    'Via ' + r.summary,
            mins:    Math.round((r.legs[0].duration_in_traffic?.value || r.legs[0].duration?.value || 0) / 60),
            summary: r.summary,
          }))
          .sort((a,b) => a.mins - b.mins)
          .slice(0, 3)
        setRoutes(sorted)
      } else {
        setLabel('Getting around')
        const [milburnRs, downtownRs] = await Promise.all([
          getRoutes(cfg.home, cfg.milburn, 'driving'),
          getRoutes(cfg.home, cfg.downtown, 'driving'),
        ])
        const pick = rs => {
          if (!rs.length) return '–'
          const r = rs[0]
          return Math.round((r.legs[0].duration_in_traffic?.value || r.legs[0].duration?.value || 0) / 60)
        }
        setRoutes([
          { name: 'Milburn Park',    mins: pick(milburnRs),   summary: 'Northwest Austin' },
          { name: 'Downtown Austin', mins: pick(downtownRs),  summary: 'Congress Ave' },
        ])
      }
      setError(null)
    } catch(e) {
      setError(e.message)
    }
    setLoading(false)
  }, [])

  useState(() => { fetch_() }, [])
  useInterval(fetch_, REFRESH_MS)

  return (
    <div className="card" style={{ gridArea: 'transit', gap: 10 }}>
      <div className="card-label">{label}</div>

      {loading && (
        [1,2,3].map(i => <div key={i} className="shimmer" style={{ height:52 }} />)
      )}

      {error && <div className="err-text">{error}</div>}

      {!loading && !error && routes.map((r, i) => (
        <div key={i} style={{ ...s.route, ...(i===0 ? s.routeBest : {}) }}>
          <div style={s.rank}>{i+1}</div>
          <div style={s.info}>
            <div style={s.name}>{r.name}</div>
            <div style={s.via}>via {r.summary}</div>
          </div>
          <div style={s.dur}>
            {r.mins}<span style={s.durUnit}> min</span>
          </div>
        </div>
      ))}

      {!loading && !error && (
        <div style={s.updated}>
          Updated {new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}
        </div>
      )}
    </div>
  )
}

const s = {
  route:    { display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
              borderRadius:9, border:'1px solid var(--border-light)', background:'var(--bg)' },
  routeBest:{ borderColor:'var(--accent)', background:'var(--accent-light)' },
  rank:     { fontFamily:'var(--mono)', fontSize:10, color:'var(--text-4)', width:16, textAlign:'center', flexShrink:0 },
  info:     { flex:1 },
  name:     { fontSize:12, color:'var(--text-7)', fontWeight:500 },
  via:      { fontSize:10, color:'var(--text-4)', marginTop:1 },
  dur:      { fontFamily:"'Times New Roman',serif", fontSize:'1.5rem', color:'var(--text-8)',
              letterSpacing:'-0.02em', fontWeight:400 },
  durUnit:  { fontSize:10, color:'var(--text-4)', fontFamily:'var(--mono)', fontWeight:400 },
  updated:  { fontFamily:'var(--mono)', fontSize:8, color:'var(--text-4)',
              letterSpacing:'0.06em', textTransform:'uppercase', alignSelf:'flex-end' },
}
