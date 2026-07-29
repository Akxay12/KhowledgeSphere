import apiClient from './client';

export const getPublicationsApi = async (params = {}) => {
  return apiClient.get('/publications', { params });
};

export const getPublicationByIdApi = async (id) => {
  return apiClient.get(`/publications/${id}`);
};

export const createPublicationApi = async (publicationData) => {
  return apiClient.post('/publications', publicationData);
};

export const updatePublicationApi = async (id, publicationData) => {
  return apiClient.put(`/publications/${id}`, publicationData);
};

export const deletePublicationApi = async (id) => {
  return apiClient.delete(`/publications/${id}`);
};

export const likePublicationApi = async (id) => {
  return apiClient.post(`/publications/${id}/like`);
};

export const bookmarkPublicationApi = async (id) => {
  return apiClient.post(`/publications/${id}/bookmark`);
};

export const getCommentsApi = async (publicationId) => {
  return apiClient.get(`/publications/${publicationId}/comments`);
};

export const postCommentApi = async (publicationId, commentData) => {
  return apiClient.post(`/publications/${publicationId}/comments`, commentData);
};
