const SEARCHES = [
  'new album 2025', 'new album 2026', 'album release 2025', 'album release 2026',
  'hip hop rap album 2025', 'hip hop album 2026',
  'pop album 2025', 'pop music 2026',
  'r&b soul album 2025', 'r&b album 2026',
  'rock album 2025', 'rock music 2026',
  'indie alternative 2025', 'alternative album 2026',
  'country album 2025', 'country music 2026',
  'electronic album 2025', 'electronic music 2026',
  'latin album 2025', 'latin pop 2026',
  'k-pop album 2025', 'kpop 2026',
]

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get('genre') || 'All'

  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 18)

  const results = await Promise.all(
    SEARCHES.map(term =>
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=album&limit=25&sort=recent`)
        .then(r => r.json())
        .then(d => d.results || [])
        .catch(() => [])
    )
  )

  const seen = new Set()
  const albums = results.flat()
    .filter(a => {
      if (!a.collectionId || !a.releaseDate) return false
      if (seen.has(a.collectionId)) return false
      if (new Date(a.releaseDate) < cutoff) return false
      // Only filter out true singles (1-2 tracks) and explicit single titles
      if (a.collectionType === 'Single') return false
      if (a.trackCount && a.trackCount <= 2) return false
      seen.add(a.collectionId)
      return true
    })
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))

  const GENRE_MAP = {
    'Hip-Hop/Rap': ['hip-hop', 'rap', 'hip hop', 'urban', 'trap'],
    'Pop': ['pop'],
    'R&B/Soul': ['r&b', 'soul', 'contemporary r&b'],
    'Rock': ['rock'],
    'Alternative': ['alternative', 'indie'],
    'Country': ['country', 'americana'],
    'Electronic': ['electronic', 'dance', 'edm', 'house', 'techno'],
    'Latin': ['latin', 'reggaeton'],
    'K-Pop': ['k-pop', 'korean'],
  }

  const filtered = genre === 'All'
    ? albums
    : albums.filter(a => {
        const g = (a.primaryGenreName || '').toLowerCase()
        const keywords = GENRE_MAP[genre] || [genre.toLowerCase()]
        return keywords.some(k => g.includes(k))
      })

  return Response.json({ albums: filtered })
}