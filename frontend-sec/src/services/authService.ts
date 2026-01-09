import api from './api';
import type { LoginRequest, LoginResponse, MeResponse, RegisterRequest, RegisterResponse, ForgotPasswordRequest } from '@/types/auth';

export const login = (data: LoginRequest) =>
    api.post<LoginResponse>('/api/v1/auth/login', data);

export const register = (data: RegisterRequest) =>
    api.post<RegisterResponse>('/api/v1/auth/register', data);

export const forgotPassword = (data: ForgotPasswordRequest) =>
    api.post('/api/v1/auth/forgot-password', data);

export const getMe = () =>
    api.post<MeResponse>('/api/v1/auth/me');

export const changePassword = (data: import('@/types/auth').ChangePasswordRequest) =>
    api.post('/api/v1/auth/change-password', data);
