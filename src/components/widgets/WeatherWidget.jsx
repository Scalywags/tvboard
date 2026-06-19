import { useState, useCallback, useEffect } from 'react'
import { useInterval } from '../../hooks/useInterval'
import cfg from '../../lib/config'

const REFRESH_MS = 15 * 60 * 1000

export const WX_ICON = {
  0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',
  51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',
  71:'🌨️',73:'🌨️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',
  95:'⛈️',96:'⛈️',99:'⛈️',
}
export const WX_DESC = {
  0:'Clear',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Foggy',48:'Icy fog',
  51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',
  71:'Light snow',73:'Snow',75:'Heavy snow',80:'Showers',81:'Heavy showers',82:'Violent showers',
  95:'Thunderstorm',96:'Thunderstorm',99:'Heavy thunderstorm',
}
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function WeatherWidget({ onData, onSummary }) {
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [local, setLocal]     = useState(null)

  const fetch_ = useCallback(async () => {
    try {
      const [wxRes, alertRes] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${cfg.lat}&longitude=${cfg.lon}` +
          `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max` +
          `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=${encodeURIComponent(cfg.tz)}&forecast_days=7`
        ),
        fetch(`https://api.weather.gov/alerts/active?point=${cfg.lat},${cfg.lon}`),
      ])
      const wx  = await wxRes.json()
      const nws = await alertRes.json()

      let pollen = {}
      try {
        const aqRes = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality` +
          `?latitude=${cfg.lat}&longitude=${cfg.lon}` +
          `&current=grass_pollen,tree_pollen,weed_pollen,us_aqi` +
          `&timezone=${encodeURIComponent(cfg.tz)}`
        )
        if (aqRes.ok) {
          const aqData = await aqRes.json()
          if (aqData?.current) pollen = aqData.current
        }
      } catch { /* pollen unavailable */ }

      const alert = nws.features?.[0]?.properties || null
      const payload = { wx, pollen, alert }

      setLocal(payload)
      onData?.(payload)
      onSummary?.(`${Math.round(wx.current.temperature_2m)}°F, ${WX_DESC[wx.current.weather_code] || ''}`)
    } catch(e) {
      setError(e.message)
    }
    setLoading(false)
  }, [onData, onSummary])

  useEffect(() => { fetch_() }, [fetch_])
  useInterval(fetch_, REFRESH_MS)

  if (loading) return (
    <div className="card" style={{ gridArea: 'weather' }}>
      <div className="card-label">Round Rock, TX</div>
      {[60,100,80,100,70].map((w,i) => (
        <div key={i} className="shimmer" style={{ height: i===0?40:14, width:`${w}%`, marginBottom:4 }} />
      ))}
    </div>
  )

  if (error) return (
    <div className="card" style={{ gridArea: 'weather' }}>
      <div className="card-label">Round Rock, TX</div>
      <div className="err-text">Weather unavailable — {error}</div>
    </div>
  )

  const { wx } = local
  const cur  = wx.current
  const day  = wx.daily
  const code = cur.weather_code

  return (
    <div className="card" style={{ gridArea: 'weather', gap: 10 }}>
      <div className="card-label">Round Rock, TX</div>

      <div style={s.current}>
        <div style={s.icon}>{WX_ICON[code] || '🌡️'}</div>
        <div>
          <div style={s.temp}>
            {Math.round(cur.temperature_2m)}°
            <span style={s.tempUnit}>F</span>
          </div>
          <div style={s.desc}>
            {WX_DESC[code] || ''} · feels {Math.round(cur.apparent_temperature)}°
          </div>
        </div>
      </div>

      <div style={s.statGrid}>
        {[
          ['Humidity', `${cur.relative_humidity_2m}%`],
          ['Wind',     `${Math.round(cur.wind_speed_10m)} mph`],
          ['Rain',     `${day.precipitation_probability_max[0]}%`],
          ['AQI',      local.pollen?.us_aqi ?? '–'],
        ].map(([label, val]) => (
          <div key={label} style={s.stat}>
            <div style={s.statLabel}>{label}</div>
            <div style={s.statVal}>{val}</div>
          </div>
        ))}
      </div>

      <div style={s.forecast}>
        {day.weather_code.map((wc, i) => {
          const d = new Date(day.time[i])
          return (
            <div key={i} style={s.fcDay}>
              <div style={s.fcDow}>{DAYS[d.getDay()]}</div>
              <div style={s.fcIcon}>{WX_ICON[wc] || '🌡️'}</div>
              <div style={s.fcHi}>{Math.round(day.temperature_2m_max[i])}°</div>
              <div style={s.fcLo}>{Math.round(day.temperature_2m_min[i])}°</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  current:  { display:'flex', alignItems:'center', gap:12 },
  icon:     { fontSize:'2.6rem', lineHeight:1, flexShrink:0 },
  temp:     { fontFamily:"'Times New Roman',serif", fontSize:'clamp(1.8rem,3vw,2.8rem)',
              fontWeight:400, letterSpacing:'-0.03em', color:'var(--text-8)', lineHeight:1 },
  tempUnit: { fontSize:'1rem', color:'var(--text-5)' },
  desc:     { fontSize:11, color:'var(--text-5)', marginTop:2, textTransform:'capitalize' },
  statGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6,
              paddingTop:6, borderTop:'1px solid var(--border-light)' },
  stat:     { display:'flex', flexDirection:'column', gap:2 },
  statLabel:{ fontFamily:'var(--mono)', fontSize:8, textTransform:'uppercase',
              letterSpacing:'0.1em', color:'var(--text-4)' },
  statVal:  { fontSize:13, color:'var(--text-7)', fontWeight:500 },
  forecast: { display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4,
              paddingTop:8, borderTop:'1px solid var(--border-light)' },
  fcDay:    { display:'flex', flexDirection:'column', alignItems:'center', gap:2 },
  fcDow:    { fontFamily:'var(--mono)', fontSize:8, textTransform:'uppercase',
              letterSpacing:'0.08em', color:'var(--text-4)' },
  fcIcon:   { fontSize:'1rem' },
  fcHi:     { fontSize:11, fontWeight:600, color:'var(--text-7)' },
  fcLo:     { fontSize:10, color:'var(--text-4)' },
}