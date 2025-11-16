import React, { useState } from 'react';
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
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Nature as EcoIcon,
  AttachMoney as MoneyIcon,
  BarChart as BarChartIcon,
  Groups as GroupsIcon,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created successfully! Welcome aboard! 🌱');
      navigate('/vehicles');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { text: 'At least 6 characters', met: password && password.length >= 6 },
    { text: 'Contains a number', met: password && /\d/.test(password) },
    { text: 'Contains uppercase letter', met: password && /[A-Z]/.test(password) },
    { text: 'Contains lowercase letter', met: password && /[a-z]/.test(password) },
  ];

  const benefits = [
    {
      icon: <EcoIcon sx={{ color: theme.palette.primary.main }} />,
      title: 'Reduce Carbon Footprint',
      description: 'Track and minimize your environmental impact'
    },
    {
      icon: <MoneyIcon sx={{ color: theme.palette.primary.main }} />,
      title: 'Save Money',
      description: 'Find fuel-efficient routes and eco-friendly alternatives'
    },
    {
      icon: <BarChartIcon sx={{ color: theme.palette.primary.main }} />,
      title: 'Detailed Analytics',
      description: 'Monitor your progress with comprehensive reports'
    },
    {
      icon: <GroupsIcon sx={{ color: theme.palette.primary.main }} />,
      title: 'Join Community',
      description: 'Connect with like-minded eco-conscious travelers'
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
          {/* Left Side - Benefits */}
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
                    Join the Green Revolution
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Start your eco-friendly journey today
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {benefits.map((benefit, index) => (
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
                        <Box sx={{ mt: 0.5 }}>{benefit.icon}</Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {benefit.title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {benefit.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Grid>
          )}

          {/* Right Side - Registration Form */}
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
                    Create Account
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Join thousands of eco-conscious travelers
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
                  {/* Name Fields */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        {...register('firstName', {
                          required: 'First name is required',
                          minLength: {
                            value: 2,
                            message: 'First name must be at least 2 characters'
                          }
                        })}
                        fullWidth
                        label="First Name"
                        margin="normal"
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message || ''}
                        autoComplete="given-name"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        {...register('lastName', {
                          required: 'Last name is required',
                          minLength: {
                            value: 2,
                            message: 'Last name must be at least 2 characters'
                          }
                        })}
                        fullWidth
                        label="Last Name"
                        margin="normal"
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message || ''}
                        autoComplete="family-name"
                      />
                    </Grid>
                  </Grid>

                  {/* Email Field */}
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
                    helperText={errors.email?.message || ''}
                    autoComplete="email"
                  />

                  {/* Password Field */}
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
                    helperText={errors.password?.message || ''}
                    autoComplete="new-password"
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

                  {/* Password Requirements */}
                  {password && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Password requirements:
                      </Typography>
                      {passwordRequirements.map((requirement, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          {requirement.met ? (
                            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <Cancel sx={{ fontSize: 16, color: 'grey.400' }} />
                          )}
                          <Typography
                            variant="caption"
                            sx={{ color: requirement.met ? 'success.main' : 'text.disabled' }}
                          >
                            {requirement.text}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Confirm Password Field */}
                  <TextField
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match'
                    })}
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    margin="normal"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message || ''}
                    autoComplete="new-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Terms and Conditions */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('agreeToTerms', {
                          required: 'You must agree to the terms and conditions'
                        })}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        I agree to the{' '}
                        <Link to="/terms" style={{ color: theme.palette.primary.main }}>
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" style={{ color: theme.palette.primary.main }}>
                          Privacy Policy
                        </Link>
                      </Typography>
                    }
                    sx={{ mt: 2 }}
                  />
                  {errors.agreeToTerms && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {errors.agreeToTerms?.message || ''}
                    </Alert>
                  )}

                  {/* Submit Button */}
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
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?
                    </Typography>
                  </Divider>

                  <Button
                    component={Link}
                    to="/login"
                    fullWidth
                    variant="outlined"
                    sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600 }}
                  >
                    Sign In Instead
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default RegisterPage;
