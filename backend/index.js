const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');          // ← NEW: npm install jsonwebtoken
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);

// ─── CONSTANTS (move these to .env) ──────────────────────────────────────────
const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_KEY     = process.env.SUPABASE_ANON_KEY;
const FAST2SMS_KEY     = process.env.FAST2SMS_KEY;          // ← move to .env
const TELEGRAM_TOKEN   = process.env.TELEGRAM_TOKEN;        // ← move to .env
const ADMIN_CHAT_ID    = process.env.ADMIN_CHAT_ID;         // ← move to .env
const WHATSAPP_TOKEN   = process.env.WHATSAPP_TOKEN;        // ← move to .env
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;  // ← NEW
const JWT_SECRET       = process.env.JWT_SECRET;            // ← NEW

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`
};

// ─── RATE LIMITERS ────────────────────────────────────────────────────────────
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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

// ─── NEW: reCAPTCHA v3 verification ───────────────────────────────────────────
async function verifyRecaptcha(token) {
  try {
    const res = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${token}`,
      { method: 'POST' }
    );
    const data = await res.json();
    return data.success && data.score >= 0.5;
  } catch (e) {
    console.log('reCAPTCHA check failed:', e.message);
    return false;
  }
}

// ─── SMS ──────────────────────────────────────────────────────────────────────
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

// ─── WHATSAPP ─────────────────────────────────────────────────────────────────
async function sendWhatsApp(phone, name, referralCode) {
  const phoneNumberId = '1121568487708918';
  const formattedPhone = `91${phone.replace(/\D/g, '').slice(-10)}`;
  try {
    const response = await fetch(`https://graph.facebook.com/v25.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: { name: 'hello_world', language: { code: 'en_US' } }
      })
    });
    const result = await response.json();
    console.log('WhatsApp response:', JSON.stringify(result));
  } catch (e) {
    console.log('WhatsApp failed:', e.message);
  }
}

// ─── TELEGRAM ─────────────────────────────────────────────────────────────────
async function sendTelegramMessage(chatId, text) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
    const result = await res.json();
    console.log('Telegram result:', JSON.stringify(result));
  } catch (e) {
    console.log('Telegram failed:', e.message);
  }
}

async function sendTelegram(name, phone, referralCode, segment) {
  const message = `🏍️ New Road Warrior Registered!\n\n👤 Name: ${name}\n📱 Phone: ${phone}\n🎟️ Referral Code: ${referralCode}\n🏷️ Segment: ${segment}\n\n✅ Registered successfully!`;
  await sendTelegramMessage(ADMIN_CHAT_ID, message);
}

// ─── SEND OTP ─────────────────────────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!validatePhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/otp_verifications`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone, otp, verified: false })
    });
    const message = `Your Road Warrior OTP is ${otp}. Valid for 5 minutes.`;
    const smsRes = await fetch(
      `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_KEY}&route=q&message=${encodeURIComponent(message)}&language=english&flash=0&numbers=${phone}`,
      { method: 'GET', headers: { 'cache-control': 'no-cache' } }
    );
    const smsResult = await smsRes.json();
    console.log('OTP SMS:', JSON.stringify(smsResult));
    res.json({ success: true, message: 'OTP sent!' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
app.post('/api/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/otp_verifications?phone=eq.${phone}&otp=eq.${otp}&verified=eq.false&order=created_at.desc&limit=1`,
      { headers }
    );
    const data = await response.json();
    if (!data.length) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    const createdAt = new Date(data[0].created_at);
    const diff = (Date.now() - createdAt) / 1000 / 60;
    if (diff > 5) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }
    await fetch(
      `${SUPABASE_URL}/rest/v1/otp_verifications?id=eq.${data[0].id}`,
      { method: 'PATCH', headers, body: JSON.stringify({ verified: true }) }
    );
    res.json({ success: true, message: 'Phone verified!' });
  } catch (e) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ─── REGISTER ─────────────────────────────────────────────────────────────────
