import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SidebarNav } from './components/modules/SidebarNav';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Youth from './pages/Youth';
import YouthProfile from './pages/YouthProfile';
import Leaders from './pages/Leaders';
import Meetings from './pages/Meetings';
import Attendance from './pages/Attendance';
import Groups from './pages/Groups';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-foreground">
      {/* Premium subtle background glow */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background"></div>
      <SidebarNav />
      <main className="flex-1 p-8 lg:ml-64 overflow-y-auto min-h-screen">
        <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/youth" element={
        <ProtectedRoute>
          <Layout>
            <Youth />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/youth/:id" element={
        <ProtectedRoute>
          <Layout>
            <YouthProfile />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/leaders" element={
        <ProtectedRoute>
          <Layout>
            <Leaders />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/meetings" element={
        <ProtectedRoute>
          <Layout>
            <Meetings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/meetings/:meetingId/attendance" element={
        <ProtectedRoute>
          <Layout>
            <Attendance />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/groups" element={
        <ProtectedRoute>
          <Layout>
            <Groups />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout>
            <Reports />
          </Layout>
        </ProtectedRoute>
      } />
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
