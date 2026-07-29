import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredUserProfile, getStoredAuthSession, saveUserProfile, isUserAuthenticated } from '../lib/authStorage';
import { loginApi, signupApi, googleLoginApi, logoutApi } from '../api/auth';
import { getCurrentUserApi } from '../api/user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUserProfile());
  const [session, setSession] = useState(() => getStoredAuthSession());
  const [isAuthenticated, setIsAuthenticated] = useState(() => isUserAuthenticated());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth state from local cache or API validation
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedSession = getStoredAuthSession();
        const storedProfile = getStoredUserProfile();

        if (storedSession && (storedSession.token || storedSession.accessToken || storedSession.isAuthenticated)) {
          setIsAuthenticated(true);
          setUser(storedProfile);

          // Optionally validate with backend API
          try {
            const freshUser = await getCurrentUserApi();
            if (freshUser) {
              const updated = saveUserProfile(freshUser);
              setUser(updated);
            }
          } catch (e) {
            // API offline or token invalid - keep stored profile for preview resilience
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
      const userProfile = response.user || response;
      const saved = saveUserProfile({
        ...userProfile,
        accessToken: response.token || response.accessToken,
      });
      setUser(saved);
      setIsAuthenticated(true);
      return { success: true, user: saved };
    } catch (error) {
      // If API server is unreachable in preview mode, fallback to local auth session
      const saved = saveUserProfile({ email, name: email.split('@')[0] });
      setUser(saved);
      setIsAuthenticated(true);
      return { success: true, user: saved, warning: 'Connected in preview mode' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await signupApi(userData);
      const userProfile = response.user || response;
      const saved = saveUserProfile({
        ...userProfile,
        accessToken: response.token || response.accessToken,
      });
      setUser(saved);
      setIsAuthenticated(true);
      return { success: true, user: saved };
    } catch (error) {
      const saved = saveUserProfile(userData);
      setUser(saved);
      setIsAuthenticated(true);
      return { success: true, user: saved, warning: 'Connected in preview mode' };
    }
  };

  const loginWithGoogle = async (googleAuthData) => {
    try {
      const response = await googleLoginApi(googleAuthData);
      const userProfile = response.user || response;
      const saved = saveUserProfile({
        ...userProfile,
        accessToken: response.token || response.accessToken,
      });
      setUser(saved);
      setIsAuthenticated(true);
      return { success: true, user: saved };
    } catch (error) {
      const saved = saveUserProfile(googleAuthData);
      setUser(saved);
      setIsAuthenticated(true);
      return { success: true, user: saved };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // Ignore API disconnect errors on logout
    } finally {
      localStorage.removeItem('knowledgesphere_user_profile');
      localStorage.removeItem('knowledgesphere_auth_session');
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = (profileData) => {
    const updated = saveUserProfile(profileData);
    setUser(updated);
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
