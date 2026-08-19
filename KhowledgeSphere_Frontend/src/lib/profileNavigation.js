import { getStoredUserProfile } from './authStorage';

// Simple runtime scroll position cache
const scrollPositions = {
  home: 0,
  search: 0
};

// Persistent cache for page states
const pageCache = {
  home: null,
  explore: null
};

// Navigation history tracking
let currentPath = '';
let prevPath = '';

export const recordNavigation = (path) => {
  if (currentPath && currentPath !== path) {
    prevPath = currentPath;
  }
  currentPath = path;
};

export const getPreviousPath = () => prevPath;

export const savePageCache = (page, data) => {
  if (page === 'home' || page === '/home') {
    pageCache.home = data;
  } else if (page === 'explore' || page === '/explore') {
    pageCache.explore = data;
  }
};

export const getPageCache = (page) => {
  if (page === 'home' || page === '/home') {
    return pageCache.home;
  } else if (page === 'explore' || page === '/explore') {
    return pageCache.explore;
  }
  return null;
};

export const clearPageCache = (page) => {
  if (page === 'home' || page === '/home') {
    pageCache.home = null;
  } else if (page === 'explore' || page === '/explore') {
    pageCache.explore = null;
  }
};

export const saveScrollPosition = (page, scrollY) => {
  if (page === 'home' || page === '/home') {
    scrollPositions.home = scrollY;
  } else if (page === 'explore' || page === '/explore') {
    scrollPositions.search = scrollY;
  }
};

export const getScrollPosition = (page) => {
  if (page === 'home' || page === '/home') {
    return scrollPositions.home;
  } else if (page === 'explore' || page === '/explore') {
    return scrollPositions.search;
  }
  return 0;
};

export const clearScrollPosition = (page) => {
  if (page === 'home' || page === '/home') {
    scrollPositions.home = 0;
  } else if (page === 'explore' || page === '/explore') {
    scrollPositions.search = 0;
  }
};

/**
 * Centered navigation helper for routing users to profiles.
 * Determines if the clicked user is the logged-in user or a public user.
 * 
 * @param {function} navigate - React Router navigate function
 * @param {string|number} targetUserId - User ID of the profile to open
 */
export const handleProfileNavigate = (navigate, targetUserId) => {
  if (!targetUserId) return;
  
  const currentUser = getStoredUserProfile();
  const currentUserId = currentUser?.userId || currentUser?.id;
  const fromPath = window.location.pathname + window.location.search;
  
  // Save current scroll position
  saveScrollPosition(window.location.pathname, window.scrollY);
  
  if (currentUserId && String(targetUserId) === String(currentUserId)) {
    navigate('/profile');
  } else {
    navigate(`/profile/${targetUserId}`, { state: { from: fromPath } });
  }
};
