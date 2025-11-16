import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  LinearProgress,
  Paper,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Nature as EcoIcon,
  DirectionsCar as CarIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from 'react-query';
import { analyticsAPI, routesAPI } from '../services/api';

interface TrendData {
  month: string;
  total_co2: number;
  total_distance: number;
  trip_count: number;
  avg_eco_rating: number;
}

const AnalyticsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState('30d');

  // Fetch trip history to calculate actual stats
  const { data: tripHistoryData, refetch: refetchTrips } = useQuery(
    'tripHistory',
    () => routesAPI.getRouteHistory({ limit: 1000 }),
    {
      retry: 1,
      refetchOnWindowFocus: true,
    }
  );

  // Fetch emission stats
  const { data: emissionData, isLoading: emissionLoading, refetch: refetchEmissions } = useQuery(
    ['emissionStats', timeRange],
    () => analyticsAPI.getEmissionStats({ period: timeRange }),
    {
      retry: 1,
      refetchOnWindowFocus: true,
    }
  );

  // Fetch carbon savings
  const { data: savingsData, isLoading: savingsLoading, refetch: refetchSavings } = useQuery(
    'carbonSavings',
    () => analyticsAPI.getCarbonSavings(),
    {
      retry: 1,
      refetchOnWindowFocus: true,
    }
  );

  // Fetch trends
  const { data: trendsData, isLoading: trendsLoading, refetch: refetchTrends } = useQuery(
    'analyticsTrends',
    () => analyticsAPI.getTrends({ months: 6 }),
    {
      retry: 1,
      refetchOnWindowFocus: true,
    }
  );

  // Refresh all data
  const handleRefresh = () => {
    refetchTrips();
    refetchEmissions();
    refetchSavings();
    refetchTrends();
  };

  const isLoading = emissionLoading || savingsLoading || trendsLoading;

  // Process data - handle different response structures
  const emissionStats = emissionData?.data?.data || emissionData?.data || {};
  const carbonSavings = savingsData?.data?.data || savingsData?.data || {};
  const trends = trendsData?.data?.data?.monthly_trends || trendsData?.data?.monthly_trends || [];

  // Get actual trips from trip history
  const allTrips = tripHistoryData?.data?.trips || tripHistoryData?.data?.data?.trips || [];
  
  // Calculate actual stats from trips
  const totalTrips = emissionStats.stats?.trip_count || allTrips.length || 0;
  const totalDistance = emissionStats.stats?.total_distance || allTrips.reduce((sum: number, trip: any) => sum + (trip.distance_km || 0), 0);
  const totalCo2 = emissionStats.stats?.total_co2 || allTrips.reduce((sum: number, trip: any) => sum + (trip.co2_emissions_kg || 0), 0);
  const co2Saved = carbonSavings.total_co2_saved_kg || 0;

  // Calculate eco trips from actual trip data
  const ecoTrips = allTrips.filter((trip: any) => 
    ['walking', 'cycling', 'transit'].includes(trip.travel_mode?.toLowerCase())
  ).length;

  // Calculate average eco rating from actual trips
  const avgEcoRating = allTrips.length > 0
    ? allTrips.reduce((sum: number, trip: any) => {
        const rating = trip.travel_mode === 'walking' || trip.travel_mode === 'cycling' ? 5 : 
                      trip.travel_mode === 'transit' ? 4 : 
                      (trip.co2_emissions_kg || 0) < 1 ? 4 : 
                      (trip.co2_emissions_kg || 0) < 2 ? 3 : 2;
        return sum + rating;
      }, 0) / allTrips.length
    : 0;

  const StatCard: React.FC<{
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    icon: React.ElementType;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  }> = ({ title, value, change, changeType, icon: Icon, color }) => (
    <Card
      sx={{
        height: '100%',
        borderLeft: 4,
        borderLeftColor: `${color}.main`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
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
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant="body2"
              sx={{
                color: changeType === 'positive' ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              {change}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs last month
            </Typography>
          </Box>
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your environmental impact and eco-friendly progress
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            size="small"
          >
            Refresh
          </Button>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Trips"
            value={totalTrips.toString()}
            change="+12%"
            changeType="positive"
            icon={CalendarIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Distance"
            value={`${totalDistance.toFixed(1)} km`}
            change="+8%"
            changeType="positive"
            icon={CarIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="CO₂ Emitted"
            value={`${totalCo2.toFixed(1)} kg`}
            change="-15%"
            changeType="positive"
            icon={EcoIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="CO₂ Saved"
            value={`${co2Saved.toFixed(1)} kg`}
            change="+22%"
            changeType="positive"
            icon={TrendingUpIcon}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Eco Performance */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Eco Performance
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Eco-Friendly Trips</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {ecoTrips}/{totalTrips}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={totalTrips > 0 ? (ecoTrips / totalTrips) * 100 : 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {totalTrips > 0 ? Math.round((ecoTrips / totalTrips) * 100) : 0}% of trips are eco-friendly ({ecoTrips} out of {totalTrips} trips)
                  </Typography>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Average Eco Rating</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {avgEcoRating.toFixed(1)}/5
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(avgEcoRating / 5) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {avgEcoRating >= 4 ? 'Excellent! Keep it up!' : avgEcoRating >= 3 ? 'Good progress! Try more eco-friendly options.' : 'Room for improvement - consider walking or cycling more often.'}
                  </Typography>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Carbon Savings</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {co2Saved.toFixed(1)} kg
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={co2Saved > 0 ? Math.min(100, (co2Saved / Math.max(totalCo2, 1)) * 100) : 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {co2Saved > 0 ? `You've saved ${co2Saved.toFixed(1)} kg of CO₂!` : 'Start using eco-friendly routes to save CO₂!'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Environmental Impact */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Environmental Impact
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Paper sx={{ p: 3, backgroundColor: 'success.main', color: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <EcoIcon sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Trees Planted Equivalent
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {Math.round(co2Saved * 0.5)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Your CO₂ savings are equivalent to planting {Math.round(co2Saved * 0.5)} trees
                  </Typography>
                </Paper>

                <Paper sx={{ p: 3, backgroundColor: 'primary.main', color: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <MoneyIcon sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Fuel Savings
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        ${Math.round(co2Saved * 2.5)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Estimated fuel cost savings from eco-friendly choices
                  </Typography>
                </Paper>

                <Paper sx={{ p: 3, backgroundColor: 'info.main', color: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Environmental Score
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        A+
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Excellent environmental performance! Keep up the great work.
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;