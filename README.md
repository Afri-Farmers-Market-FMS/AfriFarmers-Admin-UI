# AfriFarmers Admin System

A comprehensive full-stack administration dashboard for managing farmer registrations, user access, and analytics for the AfriFarmers platform. This system includes Role-Based Access Control (RBAC), data visualization, and Excel reporting capabilities.

## 🚀 Features

- **Dashboard**: Real-time statistics, crop distribution charts, and meaningful insights.
- **Farmer Management**:
  - CRUD operations for farmer profiles.
  - **Excel Import**: Bulk upload farmers using Excel templates.
  - **Excel Export**: Export farmer data to Excel sheets.
  - Advanced filtering (Province, District, Status, Ownership).
- **User Management**:
  - Role-Based Access Control (Super Admin, Admin, Viewer).
  - Secure authentication with JWT.
  - **2FA Support**: Two-factor authentication using authenticator apps.
- **Analytics**: Detailed breakdown of farmers by gender, age groups, and location.
- **Security**: Password hashing, protected routes, and token-based auth.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, clsx
- **Icons**: Lucide React
- **Charts**: Recharts
- **Data Handling**: XLSX (SheetJS) for Excel operations
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Bcryptjs
- **2FA**: Speakeasy, QRCode
- **File Handling**: Multer, XLSX, ExcelJS
- **Validation**: Express Validator
- **Language**: TypeScript

## 📋 Prerequisites

Before you begin, ensure you have met the following requirements:
- **Node.js** (v16 or higher)
- **MongoDB** (Local instance or Atlas connection string)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AfriFarmers-Admin-UI
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/afrifarmers
JWT_SECRET=your_super_secret_jwt_key_change_this
# Optional: Seed data configuration if needed
```

seed the database (Optional - creates initial admin user):

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

The server should run on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal and navigate to the Frontend directory:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `Frontend` folder:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The frontend should be accessible at `http://localhost:5173`.

## 📚 Documentation

For detailed information about the API Endpoints, Request examples, and Responses, please refer to the [API Documentation](API_DOCUMENTATION.md) file included in this repository.

## 👥 Roles & Permissions

- **Super Admin**: Full access to all modules, including managing other admins and users.
- **Admin**: Can manage farmers and view analytics/dashboard. cannot manage system users.
- **Viewer**: Read-only access to farmers and dashboard data.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
