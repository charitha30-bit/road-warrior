const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const FAST2SMS_KEY = 'uy7XI4TlQSGcHvjp2BWieJ0AzC31DdsktNELMbU9PKwF8nZROrkobKRL7OfYMVDcZIxm1i3BGuJHpdzr';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`
};

// Rate limiting
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many registrations from this IP. Try again later.' },
  trustProxy: false
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' }
});

function generateReferralCode() {
  return 'RW-' + Math.floor(1000 + Math.random() * 9000);
}

function getSegment(data) {
  if (data.vehicle_type === 'Electric two-wheeler' && data.open_to_ev === 'Yes') return 'EV_SALE_LEAD';
  if (data.vehicle_type === 'Electric two-wheeler') return 'EV_RENTAL_LEAD';
  if (data.open_to_ev === 'Yes' && data.vehicle_type !== 'Electric two-wheeler') return 'RETROFIT_LEAD';
  if (data.accident_insurance === 'No') return 'BIKE_INSURANCE_LEAD';
  if (data.health_insurance === 'No') return 'PERSONAL_INSURANCE_LEAD';
  return 'PRODUCT_LEAD';
}

function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone.replace(/^91/, '').replace(/\D/g, ''));
}

async function sendSMS(phone, name, referralCode) {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const message = `Welcome ${name}! You are now a Road Warrior! Your referral code is ${referralCode}. Share with riders to earn points!`;
  try {
    const response = await fetch(
      `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_KEY}&route=q&message=${encodeURIComponent(message)}&language=english&flash=0&numbers=${cleanPhone}`,
      { method: 'GET', headers: { 'cache-control': 'no-cache' } }
    );
    const result = await response.json();
    console.log('SMS result:', JSON.stringify(result));
  } catch (e) {
    console.log('SMS failed:', e.message);
  }
}

async function sendWhatsApp(phone, name, referralCode) {
  const token = 'EAAOY6dYoVvgBRpoWM5SwUxhPlVoNmlybscTqNOZBMhB2hcs6v00GV2GZCN1unjiTWNGC5DEX0IJTTbsuif5eD2ZBgGWhvtm3mymcTkwpQZA5PZAxgvdZBIwBaZArhAZCnxn3IucmKMyczTnXHQNZBpAt9MkBrIgHo3nJJW6W5oM4KPFfvbXy90NEmMwQlZBQRhNZC9df13S4A9vs9hiDFYZAqSFfEf0Blsi4ZBTRiKSG4SlOl7fEEm9siWbZAAJNAUNmhBCA8GR7moBgPzusZAXY1aE4FMSnwZDZD'
  const phoneNumberId = '1121568487708918'
  const formattedPhone = `91${phone.replace(/\D/g, '').slice(-10)}`

  try {
    const response = await fetch(`https://graph.facebook.com/v25.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
        }
      })
    })
    const result = await response.json()
    console.log('WhatsApp response:', JSON.stringify(result))
  } catch (e) {
    console.log('WhatsApp failed:', e.message)
  }
}

