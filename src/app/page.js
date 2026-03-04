'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Counter from './components/Counter'

const BADGES = {
  classic: { label: '💎 Certified Classic', min: 90 },
  gold:    { label: '🥇 Solid Gold', min: 75 },
  mixed:   { label: '🎵 Hit or Miss', min: 60 },
  filler:  { label: '⚠️ Filler Warning', min: 40 },
  skip:    { label: '❌ Skip It', min: 0 },
}

function getBadge(ratio) {
  if (ratio >= 90) return BADGES.classic
  if (ratio >= 75) return BADGES.gold
  if (ratio >= 60) return BADGES.mixed
  if (ratio >= 40) return BADGES.filler
  return BADGES.skip
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [topAlbums, setTopAlbums] = useState([])
  const [loading, setLoading] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [showCount, setShowCount] = useState(20)

  useEffect(() => { loadTop() }, [])

  async function loadTop() {
    const { data } = await supabase.from('albums').select('*')
      .gt('total_ratings', 0).order('banger_ratio', { ascending: false }).limit(50)
    setTopAlbums(data || [])
  }

  async function search(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const r = await fetch(`/api/itunes-search?term=${encodeURIComponent(query)}`)
      const d = await r.json()
      setResults(d.results || [])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ANNOUNCEMENT BANNER */}
      {showBanner && (
        <div style={{ background: 'linear-gradient(135deg, #FF0066, #CC0052)',
          padding: '14px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 16, animation: 'slideDown 0.3s ease' }}>
          <span style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>
            🔥 <strong>NEW:</strong> Kendrick Lamar's "GNX" just dropped
            — community Banger Ratio is live!{' '}
            <a href="/album/1781033043" style={{ color: 'white', fontWeight: 700, textDecoration: 'underline' }}>
              Rate it now →</a>
          </span>
          <button onClick={() => setShowBanner(false)} style={{ background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}

      {/* HERO + SEARCH */}
      <section style={{ padding: '52px 24px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 42, fontWeight: 700, color: '#1D1D1F', margin: '0 0 10px', lineHeight: 1.15 }}>
          The Real Measure of<br /><span style={{ color: '#FF0066' }}>Musical Consistency</span>
        </h1>
        <p style={{ color: '#666', fontSize: 16, maxWidth: 420, margin: '0 auto 28px' }}>
          Rate every track 1–7. See the Banger Ratio. Settle the debate.
        </p>
        <form onSubmit={search} style={{ display: 'flex', maxWidth: 480, margin: '0 auto',
          borderRadius: 12, border: '2px solid #E5E5E5', overflow: 'hidden' }}>
          <input type="text" placeholder="Search for any album..."
            value={query} onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, padding: '13px 18px', border: 'none', fontSize: 15,
              outline: 'none', background: 'white', color: '#1D1D1F' }} />
          <button type="submit" style={{ padding: '13px 22px', background: '#FF0066',
            border: 'none', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            {loading ? '...' : 'Search'}
          </button>
        </form>
      </section>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        {/* SEARCH RESULTS */}
        {results.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Search Results</h2>
              <button onClick={() => setResults([])} style={{ background: 'none', border: 'none',
                color: '#999', cursor: 'pointer', fontSize: 13 }}>Clear</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
              {results.map(a => (
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
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* TOP ALBUMS LEADERBOARD */}
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>🔥 Top Albums</h2>
          <p style={{ color: '#999', fontSize: 13, marginBottom: 20 }}>Ranked by community Banger Ratio</p>
          {topAlbums.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🎵</p>
              <p style={{ color: '#999' }}>No rated albums yet. Be the first — search above!</p>
            </div>
          )}
          {topAlbums.slice(0, showCount).map((a, i) => {
            const badge = getBadge(a.banger_ratio)
            return (
              <a key={a.id} href={`/album/${a.itunes_collection_id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px', borderRadius: 10, marginBottom: 2, transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = '#F5F5F5'}
                onMouseOut={e => e.currentTarget.style.background = ''}>
                <span style={{ fontSize: 16, fontWeight: 700, color: i < 3 ? '#FF0066' : '#CCC',
                  width: 28, textAlign: 'center' }}>{i + 1}</span>
                {a.artwork_url && <img src={a.artwork_url.replace("600x600","100x100")} alt=""
                  style={{ width: 44, height: 44, borderRadius: 8 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p>
                  <p style={{ fontSize: 12, color: '#999' }}>{a.artist_name} · {a.total_ratings} ratings</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#FF0066' }}>{a.banger_ratio}%</p>
                  <p style={{ fontSize: 9, color: '#999', fontWeight: 600 }}>{badge.label}</p>
                </div>
              </a>
            )
          })}
          {topAlbums.length > showCount && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button onClick={() => setShowCount(s => s + 20)} style={{ padding: '10px 28px',
                borderRadius: 10, border: '1px solid #E5E5E5', background: 'white',
                color: '#666', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Show More
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}