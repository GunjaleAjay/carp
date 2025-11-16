import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { StyledEngineProvider } from '@mui/material/styles';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from './theme/ThemeProvider';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Main Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/VehiclesPage';
import RoutePlanningPage from './pages/RoutePlanningPage';
import TripsPage from './pages/TripsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import RealTimeMapPage from './pages/RealTimeMapPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEmissionFactorsPage from './pages/admin/AdminEmissionFactorsPage';
import AdminLogsPage from './pages/admin/AdminLogsPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        }
      />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Home redirect */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Main App Routes */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="routes" element={<RoutePlanningPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="realtime-map" element={<RealTimeMapPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Admin Routes */}
        <Route path="admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="admin/emission-factors" element={<AdminRoute><AdminEmissionFactorsPage /></AdminRoute>} />
        <Route path="admin/logs" element={<AdminRoute><AdminLogsPage /></AdminRoute>} />
      </Route>

      {/* Fallback Routes */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <div className="App">
                <AppRoutes />
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
                    loading: {
                      style: {
                        background: '#2563eb',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
