'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import Link from 'next/link'

export default function DrawsPage() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { fetchDraws() }, [])

  async function fetchDraws() {
    const { data } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false })
    setDraws(data || [])
    setLoading(false)
  }

  function getStatusStyle(status) {
    if (status === 'published') return styles.statusPublished
    if (status === 'pending') return styles.statusPending
    return styles.statusDraft
  }

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <Link href="/dashboard" style={styles.logo}>GolfGives</Link>
        <Link href="/dashboard" style={styles.back}>← Back to dashboard</Link>
      </nav>

      <main style={styles.main}>
        <h2 style={styles.title}>Monthly Draws</h2>
        <p style={styles.sub}>
          Every month we run a draw based on your submitted scores.
          Match 3, 4, or 5 numbers to win!
        </p>

        {/* How it works */}
        <div style={styles.howItWorks}>
          <h3 style={styles.howTitle}>How the prize pool works</h3>
          <div style={styles.tiers}>
            <div style={styles.tier}>
              <p style={styles.tierMatch}>5 Number Match</p>
              <p style={styles.tierShare}>40% of pool</p>
              <p style={styles.tierNote}>Jackpot — rolls over if unclaimed</p>
            </div>
            <div style={styles.tier}>
              <p style={styles.tierMatch}>4 Number Match</p>
              <p style={styles.tierShare}>35% of pool</p>
              <p style={styles.tierNote}>Split among winners</p>
            </div>
            <div style={styles.tier}>
              <p style={styles.tierMatch}>3 Number Match</p>
              <p style={styles.tierShare}>25% of pool</p>
              <p style={styles.tierNote}>Split among winners</p>
            </div>
          </div>
        </div>

        {/* Draws List */}
        <h3 style={styles.sectionTitle}>Past & Upcoming Draws</h3>

        {loading ? (
          <p style={styles.empty}>Loading draws...</p>
        ) : draws.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyTitle}>No draws yet</p>
            <p style={styles.emptySub}>
              The first draw will be published soon. Make sure you have
              an active subscription and scores entered!
            </p>
          </div>
        ) : (
          <div style={styles.drawsList}>
            {draws.map((draw) => (
              <div key={draw.id} style={styles.drawCard}>
                <div style={styles.drawLeft}>
                  <p style={styles.drawMonth}>{draw.month}</p>
                  <span style={getStatusStyle(draw.status)}>
                    {draw.status.charAt(0).toUpperCase() + draw.status.slice(1)}
                  </span>
                </div>
                <div style={styles.drawRight}>
                  {draw.winning_numbers && draw.winning_numbers.length > 0 ? (
                    <div style={styles.numbers}>
                      {draw.winning_numbers.map((num, i) => (
                        <span key={i} style={styles.number}>{num}</span>
                      ))}
                    </div>
                  ) : (
                    <p style={styles.pending}>Draw not yet run</p>
                  )}
                  {draw.jackpot_rollover && (
                    <p style={styles.rollover}>🔄 Jackpot rolled over</p>
                  )}
                </div>
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
  sub: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  howItWorks: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px', marginBottom: '32px' },
  howTitle: { fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '16px' },
  tiers: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  tier: { backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' },
  tierMatch: { fontSize: '14px', fontWeight: '600', color: '#16a34a', marginBottom: '4px' },
  tierShare: { fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' },
  tierNote: { fontSize: '12px', color: '#6b7280' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' },
  empty: { color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '40px 0' },
  emptyBox: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '40px', textAlign: 'center' },
  emptyTitle: { fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' },
  emptySub: { fontSize: '14px', color: '#6b7280', lineHeight: '1.6' },
  drawsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  drawCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  drawLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  drawMonth: { fontSize: '15px', fontWeight: '600', color: '#111827' },
  statusPublished: { fontSize: '12px', backgroundColor: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' },
  statusPending: { fontSize: '12px', backgroundColor: '#fef9c3', color: '#ca8a04', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' },
  statusDraft: { fontSize: '12px', backgroundColor: '#f3f4f6', color: '#6b7280', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' },
  drawRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  numbers: { display: 'flex', gap: '8px' },
  number: { width: '36px', height: '36px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700' },
  pending: { fontSize: '13px', color: '#9ca3af' },
  rollover: { fontSize: '12px', color: '#ca8a04' },
}