'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, display_name: username }
        }
      })
      if (error) setMessage(error.message)
      else setMessage('Check your email for a confirmation link!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email, password
      })
      if (error) setMessage(error.message)
      else window.location.href = '/'
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: '#1A1A1A', border: '1px solid #333',
    borderRadius: 8, color: 'white', fontSize: 15,
    outline: 'none', boxSizing: 'border-box'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 380, padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <a href='/' style={{ color: 'white', textDecoration: 'none' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12,
              background: '#FF0066', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 18, marginBottom: 12 }}>BR</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
              BANGER RATIOS
            </h1>
          </a>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: '#111', borderRadius: 16,
          padding: 24, border: '1px solid #222'
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 20px' }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {isSignUp && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#888',
                display: 'block', marginBottom: 4 }}>Username</label>
              <input style={inputStyle} value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder='your_username' required />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#888',
              display: 'block', marginBottom: 4 }}>Email</label>
            <input style={inputStyle} type='email' value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='you@example.com' required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#888',
              display: 'block', marginBottom: 4 }}>Password</label>
            <input style={inputStyle} type='password' value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='At least 6 characters' required />
          </div>

          <button type='submit' style={{
            width: '100%', padding: 14, borderRadius: 10,
            background: '#FF0066', border: 'none', color: 'white',
            fontSize: 15, fontWeight: 700, cursor: 'pointer'
          }}>
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>

          {message && <p style={{ color: message.includes('Check')
            ? '#00B84D' : '#FF2D55', fontSize: 13, marginTop: 12 }}>{message}</p>}

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#666' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button type='button' onClick={() => setIsSignUp(!isSignUp)}
              style={{ background: 'none', border: 'none', color: '#FF0066',
                cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
