import { useState } from 'react'
import axios from 'axios'

const API = 'https://road-warrior-backend.onrender.com'

const translations = {
  en: {
    title: 'Road Warrior EV Challenge',
    subtitle: 'Join thousands of riders shaping the future of mobility',
    next: 'Next', back: 'Back', submit: 'Submit & Get My Referral Code',
    sections: ['Personal Info', 'Vehicle Info', 'Expenses', 'Challenges', 'Insurance', 'Interests'],
    name: 'Full Name', whatsapp: 'WhatsApp Number', city: 'City', platform: 'Platform',
    experience: 'Years of Experience', vehicle: 'Vehicle Type', brand: 'Vehicle Brand',
    fuel: 'Fuel Type', weekly: 'Weekly Fuel Cost (₹)', monthly: 'Monthly Maintenance (₹)',
    challenges: 'Daily Challenges', openEV: 'Open to EV?', accident: 'Accident Insurance?',
    health: 'Health Insurance?', interested: 'Interested In', referral: 'Referral Code (if any)',
  },
  hi: {
    title: 'रोड वॉरियर EV चैलेंज',
    subtitle: 'हजारों राइडर्स के साथ जुड़ें',
    next: 'आगे', back: 'पीछे', submit: 'सबमिट करें',
    sections: ['व्यक्तिगत जानकारी', 'वाहन जानकारी', 'खर्च', 'चुनौतियाँ', 'बीमा', 'रुचि'],
    name: 'पूरा नाम', whatsapp: 'WhatsApp नंबर', city: 'शहर', platform: 'प्लेटफॉर्म',
    experience: 'अनुभव (वर्ष)', vehicle: 'वाहन प्रकार', brand: 'वाहन ब्रांड',
    fuel: 'ईंधन प्रकार', weekly: 'साप्ताहिक ईंधन खर्च (₹)', monthly: 'मासिक रखरखाव (₹)',
    challenges: 'दैनिक चुनौतियाँ', openEV: 'EV के लिए तैयार?', accident: 'दुर्घटना बीमा?',
    health: 'स्वास्थ्य बीमा?', interested: 'रुचि', referral: 'रेफरल कोड (यदि कोई हो)',
  },
  kn: {
    title: 'ರೋಡ್ ವಾರಿಯರ್ EV ಚಾಲೆಂಜ್',
    subtitle: 'ಸಾವಿರಾರು ರೈಡರ್‌ಗಳೊಂದಿಗೆ ಸೇರಿ',
    next: 'ಮುಂದೆ', back: 'ಹಿಂದೆ', submit: 'ಸಲ್ಲಿಸಿ',
    sections: ['ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ', 'ವಾಹನ ಮಾಹಿತಿ', 'ವೆಚ್ಚಗಳು', 'ಸವಾಲುಗಳು', 'ವಿಮೆ', 'ಆಸಕ್ತಿ'],
    name: 'ಪೂರ್ಣ ಹೆಸರು', whatsapp: 'WhatsApp ಸಂಖ್ಯೆ', city: 'ನಗರ', platform: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್',
    experience: 'ಅನುಭವ (ವರ್ಷ)', vehicle: 'ವಾಹನ ಪ್ರಕಾರ', brand: 'ವಾಹನ ಬ್ರ್ಯಾಂಡ್',
    fuel: 'ಇಂಧನ ವಿಧ', weekly: 'ವಾರದ ಇಂಧನ ವೆಚ್ಚ (₹)', monthly: 'ಮಾಸಿಕ ನಿರ್ವಹಣೆ (₹)',
    challenges: 'ದೈನಂದಿನ ಸವಾಲುಗಳು', openEV: 'EV ಗೆ ತೆರೆದಿದ್ದೀರಾ?', accident: 'ಅಪಘಾತ ವಿಮೆ?',
    health: 'ಆರೋಗ್ಯ ವಿಮೆ?', interested: 'ಆಸಕ್ತಿ', referral: 'ರೆಫರಲ್ ಕೋಡ್ (ಇದ್ದರೆ)',
  }
}

