export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get('genre') || 'All'

  const today = new Date().toISOString().split('T')[0]
  const future = new Date()
  future.setMonth(future.getMonth() + 6)
  const futureDate = future.toISOString().split('T')[0]

  const url = `https://musicbrainz.org/ws/2/release?query=date:[${today}+TO+${futureDate}]+AND+status:official+AND+type:album&limit=50&fmt=json`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'BangerRatios/1.0 (contact@bangerratios.com)' }
  })
  const data = await res.json()
  const releases = (data.releases || []).filter(r => {
    if (!r.date) return false
    return new Date(r.date) > new Date()
  })

  const enriched = await Promise.all(
    releases.map(async (r) => {
      try {
        const artist = r['artist-credit']?.[0]?.artist?.name || ''
        const term = encodeURIComponent(`${r.title} ${artist}`)
        const res2 = await fetch(
          `https://itunes.apple.com/search?term=${term}&entity=album&limit=1`
        )
        const d = await res2.json()
        const match = d.results?.[0]
        return {
          id: r.id,
          name: r.title,
          artist,
          release_date: r.date,
          itunesId: match?.collectionId || null,
          genre: match?.primaryGenreName || null,
          artwork: match?.artworkUrl100?.replace('100x100', '300x300') || null,
        }
      } catch {
        return {
          id: r.id,
          name: r.title,
          artist: r['artist-credit']?.[0]?.artist?.name || '',
          release_date: r.date,
          itunesId: null, genre: null, artwork: null,
        }
      }
    })
  )

  const sorted = enriched.sort((a, b) => new Date(a.release_date) - new Date(b.release_date))
  const final = genre === 'All' ? sorted : sorted.filter(a => a.genre?.toLowerCase().includes(genre.toLowerCase()))

  return Response.json({ releases: final })
}