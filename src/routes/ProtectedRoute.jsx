// src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    // Ganti <div>Loading...</div> dengan LoadingScreen
    if (loading) return <LoadingScreen />;

    return user ? children : <Navigate to="/login" replace />;
}