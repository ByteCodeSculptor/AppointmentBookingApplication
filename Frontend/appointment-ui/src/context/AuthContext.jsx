import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api'; // We will create this next
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in (persistence)
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');
        if (token) {
            setUser({ token, role, userId });
        }
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userId', data.userId);
            setUser(data);
            
            // Redirect based on role
            if (data.role === 'PROVIDER') navigate('/provider-dashboard');
            else navigate('/client-dashboard');
            
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data || "Login failed" };
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);