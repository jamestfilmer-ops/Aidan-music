'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const GENRES = ['All','Hip-Hop/Rap','Pop','Rock','R&B/Soul','Alternative','Country','Electronic','Jazz','Classical','Metal','Reggae','Latin']
const DECADES = ['All','2020s','2010s','2000s','1990s','1980s','1970s','1960s']

function getBadge(r) {
  if (r >= 90) return '💎'
  if (r >= 75) return '🥇'
  if (r >= 60) return '🎵'
  return ''
}

export default function LeaderboardsPage() {
  const [albums, setAlbums] = useState([])
  const [genre, setGenre] = useState('All')
  const [decade, setDecade] = useState('All')
  const [tab, setTab] = useState('albums')

  useEffect(() => { load() }, [genre, decade])

  async function load() {
    let q = supabase.from('albums').select('*').gt('total_ratings', 0).order('banger_ratio', { ascending: false }).limit(50)
    if (genre !== 'All') q = q.eq('genre', genre)
    if (decade !== 'All') {
      const yr = parseInt(decade)
      q = q.gte('release_date', yr + '-01-01').lt('release_date', (yr + 10) + '-01-01')
    }
    const { data } = await q
    setAlbums(data || [])
  }

  const artistMap = {}
  albums.forEach(a => {
    if (!artistMap[a.artist_name]) artistMap[a.artist_name] = { albums:[], totalRatio:0, count:0 }
    artistMap[a.artist_name].albums.push(a)
    artistMap[a.artist_name].totalRatio += parseFloat(a.banger_ratio)
    artistMap[a.artist_name].count++
  })
  const artists = Object.entries(artistMap).map(([name, d]) => ({
    name, avgRatio: (d.totalRatio/d.count).toFixed(1), albumCount: d.count, topAlbum: d.albums[0]
  })).sort((a,b) => b.avgRatio - a.avgRatio)

  const pill = (label, active, onClick) => (
    <button key={label} onClick={onClick} style={{
      padding: '6px 14px', borderRadius: 20,
      border: '1px solid ' + (active ? '#FF0066' : '#E5E5E5'),
      background: active ? '#FF006610' : 'white',
      color: active ? '#FF0066' : '#666',
      fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{label}</button>
  )

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Leaderboards</h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>The highest-rated music, ranked by the community</p>
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {[['albums','Albums'],['artists','Artists']].map(([key,label]) =>
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13,
            fontWeight: tab === key ? 700 : 400,
            background: tab === key ? '#1D1D1F' : '#F5F5F5',
            color: tab === key ? 'white' : '#666', cursor: 'pointer',
          }}>{label}</button>
        )}
      </div>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 6 }}>GENRE</p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
          {GENRES.map(g => pill(g, genre === g, () => setGenre(g)))}
        </div>
        <p style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 6 }}>DECADE</p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {DECADES.map(d => pill(d, decade === d, () => setDecade(d)))}
        </div>
      </div>
      {tab === 'albums' && albums.map((a, i) => (
        <a key={a.id} href={`/album/${a.itunes_collection_id}`}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px',
            borderRadius: 10, marginBottom: 2, transition: 'background 0.15s' }}
          onMouseOver={e => e.currentTarget.style.background = '#F5F5F5'}
          onMouseOut={e => e.currentTarget.style.background = ''}>
          <span style={{ fontSize: 14, fontWeight: 700, color: i < 3 ? '#FF0066' : '#CCC',
            width: 26, textAlign: 'center' }}>{i + 1}</span>
          {a.artwork_url && <img src={a.artwork_url.replace("600x600","80x80")} alt=""
            style={{ width: 40, height: 40, borderRadius: 6 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p>
            <p style={{ fontSize: 11, color: '#999' }}>{a.artist_name} · {a.genre} · {a.release_date?.slice(0,4)}</p>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#FF0066' }}>
            {a.banger_ratio}% {getBadge(a.banger_ratio)}</span>
        </a>
      ))}
      {tab === 'artists' && artists.map((a, i) => (
        <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 12,
          padding: "12px", borderRadius: 10, marginBottom: 2,
          background: i % 2 === 0 ? "#FAFAFA" : "white" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: i < 3 ? '#FF0066' : '#CCC',
            width: 26, textAlign: 'center' }}>{i + 1}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</p>
            <p style={{ fontSize: 11, color: '#999' }}>{a.albumCount} album{a.albumCount > 1 ? 's' : ''} rated</p>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#FF0066' }}>{a.avgRatio}%</span>
        </div>
      ))}
      {albums.length === 0 && <p style={{ textAlign: 'center', color: '#CCC', padding: 40 }}>No albums match these filters yet.</p>}
    </div>
  )
}
