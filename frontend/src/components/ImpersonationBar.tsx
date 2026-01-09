import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { UserX } from "lucide-react";

export default function ImpersonationBar() {
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [clientName, setClientName] = useState("");
    const { toast } = useToast();

    const checkImpersonation = () => {
        if (typeof window === 'undefined') return;

        const lsImpersonating = localStorage.getItem('isImpersonating') === 'true';

        const cookieImpersonating = document.cookie
            .split('; ')
            .find(row => row.startsWith('isImpersonating='))
            ?.split('=')[1] === 'true';

        let name = localStorage.getItem('impersonatedClient') || '';

        if (!name) {
            const clientNameCookie = document.cookie
                .split('; ')
                .find(row => row.startsWith('impersonatedClient='));

            if (clientNameCookie) {
                name = decodeURIComponent(clientNameCookie.split('=')[1]);
            }
        }

        setIsImpersonating(lsImpersonating || cookieImpersonating);
        setClientName(name);
    };

    useEffect(() => {
        checkImpersonation();

        const intervalId = setInterval(checkImpersonation, 2000);

        window.addEventListener('storage', checkImpersonation);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', checkImpersonation);
        };
    }, []);

    const handleExitImpersonation = async () => {
        try {
            // Import api (axios instance) dynamically to avoid circular dependencies
            const { default: api } = await import('@/services/api');

            // Call backend to swap cookies (client -> admin)
            await api.post('/api/v1/clients/exit-impersonation');

            // Clear impersonation state from localStorage
            localStorage.removeItem('isImpersonating');
            localStorage.removeItem('impersonatedClient');

            toast.success("Admin session restored successfully!");

            // Force full page reload to refresh AuthContext with restored admin cookie
            window.location.replace('/clients');
        } catch (error: any) {
            console.error("Error exiting impersonation:", error);
            const errorMessage = error.response?.data?.detail || error.message || "Unknown error";
            toast.error(`Failed to restore admin session: ${errorMessage}. Logging out...`);

            // Fallback: clear everything and logout
            localStorage.clear();
            document.cookie.split(";").forEach((c) => {
                document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
            });
            window.location.replace('/login');
        }
    };

    if (!isImpersonating) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#50fa7b] text-[#0b0b11] py-3 px-6 border-t-2 border-[#50fa7b] shadow-[0_-4px_20px_rgba(80,250,123,0.4)]">
            <div className="container mx-auto flex justify-between items-center">
                <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#0b0b11] animate-pulse" />
                    Viewing as client: <span className="text-[#282a36] font-extrabold">{clientName}</span>
                </p>
                <Button
                    onClick={handleExitImpersonation}
                    size="sm"
                    className="bg-[#0b0b11] text-[#50fa7b] hover:bg-[#282a36] hover:text-[#50fa7b] flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(11,11,17,0.5)] border border-[#282a36]"
                >
                    <UserX className="h-4 w-4" />
                    Back to Admin
                </Button>
            </div>
        </div>
    );
}
