import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getMe } from '@/services/authService';
import type { MeResponse } from '@/types/auth';

interface AuthContextType {
    user: MeResponse | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: MeResponse) => void;
    logout: () => void;
    updateUser: (user: MeResponse) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<MeResponse | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Check if we have an active session via cookie
                const response = await getMe();
                if (response.data) {
                    setUser(response.data);
                    setToken('cookie-session'); // Dummy value to indicate auth
                }
            } catch (error) {
                // Session invalid or expired
                setUser(null);
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = (newToken: string, newUser: MeResponse) => {
        setToken(newToken || 'cookie-session'); // newToken comes from response body, but we might rely on cookie
        setUser(newUser);
        // We do NOT store token in localStorage anymore
        localStorage.setItem('user', JSON.stringify(newUser)); // Optional: cache user info
    };

    const logout = async () => {
        try {
            // Import axios instance to call logout endpoint
            const { default: api } = await import('@/services/api');
            await api.post('/auth/logout');
        } catch (e) {
            console.error(e);
        }
        setToken(null);
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUser = (updatedUser: MeResponse) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
