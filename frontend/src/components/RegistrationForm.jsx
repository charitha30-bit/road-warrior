import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://road-warrior-backend.onrender.com'

const translations = {
  en: {
    title: 'Road Warrior EV Challenge',
    subtitle: 'Join thousands of riders shaping the future of mobility',
    next: 'Next →', back: '← Back', submit: 'Submit & Get My Referral Code 🏆',
    sections: ['Personal Info', 'Vehicle Info', 'Expenses', 'Challenges', 'Insurance', 'Interests'],
    name: 'Full Name', whatsapp: 'WhatsApp Number', city: 'City',
    pincode: 'PIN Code', platform: 'Delivery Platform (select all that apply)',
    experience: 'Years of Experience', vehicle: 'Vehicle Type', brand: 'Vehicle Brand & Model',
    fuel: 'How do you fuel/charge?', weekly: 'Weekly Fuel/Charge Cost (₹)',
    monthly: 'Monthly Maintenance Cost (₹)', challenges: 'Top Challenges (select all)',
    openEV: 'Are you open to switching to EV?', switchReasons: 'What would make you switch?',
    accident: 'Do you have Accident Insurance?', health: 'Do you have Health Insurance?',
    paidPocket: 'Ever paid out of pocket for an accident?',
    interested: 'What are you interested in?', referral: 'Referral Code (if any)',
    products: 'Which accessories would help your daily delivery work?',
    consent: 'I agree to share my data with Road Warrior EV Challenge for research purposes',
  },
  hi: {
    title: 'रोड वॉरियर EV चैलेंज',
    subtitle: 'हजारों राइडर्स के साथ जुड़ें',
    next: 'आगे →', back: '← पीछे', submit: 'सबमिट करें 🏆',
    sections: ['व्यक्तिगत जानकारी', 'वाहन जानकारी', 'खर्च', 'चुनौतियाँ', 'बीमा', 'रुचि'],
    name: 'पूरा नाम', whatsapp: 'WhatsApp नंबर', city: 'शहर',
    pincode: 'पिन कोड', platform: 'डिलीवरी प्लेटफॉर्म',
    experience: 'अनुभव (वर्ष)', vehicle: 'वाहन प्रकार', brand: 'वाहन ब्रांड',
    fuel: 'ईंधन/चार्जिंग कैसे करते हैं?', weekly: 'साप्ताहिक ईंधन खर्च (₹)',
    monthly: 'मासिक रखरखाव (₹)', challenges: 'मुख्य चुनौतियाँ',
    openEV: 'क्या आप EV पर स्विच करना चाहते हैं?', switchReasons: 'स्विच के कारण?',
    accident: 'दुर्घटना बीमा है?', health: 'स्वास्थ्य बीमा है?',
    paidPocket: 'दुर्घटना के लिए जेब से भुगतान किया?',
    interested: 'किसमें रुचि है?', referral: 'रेफरल कोड (यदि कोई हो)',
    products: 'कौन से एक्सेसरीज़ मददगार होंगे?',
    consent: 'मैं अपना डेटा साझा करने के लिए सहमत हूं',
  },
  kn: {
    title: 'ರೋಡ್ ವಾರಿಯರ್ EV ಚಾಲೆಂಜ್',
    subtitle: 'ಸಾವಿರಾರು ರೈಡರ್‌ಗಳೊಂದಿಗೆ ಸೇರಿ',
    next: 'ಮುಂದೆ →', back: '← ಹಿಂದೆ', submit: 'ಸಲ್ಲಿಸಿ 🏆',
    sections: ['ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ', 'ವಾಹನ ಮಾಹಿತಿ', 'ವೆಚ್ಚಗಳು', 'ಸವಾಲುಗಳು', 'ವಿಮೆ', 'ಆಸಕ್ತಿ'],
    name: 'ಪೂರ್ಣ ಹೆಸರು', whatsapp: 'WhatsApp ಸಂಖ್ಯೆ', city: 'ನಗರ',
    pincode: 'ಪಿನ್ ಕೋಡ್', platform: 'ಡೆಲಿವರಿ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್',
    experience: 'ಅನುಭವ (ವರ್ಷ)', vehicle: 'ವಾಹನ ಪ್ರಕಾರ', brand: 'ವಾಹನ ಬ್ರ್ಯಾಂಡ್',
    fuel: 'ಇಂಧನ/ಚಾರ್ಜಿಂಗ್ ಹೇಗೆ?', weekly: 'ವಾರದ ಇಂಧನ ವೆಚ್ಚ (₹)',
    monthly: 'ಮಾಸಿಕ ನಿರ್ವಹಣೆ (₹)', challenges: 'ಮುಖ್ಯ ಸವಾಲುಗಳು',
    openEV: 'EV ಗೆ ಬದಲಾಯಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?', switchReasons: 'ಬದಲಾವಣೆಗೆ ಕಾರಣಗಳು?',
    accident: 'ಅಪಘಾತ ವಿಮೆ ಇದೆಯೇ?', health: 'ಆರೋಗ್ಯ ವಿಮೆ ಇದೆಯೇ?',
    paidPocket: 'ಅಪಘಾತಕ್ಕಾಗಿ ಜೇಬಿನಿಂದ ಪಾವತಿಸಿದ್ದೀರಾ?',
    interested: 'ಆಸಕ್ತಿ ಏನು?', referral: 'ರೆಫರಲ್ ಕೋಡ್',
    products: 'ಯಾವ ಉಪಕರಣಗಳು ಸಹಾಯಕಾರಿ?',
    consent: 'ನಾನು ನನ್ನ ಡೇಟಾ ಹಂಚಿಕೊಳ್ಳಲು ಒಪ್ಪುತ್ತೇನೆ',
  }
}

