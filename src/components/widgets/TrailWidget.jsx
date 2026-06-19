import cfg from '../../lib/config'

export default function TrailWidget() {
  const src = 
    `https://www.trailforks.com/widgets/trailreports/` +
    `?rid=29899` +
    `&activitytype=1` +
    `&d=0` +
    `&c=1` +
    `&cl=0` +
    `&p=0` +
    `&active=0` +
    `&status=[1,2,3,4]` +
    `&count=5` +
    `&officialonly=0` +
    `&workonly=0` +
    `&unsanctioned=0`

  return (
    <div style={{
      gridArea: 'trail',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      border: '1px solid var(--border-light)',
      background: 'var(--card)',
    }}>
      <iframe
        src={src}
        title="Trail Reports"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  )
}