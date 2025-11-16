import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Nature as EcoIcon,
  DirectionsCar as CarIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
  Visibility as ViewIcon,
  MyLocation as LiveLocationIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from 'react-query';
import { routesAPI } from '../services/api';
import toast from 'react-hot-toast';
import Map from '../components/Map/Map';
import { useNavigate } from 'react-router-dom';

interface Trip {
  id: number;
  from: string;
  to: string;
  distance: string;
  duration: string;
  co2: string;
  mode: string;
  date: string;
  time: string;
  ecoRating: number;
  vehicle: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
  route_data?: any;
  distance_km?: number;
  duration_minutes?: number;
}

const TripsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [viewingTripId, setViewingTripId] = useState<number | null>(null);

  // Fetch trip history
  const { data: tripHistoryData, isLoading, refetch } = useQuery(
    'tripHistory',
    () => routesAPI.getRouteHistory({ limit: 50 }),
    {
      retry: 1,
      refetchOnWindowFocus: true, // Enable refetch on focus to show new trips
    }
  );

  // Transform API data to Trip interface
  const trips: Trip[] = (tripHistoryData?.data?.trips || tripHistoryData?.data?.data?.trips || []).map((trip: any) => {
    // Calculate duration properly
    const durationMinutes = trip.duration_minutes || Math.round((trip.distance_km || 0) * 1.5);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return {
      id: trip.id,
      from: trip.origin_name || 'Unknown',
      to: trip.destination_name || 'Unknown',
      distance: `${(trip.distance_km || 0).toFixed(1)} km`,
      duration: durationStr,
      co2: `${(trip.co2_emissions_kg || 0).toFixed(2)} kg`,
      mode: trip.travel_mode || 'Unknown',
      date: new Date(trip.created_at || new Date()).toISOString().split('T')[0],
      time: new Date(trip.created_at || new Date()).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      ecoRating: trip.eco_rating || (trip.travel_mode === 'walking' || trip.travel_mode === 'cycling' ? 5 : 3),
      vehicle: trip.vehicle_name || trip.travel_mode || 'Unknown',
      origin_lat: trip.origin_lat,
      origin_lng: trip.origin_lng,
      destination_lat: trip.destination_lat,
      destination_lng: trip.destination_lng,
      route_data: trip.route_data,
      distance_km: trip.distance_km,
      duration_minutes: trip.duration_minutes
    };
  });

  const filters = [
    { value: 'all', label: 'All Trips' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'eco', label: 'Eco-Friendly' }
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, trip: Trip) => {
    setAnchorEl(event.currentTarget);
    setSelectedTrip(trip);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTrip(null);
  };

  const handleExport = () => {
    // Implement export functionality
    toast.success('Exporting trip data...');
  };

  const handleShareTrip = () => {
    if (selectedTrip) {
      const shareText = `Check out my trip: ${selectedTrip.from} → ${selectedTrip.to} (${selectedTrip.distance}, ${selectedTrip.duration})`;
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Trip details copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy trip details');
      });
    }
    handleMenuClose();
  };

  const handleEditTrip = () => {
    if (selectedTrip) {
      toast(`Edit functionality for trip ${selectedTrip.id} coming soon!`, { icon: 'ℹ️' });
    }
    handleMenuClose();
  };

  const handleDeleteTrip = async () => {
    if (selectedTrip) {
      try {
        await routesAPI.deleteRoute(selectedTrip.id);
        toast.success('Trip deleted successfully!');
        queryClient.invalidateQueries('tripHistory');
        queryClient.invalidateQueries('userDashboard');
        queryClient.invalidateQueries('emissionStats');
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to delete trip');
      }
    }
    handleMenuClose();
  };

  const handleViewOnMap = (trip: Trip) => {
    setViewingTripId(trip.id);
  };

  const handleViewLiveMap = (trip: Trip) => {
    // Navigate to live map with trip data
    navigate('/realtime-map', { state: { trip } });
  };

  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'electric car':
        return <CarIcon sx={{ color: theme.palette.primary.main }} />;
      case 'bicycle':
        return <EcoIcon sx={{ color: theme.palette.secondary.main }} />;
      case 'public transport':
        return <CarIcon sx={{ color: theme.palette.info.main }} />;
      case 'walking':
        return <EcoIcon sx={{ color: theme.palette.primary.main }} />;
      default:
        return <CarIcon sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  const getEcoRatingStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        sx={{
          fontSize: 16,
          color: i < rating ? theme.palette.primary.main : theme.palette.grey[300],
        }}
      />
    ));
  };

  const filteredTrips = trips.filter(trip => {
    const today = new Date();
    const tripDate = new Date(trip.date);

    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'eco' && trip.ecoRating >= 4) ||
      (selectedFilter === 'today' && tripDate.toDateString() === today.toDateString()) ||
      (selectedFilter === 'week' && (() => {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return tripDate >= weekStart && tripDate <= weekEnd;
      })()) ||
      (selectedFilter === 'month' && tripDate.getMonth() === today.getMonth() && tripDate.getFullYear() === today.getFullYear());

    const matchesSearch = searchTerm === '' ||
      trip.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.to.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalStats = {
    trips: filteredTrips.length,
    distance: filteredTrips.reduce((sum: number, trip: Trip) => sum + parseFloat(trip.distance), 0),
    co2: filteredTrips.reduce((sum: number, trip: Trip) => sum + parseFloat(trip.co2), 0),
    ecoTrips: filteredTrips.filter((trip: Trip) => trip.ecoRating >= 4).length
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ElementType;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  }> = ({ title, value, icon: Icon, color }) => (
    <Card
      sx={{
        height: '100%',
        borderLeft: 4,
        borderLeftColor: `${color}.main`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              color: 'white',
              width: 48,
              height: 48,
            }}
          >
            <Icon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading trip history...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Trip History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your journeys and environmental impact
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => refetch()}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Trips"
            value={totalStats.trips.toString()}
            icon={CalendarIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Distance"
            value={`${totalStats.distance.toFixed(1)} km`}
            icon={EcoIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="CO₂ Emitted"
            value={`${totalStats.co2.toFixed(1)} kg`}
            icon={EcoIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Eco-Friendly Trips"
            value={totalStats.ecoTrips.toString()}
            icon={CarIcon}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Filters */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <FilterIcon sx={{ color: 'text.secondary' }} />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    label="Filter"
                  >
                    {filters.map((filter) => (
                      <MenuItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Trips List */}
      <Card>
        <CardContent>
          {filteredTrips.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No trips found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Try adjusting your search terms' : 'Start planning your first eco-friendly route!'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredTrips.map((trip) => (
                <Paper
                  key={trip.id}
                  sx={{
                    p: 3,
                    border: 1,
                    borderColor: 'grey.200',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 2,
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 48,
                            height: 48,
                          }}
                        >
                          {getModeIcon(trip.mode)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {trip.from} → {trip.to}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {trip.date}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {trip.time}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {trip.vehicle}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Grid container spacing={2} alignItems="center">
                        {/* Trip Stats */}
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {trip.distance}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Distance
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {trip.duration}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Duration
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              {trip.co2}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              CO₂
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {trip.mode}
                          </Typography>
                          <Box sx={{ display: 'flex' }}>
                            {getEcoRatingStars(trip.ecoRating)}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MapIcon />}
                            onClick={() => handleViewOnMap(trip)}
                          >
                            View Map
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<LiveLocationIcon />}
                            onClick={() => handleViewLiveMap(trip)}
                          >
                            Live Track
                          </Button>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, trip)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                    {viewingTripId === trip.id && trip.origin_lat && trip.origin_lng && (
                      <Grid item xs={12}>
                        <Box sx={{ mt: 2 }}>
                          <Map
                            center={{
                              lat: (trip.origin_lat + (trip.destination_lat || trip.origin_lat)) / 2,
                              lng: (trip.origin_lng + (trip.destination_lng || trip.origin_lng)) / 2
                            }}
                            zoom={trip.distance_km && trip.distance_km > 50 ? 8 : trip.distance_km && trip.distance_km > 20 ? 10 : 12}
                            markers={[
                              {
                                lat: trip.origin_lat,
                                lng: trip.origin_lng,
                                popup: `Origin: ${trip.from}`
                              },
                              ...(trip.destination_lat && trip.destination_lng ? [{
                                lat: trip.destination_lat,
                                lng: trip.destination_lng,
                                popup: `Destination: ${trip.to}`
                              }] : [])
                            ]}
                            route={trip.route_data}
                            sx={{ height: '300px', borderRadius: 2 }}
                          />
                          <Button
                            size="small"
                            onClick={() => setViewingTripId(null)}
                            sx={{ mt: 1 }}
                          >
                            Hide Map
                          </Button>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedTrip) {
            handleViewOnMap(selectedTrip);
            handleMenuClose();
          }
        }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View on Map</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedTrip) {
            handleViewLiveMap(selectedTrip);
            handleMenuClose();
          }
        }}>
          <ListItemIcon>
            <LiveLocationIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Live Track</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareTrip}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share Trip</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteTrip} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Trip</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TripsPage;