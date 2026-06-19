import cfg from '../../lib/config'

export default function TrailWidget() {
  const src = `https://www.trailforks.com/widgets/trailreports/` +
    `?rid=${cfg.trailforksRid}` +
    `&activitytype=1,9` +  // mountain bike + hike
    `&d=5` +
    `&show_condition=1` +
    `&show_condition_label=1` +
    `&show_description=0` +
    `&show_photos=0` +
    `&noheader=0`

  return (
    <div style={{ gridArea: 'trail', borderRadius:'var(--radius)', overflow:'hidden',
                  border:'1px solid var(--border-light)', background:'var(--card)' }}>
      <iframe
        src={src}
        title="Trail Reports"
        style={{ width:'100%', height:'100%', border:'none', display:'block' }}
      />
    </div>
  )
}
