import apiClient from './client';

export const getFollowingApi = async () => {
  return apiClient.get('/follows/following');
};

export const toggleFollowApi = async (userId) => {
  return apiClient.post(`/follows/${userId}`);
};
