'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [myRatings, setMyRatings] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ display_name:'', bio:'', location:'', spotify_url:'', apple_music_url:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { window.location.href = '/auth'; return }
      setUser(u)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single()
      setProfile(p)
      if (p) setForm({ display_name: p.display_name||'', bio: p.bio||'', location: p.location||'', spotify_url: p.spotify_url||'', apple_music_url: p.apple_music_url||'' })
      const { data: rats } = await supabase.from('ratings').select('album_id, score').eq('user_id', u.id)
      const albumIds = [...new Set((rats || []).map(r => r.album_id))]
      if (albumIds.length > 0) {
        const { data: albums } = await supabase.from('albums').select('*').in('id', albumIds).order('banger_ratio', { ascending: false })
        setMyRatings(albums || [])
      }
    }
    load()
  }, [])

  async function saveProfile() {
    setSaving(true)
    await supabase.from('profiles').update(form).eq('id', user.id)
    setProfile({ ...profile, ...form })
    setEditing(false); setSaving(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!user) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Loading...</div>

  const inp = { width: '100%', padding: '10px 14px', background: '#F5F5F5',
    border: '1px solid #E5E5E5', borderRadius: 8, fontSize: 14, outline: 'none', color: '#1D1D1F' }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>My Profile</h1>
        <button onClick={signOut} style={{ padding: '7px 16px', borderRadius: 8,
          border: '1px solid #E5E5E5', background: 'white', color: '#999', fontSize: 12,
          fontWeight: 600, cursor: 'pointer' }}>Sign Out</button>
      </div>
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E5E5', padding: 24, marginBottom: 24 }}>
        {!editing ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: '#FF006615',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700, color: '#FF0066' }}>
                {(profile?.display_name || profile?.username || '?')[0].toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{profile?.display_name || profile?.username}</h2>
                <p style={{ fontSize: 13, color: '#999' }}>@{profile?.username}
                  {profile?.location ? ' · ' + profile.location : ''}</p>
              </div>
            </div>
            {profile?.bio && <p style={{ fontSize: 14, color: '#555', marginBottom: 12, lineHeight: 1.5 }}>{profile.bio}</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {profile?.spotify_url && <a href={profile.spotify_url} target="_blank"
                style={{ padding: '5px 12px', borderRadius: 6, background: '#1DB954', color: 'white', fontSize: 11, fontWeight: 600 }}>Spotify</a>}
              {profile?.apple_music_url && <a href={profile.apple_music_url} target="_blank"
                style={{ padding: '5px 12px', borderRadius: 6, background: '#FA243C', color: 'white', fontSize: 11, fontWeight: 600 }}>Apple Music</a>}
            </div>
            <button onClick={() => setEditing(true)} style={{ padding: '8px 18px', borderRadius: 8,
              border: '1px solid #E5E5E5', background: 'white', color: '#666', fontSize: 13,
              fontWeight: 600, cursor: 'pointer' }}>Edit Profile</button>
          </>
        ) : (
          <div>
            {[['Display Name','display_name',''],['Bio','bio','Tell the world about your music taste...',true],
              ['Location (optional)','location','Nashville, TN'],
              ['Spotify Playlist Link','spotify_url','https://open.spotify.com/playlist/...'],
              ['Apple Music Playlist Link','apple_music_url','https://music.apple.com/playlist/...'],
            ].map(([label, key, ph, isTA]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, color: '#999', fontWeight: 600, display: 'block', marginBottom: 4 }}>{label}</label>
                {isTA
                  ? <textarea style={{...inp, minHeight:60, resize:"vertical"}} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} placeholder={ph} />
                  : <input style={inp} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} placeholder={ph} />}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveProfile} style={{ padding: '9px 22px', borderRadius: 8, border: 'none',
                background: '#FF0066', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setEditing(false)} style={{ padding: '9px 22px', borderRadius: 8,
                border: '1px solid #E5E5E5', background: 'white', color: '#666', fontSize: 13, cursor: 'pointer' }}>
                Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Albums Rated', value: myRatings.length },
          { label: 'Total Ratings', value: myRatings.reduce((s,a) => s + (a.total_ratings||0), 0) },
          { label: 'Avg Ratio', value: myRatings.length ? (myRatings.reduce((s,a) => s + parseFloat(a.banger_ratio||0), 0)/myRatings.length).toFixed(0)+'%' : '--' },
        ].map((s,i) => (
          <div key={i} style={{ background: '#F9F9F9', borderRadius: 12, padding: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#FF0066' }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#999', fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Albums I’ve Rated</h2>
      {myRatings.length === 0 && <p style={{ color: '#CCC', fontSize: 14 }}>No albums rated yet.{' '}
        <a href="/" style={{ color: "#FF0066" }}>Start rating!</a></p>}
      {myRatings.map(a => (
        <a key={a.id} href={`/album/${a.itunes_collection_id}`}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 10, marginBottom: 2, transition: 'background 0.15s' }}
          onMouseOver={e => e.currentTarget.style.background = '#F5F5F5'}
          onMouseOut={e => e.currentTarget.style.background = ''}>
          {a.artwork_url && <img src={a.artwork_url.replace("600x600","80x80")} alt=""
            style={{ width: 40, height: 40, borderRadius: 6 }} />}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</p>
            <p style={{ fontSize: 11, color: '#999' }}>{a.artist_name}</p>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#FF0066' }}>{a.banger_ratio}%</span>
        </a>
      ))}
    </div>
  )
}
