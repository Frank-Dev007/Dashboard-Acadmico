import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';

// Auth pages
import LoginPage from './components/auth/LoginPage';
import RecoverPasswordPage from './components/auth/RecoverPasswordPage';

// Student pages
import StudentDashboard from './components/student/StudentDashboard';
import StudentPerformance from './components/student/StudentPerformance';
import StudentParticipation from './components/student/StudentParticipation';
import StudentHabits from './components/student/StudentHabits';
import StudentAlerts from './components/student/StudentAlerts';

// Teacher pages
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherActivities from './components/teacher/TeacherActivities';
import TeacherEvaluations from './components/teacher/TeacherEvaluations';
import TeacherRiskMap from './components/teacher/TeacherRiskMap';
import TeacherReports from './components/teacher/TeacherReports';

// Admin pages
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminBulkUpload from './components/admin/AdminBulkUpload';
import AdminSettings from './components/admin/AdminSettings';
import AdminReports from './components/admin/AdminReports';

// Jefe de Departamento pages (independientes del admin)
import JefeDepartamentoDashboard from './components/jefedepartamento/JefeDepartamentoDashboard';
import JefeDepartamentoUsers from './components/jefedepartamento/JefeDepartamentoUsers';
import JefeDepartamentoGestionDocente from './components/jefedepartamento/JefeDepartamentoGestionDocente';
import JefeDepartamentoMovimientos from './components/jefedepartamento/JefeDepartamentoMovimientos';
import JefeDepartamentoBulkUpload from './components/jefedepartamento/JefeDepartamentoBulkUpload';
import JefeDepartamentoSettings from './components/jefedepartamento/JefeDepartamentoSettings';
import JefeDepartamentoReports from './components/jefedepartamento/JefeDepartamentoReports';

// Common pages
import ProfilePage from './components/common/ProfilePage';
import NotFoundPage from './components/common/NotFoundPage';
import OfflinePage from './components/common/OfflinePage';
import SplashScreen from './components/common/SplashScreen';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'admin' | 'jefedepartamento' | null>(null);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Check for stored auth
      const storedAuth = localStorage.getItem('auth');
      const storedRole = localStorage.getItem('userRole');
      if (storedAuth === 'true' && storedRole) {
        setIsAuthenticated(true);
        setUserRole(storedRole as 'student' | 'teacher' | 'admin' | 'jefedepartamento');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (role: 'student' | 'teacher' | 'admin' | 'jefedepartamento') => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('auth', 'true');
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('auth');
    localStorage.removeItem('userRole');
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={`/${userRole}`} replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          } 
        />
        <Route path="/recover-password" element={<RecoverPasswordPage />} />

        {/* Student routes */}
        <Route
          path="/student/*"
          element={
            isAuthenticated && userRole === 'student' ? (
              <DashboardLayout role="student" onLogout={handleLogout}>
                <Routes>
                  <Route index element={<StudentDashboard />} />
                  <Route path="performance" element={<StudentPerformance />} />
                  <Route path="participation" element={<StudentParticipation />} />
                  <Route path="habits" element={<StudentHabits />} />
                  <Route path="alerts" element={<StudentAlerts />} />
                  <Route path="profile" element={<ProfilePage role="student" onLogout={handleLogout} />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Teacher routes */}
        <Route
          path="/teacher/*"
          element={
            isAuthenticated && userRole === 'teacher' ? (
              <DashboardLayout role="teacher" onLogout={handleLogout}>
                <Routes>
                  <Route index element={<TeacherDashboard />} />
                  <Route path="activities" element={<TeacherActivities />} />
                  <Route path="evaluations" element={<TeacherEvaluations />} />
                  <Route path="risk-map" element={<TeacherRiskMap />} />
                  <Route path="reports" element={<TeacherReports />} />
                  <Route path="profile" element={<ProfilePage role="teacher" onLogout={handleLogout} />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            isAuthenticated && userRole === 'admin' ? (
              <DashboardLayout role="admin" onLogout={handleLogout}>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="bulk-upload" element={<AdminBulkUpload />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="profile" element={<ProfilePage role="admin" onLogout={handleLogout} />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Jefe de Departamento routes */}
        <Route
          path="/jefedepartamento/*"
          element={
            isAuthenticated && userRole === 'jefedepartamento' ? (
              <DashboardLayout role="jefedepartamento" onLogout={handleLogout}>
                <Routes>
                  <Route index element={<JefeDepartamentoDashboard />} />
                  <Route path="users" element={<JefeDepartamentoUsers />} />
                  <Route path="gestion-docente" element={<JefeDepartamentoGestionDocente />} />
                  <Route path="movimientos" element={<JefeDepartamentoMovimientos />} />
                  <Route path="bulk-upload" element={<JefeDepartamentoBulkUpload />} />
                  <Route path="settings" element={<JefeDepartamentoSettings />} />
                  <Route path="reports" element={<JefeDepartamentoReports />} />
                  <Route path="profile" element={<ProfilePage role="jefedepartamento" onLogout={handleLogout} />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Common routes */}
        <Route path="/offline" element={<OfflinePage />} />
        <Route path="/404" element={<NotFoundPage />} />
        
        {/* Default redirects */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to={`/${userRole}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
