'use client'
import { useState, useEffect } from 'react'

const FALLBACK = [
  'Beyoncé announces world tour dates for 2026 ·',
  'Kendrick Lamar headlining Coachella 2026 ·',
  'Taylor Swift breaks streaming record with new single ·',
  'Frank Ocean reportedly working on new album ·',
  'Billie Eilish drops surprise EP ·',
  'The Weeknd announces album release date ·',
  'Sabrina Carpenter tops charts for 10th week ·',
]

export default function NewsBanner() {
  const [headlines, setHeadlines] = useState(FALLBACK)

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_LASTFM_KEY
    if (!key) return
    fetch(`https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${key}&format=json&limit=10`)
      .then(r => r.json())
      .then(d => {
        const items = d?.tracks?.track
        if (items?.length) {
          setHeadlines(items.map(t => `${t.name} by ${t.artist.name} is trending ·`))
        }
      })
      .catch(() => {})
  }, [])

  const doubled = [...headlines, ...headlines]

  return (
    <div style={{
      background: 'var(--pink)', color: 'white', overflow: 'hidden',
      whiteSpace: 'nowrap', padding: '8px 0', fontSize: 12, fontWeight: 500,
    }}>
      <div style={{
        display: 'inline-block',
        animation: 'scroll-left 90s linear infinite',
      }}>
        {doubled.map((h, i) => <span key={i} style={{ marginRight: 48 }}>{h}</span>)}
      </div>
    </div>
  )
}