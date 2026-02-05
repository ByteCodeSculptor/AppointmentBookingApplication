import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; // Import this
import ProviderDashboard from './pages/ProviderDashboard';
import ClientDashboard from './pages/ClientDashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/provider-dashboard" element={<ProviderDashboard />} />
      <Route path="/client-dashboard" element={<ClientDashboard />} /> {/* Add this */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;