import {
  getPublicationsApi,
  getPublicationByIdApi,
  createPublicationApi,
  updatePublicationApi,
  deletePublicationApi,
  likePublicationApi,
  bookmarkPublicationApi,
  getCommentsApi,
  postCommentApi,
} from '../api/publication';
import { getPapers, getPaper, savePaper, deletePaper } from '../lib/storage';

export const fetchPublications = async (filters = {}) => {
  try {
    const apiData = await getPublicationsApi(filters);
    if (apiData && Array.isArray(apiData)) {
      return { success: true, data: apiData };
    }
  } catch (err) {
    console.warn('Backend API unavailable, loading local stored publications:', err?.message);
  }

  // Fallback to client IndexedDB stored publications
  try {
    const localPapers = await getPapers();
    return { success: true, data: localPapers || [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};

export const fetchPublicationById = async (id) => {
  try {
    const apiPaper = await getPublicationByIdApi(id);
    if (apiPaper) {
      return { success: true, data: apiPaper };
    }
  } catch (err) {
    console.warn('Backend API paper endpoint unavailable, loading local storage:', err?.message);
  }

  try {
    const localPaper = await getPaper(id);
    if (localPaper) {
      return { success: true, data: localPaper };
    }
    return { success: false, data: null, error: 'Publication not found' };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
};

export const publishPaper = async (paperData) => {
  try {
    const apiResponse = await createPublicationApi(paperData);
    if (apiResponse) {
      // Also sync local storage for preview cache
      await savePaper(apiResponse);
      return { success: true, data: apiResponse };
    }
  } catch (err) {
    console.warn('Backend API publish endpoint failed, saving locally:', err?.message);
  }

  try {
    const saved = await savePaper(paperData);
    return { success: true, data: saved };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to save publication' };
  }
};

export const removePublication = async (id) => {
  try {
    await deletePublicationApi(id);
  } catch (err) {
    console.warn('Backend API delete endpoint failed, removing locally:', err?.message);
  }

  try {
    await deletePaper(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const toggleLike = async (id) => {
  try {
    return await likePublicationApi(id);
  } catch (err) {
    return { success: true, toggled: true };
  }
};

export const toggleBookmark = async (id) => {
  try {
    return await bookmarkPublicationApi(id);
  } catch (err) {
    return { success: true, toggled: true };
  }
};

export const fetchComments = async (paperId) => {
  try {
    const comments = await getCommentsApi(paperId);
    return { success: true, data: comments || [] };
  } catch (err) {
    return { success: true, data: [] };
  }
};

export const addComment = async (paperId, commentText) => {
  try {
    const newComment = await postCommentApi(paperId, { text: commentText });
    return { success: true, data: newComment };
  } catch (err) {
    return {
      success: true,
      data: {
        id: `comment-${Date.now()}`,
        text: commentText,
        createdAt: new Date().toISOString(),
      },
    };
  }
};
