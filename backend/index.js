const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`
};

function generateReferralCode() {
  return 'RW-' + Math.floor(1000 + Math.random() * 9000);
}

function getSegment(data) {
  if (data.open_to_ev === 'Yes' && data.vehicle_type !== 'Electric two-wheeler') return 'Hot EV Lead';
  if (data.accident_insurance === 'No' || data.health_insurance === 'No') return 'Insurance Lead';
  if (data.vehicle_type === 'Electric two-wheeler') return 'EV Rider';
  return 'Petrol Rider';
}

async function sendWhatsApp(phone, name, referralCode) {
  const token = 'EAAOY6dYoVvgBRpxhr9O4L6R9VheO4lQr1zKDMExhsu4m8ZAC1ZA4ZAu12NSG8aYkNzOlPU8mvc3e0AQdgWZCa5VdfcvRDN3zQo9dllbuLtaCwXoJKOcT01GlYfv'
  const phoneNumberId = '1121568487708918'
  const formattedPhone = `91${phone.replace(/\D/g, '').slice(-10)}`
  const message = `Welcome ${name}! You are now registered as a Road Warrior! Your referral code is ${referralCode}. Share it with other riders to earn points and rewards. Road Warrior — let's go!`

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
        type: 'text',
        text: { body: message }
      })
    })
    const result = await response.json()
    console.log('WhatsApp response:', JSON.stringify(result))
    console.log('Sent to:', formattedPhone)
  } catch (e) {
    console.log('WhatsApp failed:', e.message)
  }
}

// Register rider
app.post('/api/register', async (req, res) => {
  try {
    const data = req.body;
    const referralCode = generateReferralCode();
    const segment = getSegment(data);

    // Check duplicate phone
    const dupCheck = await fetch(
      `${SUPABASE_URL}/rest/v1/riders?whatsapp=eq.${data.whatsapp}&select=id`,
      { headers }
    );
    const existing = await dupCheck.json();
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'duplicate',
        message: 'This WhatsApp number is already registered!'
      });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/riders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: data.name,
        whatsapp: data.whatsapp,
        city: data.city,
        platform: data.platform,
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
        interested_in: data.interested_in,
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

        await fetch(
          `${SUPABASE_URL}/rest/v1/riders?id=eq.${referrer.id}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ points: newPoints })
          }
        );

        // Count total referrals
        const countCheck = await fetch(
          `${SUPABASE_URL}/rest/v1/riders?referred_by=eq.${data.referred_by}&select=id`,
          { headers }
        );
        const referralCount = (await countCheck.json()).length;

        // Milestone bonus
        let bonusPoints = 0;
        if (referralCount === 10) bonusPoints = 100;
        else if (referralCount === 25) bonusPoints = 300;
        else if (referralCount === 50) bonusPoints = 500;

        if (bonusPoints > 0) {
          await fetch(
            `${SUPABASE_URL}/rest/v1/riders?id=eq.${referrer.id}`,
            {
              method: 'PATCH',
              headers,
              body: JSON.stringify({ points: newPoints + bonusPoints })
            }
          );
          console.log(`Milestone bonus ${bonusPoints} points added to ${referrer.name}`);
        }
      }
    }

    await sendWhatsApp(data.whatsapp, data.name, referralCode);
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

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'roadwarrior123') {
    const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, error: 'Wrong password' });
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