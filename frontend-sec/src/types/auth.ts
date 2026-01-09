export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface RegisterResponse {
    id: string;
    email: string;
    name: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface MeResponse {
    email: string;
    id: string;
    client_id: string | null;
    is_active: boolean;
    email_verified: boolean;
    is_admin: boolean;
    role: string;
    created_at: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
}
