async function getSpotifyToken() {
  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  })
  const data = await res.json()
  console.log('Spotify token:', data.access_token ? 'OK' : 'FAILED', data.error || '')
  return data.access_token
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get('genre') || 'All'

  const token = await getSpotifyToken()
  if (!token) return Response.json({ albums: [], error: 'No token' })

  const res = await fetch(
    'https://api.spotify.com/v1/browse/new-releases?limit=50&country=US',
    { headers: { 'Authorization': `Bearer ${token}` } }
  )
  const data = await res.json()
  console.log('Spotify response status:', res.status)
  console.log('Albums returned:', data.albums?.items?.length)
  console.log('Spotify error:', data.error || 'none')

  const albums = data.albums?.items || []

  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 12)
  const filtered = albums.filter(a => new Date(a.release_date) >= cutoff)
  console.log('After 12mo filter:', filtered.length)

  return Response.json({ albums: filtered, debug: {
    total: albums.length,
    afterFilter: filtered.length,
    spotifyError: data.error || null
  }})
}
