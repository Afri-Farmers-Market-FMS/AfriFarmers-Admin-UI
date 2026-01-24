# AfriFarmers Admin System

A full-stack application for managing farmer registrations with Role-Based Access Control (RBAC).

## Project Structure

```
AfriFarmers-Admin-UI/
├── Frontend/           # React + TypeScript frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React context (Auth)
│   │   ├── pages/      # Page components
│   │   ├── services/   # API service layer
│   │   └── types/      # TypeScript types
│   ├── public/
│   └── package.json
│
├── backend/            # Node.js + Express backend
│   ├── src/
│   │   ├── models/     # MongoDB/Mongoose models
│   │   ├── routes/     # API route handlers
│   │   ├── middleware/ # Auth & validation middleware
│   │   └── server.ts   # Express server entry
│   └── package.json
│
├── API_DOCUMENTATION.md  # Complete API reference
└── README.md             # This file
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on: http://localhost:5000

### 2. Start Frontend
```bash
cd Frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:5173

## Test Credentials

| Role        | Email                  | Password   |
|-------------|------------------------|------------|
| Super Admin | admin@afrifarmers.rw   | admin123   |
| Admin       | john@afrifarmers.rw    | user123    |
| Viewer      | jane@afrifarmers.rw    | viewer123  |

## API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Reference:
- **Auth:** `POST /api/auth/login`, `/register`, `GET /me`
- **Farmers:** `GET/POST/PUT/DELETE /api/farmers`
- **Dashboard:** `GET /api/dashboard`
- **Health:** `GET /api/health`

## Features

- ✅ JWT Authentication
- ✅ Role-Based Access Control (Super Admin, Admin, Viewer)
- ✅ CRUD operations for farmers
- ✅ Dashboard with statistics and charts
- ✅ Search and filtering
- ✅ Pagination
- ✅ CSV import/export
- ✅ Responsive design

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts

**Backend:**
- Node.js
- Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
