'use client'
import { useState, useEffect } from 'react'

const GENRES = ['All','Hip-Hop/Rap','Pop','R&B/Soul','Rock','Alternative','Country','Electronic','Latin','K-Pop']

const PROMOTED_CONFIG = [
  {
    collectionId: 1734980417,
    name: 'Radical Optimism',
    artist: 'Dua Lipa',
    releaseDate: 'May 3, 2024',
    link: 'https://dualipa.com',
    fallbackArtwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/09/5c/2b/095c2b4e-3b5e-7e2e-0f33-e9a0ee8e4e4a/24UMGIM50410.rgb.jpg/600x600bb.jpg',
  },
  {
    collectionId: 1781270319,
    name: 'GNX',
    artist: 'Kendrick Lamar',
    releaseDate: 'Nov 22, 2024',
    link: 'https://oklama.com',
    fallbackArtwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/1d/3e/8f/1d3e8f4b-5c2a-9e7f-3b1a-8e4f2d6c9a0b/24UMGIM93351.rgb.jpg/600x600bb.jpg',
  },
  {
    collectionId: 1821337734,
    name: 'FRUIT',
    artist: 'Madeline Edwards',
    releaseDate: 'Jul 11, 2025',
    link: 'https://madelineedwardsmusic.com',
    fallbackArtwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/2a/4b/6c/2a4b6c8d-9e1f-3a2b-7c4d-5e6f8a0b2c3d/196871234567.jpg/600x600bb.jpg',
  },
  

    {
    collectionId: 1862634688,
    name: 'The Way I Am',
    artist: 'Luke Combs',
    releaseDate: 'Mar 20, 2026',
    link: 'https://twia.lukecombs.com',
    fallbackArtwork: 'https://musicrow.com/wp-content/uploads/2026/02/luke_combs_cover8.jpg',
},
    
]

const Select = ({ label, value, options, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: 0.5 }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E5E5',
      background: value !== 'All' ? '#FF006610' : 'white',
      color: value !== 'All' ? '#FF0066' : '#333',
      fontSize: 13, fontWeight: value !== 'All' ? 600 : 400,
      cursor: 'pointer', outline: 'none', appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
      paddingRight: 32, minWidth: 160,
    }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
)

