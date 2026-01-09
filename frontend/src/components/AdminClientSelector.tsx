import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, ArrowRight } from 'lucide-react';
import { listClients, impersonateClient, type ClientData } from '@/services/adminClientService';
import { useToast } from '@/hooks/useToast';

interface AdminClientSelectorProps {
    onClientSelected?: () => void;
}

export const AdminClientSelector: React.FC<AdminClientSelectorProps> = ({ onClientSelected }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [clients, setClients] = useState<ClientData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setIsLoading(true);
        try {
            const response = await listClients(0, 10);
            setClients(response.data);
        } catch (error) {
            console.error('Error loading clients:', error);
            toast.error('Failed to load clients');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImpersonate = async (client: ClientData) => {
        setIsLoading(true);
        try {
            const response = await impersonateClient(client.id);

            const currentUser = localStorage.getItem('user');
            if (currentUser) {
                localStorage.setItem('adminUser', currentUser);
            }

            const currentToken = document.cookie.match(/access_token=([^;]+)/)?.[1];
            if (currentToken) {
                localStorage.setItem('adminToken', currentToken);
            }

            localStorage.setItem('isImpersonating', 'true');
            localStorage.setItem('impersonatedClient', client.name);

            document.cookie = `isImpersonating=true; path=/; max-age=${60 * 60 * 24 * 7}`;
            document.cookie = `impersonatedClient=${encodeURIComponent(client.name)}; path=/; max-age=${60 * 60 * 24 * 7}`;
            document.cookie = `access_token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;

            const userData = {
                ...JSON.parse(localStorage.getItem('user') || '{}'),
                is_admin: false,
                client_id: client.id,
            };
            localStorage.setItem('user', JSON.stringify(userData));
            document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60 * 60 * 24 * 7}`;

            toast.success(`Now viewing as ${client.name}`);

            // Force page reload to update context
            window.location.reload();
        } catch (error) {
            console.error('Error impersonating client:', error);
            toast.error('Failed to impersonate client');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-2xl bg-[#1a1b26] border-[#282a36]">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-[#bd93f9]/10 rounded-lg border border-[#bd93f9]/40">
                            <Users className="h-6 w-6 text-[#bd93f9]" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl text-[#f8f8f2]">Admin: Select a Client</CardTitle>
                            <CardDescription className="text-[#6272a4]">
                                To manage agents and MCPs, you need to impersonate a client
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        onClick={() => navigate('/clients')}
                        className="w-full bg-[#50fa7b] hover:bg-[#50fa7b]/80 text-[#0b0b11] font-black h-12"
                    >
                        <Users className="mr-2 h-5 w-5" />
                        Go to Clients Page
                    </Button>

                    {clients.length > 0 && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-[#282a36]" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#1a1b26] px-2 text-[#6272a4]">Or quick-select</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {clients.map((client) => (
                                    <div
                                        key={client.id}
                                        className="flex items-center justify-between p-4 bg-[#282a36] rounded-lg border border-[#44475a] hover:border-[#bd93f9] transition-colors"
                                    >
                                        <div>
                                            <p className="font-semibold text-[#f8f8f2]">{client.name}</p>
                                            <p className="text-sm text-[#6272a4]">{client.email}</p>
                                        </div>
                                        <Button
                                            onClick={() => handleImpersonate(client)}
                                            disabled={isLoading}
                                            className="bg-[#bd93f9] text-[#0b0b11] hover:bg-[#bd93f9]/80"
                                        >
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Impersonate
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {isLoading && (
                        <div className="text-center py-8 text-[#6272a4]">
                            Loading clients...
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
