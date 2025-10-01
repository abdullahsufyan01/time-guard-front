import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Users from './pages/Users';
import UserForm from './pages/users/UserForm';
import Attendance from './pages/Attendance';
import AttendanceEdit from './pages/attendance/AttendanceEdit';
import CompanySettings from './pages/settings/CompanySettings';
import GeneralSettings from './pages/settings/GeneralSettings';
import PayrollSettings from './pages/settings/PayrollSettings';
import GeolocationSettings from './pages/settings/GeolocationSettings';
import Billing from './pages/Billing';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Timesheets from './pages/Timesheets';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Users />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/new"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <UserForm />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/:id/edit"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <UserForm />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Attendance />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance/:id/edit"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <AttendanceEdit />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/companies"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CompanySettings />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/general"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <GeneralSettings />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/payroll"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PayrollSettings />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/geolocation"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <GeolocationSettings />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Billing />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Notifications />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Reports />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timesheets"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Timesheets />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