function AlbumCard({ name, artist, release_date, artwork, itunesId, upcoming }) {
  const href = itunesId ? `/album/${itunesId}` : null
  const content = (
    <>
      <div style={{ position: 'relative' }}>
        {artwork
          ? <img src={artwork} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', aspectRatio: '1', background: '#F5F5F5',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 32 }}>🎵</span>
            </div>
        }
        {upcoming && (
          <div style={{ position: 'absolute', top: 8, left: 8, background: '#FF0066',
            color: 'white', fontSize: 9, fontWeight: 700, padding: '3px 7px',
            borderRadius: 5, letterSpacing: 0.5 }}>UPCOMING</div>
        )}
      </div>
      <div style={{ padding: '8px 10px 10px' }}>
        <p style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 2px', color: '#1a1a1a' }}>{name}</p>
        <p style={{ fontSize: 11, color: '#999', margin: '0 0 3px', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artist}</p>
        <p style={{ fontSize: 10, color: '#BBB', margin: 0 }}>
          {release_date ? new Date(release_date).toLocaleDateString() : ''}
        </p>
      </div>
    </>
  )

  const sharedStyle = {
    borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E5E5',
    background: 'white', display: 'block', transition: 'all 0.15s',
  }

  return href ? (
    <a href={href} style={{ ...sharedStyle, textDecoration: 'none', color: 'inherit' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)' }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
      {content}
    </a>
  ) : (
    <div style={sharedStyle}>{content}</div>
  )
}

export default function ReleasesPage() {
  const [tab, setTab] = useState('now')
  const [genre, setGenre] = useState('All')
  const [nowAlbums, setNowAlbums] = useState([])
  const [upcomingAlbums, setUpcomingAlbums] = useState([])
  const [promoted, setPromoted] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPromoted() }, [])
  useEffect(() => {
    if (tab === 'now') loadNow()
    else loadUpcoming()
  }, [tab, genre])

  async function loadPromoted() {
    const resolved = await Promise.all(
      PROMOTED_CONFIG.map(async (p) => {
        try {
          const res = await fetch(`/api/itunes?id=${p.collectionId}`)
          const data = await res.json()
          const hit = data?.results?.find(r => r.wrapperType === 'collection') || data?.results?.[0]
          const url = hit?.artworkUrl100
          return { ...p, artwork: url ? url.replace('100x100', '600x600') : p.fallbackArtwork }
        } catch {
          return { ...p, artwork: p.fallbackArtwork }
        }
      })
    )
    setPromoted(resolved.filter(p => p.artwork))
  }

  async function loadNow() {
  setLoading(true)
  try {
    const params = genre !== 'All' ? `?genre=${encodeURIComponent(genre)}` : ''
    const r = await fetch(`/api/spotify-releases${params}`)
    const d = await r.json()
    // Map iTunes fields to match AlbumCard props
    const mapped = (d.albums || []).map(a => ({
      id: a.collectionId,
      name: a.collectionName,
      artist: a.artistName,
      release_date: a.releaseDate,
      artwork: a.artworkUrl100?.replace('100x100', '300x300'),
      itunesId: a.collectionId,
      genre: a.primaryGenreName,
    }))
    setNowAlbums(mapped)
  } catch(e) { console.error(e) }
  setLoading(false)
}

  async function loadUpcoming() {
    setLoading(true)
    try {
      const params = genre !== 'All' ? `?genre=${encodeURIComponent(genre)}` : ''
      const r = await fetch(`/api/musicbrainz-upcoming${params}`)
      const d = await r.json()
      setUpcomingAlbums(d.releases || [])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const albums = tab === 'now' ? nowAlbums : upcomingAlbums
  const marqueeItems = [...promoted, ...promoted, ...promoted]

  return (
    <div>
      {/* PROMOTED SCROLLING BANNER */}
      {promoted.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #ffe0ec 60%, #fff0f5 100%)',
          borderBottom: '1px solid rgba(255,0,102,0.13)', padding: '14px 0',
          overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 2,
            display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 52,
            background: 'linear-gradient(to right, #ffe0ec 55%, transparent)', pointerEvents: 'none' }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2,
              color: 'rgba(255,0,102,0.6)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Featured</span>
          </div>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 2,
            width: 60, background: 'linear-gradient(to left, #fff0f5, transparent)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', gap: 16, paddingLeft: 90,
            animation: 'marqueeScroll 65s linear infinite', width: 'max-content' }}>
            {marqueeItems.map((p, i) => (
              <a key={i} href={p.link} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 12,
                  padding: '8px 16px 8px 8px', borderRadius: 10,
                  border: '1px solid rgba(255,0,102,0.18)',
                  background: 'rgba(255,255,255,0.78)', textDecoration: 'none',
                  flexShrink: 0, transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.97)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.78)'}>
                <img src={p.artwork} alt={p.name} style={{ width: 52, height: 52,
                  borderRadius: 6, objectFit: 'cover', flexShrink: 0,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a',
                    whiteSpace: 'nowrap', lineHeight: 1.3, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#FF0066', fontWeight: 600,
                    whiteSpace: 'nowrap', marginBottom: 2 }}>{p.artist}</div>
                  <div style={{ fontSize: 10, color: '#aaa', whiteSpace: 'nowrap' }}>{p.releaseDate}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px 100px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Releases</h1>
        <p style={{ fontSize: 14, color: '#999', marginBottom: 24 }}>
          {tab === 'now' ? 'Fresh albums waiting for their Banger Ratio' : 'Upcoming albums to watch'}
        </p>

        {/* TABS + FILTER ROW */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 4, background: '#F5F5F5', borderRadius: 10, padding: 4 }}>
            {[['now', '🔥 Out Now'], ['upcoming', '📅 Coming Soon']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                padding: '7px 18px', borderRadius: 7, border: 'none', fontSize: 13,
                fontWeight: tab === key ? 700 : 400,
                background: tab === key ? 'white' : 'transparent',
                color: tab === key ? '#1D1D1F' : '#999',
                boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <Select label="GENRE" value={genre} options={GENRES} onChange={setGenre} />
            {genre !== 'All' && (
              <button onClick={() => setGenre('All')} style={{
                padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E5E5',
                background: 'white', color: '#999', fontSize: 12,
                cursor: 'pointer', alignSelf: 'flex-end',
              }}>Clear</button>
            )}
          </div>
        </div>

        {/* LOADING SKELETONS */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 12 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E5E5' }}>
                <div style={{ aspectRatio: '1', background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
                  backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease infinite' }} />
                <div style={{ padding: 10 }}>
                  <div style={{ height: 11, borderRadius: 4, background: '#f0f0f0', width: '80%', marginBottom: 6 }} />
                  <div style={{ height: 9, borderRadius: 4, background: '#f0f0f0', width: '55%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ALBUM GRID */}
        {!loading && albums.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎵</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>
              No {tab === 'now' ? 'recent' : 'upcoming'} releases{genre !== 'All' ? ` for ${genre}` : ''}
            </p>
            <p style={{ fontSize: 13, color: '#999' }}>Try a different filter or check back soon.</p>
          </div>
        )}

        {!loading && albums.length > 0 && (
          <>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>{albums.length} albums</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 12 }}>
              {albums.map(a => (
                <AlbumCard
                  key={a.id || a.collectionId}
                  name={a.name || a.collectionName}
                  artist={a.artists?.[0]?.name || a.artist || a.artistName}
                  release_date={a.release_date || a.releaseDate}
                  artwork={a.images?.[0]?.url || a.artwork || a.artworkUrl100?.replace('100x100','300x300')}
                  itunesId={a.itunesId || a.collectionId}
                  upcoming={tab === 'upcoming'}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-100% / 3)); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
      `}</style>
    </div>
  )
}