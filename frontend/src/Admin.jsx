import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://road-warrior-backend.onrender.com'

export default function Admin() {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    axios.get(`${API}/api/riders`).then(res => {
      setRiders(res.data)
      setLoading(false)
    })
  }, [])

  const segments = ['All', 'Hot EV Lead', 'Insurance Lead', 'EV Rider', 'Petrol Rider']
  const filtered = filter === 'All' ? riders : riders.filter(r => r.segment === filter)

  const cardStyle = {
    background: '#1e293b', borderRadius: '12px',
    padding: '16px', marginBottom: '12px'
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6366f1', fontSize: '18px' }}>Loading riders...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#6366f1', fontSize: '24px', marginBottom: '8px' }}>Admin Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>Road Warrior EV Challenge</p>

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
            <p style={{ color: s.color, fontSize: '28px', fontWeight: '700' }}>{s.value}</p>
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
        Leaderboard ({filtered.length} riders)
      </h2>
      {filtered.map((r, i) => (
        <div key={r.id} style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '700' }}>
                {i + 1}
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: '600', fontSize: '15px' }}>{r.name || 'Unknown'}</p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>{r.city} • {r.platform} • {r.whatsapp}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#6366f1', fontWeight: '700', fontSize: '18px' }}>{r.points} pts</p>
              <p style={{ color: '#10b981', fontSize: '12px' }}>{r.segment}</p>
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>
              {r.vehicle_type}
            </span>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>
              ₹{r.weekly_fuel}/week fuel
            </span>
            <span style={{ background: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>
              Code: {r.referral_code}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}