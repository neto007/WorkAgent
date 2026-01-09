
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTeamMembers, inviteMember, removeMember, updateMemberRole } from "@/services/teamService";
import type { TeamMember } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, UserPlus, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function TeamTab() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("editor");

    const fetchMembers = async () => {
        try {
            const data = await getTeamMembers();
            console.log("Fetched team members:", data);
            if (Array.isArray(data)) {
                setMembers(data);
            } else {
                console.error("Expected array but got:", data);
                setMembers([]);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load team members",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleInvite = async () => {
        try {
            await inviteMember({ email: inviteEmail, role: inviteRole });
            toast({
                title: "Success",
                description: "Invitation sent successfully",
            });
            setInviteOpen(false);
            setInviteEmail("");
            fetchMembers();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to invite user. Check if email exists.",
                variant: "destructive",
            });
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this user?")) return;
        try {
            await removeMember(userId);
            toast({
                title: "Success",
                description: "User removed successfully",
            });
            fetchMembers();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove user",
                variant: "destructive",
            });
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await updateMemberRole(userId, newRole);
            toast({
                title: "Success",
                description: "Role updated successfully",
            });
            fetchMembers();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update role",
                variant: "destructive",
            });
        }
    };

    const canManage = user?.is_admin || user?.role === 'owner' || user?.role === 'admin';

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-[11px] font-black text-[#8be9fd] uppercase tracking-widest">
                    Team_Members
                </h2>
                {canManage && (
                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#bd93f9] text-black hover:bg-[#bd93f9]/90 font-black text-[10px] uppercase tracking-widest">
                                <UserPlus className="mr-2 h-3 w-3" />
                                Invite_Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1b26] border-[#282a36] text-[#f8f8f2]">
                            <DialogHeader>
                                <DialogTitle>Invite Team Member</DialogTitle>
                                <DialogDescription className="text-[#6272a4]">
                                    Add a new user to your organization.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">Email</label>
                                    <Input
                                        placeholder="colleague@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="bg-[#050101] border-[#282a36]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">Role</label>
                                    <Select value={inviteRole} onValueChange={setInviteRole}>
                                        <SelectTrigger className="bg-[#050101] border-[#282a36]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1b26] border-[#282a36]">
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="editor">Editor</SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setInviteOpen(false)} className="border-[#282a36] text-[#f8f8f2] hover:bg-[#282a36]">Cancel</Button>
                                <Button onClick={handleInvite} className="bg-[#bd93f9] text-black hover:bg-[#bd93f9]/90">Send Invite</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="rounded-md border border-[#282a36] bg-[#050101]">
                <Table>
                    <TableHeader>
                        <TableRow className="border-[#282a36] hover:bg-[#1a1b26]">
                            <TableHead className="text-[#6272a4] font-black uppercase tracking-widest text-[10px]">Name</TableHead>
                            <TableHead className="text-[#6272a4] font-black uppercase tracking-widest text-[10px]">Email</TableHead>
                            <TableHead className="text-[#6272a4] font-black uppercase tracking-widest text-[10px]">Role</TableHead>
                            <TableHead className="text-[#6272a4] font-black uppercase tracking-widest text-[10px]">Joined</TableHead>
                            <TableHead className="text-right text-[#6272a4] font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.isArray(members) ? members.map((member) => (
                            <TableRow key={member.id} className="border-[#282a36] hover:bg-[#1a1b26]">
                                <TableCell className="font-mono text-[11px] font-medium">{member.name || '-'}</TableCell>
                                <TableCell className="font-mono text-[11px]">{member.email}</TableCell>
                                <TableCell>
                                    {canManage && member.id !== user?.id ? (
                                        <Select
                                            defaultValue={member.role || 'editor'}
                                            onValueChange={(val) => handleRoleChange(member.id, val)}
                                        >
                                            <SelectTrigger className="h-7 w-[100px] bg-[#1a1b26] border-[#282a36] text-[10px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1a1b26] border-[#282a36]">
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="editor">Editor</SelectItem>
                                                <SelectItem value="viewer">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[9px] font-black uppercase ${(member.role || 'editor') === 'owner'
                                                ? 'bg-[#ffb86c] text-[#282a36] shadow-[0_0_10px_rgba(255,184,108,0.3)]'
                                                : (member.role === 'admin' ? 'bg-[#ff79c6] text-[#282a36]' : 'bg-[#282a36] text-[#f8f8f2]')
                                            }`}>
                                            <Shield className="w-3 h-3 mr-1" />
                                            {member.role || 'editor'}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="font-mono text-[10px] text-[#6272a4]">
                                    {new Date(member.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {canManage && member.id !== user?.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-[#ff5555] hover:text-[#ff5555] hover:bg-[#ff5555]/10"
                                            onClick={() => handleRemove(member.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-[#6272a4] py-4">
                                    No members found or error loading data.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div >
    );
}
