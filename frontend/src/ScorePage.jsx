import { useState } from 'react'
import axios from 'axios'

const API = 'https://road-warrior-backend.onrender.com'

export default function ScorePage() {
  const [phone, setPhone] = useState('')
  const [rider, setRider] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const checkScore = async () => {
    if (!phone.trim()) { alert('Please enter your phone number'); return }
    setLoading(true)
    setError('')
    setRider(null)
    try {
      const res = await axios.get(`${API}/api/score/${phone}`)
      setRider(res.data)
    } catch (e) {
      setError('Rider not found. Please check your number.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '20px' }}>
      <div style={{ maxWidth: '420px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏍️</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', background: 'linear-gradient(90deg, #f97316, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Road Warrior EV
          </h1>
        </div>

        <div style={{ background: '#1e293b', borderRadius: '20px', padding: '32px', border: '1px solid #334155' }}>
          <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px', textAlign: 'center' }}>Check Your Score</h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px', textAlign: 'center' }}>Enter your WhatsApp number to see your points</p>

          <input
            style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '2px solid #334155', background: '#0f172a', color: '#fff', fontSize: '15px', marginBottom: '12px', boxSizing: 'border-box' }}
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
            maxLength={10}
          />
          <button onClick={checkScore} disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', fontSize: '16px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 15px rgba(249,115,22,0.4)' }}>
            {loading ? 'Checking...' : 'Check Score →'}
          </button>

          {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '12px', textAlign: 'center' }}>{error}</p>}

          {rider && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ background: '#0f172a', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px solid #f97316' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>Welcome back</p>
                <p style={{ color: '#fff', fontSize: '22px', fontWeight: '700', marginBottom: '20px' }}>{rider.name}</p>

                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: '12px' }}>Points</p>
                    <p style={{ color: '#f97316', fontSize: '36px', fontWeight: '700' }}>{rider.points}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: '12px' }}>City</p>
                    <p style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{rider.city}</p>
                  </div>
                </div>

                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Your Referral Code</p>
                  <p style={{ color: '#f97316', fontSize: '28px', fontWeight: '700', letterSpacing: '4px' }}>{rider.referral_code}</p>
                </div>

                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '12px' }}>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Segment</p>
                  <p style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>{rider.segment}</p>
                </div>

                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '16px' }}>Share your code to earn more points!</p>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/" style={{ color: '#f97316', fontSize: '14px', textDecoration: 'none', fontWeight: '600' }}>← Register Now</a>
        </div>
      </div>
    </div>
  )
}