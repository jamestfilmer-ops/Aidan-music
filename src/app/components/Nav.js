'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const tabs = [
  { href: '/', label: 'Home' },
  { href: '/leaderboards', label: 'Leaderboards' },
  { href: '/releases', label: 'New Releases' },
  { href: '/about', label: 'About' },
]

export default function Nav() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const isActive = (href) => href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <nav style={{
      borderBottom: '1px solid #E5E5E5', background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#FF0066',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 13, color: 'white', letterSpacing: 0.5 }}>BR</div>
          <span style={{ fontWeight: 700, fontSize: 17, color: '#1D1D1F', letterSpacing: 0.5 }}>BANGER RATIOS</span>
        </a>
        {/* Desktop tabs */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {tabs.map(t => (
            <a key={t.href} href={t.href} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 13,
              fontWeight: isActive(t.href) ? 600 : 400,
              color: isActive(t.href) ? '#FF0066' : '#666',
              background: isActive(t.href) ? '#FF006610' : 'transparent',
              transition: 'all 0.15s',
            }}>{t.label}</a>
          ))}
        </div>
        {/* Auth button */}
        <a href={user ? "/profile" : "/auth"} style={{
          padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: user ? '#F5F5F5' : '#FF0066',
          color: user ? '#1D1D1F' : 'white',
          transition: 'all 0.15s',
        }}>
          {user ? "My Profile" : "Sign In"}
        </a>
      </div>
    </nav>
  )
}