const chipStyle = (active, color = '#f97316') => ({
  padding: '10px 16px', borderRadius: '24px', border: '2px solid',
  borderColor: active ? color : '#334155',
  background: active ? color : 'transparent',
  color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: active ? '600' : '400'
})

export default function RegistrationForm() {
  const [lang, setLang] = useState('en')
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [locationStatus, setLocationStatus] = useState('checking')
  const [otpSent, setOtpSent] = useState(false)
const [otp, setOtp] = useState('')
const [otpVerified, setOtpVerified] = useState(false)
const [otpLoading, setOtpLoading] = useState(false)
const [otpError, setOtpError] = useState('')
  const t = translations[lang]

  const urlParams = new URLSearchParams(window.location.search)
  const refFromURL = urlParams.get('ref') || ''

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          const inBangalore =
            latitude >= 12.7 && latitude <= 13.2 &&
            longitude >= 77.4 && longitude <= 77.8
          if (inBangalore) {
            setLocationStatus('bangalore')
          } else {
            setLocationStatus('allowed')
          }
        },
        () => setLocationStatus('allowed')
      )
    } else {
      setLocationStatus('allowed')
    }
  }, [])

  const [form, setForm] = useState({
    name: '', whatsapp: '', city: '', pin_code: '',
    platform: [], experience: 'Less than 1 year',
    vehicle_type: 'Petrol two-wheeler', brand: '',
    fuel_type: 'Petrol pump', weekly_fuel: '', monthly_maintenance: '',
    challenges: [], switch_reasons: [], open_to_ev: 'Yes',
    accident_insurance: 'Yes', health_insurance: 'Yes',
    paid_out_of_pocket: 'No', interested_in: [],
    product_interests: [], referred_by: refFromURL, consent: false, honeypot: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggle = (field, val) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val)
        ? f[field].filter(x => x !== val)
        : [...f[field], val]
    }))
  }

  const validate = () => {
    if (step === 0) {
      if (!form.name.trim()) { alert('Please enter your name'); return false }
      if (!form.whatsapp.trim()) { alert('Please enter your WhatsApp number'); return false }
      if (!/^[6-9]\d{9}$/.test(form.whatsapp)) { alert('Please enter a valid 10-digit Indian mobile number'); return false }
      if (!otpVerified) { alert('Please verify your WhatsApp number with OTP first'); return false }
      if (!form.city.trim()) { alert('Please enter your city'); return false }
      if (!form.pin_code.trim()) { alert('Please enter your PIN code'); return false }
      if (form.platform.length === 0) { alert('Please select at least one platform'); return false }
    }
    if (step === 2) {
      if (!form.weekly_fuel) { alert('Please enter your weekly fuel cost'); return false }
      if (!form.monthly_maintenance) { alert('Please enter your monthly maintenance cost'); return false }
    }
    if (step === 5) {
      if (!form.consent) { alert('Please agree to the consent before submitting'); return false }
    }
    return true
  }
  if (form.honeypot) return
  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/register`, form)
      setResult(res.data)
      setSubmitted(true)
    } catch (e) {
      if (e.response?.data?.error === 'duplicate') {
        alert('This WhatsApp number is already registered! Visit /score to check your points.')
      } else if (e.response?.data?.error === 'invalid_phone') {
        alert('Please enter a valid Indian mobile number')
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
    width: '100%', padding: '14px', borderRadius: '10px',
    border: '2px solid #334155', background: '#1e293b',
    color: '#fff', fontSize: '15px', marginTop: '6px',
    boxSizing: 'border-box'
  }
  const labelStyle = { fontSize: '14px', color: '#94a3b8', display: 'block', marginTop: '20px', fontWeight: '500' }
  const btnStyle = (primary) => ({
    padding: '14px 32px', borderRadius: '12px', border: 'none',
    background: primary ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#1e293b',
    color: '#fff', fontSize: '16px', cursor: 'pointer', fontWeight: '700',
    boxShadow: primary ? '0 4px 15px rgba(249,115,22,0.4)' : 'none'
  })

  const isEV = form.vehicle_type === 'Electric two-wheeler'

  // Location checking screen
  if (locationStatus === 'checking') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
        <p style={{ color: '#f97316', fontSize: '18px', fontWeight: '600' }}>Detecting your location...</p>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Please allow location access</p>
      </div>
    </div>
  )

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#1e293b', borderRadius: '20px', padding: '40px', maxWidth: '440px', width: '100%', textAlign: 'center', border: '1px solid #f97316' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏆</div>
        <h2 style={{ color: '#f97316', marginBottom: '8px', fontSize: '24px' }}>Welcome, {form.name}!</h2>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>You are now a Road Warrior!</p>
        {locationStatus === 'bangalore' && (
          <div style={{ background: '#10b98120', border: '1px solid #10b981', borderRadius: '10px', padding: '10px', marginBottom: '16px' }}>
            <p style={{ color: '#10b981', fontSize: '13px' }}>📍 Verified Bangalore Rider!</p>
          </div>
        )}
        <div style={{ background: '#0f172a', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Your Referral Code</p>
          <p style={{ color: '#f97316', fontSize: '36px', fontWeight: '700', letterSpacing: '6px' }}>{result?.referralCode}</p>
          <button onClick={copyCode} style={{
            marginTop: '12px', padding: '10px 24px', borderRadius: '8px',
            border: '2px solid #f97316', background: copied ? '#f97316' : 'transparent',
            color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
          }}>
            {copied ? '✓ Copied!' : '📋 Copy Code'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Points</p>
            <p style={{ color: '#fff', fontSize: '28px', fontWeight: '700' }}>{result?.points}</p>
          </div>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Segment</p>
            <p style={{ color: '#10b981', fontSize: '14px', fontWeight: '600' }}>{result?.segment?.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <div style={{ marginTop: '16px', background: '#0f172a', borderRadius: '8px', padding: '12px' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>Your QR Code — Share at petrol pumps!</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://road-warrior-frontend.vercel.app?ref=${result?.referralCode}`}
            alt="QR Code"
            style={{ width: '150px', height: '150px', borderRadius: '8px' }}
          />
        </div>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '16px' }}>Share your code with other riders to earn more points!</p>

