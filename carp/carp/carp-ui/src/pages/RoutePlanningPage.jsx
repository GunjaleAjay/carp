import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Paper,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Route as RouteIcon,
  AccessTime as TimeIcon,
  Nature as EcoIcon,
  Star as StarIcon,
  Navigation as NavigationIcon,
  Share as ShareIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { routesAPI, vehiclesAPI } from '../services/api';
import toast from 'react-hot-toast';
import Map from '../components/Map/Map';

const RoutePlanningPage = () => {
  const queryClient = useQueryClient();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [travelMode, setTravelMode] = useState('driving');

  // Fetch vehicles for selection
  const { data: vehicles = [], isLoading: vehiclesLoading, error: vehiclesError } = useQuery(
    'vehicles',
    async () => {
      try {
        const response = await vehiclesAPI.getVehicles();
        // Handle different response structures
        const vehiclesData = response.data?.data?.vehicles || response.data?.vehicles || [];
        return Array.isArray(vehiclesData) ? vehiclesData : [];
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        return [];
      }
    },
    {
      retry: 1,
      refetchOnWindowFocus: true,
    }
  );

  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Save route mutation (defined early so it can be used in auto-save)
  const saveRouteMutation = useMutation(
    async (routeData) => {
      const response = await routesAPI.saveRoute(routeData);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate queries to refresh analytics and trips
        queryClient.invalidateQueries('tripHistory');
        queryClient.invalidateQueries('userDashboard');
        queryClient.invalidateQueries('emissionStats');
        queryClient.invalidateQueries('carbonSavings');
        queryClient.invalidateQueries('analyticsTrends');
        // Don't show toast for auto-save, only for manual save
      },
      onError: (error) => {
        const axiosError = error;
        // Only show error for manual saves, not auto-saves
        if (!error.isAutoSave) {
          toast.error(axiosError.response?.data?.error || 'Failed to save route');
        }
      },
    }
  );

  // Auto-save route function
  const autoSaveRoute = async (routeData) => {
    try {
      if (!routeData || !from || !to) {
        return;
      }

      // Prepare route data for saving
      const saveData = {
        origin_name: from,
        destination_name: to,
        origin_lat: routeData.origin_coords?.[1] ?? routeData.route_data?.geometry?.coordinates?.[0]?.[1] ?? 0,
        origin_lng: routeData.origin_coords?.[0] ?? routeData.route_data?.geometry?.coordinates?.[0]?.[0] ?? 0,
        destination_lat: routeData.destination_coords?.[1] ?? (routeData.route_data?.geometry?.coordinates?.length > 0 ? routeData.route_data.geometry.coordinates[routeData.route_data.geometry.coordinates.length - 1]?.[1] : 0),
        destination_lng: routeData.destination_coords?.[0] ?? (routeData.route_data?.geometry?.coordinates?.length > 0 ? routeData.route_data.geometry.coordinates[routeData.route_data.geometry.coordinates.length - 1]?.[0] : 0),
        route_data: routeData.route_data,
        vehicle_id: selectedVehicle || null,
        travel_mode: routeData.travel_mode || travelMode,
        distance_km: routeData.distance_km || 0,
        duration_minutes: routeData.duration_minutes || 0,
        co2_emissions_kg: routeData.co2_emissions_kg || 0,
      };

      // Save silently (auto-save)
      await saveRouteMutation.mutateAsync(saveData);
    } catch (error) {
      // Silently fail for auto-save - don't show error to user
      console.log('Auto-save route failed (non-critical):', error);
    }
  };

  const planRouteMutation = useMutation(
    async (params) => {
      try {
        const response = await routesAPI.planRoute(params);
        return response.data;
      } catch (error) {
        // If it's a timeout error, provide a more helpful message
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          throw new Error('Route planning is taking longer than expected. Please try again or check your internet connection.');
        }
        throw error;
      }
    },
    {
      onSuccess: (data) => {
        try {
          // Handle different response structures
          const routes = data?.data?.routes || data?.routes || [];
          
          if (!routes || routes.length === 0) {
            toast.error('No routes found. Please try different locations.');
            setRouteOptions([]);
            setSelectedRoute(null);
            return;
          }

          // Map backend response to frontend format
          // Group routes by travel mode to number alternatives
          const routesByMode = {};
          routes.forEach((route) => {
            if (!routesByMode[route.travel_mode]) {
              routesByMode[route.travel_mode] = [];
            }
            routesByMode[route.travel_mode].push(route);
          });

          // Map routes with proper numbering for alternatives
          const mappedRoutes = routes.map((route, index) => {
            const modeRoutes = routesByMode[route.travel_mode] || [];
            const routeIndex = modeRoutes.findIndex(r => 
              r.distance_km === route.distance_km && 
              r.duration_minutes === route.duration_minutes
            );
            const routeNumber = modeRoutes.length > 1 ? ` ${routeIndex + 1}` : '';
            
            // Extract instructions from route data
            let instructions = ['Route details not available'];
            if (route.route_data) {
              if (route.route_data.legs && route.route_data.legs[0] && route.route_data.legs[0].steps) {
                instructions = route.route_data.legs[0].steps.map((step) => 
                  step.instruction || step.instructions || step.html_instructions || step.name || 'Continue'
                );
              } else if (route.route_data.steps) {
                instructions = route.route_data.steps.map((step) => 
                  step.instruction || step.instructions || step.html_instructions || step.name || 'Continue'
                );
              }
            }
            
            return {
              id: index + 1,
              name: `${route.travel_mode ? route.travel_mode.charAt(0).toUpperCase() + route.travel_mode.slice(1) : 'Route'}${routeNumber}`,
              distance: `${(route.distance_km || 0).toFixed(1)} km`,
              duration: `${Math.floor((route.duration_minutes || 0) / 60)}h ${Math.floor((route.duration_minutes || 0) % 60)}m`,
              co2: `${(route.co2_emissions_kg || 0).toFixed(2)} kg`,
              ecoRating: Math.min(5, Math.max(1, Math.round((route.eco_score || 0) / 20))), // Convert 0-100 scale to 1-5 stars
              description: `${route.travel_mode || 'route'}${routeNumber} with ${(route.co2_emissions_kg || 0).toFixed(1)} kg CO₂ emissions`,
              instructions: instructions,
              highlights: [
                route.travel_mode === 'walking' || route.travel_mode === 'cycling' ? 'Zero emissions' : 'Eco-friendly option',
                (route.eco_score || 0) > 80 ? 'Highly recommended' : 'Good choice',
                (route.co2_emissions_kg || 0) < 1 ? 'Very low carbon footprint' : 'Moderate emissions',
                modeRoutes.length > 1 && routeIndex === 0 ? 'Fastest route' : null,
                modeRoutes.length > 1 && routeIndex > 0 ? 'Alternative route' : null
              ].filter(Boolean),
              mode: route.travel_mode || 'driving',
              rawData: route // Keep original data for map display
            };
          });

          setRouteOptions(mappedRoutes);
          if (mappedRoutes.length > 0) {
            const bestRoute = mappedRoutes[0].rawData;
            setSelectedRoute(bestRoute); // Select first route by default
            
            // Auto-save the best route (first route with highest eco score)
            // Use setTimeout to avoid blocking the UI update
            setTimeout(() => {
              autoSaveRoute(bestRoute);
            }, 500);
          }
          toast.success(`Found ${mappedRoutes.length} route option${mappedRoutes.length > 1 ? 's' : ''}!`);
        } catch (error) {
          console.error('Error processing route data:', error);
          toast.error('Error processing route data. Please try again.');
          setRouteOptions([]);
          setSelectedRoute(null);
        }
      },
      onError: (error) => {
        const axiosError = error;
        const status = axiosError.response?.status;
        
        // Don't show error for rate limit (429) - user can retry
        if (status === 429) {
          console.warn('Rate limit reached. Please wait a moment before retrying.');
          return;
        }
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          toast.error('Route planning is taking longer than expected. Please try again.');
          setRouteOptions([]);
          setSelectedRoute(null);
          return;
        }
        
        // Handle network errors
        if (!axiosError.response) {
          toast.error('Network error. Please check your connection and try again.');
          setRouteOptions([]);
          setSelectedRoute(null);
          return;
        }
        
        // Handle other errors
        const errorMessage = axiosError.response?.data?.error || 
                           axiosError.response?.data?.message || 
                           'Failed to plan route. Please check your locations and try again.';
        toast.error(errorMessage);
        setRouteOptions([]);
        setSelectedRoute(null);
      },
    }
  );

  const handlePlanRoute = () => {
    if (!from || !to) {
      toast.error('Please enter both origin and destination');
      return;
    }

    planRouteMutation.mutate({
      origin: from,
      destination: to,
      vehicle_id: selectedVehicle,
      travel_mode: travelMode,
    });
  };

  const getEcoRatingStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={`star-${i}`}
        sx={{
          fontSize: 16,
          color: i < rating ? '#1976d2' : '#f5f5f5',
        }}
      />
    ));
  };


  // Handle viewing route on map
  const handleViewOnMap = (route) => {
    setSelectedRoute(route.rawData);
    // Scroll to map section
    setTimeout(() => {
      const mapElement = document.getElementById('route-map-section');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle sharing route
  const handleShareRoute = (route) => {
    const routeText = `Route: ${from} to ${to}\nDistance: ${route.distance}\nDuration: ${route.duration}\nCO₂: ${route.co2}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Route',
        text: routeText,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(routeText);
        toast.success('Route copied to clipboard!');
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(routeText);
      toast.success('Route copied to clipboard!');
    }
  };

  // Handle using/saving route (manual save)
  const handleUseRoute = (route) => {
    if (!route.rawData) {
      toast.error('Route data not available');
      return;
    }

    const routeData = route.rawData;
    
    // Prepare route data for saving
    const saveData = {
      origin_name: from,
      destination_name: to,
      origin_lat: routeData.origin_coords?.[1] ?? routeData.route_data?.geometry?.coordinates?.[0]?.[1] ?? 0,
      origin_lng: routeData.origin_coords?.[0] ?? routeData.route_data?.geometry?.coordinates?.[0]?.[0] ?? 0,
      destination_lat: routeData.destination_coords?.[1] ?? (routeData.route_data?.geometry?.coordinates?.length > 0 ? routeData.route_data.geometry.coordinates[routeData.route_data.geometry.coordinates.length - 1]?.[1] : 0),
      destination_lng: routeData.destination_coords?.[0] ?? (routeData.route_data?.geometry?.coordinates?.length > 0 ? routeData.route_data.geometry.coordinates[routeData.route_data.geometry.coordinates.length - 1]?.[0] : 0),
      route_data: routeData.route_data,
      vehicle_id: selectedVehicle || null,
      travel_mode: routeData.travel_mode || travelMode,
      distance_km: routeData.distance_km,
      duration_minutes: routeData.duration_minutes,
      co2_emissions_kg: routeData.co2_emissions_kg,
    };

    saveRouteMutation.mutate(saveData, {
      onSuccess: () => {
        toast.success('Route saved successfully!');
      },
      onError: (error) => {
        const axiosError = error;
        toast.error(axiosError.response?.data?.error || 'Failed to save route');
      },
    });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Route Planning
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Plan eco-friendly routes and reduce your carbon footprint
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Route Planning Form */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: 'fit-content', position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Plan Your Route
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* From Location */}
                <TextField
                  fullWidth
                  label="From"
                  placeholder="Enter starting location"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />

                {/* To Location */}
                <TextField
                  fullWidth
                  label="To"
                  placeholder="Enter destination"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />

                {/* Vehicle Selection */}
                <FormControl fullWidth>
                  <InputLabel>Vehicle</InputLabel>
                  <Select
                    value={selectedVehicle}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedVehicle(value === '' ? '' : Number(value));
                    }}
                    label="Vehicle"
                    disabled={vehiclesLoading || travelMode !== 'driving'}
                  >
                    {vehiclesLoading ? (
                      <MenuItem disabled>Loading vehicles...</MenuItem>
                    ) : vehiclesError ? (
                      <MenuItem disabled>Error loading vehicles</MenuItem>
                    ) : Array.isArray(vehicles) && vehicles.length > 0 ? (
                      vehicles.map((vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} ({vehicle.vehicle_type})
                          {vehicle.is_default && ' - Default'}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No vehicles available</MenuItem>
                    )}
                  </Select>
                </FormControl>

                {/* Travel Mode Selection */}
                <FormControl fullWidth>
                  <InputLabel>Travel Mode</InputLabel>
                  <Select
                    value={travelMode}
                    onChange={(e) => {
                      setTravelMode(e.target.value);
                      if (e.target.value !== 'driving') {
                        setSelectedVehicle('');
                      }
                    }}
                    label="Travel Mode"
                  >
                    <MenuItem value="driving">Driving</MenuItem>
                    <MenuItem value="walking">Walking</MenuItem>
                    <MenuItem value="cycling">Cycling</MenuItem>
                    <MenuItem value="transit">Public Transit</MenuItem>
                  </Select>
                </FormControl>

                {/* Plan Route Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={planRouteMutation.isLoading ? undefined : <NavigationIcon />}
                  onClick={handlePlanRoute}
                  disabled={!from || !to || planRouteMutation.isLoading}
                  sx={{ py: 1.5 }}
                >
                  {planRouteMutation.isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress sx={{ height: 20 }} />
                      Planning...
                    </Box>
                  ) : (
                    'Plan Route'
                  )}
                </Button>
              </Box>

              {/* Quick Tips */}
              <Paper
                sx={{
                  mt: 4,
                  p: 3,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  💡 Eco Tips
                </Typography>
                <List dense sx={{ py: 0 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Choose routes with bike lanes when cycling"
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Avoid highways during rush hour"
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Consider public transport for longer distances"
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Carpool when possible"
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                    />
                  </ListItem>
                </List>
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Route Options */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Route Options
                </Typography>
                {planRouteMutation.isLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    Planning routes...
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {routeOptions.length} {routeOptions.length === 1 ? 'route' : 'routes'} found
                  </Typography>
                )}
              </Box>

              {planRouteMutation.isLoading && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Finding the best routes for you...
                  </Typography>
                </Box>
              )}

              {!planRouteMutation.isLoading && routeOptions.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {routeOptions.map((route) => (
                  <Paper
                    key={route.id}
                    sx={{
                      p: 3,
                      border: 1,
                      borderColor: 'grey.200',
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 2,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    {/* Route Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <RouteIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {route.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {route.description}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getEcoRatingStars(route.ecoRating)}
                      </Box>
                    </Box>

                    {/* Route Stats */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <RouteIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Distance
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {route.distance}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Duration
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {route.duration}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EcoIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              CO₂
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {route.co2}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Route Highlights */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Highlights:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {route.highlights.map((highlight, index) => (
                          <Chip
                            key={index}
                            label={highlight}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Route Instructions */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Directions:
                      </Typography>
                      <List dense>
                        {route.instructions.map((instruction, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  bgcolor: 'primary.main',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {index + 1}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={instruction}
                              primaryTypographyProps={{ fontSize: '0.875rem' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    {/* Action Buttons */}
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Button
                        variant="outlined"
                        startIcon={<MapIcon />}
                        size="small"
                        onClick={() => handleViewOnMap(route)}
                        aria-label="View this route on map"
                      >
                        View on Map
                      </Button>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          aria-label="Share route"
                          onClick={() => handleShareRoute(route)}
                        >
                          <ShareIcon />
                        </IconButton>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<NavigationIcon />}
                          onClick={() => handleUseRoute(route)}
                          disabled={saveRouteMutation.isLoading}
                          aria-label="Use this route for navigation"
                        >
                          {saveRouteMutation.isLoading ? 'Saving...' : 'Use This Route'}
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                  ))}
                </Box>
              )}

              {!planRouteMutation.isLoading && routeOptions.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <MapIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No routes found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Enter your origin and destination above, then click "Plan Route" to see route options
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<NavigationIcon />}
                    onClick={handlePlanRoute}
                    disabled={!from || !to}
                  >
                    Plan Route Now
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Route Map */}
      <Card id="route-map-section" sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
            Route Map
          </Typography>
          {selectedRoute ? (() => {
            // Calculate center point between origin and destination
            const originLat = selectedRoute.origin_coords?.[1] ?? selectedRoute.route_data?.geometry?.coordinates?.[0]?.[1] ?? 40.7128;
            const originLng = selectedRoute.origin_coords?.[0] ?? selectedRoute.route_data?.geometry?.coordinates?.[0]?.[0] ?? -74.0060;
            const destLat = selectedRoute.destination_coords?.[1] ?? (selectedRoute.route_data?.geometry?.coordinates?.length > 0 ? selectedRoute.route_data.geometry.coordinates[selectedRoute.route_data.geometry.coordinates.length - 1]?.[1] : 40.7128);
            const destLng = selectedRoute.destination_coords?.[0] ?? (selectedRoute.route_data?.geometry?.coordinates?.length > 0 ? selectedRoute.route_data.geometry.coordinates[selectedRoute.route_data.geometry.coordinates.length - 1]?.[0] : -74.0060);
            
            // Calculate center point
            const centerLat = (originLat + destLat) / 2;
            const centerLng = (originLng + destLng) / 2;
            
            // Calculate zoom based on distance
            const distance = selectedRoute.distance_km || 10;
            let zoom = 12;
            if (distance > 100) zoom = 7;
            else if (distance > 50) zoom = 8;
            else if (distance > 20) zoom = 9;
            else if (distance > 10) zoom = 10;
            else if (distance > 5) zoom = 11;
            
            return (
              <Map
                center={{ lat: centerLat, lng: centerLng }}
                zoom={zoom}
                route={selectedRoute.route_data}
                markers={[
                  {
                    lat: originLat,
                    lng: originLng,
                    popup: `Origin: ${from || 'Starting point'}`
                  },
                  {
                    lat: destLat,
                    lng: destLng,
                    popup: `Destination: ${to || 'End point'}`
                  }
                ]}
              />
            );
          })() : (
            <Box sx={{ height: 400, borderRadius: 2, overflow: 'hidden' }}>
              <Map
                center={{ lat: 40.7128, lng: -74.0060 }}
                zoom={10}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RoutePlanningPage;
