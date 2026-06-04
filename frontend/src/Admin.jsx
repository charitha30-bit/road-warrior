import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://road-warrior-backend.onrender.com'

export default function Admin() {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('All')
  const [token, setToken] = useState(localStorage.getItem('adminToken'))
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  useEffect(() => {
    if (token) fetchRiders()
  }, [token])

  const fetchRiders = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/admin/riders`, {
        headers: { authorization: token }
      })
      setRiders(res.data)
    } catch (e) {
      localStorage.removeItem('adminToken')
      setToken(null)
    }
    setLoading(false)
  }

  const handleLogin = async () => {
    setLoginLoading(true)
    try {
      const res = await axios.post(`${API}/api/admin/login`, { password })
      localStorage.setItem('adminToken', res.data.token)
      setToken(res.data.token)
    } catch (e) {
      alert('Wrong password!')
    }
    setLoginLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setRiders([])
  }

  const segments = ['All', 'Hot EV Lead', 'Insurance Lead', 'EV Rider', 'Petrol Rider']
  const filtered = filter === 'All' ? riders : riders.filter(r => r.segment === filter)

  if (!token) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ background: '#1e293b', borderRadius: '16px', padding: '40px', textAlign: 'center', width: '320px' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔐</div>
        <h2 style={{ color: '#6366f1', marginBottom: '8px' }}>Admin Login</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Road Warrior Dashboard</p>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '15px', marginBottom: '12px', boxSizing: 'border-box' }}
        />
        <button onClick={handleLogin} disabled={loginLoading}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontSize: '15px', cursor: 'pointer', fontWeight: '600' }}>
          {loginLoading ? 'Logging in...' : 'Login →'}
        </button>
      </div>
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <p style={{ color: '#6366f1', fontSize: '18px' }}>Loading riders...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', padding: '20px', maxWidth: '800px', margin: '0 auto', background: '#0f172a' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#6366f1', fontSize: '24px', margin: 0 }}>Admin Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Road Warrior EV Challenge</p>
        </div>
        <button onClick={handleLogout}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}>
          Logout
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Riders', value: riders.length, color: '#6366f1' },
          { label: 'Hot EV Leads', value: riders.filter(r => r.segment === 'Hot EV Lead').length, color: '#10b981' },
          { label: 'Insurance Leads', value: riders.filter(r => r.segment === 'Insurance Lead').length, color: '#f59e0b' },
          { label: 'EV Riders', value: riders.filter(r => r.segment === 'EV Rider').length, color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: '28px', fontWeight: '700', margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {segments.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid',
              borderColor: filter === s ? '#6366f1' : '#334155',
              background: filter === s ? '#6366f1' : 'transparent',
              color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <h2 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
        Leaderboard — {filtered.length} riders
      </h2>
      {filtered.map((r, i) => (
        <div key={r.id} style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: '600', fontSize: '15px', margin: 0 }}>{r.name || 'Unknown'}</p>
                <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{r.city} • {r.platform} • {r.whatsapp}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#6366f1', fontWeight: '700', fontSize: '18px', margin: 0 }}>{r.points} pts</p>
              <p style={{ color: '#10b981', fontSize: '12px', margin: 0 }}>{r.segment}</p>
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>{r.vehicle_type}</span>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>₹{r.weekly_fuel}/week</span>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>Code: {r.referral_code}</span>
            {r.accident_insurance === 'No' && <span style={{ background: '#7f1d1d', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#fca5a5' }}>No Accident Insurance</span>}
            {r.health_insurance === 'No' && <span style={{ background: '#7f1d1d', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#fca5a5' }}>No Health Insurance</span>}
          </div>
        </div>
      ))}
    </div>
  )
}