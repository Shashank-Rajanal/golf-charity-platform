'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [charities, setCharities] = useState([])
  const [draws, setDraws] = useState([])
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCharity, setNewCharity] = useState({ name: '', description: '', is_featured: false })
  const [drawMonth, setDrawMonth] = useState('')
  const [simResult, setSimResult] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [u, c, d, w] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('charities').select('*'),
      supabase.from('draws').select('*').order('created_at', { ascending: false }),
      supabase.from('winners').select('*'),
    ])
    setUsers(u.data || [])
    setCharities(c.data || [])
    setDraws(d.data || [])
    setWinners(w.data || [])
    setLoading(false)
  }

  async function addCharity() {
    if (!newCharity.name || !newCharity.description) return
    await supabase.from('charities').insert(newCharity)
    setNewCharity({ name: '', description: '', is_featured: false })
    loadAll()
  }

  async function deleteCharity(id) {
    await supabase.from('charities').delete().eq('id', id)
    loadAll()
  }

  function simulateDraw() {
    const numbers = Array.from({ length: 5 }, () =>
      Math.floor(Math.random() * 45) + 1
    )
    setSimResult(numbers)
  }

  async function publishDraw() {
    if (!drawMonth || !simResult) return
    await supabase.from('draws').insert({
      month: drawMonth,
      winning_numbers: simResult,
      status: 'published',
    })
    setDrawMonth('')
    setSimResult(null)
    loadAll()
  }

  async function updateWinnerStatus(id, status) {
    await supabase.from('winners').update({ payout_status: status }).eq('id', id)
    loadAll()
  }

  if (loading) return <div style={styles.loading}>Loading admin panel...</div>

  const tabs = ['users', 'draws', 'charities', 'winners']

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.logo}>GolfGives Admin</h1>
        <button onClick={() => router.push('/dashboard')} style={styles.exitBtn}>
          Exit Admin
        </button>
      </nav>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <p style={styles.statLabel}>Total Users</p>
          <p style={styles.statVal}>{users.length}</p>
        </div>
        <div style={styles.stat}>
          <p style={styles.statLabel}>Active Subscribers</p>
          <p style={styles.statVal}>
            {users.filter(u => u.subscription_status === 'active').length}
          </p>
        </div>
        <div style={styles.stat}>
          <p style={styles.statLabel}>Total Draws</p>
          <p style={styles.statVal}>{draws.length}</p>
        </div>
        <div style={styles.stat}>
          <p style={styles.statLabel}>Charities Listed</p>
          <p style={styles.statVal}>{charities.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsRow}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? styles.tabActive : styles.tab}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h3 style={styles.sectionTitle}>All Users ({users.length})</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Subscription</th>
                  <th style={styles.th}>Plan</th>
                  <th style={styles.th}>Charity %</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td style={styles.td}>{user.full_name || '—'}</td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>
                      <span style={user.subscription_status === 'active' ? styles.active : styles.inactive}>
                        {user.subscription_status || 'inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>{user.subscription_plan || '—'}</td>
                    <td style={styles.td}>{user.charity_percentage || 10}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Draws Tab */}
        {activeTab === 'draws' && (
          <div>
            <h3 style={styles.sectionTitle}>Draw Management</h3>

            {/* Simulate Draw */}
            <div style={styles.drawBox}>
              <p style={styles.drawBoxTitle}>Run a New Draw</p>
              <div style={styles.drawForm}>
                <input
                  value={drawMonth}
                  onChange={(e) => setDrawMonth(e.target.value)}
                  placeholder="Month (e.g. April 2026)"
                  style={styles.input}
                />
                <button onClick={simulateDraw} style={styles.simBtn}>
                  Simulate Draw
                </button>
              </div>

              {simResult && (
                <div style={styles.simResult}>
                  <p style={styles.simLabel}>Simulated winning numbers:</p>
                  <div style={styles.numbers}>
                    {simResult.map((n, i) => (
                      <span key={i} style={styles.number}>{n}</span>
                    ))}
                  </div>
                  <button onClick={publishDraw} style={styles.publishBtn}>
                    Publish This Draw
                  </button>
                </div>
              )}
            </div>

            {/* Past Draws */}
            {draws.map(draw => (
              <div key={draw.id} style={styles.drawCard}>
                <div>
                  <p style={styles.drawMonth}>{draw.month}</p>
                  <span style={draw.status === 'published' ? styles.active : styles.inactive}>
                    {draw.status}
                  </span>
                </div>
                {draw.winning_numbers && (
                  <div style={styles.numbers}>
                    {draw.winning_numbers.map((n, i) => (
                      <span key={i} style={styles.number}>{n}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Charities Tab */}
        {activeTab === 'charities' && (
          <div>
            <h3 style={styles.sectionTitle}>Manage Charities</h3>

            {/* Add Charity */}
            <div style={styles.drawBox}>
              <p style={styles.drawBoxTitle}>Add New Charity</p>
              <div style={styles.charityForm}>
                <input
                  value={newCharity.name}
                  onChange={(e) => setNewCharity({ ...newCharity, name: e.target.value })}
                  placeholder="Charity name"
                  style={styles.input}
                />
                <input
                  value={newCharity.description}
                  onChange={(e) => setNewCharity({ ...newCharity, description: e.target.value })}
                  placeholder="Description"
                  style={styles.input}
                />
                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={newCharity.is_featured}
                    onChange={(e) => setNewCharity({ ...newCharity, is_featured: e.target.checked })}
                  />
                  &nbsp; Featured charity
                </label>
                <button onClick={addCharity} style={styles.simBtn}>Add Charity</button>
              </div>
            </div>

            {/* Charities List */}
            {charities.map(charity => (
              <div key={charity.id} style={styles.charityRow}>
                <div>
                  <p style={styles.charityName}>
                    {charity.name}
                    {charity.is_featured && <span style={styles.featuredBadge}> ⭐ Featured</span>}
                  </p>
                  <p style={styles.charityDesc}>{charity.description}</p>
                </div>
                <button
                  onClick={() => deleteCharity(charity.id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Winners Tab */}
        {activeTab === 'winners' && (
          <div>
            <h3 style={styles.sectionTitle}>Winners & Payouts</h3>
            {winners.length === 0 ? (
              <p style={styles.empty}>No winners yet.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Match Type</th>
                    <th style={styles.th}>Prize Amount</th>
                    <th style={styles.th}>Verification</th>
                    <th style={styles.th}>Payout</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map(winner => (
                    <tr key={winner.id}>
                      <td style={styles.td}>{winner.match_type}</td>
                      <td style={styles.td}>₹{winner.prize_amount}</td>
                      <td style={styles.td}>{winner.verification_status}</td>
                      <td style={styles.td}>{winner.payout_status}</td>
                      <td style={styles.td}>
                        {winner.payout_status === 'pending' && (
                          <button
                            onClick={() => updateWinnerStatus(winner.id, 'paid')}
                            style={styles.payBtn}
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' },
  container: { minHeight: '100vh', backgroundColor: '#f9fafb' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' },
  logo: { fontSize: '20px', fontWeight: '700', color: '#16a34a' },
  exitBtn: { fontSize: '13px', color: '#6b7280', background: 'none', border: '1px solid #e5e7eb', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', padding: '24px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' },
  stat: { textAlign: 'center' },
  statLabel: { fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statVal: { fontSize: '24px', fontWeight: '700', color: '#111827' },
  tabsRow: { display: 'flex', gap: '4px', padding: '16px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' },
  tab: { padding: '8px 16px', borderRadius: '6px', fontSize: '14px', border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer' },
  tabActive: { padding: '8px 16px', borderRadius: '6px', fontSize: '14px', border: 'none', backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: '600', cursor: 'pointer' },
  content: { maxWidth: '960px', margin: '0 auto', padding: '32px 24px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e7eb' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f3f4f6' },
  active: { fontSize: '12px', backgroundColor: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: '20px' },
  inactive: { fontSize: '12px', backgroundColor: '#f3f4f6', color: '#6b7280', padding: '3px 10px', borderRadius: '20px' },
  drawBox: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px', marginBottom: '20px' },
  drawBoxTitle: { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '16px' },
  drawForm: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  input: { padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', flex: 1, minWidth: '200px' },
  simBtn: { backgroundColor: '#111827', color: '#fff', padding: '9px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' },
  simResult: { marginTop: '20px' },
  simLabel: { fontSize: '13px', color: '#6b7280', marginBottom: '12px' },
  numbers: { display: 'flex', gap: '8px', marginBottom: '16px' },
  number: { width: '36px', height: '36px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700' },
  publishBtn: { backgroundColor: '#16a34a', color: '#fff', padding: '9px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer' },
  drawCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px 20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  drawMonth: { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '6px' },
  charityForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
  checkLabel: { fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center' },
  charityRow: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px 20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  charityName: { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' },
  featuredBadge: { fontSize: '12px', color: '#16a34a' },
  charityDesc: { fontSize: '13px', color: '#6b7280' },
  deleteBtn: { fontSize: '13px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' },
  payBtn: { fontSize: '12px', backgroundColor: '#16a34a', color: '#fff', padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' },
  empty: { color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '40px 0' },
}