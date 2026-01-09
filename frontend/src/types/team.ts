export interface TeamMember {
    id: string;
    email: string;
    name: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

export interface UserInvite {
    email: string;
    role: string;
}
