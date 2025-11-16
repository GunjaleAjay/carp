import React from 'react';
import RealTimeMap from '../components/Map/RealTimeMap';
import { Box, Typography, Paper, Button, Card, CardContent, Grid, Chip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RouteIcon from '@mui/icons-material/Route';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NatureIcon from '@mui/icons-material/Nature';

export default function RealTimeMapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const trip = location.state?.trip;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/trips')}
          sx={{ mr: 2 }}
        >
          Back to Trips
        </Button>
        <Typography variant="h4" component="h1">
          Real-Time GPS Tracking
        </Typography>
      </Box>

      {trip && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOnIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {trip.from} → {trip.to}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  <Chip label={trip.mode} size="small" color="primary" />
                  <Chip label={trip.distance} size="small" />
                  <Chip label={trip.duration} size="small" icon={<AccessTimeIcon />} />
                  <Chip 
                    label={`${trip.co2} CO₂`} 
                    size="small" 
                    icon={<NatureIcon />}
                    color="success"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <RouteIcon color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Tracking route in real-time
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Watch live vehicle movement with real-time GPS updates. The marker updates every second to show the current location.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {trip ? `Tracking your trip from ${trip.from} to ${trip.to}` : 'This feature is perfect for tracking deliveries, rideshares, or any moving vehicle in real-time.'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <RealTimeMap trip={trip} />
      </Paper>
    </Box>
  );
}