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
  deleteCommentApi,
  getPublicationsByUserApi,
  getMyPublicationsApi,
  searchPublicationsApi,
  searchGlobalApi,
} from '../api/publication';
import { getPapers, getPaper, savePaper, deletePaper } from '../lib/storage';
import { formatEnumToLabel } from '../lib/formatters';

const parseContent = (contentString) => {
  let blocks = [];
  let docReferences = [];
  if (contentString) {
    try {
      const parsed = JSON.parse(contentString);
      if (Array.isArray(parsed)) {
        blocks = parsed;
      } else if (parsed && typeof parsed === 'object') {
        blocks = parsed.blocks || [];
        docReferences = parsed.docReferences || [];
      }
    } catch (e) {
      console.error('Failed to parse content as JSON:', e);
    }
  }
  return { blocks, docReferences };
};

export const fetchPublications = async (filters = {}) => {
  try {
    const apiData = await getPublicationsApi(filters);
    if (apiData && Array.isArray(apiData)) {
      const mappedData = apiData.map(item => {
        const { blocks, docReferences } = parseContent(item.content);
        return {
          ...item,
          id: item.publicationId || item.id,
          title: item.title,
          subtitle: item.subtitle,
          abstract: item.subtitle || item.abstract,
          coverImage: item.coverImageUrl || item.coverImage,
          authors: item.authorName || item.authors,
          language: item.language,
          type: formatEnumToLabel(item.publicationType || item.type),
          category: formatEnumToLabel(item.category || item.field),
          field: formatEnumToLabel(item.category || item.field),
          publishedDate: item.publishedAt || item.publishedDate,
          year: item.publishedAt ? new Date(item.publishedAt).getFullYear().toString() : (item.year || '2026'),
          blocks: blocks,
          docReferences: docReferences
        };
      });
      return { success: true, data: mappedData };
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
      const { blocks, docReferences } = parseContent(apiPaper.content);
      const mappedPaper = {
        ...apiPaper,
        id: apiPaper.publicationId || apiPaper.id,
        title: apiPaper.title,
        subtitle: apiPaper.subtitle,
        coverImage: apiPaper.coverImageUrl || apiPaper.coverImage,
        authors: apiPaper.authorName || apiPaper.authors,
        language: apiPaper.language,
        type: formatEnumToLabel(apiPaper.publicationType || apiPaper.type),
        category: formatEnumToLabel(apiPaper.category || apiPaper.field),
        field: formatEnumToLabel(apiPaper.category || apiPaper.field),
        publishedDate: apiPaper.publishedAt || apiPaper.publishedDate,
        year: apiPaper.publishedAt ? new Date(apiPaper.publishedAt).getFullYear().toString() : (apiPaper.year || '2026'),
        blocks: blocks,
        docReferences: docReferences
      };
      return { success: true, data: mappedPaper };
    }
  } catch (err) {
    console.warn('Backend API paper endpoint failed:', err);
    if (err.status === 404) {
      return { success: false, data: null, error: 'Research Not Found', status: 404 };
    }
  }

  try {
    const localPaper = await getPaper(id);
    if (localPaper) {
      return { success: true, data: localPaper };
    }
    return { success: false, data: null, error: 'Research Not Found', status: 404 };
  } catch (err) {
    return { success: false, data: null, error: err.message, status: 500 };
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
    console.error('Backend API delete endpoint failed:', err?.message);
    return { success: false, error: err?.message || 'Failed to delete from backend API' };
  }

  try {
    await deletePaper(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const toggleLike = async (id) => {
  return await likePublicationApi(id);
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
    console.error("fetchComments service error:", err);
    return { success: false, error: err, data: [] };
  }
};

export const addComment = async (paperId, commentText) => {
  try {
    const newComment = await postCommentApi(paperId, { content: commentText });
    return { success: true, data: newComment };
  } catch (err) {
    console.error("addComment service error:", err);
    return { success: false, error: err };
  }
};

export const deleteComment = async (commentId) => {
  try {
    await deleteCommentApi(commentId);
    return { success: true };
  } catch (err) {
    console.error("deleteComment service error:", err);
    return { success: false, error: err };
  }
};

export const fetchPublicationsByUser = async (userId) => {
  try {
    const apiData = await getPublicationsByUserApi(userId);
    if (apiData && Array.isArray(apiData)) {
      const mappedData = apiData.map(item => {
        const { blocks, docReferences } = parseContent(item.content);
        return {
          ...item,
          id: item.publicationId || item.id,
          title: item.title,
          subtitle: item.subtitle,
          abstract: item.subtitle || item.abstract,
          coverImage: item.coverImageUrl || item.coverImage,
          authors: item.authorName || item.authors,
          language: item.language,
          type: formatEnumToLabel(item.publicationType || item.type),
          category: formatEnumToLabel(item.category || item.field),
          field: formatEnumToLabel(item.category || item.field),
          publishedDate: item.publishedAt || item.publishedDate,
          year: item.publishedAt ? new Date(item.publishedAt).getFullYear().toString() : (item.year || '2026'),
          blocks: blocks,
          docReferences: docReferences
        };
      });
      return { success: true, data: mappedData };
    }
  } catch (err) {
    console.warn(`Backend API user publications endpoint failed for user ${userId}:`, err?.message);
  }
  return { success: false, data: [] };
};

export const fetchMyPublications = async () => {
  try {
    const apiData = await getMyPublicationsApi();
    if (apiData && Array.isArray(apiData)) {
      const mappedData = apiData.map(item => {
        const { blocks, docReferences } = parseContent(item.content);
        return {
          ...item,
          id: item.publicationId || item.id,
          title: item.title,
          subtitle: item.subtitle,
          abstract: item.subtitle || item.abstract,
          coverImage: item.coverImageUrl || item.coverImage,
          authors: item.authorName || item.authors,
          language: item.language,
          type: formatEnumToLabel(item.publicationType || item.type),
          category: formatEnumToLabel(item.category || item.field),
          field: formatEnumToLabel(item.category || item.field),
          publishedDate: item.publishedAt || item.publishedDate,
          year: item.publishedAt ? new Date(item.publishedAt).getFullYear().toString() : (item.year || '2026'),
          blocks: blocks,
          docReferences: docReferences
        };
      });
      return { success: true, data: mappedData };
    }
  } catch (err) {
  }
  return { success: false, data: [] };
};

export const searchPublications = async (filters = {}) => {
  try {
    const apiData = await searchPublicationsApi(filters);
    if (apiData && Array.isArray(apiData)) {
      const mappedData = apiData.map(item => {
        const { blocks, docReferences } = parseContent(item.content);
        return {
          ...item,
          id: item.publicationId || item.id,
          title: item.title,
          subtitle: item.subtitle,
          abstract: item.subtitle || item.abstract,
          coverImage: item.coverImageUrl || item.coverImage,
          authors: item.authorName || item.authors,
          language: item.language,
          type: formatEnumToLabel(item.publicationType || item.type),
          category: formatEnumToLabel(item.category || item.field),
          field: formatEnumToLabel(item.category || item.field),
          publishedDate: item.publishedAt || item.publishedDate,
          year: item.publishedAt ? new Date(item.publishedAt).getFullYear().toString() : (item.year || '2026'),
          blocks: blocks,
          docReferences: docReferences
        };
      });
      return { success: true, data: mappedData };
    }
  } catch (err) {
    console.warn('Backend search API failed:', err?.message);
    return { success: false, data: [], error: err.message || 'Search failed' };
  }
  return { success: false, data: [] };
};

export const searchGlobal = async (query) => {
  try {
    const apiData = await searchGlobalApi(query);
    if (apiData) {
      const researches = apiData.researches || [];
      const users = apiData.users || [];
      
      const mappedResearches = researches.map(item => {
        const { blocks, docReferences } = parseContent(item.content);
        return {
          ...item,
          id: item.publicationId || item.id,
          title: item.title,
          subtitle: item.subtitle,
          abstract: item.subtitle || item.abstract,
          coverImage: item.coverImageUrl || item.coverImage,
          authors: item.authorName || item.authors,
          language: item.language,
          type: formatEnumToLabel(item.publicationType || item.type),
          category: formatEnumToLabel(item.category || item.field),
          field: formatEnumToLabel(item.category || item.field),
          publishedDate: item.publishedAt || item.publishedDate,
          year: item.publishedAt ? new Date(item.publishedAt).getFullYear().toString() : (item.year || '2026'),
          blocks: blocks,
          docReferences: docReferences
        };
      });

      return {
        success: true,
        data: {
          researches: mappedResearches,
          users: users
        }
      };
    }
  } catch (err) {
    console.warn('Global search API failed:', err?.message);
    return { success: false, error: err.message || 'Search failed' };
  }
  return { success: false, data: { researches: [], users: [] } };
};


