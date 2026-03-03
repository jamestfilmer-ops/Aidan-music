'use client'

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px 80px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>About Banger Ratios</h1>
      <div style={{ color: '#555', fontSize: 15, lineHeight: 1.7 }}>
        <p style={{ marginBottom: 16 }}>Streaming platforms tell you what’s popular.
          They don’t tell you what’s actually <em>good</em>.</p>
        <p style={{ marginBottom: 16 }}>Banger Ratios measures <strong>album consistency</strong>.
          Rate every track 1–7. Any track averaging 5.0+ is a “banger.”
          Banger Ratio = bangers ÷ total tracks.</p>
        <p style={{ marginBottom: 16 }}>An album with 10 tracks and 8 bangers has an
          <span style={{ color: '#FF0066', fontWeight: 700 }}> 80% Banger Ratio</span>.
          Simple. Shareable. Arguable. That’s the point.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', marginTop: 32, marginBottom: 12 }}>The Scale</h2>
        <div style={{ background: '#F9F9F9', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          {[
            ['7 — Perfect','A masterpiece of a track. Flawless.'],
            ['6 — Great','Excellent. In regular rotation.'],
            ['5 — Good','Solid track. This is the banger threshold.'],
            ['4 — OK','Decent but forgettable.'],
            ['3 — Meh','Filler. Wouldn’t seek it out.'],
            ['2 — Bad','Actively drags the album down.'],
            ['1 — Awful','Skip every time.'],
          ].map(([title, desc], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '6px 0',
              borderBottom: i < 6 ? '1px solid #E5E5E5' : 'none' }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: parseInt(title) >= 5 ? '#FF0066' : '#BBB',
                width: 110, flexShrink: 0 }}>{title}</span>
              <span style={{ fontSize: 13, color: '#777' }}>{desc}</span>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', marginTop: 32, marginBottom: 12 }}>Who We Are</h2>
        <p style={{ marginBottom: 16 }}>Two music fans in Nashville, Tennessee who got tired of
          arguing without data. Built with love, late nights, and a lot of hot pink.</p>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', marginTop: 32, marginBottom: 12 }}>Privacy Policy (Summary)</h2>
        <p style={{ marginBottom: 8 }}>We collect your email, username, and ratings. We use this
          data to operate the platform and send updates (if you opted in). We do{" "}
          <strong>not</strong> sell your data. You can delete your account at any time.
          Email: <a href="mailto:hello@bangerratios.com" style={{ color: "#FF0066" }}>
          hello@bangerratios.com</a></p>
      </div>
    </div>
  )
}
