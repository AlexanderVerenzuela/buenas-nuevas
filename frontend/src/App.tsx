import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SidebarNav } from './components/modules/SidebarNav';
import { Menu } from 'lucide-react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Youth from './pages/Youth';
import YouthProfile from './pages/YouthProfile';
import Meetings from './pages/Meetings';
import Attendance from './pages/Attendance';
import Groups from './pages/Groups';
import Reports from './pages/Reports';
import Birthdays from './pages/Birthdays';
import Profile from './pages/Profile';
import AdminPasswords from './pages/AdminPasswords';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-foreground relative">
      {/* Premium subtle background glow */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background"></div>
      
      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className="font-bold text-white text-xs">BN</span>
          </div>
          <span className="font-bold text-lg text-foreground bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Buenas Nuevas
          </span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Sidebar Navigation */}
      <SidebarNav isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:ml-64 overflow-y-auto min-h-screen pt-20 lg:pt-8 w-full">
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
      <Route path="/birthdays" element={
        <ProtectedRoute>
          <Layout>
            <Birthdays />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/passwords" element={
        <ProtectedRoute>
          <Layout>
            <AdminPasswords />
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
