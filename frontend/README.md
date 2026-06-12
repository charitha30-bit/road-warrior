# Road Warrior EV Challenge 🏍️

A multilingual mobile-first rider registration and referral platform built for EV adoption research across Bangalore.

## Live Links
- **Main Form:** https://road-warrior-frontend.vercel.app
- **Score Page:** https://road-warrior-frontend.vercel.app/score
- **Admin Dashboard:** https://road-warrior-frontend.vercel.app/admin
- **Telegram Bot:** https://t.me/rw2026ev_bot
- **Backend API:** https://road-warrior-backend.onrender.com
- **GitHub:** https://github.com/charitha30-bit/road-warrior

## Admin Credentials
- Password: BharatRiders@2025
- Auto logout after 30 minutes

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React.js + Vite (Vercel) |
| Backend | Node.js + Express (Render) |
| Database | Supabase (PostgreSQL) |
| WhatsApp | Meta WhatsApp Cloud API |
| SMS + OTP | Fast2SMS API |
| Telegram | Telegram Bot API (@rw2026ev_bot) |
| Security | JWT + reCAPTCHA v3 |

## Features Built

### Form
- 6-step mobile-friendly registration
- 3 languages — English, Hindi, Kannada
- Geofencing — detects Bangalore riders automatically
- Conditional logic — EV riders see EV questions, Petrol riders see Petrol questions
- Multi-select platform selection
- PIN code mandatory field
- Privacy consent checkbox
- Product accessories multi-select

### Referral System
- Unique referral code per rider
- QR code for offline sharing at petrol pumps
- Points system — 10 points on registration, +5 per referral
- Milestone bonuses — 100pts at 10 referrals, 300pts at 25, 500pts at 50

### Communication
- Meta WhatsApp Cloud API — fires on every registration
- Fast2SMS — OTP verification + SMS confirmation
- Telegram Bot — admin notifications + rider score check

### Security
- Google reCAPTCHA v3
- Rate limiting — 3 registrations per IP per hour
- OTP phone verification via Fast2SMS
- JWT authentication for admin
- Brute force protection — locks after 5 wrong attempts
- Admin session timeout — 30 minutes
- Honeypot field — bot detection
- Phone regex validation — Indian numbers only
- Duplicate phone detection

### Lead Segmentation (6 types)
- EV_SALE_LEAD
- EV_RENTAL_LEAD
- RETROFIT_LEAD
- BIKE_INSURANCE_LEAD
- PERSONAL_INSURANCE_LEAD
- PRODUCT_LEAD

### Admin Dashboard
- Live leaderboard sorted by points
- 6 segment filters
- CSV download per segment
- Stats cards for each lead type
- Logout + session timeout

## Telegram Bot (@rw2026ev_bot)
- /start → registration link
- Send phone number → get score + referral code
- Admin gets instant notification on every registration

## API Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/register | reCAPTCHA | Register rider |
| POST | /api/send-otp | None | Send OTP |
| POST | /api/verify-otp | None | Verify OTP |
| GET | /api/score/:phone | None | Rider score |
| POST | /api/admin/login | None | Admin login |
| GET | /api/admin/riders | JWT | All riders |
| GET | /api/riders | JWT | All riders |
| POST | /api/telegram/webhook | None | Telegram bot |

## Setup
### Backend
```bash
cd backend
npm install
# Add .env with all keys
node index.js
```
### Frontend
```bash
cd frontend
npm install
npm run dev
```

## What I Would Add Next
- Full WhatsApp chatbot form (no browser needed)
- City-wise analytics charts
- Verified Meta Business number for production WhatsApp
- Fast2SMS production credit for SMS delivery