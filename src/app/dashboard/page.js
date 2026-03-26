'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState('')
  const [scoreError, setScoreError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(profile)
    await getScores(user.id)
    setLoading(false)
  }

  async function getScores(userId) {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5)

    setScores(data || [])
  }

  async function addScore() {
    setScoreError('')

    if (!newScore || !newDate) {
      setScoreError('Please enter both score and date')
      return
    }

    const scoreNum = parseInt(newScore)
    if (scoreNum < 1 || scoreNum > 45) {
      setScoreError('Score must be between 1 and 45')
      return
    }

    // If already 5 scores, delete the oldest one
    if (scores.length >= 5) {
      const oldest = scores[scores.length - 1]
      await supabase.from('scores').delete().eq('id', oldest.id)
    }

    const { error } = await supabase.from('scores').insert({
      user_id: user.id,
      score: scoreNum,
      date: newDate,
    })

    if (error) {
      setScoreError(error.message)
      return
    }

    setNewScore('')
    setNewDate('')
    await getScores(user.id)
  }

  async function deleteScore(scoreId) {
    await supabase.from('scores').delete().eq('id', scoreId)
    await getScores(user.id)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <h1 style={styles.logo}>GolfGives</h1>
        <div style={styles.navRight}>
          <span style={styles.navName}>
            {profile?.full_name || user?.email}
          </span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sign out
          </button>
        </div>
      </nav>

      <main style={styles.main}>
        {/* Welcome */}
        <div style={styles.welcomeRow}>
			{/* Quick Nav */}
			<div style={styles.quickNav}>
			<button onClick={() => router.push('/subscribe')} style={styles.quickNavBtn}>
				💳 Subscription
			</button>
			<button onClick={() => router.push('/charities')} style={styles.quickNavBtn}>
				❤️ Charities
			</button>
			<button onClick={() => router.push('/draws')} style={styles.quickNavBtn}>
				🏆 Draws
			</button>
			<button onClick={() => router.push('/admin')} style={styles.quickNavBtn}>
				⚙️ Admin Panel
			</button>
			</div>
          <div>
            <h2 style={styles.welcomeTitle}>
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Golfer'} 👋
            </h2>
            <p style={styles.welcomeSub}>Here's your golf summary</p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Subscription</p>
            <p style={styles.statValue}>
              {profile?.subscription_status === 'active' ? '✅ Active' : '⚠️ Inactive'}
            </p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Scores Entered</p>
            <p style={styles.statValue}>{scores.length} / 5</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Charity Contribution</p>
            <p style={styles.statValue}>{profile?.charity_percentage || 10}%</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Draws Entered</p>
            <p style={styles.statValue}>0</p>
          </div>
        </div>

        {/* Score Entry */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>My Scores</h3>
          <p style={styles.sectionSub}>
            Enter your last 5 Stableford scores (1–45). 
            A new score automatically replaces the oldest.
          </p>

          {/* Add Score Form */}
          <div style={styles.scoreForm}>
            <input
              type="number"
              min="1"
              max="45"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              placeholder="Score (1-45)"
              style={styles.scoreInput}
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={styles.scoreInput}
            />
            <button onClick={addScore} style={styles.addBtn}>
              Add Score
            </button>
          </div>

          {scoreError && (
            <p style={styles.scoreError}>{scoreError}</p>
          )}

          {/* Scores List */}
          {scores.length === 0 ? (
            <p style={styles.emptyText}>
              No scores yet. Add your first score above!
            </p>
          ) : (
            <div style={styles.scoresList}>
              {scores.map((score, index) => (
                <div key={score.id} style={styles.scoreRow}>
                  <div style={styles.scoreLeft}>
                    <span style={styles.scoreRank}>#{index + 1}</span>
                    <span style={styles.scoreNum}>{score.score} pts</span>
                    <span style={styles.scoreDate}>
                      {new Date(score.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteScore(score.id)}
                    style={styles.deleteBtn}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscription Banner */}
        {profile?.subscription_status !== 'active' && (
          <div style={styles.subscriptionBanner}>
            <div>
              <p style={styles.bannerTitle}>You don't have an active subscription</p>
              <p style={styles.bannerSub}>
                Subscribe to enter monthly draws and support your charity
              </p>
            </div>
            <button
              onClick={() => router.push('/subscribe')}
              style={styles.subscribeBtn}
            >
              Subscribe now
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '14px',
  },
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#16a34a',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  navName: {
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500',
  },
  logoutBtn: {
    fontSize: '14px',
    color: '#6b7280',
    background: 'none',
    border: '1px solid #e5e7eb',
    padding: '6px 14px',
    borderRadius: '6px',
  },
  main: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  welcomeRow: {
    marginBottom: '32px',
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '4px',
  },
  welcomeSub: {
    fontSize: '14px',
    color: '#6b7280',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '20px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '8px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '28px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  },
  sectionSub: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '20px',
  },
  scoreForm: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  scoreInput: {
    padding: '9px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    flex: '1',
    minWidth: '140px',
  },
  addBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    padding: '9px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
  },
  scoreError: {
    color: '#dc2626',
    fontSize: '13px',
    marginBottom: '12px',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: '14px',
    textAlign: 'center',
    padding: '32px 0',
  },
  scoresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  scoreLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  scoreRank: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500',
    width: '24px',
  },
  scoreNum: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#16a34a',
  },
  scoreDate: {
    fontSize: '13px',
    color: '#6b7280',
  },
  deleteBtn: {
    fontSize: '13px',
    color: '#dc2626',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  subscriptionBanner: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '24px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  bannerTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  },
  bannerSub: {
    fontSize: '13px',
    color: '#6b7280',
  },
  subscribeBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },

	quickNav: {
	display: 'flex',
	gap: '12px',
	marginBottom: '32px',
	flexWrap: 'wrap',
	},
	quickNavBtn: {
	padding: '9px 18px',
	backgroundColor: '#ffffff',
	border: '1px solid #e5e7eb',
	borderRadius: '8px',
	fontSize: '13px',
	fontWeight: '500',
	color: '#374151',
	cursor: 'pointer',
	},
}