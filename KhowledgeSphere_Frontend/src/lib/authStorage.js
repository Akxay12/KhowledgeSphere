// Auth & User Profile Local Storage Helper for KnowledgeSphere

const STORAGE_KEY_PROFILE = 'knowledgesphere_user_profile';
const STORAGE_KEY_AUTH = 'knowledgesphere_auth_session';

/**
 * Get current stored user profile
 */
export function getStoredUserProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored user profile', e);
    return null;
  }
}

/**
 * Get current auth session details
 */
export function getStoredAuthSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading auth session', e);
    return null;
  }
}

export function isUserAuthenticated() {
  try {
    const session = getStoredAuthSession();
    const profile = getStoredUserProfile();
    if (session && session.isAuthenticated) return true;
    if (profile && (profile.email || profile.username)) return true;
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Checks if the user is a returning user who has already completed onboarding (username set)
 */
export function isReturningUser(emailOrGoogleId) {
  const profile = getStoredUserProfile();
  if (!profile) return false;

  // Check if profile has a valid username set and matches email/googleId or exists
  if (profile.username && profile.username.trim().length > 0 && profile.onboardingCompleted) {
    if (emailOrGoogleId) {
      return profile.email === emailOrGoogleId || profile.googleId === emailOrGoogleId;
    }
    return true;
  }

  return false;
}

/**
 * Saves or updates user profile in localStorage
 */
export function saveUserProfile(profileData) {
  try {
    const existing = getStoredUserProfile() || {};

    const updated = {
      ...existing,
      ...profileData,
      // Formatting
      name: profileData.fullName || profileData.name || existing.name || 'Scholar',
      email: profileData.email || existing.email || '',
      avatarImage: profileData.picture || profileData.avatarImage || existing.avatarImage || '',
      handle: profileData.username ? (profileData.username.startsWith('@') ? profileData.username : `@${profileData.username}`) : (existing.handle || '@scholar'),
      username: profileData.username || existing.username || '',
      googleId: profileData.googleId || existing.googleId || '',
      idToken: profileData.idToken || existing.idToken || null,
      accessToken: profileData.accessToken || existing.accessToken || null,
      onboardingCompleted: true,
      lastLoginAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({
      isAuthenticated: true,
      email: updated.email,
      googleId: updated.googleId,
      idToken: updated.idToken,
      accessToken: updated.accessToken,
      loginAt: updated.lastLoginAt
    }));

    return updated;
  } catch (e) {
    console.error('Error saving user profile', e);
    return null;
  }
}

/**
 * Save temporary Google auth data during onboarding
 */
export function savePendingGoogleUser(googleUser) {
  try {
    sessionStorage.setItem('knowledgesphere_pending_google', JSON.stringify(googleUser));
  } catch (e) {
    console.error('Error saving pending google user', e);
  }
}

export function getPendingGoogleUser() {
  try {
    const raw = sessionStorage.getItem('knowledgesphere_pending_google');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearPendingGoogleUser() {
  try {
    sessionStorage.removeItem('knowledgesphere_pending_google');
  } catch (e) {}
}
