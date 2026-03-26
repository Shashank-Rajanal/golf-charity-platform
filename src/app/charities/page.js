'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CharitiesPage() {
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selecting, setSelecting] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { fetchCharities() }, [])

  async function fetchCharities() {
    const { data } = await supabase
      .from('charities')
      .select('*')
      .order('is_featured', { ascending: false })
    setCharities(data || [])
    setLoading(false)
  }

  async function selectCharity(charityId) {
    setSelecting(charityId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await supabase.from('profiles')
      .update({ charity_id: charityId })
      .eq('id', user.id)

    setSelecting(null)
    router.push('/dashboard')
  }

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <Link href="/dashboard" style={styles.logo}>GolfGives</Link>
        <Link href="/dashboard" style={styles.back}>← Back to dashboard</Link>
      </nav>

      <main style={styles.main}>
        <h2 style={styles.title}>Choose a Charity</h2>
        <p style={styles.sub}>
          A minimum of 10% of your subscription goes to your chosen charity.
        </p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search charities..."
          style={styles.search}
        />

        {loading ? (
          <p style={styles.empty}>Loading charities...</p>
        ) : filtered.length === 0 ? (
          <p style={styles.empty}>No charities found.</p>
        ) : (
          <div style={styles.grid}>
            {filtered.map((charity) => (
              <div key={charity.id} style={styles.card}>
                {charity.is_featured && (
                  <span style={styles.featured}>⭐ Featured</span>
                )}
                <h3 style={styles.charityName}>{charity.name}</h3>
                <p style={styles.charityDesc}>{charity.description}</p>
                <button
                  onClick={() => selectCharity(charity.id)}
                  disabled={selecting === charity.id}
                  style={styles.selectBtn}
                >
                  {selecting === charity.id ? 'Selecting...' : 'Support this charity'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f9fafb' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' },
  logo: { fontSize: '20px', fontWeight: '700', color: '#16a34a' },
  back: { fontSize: '14px', color: '#6b7280' },
  main: { maxWidth: '860px', margin: '0 auto', padding: '40px 24px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' },
  sub: { fontSize: '14px', color: '#6b7280', marginBottom: '24px' },
  search: { width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', marginBottom: '28px', outline: 'none', boxSizing: 'border-box' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px' },
  featured: { fontSize: '12px', color: '#16a34a', fontWeight: '600', marginBottom: '10px', display: 'block' },
  charityName: { fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' },
  charityDesc: { fontSize: '13px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.6' },
  selectBtn: { backgroundColor: '#16a34a', color: '#fff', padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer', width: '100%' },
  empty: { color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '40px 0' },
}