import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  LinearProgress,
  Paper,
  useMediaQuery,
} from '@mui/material';
import {
  Nature as EcoIcon,
  DirectionsCar as CarIcon,
  Route as RouteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  ElectricBolt as BoltIcon,
  AttachMoney as MoneyIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useQueryClient } from 'react-query';
import { analyticsAPI, routesAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Map from '../components/Map/Map';

const DashboardPage = () => {
  const isMobile = useMediaQuery('(max-width:959px)');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch trip history to calculate actual stats
  const { data: tripHistoryData } = useQuery(
    'tripHistory',
    () => routesAPI.getRouteHistory({ limit: 1000 }),
    {
      retry: 1,
      refetchOnWindowFocus: true,
    }
  );

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'userDashboard',
    () => analyticsAPI.getDashboard(),
    {
      retry: 1,
      refetchOnWindowFocus: true,
    }
  );

  // Fetch carbon savings data
  const { data: savingsData } = useQuery(
    'carbonSavings',
    () => analyticsAPI.getCarbonSavings(),
    {
      retry: 1,
      refetchOnWindowFocus: true,
    }
  );

  // Get all trips from trip history
  const allTrips = tripHistoryData?.data?.trips || tripHistoryData?.data?.data?.trips || [];

  // Calculate "This Month" stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthTrips = allTrips.filter((trip) => {
    const tripDate = new Date(trip.created_at);
    return tripDate >= startOfMonth;
  });

  const thisMonthStats = {
    total_trips: thisMonthTrips.length,
    total_distance: thisMonthTrips.reduce((sum, trip) => sum + (trip.distance_km || 0), 0),
    total_co2: thisMonthTrips.reduce((sum, trip) => sum + (trip.co2_emissions_kg || 0), 0),
    eco_trips: thisMonthTrips.filter((trip) => 
      ['walking', 'cycling', 'transit'].includes(trip.travel_mode?.toLowerCase())
    ).length,
    co2_saved: thisMonthTrips
      .filter((trip) => ['walking', 'cycling', 'transit'].includes(trip.travel_mode?.toLowerCase()))
      .reduce((sum, trip) => {
        // Estimate CO2 savings compared to driving (120g CO2/km)
        const drivingEmissions = (trip.distance_km || 0) * 0.12;
        return sum + (drivingEmissions / 1000); // Convert to kg
      }, 0),
  };

  // Process dashboard data
  const rawStats = dashboardData?.data?.dashboard?.stats || dashboardData?.data?.data?.dashboard?.stats || {};
  const travelModeDistribution = dashboardData?.data?.dashboard?.travel_mode_distribution || dashboardData?.data?.data?.dashboard?.travel_mode_distribution || [];
  const rawRecentTrips = dashboardData?.data?.dashboard?.recent_trips || dashboardData?.data?.data?.dashboard?.recent_trips || [];

  // Use actual trip data if available
  const stats = {
    total_trips: rawStats.total_trips || allTrips.length || 0,
    total_distance_km: rawStats.total_distance || allTrips.reduce((sum, trip) => sum + (trip.distance_km || 0), 0),
    total_co2_emitted_kg: rawStats.total_co2 || allTrips.reduce((sum, trip) => sum + (trip.co2_emissions_kg || 0), 0),
    total_co2_saved_kg: savingsData?.data?.total_co2_saved_kg || savingsData?.data?.data?.total_co2_saved_kg || thisMonthStats.co2_saved,
    average_co2_per_trip_kg: allTrips.length > 0 
      ? allTrips.reduce((sum, trip) => sum + (trip.co2_emissions_kg || 0), 0) / allTrips.length
      : rawStats.avg_co2_per_trip || 0,
    trips_by_mode: travelModeDistribution.reduce((acc, item) => {
      acc[item.travel_mode] = parseInt(item.count);
      return acc;
    }, {}),
  };

  // Calculate trips by mode from actual data if not available
  if (Object.keys(stats.trips_by_mode).length === 0) {
    allTrips.forEach((trip) => {
      const mode = trip.travel_mode || 'unknown';
      stats.trips_by_mode[mode] = (stats.trips_by_mode[mode] || 0) + 1;
    });
  }

  // Use actual trip history if available, otherwise use dashboard data
  const recentTrips = (allTrips.length > 0 ? allTrips : rawRecentTrips).slice(0, 5).map((trip) => ({
    id: trip.id,
    from_location: trip.origin_name || trip.from || 'Unknown',
    to_location: trip.destination_name || trip.to || 'Unknown',
    distance_km: trip.distance_km || 0,
    co2_emissions_kg: trip.co2_emissions_kg || 0,
    travel_mode: trip.travel_mode || 'Unknown',
    created_at: trip.created_at || new Date().toISOString(),
    eco_rating: trip.travel_mode === 'walking' || trip.travel_mode === 'cycling' ? 5 :
                trip.travel_mode === 'transit' ? 4 : 
                (trip.co2_emissions_kg || 0) < 1 ? 4 : 2,
    origin_lat: trip.origin_lat,
    origin_lng: trip.origin_lng,
    destination_lat: trip.destination_lat,
    destination_lng: trip.destination_lng,
  }));

  // Calculate achievements dynamically based on real data
  const ecoFriendlyTripsFromData = allTrips.filter((trip) => 
    ['walking', 'cycling', 'transit'].includes(trip.travel_mode?.toLowerCase())
  ).length;
  const ecoFriendlyTrips = allTrips.length > 0
    ? ecoFriendlyTripsFromData
    : (stats.trips_by_mode?.walking || 0) + 
      (stats.trips_by_mode?.cycling || 0) + 
      (stats.trips_by_mode?.transit || 0);
  const greenPioneerProgress = Math.min(100, Math.round((ecoFriendlyTrips / 50) * 100));
  
  const carbonWarriorProgress = Math.min(100, Math.round((stats.total_co2_saved_kg / 20) * 100));
  
  const uniqueModes = Object.keys(stats.trips_by_mode || {}).filter(mode => 
    (stats.trips_by_mode[mode] || 0) > 0
  ).length;
  const ecoExplorerProgress = Math.min(100, Math.round((uniqueModes / 5) * 100));

  const achievements = [
    {
      title: 'Green Pioneer',
      description: `Completed ${ecoFriendlyTrips} of 50 eco-friendly trips`,
      progress: greenPioneerProgress,
      icon: EcoIcon,
      color: '#10b981',
    },
    {
      title: 'Carbon Warrior',
      description: `Saved ${stats.total_co2_saved_kg.toFixed(1)}kg of 20kg CO₂`,
      progress: carbonWarriorProgress,
      icon: BoltIcon,
      color: '#1976d2',
    },
    {
      title: 'Eco Explorer',
      description: `Tried ${uniqueModes} of 5 different transport modes`,
      progress: ecoExplorerProgress,
      icon: RouteIcon,
      color: '#f59e0b',
    },
  ];

  const quickActions = [
    {
      title: 'Plan Route',
      description: 'Find eco-friendly routes',
      icon: RouteIcon,
      href: '/routes',
      color: '#1976d2',
    },
    {
      title: 'Add Vehicle',
      description: 'Register a new vehicle',
      icon: CarIcon,
      href: '/vehicles',
      color: '#3b82f6',
    },
    {
      title: 'View Analytics',
      description: 'Check your progress',
      icon: BarChartIcon,
      href: '/analytics',
      color: '#f59e0b',
    },
    {
      title: 'Trip History',
      description: 'Review past journeys',
      icon: CalendarIcon,
      href: '/trips',
      color: '#8b5cf6',
    },
  ];

  const getEcoRatingStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        sx={{
          fontSize: 16,
          color: i < rating ? '#1976d2' : '#e0e0e0',
        }}
      />
    ));
  };

  const StatCard = ({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    color
  }) => {
    // Only show change indicator if there's actual data
    const hasData = parseFloat(value) > 0 || value.includes('trips') && parseInt(value) > 0;
    
    return (
      <Card
        sx={{
          height: '100%',
          borderLeft: 4,
          borderLeftColor: color,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3,
          },
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: color,
                color: 'white',
                width: 48,
                height: 48,
              }}
            >
              <Icon />
            </Avatar>
            {hasData && change && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {changeType === 'positive' ? (
                  <TrendingUpIcon sx={{ color: '#10b981', fontSize: 20 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: changeType === 'positive' ? '#10b981' : '#ef4444',
                    fontWeight: 600,
                  }}
                >
                  {change}
                </Typography>
              </Box>
            )}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  if (dashboardLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      {/* Welcome Section */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Welcome back, {user?.first_name || 'User'}! 🌱
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {stats.total_co2_saved_kg > 0 
                ? `You've saved ${stats.total_co2_saved_kg.toFixed(1)} kg of CO₂. Keep up the great work!`
                : stats.total_trips > 0
                ? `You have ${stats.total_trips} trip${stats.total_trips !== 1 ? 's' : ''} recorded. Start planning eco-friendly routes!`
                : 'Start planning your first eco-friendly route to reduce your carbon footprint!'
              }
            </Typography>
          </Grid>
          {!isMobile && (
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {ecoFriendlyTrips}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Eco Trips
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* This Month Stats */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
            This Month
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {thisMonthStats.co2_saved.toFixed(1)} kg
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  CO₂ Saved
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {thisMonthStats.total_trips}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Total Trips
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {thisMonthStats.eco_trips}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Eco-friendly Trips
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total CO₂ Saved"
            value={`${stats.total_co2_saved_kg.toFixed(1)} kg`}
            change={stats.total_co2_saved_kg > 0 ? `${stats.total_co2_saved_kg.toFixed(1)} kg` : "0 kg"}
            changeType={stats.total_co2_saved_kg > 0 ? "positive" : "negative"}
            icon={EcoIcon}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Eco-Friendly Trips"
            value={`${ecoFriendlyTrips}`}
            change={ecoFriendlyTrips > 0 ? `${ecoFriendlyTrips} trips` : "0 trips"}
            changeType={ecoFriendlyTrips > 0 ? "positive" : "negative"}
            icon={RouteIcon}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Distance"
            value={`${stats.total_distance_km.toFixed(1)} km`}
            change={stats.total_distance_km > 0 ? `${stats.total_distance_km.toFixed(1)} km` : "0 km"}
            changeType={stats.total_distance_km > 0 ? "positive" : "negative"}
            icon={BoltIcon}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Trips"
            value={`${stats.total_trips}`}
            change={stats.total_trips > 0 ? `${stats.total_trips} trips` : "0 trips"}
            changeType={stats.total_trips > 0 ? "positive" : "negative"}
            icon={CalendarIcon}
            color="#3b82f6"
          />
        </Grid>
      </Grid>

      {/* Map Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Your Trip Locations
          </Typography>
          {recentTrips.length > 0 ? (
            <Map
              center={{
                lat: recentTrips[0].origin_lat || 40.7128,
                lng: recentTrips[0].origin_lng || -74.0060
              }}
              zoom={recentTrips[0].distance_km && recentTrips[0].distance_km > 50 ? 8 : 10}
              markers={recentTrips.slice(0, 5).filter(trip => trip.origin_lat && trip.origin_lng).map(trip => ({
                lat: trip.origin_lat,
                lng: trip.origin_lng,
                popup: `Origin: ${trip.from_location}`
              })).concat(
                recentTrips.slice(0, 5).filter(trip => trip.destination_lat && trip.destination_lng).map(trip => ({
                  lat: trip.destination_lat,
                  lng: trip.destination_lng,
                  popup: `Destination: ${trip.to_location}`
                }))
              )}
            />
          ) : (
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'grey.100', borderRadius: 2 }}>
              <Typography variant="body1" color="text.secondary">
                No trips yet. Plan your first route to see it on the map!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Recent Trips */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Recent Trips
                </Typography>
                <Button component={Link} to="/trips" color="primary">
                  View All
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentTrips.length > 0 ? recentTrips.map((trip) => {
                  const tripDate = new Date(trip.created_at).toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  });
                  return (
                  <Paper
                    key={trip.id}
                    sx={{
                      p: 3,
                      border: 1,
                      borderColor: 'grey.200',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 1,
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Avatar
                            sx={{
                              bgcolor: '#1976d2',
                              width: 40,
                              height: 40,
                            }}
                          >
                            <LocationIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {trip.from_location} → {trip.to_location}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {tripDate}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {(trip.distance_km || 0).toFixed(1)} km
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EcoIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {(trip.co2_emissions_kg || 0).toFixed(2)} kg
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {trip.travel_mode}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                            {getEcoRatingStars(trip.eco_rating)}
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                  );
                }) : (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No trips yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Start planning your first eco-friendly route!
                    </Typography>
                    <Button component={Link} to="/routes" variant="contained">
                      Plan Your First Route
                    </Button>
                  </Paper>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                Achievements
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {achievements.map((achievement, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: achievement.color,
                  width: 40,
                  height: 40,
                }}
              >
                <achievement.icon />
              </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {achievement.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {achievement.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={achievement.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: achievement.color,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {achievement.progress}% complete
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Environmental Impact Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Environmental Impact
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, backgroundColor: 'success.main', color: 'white', textAlign: 'center' }}>
                <EcoIcon sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {Math.round(stats.total_co2_saved_kg * 0.5)}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Trees Planted Equivalent
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                  Your CO₂ savings = {Math.round(stats.total_co2_saved_kg * 0.5)} trees
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, backgroundColor: 'primary.main', color: 'white', textAlign: 'center' }}>
                <MoneyIcon sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ${Math.round(stats.total_co2_saved_kg * 2.5)}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Fuel Savings
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                  Estimated savings from eco-friendly choices
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, backgroundColor: 'info.main', color: 'white', textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.total_trips > 0 && ecoFriendlyTrips > 0 && (ecoFriendlyTrips / stats.total_trips) >= 0.7 ? 'A+' : 
                   stats.total_trips > 0 && ecoFriendlyTrips > 0 && (ecoFriendlyTrips / stats.total_trips) >= 0.5 ? 'A' :
                   stats.total_trips > 0 && ecoFriendlyTrips > 0 && (ecoFriendlyTrips / stats.total_trips) >= 0.3 ? 'B' : 'C'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Environmental Score
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                  {stats.total_trips > 0 && ecoFriendlyTrips > 0 && (ecoFriendlyTrips / stats.total_trips) >= 0.7 
                    ? 'Excellent! Keep it up!' 
                    : stats.total_trips > 0 && ecoFriendlyTrips > 0 && (ecoFriendlyTrips / stats.total_trips) >= 0.5
                    ? 'Great progress!'
                    : stats.total_trips > 0
                    ? 'Good start! Try more eco-friendly routes.'
                    : 'Start planning routes to improve your score!'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card
                component={Link}
                to={action.href}
                sx={{
                  textDecoration: 'none',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: action.color,
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <action.icon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage;
