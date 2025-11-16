# 🌱 Carbon-Aware Route Planner - MUI Setup Guide

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

## 🎨 Material-UI Design System

### Custom Eco-Friendly Theme
- **Primary Green**: `#059669` - Main brand color
- **Secondary Green**: `#84cc16` - Accent color
- **Sky Blue**: `#0ea5e9` - Information and links
- **Earth Tones**: Browns and tans for natural feel
- **Typography**: Inter font with proper hierarchy

### Component Customization
- **Buttons**: Gradient backgrounds with hover effects
- **Cards**: Rounded corners with subtle shadows
- **Forms**: Clean inputs with focus states
- **Navigation**: Intuitive sidebar and header
- **Responsive**: Mobile-first breakpoints

## 📱 Features Implemented

### ✅ Authentication
- **Login Page**: Professional MUI design with eco-theme
- **Register Page**: Comprehensive form with validation
- **JWT Integration**: Secure token handling
- **Protected Routes**: Role-based access control

### ✅ Layout System
- **Header**: Search bar, notifications, user menu with MUI AppBar
- **Sidebar**: Navigation with eco stats using MUI Drawer
- **Responsive**: Mobile-first design with MUI breakpoints
- **Theme Provider**: Custom eco-friendly MUI theme

### ✅ Core Pages
- **Dashboard**: Overview with MUI Cards and stats
- **Vehicles**: Manage vehicles with MUI DataGrid (ready)
- **Route Planning**: Plan eco-friendly routes
- **Trip History**: Track and analyze trips
- **Analytics**: Carbon footprint analysis (placeholder)

### ✅ Eco-Friendly Features
- **Carbon Tracking**: Visual CO₂ savings throughout the app
- **Eco Ratings**: Star ratings for routes/vehicles
- **Environmental Stats**: Monthly/yearly carbon footprint tracking
- **Green Messaging**: Positive reinforcement for eco choices
- **Nature Icons**: Material-UI icons with eco theme

## 🔧 Technical Implementation

### MUI Components Used
- **Layout**: AppBar, Drawer, Container, Box, Grid
- **Navigation**: List, ListItem, ListItemButton, ListItemIcon
- **Forms**: TextField, Button, Checkbox, FormControlLabel
- **Data Display**: Card, Typography, Avatar, Chip, Divider
- **Feedback**: CircularProgress, Alert, Snackbar
- **Icons**: Material-UI icons with eco theme

### Responsive Design
```typescript
// Breakpoints
xs: 0px      // Mobile phones
sm: 600px    // Tablets
md: 900px    // Small laptops
lg: 1200px   // Desktops
xl: 1536px   // Large screens
```

### Theme Customization
```typescript
// Custom eco colors
const ecoColors = {
  primary: { main: '#059669', light: '#10b981', dark: '#047857' },
  secondary: { main: '#84cc16', light: '#a3e635', dark: '#65a30d' },
  sky: { main: '#0ea5e9', light: '#38bdf8', dark: '#0284c7' },
  earth: { main: '#92400e', light: '#fbbf24', dark: '#78350f' }
};
```

## 🎯 Component Examples

### Custom Button Styles
```typescript
<Button
  variant="contained"
  sx={{
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
    },
  }}
>
  Eco Action
</Button>
```

### Responsive Grid
```typescript
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Mobile: full, Tablet: half, Desktop: third</Card>
  </Grid>
</Grid>
```

### Eco Stats Card
```typescript
<Card
  sx={{
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    color: 'white',
  }}
>
  <CardContent>
    <Typography variant="h4">2.4 kg</Typography>
    <Typography variant="body2">CO₂ Saved</Typography>
  </CardContent>
</Card>
```

## 🚀 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 📦 MUI Dependencies

### Core MUI Packages
```json
{
  "@mui/material": "^5.15.0",
  "@mui/icons-material": "^5.15.0",
  "@emotion/react": "^11.11.1",
  "@emotion/styled": "^11.11.0"
}
```

### Additional MUI Packages
```json
{
  "@mui/x-date-pickers": "^6.18.1",
  "@mui/lab": "^5.0.0-alpha.155"
}
```

## 🎨 Styling Approach

### 1. Theme-Based Styling
```typescript
// Use theme values
sx={{ color: 'primary.main', backgroundColor: 'background.paper' }}
```

### 2. Responsive Design
```typescript
// Mobile-first responsive
sx={{
  display: { xs: 'block', md: 'flex' },
  flexDirection: { xs: 'column', md: 'row' }
}}
```

