import React, { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ClientContextType {
    clientId: string | null;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    const value: ClientContextType = {
        clientId: user?.client_id || null,
    };

    return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};

export const useClient = () => {
    const context = useContext(ClientContext);
    if (context === undefined) {
        throw new Error('useClient must be used within a ClientProvider');
    }
    return context;
};
