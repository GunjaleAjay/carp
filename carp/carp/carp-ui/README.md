# Carbon-Aware Route Planner - UI

The frontend application for the Carbon-Aware Route Planner. Built with React, TypeScript, and Material-UI with an eco-friendly design theme.

## 🚀 Features

### ✅ Implemented Features
- **User Authentication**: Login and registration with JWT integration
- **Responsive Design**: Mobile-first design with Material-UI components
- **Eco-Friendly Theme**: Custom Material-UI theme with environmental colors
- **Dashboard**: Comprehensive user dashboard with analytics and quick actions
- **Vehicle Management**: Add, edit, and manage multiple vehicles
- **Route Planning**: Interactive route planning with Google Maps integration
- **Trip History**: View and manage saved trips with carbon calculations
- **Analytics**: Visual analytics with charts and carbon savings tracking
- **Profile Management**: User profile settings and preferences
- **Admin Panel**: Admin dashboard for system management
- **Protected Routes**: Role-based access control for user and admin areas

## 🎨 Design System

### Material-UI Theme
- **Primary Colors**: Green-based eco-friendly palette
- **Typography**: Clean, modern fonts optimized for readability
- **Components**: Consistent Material-UI component library
- **Responsive**: Mobile-first design with breakpoint optimization
- **Accessibility**: WCAG compliant design patterns

