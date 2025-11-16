import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface EmissionFactor {
  id: number;
  vehicle_type: string;
  fuel_type: string;
  emission_factor_kg_per_liter: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminEmissionFactorsPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState<EmissionFactor | null>(null);
  const [formData, setFormData] = useState({
    vehicle_type: '',
    fuel_type: '',
    emission_factor_kg_per_liter: '',
  });

  const queryClient = useQueryClient();

  // Fetch emission factors
  const { data: factorsData, isLoading, error } = useQuery(
    'adminEmissionFactors',
    () => adminAPI.getEmissionFactors(),
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  const factors = factorsData?.data || [];

  // Add emission factor mutation
  const addFactorMutation = useMutation(
    (data: any) => adminAPI.addEmissionFactor(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminEmissionFactors');
        toast.success('Emission factor added successfully');
        handleCloseDialog();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to add emission factor');
      },
    }
  );

  // Update emission factor mutation
  const updateFactorMutation = useMutation(
    ({ id, data }: { id: number; data: any }) => adminAPI.updateEmissionFactor(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminEmissionFactors');
        toast.success('Emission factor updated successfully');
        handleCloseDialog();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update emission factor');
      },
    }
  );

  // Delete emission factor mutation
  const deleteFactorMutation = useMutation(
    (id: number) => adminAPI.deleteEmissionFactor(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminEmissionFactors');
        toast.success('Emission factor deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to delete emission factor');
      },
    }
  );

  const handleOpenDialog = (factor?: EmissionFactor) => {
    if (factor) {
      setEditingFactor(factor);
      setFormData({
        vehicle_type: factor.vehicle_type,
        fuel_type: factor.fuel_type,
        emission_factor_kg_per_liter: factor.emission_factor_kg_per_liter.toString(),
      });
    } else {
      setEditingFactor(null);
      setFormData({
        vehicle_type: '',
        fuel_type: '',
        emission_factor_kg_per_liter: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingFactor(null);
    setFormData({
      vehicle_type: '',
      fuel_type: '',
      emission_factor_kg_per_liter: '',
    });
  };

  const handleSubmit = () => {
    const data = {
      vehicle_type: formData.vehicle_type,
      fuel_type: formData.fuel_type,
      emission_factor_kg_per_liter: parseFloat(formData.emission_factor_kg_per_liter),
    };

    if (editingFactor) {
      updateFactorMutation.mutate({ id: editingFactor.id, data });
    } else {
      addFactorMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this emission factor?')) {
      deleteFactorMutation.mutate(id);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 0 } }}>
        <Alert severity="error">
          Failed to load emission factors. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Emission Factors
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage emission factors and vehicle categories
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Factor
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vehicle Type</TableCell>
                  <TableCell>Fuel Type</TableCell>
                  <TableCell>Emission Factor (kg/L)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      Loading emission factors...
                    </TableCell>
                  </TableRow>
                ) : factors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      No emission factors found
                    </TableCell>
                  </TableRow>
                ) : (
                  factors.map((factor: EmissionFactor) => (
                    <TableRow key={factor.id} hover>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {factor.vehicle_type}
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {factor.fuel_type}
                      </TableCell>
                      <TableCell>{factor.emission_factor_kg_per_liter}</TableCell>
                      <TableCell>
                        <Chip
                          label={factor.is_active ? 'Active' : 'Inactive'}
                          color={factor.is_active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(factor.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(factor)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(factor.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingFactor ? 'Edit Emission Factor' : 'Add Emission Factor'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
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
              </Select>
            </FormControl>

            <FormControl fullWidth>
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
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Emission Factor (kg/L)"
              type="number"
              value={formData.emission_factor_kg_per_liter}
              onChange={(e) => setFormData({ ...formData, emission_factor_kg_per_liter: e.target.value })}
              inputProps={{ step: '0.01', min: '0' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.vehicle_type ||
              !formData.fuel_type ||
              !formData.emission_factor_kg_per_liter ||
              addFactorMutation.isLoading ||
              updateFactorMutation.isLoading
            }
          >
            {addFactorMutation.isLoading || updateFactorMutation.isLoading
              ? 'Saving...'
              : editingFactor
              ? 'Update'
              : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminEmissionFactorsPage;
