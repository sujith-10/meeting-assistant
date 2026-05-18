import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewMeeting from './pages/NewMeeting';
import MeetingRoom from './pages/MeetingRoom';
import Summary from './pages/Summary';
import ActionItems from './pages/ActionItems';
import Archive from './pages/Archive';
import Analytics from './pages/Analytics';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <p className="text-gray-400">Loading...</p>
  </div>;
  return user ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/new-meeting" element={<ProtectedRoute><NewMeeting /></ProtectedRoute>} />
      <Route path="/meeting/:id" element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />
      <Route path="/summary/:id" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
      <Route path="/action-items" element={<ProtectedRoute><ActionItems /></ProtectedRoute>} />
      <Route path="/archive" element={<ProtectedRoute><Archive /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}