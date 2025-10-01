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
import Attendance from './pages/Attendance';
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
                path="/companies"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <div className="text-center py-12">
                        <h1 className="text-2xl font-bold mb-2">Company Settings</h1>
                        <p className="text-muted-foreground">Coming soon...</p>
                      </div>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/general"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <div className="text-center py-12">
                        <h1 className="text-2xl font-bold mb-2">General Settings</h1>
                        <p className="text-muted-foreground">Coming soon...</p>
                      </div>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <div className="text-center py-12">
                        <h1 className="text-2xl font-bold mb-2">Notifications</h1>
                        <p className="text-muted-foreground">Coming soon...</p>
                      </div>
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <div className="text-center py-12">
                        <h1 className="text-2xl font-bold mb-2">Reports</h1>
                        <p className="text-muted-foreground">Coming soon...</p>
                      </div>
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