### Color Palette
- **Primary**: Green shades (#2e7d32, #4caf50, #66bb6a)
- **Secondary**: Blue shades (#1976d2, #42a5f5)
- **Success**: Green variants for positive actions
- **Warning**: Orange shades for cautions
- **Error**: Red shades for errors
- **Background**: Light and dark theme support

## 🏗️ Project Structure

```
carp-ui/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── auth/             # Authentication components
│   │   │   ├── ProtectedRoute.tsx    # Route protection
│   │   │   └── AdminRoute.tsx        # Admin route protection
│   │   ├── layout/           # Layout components
│   │   │   ├── Layout.tsx            # Main layout wrapper
│   │   │   ├── Header.tsx            # App header with navigation
│   │   │   └── Sidebar.tsx           # Navigation sidebar
│   │   └── ui/               # UI components
│   │       └── LoadingSpinner.tsx    # Loading indicator
│   ├── pages/                # Page components
│   │   ├── auth/             # Authentication pages
│   │   │   ├── LoginPage.tsx         # User login
│   │   │   └── RegisterPage.tsx      # User registration
│   │   ├── admin/            # Admin pages
│   │   │   ├── AdminDashboardPage.tsx    # Admin dashboard
│   │   │   ├── AdminUsersPage.tsx        # User management
│   │   │   ├── AdminEmissionFactorsPage.tsx # Emission factors
│   │   │   └── AdminLogsPage.tsx         # System logs
│   │   ├── DashboardPage.tsx         # User dashboard
│   │   ├── VehiclesPage.tsx          # Vehicle management
│   │   ├── RoutePlanningPage.tsx     # Route planning
│   │   ├── TripsPage.tsx             # Trip history
│   │   ├── AnalyticsPage.tsx         # Analytics and charts
│   │   ├── ProfilePage.tsx           # User profile
│   │   ├── HomePage.tsx              # Landing page
│   │   └── NotFoundPage.tsx          # 404 page
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx           # Authentication state
│   ├── services/             # API services
│   │   └── api.ts                    # API client and endpoints
│   ├── theme/                # Material-UI theme
│   │   ├── theme.ts                  # Theme configuration
│   │   └── ThemeProvider.tsx         # Theme provider
│   ├── utils/                # Utility functions
│   │   └── cn.ts                     # Class name utility
│   ├── types/                # TypeScript types
│   │   └── index.ts                  # Type definitions
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # App entry point
│   └── index.css             # Global styles
├── package.json
├── vite.config.ts
├── tsconfig.json
└── MUI_SETUP.md              # Detailed setup guide
```

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **Styling**: Emotion (MUI's styling solution)
- **Routing**: React Router v6
- **State Management**: React Query + Context API
- **Forms**: React Hook Form
- **Icons**: Material-UI Icons
- **Charts**: Recharts
- **Date Handling**: date-fns + react-datepicker
- **Notifications**: react-hot-toast
- **Maps**: Google Maps JavaScript API

## 📱 Pages Overview

### Authentication Pages
- **Login Page**: User authentication with email/password
- **Register Page**: New user registration with form validation

### User Pages
- **Dashboard**: Overview of carbon savings, recent trips, and quick actions
- **Vehicles**: Manage user vehicles with detailed specifications
- **Route Planning**: Plan routes with Google Maps integration and carbon calculations
- **Trips**: View and manage saved trip history
- **Analytics**: Visual analytics with charts showing carbon impact over time
- **Profile**: User profile management and settings

### Admin Pages
- **Admin Dashboard**: System overview and statistics
- **User Management**: View and manage all users
- **Emission Factors**: Configure carbon emission factors
- **System Logs**: View administrative logs and actions

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Google Maps API key

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   # Create .env file with your Google Maps API key
   echo "VITE_GOOGLE_MAPS_API_KEY=your_api_key_here" > .env
   echo "VITE_API_BASE_URL=http://localhost:3001/api" >> .env
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5174`

## 🎯 Key Components

### Layout Components
- **Layout**: Main app wrapper with header and sidebar
- **Header**: Navigation bar with user menu and notifications
- **Sidebar**: Navigation menu with role-based menu items

### Authentication Components
- **ProtectedRoute**: Redirects unauthenticated users to login
- **AdminRoute**: Restricts access to admin users only

### Page Components
- **DashboardPage**: Comprehensive dashboard with analytics cards
- **VehiclesPage**: Vehicle management with CRUD operations
- **RoutePlanningPage**: Interactive route planning with Google Maps
- **TripsPage**: Trip history with filtering and search
- **AnalyticsPage**: Visual analytics with charts and metrics

## 🔐 Authentication & Authorization

### User Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage
- Logout functionality

### Route Protection
- Public routes: Login, Register, Home
- Protected routes: Dashboard, Vehicles, Routes, Trips, Analytics, Profile
- Admin routes: Admin dashboard and management pages

### Role-Based Access
- **User Role**: Access to personal features
- **Admin Role**: Access to system management features

## 📊 State Management

### Context API
- **AuthContext**: Global authentication state
- User information and login status
- Token management and refresh

### React Query
- API data fetching and caching
- Background data synchronization
- Optimistic updates
- Error handling and retry logic

## 🎨 Theming & Styling

### Material-UI Theme
- Custom eco-friendly color palette
- Typography scale and font families
- Component styling overrides
- Dark/light theme support

### Responsive Design
- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interactions
- Optimized for all device sizes

## 🗺️ Google Maps Integration

### Features
- Interactive map display
- Route visualization
- Marker placement
- Directions rendering

### Configuration
- API key via environment variables
- Map styling and customization
- Component lifecycle management

## 📈 Analytics & Charts

### Chart Library
- **Recharts**: React-based charting library
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions

### Metrics Displayed
- Carbon emissions over time
- Trip frequency and patterns
- Vehicle efficiency comparisons
- Environmental impact summaries

## 🧪 Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Environment Variables
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_BASE_URL=http://localhost:3001/api
VITE_NODE_ENV=development
```

### Development Features
- Hot module replacement
- TypeScript support
- ESLint integration
- Source maps for debugging

## 📚 Documentation

- [Material-UI Setup Guide](MUI_SETUP.md)
- [Component Documentation](COMPONENTS.md)
- [API Integration Guide](API_INTEGRATION.md)

## 🤝 Contributing

1. Follow Material-UI design patterns
2. Maintain responsive design principles
3. Use TypeScript for type safety
4. Follow the established component structure
5. Update documentation

## 📄 License

This project is licensed under the MIT License.
