'use client'
import { useState, useEffect } from 'react'

const GENRES = ['All','Hip-Hop/Rap','Pop','Rock','R&B/Soul','Alternative','Country','Electronic','Jazz','Metal','Latin']

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

export default function ReleasesPage() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [genre, setGenre] = useState('All')

  useEffect(() => { load(genre) }, [genre])

  async function load(selectedGenre) {
    setLoading(true)
    try {
      const params = selectedGenre !== 'All' ? `?genre=${encodeURIComponent(selectedGenre)}` : ''
      const r = await fetch(`/api/spotify-releases${params}`)
      const d = await r.json()
      setAlbums(d.albums || [])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>New Releases</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>
        Fresh albums — waiting for their Banger Ratio
      </p>

      {/* FILTER ROW */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 28 }}>
        <Select label="GENRE" value={genre} options={GENRES} onChange={setGenre} />
        {genre !== 'All' && (
          <button onClick={() => setGenre('All')} style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E5E5',
            background: 'white', color: '#999', fontSize: 12,
            cursor: 'pointer', alignSelf: 'flex-end',
          }}>Clear</button>
        )}
      </div>

      {loading && (
        <p style={{ color: '#CCC', textAlign: 'center', padding: 40 }}>Loading new releases...</p>
      )}

      {!loading && albums.length === 0 && (
        <p style={{ color: '#CCC', textAlign: 'center', padding: 40 }}>
          No recent releases found for this genre.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 14 }}>
        {albums.map(a => {
          const artwork = a.images?.[0]?.url
          const artist = a.artists?.[0]?.name
          const href = a.itunesId ? `/album/${a.itunesId}` : null

          return href ? (
            <a key={a.id} href={href}
              style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E5E5',
                transition: 'transform 0.15s', textDecoration: 'none', color: 'inherit' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = ''}>
              {artwork && <img src={artwork} alt=""
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />}
              <div style={{ padding: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 2px' }}>{a.name}</p>
                <p style={{ fontSize: 11, color: '#999', margin: '0 0 2px' }}>{artist}</p>
                <p style={{ fontSize: 10, color: '#CCC', margin: 0 }}>
                  {a.release_date ? new Date(a.release_date).toLocaleDateString() : ''}
                </p>
              </div>
            </a>
          ) : (
            <div key={a.id}
              style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E5E5',
                opacity: 0.5, color: 'inherit' }}>
              {artwork && <img src={artwork} alt=""
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />}
              <div style={{ padding: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 2px' }}>{a.name}</p>
                <p style={{ fontSize: 11, color: '#999', margin: '0 0 2px' }}>{artist}</p>
                <p style={{ fontSize: 10, color: '#CCC', margin: 0 }}>Not on iTunes</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}