'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AlbumPage() {
  const params = useParams()
  const albumId = params.id
  const [album, setAlbum] = useState(null)
  const [tracks, setTracks] = useState([])
  const [ratings, setRatings] = useState({})
  const [user, setUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null))
    loadAlbum()
  }, [albumId])

  async function loadAlbum() {
    // Fetch from iTunes API
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${albumId}&entity=song`
    )
    const data = await res.json()
    const results = data.results || []
    const albumData = results.find(r => r.wrapperType === 'collection')
    const trackData = results.filter(r => r.wrapperType === 'track')

    if (!albumData) return

    // Upsert album into Supabase
    const { data: dbAlbum } = await supabase
      .from('albums')
      .upsert({
        itunes_collection_id: albumData.collectionId,
        name: albumData.collectionName,
        artist_name: albumData.artistName,
        artwork_url: albumData.artworkUrl100?.replace('100x100', '600x600'),
        release_date: albumData.releaseDate?.split('T')[0],
        genre: albumData.primaryGenreName,
        track_count: trackData.length
      }, { onConflict: 'itunes_collection_id' })
      .select()
      .single()

    setAlbum(dbAlbum)

    // Upsert tracks
    for (const track of trackData) {
      await supabase.from('tracks').upsert({
        album_id: dbAlbum.id,
        itunes_track_id: track.trackId,
        name: track.trackName,
        track_number: track.trackNumber,
        duration_ms: track.trackTimeMillis,
        preview_url: track.previewUrl
      }, { onConflict: 'itunes_track_id' })
    }

    // Load tracks from DB (with avg ratings)
    const { data: dbTracks } = await supabase
      .from('tracks')
      .select('*')
      .eq('album_id', dbAlbum.id)
      .order('track_number', { ascending: true })

    setTracks(dbTracks || [])

    // Load user’s existing ratings
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (currentUser) {
      const { data: userRatings } = await supabase
        .from('ratings')
        .select('track_id, score')
        .eq('user_id', currentUser.id)
        .eq('album_id', dbAlbum.id)
      const ratingsMap = {}
      ;(userRatings || []).forEach(r => ratingsMap[r.track_id] = r.score)
      setRatings(ratingsMap)
    }
    setLoaded(true)
  }

  async function rateTrack(trackId, score) {
    if (!user) { alert('Please sign in to rate!'); return }
    setRatings(prev => ({ ...prev, [trackId]: score }))

    await supabase.from('ratings').upsert({
      user_id: user.id,
      track_id: trackId,
      album_id: album.id,
      score: score
    }, { onConflict: 'user_id,track_id' })

    // Recalculate banger ratio
    await supabase.rpc('recalculate_banger_ratio', {
      p_album_id: album.id
    })

    // Reload to see updated averages
    const { data: dbTracks } = await supabase
      .from('tracks')
      .select('*')
      .eq('album_id', album.id)
      .order('track_number', { ascending: true })
    setTracks(dbTracks || [])

    const { data: refreshedAlbum } = await supabase
      .from('albums')
      .select('*')
      .eq('id', album.id)
      .single()
    setAlbum(refreshedAlbum)
  }

  function msToTime(ms) {
    const min = Math.floor(ms / 60000)
    const sec = Math.floor((ms % 60000) / 1000)
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  if (!loaded) return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#666' }}>Loading album...</p>
    </div>
  )

  const bangers = tracks.filter(t => t.is_banger).length
  const rated = tracks.filter(t => t.total_ratings > 0).length

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
      {/* HEADER */}
      <header style={{
        borderBottom: '1px solid #222', padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <a href='/' style={{ color: 'white', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7,
            background: '#FF0066', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 12 }}>BR</div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>BANGER RATIOS</span>
        </a>
      </header>

      <main style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>
        {/* ALBUM INFO */}
        {album && (
          <div style={{ display: 'flex', gap: 24, marginBottom: 32,
            flexWrap: 'wrap' }}>
            {album.artwork_url && <img src={album.artwork_url}
              alt={album.name} style={{ width: 200, height: 200,
                borderRadius: 14, objectFit: 'cover' }} />}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 6px' }}>
                {album.name}
              </h1>
              <p style={{ color: '#888', fontSize: 16, margin: '0 0 16px' }}>
                {album.artist_name}
              </p>
              <div style={{ background: '#111', borderRadius: 12,
                padding: 20, border: '1px solid #222' }}>
                <p style={{ fontSize: 42, fontWeight: 900,
                  color: '#FF0066', margin: '0 0 4px' }}>
                  {album.banger_ratio || 0}%
                </p>
                <p style={{ color: '#888', fontSize: 13, margin: '0 0 4px' }}>
                  Banger Ratio
                </p>
                <p style={{ color: '#666', fontSize: 12, margin: 0 }}>
                  {bangers} bangers out of {rated || album.track_count} tracks
                  {' \u00B7 '}{album.total_ratings || 0} total ratings
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TRACK LIST */}
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
          Rate Every Track
        </h2>
        {!user && (
          <div style={{ background: '#1a0a10', border: '1px solid #FF006640',
            borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ color: '#FF0066', fontSize: 13, margin: 0 }}>
              <a href='/auth' style={{ color: '#FF0066', fontWeight: 700 }}>
                Sign in</a> to rate tracks and contribute to the Banger Ratio!
            </p>
          </div>
        )}
        {tracks.map(track => (
          <div key={track.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 10,
            background: track.is_banger ? '#0a1a0a' : 'transparent',
            border: track.is_banger ? '1px solid #00B84D30' : '1px solid transparent',
            marginBottom: 6
          }}>
            <span style={{ color: '#444', fontSize: 14, fontWeight: 700,
              width: 24, textAlign: 'center' }}>{track.track_number}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 2px' }}>
                {track.name}
                {track.is_banger && ' \uD83D\uDD25'}
              </p>
              <p style={{ color: '#666', fontSize: 11, margin: 0 }}>
                {track.duration_ms ? msToTime(track.duration_ms) : ''} 
                {track.total_ratings > 0
                  ? `\u00B7 Avg: ${track.avg_rating} \u00B7 ${track.total_ratings} ratings`
                  : '\u00B7 No ratings yet'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} onClick={() => rateTrack(track.id, n)}
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    border: 'none', cursor: user ? 'pointer' : 'default',
                    fontSize: 11, fontWeight: 700,
                    background: ratings[track.id] === n ? '#FF0066'
                      : ratings[track.id] > n ? '#FF006640' : '#1A1A1A',
                    color: ratings[track.id] >= n ? 'white' : '#555'
                  }}>{n}</button>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