//telegram 
async function sendTelegram(name, phone, referralCode, segment) {
  const TELEGRAM_TOKEN = '8671849823:AAFZgy4Pj_gu1kSbwAHvduD86KbtombgeEs';
  const CHAT_ID = '6841636854';
  
  const message = `🏍️ *New Road Warrior Registered!*\n\n👤 Name: ${name}\n📱 Phone: ${phone}\n🎟️ Referral Code: ${referralCode}\n🏷️ Segment: ${segment}\n\n✅ Registered successfully!`;
  
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    console.log('Telegram sent!');
  } catch (e) {
    console.log('Telegram failed:', e.message);
  }
}
// Register rider
app.post('/api/register', registerLimiter, async (req, res) => {
  try {
    const data = req.body;

    // Phone validation
    if (!validatePhone(data.whatsapp)) {
      return res.status(400).json({ success: false, error: 'invalid_phone', message: 'Please enter a valid Indian mobile number' });
    }

    const referralCode = generateReferralCode();
    const segment = getSegment(data);

    // Check duplicate
    const dupCheck = await fetch(
      `${SUPABASE_URL}/rest/v1/riders?whatsapp=eq.${data.whatsapp}&select=id`,
      { headers }
    );
    const existing = await dupCheck.json();
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'duplicate', message: 'This WhatsApp number is already registered!' });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/riders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: data.name,
        whatsapp: data.whatsapp,
        city: data.city,
        platform: Array.isArray(data.platform) ? data.platform.join(', ') : data.platform,
        experience: data.experience,
        vehicle_type: data.vehicle_type,
        brand: data.brand || '',
        fuel_type: data.fuel_type,
        weekly_fuel: data.weekly_fuel ? parseInt(data.weekly_fuel) : 0,
        monthly_maintenance: data.monthly_maintenance ? parseInt(data.monthly_maintenance) : 0,
        challenges: (data.challenges || []).join(', '),
        open_to_ev: data.open_to_ev,
        accident_insurance: data.accident_insurance,
        health_insurance: data.health_insurance,
        paid_out_of_pocket: data.paid_out_of_pocket || 'No',
        interested_in: Array.isArray(data.interested_in) ? data.interested_in.join(', ') : data.interested_in,
        referred_by: data.referred_by || '',
        referral_code: referralCode,
        points: 10,
        segment: segment
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.log('Supabase error:', JSON.stringify(err));
      throw new Error(JSON.stringify(err));
    }

    // Add points to referrer + milestone bonuses
    if (data.referred_by) {
      const refCheck = await fetch(
        `${SUPABASE_URL}/rest/v1/riders?referral_code=eq.${data.referred_by}&select=id,points,name,whatsapp`,
        { headers }
      );
      const referrers = await refCheck.json();
      if (referrers.length > 0) {
        const referrer = referrers[0];
        const newPoints = referrer.points + 5;
        await fetch(`${SUPABASE_URL}/rest/v1/riders?id=eq.${referrer.id}`, {
          method: 'PATCH', headers,
          body: JSON.stringify({ points: newPoints })
        });

        const countCheck = await fetch(
          `${SUPABASE_URL}/rest/v1/riders?referred_by=eq.${data.referred_by}&select=id`,
          { headers }
        );
        const referralCount = (await countCheck.json()).length;

        let bonusPoints = 0;
        if (referralCount === 10) bonusPoints = 100;
        else if (referralCount === 25) bonusPoints = 300;
        else if (referralCount === 50) bonusPoints = 500;

        if (bonusPoints > 0) {
          await fetch(`${SUPABASE_URL}/rest/v1/riders?id=eq.${referrer.id}`, {
            method: 'PATCH', headers,
            body: JSON.stringify({ points: newPoints + bonusPoints })
          });
        }
      }
    }

    // Send SMS + WhatsApp
    await sendSMS(data.whatsapp, data.name, referralCode);
    await sendWhatsApp(data.whatsapp, data.name, referralCode);
    await sendTelegram(data.name, data.whatsapp, referralCode, segment);

    res.json({ success: true, referralCode, points: 10, segment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all riders
app.get('/api/riders', async (req, res) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/riders?select=*&order=points.desc`,
      { headers }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get rider score
app.get('/api/score/:phone', async (req, res) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/riders?whatsapp=eq.${req.params.phone}&select=*`,
      { headers }
    );
    const data = await response.json();
    if (!data.length) throw new Error('Not found');
    res.json(data[0]);
  } catch (err) {
    res.status(404).json({ error: 'Rider not found' });
  }
});

// Admin login with brute force protection
const loginAttempts = {};
app.post('/api/admin/login', adminLimiter, (req, res) => {
  const { password } = req.body;
  const ip = req.ip;

  if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0, lockedUntil: null };

  if (loginAttempts[ip].lockedUntil && Date.now() < loginAttempts[ip].lockedUntil) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }

  if (password === 'BharatRiders@2025') {
    loginAttempts[ip] = { count: 0, lockedUntil: null };
    const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
    res.json({ success: true, token });
  } else {
    loginAttempts[ip].count++;
    if (loginAttempts[ip].count >= 5) {
      loginAttempts[ip].lockedUntil = Date.now() + 15 * 60 * 1000;
      return res.status(429).json({ error: 'Account locked for 15 minutes due to too many failed attempts.' });
    }
    res.status(401).json({ success: false, error: 'Wrong password', attemptsLeft: 5 - loginAttempts[ip].count });
  }
});

// Verify token middleware
function verifyAdmin(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token' });
  next();
}

// Protected admin route
app.get('/api/admin/riders', verifyAdmin, async (req, res) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/riders?select=*&order=points.desc`,
      { headers }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});