export default function RegistrationForm() {
  const [lang, setLang] = useState('en')
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const t = translations[lang]

  const [form, setForm] = useState({
    name: '', whatsapp: '', city: '', platform: 'Swiggy',
    experience: 'Less than 1 year', vehicle_type: 'Petrol two-wheeler', brand: '',
    fuel_type: 'Petrol', weekly_fuel: '', monthly_maintenance: '',
    challenges: [], open_to_ev: 'Yes', accident_insurance: 'Yes',
    health_insurance: 'Yes', interested_in: 'EV loan information',
    referred_by: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleChallenge = (c) => {
    setForm(f => ({
      ...f,
      challenges: f.challenges.includes(c)
        ? f.challenges.filter(x => x !== c)
        : [...f.challenges, c]
    }))
  }

  const validate = () => {
    if (step === 0) {
      if (!form.name.trim()) { alert('Please enter your name'); return false }
      if (!form.whatsapp.trim()) { alert('Please enter your WhatsApp number'); return false }
      if (form.whatsapp.length < 10) { alert('Please enter a valid WhatsApp number'); return false }
      if (!form.city.trim()) { alert('Please enter your city'); return false }
    }
    if (step === 2) {
      if (!form.weekly_fuel) { alert('Please enter your weekly fuel cost'); return false }
      if (!form.monthly_maintenance) { alert('Please enter your monthly maintenance cost'); return false }
    }
    return true
  }

  const handleSubmit = async () => {
  setLoading(true)
  try {
    const res = await axios.post(`${API}/api/register`, form)
    setResult(res.data)
    setSubmitted(true)
  } catch (e) {
    if (e.response?.data?.error === 'duplicate') {
      alert('This WhatsApp number is already registered! Visit /score to check your points.')
    } else {
      alert('Something went wrong. Please try again.')
    }
  }
  setLoading(false)
}

  const copyCode = () => {
    navigator.clipboard.writeText(result?.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '1px solid #334155', background: '#1e293b',
    color: '#fff', fontSize: '15px', marginTop: '6px'
  }
  const labelStyle = {
    fontSize: '14px', color: '#94a3b8',
    display: 'block', marginTop: '16px'
  }
  const btnStyle = (primary) => ({
    padding: '12px 28px', borderRadius: '8px', border: 'none',
    background: primary ? '#6366f1' : '#1e293b',
    color: '#fff', fontSize: '15px', cursor: 'pointer', fontWeight: '600'
  })

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#1e293b', borderRadius: '16px', padding: '40px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
        <h2 style={{ color: '#6366f1', marginBottom: '8px' }}>Welcome, {form.name}!</h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>You are now a Road Warrior!</p>
        <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Your Referral Code</p>
          <p style={{ color: '#6366f1', fontSize: '32px', fontWeight: '700', letterSpacing: '4px' }}>{result?.referralCode}</p>
          <button onClick={copyCode} style={{
            marginTop: '12px', padding: '8px 20px', borderRadius: '8px',
            border: '1px solid #6366f1', background: copied ? '#6366f1' : 'transparent',
            color: '#fff', cursor: 'pointer', fontSize: '13px'
          }}>
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Points</p>
            <p style={{ color: '#fff', fontSize: '24px', fontWeight: '700' }}>{result?.points}</p>
          </div>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Segment</p>
            <p style={{ color: '#10b981', fontSize: '16px', fontWeight: '600' }}>{result?.segment}</p>
          </div>
        </div>
        <p style={{ color: '#64748b', fontSize: '13px' }}>Share your code with other riders to earn more points!</p>
<a href="/score" style={{ display: 'block', marginTop: '12px', color: '#6366f1', fontSize: '13px', textDecoration: 'none' }}>
  Check Your Score →
</a>
<a href="/admin" style={{ display: 'block', marginTop: '8px', color: '#334155', fontSize: '12px', textDecoration: 'none' }}>
  Leaderboard →
</a>
      </div>
    </div>
  )

  const steps = [
    <div key={0}>
      <label style={labelStyle}>{t.name} *</label>
      <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter your full name" />
      <label style={labelStyle}>{t.whatsapp} *</label>
      <input style={inputStyle} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value.replace(/\D/g, ''))} placeholder="91XXXXXXXXXX" maxLength={12} />
      <label style={labelStyle}>{t.city} *</label>
      <input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Your city" />
      <label style={labelStyle}>{t.platform}</label>
      <select style={inputStyle} value={form.platform} onChange={e => set('platform', e.target.value)}>
        {['Swiggy','Zomato','Blinkit','Zepto','Dunzo','Ola','Uber','Other'].map(p => <option key={p}>{p}</option>)}
      </select>
      <label style={labelStyle}>{t.experience}</label>
      <select style={inputStyle} value={form.experience} onChange={e => set('experience', e.target.value)}>
        {['Less than 1 year','1-2 years','3-5 years','5+ years'].map(x => <option key={x}>{x}</option>)}
      </select>
    </div>,

    <div key={1}>
      <label style={labelStyle}>{t.vehicle}</label>
      <select style={inputStyle} value={form.vehicle_type} onChange={e => set('vehicle_type', e.target.value)}>
        {['Petrol two-wheeler','Electric two-wheeler','CNG two-wheeler'].map(v => <option key={v}>{v}</option>)}
      </select>
      <label style={labelStyle}>{t.brand}</label>
      <input style={inputStyle} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Honda, Hero, Ola S1" />
      <label style={labelStyle}>{t.fuel}</label>
      <select style={inputStyle} value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)}>
        {['Petrol','Electric','CNG'].map(f => <option key={f}>{f}</option>)}
      </select>
    </div>,

    <div key={2}>
      <label style={labelStyle}>{t.weekly} *</label>
      <input style={inputStyle} type="number" value={form.weekly_fuel} onChange={e => set('weekly_fuel', e.target.value)} placeholder="e.g. 500" />
      <label style={labelStyle}>{t.monthly} *</label>
      <input style={inputStyle} type="number" value={form.monthly_maintenance} onChange={e => set('monthly_maintenance', e.target.value)} placeholder="e.g. 1000" />
    </div>,

    <div key={3}>
      <label style={labelStyle}>{t.challenges}</label>
      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {['High fuel costs','Vehicle breakdown','Long charging time','No charging stations','Traffic','Low battery range','High maintenance'].map(c => (
          <button key={c} type="button" onClick={() => toggleChallenge(c)}
            style={{ padding: '8px 14px', borderRadius: '20px', border: '1px solid',
              borderColor: form.challenges.includes(c) ? '#6366f1' : '#334155',
              background: form.challenges.includes(c) ? '#6366f1' : 'transparent',
              color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
            {c}
          </button>
        ))}
      </div>
      <label style={labelStyle}>{t.openEV}</label>
      <select style={inputStyle} value={form.open_to_ev} onChange={e => set('open_to_ev', e.target.value)}>
        <option>Yes</option><option>No</option><option>Maybe</option>
      </select>
    </div>,

    <div key={4}>
      <label style={labelStyle}>{t.accident}</label>
      <select style={inputStyle} value={form.accident_insurance} onChange={e => set('accident_insurance', e.target.value)}>
        <option>Yes</option><option>No</option>
      </select>
      <label style={labelStyle}>{t.health}</label>
      <select style={inputStyle} value={form.health_insurance} onChange={e => set('health_insurance', e.target.value)}>
        <option>Yes</option><option>No</option>
      </select>
    </div>,

    <div key={5}>
      <label style={labelStyle}>{t.interested}</label>
      <select style={inputStyle} value={form.interested_in} onChange={e => set('interested_in', e.target.value)}>
        {['EV loan information','Retrofit information','Insurance plans','Fuel saving tips','All of the above'].map(i => <option key={i}>{i}</option>)}
      </select>
      <label style={labelStyle}>{t.referral}</label>
      <input style={inputStyle} value={form.referred_by} onChange={e => set('referred_by', e.target.value)} placeholder="e.g. RW-1234" />
    </div>
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: '30px 0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          {['EN','हि','ಕ'].map((l, i) => (
            <button key={i} onClick={() => setLang(['en','hi','kn'][i])}
              style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid',
                borderColor: lang === ['en','hi','kn'][i] ? '#6366f1' : '#334155',
                background: lang === ['en','hi','kn'][i] ? '#6366f1' : 'transparent',
                color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
              {l}
            </button>
          ))}
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#6366f1' }}>{t.title}</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>{t.subtitle}</p>
      </div>

      <div style={{ background: '#1e293b', borderRadius: '4px', height: '6px', marginBottom: '8px' }}>
        <div style={{ background: '#6366f1', height: '100%', borderRadius: '4px',
          width: `${((step + 1) / 6) * 100}%`, transition: 'width 0.3s' }} />
      </div>
      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
        {t.sections[step]} — {step + 1} of 6
      </p>

      <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px' }}>
        {steps[step]}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingBottom: '40px' }}>
        {step > 0
          ? <button style={btnStyle(false)} onClick={() => setStep(s => s - 1)}>{t.back}</button>
          : <div />}
        {step < 5
          ? <button style={btnStyle(true)} onClick={() => { if (validate()) setStep(s => s + 1) }}>{t.next}</button>
          : <button style={btnStyle(true)} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : t.submit}
            </button>}
      </div>
    </div>
  )
}