<a href="https://t.me/rw2026ev_bot" target="_blank"
  style={{ display: 'block', marginTop: '16px', padding: '12px 24px', borderRadius: '10px', background: '#0088cc', color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>
  📱 Join Our Telegram Community →
</a>

<a href="/score" style={{ display: 'block', marginTop: '12px', color: '#f97316', fontSize: '14px', textDecoration: 'none', fontWeight: '600', textAlign: 'center' }}>
  Check Your Score →
</a>
      </div>
    </div>
  )

  const steps = [
    <div key={0}>
      <label style={labelStyle}>{t.name} *</label>
      <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter your full name" />
      <label style={labelStyle}>{t.whatsapp} *</label>
      <input style={inputStyle} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" maxLength={10} />
      <label style={labelStyle}>{t.city} *</label>
      <input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Your city" />
      <label style={labelStyle}>{t.pincode} *</label>
      <input style={inputStyle} value={form.pin_code} onChange={e => set('pin_code', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit PIN code" maxLength={6} />
      <label style={labelStyle}>{t.platform} *</label>
      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {['Swiggy', 'Zomato', 'Blinkit', 'Zepto', 'Porter', 'Dunzo', 'Ola', 'Uber', 'Other'].map(p => (
          <button key={p} type="button" onClick={() => toggle('platform', p)} style={chipStyle(form.platform.includes(p))}>{p}</button>
        ))}
      </div>
      {form.platform.includes('Other') && (
        <input style={{ ...inputStyle, marginTop: '10px' }} placeholder="Please specify platform" onChange={e => set('platform_other', e.target.value)} />
      )}
      <label style={labelStyle}>{t.experience}</label>
      <select style={inputStyle} value={form.experience} onChange={e => set('experience', e.target.value)}>
        {['Less than 1 year', '1-2 years', '3-5 years', '5+ years'].map(x => <option key={x}>{x}</option>)}
      </select>
    </div>,

    <div key={1}>
      <label style={labelStyle}>{t.vehicle}</label>
      <select style={inputStyle} value={form.vehicle_type} onChange={e => set('vehicle_type', e.target.value)}>
        {['Petrol two-wheeler', 'Electric two-wheeler', 'Diesel two-wheeler', 'Other'].map(v => <option key={v}>{v}</option>)}
      </select>
      <label style={labelStyle}>{t.brand}</label>
      <input style={inputStyle} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Honda Activa 6G, Ola S1 Pro" />
      <label style={labelStyle}>{t.fuel}</label>
      <select style={inputStyle} value={form.fuel_type} onChange={e => set('fuel_type', e.target.value)}>
        {['Petrol pump', 'Home charging', 'Battery swapping station', 'Other'].map(f => <option key={f}>{f}</option>)}
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
      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {['High fuel cost', 'Frequent breakdown', 'No nearby charging station', 'Battery range anxiety', 'Repair costs', 'Long refuelling time'].map(c => (
          <button key={c} type="button" onClick={() => toggle('challenges', c)} style={chipStyle(form.challenges.includes(c))}>{c}</button>
        ))}
      </div>
      {isEV && (
        <>
          <label style={{ ...labelStyle, color: '#10b981' }}>EV Specific Challenges</label>
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Battery drains too fast', 'Swapping station too far', 'Long charging time at home', 'Vehicle not powerful enough', 'Service centre not nearby'].map(c => (
              <button key={c} type="button" onClick={() => toggle('challenges', c)} style={chipStyle(form.challenges.includes(c), '#10b981')}>{c}</button>
            ))}
          </div>
        </>
      )}
      {!isEV && (
        <>
          <label style={{ ...labelStyle, color: '#f59e0b' }}>Petrol Specific Challenges</label>
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Fuel price too high', 'Frequent engine issues', 'Pollution fine risk', 'High servicing cost'].map(c => (
              <button key={c} type="button" onClick={() => toggle('challenges', c)} style={chipStyle(form.challenges.includes(c), '#f59e0b')}>{c}</button>
            ))}
          </div>
        </>
      )}
      <label style={labelStyle}>{t.openEV}</label>
      <select style={inputStyle} value={form.open_to_ev} onChange={e => set('open_to_ev', e.target.value)}>
        {['Yes', 'No', 'Already on EV', 'Need more information'].map(o => <option key={o}>{o}</option>)}
      </select>
      {!isEV && (
        <>
          <label style={labelStyle}>{t.switchReasons}</label>
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Lower rental cost', 'Better battery range', 'Swap stations nearby', 'Income guarantee', 'Employer subsidy'].map(r => (
              <button key={r} type="button" onClick={() => toggle('switch_reasons', r)} style={chipStyle(form.switch_reasons.includes(r))}>{r}</button>
            ))}
          </div>
        </>
      )}
    </div>,

    <div key={4}>
      <label style={labelStyle}>{t.accident}</label>
      <select style={inputStyle} value={form.accident_insurance} onChange={e => set('accident_insurance', e.target.value)}>
        {['Yes', 'No', 'Not sure'].map(o => <option key={o}>{o}</option>)}
      </select>
      <label style={labelStyle}>{t.health}</label>
      <select style={inputStyle} value={form.health_insurance} onChange={e => set('health_insurance', e.target.value)}>
        {['Yes', 'No', 'Not sure'].map(o => <option key={o}>{o}</option>)}
      </select>
      <label style={labelStyle}>{t.paidPocket}</label>
      <select style={inputStyle} value={form.paid_out_of_pocket} onChange={e => set('paid_out_of_pocket', e.target.value)}>
        {['Yes', 'No'].map(o => <option key={o}>{o}</option>)}
      </select>
    </div>,

    <div key={5}>
      <label style={labelStyle}>{t.interested}</label>
      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {['EV rental offer', 'Insurance quote', 'Retrofit information', 'All of the above', 'None'].map(i => (
          <button key={i} type="button" onClick={() => toggle('interested_in', i)} style={chipStyle(form.interested_in.includes(i))}>{i}</button>
        ))}
      </div>
      <label style={labelStyle}>{t.products}</label>
      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {['Phone mount', 'Power bank', 'Emergency light', 'Raincoat', 'Helmet with communication', 'Cable lock', 'Seat cushion', 'Handlebar charger'].map(p => (
          <button key={p} type="button" onClick={() => toggle('product_interests', p)} style={chipStyle(form.product_interests.includes(p))}>{p}</button>
        ))}
      </div>
      <label style={labelStyle}>{t.referral}</label>
      <input style={inputStyle} value={form.referred_by} onChange={e => set('referred_by', e.target.value)} placeholder="e.g. RW-1234" />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '24px', padding: '16px', background: '#0f172a', borderRadius: '12px' }}>
        <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)}
          style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer', accentColor: '#f97316' }} />
        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{t.consent} *</p>
      </div>
    </div>
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '20px', maxWidth: '520px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: '30px 0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          {['EN', 'हि', 'ಕ'].map((l, i) => (
            <button key={i} onClick={() => setLang(['en', 'hi', 'kn'][i])}
              style={{ padding: '8px 18px', borderRadius: '24px', border: '2px solid',
                borderColor: lang === ['en', 'hi', 'kn'][i] ? '#f97316' : '#334155',
                background: lang === ['en', 'hi', 'kn'][i] ? '#f97316' : 'transparent',
                color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏍️</div>
        <h1 style={{ fontSize: '26px', fontWeight: '700', background: 'linear-gradient(90deg, #f97316, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.title}</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px' }}>{t.subtitle}</p>
        {locationStatus === 'bangalore' && (
          <p style={{ color: '#10b981', fontSize: '12px', marginTop: '6px' }}>📍 Bangalore Rider Detected!</p>
        )}
      </div>

      <div style={{ background: '#1e293b', borderRadius: '8px', height: '8px', marginBottom: '8px' }}>
        <div style={{ background: 'linear-gradient(90deg, #f97316, #10b981)', height: '100%', borderRadius: '8px', width: `${((step + 1) / 6) * 100}%`, transition: 'width 0.3s' }} />
      </div>
      <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
        {t.sections[step]} — {step + 1} of 6
      </p>

      <div style={{ background: '#1e293b', borderRadius: '20px', padding: '28px', border: '1px solid #334155' }}>
        {steps[step]}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingBottom: '40px' }}>
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