import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Nature as EcoIcon,
  DirectionsCar as CarIcon,
  Route as RouteIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <EcoIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Carbon Tracking',
      description: 'Monitor your carbon footprint with every trip and see your environmental impact in real-time.',
    },
    {
      icon: <RouteIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Smart Routes',
      description: 'Find the most eco-friendly routes available using advanced algorithms and real-time data.',
    },
    {
      icon: <CarIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Vehicle Management',
      description: 'Track multiple vehicles and their environmental performance with detailed analytics.',
    },
    {
      icon: <BarChartIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: 'Analytics & Insights',
      description: 'Get detailed insights into your travel patterns and environmental impact over time.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              mx: 'auto',
              mb: 3,
            }}
          >
            🌱
          </Avatar>
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
            Carbon-Aware Route Planner
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Make every journey count for our planet
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Plan eco-friendly routes, track your carbon footprint, and contribute to a sustainable future.
            Join thousands of environmentally conscious travelers making a difference.
          </Typography>
          {isAuthenticated ? (
            <Button
              component={Link}
              to="/dashboard"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
                px: 4,
                py: 1.5,
              }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                Get Started
              </Button>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                Sign In
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
            Why Choose Carbon-Aware Route Planner?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Our platform combines cutting-edge technology with environmental consciousness to help you make smarter travel decisions.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box
        sx={{
          backgroundColor: 'grey.50',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
            Ready to Start Your Eco-Friendly Journey?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Join our community of environmentally conscious travelers and start making a positive impact today.
          </Typography>
          {!isAuthenticated && (
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
              }}
            >
              Create Your Account
            </Button>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;