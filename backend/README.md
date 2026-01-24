# AfriFarmers Backend API

Backend API server for the AfriFarmers Admin System built with Node.js, Express, TypeScript, and MongoDB.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Installation

```bash
cd backend
npm install
```

## Configuration

Create a `.env` file (already created with defaults):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/afrifarmers
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Seed Database
```bash
npm run seed
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| POST | `/api/auth/logout` | Logout user | Private |
| PUT | `/api/auth/password` | Change password | Private |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin+ |
| GET | `/api/users/:id` | Get user by ID | Admin+ |
| POST | `/api/users` | Create user | Super Admin |
| PUT | `/api/users/:id` | Update user | Super Admin/Self |
| DELETE | `/api/users/:id` | Delete user | Super Admin |

### Farmers/Businesses
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/farmers` | Get all farmers | Private |
| GET | `/api/farmers/:id` | Get farmer by ID | Private |
| POST | `/api/farmers` | Create farmer | Admin+ |
| PUT | `/api/farmers/:id` | Update farmer | Admin+ |
| DELETE | `/api/farmers/:id` | Delete farmer | Admin+ |
| POST | `/api/farmers/bulk` | Bulk import | Super Admin |

### Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard` | Get full dashboard data | Private |
| GET | `/api/dashboard/stats` | Get stats only | Private |

### Analytics
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/analytics` | Get analytics data | Private |
| GET | `/api/analytics/export` | Get export data | Private |

## Default Users (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@afrifarmers.rw | admin123 |
| Admin | john@afrifarmers.rw | user123 |
| Viewer | jane@afrifarmers.rw | viewer123 |

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── models/
│   │   ├── User.ts
│   │   └── Farmer.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── farmers.ts
│   │   ├── dashboard.ts
│   │   └── analytics.ts
│   ├── scripts/
│   │   └── seed.ts
│   ├── types/
│   │   └── index.ts
│   └── server.ts
├── .env
├── package.json
└── tsconfig.json
```
