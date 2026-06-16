import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import EstateList from '@/pages/EstateList';
import EstateDetail from '@/pages/EstateDetail';
import Scheduling from '@/pages/Scheduling';
import RoomDispatch from '@/pages/RoomDispatch';
import AlertPanel from '@/pages/AlertPanel';
import { useAppStore } from '@/store/useAppStore';
import { fetchAlerts } from '@/api';

function AppRoutes() {
  const { connectWebSocket, disconnectWebSocket, setAlerts } = useAppStore();

  useEffect(() => {
    connectWebSocket();
    fetchAlerts().then((data) => {
      if (Array.isArray(data)) setAlerts(data);
    }).catch(() => {});
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket, setAlerts]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/estates" element={<EstateList />} />
        <Route path="/estate/:id" element={<EstateDetail />} />
        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/rooms" element={<RoomDispatch />} />
        <Route path="/alerts" element={<AlertPanel />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
