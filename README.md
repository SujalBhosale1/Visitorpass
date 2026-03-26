# Visitor Pass Management System

A web application to manage office visitor entries — register visitors, schedule appointments, generate QR-coded passes, and track check-in/check-out — built with the MERN stack.

---

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **Auth:** JWT (role-based)
- **QR Code:** `qrcode` npm package
- **PDF Generation:** `pdfkit`
- **Email:** `nodemailer`

---

## User Roles

| Role | What they can do |
|------|-----------------|
| `admin` | Full access to everything |
| `employee` | Approve or reject visitor appointments |
| `security` | Scan QR codes, record check-in/check-out |
| `visitor` | Pre-register, view their pass |

---

## Project Structure

```
visitorpass/
├── backend/
│   ├── controllers/       → Business logic for each feature
│   ├── models/            → MongoDB schemas
│   ├── routes/            → API route definitions
│   ├── middleware/        → Auth and role checking
│   ├── utils/             → Helper functions (email)
│   ├── uploads/           → Visitor photos + generated PDFs
│   ├── seed.js            → Sample data for testing
│   └── server.js          → App entry point
└── frontend/
    └── src/
        ├── components/    → Navbar
        └── pages/         → Login, Register, Dashboard, Visitors,
                              Appointments, Passes, Scanner
```

---

## Setup Guide

### Prerequisites

- Node.js (v18 or later)
- A MongoDB Atlas account (free tier is fine)

---

### 1. Clone or download the project

```bash
cd visitorpass
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_random_secret_string
PORT=5000

# Optional - only needed if you want email notifications
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **Note on EMAIL_PASS:** Use a Gmail App Password (not your login password).
> Go to: Google Account → Security → 2-Step Verification → App Passwords.

Start the backend:

```bash
npm run dev
```

API will be available at `http://localhost:5000`

---

### 3. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

App will be available at `http://localhost:5173`

---

### 4. Load Sample Data (optional)

To populate the database with test users, a visitor, appointment and pass:

```bash
cd backend
node seed.js
```

Sample login credentials (password for all: `password123`):

| Role | Email |
|------|-------|
| Admin | admin@example.com |
| Employee | ravi@example.com |
| Security | guard@example.com |

---

## How to Use

1. Open `http://localhost:5173` in your browser
2. **Register** an account — choose a role (Admin, Employee, or Security)
3. **Login** → lands on the Dashboard (shows visitor/appointment/pass counts)
4. **Visitors page** → add a new visitor with name, phone, email, optional photo
5. **Appointments page** → pick a visitor from the dropdown, enter host ID, set date → Create
6. Approve the appointment (Approve button) — visitor gets an email if configured
7. **Passes page** → pick visitor + approved appointment → Generate Pass
   - A QR code appears and PDF is available to download
   - Visitor gets an email notification
8. **Scanner page** → click "Start Camera" and scan the QR code
   - First scan = Check-In recorded
   - Second scan = Check-Out recorded
   - Or use the Manual Entry box if camera isn't available

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login and get token |
| GET | `/api/visitors` | Yes | List all visitors |
| POST | `/api/visitors` | Yes | Add a visitor |
| GET | `/api/appointments` | Yes | List all appointments |
| POST | `/api/appointments` | Yes | Create appointment |
| PUT | `/api/appointments/approve/:id` | Yes (employee) | Approve appointment |
| PUT | `/api/appointments/reject/:id` | Yes (employee) | Reject appointment |
| GET | `/api/passes` | Yes | List all passes |
| POST | `/api/passes/generate` | Yes | Generate a pass |
| GET | `/api/passes/:id` | Yes | Get single pass |
| POST | `/api/logs/check-in` | Yes | Record check-in |
| POST | `/api/logs/check-out` | Yes | Record check-out |
| GET | `/api/logs` | Yes | View all check logs |

All protected endpoints require the header:
```
Authorization: Bearer <your_token>
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for signing tokens |
| `PORT` | No | Server port (default: 5000) |
| `EMAIL_USER` | No | Gmail address for notifications |
| `EMAIL_PASS` | No | Gmail App Password |
