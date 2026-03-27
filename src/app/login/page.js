'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Check if admin and redirect accordingly
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single()

    if (profile?.is_admin === true) {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.logo}>GolfGives</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...styles.input, width: '100%', paddingRight: '40px' }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#9ca3af' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={loading ? styles.buttonDisabled : styles.button}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link href="/signup" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '24px' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px' },
  header: { marginBottom: '32px' },
  logo: { fontSize: '24px', fontWeight: '700', color: '#16a34a', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#6b7280' },
  error: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '14px', fontWeight: '500', color: '#374151' },
  input: { padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#111827', backgroundColor: '#ffffff' },
  button: { backgroundColor: '#16a34a', color: '#ffffff', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', marginTop: '8px', cursor: 'pointer' },
  buttonDisabled: { backgroundColor: '#86efac', color: '#ffffff', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', marginTop: '8px', cursor: 'not-allowed' },
  footer: { marginTop: '24px', fontSize: '14px', color: '#6b7280', textAlign: 'center' },
  link: { color: '#16a34a', fontWeight: '500' },
}