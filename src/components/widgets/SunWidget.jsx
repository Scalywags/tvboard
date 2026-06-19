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
  return new Date(iso).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})
}

export default function SunWidget({ wx }) {
  if (!wx) return (
    <div className="card" style={{ gridArea: 'sun' }}>
      <div className="card-label">Sun</div>
      <div className="shimmer" style={{ height: 14 }} />
    </div>
  )

  const day     = wx.daily
  const uv      = day.uv_index_max[0]
  const sunrise = new Date(day.sunrise[0])
  const sunset  = new Date(day.sunset[0])
  const now     = new Date()
  const elapsed = Math.max(0, Math.min(1, (now - sunrise) / (sunset - sunrise)))
  const pct     = Math.round(elapsed * 100)

  return (
    <div className="card" style={{ gridArea: 'sun', gap: 12 }}>
      <div className="card-label">Sun</div>

      {/* Sun progress */}
      <div style={s.row}>
        <span style={s.timeLabel}>↑ {fmtTime(day.sunrise[0])}</span>
        <div style={s.track}>
          <div style={{ ...s.fill, width: `${pct}%` }}>
            <div style={s.dot}>☀️</div>
          </div>
        </div>
        <span style={s.timeLabel}>{fmtTime(day.sunset[0])} ↓</span>
      </div>

      {/* UV */}
      <div style={s.row}>
        <span style={s.uvLeft}>UV {Math.round(uv)}</span>
        <div style={s.uvTrack}>
          <div style={{
            ...s.uvThumb,
            left: `${Math.min(100,(uv/12)*100)}%`,
            borderColor: uvColor(uv),
          }} />
        </div>
        <span style={{ ...s.uvRight, color: uvColor(uv) }}>{uvLabel(uv)}</span>
      </div>
    </div>
  )
}

const s = {
  row:       { display:'flex', alignItems:'center', gap:10 },
  timeLabel: { fontFamily:'var(--mono)', fontSize:9, color:'var(--text-4)',
               whiteSpace:'nowrap', minWidth:60 },
  track:     { flex:1, height:6, borderRadius:3, background:'var(--border-light)',
               position:'relative', overflow:'visible' },
  fill:      { height:'100%', borderRadius:3, background:'var(--accent-light)',
               position:'relative', transition:'width 0.5s ease', minWidth:20 },
  dot:       { position:'absolute', right:-10, top:'50%', transform:'translateY(-50%)',
               fontSize:'1.1rem', lineHeight:1 },
  uvLeft:    { fontFamily:'var(--mono)', fontSize:10, color:'var(--text-5)',
               whiteSpace:'nowrap', minWidth:40 },
  uvTrack:   { flex:1, height:6, borderRadius:3, position:'relative',
               background:'linear-gradient(to right,#6dd400,#f5c400,#f87c00,#e50000,#7b0075)' },
  uvThumb:   { position:'absolute', top:-3, width:12, height:12, borderRadius:'50%',
               background:'var(--card)', border:'2px solid', transform:'translateX(-50%)',
               transition:'left 0.4s ease' },
  uvRight:   { fontFamily:'var(--mono)', fontSize:10, fontWeight:600,
               whiteSpace:'nowrap', minWidth:60, textAlign:'right' },
}