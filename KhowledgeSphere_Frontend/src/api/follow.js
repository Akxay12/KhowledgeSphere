import apiClient from './client';

export const getFollowersApi = async (userId) => {
  return apiClient.get(`/users/${userId}/followers`);
};

export const getFollowingApi = async (userId) => {
  return apiClient.get(`/users/${userId}/following`);
};

export const toggleFollowApi = async (targetUserId) => {
  return apiClient.post(`/users/${targetUserId}/follow`);
};
