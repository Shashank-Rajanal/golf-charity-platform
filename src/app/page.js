import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.logo}>GolfGives</h1>
        <div style={styles.navLinks}>
          <Link href="/login" style={styles.loginBtn}>Sign in</Link>
          <Link href="/signup" style={styles.signupBtn}>Get started</Link>
        </div>
      </nav>

      <main style={styles.hero}>
        <p style={styles.tag}>Play. Win. Give.</p>
        <h2 style={styles.heading}>Golf that makes<br />a difference</h2>
        <p style={styles.description}>
          Track your scores, enter monthly prize draws, and support
          a charity you care about — all in one place.
        </p>
        <Link href="/signup" style={styles.ctaBtn}>
          Start your subscription
        </Link>
      </main>

      <section style={styles.features}>
        <div style={styles.feature}>
          <span style={styles.icon}>⛳</span>
          <h3 style={styles.featureTitle}>Track Scores</h3>
          <p style={styles.featureText}>Enter your Stableford scores and track your last 5 rounds.</p>
        </div>
        <div style={styles.feature}>
          <span style={styles.icon}>🏆</span>
          <h3 style={styles.featureTitle}>Win Prizes</h3>
          <p style={styles.featureText}>Monthly draws with real cash prizes across 3 match tiers.</p>
        </div>
        <div style={styles.feature}>
          <span style={styles.icon}>❤️</span>
          <h3 style={styles.featureTitle}>Give Back</h3>
          <p style={styles.featureText}>A portion of every subscription goes to your chosen charity.</p>
        </div>
      </section>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter, sans-serif',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid #e5e7eb',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#16a34a',
  },
  navLinks: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  loginBtn: {
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500',
  },
  signupBtn: {
    fontSize: '14px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '500',
  },
  hero: {
    maxWidth: '640px',
    margin: '0 auto',
    padding: '80px 24px',
    textAlign: 'center',
  },
  tag: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#16a34a',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  heading: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#111827',
    lineHeight: '1.2',
    marginBottom: '20px',
  },
  description: {
    fontSize: '18px',
    color: '#6b7280',
    lineHeight: '1.7',
    marginBottom: '32px',
  },
  ctaBtn: {
    display: 'inline-block',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
  },
  features: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    padding: '60px 40px',
    backgroundColor: '#f9fafb',
    flexWrap: 'wrap',
  },
  feature: {
    maxWidth: '240px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '12px',
  },
  featureTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
  },
  featureText: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
  },
}