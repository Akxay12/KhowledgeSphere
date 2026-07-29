import apiClient from './client';

export const getProfileApi = async (usernameOrId) => {
  return apiClient.get(`/profiles/${usernameOrId}`);
};

export const updateProfileApi = async (profileData) => {
  return apiClient.put('/profiles/me', profileData);
};

export const uploadProfileImageApi = async (formData) => {
  return apiClient.post('/profiles/me/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getUserPublicationsApi = async (userId, tab = 'published') => {
  return apiClient.get(`/profiles/${userId}/publications`, {
    params: { tab }
  });
};
