
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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { adminAPI } from '../../services/api';

interface AdminLog {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const AdminLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Fetch admin logs
  const { data: logsData, isLoading, error } = useQuery(
    ['adminLogs', searchTerm, actionFilter, page],
    () => adminAPI.getLogs({
      search: searchTerm,
      action: actionFilter,
      page,
      limit,
    }),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  const logs: AdminLog[] = logsData?.data?.logs || [];
  const total = logsData?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const getActionIcon = (action: string) => {
    if (action.includes('user')) return <PersonIcon fontSize="small" />;
    if (action.includes('admin')) return <AdminIcon fontSize="small" />;
    if (action.includes('emission')) return <SettingsIcon fontSize="small" />;
    return <SecurityIcon fontSize="small" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('add')) return 'success';
    if (action.includes('update') || action.includes('edit')) return 'primary';
    if (action.includes('delete') || action.includes('remove')) return 'error';
    if (action.includes('login')) return 'info';
    return 'default';
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 0 } }}>
        <Alert severity="error">
          Failed to load admin logs. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 0 } }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
        System Logs
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View system activity and admin actions ({total} total logs)
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search by user or action"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Action Type</InputLabel>
              <Select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                label="Action Type"
              >
                <MenuItem value="">All Actions</MenuItem>
                <MenuItem value="user_create">User Create</MenuItem>
                <MenuItem value="user_update">User Update</MenuItem>
                <MenuItem value="user_delete">User Delete</MenuItem>
                <MenuItem value="admin_login">Admin Login</MenuItem>
                <MenuItem value="emission_factor_create">Emission Factor Create</MenuItem>
                <MenuItem value="emission_factor_update">Emission Factor Update</MenuItem>
                <MenuItem value="emission_factor_delete">Emission Factor Delete</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      Loading logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {log.user_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getActionIcon(log.action)}
                          label={formatAction(log.action)}
                          color={getActionColor(log.action) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {log.details}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {log.ip_address}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminLogsPage;
