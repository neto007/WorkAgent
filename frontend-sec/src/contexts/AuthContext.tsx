import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getMe } from '@/services/authService';
import type { MeResponse } from '@/types/auth';

interface AuthContextType {
    user: MeResponse | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, refreshToken: string, user: MeResponse) => void;
    logout: () => void;
    updateUser: (user: MeResponse) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<MeResponse | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Check if we have an active session via cookie
                const response = await getMe();
                if (response.data) {
                    setUser(response.data);
                    setToken('cookie-session'); // Dummy value to indicate auth
                    // Try to get refresh_token from localStorage
                    const storedRefreshToken = localStorage.getItem('refresh_token');
                    if (storedRefreshToken) {
                        setRefreshToken(storedRefreshToken);
                    }
                }
            } catch (error) {
                // Session invalid or expired
                setUser(null);
                setToken(null);
                setRefreshToken(null);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = (newToken: string, newRefreshToken: string, newUser: MeResponse) => {
        setToken(newToken || 'cookie-session');
        setRefreshToken(newRefreshToken);
        setUser(newUser);
        // Store refresh_token in localStorage
        localStorage.setItem('refresh_token', newRefreshToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = async () => {
        try {
            // Import logout function
            const { logout: logoutApi } = await import('@/services/authService');
            // Call logout with refresh_token to revoke it
            await logoutApi(refreshToken || undefined);
        } catch (e) {
            console.error(e);
        }
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    };

    const updateUser = (updatedUser: MeResponse) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value: AuthContextType = {
        user,
        token,
        refreshToken,
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
