import { useState, useCallback, useEffect } from 'react'
import { useInterval } from '../../hooks/useInterval'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import cfg from '../../lib/config'

const HISTORY_REFRESH_MS = 6 * 60 * 60 * 1000

function getDateRange() {
  const end   = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 14)
  return {
    start: start.toISOString().split('T')[0],
    end:   end.toISOString().split('T')[0],
  }
}

function pollenBadgeStyle(v) {
  if (!v || v < 10)  return { bg: '#dcfce7', color: '#166534' }
  if (v < 50)        return { bg: '#fef9c3', color: '#713f12' }
  if (v < 200)       return { bg: '#fee2e2', color: '#991b1b' }
  return               { bg: '#f5d0fe', color: '#6b21a8' }
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border-light)',
      borderRadius: 8, padding: '6px 10px', fontSize: 10,
      fontFamily: 'var(--mono)', color: 'var(--text-6)',
    }}>
      <div style={{ marginBottom: 4, color: 'var(--text-4)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {Math.round(p.value)} g/m³
        </div>
      ))}
    </div>
  )
}

export default function AlertsWidget({ pollen = {}, alert = null }) {
  const [history, setHistory]           = useState([])
  const [histLoading, setHistLoading]   = useState(true)
  const [histError, setHistError]       = useState(null)

  const fetchHistory = useCallback(async () => {
    setHistLoading(true)
    setHistError(null)
    try {
      const { start, end } = getDateRange()
      const url = (
        `https://air-quality-api.open-meteo.com/v1/air-quality` +
        `?latitude=${cfg.lat}&longitude=${cfg.lon}` +
        `&hourly=grass_pollen,birch_pollen` +
        `&start_date=${start}&end_date=${end}` +
        `&timezone=${encodeURIComponent(cfg.tz)}`
      )

      const res = await fetch(url)
      if (!res.ok) {
        setHistError(`API error ${res.status}`)
        setHistLoading(false)
        return
      }

      const data = await res.json()
      if (!data.hourly) {
        setHistError('No hourly data returned')
        setHistLoading(false)
        return
      }

      const hourly = data.hourly
      const days   = {}
      hourly.time.forEach((iso, i) => {
        const day = iso.split('T')[0]
        if (!days[day]) days[day] = { grass: [], birch: [] }
        if (hourly.grass_pollen[i] != null) days[day].grass.push(hourly.grass_pollen[i])
        if (hourly.birch_pollen[i] != null) days[day].birch.push(hourly.birch_pollen[i])
      })

      const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

      const chartData = Object.entries(days).map(([date, v]) => {
        const d = new Date(date)
        return {
          date:  `${d.getMonth() + 1}/${d.getDate()}`,
          Grass: Math.round(avg(v.grass)),
          Birch: Math.round(avg(v.birch)),
        }
      })

      setHistory(chartData)
    } catch(e) {
      setHistError(e.message)
    }
    setHistLoading(false)
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])
  useInterval(fetchHistory, HISTORY_REFRESH_MS)

  return (
    <div className="card" style={{ gridArea: 'alerts', gap: 10 }}>
      <div className="card-label">Pollen + Alerts</div>

      {alert && (
        <div style={s.govAlert}>
          <div style={s.govAlertTitle}>⚠️ {alert.event}</div>
          <div style={s.govAlertBody}>{alert.headline}</div>
        </div>
      )}

      <div style={s.body}>
        {/* Left — 14-day graph */}
        <div style={s.graphWrap}>
          <div style={s.graphLabel}>14-day daily average (g/m³)</div>

          {histLoading && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <span className="err-text">Loading…</span>
            </div>
          )}

          {histError && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <span className="err-text">{histError}</span>
            </div>
          )}

          {!histLoading && !histError && history.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontFamily: 'var(--mono)', fontSize: 8, fill: 'var(--text-4)' }}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontFamily: 'var(--mono)', fontSize: 8, fill: 'var(--text-4)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ fontFamily: 'var(--mono)', fontSize: 9, paddingTop: 4 }}
                />
                <Line type="monotone" dataKey="Grass" stroke="#facc15" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="Birch" stroke="#4ade80" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Right — today's counts */}
        <div style={s.today}>
          <div style={s.todayLabel}>Today</div>
          {[
            ['Tree',  pollen.tree_pollen],
            ['Grass', pollen.grass_pollen],
            ['Weed',  pollen.weed_pollen],
          ].map(([label, val]) => {
            const badge = pollenBadgeStyle(val)
            return (
              <div key={label} style={s.pollenItem}>
                <div style={s.pollenType}>{label}</div>
                <div style={{ ...s.pollenCount, background: badge.bg, color: badge.color }}>
                  {val != null ? Math.round(val) : '–'}
                </div>
                <div style={s.pollenUnit}>g/m³</div>
              </div>
            )
          })}

          {!alert && (
            <div style={s.clear}>No active alerts.</div>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  body:          { display: 'flex', gap: 16, flex: 1, minHeight: 0 },
  graphWrap:     { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 160 },
  graphLabel:    { fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--text-4)',
                   textTransform: 'uppercase', letterSpacing: '0.08em' },
  today:         { display: 'flex', flexDirection: 'column', gap: 10, minWidth: 80,
                   paddingLeft: 16, borderLeft: '1px solid var(--border-light)',
                   justifyContent: 'center' },
  todayLabel:    { fontFamily: 'var(--mono)', fontSize: 8, textTransform: 'uppercase',
                   letterSpacing: '0.1em', color: 'var(--text-4)', marginBottom: 2 },
  pollenItem:    { display: 'flex', flexDirection: 'column', gap: 2 },
  pollenType:    { fontFamily: 'var(--mono)', fontSize: 8, textTransform: 'uppercase',
                   letterSpacing: '0.1em', color: 'var(--text-4)' },
  pollenCount:   { fontSize: 15, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                   display: 'inline-block', width: 'fit-content',
                   fontFamily: "'Times New Roman', serif" },
  pollenUnit:    { fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--text-4)' },
  govAlert:      { background: '#fff3cd', border: '1px solid #f5c542',
                   borderRadius: 8, padding: '8px 10px', flexShrink: 0 },
  govAlertTitle: { fontSize: 11, fontWeight: 600, color: '#7a5c00', marginBottom: 2 },
  govAlertBody:  { fontSize: 10, color: '#7a5c00', lineHeight: 1.4 },
  clear:         { fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-4)',
                   letterSpacing: '0.06em', marginTop: 4 },
}