import apiClient from './client';

export const getBookmarksApi = async () => {
  return apiClient.get('/bookmarks');
};

export const toggleBookmarkApi = async (publicationId) => {
  return apiClient.post(`/bookmarks/${publicationId}`);
};

export const bookmarkApi = {
  getBookmarks: getBookmarksApi,
  addBookmark: toggleBookmarkApi,
  removeBookmark: toggleBookmarkApi
};

export default bookmarkApi;

