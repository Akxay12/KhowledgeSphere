import apiClient from './client';

export const getCurrentUserApi = async () => {
  return apiClient.get('/users/me');
};

export const getUserByIdApi = async (id) => {
  return apiClient.get(`/public/users/${id}`);
};

export const updateUserProfileApi = async (profileData) => {
  return apiClient.put('/users/profile', profileData);
};

export const uploadProfilePictureApi = async (formData) => {
  return apiClient.post('/users/profile/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getProfilePictureApi = async (id) => {
  return apiClient.get(`/public/${id}/picture`, { responseType: 'blob' });
};

