'use client'
import { useState, useEffect } from 'react'

export default function ReleasesPage() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const searches = ['new album 2026','new music 2026','album release 2026']
        const pick = searches[Math.floor(Math.random() * searches.length)]
        const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(pick)}&entity=album&limit=30&sort=recent`)
        const d = await r.json()
        const sorted = (d.results || []).sort((a,b) => new Date(b.releaseDate) - new Date(a.releaseDate))
        setAlbums(sorted)
      } catch(e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>New Releases</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>Fresh albums waiting for their Banger Ratio</p>
      {loading && <p style={{ color: '#CCC', textAlign: 'center', padding: 40 }}>Loading...</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 14 }}>
        {albums.map(a => (
          <a key={a.collectionId} href={`/album/${a.collectionId}`}
            style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E5E5', transition: 'transform 0.15s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform = ''}>
            <img src={a.artworkUrl100?.replace('100x100','300x300')} alt=""
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
            <div style={{ padding: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.collectionName}</p>
              <p style={{ fontSize: 11, color: '#999' }}>{a.artistName}</p>
              <p style={{ fontSize: 10, color: '#CCC', marginTop: 2 }}>
                {new Date(a.releaseDate).toLocaleDateString()}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
