# 🌱 Carbon-Aware Route Planner - UI Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd carp-ui
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `carp-ui` directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Google Maps API (for route planning and maps)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Application Configuration
VITE_APP_NAME=Carbon-Aware Route Planner
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_PWA=false
```

### 3. Start Development Server
```bash
npm run dev
```

The UI will be available at: `http://localhost:5173`

## 🎨 Design System

### Color Palette
- **Primary Green**: `#059669` - Main brand color
- **Secondary Green**: `#84cc16` - Accent color
- **Sky Blue**: `#0ea5e9` - Information and links
- **Earth Tones**: Browns and tans for natural feel
- **Neutral Grays**: For text and backgrounds

### Typography
- **Font Family**: Inter (system font fallback)
- **Headings**: Bold, clean hierarchy
- **Body Text**: Readable, accessible contrast

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Intuitive sidebar and header

## 📱 Features Implemented

### ✅ Authentication
- **Login Page**: Professional design with eco-theme
- **Register Page**: Comprehensive form with validation
- **JWT Integration**: Secure token handling
- **Protected Routes**: Role-based access control

### ✅ Layout System
- **Header**: Search, notifications, user menu
- **Sidebar**: Navigation with eco stats
- **Responsive**: Mobile-first design
- **Dark Mode**: Toggle support (UI ready)

### ✅ Core Pages
- **Dashboard**: Overview with stats and recent trips
- **Vehicles**: Manage vehicles with eco ratings
- **Route Planning**: Plan eco-friendly routes
- **Trip History**: Track and analyze trips
- **Analytics**: Carbon footprint analysis (placeholder)

### ✅ Eco-Friendly Features
- **Carbon Tracking**: Visual CO₂ savings
- **Eco Ratings**: Star ratings for routes/vehicles
- **Green Icons**: Leaf and nature-themed icons
- **Environmental Stats**: Monthly/yearly tracking

## 🔧 API Integration

### Authentication Flow
```typescript
// Login
const { login } = useAuth();
await login(email, password);

// Register
const { register } = useAuth();
await register({ first_name, last_name, email, password });
```

### API Endpoints Used
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get user profile
- `GET /api/vehicles` - Get user vehicles
- `POST /api/routes/plan` - Plan routes
- `GET /api/trips` - Get trip history

## 🎯 User Experience

### Professional Design
- **Clean Interface**: Minimal, focused design
- **Consistent Branding**: Eco-friendly theme throughout
- **Intuitive Navigation**: Clear menu structure
- **Responsive Layout**: Works on all devices

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG compliant colors
- **Focus States**: Clear focus indicators

### Performance
- **Fast Loading**: Optimized assets
- **Lazy Loading**: Components loaded on demand
- **Caching**: API response caching
- **Error Handling**: Graceful error states

## 🛠️ Development Tools

### Tech Stack
- **React 18**: Latest React features
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **React Query**: Data fetching
- **React Hook Form**: Form handling
- **Lucide React**: Beautiful icons

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🌍 Eco-Friendly Theme

### Visual Elements
- **Leaf Icons**: Nature-inspired iconography
- **Green Gradients**: Earth-friendly color schemes
- **Natural Patterns**: Subtle leaf backgrounds
- **Environmental Stats**: Prominent CO₂ tracking

### Messaging
- **Positive Reinforcement**: Celebrate eco-friendly choices
- **Educational**: Tips and suggestions
- **Community**: Join others making a difference
- **Impact**: Show environmental benefits

## 📊 Dashboard Features

### Overview Stats
- Total CO₂ saved
- Eco-friendly trips
- Fuel saved
- Money saved

### Recent Activity
- Latest trips with eco ratings
- Route suggestions
- Achievement progress

### Quick Actions
- Plan new route
- Add vehicle
- View analytics
- Check history

## 🔐 Security Features

### Authentication
- JWT token management
- Automatic token refresh
- Secure logout
- Protected routes

### Data Protection
- Input validation
- XSS prevention
- CSRF protection
- Secure API calls

## 🚀 Production Deployment

### Build Optimization
```bash
npm run build
```

### Environment Variables
Set production environment variables:
- `VITE_API_URL` - Production API URL
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `VITE_NODE_ENV=production`

### Deployment Options
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **Azure Static Web Apps**: Microsoft cloud
- **AWS S3 + CloudFront**: Scalable hosting

## 🎨 Customization

### Theme Colors
Update `tailwind.config.js` to customize colors:
```javascript
colors: {
  primary: {
    green: {
      500: '#059669', // Your custom green
      600: '#047857', // Darker shade
    }
  }
}
```

### Branding
- Update logo in `Header.tsx`
- Modify app name in `.env`
- Customize colors in CSS variables

## 📱 Mobile Support

### Responsive Design
- Mobile-first approach
- Touch-friendly buttons
- Swipe gestures
- Optimized layouts

### Progressive Web App
- Service worker ready
- Offline capabilities
- App-like experience
- Install prompts

## 🔄 State Management

### Context API
- Authentication state
- User preferences
- Theme settings

### React Query
- Server state caching
- Background updates
- Error handling
- Loading states

## 🧪 Testing

### Test Setup (Ready for implementation)
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### Test Files Structure
- `__tests__/` - Test files
- `components/` - Component tests
- `pages/` - Page tests
- `utils/` - Utility tests

## 📈 Analytics Integration

### Google Analytics
```javascript
// Ready for GA4 integration
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Custom Events
- User registrations
- Route planning
- Eco-friendly choices
- Carbon savings

## 🌟 Future Enhancements

### Planned Features
- Real-time notifications
- Social sharing
- Community challenges
- Advanced analytics
- Mobile app (React Native)

### Integration Opportunities
- Weather API for eco suggestions
- Public transport APIs
- Car sharing services
- Carbon offset programs

---

## 🆘 Support

### Common Issues
1. **API Connection**: Check `VITE_API_URL` in `.env`
2. **Google Maps**: Verify API key and billing
3. **Build Errors**: Run `npm install` and check dependencies
4. **TypeScript Errors**: Run `npm run type-check`

### Getting Help
- Check browser console for errors
- Verify API server is running
- Ensure all environment variables are set
- Review network requests in dev tools

Your eco-friendly route planner is ready to help users make sustainable transportation choices! 🌱
