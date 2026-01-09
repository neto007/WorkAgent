import React, { type ReactNode, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ImpersonationBar from '../ImpersonationBar';

interface AppLayoutProps {
    children?: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const [isImpersonating, setIsImpersonating] = useState(false);

    useEffect(() => {
        const checkImpersonation = () => {
            const lsImpersonating = localStorage.getItem('isImpersonating') === 'true';
            const cookieImpersonating = document.cookie
                .split('; ')
                .find(row => row.startsWith('isImpersonating='))
                ?.split('=')[1] === 'true';
            setIsImpersonating(lsImpersonating || cookieImpersonating);
        };

        checkImpersonation();
        const intervalId = setInterval(checkImpersonation, 2000);
        window.addEventListener('storage', checkImpersonation);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', checkImpersonation);
        };
    }, []);

    return (
        <div className="grid-bg h-screen bg-[#050101] text-[#f8f8f2] flex flex-col overflow-hidden">
            <Header />
            <main
                className="flex-1 overflow-y-auto custom-scrollbar"
                style={{ paddingBottom: isImpersonating ? '60px' : '0' }}
            >
                {children || <Outlet />}
            </main>
            {!isImpersonating && <Footer />}
            <ImpersonationBar />
        </div>
    );
};

export default AppLayout;
