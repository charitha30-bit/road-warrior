# Road Warrior EV Challenge 🏆

A multilingual mobile-first rider registration and referral platform built to recruit delivery riders for EV adoption research.

## Live Links
- **Main Form:** https://road-warrior-frontend.vercel.app
- **Score Page:** https://road-warrior-frontend.vercel.app/score
- **Admin Dashboard:** https://road-warrior-frontend.vercel.app/admin
- **Backend API:** https://road-warrior-backend.onrender.com
- **GitHub:** https://github.com/charitha30-bit/road-warrior

## Admin Password
roadwarrior123
## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| WhatsApp | Meta WhatsApp Cloud API |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## Features
✅ 6-step mobile-friendly registration form
✅ 3 languages — English, Hindi, Kannada
✅ Unique referral code per rider
✅ QR code for offline sharing at petrol pumps
✅ Auto-segmentation — Hot EV Lead, Insurance Lead, EV Rider, Petrol Rider
✅ Points system with milestone bonuses (10/25/50 referrals)
✅ Duplicate phone detection
✅ Score page — check points by phone number
✅ Password protected admin dashboard
✅ Meta WhatsApp Cloud API integration
✅ Separate EV and Petrol challenge questions

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/register | Register a new rider |
| GET | /api/riders | Get all riders |
| GET | /api/score/:phone | Get rider score |
| POST | /api/admin/login | Admin login |
| GET | /api/admin/riders | Get all riders (protected) |

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

## 5-Line Summary
Built a multilingual mobile-first rider registration and referral platform using React.js (Vercel), Node.js + Express (Render), Supabase (PostgreSQL), and Meta WhatsApp Cloud API. The system auto-segments riders into Hot EV Lead, Insurance Lead, EV Rider, and Petrol Rider, tracks referral points with milestone bonuses at 10/25/50 referrals, and includes duplicate detection, QR codes for offline sharing, and a password-protected admin dashboard. If I had one more week, I would add a WhatsApp chatbot flow so riders can register entirely over WhatsApp without a browser, and build city-wise analytics charts in the admin dashboard. One thing that didn't work as expected was Meta WhatsApp Cloud API in test mode — it requires manual recipient verification for each number, which would be resolved with a verified business phone number in production.