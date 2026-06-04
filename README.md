# Road Warrior EV Challenge 🏆

A multilingual rider registration and referral platform built to recruit delivery riders for EV adoption research.

## Live Links
- **Frontend:** https://road-warrior-frontend.vercel.app
- **Backend API:** https://road-warrior-backend.onrender.com
- **Admin Dashboard:** https://road-warrior-frontend.vercel.app/admin (password: roadwarrior123)

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## Features
- 6-step mobile-friendly registration form
- 3 languages — English, Hindi, Kannada
- Unique referral code for every rider
- Auto-segmentation — Hot EV Lead, Insurance Lead, EV Rider, Petrol Rider
- Points system — earn points by referring other riders
- Password protected admin dashboard with leaderboard
- Form validation on required fields

## Setup Instructions

### Backend
```bash
cd backend
npm install
# Create .env file with:
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_anon_key
# PORT=5000
node index.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/register | Register a new rider |
| GET | /api/riders | Get all riders |
| GET | /api/score/:phone | Get rider score |
| POST | /api/admin/login | Admin login |
| GET | /api/admin/riders | Get all riders (protected) |

## What I Would Add Next
- WhatsApp confirmation message via Twilio
- Duplicate phone number detection
- QR code for referral sharing
- Charts and analytics in admin dashboard