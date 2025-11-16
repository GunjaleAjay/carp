# Carbon-Aware Route Planner - API

The backend API for the Carbon-Aware Route Planner application. Built with Node.js, Express.js, and MySQL using JavaScript (converted from TypeScript).

## 🚀 Features

### ✅ Implemented Features
- **JWT Authentication**: Secure user authentication and authorization
- **MVC Architecture**: Clean separation with Controllers, Models, and centralized Routes
- **Vehicle Management**: CRUD operations for user vehicles with emission calculations
- **Route Planning**: Google Maps integration for route planning and carbon calculations
- **Trip History**: Save and retrieve user trip history
- **Analytics**: User and system analytics for carbon emissions and savings
- **Admin Panel**: User management and emission factor configuration
- **Database Migrations**: Knex.js migrations for database schema management
- **Centralized Route Protection**: JWT middleware applied to all protected routes

## 🏗️ Architecture

### Project Structure
```
carp-api/
├── controllers/          # Business logic controllers
│   ├── authController.js      # Authentication logic
│   ├── usersController.js     # User management
│   ├── vehiclesController.js  # Vehicle CRUD operations
│   ├── routesController.js    # Route planning logic
│   ├── analyticsController.js # Analytics and reporting
│   └── adminController.js     # Admin operations
├── models/               # Database models (Knex.js)
│   ├── User.js                # User model
│   ├── Vehicle.js             # Vehicle model
│   ├── Trip.js                # Trip model
│   └── index.js               # Model exports
├── routes/               # API routes
│   ├── index.js               # Centralized route registration
│   ├── auth.js                # Authentication routes
│   ├── users.js               # User routes
│   ├── vehicles.js            # Vehicle routes
│   ├── routes.js              # Route planning routes
│   ├── analytics.js           # Analytics routes
│   └── admin.js               # Admin routes
├── middleware/           # Express middleware
│   ├── auth.js                # JWT authentication middleware
│   ├── errorHandler.js        # Error handling middleware
│   └── notFound.js            # 404 handler
├── services/             # Business logic services
│   ├── authService.js         # Authentication service
│   ├── vehicleService.js      # Vehicle business logic
│   ├── googleMapsService.js   # Google Maps API integration
│   ├── routeService.js        # Route planning service
│   └── adminService.js        # Admin business logic
├── database/             # Database configuration
│   ├── connection.js          # Database connection
│   ├── migrations/            # Database migrations
│   └── seeds/                 # Database seeds
├── utils/                # Utility functions
│   ├── validation.js          # Input validation (Joi)
│   └── carbonCalculation.js   # Carbon emission calculations
├── package.json
├── knexfile.js
├── index.js              # Application entry point
├── env.template          # Environment variables template
└── SETUP.md              # Detailed setup guide
```

### MVC Pattern Implementation

**Models**: Database abstraction layer using Knex.js
- `User.js` - User data operations
- `Vehicle.js` - Vehicle data operations  
- `Trip.js` - Trip data operations

**Views**: JSON API responses (no server-side rendering)

**Controllers**: Business logic and request handling
- Handle HTTP requests and responses
- Validate input data
- Call appropriate services
- Return JSON responses

**Routes**: API endpoint definitions
- Centralized route registration in `routes/index.js`
- JWT authentication applied automatically to protected routes
- Clean separation of public vs protected endpoints

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: JavaScript (converted from TypeScript)
- **Database**: MySQL with Knex.js ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Password Hashing**: bcryptjs
- **HTTP Client**: Axios (for Google Maps API calls)
- **Rate Limiting**: express-rate-limit
- **Logging**: Morgan
- **Environment**: dotenv

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Users (Protected)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Vehicles (Protected)
- `GET /api/vehicles` - Get user's vehicles
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `POST /api/vehicles/:id/set-default` - Set vehicle as default

### Route Planning (Protected)
- `POST /api/routes/plan` - Plan routes with carbon calculations
- `POST /api/routes/save` - Save trip
- `GET /api/routes/trips` - Get user's trips
- `GET /api/routes/stats` - Get route statistics

### Analytics (Protected)
- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/analytics/emissions` - Get emission analytics
- `GET /api/analytics/savings` - Get carbon savings analytics

### Admin (Admin users only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/emission-factors` - Get emission factors
- `POST /api/admin/emission-factors` - Create emission factor
- `GET /api/admin/stats` - Get system statistics

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Google Maps API key

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp env.template .env
   # Edit .env with your configuration
   ```

3. **Database setup**:
   ```bash
   # Run migrations
   npm run migrate
   
   # Seed initial data
   npm run seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 📊 Database Schema

### Tables
- **users** - User authentication and profiles
- **vehicles** - User vehicle configurations
- **emission_factors** - Carbon emission factors by vehicle type
- **trips** - Saved user trips and routes
- **user_preferences** - User routing preferences
- **admin_logs** - Administrative action logs

### Key Relationships
- Users have many vehicles
- Users have many trips
- Trips reference vehicles for emission calculations
- Emission factors are configurable by admins

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Joi validation for all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **SQL Injection Protection**: Knex.js query builder
- **Environment Variables**: Secure configuration management

## 🧪 Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with initial data
- `npm run migrate:rollback` - Rollback last migration

### Environment Variables
See `env.template` for all required environment variables.

### Database Migrations
Migrations are located in `database/migrations/`. Use Knex.js CLI for migration management.

## 📚 Documentation

- [Detailed Setup Guide](SETUP.md)
- [Route Protection Documentation](ROUTE_PROTECTION.md)
- [API Documentation](API_DOCUMENTATION.md)

## 🤝 Contributing

1. Follow the MVC pattern
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test your changes

## 📄 License

This project is licensed under the MIT License.
