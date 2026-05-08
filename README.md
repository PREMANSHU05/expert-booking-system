# ExpertConnect — Real-Time Expert Session Booking System

**Tech Stack:** React (Web) + Node.js + Express + MongoDB + Socket.io

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB running locally (`mongodb://localhost:27017`) OR a MongoDB Atlas URI

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI if using Atlas
node seed.js          # Seeds 12 experts with 7 days of slots
npm run dev           # Starts on http://localhost:5000
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
# Optional: create .env with REACT_APP_API_URL=http://localhost:5000
npm start             # Starts on http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/experts` | List experts (pagination + filter + search) |
| GET | `/experts/:id` | Expert detail with time slots |
| POST | `/bookings` | Create a booking |
| PATCH | `/bookings/:id/status` | Update booking status |
| GET | `/bookings?email=` | Get bookings by email |

### Query params for `GET /experts`:
- `page` — page number (default 1)
- `limit` — per page (default 6)
- `category` — filter by category
- `search` — search by name

---

## ✅ Features Implemented

### Screens
- **Expert Listing** — Cards with name, category, rating, experience; search by name; filter by category; pagination; loading & error states
- **Expert Detail** — Full profile, time slots grouped by date, real-time slot updates via Socket.io
- **Booking Screen** — Form with validation (name, email, phone, date, time slot, notes); success toast; disables booked slots
- **My Bookings** — Search by email, displays status (Pending / Confirmed / Completed)

### Critical Requirements
1. **Double Booking Prevention** — Uses MongoDB atomic `findOneAndUpdate` with `$elemMatch` + unique compound index `(expertId, date, timeSlot)` to handle race conditions
2. **Real-Time Slot Updates** — Socket.io emits `slotBooked` event on successful booking; all connected clients on the expert detail page update instantly
3. **Error Handling** — Input validation on both frontend and backend; meaningful error responses; environment variables via dotenv

### Backend Structure
```
backend/
  models/       — Expert.js, Booking.js
  controllers/  — expertController.js, bookingController.js
  routes/       — experts.js, bookings.js
  server.js     — Express + Socket.io + MongoDB
  seed.js       — Seed 12 experts with slots
```

---

## 🔌 Socket.io Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `slotBooked` | Server → Clients | `{ expertId, date, timeSlot }` |

---

## 🌐 Deployment (Optional)
- **Backend:** Deploy to Render / Railway / Heroku — set `MONGODB_URI` and `CLIENT_URL` env vars
- **Frontend:** Deploy to Vercel / Netlify — set `REACT_APP_API_URL` to your backend URL