app.post('/api/register', registerLimiter, async (req, res) => {
  try {
    const data = req.body;

    // STEP 1: verify reCAPTCHA token
    const captchaOk = await verifyRecaptcha(data.recaptchaToken);
    if (!captchaOk) {
      return res.status(400).json({ success: false, error: 'recaptcha_failed', message: 'Bot check failed. Please try again.' });
    }

    // STEP 2: confirm OTP was verified for this phone (within last 30 min)
    const otpCheck = await fetch(
      `${SUPABASE_URL}/rest/v1/otp_verifications?phone=eq.${data.whatsapp}&verified=eq.true&order=created_at.desc&limit=1`,
      { headers }
    );
    const otpRows = await otpCheck.json();
    if (!otpRows.length) {
      return res.status(400).json({ success: false, error: 'otp_not_verified', message: 'Please verify your phone number first.' });
    }
    const verifiedAt = new Date(otpRows[0].created_at);
    if ((Date.now() - verifiedAt) / 1000 / 60 > 30) {
      return res.status(400).json({ success: false, error: 'otp_expired', message: 'OTP session expired. Please verify again.' });
    }

    // STEP 3: phone validation
    if (!validatePhone(data.whatsapp)) {
      return res.status(400).json({ success: false, error: 'invalid_phone', message: 'Please enter a valid Indian mobile number' });
    }

    const referralCode = generateReferralCode();
    const segment = getSegment(data);

    // STEP 4: duplicate check
    const dupCheck = await fetch(
      `${SUPABASE_URL}/rest/v1/riders?whatsapp=eq.${data.whatsapp}&select=id`,
      { headers }
    );
    const existing = await dupCheck.json();
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'duplicate', message: 'This WhatsApp number is already registered!' });
    }

    // STEP 5: insert rider
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

    // STEP 6: referral points
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

    await sendSMS(data.whatsapp, data.name, referralCode);
    await sendWhatsApp(data.whatsapp, data.name, referralCode);
    await sendTelegram(data.name, data.whatsapp, referralCode, segment);

    res.json({ success: true, referralCode, points: 10, segment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────
const loginAttempts = {};
app.post('/api/admin/login', adminLimiter, (req, res) => {
  const { password } = req.body;
  const ip = req.ip;

  if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0, lockedUntil: null };
  if (loginAttempts[ip].lockedUntil && Date.now() < loginAttempts[ip].lockedUntil) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }

  if (password === process.env.ADMIN_PASSWORD) {   // ← use env var, not hardcoded
    loginAttempts[ip] = { count: 0, lockedUntil: null };
    // Real JWT with 30-min expiry → auto-logout for free
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '30m' });
    res.json({ success: true, token });
  } else {
    loginAttempts[ip].count++;
    if (loginAttempts[ip].count >= 5) {
      loginAttempts[ip].lockedUntil = Date.now() + 15 * 60 * 1000;
      return res.status(429).json({ error: 'Account locked for 15 minutes.' });
    }
    res.status(401).json({ success: false, error: 'Wrong password', attemptsLeft: 5 - loginAttempts[ip].count });
  }
});

// ─── VERIFY ADMIN MIDDLEWARE ──────────────────────────────────────────────────
function verifyAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  try {
    jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

// ─── PROTECTED ROUTES ─────────────────────────────────────────────────────────
app.get('/api/riders', verifyAdmin, async (req, res) => {
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

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────
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

app.post('/api/telegram/webhook', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text || '';
  let reply = '';

  if (text === '/start') {
    reply = `🏍️ Welcome to Road Warrior EV Challenge!\n\nRegister here:\nhttps://road-warrior-frontend.vercel.app\n\nAfter registering, send your 10-digit phone number to check your score!\n\nType /help for more options.`;
  } else if (text === '/help') {
    reply = `Available commands:\n/start - Welcome message\n\nSend your 10-digit phone number to check your score!\n\nVisit: https://road-warrior-frontend.vercel.app`;
  } else if (/^\d{10}$/.test(text)) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/riders?whatsapp=eq.${text}&select=*`,
        { headers }
      );
      const data = await response.json();
      if (data.length > 0) {
        const rider = data[0];
        reply = `🏆 Your Score\n\nName: ${rider.name}\nPoints: ${rider.points}\nReferral Code: ${rider.referral_code}\nSegment: ${rider.segment?.replace(/_/g, ' ')}\n\nShare your code to earn more points!\nhttps://road-warrior-frontend.vercel.app?ref=${rider.referral_code}`;
      } else {
        reply = `❌ Number not found. Please register first at:\nhttps://road-warrior-frontend.vercel.app`;
      }
    } catch (e) {
      reply = 'Error checking score. Try again later.';
    }
  } else {
    reply = `👋 Send your 10-digit phone number to check your score!\n\nOr register at:\nhttps://road-warrior-frontend.vercel.app`;
  }

  await sendTelegramMessage(chatId, reply);
  res.sendStatus(200);
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});