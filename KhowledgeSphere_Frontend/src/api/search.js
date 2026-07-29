import apiClient from './client';

export const searchPublicationsApi = async (query, filters = {}) => {
  return apiClient.get('/search', {
    params: { q: query, ...filters }
  });
};

export const getSearchSuggestionsApi = async (query) => {
  return apiClient.get('/search/suggestions', {
    params: { q: query }
  });
};
