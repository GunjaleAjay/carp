# 🔐 Route Protection & Authentication Guide

## 🛡️ JWT Authentication Implementation

### Centralized Route Protection

All routes are now protected through the centralized `routes/index.js` file:

```javascript
// Public routes (no authentication required)
router.use('/auth', authRoutes);

// Protected routes (require JWT authentication)
router.use('/users', authenticate, userRoutes);
router.use('/vehicles', authenticate, vehicleRoutes);
router.use('/routes', authenticate, routeRoutes);
router.use('/analytics', authenticate, analyticsRoutes);

// Admin routes (require JWT authentication + admin role)
router.use('/admin', authenticate, requireAdmin, adminRoutes);
```

### 🔑 Authentication Levels

#### 1. **Public Routes** (`/api/auth/*`)
- ✅ **No authentication required**
- Available endpoints:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `POST /api/auth/logout` - User logout
  - `GET /api/auth/me` - Get current user profile
  - `PUT /api/auth/profile` - Update user profile
  - `POST /api/auth/change-password` - Change password

#### 2. **Protected Routes** (`/api/users/*`, `/api/vehicles/*`, `/api/routes/*`, `/api/analytics/*`)
- 🔐 **Require valid JWT token**
- Available to all authenticated users
- Examples:
  - `GET /api/users/preferences` - Get user preferences
  - `POST /api/vehicles` - Add vehicle
  - `POST /api/routes/plan` - Plan route
  - `GET /api/analytics/dashboard` - Get dashboard data

#### 3. **Admin Routes** (`/api/admin/*`)
- 🔐 **Require valid JWT token + admin role**
- Available only to admin users
- Examples:
  - `GET /api/admin/users` - Get all users
  - `POST /api/admin/emission-factors` - Add emission factor
  - `GET /api/admin/logs` - View system logs

### 🚀 How to Use

#### 1. **Get Authentication Token**
```bash
# Register new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Login to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### 2. **Use Token for Protected Routes**
```bash
# Get user vehicles (requires authentication)
curl -X GET http://localhost:3001/api/vehicles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Plan route (requires authentication)
curl -X POST http://localhost:3001/api/routes/plan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "New York, NY",
    "destination": "Boston, MA",
    "vehicle_id": 1
  }'
```

#### 3. **Admin Routes**
```bash
# Get all users (requires admin role)
curl -X GET http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### 🔧 Middleware Details

#### `authenticate` Middleware
- Validates JWT token from `Authorization` header
- Extracts user information and adds to `req.user`
- Returns `401 Unauthorized` if token is invalid/missing

#### `requireAdmin` Middleware
- Checks if authenticated user has admin role
- Returns `403 Forbidden` if user is not admin
- Must be used after `authenticate` middleware

### 📝 Token Format
```javascript
// Request header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Token payload
{
  "userId": 1,
  "email": "user@example.com",
  "role": "user", // or "admin"
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 🛠️ Environment Variables Required

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 🚨 Security Best Practices

1. **Token Storage**: Store JWT tokens securely (httpOnly cookies recommended for web)
2. **Token Expiration**: Use short expiration times and refresh tokens
3. **HTTPS**: Always use HTTPS in production
4. **Secret Key**: Use strong, random JWT secrets
5. **Rate Limiting**: Implement rate limiting on auth endpoints
6. **Input Validation**: Validate all inputs using Joi schemas

### 🔍 Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Access denied. No token provided."
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied. Admin role required."
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid token format."
}
```

### 📊 Route Summary

| Route Group | Authentication | Role Required | Description |
|-------------|----------------|---------------|-------------|
| `/api/auth/*` | ❌ None | - | Authentication endpoints |
| `/api/users/*` | ✅ JWT | User | User management |
| `/api/vehicles/*` | ✅ JWT | User | Vehicle management |
| `/api/routes/*` | ✅ JWT | User | Route planning |
| `/api/analytics/*` | ✅ JWT | User | Analytics & reporting |
| `/api/admin/*` | ✅ JWT | Admin | Admin operations |

### 🧪 Testing Authentication

Use the health check endpoint to test server connectivity:
```bash
curl http://localhost:3001/health
```

This endpoint doesn't require authentication and returns server status.
