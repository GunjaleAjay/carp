import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading } = useAuth();
  const isMobile = useMediaQuery('(max-width:1023px)');

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <LoadingSpinner size="large" />
          <Box sx={{ mt: 2, color: '#757575' }}>
            Loading your eco-friendly dashboard...
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      width: '100%',
      overflow: 'hidden',
    }}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#059669',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#fff',
              secondary: '#059669',
            },
          },
          error: {
            style: {
              background: '#dc2626',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#dc2626',
            },
          },
        }}
      />

      {/* Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: '280px',
            flexShrink: 0,
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 1200,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
          }}
        >
          <Sidebar
            isOpen={true}
            onClose={() => {}}
            variant="permanent"
          />
        </Box>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          variant="temporary"
        />
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflow: 'hidden',
          marginLeft: { lg: '280px' },
        }}
      >
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <Box sx={{
          flexGrow: 1,
          py: 3,
          px: { xs: 2, sm: 3, md: 4 },
          overflow: 'auto',
          width: '100%',
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
