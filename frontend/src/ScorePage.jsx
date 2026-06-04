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
      <div style={{ background: '#1e293b', borderRadius: '16px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏍️</div>
        <h2 style={{ color: '#6366f1', marginBottom: '8px' }}>Check Your Score</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Enter your WhatsApp number to see your points</p>

        <input
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '15px', marginBottom: '12px', boxSizing: 'border-box' }}
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
          placeholder="91XXXXXXXXXX"
          maxLength={12}
        />
        <button onClick={checkScore} disabled={loading}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontSize: '15px', cursor: 'pointer', fontWeight: '600', marginBottom: '16px' }}>
          {loading ? 'Checking...' : 'Check Score →'}
        </button>

        {error && <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>}

        {rider && (
          <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', marginTop: '16px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>Welcome back</p>
            <p style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>{rider.name}</p>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>Points</p>
                <p style={{ color: '#6366f1', fontSize: '28px', fontWeight: '700' }}>{rider.points}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '12px' }}>Segment</p>
                <p style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>{rider.segment}</p>
              </div>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '8px', padding: '12px' }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>Your Referral Code</p>
              <p style={{ color: '#6366f1', fontSize: '24px', fontWeight: '700', letterSpacing: '3px' }}>{rider.referral_code}</p>
            </div>
            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '12px' }}>Share your code to earn more points!</p>
          </div>
        )}
      </div>
    </div>
  )
}