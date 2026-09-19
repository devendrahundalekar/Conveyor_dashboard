import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import { MonitoringProvider } from './context/MonitoringContext';
import AlertsPage from './pages/AlertsPage';
import Dashboard from './pages/Dashboard';
import InspectionPage from './pages/InspectionPage';
import Login from './pages/Login';

function Protected() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <MonitoringProvider>
      <Layout />
    </MonitoringProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route index element={<Dashboard />} />
        <Route path="inspection" element={<InspectionPage />} />
        <Route path="alerts" element={<AlertsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