### 3. Custom Components
```typescript
// Styled components with theme
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
}));
```

## 🌍 Eco-Friendly Features

### Visual Elements
- **Leaf Icons**: Nature-inspired Material-UI iconography
- **Green Gradients**: Earth-friendly color schemes
- **Natural Patterns**: Subtle leaf backgrounds
- **Environmental Stats**: Prominent CO₂ tracking with MUI Cards

### Interactive Components
- **Eco Rating Stars**: Custom star rating component
- **Carbon Meters**: Visual progress indicators
- **Environmental Badges**: Chip components with eco colors
- **Gradient Buttons**: Eco-themed action buttons

## 📱 Mobile-First Responsive Design

### Breakpoint Usage
```typescript
// Hide on mobile, show on desktop
sx={{ display: { xs: 'none', md: 'block' } }}

// Stack on mobile, row on desktop
sx={{ flexDirection: { xs: 'column', md: 'row' } }}

// Full width on mobile, auto on desktop
sx={{ width: { xs: '100%', md: 'auto' } }}
```

### Mobile Navigation
- **Temporary Drawer**: Mobile sidebar with overlay
- **Collapsible Menu**: Responsive navigation items
- **Touch-Friendly**: Proper touch targets (44px minimum)
- **Swipe Gestures**: Ready for gesture integration

## 🔐 Security & Accessibility

### MUI Accessibility Features
- **ARIA Labels**: Built-in accessibility support
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus indicators
- **Screen Reader**: Semantic HTML structure

### Security Implementation
- **Input Validation**: MUI form validation
- **XSS Prevention**: Safe HTML rendering
- **CSRF Protection**: Secure API calls
- **Token Management**: Secure JWT handling

## 🚀 Production Deployment

### Build Optimization
```bash
npm run build
```

### Environment Variables
```bash
# Production environment
VITE_API_URL=https://your-api-domain.com/api
VITE_GOOGLE_MAPS_API_KEY=your-production-key
VITE_NODE_ENV=production
```

### Deployment Options
- **Vercel**: Zero-config deployment with MUI
- **Netlify**: Static site hosting
- **Azure Static Web Apps**: Microsoft cloud
- **AWS S3 + CloudFront**: Scalable hosting

## 🎨 Customization Guide

### Theme Colors
```typescript
// Update theme colors
const customTheme = createTheme({
  palette: {
    primary: { main: '#your-green' },
    secondary: { main: '#your-accent' },
  },
});
```

### Component Variants
```typescript
// Create custom component variants
const EcoButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  borderRadius: 12,
  padding: '12px 24px',
}));
```

## 📊 Performance Optimization

### MUI Performance Features
- **Code Splitting**: Automatic component lazy loading
- **Tree Shaking**: Unused code elimination
- **Bundle Optimization**: Efficient bundling
- **CSS-in-JS**: Optimized styling

### Best Practices
- **Memoization**: React.memo for expensive components
- **Virtualization**: For large lists (DataGrid)
- **Image Optimization**: Lazy loading and compression
- **Bundle Analysis**: Monitor bundle size

## 🧪 Testing with MUI

### Testing Setup (Ready for implementation)
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @mui/testing-library
```

### MUI Testing Utilities
```typescript
import { render, screen } from '@mui/testing-library';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};
```

## 🌟 Future Enhancements

### Planned MUI Features
- **DataGrid**: Advanced data tables
- **Charts**: Integration with Recharts
- **Date Pickers**: Advanced date selection
- **Stepper**: Multi-step forms
- **Tabs**: Organized content sections

### Advanced Components
- **Virtual Scrolling**: For large datasets
- **Drag & Drop**: Interactive interfaces
- **Rich Text Editor**: Content creation
- **File Upload**: Document handling

---

## 🆘 Support & Troubleshooting

### Common Issues
1. **Theme Not Applied**: Check ThemeProvider wrapper
2. **Responsive Issues**: Verify breakpoint usage
3. **Build Errors**: Ensure all MUI dependencies installed
4. **TypeScript Errors**: Check MUI type definitions

### Getting Help
- Check MUI documentation: https://mui.com/
- Review theme customization guide
- Verify responsive breakpoint usage
- Check console for component warnings

Your eco-friendly route planner is now powered by Material-UI with professional design and excellent mobile responsiveness! 🌱✨
