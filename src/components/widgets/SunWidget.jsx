import { useState, useEffect } from 'react'

function uvColor(uv) {
  if (uv < 3)  return '#6dd400'
  if (uv < 6)  return '#f5c400'
  if (uv < 8)  return '#f87c00'
  if (uv < 11) return '#e50000'
  return '#7b0075'
}
function uvLabel(uv) {
  if (uv < 3)  return 'Low'
  if (uv < 6)  return 'Moderate'
  if (uv < 8)  return 'High'
  if (uv < 11) return 'Very High'
  return 'Extreme'
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function countdown(diff) {
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

export default function SunWidget({ wx, hourly }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60 * 1000)
    return () => clearInterval(id)
  }, [])

  if (!wx) return (
    <div className="card" style={{ gridArea: 'sun' }}>
      <div className="card-label">Sun</div>
      <div className="shimmer" style={{ height: 14 }} />
    </div>
  )

  const day           = wx.daily
  const uvMax         = day.uv_index_max[0]
  const sunrise       = new Date(day.sunrise[0])
  const sunset        = new Date(day.sunset[0])
  const nextSunrise   = day.sunrise[1] ? new Date(day.sunrise[1]) : null
  const now           = new Date()
  const isDay         = now >= sunrise && now <= sunset
  const beforeSunrise = !isDay && now < sunrise

  const sunriseTarget = beforeSunrise
    ? sunrise
    : (nextSunrise || new Date(sunrise.getTime() + 86400000))
  const sunriseLabel = beforeSunrise
    ? fmtTime(day.sunrise[0])
    : (nextSunrise ? fmtTime(day.sunrise[1]) : '')

  let currentUV = null
  let maxUVTime = null

  if (hourly?.time && hourly?.uv_index) {
    const nowMs = now.getTime()
    let closest = Infinity
    let maxVal  = -1

    hourly.time.forEach((iso, i) => {
      const t  = new Date(iso).getTime()
      const uv = hourly.uv_index[i] ?? 0

      const diff = Math.abs(t - nowMs)
      if (diff < closest) {
        closest   = diff
        currentUV = uv
      }

      const d = new Date(iso)
      const isSameDay = d.getDate() === now.getDate() && d.getMonth() === now.getMonth()
      if (isSameDay && uv > maxVal) {
        maxVal    = uv
        maxUVTime = iso
      }
    })
  }

  return (
    <div className="card" style={{ gridArea: 'sun', gap: 12 }}>
      <div className="card-label">Sun</div>

      {isDay ? (
        <div style={{ ...s.banner, background: '#fef9c3', borderColor: '#f5c542' }}>
          <div style={{ ...s.bannerTitle, color: '#713f12' }}>
            Sunset at {fmtTime(day.sunset[0])}, in {countdown(sunset - now)}
          </div>
        </div>
      ) : (
        <div style={{ ...s.banner, background: '#fef9c3', borderColor: '#f5c542' }}>
          <div style={{ ...s.bannerTitle, color: '#713f12' }}>
            Sunrise at {sunriseLabel}, in {countdown(sunriseTarget - now)}
          </div>
        </div>
      )}

      <div style={s.uvGrid}>
        <div style={s.uvStat}>
          <div style={s.uvStatLabel}>UV Now</div>
          <div style={{ ...s.uvStatVal, color: uvColor(currentUV ?? 0) }}>
            {currentUV != null ? currentUV : '–'}
          </div>
          <div style={{ ...s.uvStatSub, color: uvColor(currentUV ?? 0) }}>
            {currentUV != null ? uvLabel(currentUV) : ''}
          </div>
        </div>

        <div style={s.uvDivider} />

        <div style={s.uvStat}>
          <div style={s.uvStatLabel}>Daily Max</div>
          <div style={{ ...s.uvStatVal, color: uvColor(uvMax) }}>
            {uvMax}
          </div>
          <div style={{ ...s.uvStatSub, color: uvColor(uvMax) }}>
            {uvLabel(uvMax)}
          </div>
        </div>

        <div style={s.uvDivider} />

        <div style={s.uvStat}>
          <div style={s.uvStatLabel}>Peak Time</div>
          <div style={s.uvPeakTime}>
            {maxUVTime ? fmtTime(maxUVTime) : '–'}
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  banner:      { border: '1px solid', borderRadius: 8, padding: '10px 12px',
                 display: 'flex', flexDirection: 'column' },
  bannerTitle: { fontSize: 12, fontWeight: 600, fontFamily: "'Times New Roman', serif" },
  uvGrid:      { display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 8,
                 alignItems: 'center', paddingTop: 4,
                 borderTop: '1px solid var(--border-light)' },
  uvStat:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  uvStatLabel: { fontFamily: 'var(--mono)', fontSize: 8, textTransform: 'uppercase',
                 letterSpacing: '0.1em', color: 'var(--text-4)' },
  uvStatVal:   { fontFamily: "'Times New Roman', serif", fontSize: '1.8rem',
                 fontWeight: 400, lineHeight: 1 },
  uvStatSub:   { fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.04em' },
  uvPeakTime:  { fontFamily: "'Times New Roman', serif", fontSize: '1.1rem',
                 color: 'var(--text-7)', fontWeight: 400, textAlign: 'center' },
  uvDivider:   { width: 1, height: 40, background: 'var(--border-light)', alignSelf: 'center' },
}