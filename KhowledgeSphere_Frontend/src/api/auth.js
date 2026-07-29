import apiClient from './client';

export const loginApi = async (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

export const signupApi = async (userData) => {
  return apiClient.post('/auth/register', userData);
};

export const googleLoginApi = async (googleAuthData) => {
  return apiClient.post('/auth/google', googleAuthData);
};

export const logoutApi = async () => {
  return apiClient.post('/auth/logout');
};

export const refreshTokenApi = async (refreshToken) => {
  return apiClient.post('/auth/refresh-token', { refreshToken });
};
