import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Divider,
  Grid,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Nature as EcoIcon,
  DirectionsCar as CarIcon,
  ElectricBolt as BoltIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <EcoIcon sx={{ color: theme.palette.primary.main }} />,
      title: "Carbon Tracking",
      description: "Monitor your carbon footprint with every trip"
    },
    {
      icon: <CarIcon sx={{ color: theme.palette.primary.main }} />,
      title: "Smart Routes",
      description: "Find the most eco-friendly routes available"
    },
    {
      icon: <BoltIcon sx={{ color: theme.palette.primary.main }} />,
      title: "Eco Suggestions",
      description: "Get recommendations for greener alternatives"
    },
    {
      icon: <GroupsIcon sx={{ color: theme.palette.primary.main }} />,
      title: "Community Impact",
      description: "Join thousands making a difference together"
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.info.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Features */}
          {!isMobile && (
            <Grid item lg={6}>
              <Box sx={{ color: 'white', pr: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      mb: 3,
                      mx: 'auto',
                    }}
                  >
                    🌱
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Carbon-Aware Route Planner
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Make every journey count for our planet
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {features.map((feature, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ mt: 0.5 }}>{feature.icon}</Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Grid>
          )}

          {/* Right Side - Login Form */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper
                elevation={8}
                sx={{
                  p: 6,
                  borderRadius: 3,
                  width: '100%',
                  maxWidth: 480,
                  backgroundColor: 'background.paper',
                }}
              >
                {/* Mobile Logo */}
                {isMobile && (
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        mb: 2,
                        mx: 'auto',
                      }}
                    >
                      🌱
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Carbon-Aware Route Planner
                    </Typography>
                  </Box>
                )}

                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Sign in to continue your eco-friendly journey
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
                  <TextField
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    fullWidth
                    label="Email Address"
                    type="email"
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    autoComplete="email"
                    autoFocus
                  />

                  <TextField
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    margin="normal"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 2 }}>
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Remember me"
                    />
                    <Link
                      to="/forgot-password"
                      style={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Don&apos;t have an account?
                    </Typography>
                  </Divider>

                  <Button
                    component={Link}
                    to="/register"
                    fullWidth
                    variant="outlined"
                    sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600 }}
                  >
                    Create Account
                  </Button>
                </Box>

                {/* Demo Account Info */}
                <Paper
                  sx={{
                    mt: 3,
                    p: 2,
                    backgroundColor: 'grey.50',
                    border: 1,
                    borderColor: 'grey.200',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    <strong>Demo Account:</strong> demo@example.com / demo123
                  </Typography>
                </Paper>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    By signing in, you agree to our{' '}
                    <Link to="/terms" style={{ color: theme.palette.primary.main }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" style={{ color: theme.palette.primary.main }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginPage;