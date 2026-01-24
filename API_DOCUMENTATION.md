# AfriFarmers Admin API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except login and register) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /auth/login
Login user and get JWT token.

**Request Body:**
```json
{
  "email": "admin@afrifarmers.rw",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "65abc123...",
    "name": "Admin User",
    "email": "admin@afrifarmers.rw",
    "role": "Super Admin",
    "avatar": null
  }
}
```

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Viewer"  // Optional: "Super Admin", "Admin", "Viewer"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Viewer"
  }
}
```

### GET /auth/me
Get current logged-in user info.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "65abc123...",
    "name": "Admin User",
    "email": "admin@afrifarmers.rw",
    "role": "Super Admin",
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

### PUT /auth/password
Update user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Farmers Endpoints

### GET /farmers
Get all farmers with optional filtering and pagination.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter  | Type    | Description                                |
|------------|---------|-------------------------------------------|
| page       | number  | Page number (default: 1)                  |
| limit      | number  | Items per page (1-100, default: all)      |
| search     | string  | Search by name, district, phone, etc.     |
| district   | string  | Filter by district                        |
| province   | string  | Filter by province                        |
| ownership  | string  | "Youth-owned" or "Non youth-owned"        |
| status     | string  | "Active", "Pending", or "Inactive"        |

**Example:**
```
GET /api/farmers?page=1&limit=10&district=Gasabo&ownership=Youth-owned
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 150,
  "page": 1,
  "pages": 15,
  "data": [
    {
      "id": 1,
      "farmerId": 1,
      "businessName": "Green Farm Ltd",
      "ownerName": "Jean Mutoni",
      "ownership": "Youth-owned",
      "district": "Gasabo",
      "province": "Kigali City",
      "sector": "Kimironko",
      "cell": "Kibagabaga",
      "village": "Nyabisindu",
      "phone": "+250788123456",
      "tin": "123456789",
      "businessType": "Company",
      "ownerAge": 28,
      "valueChain": "Coffee",
      "status": "Active",
      "employees": 5,
      "femaleEmployees": 3,
      "youthEmployees": 4,
      "crops": [
        { "id": "abc123", "name": "Coffee", "quantity": 500, "unit": "kg" }
      ],
      "createdAt": "2026-01-20T08:00:00.000Z",
      "updatedAt": "2026-01-20T08:00:00.000Z"
    }
  ]
}
```

### GET /farmers/:id
Get a single farmer by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "farmerId": 1,
    "businessName": "Green Farm Ltd",
    ...
  }
}
```

### POST /farmers
Create a new farmer. **Requires Admin or Super Admin role.**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "businessName": "New Farm Co",
  "ownerName": "Alice Uwimana",
  "ownership": "Youth-owned",
  "commencementDate": "2025-06-15",
  "province": "Kigali City",
  "district": "Gasabo",
  "sector": "Remera",
  "cell": "Rukiri",
  "village": "Nyarutarama",
  "phone": "+250788999888",
  "tin": "987654321",
  "businessType": "Individual",
  "ownerAge": 25,
  "educationLevel": "Bachelor's degree",
  "disabilityStatus": "None",
  "businessSize": "Micro",
  "revenue": "Less than 840,000 Rwf",
  "annualIncome": "Less than 840,000 Rwf",
  "employees": 2,
  "femaleEmployees": 1,
  "youthEmployees": 2,
  "valueChain": "Vegetables",
  "status": "Active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "farmerId": 4,
    "businessName": "New Farm Co",
    ...
  }
}
```

### PUT /farmers/:id
Update an existing farmer. **Requires Admin or Super Admin role.**

**Headers:** `Authorization: Bearer <token>`

**Request Body (only include fields to update):**
```json
{
  "businessName": "Updated Farm Name",
  "phone": "+250788111222",
  "employees": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "farmerId": 1,
    "businessName": "Updated Farm Name",
    "phone": "+250788111222",
    "employees": 10,
    ...
  }
}
```

### DELETE /farmers/:id
Delete a farmer. **Requires Admin or Super Admin role.**

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Farmer deleted successfully"
}
```

### POST /farmers/bulk
Bulk import farmers. **Requires Super Admin role.**

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "farmers": [
    {
      "businessName": "Farm 1",
      "ownerName": "Owner 1",
      ...
    },
    {
      "businessName": "Farm 2",
      "ownerName": "Owner 2",
      ...
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "message": "Successfully imported 2 farmers"
}
```

---

## Dashboard Endpoints

### GET /dashboard
Get full dashboard data including stats and charts.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalFarmers": 150,
      "youthOwnedPercentage": 65,
      "totalEmployees": 450,
      "topValueChain": "Coffee",
      "districtsCovered": 12,
      "femaleEmployees": 180,
      "youthEmployees": 320
    },
    "districtData": [
      { "name": "Gasabo", "value": 35 },
      { "name": "Kicukiro", "value": 28 }
    ],
    "revenueData": [
      { "name": "< 840k", "value": 45 },
      { "name": "840k-1.2M", "value": 30 }
    ],
    "businessSizeData": [
      { "name": "Micro", "value": 80 },
      { "name": "Small", "value": 50 }
    ],
    "growthData": [
      { "name": "Jan", "value": 12 },
      { "name": "Feb", "value": 15 }
    ],
    "valueChainData": [
      { "name": "Coffee", "value": 40 },
      { "name": "Vegetables", "value": 35 }
    ],
    "ownershipData": [
      { "name": "Youth-owned", "value": 98 },
      { "name": "Non youth-owned", "value": 52 }
    ],
    "recentFarmers": [
      { "id": 1, "businessName": "Latest Farm", ... }
    ]
  }
}
```

### GET /dashboard/stats
Get only dashboard statistics (lighter endpoint).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFarmers": 150,
    "youthOwnedPercentage": 65,
    "totalEmployees": 450,
    "femaleEmployees": 180,
    "youthEmployees": 320
  }
}
```

---

## Health Check

### GET /health
Check if API is running.

**Response:**
```json
{
  "status": "ok",
  "message": "AfriFarmers API is running",
  "timestamp": "2026-01-24T10:00:00.000Z"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    }
  ]
}
```

### HTTP Status Codes:
| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request (validation error) |
| 401  | Unauthorized (invalid/missing token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found |
| 500  | Server Error |

---

## User Roles & Permissions

| Role        | Can View | Can Create | Can Update | Can Delete | Bulk Import |
|-------------|----------|------------|------------|------------|-------------|
| Super Admin | ✅       | ✅         | ✅         | ✅         | ✅          |
| Admin       | ✅       | ✅         | ✅         | ✅         | ❌          |
| Viewer      | ✅       | ❌         | ❌         | ❌         | ❌          |

---

## Test Credentials

| Role        | Email                  | Password   |
|-------------|------------------------|------------|
| Super Admin | admin@afrifarmers.rw   | admin123   |
| Admin       | john@afrifarmers.rw    | user123    |
| Viewer      | jane@afrifarmers.rw    | viewer123  |

---

## Frontend Usage Examples

### Login and fetch farmers:
```typescript
// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@afrifarmers.rw', password: 'admin123' })
});
const { token } = await loginResponse.json();

// Fetch farmers
const farmersResponse = await fetch('http://localhost:5000/api/farmers', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: farmers } = await farmersResponse.json();
```

### Update a farmer:
```typescript
const updateResponse = await fetch('http://localhost:5000/api/farmers/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ businessName: 'New Business Name' })
});
const { data: updatedFarmer } = await updateResponse.json();
```
