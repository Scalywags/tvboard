import { useState, useCallback, useEffect } from 'react'
import { useInterval } from '../../hooks/useInterval'
import cfg from '../../lib/config'

const REFRESH_MS = 60 * 60 * 1000

const INDEX_LABEL = { 0:'None', 1:'Very Low', 2:'Low', 3:'Medium', 4:'High', 5:'Very High' }

function badgeStyle(index) {
  if (index === 0) return { bg: '#f1f5f9', color: '#94a3b8' }
  if (index <= 2)  return { bg: '#dcfce7', color: '#166534' }
  if (index === 3) return { bg: '#fef9c3', color: '#713f12' }
  if (index === 4) return { bg: '#fee2e2', color: '#991b1b' }
  return                   { bg: '#f5d0fe', color: '#6b21a8' }
}

export default function AlertsWidget({ alert = null }) {
  const [pollen, setPollen]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchPollen = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/pollen?lat=${cfg.lat}&lon=${cfg.lon}`)
      if (!res.ok) { setError(`Error ${res.status}`); setLoading(false); return }
      const data = await res.json()
      const day  = data.dailyInfo?.[0]
      if (!day)  { setError('No data'); setLoading(false); return }
      const types = {}
      day.pollenTypeInfo?.forEach(t => {
        types[t.code] = {
          index: t.indexInfo?.value ?? 0,
          label: t.displayName,
        }
      })
      setPollen(types)
    } catch(e) {
      setError(e.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPollen() }, [fetchPollen])
  useInterval(fetchPollen, REFRESH_MS)

  const types = [
    { key: 'TREE',  label: 'Tree' },
    { key: 'GRASS', label: 'Grass' },
    { key: 'WEED',  label: 'Weed' },
  ]

  return (
    <div className="card" style={{ gridArea: 'alerts', gap: 12 }}>
      <div className="card-label">Pollen + Alerts</div>

      {alert && (
        <div style={s.govAlert}>
          <div style={s.govAlertTitle}>⚠️ {alert.event}</div>
          <div style={s.govAlertBody}>{alert.headline}</div>
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 56 }} />)}
        </div>
      )}

      {error && <div className="err-text">{error}</div>}

      {!loading && !error && pollen && (
        <div style={s.pollenGrid}>
          {types.map(({ key, label }) => {
            const t     = pollen[key]
            const idx   = t?.index ?? 0
            const badge = badgeStyle(idx)
            return (
              <div key={key} style={{ ...s.pollenCard, background: badge.bg }}>
                <div style={{ ...s.pollenType, color: badge.color }}>{label}</div>
                <div style={{ ...s.pollenIndex, color: badge.color }}>
                  {idx}<span style={s.pollenOf}>/5</span>
                </div>
                <div style={{ ...s.pollenLabel, color: badge.color }}>
                  {INDEX_LABEL[idx] ?? '–'}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && !error && !pollen && (
        <div className="err-text">Add GOOGLE_API_KEY to Vercel env vars</div>
      )}

      {!alert && !loading && (
        <div style={s.clear}>No active weather alerts.</div>
      )}
    </div>
  )
}

const s = {
  pollenGrid:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  pollenCard:  { display: 'flex', flexDirection: 'column', alignItems: 'center',
                 gap: 4, padding: '12px 8px', borderRadius: 10 },
  pollenType:  { fontFamily: 'var(--mono)', fontSize: 9, textTransform: 'uppercase',
                 letterSpacing: '0.1em' },
  pollenIndex: { fontFamily: "'Times New Roman', serif", fontSize: '2rem',
                 fontWeight: 400, lineHeight: 1 },
  pollenOf:    { fontSize: '1rem', opacity: 0.5 },
  pollenLabel: { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.04em' },
  govAlert:    { background: '#fff3cd', border: '1px solid #f5c542',
                 borderRadius: 8, padding: '8px 10px' },
  govAlertTitle: { fontSize: 11, fontWeight: 600, color: '#7a5c00', marginBottom: 2 },
  govAlertBody:  { fontSize: 10, color: '#7a5c00', lineHeight: 1.4 },
  clear:       { fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-4)',
                 letterSpacing: '0.06em' },
}