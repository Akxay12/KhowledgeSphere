import apiClient from './client';

export const getPublicationsApi = async (params = {}) => {
  return apiClient.get('/public/publications/feed', { params });
};

export const getPublicationByIdApi = async (id) => {
  return apiClient.get(`/public/publications/${id}`);
};

export const createPublicationApi = async (publicationData) => {
  return apiClient.post('/publications/publish', publicationData);
};

export const updatePublicationApi = async (id, publicationData) => {
  return apiClient.put(`/publications/${id}`, publicationData);
};

export const deletePublicationApi = async (id) => {
  return apiClient.delete(`/publications/${id}`);
};

export const likePublicationApi = async (id) => {
  return apiClient.post(`/likes/${id}`);
};

export const getLikesApi = async () => {
  return apiClient.get('/likes');
};

export const bookmarkPublicationApi = async (id) => {
  return apiClient.post(`/publications/${id}/bookmark`);
};

export const getCommentsApi = async (publicationId) => {
  return apiClient.get(`/public/comments/${publicationId}`);
};

export const postCommentApi = async (publicationId, commentData) => {
  return apiClient.post(`/comments/${publicationId}`, commentData);
};

export const deleteCommentApi = async (commentId) => {
  return apiClient.delete(`/comments/${commentId}`);
};

export const getPublicationsByUserApi = async (userId) => {
  return apiClient.get(`/public/user/${userId}`);
};

export const getMyPublicationsApi = async () => {
  return apiClient.get('/publications/my');
};

export const searchPublicationsApi = async (params = {}) => {
  return apiClient.get('/public/search', { params });
};

export const searchGlobalApi = async (query) => {
  return apiClient.get('/api/search', { params: { q: query } });
};

