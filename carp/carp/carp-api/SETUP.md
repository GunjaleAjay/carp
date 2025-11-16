# 🚗 Carbon-Aware Route Planner API - Setup Guide

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Google Maps API Key

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
```bash
# Copy the environment template
cp env.template .env

# Edit .env with your actual values
nano .env  # or use your preferred editor
```

### 3. Required Environment Variables

#### 🔑 Essential Variables (Must Configure):
```bash
# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=carbon_route_planner

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

### 4. Database Setup

#### Create Database:
```sql
CREATE DATABASE carbon_route_planner;
```

#### Run Migrations:
```bash
npm run migrate
```

#### Seed Initial Data:
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

The API will be available at: `http://localhost:3001`

## 🏗️ Architecture Overview

This project follows the **MVC (Model-View-Controller)** architectural pattern:

- **Models**: Database models and data access (via Knex.js)
- **Views**: JSON API responses (no traditional views in API)
- **Controllers**: Business logic and request handling
- **Services**: Reusable business logic and external API integration
- **Routes**: HTTP endpoint definitions and middleware
- **Middleware**: Cross-cutting concerns (auth, validation, error handling)

### MVC Flow:
```
HTTP Request → Route → Middleware → Controller → Service → Model → Database
                ↓
HTTP Response ← JSON ← Controller ← Service ← Model ← Database
```

### Model Layer (Knex.js Integration):
The **Models** folder contains database access objects that encapsulate all database operations:

- **`User.js`**: User CRUD operations, authentication queries, user statistics
- **`Vehicle.js`**: Vehicle management, emission calculations, default vehicle handling
- **`Trip.js`**: Trip history, statistics, filtering, pagination

**Benefits of Model Layer:**
- **Separation of Concerns**: Database logic separated from business logic
- **Reusability**: Models can be used across multiple controllers/services
- **Maintainability**: Database queries centralized and easy to modify
- **Testing**: Models can be unit tested independently
- **Type Safety**: JSDoc documentation provides type information

## 📁 Project Structure

```
carp-api/
├── index.js                 # Main application entry point
├── package.json             # Dependencies and scripts
├── knexfile.js             # Database configuration
├── env.template            # Environment variables template
├── SETUP.md               # This setup guide
├── database/              # Database related files
│   ├── connection.js      # Database connection setup
│   ├── migrations/        # Database migration files
│   └── seeds/            # Database seed files
├── middleware/            # Express middleware
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Error handling middleware
│   └── notFound.js       # 404 handler
├── controllers/          # MVC Controllers (Business Logic)
│   ├── authController.js      # Authentication controller
│   ├── usersController.js     # User management controller
│   ├── vehiclesController.js  # Vehicle management controller
│   ├── routesController.js    # Route planning controller
│   ├── analyticsController.js # Analytics controller
│   └── adminController.js     # Admin controller
├── routes/               # API route definitions (Routes only)
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   ├── vehicles.js      # Vehicle management routes
│   ├── routes.js        # Route planning routes
│   ├── analytics.js     # Analytics routes
│   └── admin.js         # Admin routes
├── models/              # Database Models (Data Access Layer)
│   ├── User.js         # User model with database operations
│   ├── Vehicle.js      # Vehicle model with database operations
│   ├── Trip.js         # Trip model with database operations
│   └── index.js        # Models export file
├── services/            # Business logic services
│   ├── authService.js   # Authentication service
│   ├── vehicleService.js # Vehicle management service
│   ├── googleMapsService.js # Google Maps integration
│   ├── routeService.js  # Route planning service
│   └── adminService.js  # Admin operations service
└── utils/               # Utility functions
    ├── validation.js    # Input validation schemas
    └── carbonCalculation.js # Carbon emission calculations
```

## 🔧 Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Directions API**
   - **Distance Matrix API**
   - **Places API** (optional)
4. Create API credentials (API Key)
5. Restrict the API key to your domain/IP for security
6. Add the API key to your `.env` file

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Vehicles
- `GET /api/vehicles` - Get user vehicles
- `POST /api/vehicles` - Add new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Routes
- `POST /api/routes/plan` - Plan carbon-aware route
- `GET /api/routes/history` - Get route history

### Analytics
- `GET /api/analytics/dashboard` - User dashboard data
- `GET /api/analytics/emissions` - Emission statistics

### Admin
- `GET /api/admin/users` - Manage users
- `GET /api/admin/emission-factors` - Manage emission factors
- `GET /api/admin/logs` - View system logs

## 🗄️ Database Schema

The application creates the following tables:
- `users` - User accounts and profiles
- `vehicles` - User vehicle information
- `emission_factors` - CO2 emission factors by vehicle type
- `trips` - Route planning history
- `user_preferences` - User settings and preferences
- `admin_logs` - Administrative action logs

## 🔒 Security Features

- JWT-based authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation with Joi
- Password hashing with bcrypt

## 🚀 Production Deployment

### Azure App Service:
1. Set environment variables in Azure App Settings
2. Configure MySQL database (Azure Database for MySQL)
3. Set up CI/CD pipeline
4. Configure custom domain and SSL

### Environment Variables for Production:
```bash
NODE_ENV=production
PORT=80
JWT_SECRET=your-production-jwt-secret
DB_HOST=your-azure-mysql-host
DB_USER=your-azure-mysql-user
DB_PASSWORD=your-azure-mysql-password
DB_NAME=carbon_route_planner
DB_SSL=true
GOOGLE_MAPS_API_KEY=your-production-google-maps-key
FRONTEND_URL=https://your-frontend-domain.com
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Health check
curl http://localhost:3001/health
```

## 📝 API Documentation

The API includes comprehensive JSDoc documentation. Use tools like:
- **Swagger UI** for interactive API documentation
- **Postman** for API testing
- **Insomnia** for API development

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Google Maps API Errors**
   - Verify API key is correct
   - Check API restrictions
   - Ensure required APIs are enabled

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure proper token format

### Logs:
```bash
# View application logs
npm run dev

# Database migration logs
npm run migrate

# Seed logs
npm run seed
```

## 📞 Support

For issues and questions:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check database connectivity

## 🔄 Updates

To update the application:
```bash
# Pull latest changes
git pull

# Install new dependencies
npm install

# Run migrations
npm run migrate

# Restart the server
npm run dev
```
