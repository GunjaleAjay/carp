# Carbon-Aware Route Planner

An intelligent route planning application that helps users choose travel routes that minimize CO₂ emissions. The system provides multiple route options, calculates carbon emissions, and suggests eco-friendly alternatives.

## 🚀 Implemented Features

### ✅ Core Functionality
- **User Authentication**: Secure JWT-based login and registration system
- **Smart Route Planning**: Multiple route options with Google Maps integration
- **Carbon Emission Calculation**: Accurate CO₂ emissions based on vehicle type and efficiency
- **Vehicle Management**: Configure multiple vehicles with detailed specifications (fuel type, efficiency, etc.)
- **Trip History**: Save and track your routes and carbon savings
- **Analytics Dashboard**: Visualize your environmental impact over time
- **Responsive Design**: Mobile-first design with Material-UI components

### ✅ Admin Features
- **User Management**: View and manage user accounts and permissions
- **Emission Factors**: Configure carbon emission factors for different vehicle types
- **System Analytics**: System-wide usage and environmental impact metrics
- **Admin Dashboard**: Comprehensive admin interface for system management

### ✅ Technical Implementation
- **RESTful API**: Complete backend API with JWT authentication
- **MVC Architecture**: Clean separation of concerns with controllers, models, and routes
- **Database Integration**: MySQL with Knex.js ORM and migrations
- **Modern UI**: React with Material-UI and eco-friendly theming
- **Route Protection**: Centralized JWT authentication for all protected routes

## Technology Stack

### Backend (JavaScript)
- **Node.js** with **Express.js** - REST API server
- **JavaScript** - Server-side development
- **MySQL** - Database for persistent storage
- **Knex.js** - SQL query builder and migrations
- **JWT** - Authentication and authorization
- **Google Maps APIs** - Directions and Distance Matrix services
- **MVC Architecture** - Controllers, Models, and centralized routing

### Frontend (React + Material-UI)
- **React 18** with **TypeScript** - Modern UI framework
- **Material-UI (MUI)** - Component library with eco-friendly theming
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Material-UI Icons** - Comprehensive icon library

## Project Structure

```
carbon-aware-route-planner/
├── carp-api/                 # Backend API (JavaScript)
│   ├── controllers/          # Business logic controllers
│   ├── models/              # Database models (Knex.js)
│   ├── routes/              # API routes with centralized auth
│   ├── middleware/          # Express middleware (auth, error handling)
│   ├── services/            # Business logic services
│   ├── database/            # Migrations and seeds
│   ├── utils/               # Utility functions
│   ├── package.json
│   ├── knexfile.js
│   └── SETUP.md
├── carp-ui/                 # Frontend React app (Material-UI)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── layout/      # Layout components (Header, Sidebar)
│   │   │   └── ui/          # UI components (Loading, etc.)
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Login, Register pages
│   │   │   ├── admin/       # Admin pages
│   │   │   └── *.tsx        # Main application pages
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── services/        # API services
│   │   ├── theme/           # Material-UI theme configuration
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── README.md                # Main project documentation
├── BUSINESS_README.md       # Business-focused documentation
├── carp-api/README.md       # API documentation
├── carp-ui/README.md        # UI documentation
└── SETUP.md                 # Quick setup guide
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Google Maps API key

### Quick Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd carbon-aware-route-planner
   ```

2. **Backend Setup**:
   ```bash
   cd carp-api
   npm install
   # Copy env.template to .env and configure your settings
   npm run migrate
   npm run seed
   npm run dev  # Starts on http://localhost:3001
   ```

3. **Frontend Setup**:
   ```bash
   cd carp-ui
   npm install
   # Create .env file with your Google Maps API key
   npm run dev  # Starts on http://localhost:5174
   ```

### Detailed Setup

