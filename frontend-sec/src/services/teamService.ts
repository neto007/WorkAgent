import api from './api';
import type { TeamMember, UserInvite } from '@/types/team';

// We export them so other files don't break immediately, or we update them too.
// Actually, better to remove the export from here and force update users, but for now let's just use them.
// Wait, if I remove them, I break imports.
// I should NOT re-export them if the goal is to fix ambiguous exports.
// I will just use them in the functions.


export const getTeamMembers = async (): Promise<TeamMember[]> => {
    const response = await api.get('/client/users/');
    return response.data;
};

export const inviteMember = async (data: UserInvite): Promise<TeamMember> => {
    const response = await api.post('/client/users/invite', data);
    return response.data;
};

export const removeMember = async (userId: string): Promise<void> => {
    await api.delete(`/client/users/${userId}`);
};

export const updateMemberRole = async (userId: string, role: string): Promise<TeamMember> => {
    const response = await api.patch(`/client/users/${userId}/role`, null, { params: { role } });
    return response.data;
};
