// src/routes/RoleRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/ui/LoadingScreen';

export default function RoleRoute({ children, roles }) {
    const { user, loading } = useAuth();

    // Ganti <div>Loading...</div> dengan LoadingScreen
    if (loading) return <LoadingScreen />;

    if (!user) return <Navigate to="/login" replace />;

    const getRoleName = (r) => typeof r === "string" ? r : r?.name || "";
    const userRoles   = (user.roles || []).map(getRoleName);
    const allowed     = roles.some(r => userRoles.includes(r));

    return allowed ? children : <Navigate to="/" replace />;
}