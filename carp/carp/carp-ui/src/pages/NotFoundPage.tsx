import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Avatar,
} from '@mui/material';
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: 'primary.main',
              mx: 'auto',
              mb: 4,
              fontSize: '3rem',
            }}
          >
            🌱
          </Avatar>
          
          <Typography
            variant="h1"
            sx={{
              fontSize: '6rem',
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2,
            }}
          >
            404
          </Typography>
          
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              mb: 2,
            }}
          >
            Oops! Page Not Found
          </Typography>
          
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 400,
              mx: 'auto',
            }}
          >
            The page you're looking for seems to have taken an eco-friendly detour. 
            Let's get you back on track to your sustainable journey!
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/dashboard"
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              sx={{
                px: 4,
                py: 1.5,
              }}
            >
              Go to Dashboard
            </Button>
            
            <Button
              component={Link}
              to="/"
              variant="outlined"
              size="large"
              startIcon={<ArrowBackIcon />}
              sx={{
                px: 4,
                py: 1.5,
              }}
            >
              Back to Home
            </Button>
          </Box>
          
          <Box
            sx={{
              mt: 6,
              p: 3,
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              💡 <strong>Eco Tip:</strong> While you're here, why not plan a new eco-friendly route?
              Every journey counts towards a greener future!
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFoundPage;