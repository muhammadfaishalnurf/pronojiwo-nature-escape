import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();


export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const normalizeUser = (user) => ({
        ...user,
        // Ubah [{name: "admin", ...}] → ["admin"]
        roles: Array.isArray(user.roles)
            ? user.roles.map(r => typeof r === "string" ? r : r.name)
            : []
    });
    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         api.get('/me')
    //             .then(res => setUser(normalizeUser(res.data.user)))
    //             .catch(() => localStorage.removeItem('token'))
    //             .finally(() => setLoading(false));
    //     } else {
    //         setLoading(false);
    //     }
    // }, []);

    const login = async (email, password) => {
        const res = await api.post('/login', { email, password });
        localStorage.setItem('token', res.data.token);
        const normalized = normalizeUser(res.data.user);
        setUser(normalized);
        return normalized;
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/me')
                .then(res => setUser(normalizeUser(res.data.user)))
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const logout = async () => {
        await api.post('/logout');
        localStorage.removeItem('token');
        setUser(null);
    };

    const hasRole = (role) => user?.roles?.includes(role);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);