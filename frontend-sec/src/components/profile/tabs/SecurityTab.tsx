import { useState } from "react";
import * as authService from "@/services/authService";
import { useToast } from "@/hooks/useToast";
import { RefreshCw, Lock } from "lucide-react";

export function SecurityTab() {
    const { toast } = useToast();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Error", {
                description: "New passwords do not match",
            });
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Error", {
                description: "Password must be at least 8 characters long",
            });
            return;
        }

        setIsLoading(true);

        try {
            await authService.changePassword({
                current_password: currentPassword,
                new_password: newPassword
            });

            toast.success("Success", {
                description: "Password changed successfully",
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error("Failed to change password", {
                description: error.response?.data?.detail || "Please verify your current password",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
                <label htmlFor="current-password" className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                    Current_Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#6272a4]" />
                    </div>
                    <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="block w-full pl-10 pr-3 py-3 bg-[#050101] border border-[#282a36] rounded text-[#f8f8f2] placeholder-[#6272a4] focus:outline-none focus:border-[#bd93f9] focus:ring-1 focus:ring-[#bd93f9] transition-all font-mono text-sm disabled:opacity-50"
                        placeholder="••••••••••••"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="new-password" className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                    New_Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#6272a4]" />
                    </div>
                    <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        disabled={isLoading}
                        className="block w-full pl-10 pr-3 py-3 bg-[#050101] border border-[#282a36] rounded text-[#f8f8f2] placeholder-[#6272a4] focus:outline-none focus:border-[#bd93f9] focus:ring-1 focus:ring-[#bd93f9] transition-all font-mono text-sm disabled:opacity-50"
                        placeholder="••••••••••••"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="confirm-password" className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                    Confirm_New_Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#6272a4]" />
                    </div>
                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        disabled={isLoading}
                        className="block w-full pl-10 pr-3 py-3 bg-[#050101] border border-[#282a36] rounded text-[#f8f8f2] placeholder-[#6272a4] focus:outline-none focus:border-[#bd93f9] focus:ring-1 focus:ring-[#bd93f9] transition-all font-mono text-sm disabled:opacity-50"
                        placeholder="••••••••••••"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#ff79c6] hover:bg-[#bd93f9] text-black font-black py-3 px-4 rounded transition-all shadow-[0_0_15px_rgba(255,121,198,0.3)] hover:shadow-[0_0_20px_rgba(189,147,249,0.4)] text-[10px] uppercase tracking-widest disabled:opacity-50"
            >
                {isLoading ? (
                    <>
                        <RefreshCw size={14} className="animate-spin" />
                        Updating...
                    </>
                ) : (
                    <>
                        <Lock size={14} />
                        Update_Password
                    </>
                )}
            </button>
        </form>
    );
}
