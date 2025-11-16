import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  DirectionsCar as CarIcon,
  Nature as EcoIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { adminAPI } from '../../services/api';

const AdminDashboardPage: React.FC = () => {
  // Fetch admin dashboard data
  const { data: adminData, isLoading } = useQuery(
    'adminDashboard',
    () => adminAPI.getDashboard(),
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  const stats = adminData?.data || {
    users: { total_users: 0, active_users: 0, admin_users: 0, new_users_30d: 0 },
    vehicles: { total_vehicles: 0, cars: 0, motorcycles: 0, electric_vehicles: 0 },
    trips: { total_trips: 0, total_distance_km: 0, total_co2_emitted_kg: 0, total_co2_saved_kg: 0, trips_30d: 0 },
    recent_users: [],
    recent_trips: []
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
              width: 56,
              height: 56,
            }}
          >
            <Icon />
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
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
        <Typography>Loading admin dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          System overview and management
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Users"
            value={stats.users.total_users.toString()}
            icon={PeopleIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Vehicles"
            value={stats.vehicles.total_vehicles.toString()}
            icon={CarIcon}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Trips"
            value={stats.trips.total_trips.toString()}
            icon={TrendingUpIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="CO₂ Saved"
            value={`${stats.trips.total_co2_saved_kg.toFixed(1)} kg`}
            icon={EcoIcon}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Admin Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admin functionality will be implemented here
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                System Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System monitoring and health checks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;