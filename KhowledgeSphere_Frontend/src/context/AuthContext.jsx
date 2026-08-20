import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUserProfile, getStoredAuthSession, saveUserProfile, isUserAuthenticated } from '../lib/authStorage';
import { loginApi, signupApi, googleLoginApi, logoutApi } from '../api/auth';
import { getCurrentUserApi, getProfilePictureApi, updateUserProfileApi } from '../api/user';
import { getFollowingApi, toggleFollowApi } from '../api/follows';
import { getLikesApi } from '../api/publication';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUserProfile());
  const [session, setSession] = useState(() => getStoredAuthSession());
  const [isAuthenticated, setIsAuthenticated] = useState(() => isUserAuthenticated());
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [likedPublicationIds, setLikedPublicationIds] = useState(new Set());

  const fetchFollowingList = async () => {
    try {
      const response = await getFollowingApi();
      const ids = Array.isArray(response) ? response : [];
      setFollowingIds(new Set(ids.map(id => parseInt(id, 10))));
    } catch (e) {
      console.warn('Error fetching following list:', e);
    }
  };

  const fetchLikedList = async () => {
    try {
      const response = await getLikesApi();
      const ids = Array.isArray(response) ? response : [];
      setLikedPublicationIds(new Set(ids.map(String)));
    } catch (e) {
      console.warn('Error fetching liked list:', e);
    }
  };

  const toggleFollow = async (userId) => {
    try {
      const response = await toggleFollowApi(userId);
      const isFollowing = response?.following;
      setFollowingIds(prev => {
        const next = new Set(prev);
        const intId = parseInt(userId, 10);
        if (isFollowing) {
          next.add(intId);
        } else {
          next.delete(intId);
        }
        return next;
      });
      return response;
    } catch (error) {
      console.error('Error toggling follow:', error);
      throw error;
    }
  };

  const fetchProfilePicture = async (userId) => {
    if (!userId) return;
    try {
      const avatarBlob = await getProfilePictureApi(userId);
      if (avatarBlob && avatarBlob.size > 0) {
        const avatarUrl = URL.createObjectURL(avatarBlob);
        setUser(prev => prev ? { ...prev, avatarImage: avatarUrl } : null);
      }
    } catch (e) {
      // Ignore API errors, fallback to placeholder
    }
  };

  const fetchProfileImages = async (userId) => {
    await fetchProfilePicture(userId);
  };


  // Initialize Auth state from local cache or API validation
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const rawUser = localStorage.getItem('loggedInUser');

        if (token && rawUser) {
          setIsAuthenticated(true);
          const parsedUser = JSON.parse(rawUser);
          setUser(parsedUser);

          const userId = parsedUser?.userId || parsedUser?.id;
          if (userId) {
            fetchProfileImages(userId);
          }

          // Fetch follow list
          await fetchFollowingList();

          // Fetch liked list
          await fetchLikedList();

          // Optionally validate with backend API
          try {
            const freshUser = await getCurrentUserApi();
            if (freshUser) {
              localStorage.setItem('loggedInUser', JSON.stringify(freshUser));
              setUser(freshUser);
              const freshUserId = freshUser?.userId || freshUser?.id;
              if (freshUserId) {
                fetchProfileImages(freshUserId);
              }
            }
          } catch (e) {
            console.warn('Error validating user session on mount:', e);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Error initializing AuthContext:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Call backend REST API endpoint
      const response = await loginApi({ email, password });
      
      const token = response?.token || response?.data?.token;
      if (token) {
        localStorage.setItem('token', token);
        console.log("Stored Token:", localStorage.getItem("token"));
      }

      // Store the exact returned user object in localStorage using the key loggedInUser
      localStorage.setItem('loggedInUser', JSON.stringify(response));

      setUser(response);
      setIsAuthenticated(true);
      
      const userId = response?.userId || response?.id;
      if (userId) {
        fetchProfileImages(userId);
      }

      // Handle default/entered profession for newly registered users
      const username = response?.username;
      if (username) {
        const pendingProfession = localStorage.getItem(`reg_prof_${username}`);
        if (pendingProfession) {
          try {
            const requestPayload = {
              name: response.name || response.fullName || '',
              profession: pendingProfession,
              bio: response.bio || '',
              location: response.location || '',
              linkedinUrl: response.linkedinUrl || response.linkdinUrl || ''
            };
            const updatedUser = await updateUserProfileApi(requestPayload);
            // Merge updated user data
            const mergedUser = {
              ...response,
              ...updatedUser
            };
            localStorage.setItem('loggedInUser', JSON.stringify(mergedUser));
            setUser(mergedUser);
          } catch (updateError) {
            console.error("Failed to automatically update profession on first login:", updateError);
          } finally {
            localStorage.removeItem(`reg_prof_${username}`);
          }
        }
      }

      // Fetch following list
      await fetchFollowingList();

      // Fetch liked list
      await fetchLikedList();

      return { success: true, user: response };
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      // Calls backend signup endpoint which returns plain string response on success
      const response = await signupApi(userData);
      // Store the desired default/entered profession in local storage
      localStorage.setItem(`reg_prof_${userData.username}`, userData.profession?.trim() || 'Researcher and Writer');
      return response;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async (googleAuthData) => {
    try {
      const response = await googleLoginApi(googleAuthData);
      const userProfile = response.user || response;
      const token = response.token || response.accessToken;
      if (token) {
        localStorage.setItem('token', token);
      }

      // Handle default/entered profession for newly registered users on Google Authentication
      const username = userProfile.username;
      if (username) {
        const pendingProfession = localStorage.getItem(`reg_prof_${username}`);
        if (pendingProfession) {
          try {
            const requestPayload = {
              name: userProfile.name || userProfile.fullName || '',
              profession: pendingProfession,
              bio: userProfile.bio || '',
              location: userProfile.location || '',
              linkedinUrl: userProfile.linkedinUrl || userProfile.linkdinUrl || ''
            };
            const updatedUser = await updateUserProfileApi(requestPayload);
            Object.assign(userProfile, updatedUser);
          } catch (updateError) {
            console.error("Failed to automatically update profession on first login:", updateError);
          } finally {
            localStorage.removeItem(`reg_prof_${username}`);
          }
        }
      }

      localStorage.setItem('loggedInUser', JSON.stringify(userProfile));
      setUser(userProfile);
      setIsAuthenticated(true);

      // Fetch following list
      await fetchFollowingList();

      // Fetch liked list
      await fetchLikedList();

      return { success: true, user: userProfile };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // Ignore API disconnect errors on logout
    } finally {
      if (localStorage.getItem('token')) {
        localStorage.clear();
      }
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setFollowingIds(new Set());
      setLikedPublicationIds(new Set());
    }
  };

  const updateProfile = (profileData) => {
    const updated = saveUserProfile(profileData);
    setUser(prev => {
      if (!prev) return updated;
      return {
        ...updated,
        avatarImage: prev.avatarImage || updated.avatarImage
      };
    });
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        fetchProfileImages,
        fetchProfilePicture,
        followingIds,
        toggleFollow,
        likedPublicationIds,
        setLikedPublicationIds,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
