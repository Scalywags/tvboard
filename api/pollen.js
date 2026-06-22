export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const key = process.env.GOOGLE_API_KEY
  if (!key) return res.status(500).json({ error: 'GOOGLE_API_KEY not set' })

  const { lat, lon } = req.query
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' })

  const url =
    `https://pollen.googleapis.com/v1/forecast:lookup` +
    `?location.longitude=${lon}&location.latitude=${lat}&days=1&key=${key}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    res.status(200).json(data)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}