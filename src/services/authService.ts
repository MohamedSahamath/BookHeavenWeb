// API calls for authentication, profile and addresses.
import api from './api';
import { Address, ApiResponse, User } from '../types';

export interface AuthResult {
  user: User;
  accessToken: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export type AddressInput = Omit<Address, '_id'>;

const authService = {
  register: async (data: RegisterData) => (await api.post<ApiResponse<AuthResult>>('/auth/register', data)).data.data,

  login: async (email: string, password: string) =>
    (await api.post<ApiResponse<AuthResult>>('/auth/login', { email, password })).data.data,

  refresh: async () => (await api.post<ApiResponse<AuthResult>>('/auth/refresh')).data.data,

  logout: async () => {
    await api.post('/auth/logout');
  },

  getMe: async () => (await api.get<ApiResponse<User>>('/auth/me')).data.data,

  updateMe: async (fullName: string) => (await api.patch<ApiResponse<User>>('/auth/me', { fullName })).data.data,

  changePassword: async (currentPassword: string, newPassword: string) =>
    (await api.patch<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword })).data.message,

  forgotPassword: async (identifier: string) =>
    (await api.post<ApiResponse<null>>('/auth/forgot-password', { identifier })).data.message,

  resetPassword: async (token: string, password: string, confirmPassword: string) =>
    (await api.post<ApiResponse<null>>('/auth/reset-password', { token, password, confirmPassword })).data.message,

  requestContactChange: async (type: 'EMAIL' | 'PHONE', value: string) =>
    (await api.post<ApiResponse<null>>('/auth/contact-change/request', { type, value })).data.message,

  verifyContactChange: async (otp: string) =>
    (await api.post<ApiResponse<User>>('/auth/contact-change/verify', { otp })).data.data,

  getAddresses: async () => (await api.get<ApiResponse<Address[]>>('/auth/addresses')).data.data,

  addAddress: async (data: AddressInput) => (await api.post<ApiResponse<Address[]>>('/auth/addresses', data)).data.data,

  updateAddress: async (id: string, data: AddressInput) =>
    (await api.put<ApiResponse<Address[]>>(`/auth/addresses/${id}`, data)).data.data,

  deleteAddress: async (id: string) => (await api.delete<ApiResponse<Address[]>>(`/auth/addresses/${id}`)).data.data,
};

export default authService;