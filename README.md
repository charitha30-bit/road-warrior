# Road Warrior EV Challenge 🏍️

A multilingual mobile-first rider registration and referral platform for EV adoption research across Bangalore.

## Live Links
- **Main Form:** https://road-warrior-frontend.vercel.app
- **Score Page:** https://road-warrior-frontend.vercel.app/score
- **Admin Dashboard:** https://road-warrior-frontend.vercel.app/admin
- **Telegram Bot:** https://t.me/rw2026ev_bot
- **Backend API:** https://road-warrior-backend.onrender.com
- **GitHub:** https://github.com/charitha30-bit/road-warrior

## Admin Password
BharatRiders@2025

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React.js + Vite (Vercel) |
| Backend | Node.js + Express (Render) |
| Database | Supabase (PostgreSQL) |
| WhatsApp | Meta WhatsApp Cloud API |
| SMS | Fast2SMS API |
| Telegram | Telegram Bot API |
| Hosting | Vercel + Render |

## Features
✅ 6-step mobile-friendly registration form
✅ 3 languages — English, Hindi, Kannada
✅ Geofencing — detects Bangalore riders
✅ Unique referral code + QR code per rider
✅ Points system with milestone bonuses (10/25/50 referrals)
✅ 6 lead segments — EV_SALE, EV_RENTAL, RETROFIT, BIKE_INSURANCE, PERSONAL_INSURANCE, PRODUCT
✅ Duplicate phone detection
✅ Phone validation — Indian numbers only
✅ Rider score page
✅ Password protected admin dashboard
✅ Meta WhatsApp Cloud API integration
✅ Fast2SMS integration
✅ Telegram bot — admin notifications + rider score check
✅ Rate limiting — 3 registrations per IP per hour
✅ Brute force protection — locks after 5 wrong attempts
✅ Multi-select platform, PIN code, consent checkbox
✅ Conditional EV/Petrol challenge questions
✅ Product accessories section

## Security
- Rate limiting via express-rate-limit
- Brute force protection on admin login
- Phone number regex validation
- Duplicate submission detection
- JWT admin authentication

## Telegram Bot (@rw2026ev_bot)
- Send /start → get registration link
- Send 10-digit phone number → get score + referral code
- Admin gets instant notification on every registration

## Setup
### Backend
```bash
cd backend
npm install
node index.js
```
### Frontend
```bash
cd frontend
npm install
npm run dev
```