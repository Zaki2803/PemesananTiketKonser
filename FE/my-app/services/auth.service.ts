import api from './api';

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: async (payload: RegisterPayload) => {
    const response = await api.post('/customer/auth/register', payload);
    return response.data;
  },

  login: async (payload: LoginPayload) => {
    const response = await api.post('/customer/auth/login', payload);
    return response.data;
  },

  sendOtp: async (email: string) => {
    const response = await api.post('/customer/auth/forgot-password', { email });
    return response.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const response = await api.post('/customer/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (email: string, otp: string, new_password: string) => {
    const response = await api.post('/customer/auth/reset-password', { email, otp, new_password });
    return response.data;
  },

  changePassword: async (old_password: string, new_password: string) => {
    const response = await api.put('/customer/profile/password', { old_password, new_password });
    return response.data;
  },

  updateProfile: async (data: { name?: string; phone?: string }) => {
    const response = await api.put('/customer/profile', data);
    return response.data;
  },
};
