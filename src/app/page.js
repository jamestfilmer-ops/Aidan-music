'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [topAlbums, setTopAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  // Check if user is logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null)
    })
    // Load top rated albums
    loadTopAlbums()
  }, [])

  async function loadTopAlbums() {
    const { data } = await supabase
      .from('albums')
      .select('*')
      .gt('total_ratings', 0)
      .order('banger_ratio', { ascending: false })
      .limit(10)
    setTopAlbums(data || [])
  }

  // Search iTunes API for albums
  async function searchAlbums(e) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=album&limit=12`
      )
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch (err) {
      console.error('Search failed:', err)
    }
    setLoading(false)
  }

  function getBadge(ratio) {
    if (ratio >= 90) return { label: '💎 Certified Classic', color: '#FFD700' }
    if (ratio >= 75) return { label: '🥇 Solid Gold', color: '#FFD700' }
    if (ratio >= 60) return { label: '🎵 Hit or Miss', color: '#FF0066' }
    if (ratio >= 40) return { label: '⚠️ Filler Warning', color: '#F5A623' }
    return { label: '❌ Skip It', color: '#FF2D55' }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
      {/* HEADER */}
      <header style={{
        borderBottom: '1px solid #222',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        background: 'rgba(13,13,13,0.95)',
        backdropFilter: 'blur(20px)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: '#FF0066',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 14, color: 'white'
          }}>BR</div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>
            BANGER RATIOS
          </span>
        </div>
        <a href='/auth' style={{
          padding: '8px 16px', borderRadius: 8,
          background: user ? '#222' : '#FF0066',
          color: 'white', textDecoration: 'none',
          fontSize: 13, fontWeight: 600
        }}>
          {user ? 'My Profile' : 'Sign Up / Log In'}
        </a>
      </header>

      {/* HERO */}
      <section style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, margin: '0 0 12px' }}>
          The Real Measure of Musical Consistency
        </h1>
        <p style={{ color: '#888', fontSize: 18, maxWidth: 500, margin: '0 auto 32px' }}>
          Rate every track. See the Banger Ratio. Settle the debate.
        </p>

        {/* SEARCH BAR */}
        <form onSubmit={searchAlbums} style={{
          display: 'flex', maxWidth: 500, margin: '0 auto',
          background: '#1A1A1A', borderRadius: 12,
          border: '1px solid #333', overflow: 'hidden'
        }}>
          <input
            type='text'
            placeholder='Search for an album...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1, padding: '14px 18px',
              background: 'transparent', border: 'none',
              color: 'white', fontSize: 16, outline: 'none'
            }}
          />
          <button type='submit' style={{
            padding: '14px 24px', background: '#FF0066',
            border: 'none', color: 'white',
            fontWeight: 700, fontSize: 14, cursor: 'pointer'
          }}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </section>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 60px' }}>

        {/* SEARCH RESULTS */}
        {searchResults.length > 0 && (
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
              Search Results
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 16
            }}>
              {searchResults.map(album => (
                <a key={album.collectionId}
                  href={`/album/${album.collectionId}`}
                  style={{
                    background: '#111', borderRadius: 12,
                    overflow: 'hidden', textDecoration: 'none',
                    color: 'white', border: '1px solid #222'
                  }}>
                  <img
                    src={album.artworkUrl100?.replace('100x100', '300x300')}
                    alt={album.collectionName}
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                  />
                  <div style={{ padding: 12 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 700,
                      margin: '0 0 4px',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>{album.collectionName}</p>
                    <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
                      {album.artistName}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* TOP RATED ALBUMS */}
        {topAlbums.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
              🔥 Top Rated Albums
            </h2>
            {topAlbums.map((album, i) => {
              const badge = getBadge(album.banger_ratio)
              return (
                <a key={album.id}
                  href={`/album/${album.itunes_collection_id}`}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: 16, padding: '14px 16px',
                    background: i % 2 === 0 ? '#111' : 'transparent',
                    borderRadius: 10, textDecoration: 'none',
                    color: 'white', marginBottom: 4
                  }}>
                  <span style={{
                    fontSize: 18, fontWeight: 800, color: '#444',
                    width: 32, textAlign: 'center'
                  }}>{i + 1}</span>
                  {album.artwork_url && <img
                    src={album.artwork_url}
                    alt=''
                    style={{
                      width: 48, height: 48,
                      borderRadius: 8, objectFit: 'cover'
                    }}
                  />}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
                      {album.name}
                    </p>
                    <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                      {album.artist_name} \u00B7 {album.total_ratings} ratings
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: 22, fontWeight: 900,
                      color: '#FF0066', margin: '0 0 2px'
                    }}>{album.banger_ratio}%</p>
                    <p style={{
                      fontSize: 10, color: badge.color,
                      fontWeight: 600, margin: 0
                    }}>{badge.label}</p>
                  </div>
                </a>
              )
            })}
          </section>
        )}

        {/* EMPTY STATE */}
        {topAlbums.length === 0 && searchResults.length === 0 && (
          <section style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🎵</p>
            <p style={{ color: '#666', fontSize: 16 }}>
              Search for an album above to start rating tracks!
            </p>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #222',
        padding: 24, textAlign: 'center'
      }}>
        <p style={{ color: '#444', fontSize: 12 }}>
          Banger Ratios\u2122 2026 \u00B7 The Real Measure of Musical Consistency
        </p>
      </footer>
    </div>
  )
}


