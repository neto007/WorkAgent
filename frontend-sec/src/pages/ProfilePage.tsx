import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { SecurityTab } from "@/components/profile/tabs/SecurityTab";
import { TeamTab } from "@/components/profile/tabs/TeamTab";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) {
        return null;
    }

    return (
        <div className="grid-bg min-h-screen bg-[#050101] text-[#f8f8f2] font-mono p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="text-center mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">
                        User Profile Management
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-[#0b0b11] border border-[#1a1b26] rounded-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[11px] font-black text-[#bd93f9] uppercase tracking-widest">
                            Account_Overview
                        </h2>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 bg-[#ff5555] hover:bg-[#ff5555]/90 text-black font-black py-2 px-4 rounded transition-all shadow-[0_0_15px_rgba(255,85,85,0.3)] text-[9px] uppercase tracking-widest"
                        >
                            <LogOut size={12} />
                            Sign_Out
                        </button>
                    </div>

                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="flex bg-[#1a1b26] p-1 rounded-lg border border-[#282a36] mb-6 w-full">
                            <TabsTrigger
                                value="general"
                                className="flex-1 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(189,147,249,0.3)] text-[#6272a4]"
                            >
                                General
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="flex-1 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(189,147,249,0.3)] text-[#6272a4]"
                            >
                                Security
                            </TabsTrigger>
                            <TabsTrigger
                                value="team"
                                className="flex-1 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(189,147,249,0.3)] text-[#6272a4]"
                            >
                                Team
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="mt-0">
                            <h2 className="text-[11px] font-black text-[#50fa7b] uppercase tracking-widest mb-6">
                                Account_Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Account Email */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                        Email_Address
                                    </label>
                                    <div className="bg-[#050101] border border-[#282a36] rounded px-4 py-3">
                                        <div className="text-[12px] font-mono text-[#f8f8f2]">{user.email}</div>
                                    </div>
                                </div>

                                {/* User ID */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                        User_ID
                                    </label>
                                    <div className="bg-[#050101] border border-[#282a36] rounded px-4 py-3">
                                        <div className="text-[10px] font-mono text-[#f8f8f2] truncate">{user.id}</div>
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                        Access_Level
                                    </label>
                                    <div className="bg-[#050101] border border-[#282a36] rounded px-4 py-3">
                                        <span className="px-2 py-1 rounded text-[9px] font-black uppercase bg-[#bd93f9] text-black">
                                            {user.is_admin ? "Admin" : "User"}
                                        </span>
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                        Account_Status
                                    </label>
                                    <div className="bg-[#050101] border border-[#282a36] rounded px-4 py-3">
                                        <span className="px-2 py-1 rounded text-[9px] font-black uppercase bg-[#50fa7b] text-black">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="security" className="mt-0">
                            <h2 className="text-[11px] font-black text-[#ff79c6] uppercase tracking-widest mb-6">
                                Security_Settings
                            </h2>
                            <SecurityTab />
                        </TabsContent>

                        <TabsContent value="team" className="mt-0">
                            <TeamTab />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
