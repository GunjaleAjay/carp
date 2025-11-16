import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Divider,
  Chip,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  DirectionsCar as CarIcon,
  Route as RouteIcon,
  BarChart as BarChartIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  TrendingUp as TrendingUpIcon,
  GpsFixed as GpsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from 'react-query';
import { analyticsAPI } from '../../services/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary';
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, variant = 'permanent' }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width:1023px)');

  const isAdmin = user?.role === 'admin';

  const mainNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'Overview and insights'
    },
    {
      name: 'Route Planning',
      href: '/routes',
      icon: RouteIcon,
      description: 'Plan eco-friendly routes'
    },
    {
      name: 'Vehicles',
      href: '/vehicles',
      icon: CarIcon,
      description: 'Manage your vehicles'
    },
    {
      name: 'Trip History',
      href: '/trips',
      icon: CalendarIcon,
      description: 'View past trips'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChartIcon,
      description: 'Carbon footprint analysis'
    },
    {
      name: 'Live Tracking',
      href: '/realtime-map',
      icon: GpsIcon,
      description: 'Real-time GPS tracking'
    }
  ];

  const adminNavigation = [
    {
      name: 'Admin Dashboard',
      href: '/admin',
      icon: AdminIcon,
      description: 'System overview'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: PersonIcon,
      description: 'Manage users'
    },
    {
      name: 'Emission Factors',
      href: '/admin/emission-factors',
      icon: BarChartIcon,
      description: 'Configure emission data'
    },
    {
      name: 'System Logs',
      href: '/admin/logs',
      icon: AdminIcon,
      description: 'View system activity'
    }
  ];

  const profileNavigation = [
    {
      name: 'Profile',
      href: '/profile',
      icon: PersonIcon,
      description: 'Personal information'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: SettingsIcon,
      description: 'App preferences'
    }
  ];

  const EcoStats: React.FC = () => {
    // Fetch dashboard data
    const { data: dashboardData } = useQuery(
      'userDashboard',
      () => analyticsAPI.getDashboard(),
      {
        retry: 1,
        refetchOnWindowFocus: false,
      }
    );

    // Fetch carbon savings data
    const { data: savingsData } = useQuery(
      'carbonSavings',
      () => analyticsAPI.getCarbonSavings(),
      {
        retry: 1,
        refetchOnWindowFocus: false,
      }
    );

    // Process dashboard data
    const rawStats = dashboardData?.data?.dashboard?.stats || {};
    const travelModeDistribution = dashboardData?.data?.dashboard?.travel_mode_distribution || [];
    
    const totalTrips = rawStats.total_trips || 0;
    const co2Saved = savingsData?.data?.total_co2_saved_kg || 0;
    
    // Calculate eco-friendly trips
    const ecoFriendlyTrips = travelModeDistribution
      .filter(item => ['walking', 'cycling', 'transit'].includes(item.travel_mode))
      .reduce((sum, item) => sum + (parseInt(item.count) || 0), 0);

    return (
      <Box
        sx={{
          p: 3,
          m: 2,
          background: 'linear-gradient(135deg, #1976d2 0%, #dc004e 100%)',
          borderRadius: 2,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
              This Month
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              {co2Saved.toFixed(1)} kg
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75, display: 'block' }}>
              CO₂ Saved
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
              Total Trips
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              {ecoFriendlyTrips}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75, display: 'block' }}>
              Eco-friendly
            </Typography>
          </Box>
        </Box>
        {totalTrips > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
            <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="caption">
              {totalTrips} total trip{totalTrips !== 1 ? 's' : ''} recorded
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const NavItem: React.FC<{
    item: typeof mainNavigation[0];
    onClick?: () => void;
  }> = ({ item, onClick }) => {
    const isActive = location.pathname === item.href || 
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

    return (
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          component={Link}
          to={item.href}
          onClick={onClick}
          selected={isActive}
          sx={{
            borderRadius: 1,
            mx: 1,
            '&.Mui-selected': {
              backgroundColor: '#1976d215',
              color: '#1976d2',
              '&:hover': {
                backgroundColor: '#1976d220',
              },
              '& .MuiListItemIcon-root': {
                color: '#1976d2',
              },
            },
            '&:hover': {
              backgroundColor: '#1976d208',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <item.icon />
          </ListItemIcon>
          <ListItemText
            primary={item.name}
            secondary={item.description}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
            }}
            secondaryTypographyProps={{
              fontSize: '0.75rem',
              sx: { opacity: isActive ? 0.8 : 0.7 },
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const drawerWidth = 280;

  const drawerContent = (
    <Box sx={{ width: drawerWidth, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #1976d2 0%, #dc004e 100%)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
            }}
          >
            🌱
          </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#212121',
                textDecoration: 'none',
              }}
            >
              CarbonAware
            </Typography>
        </Link>
      </Box>

      {/* Eco Stats */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <EcoStats />
        
        <List sx={{ px: 1 }}>
          {mainNavigation.map((item) => (
            <NavItem key={item.name} item={item} onClick={isMobile ? onClose : undefined} />
          ))}

          {isAdmin && (
            <>
              <Divider sx={{ my: 2, mx: 2 }} />
              <Box sx={{ px: 2, py: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#757575',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Administration
                </Typography>
              </Box>
              {adminNavigation.map((item) => (
                <NavItem key={item.name} item={item} onClick={isMobile ? onClose : undefined} />
              ))}
            </>
          )}

          <Divider sx={{ my: 2, mx: 2 }} />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#757575',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Account
            </Typography>
          </Box>
          {profileNavigation.map((item) => (
            <NavItem key={item.name} item={item} onClick={isMobile ? onClose : undefined} />
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 2,
            backgroundColor: '#fafafa',
            borderRadius: 1,
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#1976d2',
              fontSize: '0.875rem',
              fontWeight: 600,
              mr: 1,
            }}
          >
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, lineHeight: 1.2, color: '#212121' }}
              noWrap
            >
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#757575', lineHeight: 1.2 }}
              noWrap
            >
              {user?.email}
            </Typography>
          </Box>
          {isAdmin && (
            <Chip
              label="Admin"
              size="small"
              sx={{ 
                ml: 1, 
                fontSize: '0.75rem', 
                height: 20,
                backgroundColor: '#1976d2',
                color: 'white'
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );

  if (variant === 'permanent') {
    return drawerContent;
  }

  return (
    <Drawer
      variant={variant}
      open={isOpen}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 1,
          borderColor: 'divider',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;