See individual README files:
- [API Setup Guide](carp-api/SETUP.md) - Detailed backend setup instructions
- [UI Setup Guide](carp-ui/MUI_SETUP.md) - Detailed frontend setup instructions
- [Business Overview](BUSINESS_README.md) - Business value proposition and use cases

### Environment Variables

**Backend (.env)**:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=carbon_route_planner
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
PORT=3001
NODE_ENV=development
```

**Frontend (.env)**:
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_BASE_URL=http://localhost:3001/api
VITE_NODE_ENV=development
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change user password

### Vehicle Management
- `GET /api/vehicles` - Get user's vehicles
- `POST /api/vehicles` - Create a new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `POST /api/vehicles/:id/set-default` - Set vehicle as default

### Route Planning
- `POST /api/routes/plan` - Plan routes with carbon calculations
- `POST /api/routes/save` - Save a trip
- `GET /api/routes/trips` - Get user's saved trips
- `GET /api/routes/stats` - Get route statistics

### Analytics
- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/analytics/emissions` - Get emission analytics
- `GET /api/analytics/savings` - Get carbon savings analytics

### Admin (Admin users only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/emission-factors` - Get emission factors
- `POST /api/admin/emission-factors` - Create emission factor
- `GET /api/admin/stats` - Get system statistics

## Database Schema

### Users Table
- User authentication and profile information
- Role-based access control (user/admin)

### Vehicles Table
- User vehicle configurations
- Vehicle specifications for emission calculations

### Emission Factors Table
- CO₂ emission factors per vehicle type and fuel type
- Configurable by administrators

### Trips Table
- Saved user trips and route data
- Carbon emission calculations per trip

### User Preferences Table
- User routing preferences
- Eco-friendly travel settings

### Admin Logs Table
- Administrative action logging
- System audit trail

## Deployment

### Azure Deployment

1. **Database Setup**:
   - Create Azure Database for MySQL
   - Configure connection strings in Azure App Settings

2. **Backend Deployment**:
   - Deploy to Azure App Service
   - Configure environment variables
   - Set up continuous deployment

3. **Frontend Deployment**:
   - Deploy to Azure Static Web Apps or App Service
   - Configure build settings for Vite
   - Set up CDN for static assets

### Environment Variables for Production

#### Backend
```env
DB_HOST=your_azure_mysql_host
DB_PORT=3306
DB_NAME=carbon_route_planner
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_production_jwt_secret
GOOGLE_MAPS_API_KEY=your_production_maps_key
PORT=3001
NODE_ENV=production
```

#### Frontend
```env
VITE_GOOGLE_MAPS_API_KEY=your_production_maps_key
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_NODE_ENV=production
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@carbonplanner.com or create an issue in the GitHub repository.

## 📚 Documentation

### Technical Documentation
- **[API Documentation](carp-api/README.md)** - Complete backend API guide
- **[UI Documentation](carp-ui/README.md)** - Frontend application guide
- **[API Setup Guide](carp-api/SETUP.md)** - Backend setup instructions
- **[UI Setup Guide](carp-ui/MUI_SETUP.md)** - Frontend setup instructions

### Business Documentation
- **[Business Overview](BUSINESS_README.md)** - Business value proposition, use cases, and market analysis
- **Target Audience**: Individual users, fleet managers, sustainability coordinators
- **Key Features**: Route planning, emission tracking, analytics, admin management
- **Competitive Advantages**: Real-time data, precise calculations, mobile-first design

## 🗺️ Roadmap

### Short-term (3-6 months)
- [ ] Real-time traffic integration
- [ ] Mobile app (React Native)
- [ ] Enhanced analytics and reporting
- [ ] Social features and challenges

### Medium-term (6-12 months)
- [ ] Carbon offset integration
- [ ] API for third-party integrations
- [ ] Machine learning for route optimization
- [ ] Multi-language support

### Long-term (1-2 years)
- [ ] IoT integration with connected vehicles
- [ ] Blockchain-based carbon credit trading
- [ ] Smart city integration
- [ ] Global market expansion
