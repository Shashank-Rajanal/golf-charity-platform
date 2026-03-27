'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const plans = {
    monthly: { label: 'Monthly', price: 499, period: 'per month' },
    yearly: { label: 'Yearly', price: 4499, period: 'per year', saving: 'Save 25%' },
  }

  async function handlePayment() {
    setLoading(true)
    setError('')

    if (!cardNumber || !expiry || !cvv || !name) {
      setError('Please fill in all payment details')
      setLoading(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const endDate = selectedPlan === 'monthly'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

    // Insert subscription record
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan: selectedPlan,
        amount: plans[selectedPlan].price,
        status: 'active',
        end_date: endDate,
      })

    if (subError) { setError(subError.message); setLoading(false); return }

    // Update profile subscription status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: selectedPlan,
        subscription_end_date: endDate,
      })
      .eq('id', user.id)

    if (profileError) { setError(profileError.message); setLoading(false); return }

    router.push('/dashboard')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>GolfGives</h1>
        <h2 style={styles.title}>Choose your plan</h2>
        <p style={styles.sub}>Cancel anytime. No hidden fees.</p>

        <div style={styles.plans}>
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key)}
              style={selectedPlan === key ? styles.planSelected : styles.plan}
            >
              <div style={styles.planTop}>
                <span style={styles.planLabel}>{plan.label}</span>
                {plan.saving && <span style={styles.planBadge}>{plan.saving}</span>}
              </div>
              <p style={styles.planPrice}>₹{plan.price}</p>
              <p style={styles.planPeriod}>{plan.period}</p>
            </div>
          ))}
        </div>

        <div style={styles.form}>
          <p style={styles.formTitle}>Payment details</p>
          <p style={styles.mockNote}>🔒 Demo mode — no real payment processed</p>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.field}>
            <label style={styles.label}>Name on card</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Card number</label>
            <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19} style={styles.input} />
          </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Expiry</label>
              <input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} style={styles.input} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>CVV</label>
              <input value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" maxLength={3} style={styles.input} />
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            style={loading ? styles.btnDisabled : styles.btn}
          >
            {loading ? 'Processing...' : `Pay ₹${plans[selectedPlan].price}`}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  card: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '480px' },
  logo: { fontSize: '20px', fontWeight: '700', color: '#16a34a', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '6px' },
  sub: { fontSize: '14px', color: '#6b7280', marginBottom: '28px' },
  plans: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' },
  plan: { border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', cursor: 'pointer' },
  planSelected: { border: '2px solid #16a34a', borderRadius: '10px', padding: '16px', cursor: 'pointer', backgroundColor: '#f0fdf4' },
  planTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  planLabel: { fontSize: '14px', fontWeight: '600', color: '#111827' },
  planBadge: { fontSize: '11px', backgroundColor: '#16a34a', color: '#fff', padding: '2px 8px', borderRadius: '20px' },
  planPrice: { fontSize: '22px', fontWeight: '700', color: '#16a34a', marginBottom: '2px' },
  planPeriod: { fontSize: '12px', color: '#6b7280' },
  form: { borderTop: '1px solid #e5e7eb', paddingTop: '24px' },
  formTitle: { fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '6px' },
  mockNote: { fontSize: '12px', color: '#6b7280', marginBottom: '20px' },
  error: { color: '#dc2626', fontSize: '13px', marginBottom: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', flex: 1 },
  label: { fontSize: '13px', fontWeight: '500', color: '#374151' },
  input: { padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none' },
  row: { display: 'flex', gap: '12px' },
  btn: { width: '100%', backgroundColor: '#16a34a', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', border: 'none', marginTop: '8px', cursor: 'pointer' },
  btnDisabled: { width: '100%', backgroundColor: '#86efac', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', border: 'none', marginTop: '8px', cursor: 'not-allowed' },
}