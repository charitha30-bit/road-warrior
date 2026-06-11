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
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
  if (token) {
    fetchRiders()
    // Auto logout after 30 minutes
    const timeout = setTimeout(() => {
      localStorage.removeItem('adminToken')
      setToken(null)
      alert('Session expired. Please login again.')
    }, 30 * 60 * 1000)
    return () => clearTimeout(timeout)
  }
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
    setLoginError('')
    try {
      const res = await axios.post(`${API}/api/admin/login`, { password })
      localStorage.setItem('adminToken', res.data.token)
      setToken(res.data.token)
    } catch (e) {
      if (e.response?.data?.error) {
        setLoginError(e.response.data.error)
      } else {
        setLoginError('Wrong password!')
      }
    }
    setLoginLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setRiders([])
  }

  const segments = ['All', 'EV_SALE_LEAD', 'EV_RENTAL_LEAD', 'RETROFIT_LEAD', 'BIKE_INSURANCE_LEAD', 'PERSONAL_INSURANCE_LEAD', 'PRODUCT_LEAD']
  const filtered = filter === 'All' ? riders : riders.filter(r => r.segment === filter)

  const segmentColor = (seg) => {
    if (seg === 'EV_SALE_LEAD') return '#10b981'
    if (seg === 'EV_RENTAL_LEAD') return '#3b82f6'
    if (seg === 'RETROFIT_LEAD') return '#f97316'
    if (seg === 'BIKE_INSURANCE_LEAD') return '#f59e0b'
    if (seg === 'PERSONAL_INSURANCE_LEAD') return '#ef4444'
    return '#8b5cf6'
  }

  if (!token) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ background: '#1e293b', borderRadius: '20px', padding: '40px', textAlign: 'center', width: '320px', border: '1px solid #334155' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔐</div>
        <h2 style={{ background: 'linear-gradient(90deg, #f97316, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', fontSize: '22px' }}>Admin Login</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Road Warrior Dashboard</p>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '2px solid #334155', background: '#0f172a', color: '#fff', fontSize: '15px', marginBottom: '12px', boxSizing: 'border-box' }}
        />
        {loginError && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{loginError}</p>}
        <button onClick={handleLogin} disabled={loginLoading}
          style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', fontSize: '16px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 15px rgba(249,115,22,0.4)' }}>
          {loginLoading ? 'Logging in...' : 'Login →'}
        </button>
      </div>
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <p style={{ color: '#f97316', fontSize: '18px' }}>Loading riders...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', padding: '20px', maxWidth: '900px', margin: '0 auto', background: '#0f172a' }}>

      {/* Header */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
  <button onClick={() => {
    const headers = ['Name','Phone','City','PIN','Platform','Vehicle','Segment','Points','Referral Code','Created']
    const rows = filtered.map(r => [
      r.name, r.whatsapp, r.city, r.pin_code, r.platform,
      r.vehicle_type, r.segment, r.points, r.referral_code,
      new Date(r.created_at).toLocaleDateString()
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `road-warrior-${filter}-${Date.now()}.csv`
    a.click()
  }}
  style={{ padding: '10px 20px', borderRadius: '10px', border: '2px solid #10b981', background: 'transparent', color: '#10b981', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
    ⬇️ Download CSV
  </button>
  <button onClick={handleLogout}
    style={{ padding: '10px 20px', borderRadius: '10px', border: '2px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
    Logout
  </button>
</div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Total Riders', value: riders.length, color: '#f97316' },
          { label: 'EV Sale Leads', value: riders.filter(r => r.segment === 'EV_SALE_LEAD').length, color: '#10b981' },
          { label: 'EV Rental', value: riders.filter(r => r.segment === 'EV_RENTAL_LEAD').length, color: '#3b82f6' },
          { label: 'Retrofit', value: riders.filter(r => r.segment === 'RETROFIT_LEAD').length, color: '#f97316' },
          { label: 'Insurance', value: riders.filter(r => r.segment?.includes('INSURANCE')).length, color: '#ef4444' },
          { label: 'Product', value: riders.filter(r => r.segment === 'PRODUCT_LEAD').length, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#1e293b', borderRadius: '14px', padding: '16px', textAlign: 'center', border: '1px solid #334155' }}>
            <p style={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: '28px', fontWeight: '700', margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {segments.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '8px 14px', borderRadius: '20px', border: '2px solid',
              borderColor: filter === s ? '#f97316' : '#334155',
              background: filter === s ? '#f97316' : 'transparent',
              color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: filter === s ? '600' : '400' }}>
            {s === 'All' ? 'All' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <h2 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: '600' }}>
        Leaderboard — {filtered.length} riders
      </h2>

      {filtered.map((r, i) => (
        <div key={r.id} style={{ background: '#1e293b', borderRadius: '16px', padding: '20px', marginBottom: '12px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: '600', fontSize: '16px', margin: 0 }}>{r.name || 'Unknown'}</p>
                <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>{r.city} {r.pin_code ? `- ${r.pin_code}` : ''} • {r.whatsapp}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#f97316', fontWeight: '700', fontSize: '20px', margin: 0 }}>{r.points} pts</p>
              <p style={{ color: segmentColor(r.segment), fontSize: '11px', margin: 0, fontWeight: '600' }}>{r.segment?.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>{r.vehicle_type}</span>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>₹{r.weekly_fuel}/week</span>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#f97316' }}>Code: {r.referral_code}</span>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>{r.platform}</span>
            {r.accident_insurance === 'No' && <span style={{ background: '#7f1d1d', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#fca5a5' }}>No Accident Insurance</span>}
            {r.health_insurance === 'No' && <span style={{ background: '#7f1d1d', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#fca5a5' }}>No Health Insurance</span>}
          </div>
        </div>
      ))}
    </div>
  )
}