# API Documentation

Base URL: `/api`

## Authentication (`/auth`)

### Register
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123",
    "role": "Viewer" // Optional: 'Super Admin', 'Admin', 'Viewer'
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "jwt_token_string",
    "user": {
      "id": "mongo_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "Viewer",
      "twoFactorEnabled": false
    }
  }
  ```

### Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "twoFactorCode": "123456" // Optional, required if 2FA is enabled
  }
  ```
- **Response (Success)**:
  ```json
  {
    "success": true,
    "token": "jwt_token_string",
    "user": { ... }
  }
  ```
- **Response (2FA Required)**:
  ```json
  {
    "success": true,
    "requiresTwoFactor": true,
    "message": "Two-factor authentication code required"
  }
  ```

### Get Current User
- **Endpoint**: `GET /auth/me`
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "user": { ... }
  }
  ```

### Update Profile
- **Endpoint**: `PUT /auth/profile`
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Body** (all optional):
  ```json
  {
    "name": "New Name",
    "email": "newemail@example.com",
    "phone": "0780000000"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": { ... }
  }
  ```

### Change Password
- **Endpoint**: `PUT /auth/password`
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "currentPassword": "oldPassword",
    "newPassword": "newPassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password updated successfully",
    "token": "new_jwt_token"
  }
  ```

### Setup 2FA
- **Endpoint**: `POST /auth/2fa/setup`
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "secret": "base32_secret",
      "qrCode": "data:image/png;base64,...",
      "otpauthUrl": "otpauth://..."
    }
  }
  ```

### Verify 2FA
- **Endpoint**: `POST /auth/2fa/verify`
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "code": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Two-factor authentication enabled successfully"
  }
  ```

### Disable 2FA
- **Endpoint**: `POST /auth/2fa/disable`
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "password": "current_password"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Two-factor authentication disabled"
  }
  ```

### Get 2FA Status
- **Endpoint**: `GET /auth/2fa/status`
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "enabled": true
    }
  }
  ```

---

## Users (`/users`)

### Get All Users
- **Endpoint**: `GET /users`
- **Access**: Private (Admin/Super Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "count": 10,
    "data": [ ... ]
  }
  ```

### Get User by ID
- **Endpoint**: `GET /users/:id`
- **Access**: Private (Admin/Super Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

### Create User
- **Endpoint**: `POST /users`
- **Access**: Private (Super Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Name",
    "email": "email@test.com",
    "password": "password",
    "role": "Admin"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

### Update User
- **Endpoint**: `PUT /users/:id`
- **Access**: Private (Super Admin, or Self)
- **Headers**: `Authorization: Bearer <token>`
- **Body** (optional fields):
  ```json
  {
    "name": "New Name",
    "role": "Admin", // Super Admin only
    "status": "Inactive" // Super Admin only
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

### Delete User
- **Endpoint**: `DELETE /users/:id`
- **Access**: Private (Super Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

---

## Farmers (`/farmers`)

### Get Farmers
- **Endpoint**: `GET /farmers`
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**:
  - `page`: Page number (default 1)
  - `limit`: Items per page (default all)
  - `search`: Search query string
  - `district`: Filter by district
  - `province`: Filter by province
  - `ownership`: 'Youth-owned' or 'Non youth-owned'
  - `status`: 'Active', 'Pending', 'Inactive'
- **Response**:
  ```json
  {
    "success": true,
    "count": 50,
    "total": 100,
    "page": 1,
    "pages": 2,
    "data": [ ... ]
  }
  ```

### Get Farmer by ID
- **Endpoint**: `GET /farmers/:id`
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Note**: `:id` can be the numeric `farmerId` or the MongoDB `_id`.
- **Response**:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

### Create Farmer
- **Endpoint**: `POST /farmers`
- **Access**: Private (Admin/Super Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "businessName": "Farm Ltd",
    "ownerName": "John Doe",
    "phone": "0780000000",
    "province": "Kigali",
    "district": "Gasabo",
    "sector": "Remera",
    "cell": "Rukiri",
    "village": "Amahoro",
    "ownership": "Youth-owned",
    "businessType": "Crop Production",
    "valueChain": "Horticulture",
    "commencementDate": "2023-01-01",
    "ownerAge": 25,
    "status": "Active"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 101, // farmerId
      ...
    }
  }
  ```

### Update Farmer
- **Endpoint**: `PUT /farmers/:id`
- **Access**: Private (Admin/Super Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Any fields from the Create Farmer body.
- **Response**:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

### Delete Farmer
- **Endpoint**: `DELETE /farmers/:id`
- **Access**: Private (Admin/Super Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Farmer deleted successfully"
  }
  ```

### Download Template
- **Endpoint**: `GET /farmers/template`
- **Access**: Private (Admin/Super Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Binary Excel file (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

### Bulk Upload
- **Endpoint**: `POST /farmers/upload-excel`
- **Access**: Private (Admin/Super Admin)
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Body**: Form data with `file` field containing Excel file.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Successfully imported X farmer(s)",
    "importedCount": 10,
    "duplicateCount": 2,
    "errorCount": 0,
    "totalRows": 12
  }
  ```

### Bulk Create (JSON)
- **Endpoint**: `POST /farmers/bulk`
- **Access**: Private (Super Admin)
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "farmers": [ { ... }, { ... } ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Successfully imported X farmers"
  }
  ```

---

## Dashboard (`/dashboard`)

### Get Dashboard Data
- **Endpoint**: `GET /dashboard`
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "stats": { ... },
      "graphs": { ... }
    }
  }
  ```

---

## Analytics (`/analytics`)

### Get Analytics Data
- **Endpoint**: `GET /analytics`
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "provinceData": [ ... ],
      "genderData": [ ... ],
      "ageData": [ ... ],
      ...
    }
  }
  ```
