import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  Paper,
  useTheme,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  DirectionsCar as CarIcon,
  ElectricBolt as BoltIcon,
  Nature as EcoIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { vehiclesAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Vehicle {
  id: number;
  name: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  fuel_type: string;
  is_default: boolean;
  co2_per_km: number;
  total_trips?: number;
  total_distance?: number;
  total_co2?: number;
}

interface VehicleFormData {
  name: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  fuel_type: string;
  is_default: boolean;
}

const VehiclesPage: React.FC = () => {
  const theme = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vehicle_type: 'car',
    fuel_type: 'gasoline',
    is_default: false,
  });

  const queryClient = useQueryClient();

  // Fetch vehicles
  const { data: vehicles = [], isLoading, error, refetch } = useQuery(
    'vehicles',
    async () => {
      try {
        const response = await vehiclesAPI.getVehicles();
        // Handle different response structures
        const vehiclesData = response.data?.data?.vehicles || response.data?.vehicles || [];
        return Array.isArray(vehiclesData) ? vehiclesData : [];
      } catch (error: any) {
        console.error('Error fetching vehicles:', error);
        // Return empty array on error instead of throwing
        return [];
      }
    },
    {
      retry: 1,
      refetchOnWindowFocus: true,
    }
  );

  // Add vehicle mutation
  const addVehicleMutation = useMutation(
    (vehicleData: VehicleFormData) => vehiclesAPI.addVehicle(vehicleData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vehicles');
        setShowAddModal(false);
        resetForm();
        toast.success('Vehicle added successfully!');
      },
      onError: (error: any) => {
        if (error.response) {
          const status = error.response.status;
          const errorMessage = error.response?.data?.error || error.response?.data?.message;
          
          // Handle validation errors
          if (status === 400 || status === 422) {
            toast.error(errorMessage || 'Please check your vehicle information and try again.');
          } else if (status === 429) {
            // Don't show toast for rate limit - handled silently
            console.warn('Rate limit reached. Please wait a moment before retrying.');
          } else {
            toast.error(errorMessage || 'Failed to add vehicle. Please try again.');
          }
        } else {
          toast.error('Network error. Please check your connection and try again.');
        }
      },
    }
  );

  // Update vehicle mutation
  const updateVehicleMutation = useMutation(
    ({ id, data }: { id: number; data: VehicleFormData }) =>
      vehiclesAPI.updateVehicle(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vehicles');
        setEditingVehicle(null);
        resetForm();
        toast.success('Vehicle updated successfully!');
      },
      onError: (error: any) => {
        if (error.response) {
          toast.error(error.response?.data?.error || 'Failed to update vehicle');
        }
      },
    }
  );

  // Delete vehicle mutation
  const deleteVehicleMutation = useMutation(
    (id: number) => vehiclesAPI.deleteVehicle(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vehicles');
        toast.success('Vehicle deleted successfully!');
      },
      onError: (error: any) => {
        if (error.response) {
          toast.error(error.response?.data?.error || 'Failed to delete vehicle');
        }
      },
    }
  );

  // Set default vehicle mutation
  const setDefaultVehicleMutation = useMutation(
    (id: number) => vehiclesAPI.setDefaultVehicle(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vehicles');
        toast.success('Default vehicle updated!');
      },
      onError: (error: any) => {
        if (error.response) {
          toast.error(error.response?.data?.error || 'Failed to set default vehicle');
        }
      },
    }
  );

  const resetForm = () => {
    setFormData({
      name: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vehicle_type: 'car',
      fuel_type: 'gasoline',
      is_default: false,
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setFormData({
      name: vehicle.name || '',
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vehicle_type: vehicle.vehicle_type,
      fuel_type: vehicle.fuel_type,
      is_default: vehicle.is_default,
    });
    setEditingVehicle(vehicle);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingVehicle(null);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateVehicleMutation.mutate({ id: editingVehicle.id, data: formData });
    } else {
      addVehicleMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicleMutation.mutate(id);
    }
  };

  const handleSetDefault = (id: number) => {
    setDefaultVehicleMutation.mutate(id);
  };

  const getVehicleIcon = (fuelType: string) => {
    switch (fuelType.toLowerCase()) {
      case 'electric':
        return <BoltIcon sx={{ color: theme.palette.primary.main }} />;
      case 'hybrid':
        return <EcoIcon sx={{ color: theme.palette.secondary.main }} />;
      default:
        return <CarIcon sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  const getEcoRating = (co2PerKm: number) => {
    if (co2PerKm <= 0.05) return { rating: 5, label: 'Excellent', color: 'success' };
    if (co2PerKm <= 0.08) return { rating: 4, label: 'Very Good', color: 'success' };
    if (co2PerKm <= 0.12) return { rating: 3, label: 'Good', color: 'warning' };
    if (co2PerKm <= 0.15) return { rating: 2, label: 'Fair', color: 'warning' };
    return { rating: 1, label: 'Poor', color: 'error' };
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

  // Calculate total stats
  const totalStats = {
    vehicles: Array.isArray(vehicles) ? vehicles.length : 0,
    co2: Array.isArray(vehicles) ? vehicles.reduce((sum, v) => sum + (v.total_co2 || 0), 0) : 0,
    distance: Array.isArray(vehicles) ? vehicles.reduce((sum, v) => sum + (v.total_distance || 0), 0) : 0,
    trips: Array.isArray(vehicles) ? vehicles.reduce((sum, v) => sum + (v.total_trips || 0), 0) : 0,
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
        <Typography>Loading vehicles...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error loading vehicles
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please try refreshing the page
        </Typography>
        <Button variant="contained" onClick={() => refetch()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            My Vehicles
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your vehicles and track their environmental impact
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Add Vehicle
        </Button>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Vehicles"
            value={totalStats.vehicles.toString()}
            icon={CarIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total CO₂ Emitted"
            value={`${totalStats.co2.toFixed(1)} kg`}
            icon={EcoIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Distance"
            value={`${totalStats.distance} km`}
            icon={SettingsIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Trips"
            value={totalStats.trips.toString()}
            icon={BoltIcon}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Vehicles Grid */}
      {Array.isArray(vehicles) && vehicles.length > 0 ? (
        <Grid container spacing={3}>
          {vehicles.map((vehicle) => {
          const ecoRating = getEcoRating(vehicle.co2_per_km);
          
          return (
            <Grid item xs={12} sm={6} lg={4} key={vehicle.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: vehicle.is_default ? 2 : 1,
                  borderColor: vehicle.is_default ? 'primary.main' : 'grey.200',
                  backgroundColor: vehicle.is_default ? 'primary.main' : 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Vehicle Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {getVehicleIcon(vehicle.fuel_type)}
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: vehicle.is_default ? 'white' : 'text.primary',
                          }}
                        >
                          {vehicle.make} {vehicle.model}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: vehicle.is_default ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                          }}
                        >
                          {vehicle.year} • {vehicle.vehicle_type}
                        </Typography>
                      </Box>
                    </Box>
                    {vehicle.is_default && (
                      <Chip
                        label="Default"
                        size="small"
                        sx={{
                          backgroundColor: 'white',
                          color: 'primary.main',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>

                  {/* Vehicle Stats */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: vehicle.is_default ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
                      >
                        CO₂ per km
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: vehicle.is_default ? 'white' : 'text.primary',
                        }}
                      >
                        {vehicle.co2_per_km} kg
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: vehicle.is_default ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
                      >
                        Eco Rating
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: vehicle.is_default ? 'white' : `${ecoRating.color}.main`,
                          }}
                        >
                          {ecoRating.label}
                        </Typography>
                        <Box sx={{ display: 'flex' }}>
                          {getEcoRatingStars(ecoRating.rating)}
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Trip Stats */}
                  <Paper
                    sx={{
                      p: 2,
                      mb: 3,
                      backgroundColor: vehicle.is_default ? 'rgba(255,255,255,0.1)' : 'grey.50',
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 'bold',
                              color: vehicle.is_default ? 'white' : 'text.primary',
                            }}
                          >
                            {vehicle.total_trips || 0}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: vehicle.is_default ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
                          >
                            Trips
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 'bold',
                              color: vehicle.is_default ? 'white' : 'text.primary',
                            }}
                          >
                            {vehicle.total_distance || 0}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: vehicle.is_default ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
                          >
                            km
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 'bold',
                              color: vehicle.is_default ? 'white' : 'text.primary',
                            }}
                          >
                            {vehicle.total_co2 || 0}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: vehicle.is_default ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}
                          >
                            kg CO₂
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleSetDefault(vehicle.id)}
                        disabled={vehicle.is_default}
                        sx={{
                          color: vehicle.is_default ? 'white' : 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        <StarIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditModal(vehicle)}
                        sx={{
                          color: vehicle.is_default ? 'white' : 'text.secondary',
                          '&:hover': { color: 'primary.main' },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(vehicle.id)}
                        disabled={vehicle.is_default}
                        sx={{
                          color: vehicle.is_default ? 'white' : 'text.secondary',
                          '&:hover': { color: 'error.main' },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Chip
                      label={vehicle.fuel_type}
                      size="small"
                      sx={{
                        backgroundColor: vehicle.is_default ? 'rgba(255,255,255,0.2)' : 'grey.200',
                        color: vehicle.is_default ? 'white' : 'text.secondary',
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
          })}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No vehicles yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add your first vehicle to start tracking emissions
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddModal}
              >
                Add Your First Vehicle
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add vehicle"
        onClick={handleOpenAddModal}
        sx={{
          display: { xs: 'flex', sm: 'none' },
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Vehicle Dialog */}
      <Dialog open={showAddModal || !!editingVehicle} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    label="Vehicle Type"
                  >
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="motorcycle">Motorcycle</MenuItem>
                    <MenuItem value="truck">Truck</MenuItem>
                    <MenuItem value="bus">Bus</MenuItem>
                    <MenuItem value="van">Van</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    label="Fuel Type"
                  >
                    <MenuItem value="gasoline">Gasoline</MenuItem>
                    <MenuItem value="diesel">Diesel</MenuItem>
                    <MenuItem value="electric">Electric</MenuItem>
                    <MenuItem value="hybrid">Hybrid</MenuItem>
                    <MenuItem value="lpg">LPG</MenuItem>
                    <MenuItem value="cng">CNG</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Set as default vehicle"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={addVehicleMutation.isLoading || updateVehicleMutation.isLoading}
            >
              {editingVehicle ? 'Update' : 'Add'} Vehicle
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default VehiclesPage;