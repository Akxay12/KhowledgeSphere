import apiClient from './client';

export const getCurrentUserApi = async () => {
  return apiClient.get('/users/me');
};

export const getUserByIdApi = async (id) => {
  return apiClient.get(`/users/${id}`);
};

export const updateUserProfileApi = async (profileData) => {
  return apiClient.put('/users/me', profileData);
};

export const uploadAvatarApi = async (formData) => {
  return apiClient.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
