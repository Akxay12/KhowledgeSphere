import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../lib/toast';
import { bookmarkApi } from '../api/bookmark';
import {
  Edit,
  Pencil,
  BookOpen,
  Heart,
  UserCheck,
  UserPlus,
  MapPin,
  Linkedin,
  Calendar,
  Share2,
  CheckCircle,
  ExternalLink,
  Trash2,
  X,
  LogIn,
  Loader2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { getPapers, deletePaper } from '../lib/storage';
import { fetchPublications, fetchPublicationsByUser, fetchMyPublications, removePublication } from '../services/publicationService';
import { updateUserProfileApi, uploadProfilePictureApi, getUserByIdApi } from '../api/user';
import { API_BASE_URL } from '../api/client';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

import ResearchCard from '../components/ResearchCard';
import { SkeletonProfile } from '../components/SkeletonLoader';
import ImageWithFallback from '../components/ImageWithFallback';
import AuthPromptModal from '../components/AuthPromptModal';
import './Profile.css';

// Default Profile Information (Research & Knowledge Focus)
const DEFAULT_PROFILE = {
  name: 'Dr. Akshay Verma',
  handle: '@akshay_verma',
  title: 'Software Developer & AI Systems Researcher',
  bio: 'Specializing in Neural-Symbolic Reasoning, Cognitive Architectures, and High-Performance Distributed Systems. Author & Open-Source Contributor passionate about accessible research.',
  location: 'San Francisco, CA, USA',
  linkedin: 'https://linkedin.com/in/akshay-verma',
  joinDate: '',
  avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
};

const formatJoinDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    }
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  } catch (e) {}
  return dateStr;
};

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const userId = params.userId || params.id;
  const fileInputRef = useRef(null);
  const { user: authUser, fetchProfileImages, fetchProfilePicture, updateProfile, followingIds, toggleFollow, likedPublicationIds } = useAuth();

  // Determine the logged-in user details dynamically
  const loggedInUserRaw = localStorage.getItem('loggedInUser') || localStorage.getItem('knowledgesphere_user_profile');
  let loggedInUserId = null;
  if (loggedInUserRaw) {
    try {
      const parsed = JSON.parse(loggedInUserRaw);
      loggedInUserId = parsed.userId || parsed.id;
    } catch (e) {
      console.error('Error parsing logged-in user:', e);
    }
  }

  const clickedUserId = userId ? parseInt(userId, 10) : null;
  const currentUserId = loggedInUserId ? parseInt(loggedInUserId, 10) : null;

  // Determine if viewing own profile vs visitor view
  const isOwnProfile = !userId || clickedUserId === currentUserId;

  // Determine if user is authenticated vs guest
  const isLoggedIn = !!localStorage.getItem("loggedInUser");
  const isAuthenticated = isLoggedIn;
  const showGuestBlock = !isLoggedIn && !userId;



  // Follower State
  const isFollowing = clickedUserId && followingIds ? followingIds.has(clickedUserId) : false;
  const [followerCount, setFollowerCount] = useState(() => {
    try {
      const savedRaw = localStorage.getItem('loggedInUser') || localStorage.getItem('knowledgesphere_user_profile');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed.followersCount !== undefined) return parsed.followersCount;
        if (parsed.followerCount !== undefined) return parsed.followerCount;
      }
    } catch (e) {
      console.error('Error parsing logged-in user for initial follower count:', e);
    }
    return 0;
  });

  // Reset scroll position to top when component mounts or target userId changes
  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, [userId]);

  // Profile Data State with LocalStorage persistence
  const [profile, setProfile] = useState(() => {
    const initialOwnProfile = !userId || (userId && parseInt(userId, 10) === parseInt(loggedInUserId, 10));
    if (!initialOwnProfile) {
      return null;
    }
    try {
      const savedRaw = localStorage.getItem('loggedInUser') || localStorage.getItem('knowledgesphere_user_profile');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        // Normalize fields from the backend User object to the frontend expectations
        return {
          ...parsed,
          name: parsed.name || parsed.fullName || DEFAULT_PROFILE.name,
          username: parsed.username || DEFAULT_PROFILE.handle.replace('@', ''),
          handle: parsed.handle || (parsed.username ? (parsed.username.startsWith('@') ? parsed.username : `@${parsed.username}`) : DEFAULT_PROFILE.handle),
          email: parsed.email || '',
          bio: parsed.bio || '',
          profession: parsed.profession || parsed.title || '',
          title: parsed.profession || parsed.title || DEFAULT_PROFILE.title,
          location: parsed.location || '',
          linkedinUrl: parsed.linkedinUrl || parsed.linkdinUrl || parsed.linkedin || '',
          linkedin: parsed.linkedinUrl || parsed.linkdinUrl || parsed.linkedin || '',
          joined: parsed.joined || parsed.joinDate || '',
          joinDate: formatJoinDate(parsed.joined || parsed.joinDate),
          profilePic: parsed.avatarImage || '',
          avatarImage: parsed.avatarImage || DEFAULT_PROFILE.avatarImage
        };
      }
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Published Papers State
  const [publications, setPublications] = useState([]);

  // Bookmarked Paper IDs
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      bookmarkApi.getBookmarks()
        .then((res) => {
          const apiIds = Array.isArray(res) 
            ? res 
            : (res && Array.isArray(res.data) ? res.data : []);
          setBookmarkedIds(apiIds.map(id => typeof id === 'object' ? (id.publicationId || id.id) : id));
        })
        .catch((err) => {
          console.error("Failed to load bookmarks in profile:", err);
        });
    } else {
      setBookmarkedIds([]);
    }
  }, [isLoggedIn]);

  // Liked Papers IDs derived from global auth state
  const likedIds = likedPublicationIds ? Array.from(likedPublicationIds) : [];

  // Modals & Toast Notifications
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(() => profile ? { ...profile } : {});
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingCardIds, setDeletingCardIds] = useState([]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionText, setAuthActionText] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editError, setEditError] = useState('');

  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [avatarError, setAvatarError] = useState(false);
  const [error, setError] = useState(null);

  // Reset profile state and publications when transitioning between users to avoid stale data leakage
  const [prevUserId, setPrevUserId] = useState(userId);
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setIsLoading(true);
    setPublications([]);
    setError(null);
    
    // If own profile, restore from localStorage (already initialised, but sync just in case)
    const nextOwnProfile = !userId || parseInt(userId, 10) === parseInt(loggedInUserId, 10);
    if (nextOwnProfile) {
      try {
        const savedRaw = localStorage.getItem('loggedInUser') || localStorage.getItem('knowledgesphere_user_profile');
        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          setProfile({
            ...parsed,
            name: parsed.name || parsed.fullName || DEFAULT_PROFILE.name,
            username: parsed.username || DEFAULT_PROFILE.handle.replace('@', ''),
            handle: parsed.handle || (parsed.username ? (parsed.username.startsWith('@') ? parsed.username : `@${parsed.username}`) : DEFAULT_PROFILE.handle),
            email: parsed.email || '',
            bio: parsed.bio || '',
            profession: parsed.profession || parsed.title || '',
            title: parsed.profession || parsed.title || DEFAULT_PROFILE.title,
            location: parsed.location || '',
            linkedinUrl: parsed.linkedinUrl || parsed.linkdinUrl || parsed.linkedin || '',
            linkedin: parsed.linkedinUrl || parsed.linkdinUrl || parsed.linkedin || '',
            joined: parsed.joined || parsed.joinDate || '',
            joinDate: formatJoinDate(parsed.joined || parsed.joinDate),
            profilePic: parsed.avatarImage || '',
            avatarImage: parsed.avatarImage || DEFAULT_PROFILE.avatarImage
          });
          const initialFollowers = parsed.followersCount !== undefined 
            ? parsed.followersCount 
            : (parsed.followerCount !== undefined ? parsed.followerCount : 0);
          setFollowerCount(initialFollowers);
        } else {
          setProfile(DEFAULT_PROFILE);
          setFollowerCount(0);
        }
      } catch {
        setProfile(DEFAULT_PROFILE);
        setFollowerCount(0);
      }
    } else {
      setProfile(null);
      setFollowerCount(0);
    }
  }

  const renderBackButton = () => {
    if (isOwnProfile) return null;

    const fromContext = location.state?.from || '';
    let backText = 'Back to Feed';
    let backPath = '/home';

    if (fromContext.startsWith('/explore')) {
      backText = 'Back to Search';
      backPath = fromContext; // Go back to search query/filters
    } else if (fromContext.startsWith('/research') || fromContext.startsWith('/publications')) {
      backText = 'Back to Research';
      backPath = -1;
    }

    return (
      <div className="reader-top-controls" style={{ marginBottom: '16px', maxWidth: 'none', padding: '0 8px' }}>
        <button 
          className="reader-back-btn" 
          onClick={() => {
            if (backPath === -1) {
              navigate(-1);
            } else {
              navigate(backPath);
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={16} />
          <span>{backText}</span>
        </button>
      </div>
    );
  };

  const profileUserId = profile?.userId || profile?.id;
  const backendAvatarUrl = profileUserId ? `${API_BASE_URL}/public/${profileUserId}/picture?t=${avatarVersion}` : null;

  const currentAvatarSrc = (!avatarError && backendAvatarUrl) ? backendAvatarUrl : (profile?.avatarImage || DEFAULT_PROFILE.avatarImage);

  // Sync profile state with authUser updates (e.g. dynamic blob URLs fetched by AuthContext)
  useEffect(() => {
    if (isOwnProfile && authUser) {
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...authUser,
          avatarImage: authUser.avatarImage || prev.avatarImage || DEFAULT_PROFILE.avatarImage
        };
      });
    }
  }, [authUser, isOwnProfile]);

  // Fetch images whenever the profile page opens
  useEffect(() => {
    if (isAuthenticated && profileUserId && fetchProfileImages) {
      fetchProfileImages(profileUserId);
    }
  }, [profileUserId, isAuthenticated]);

  useEffect(() => {
    setAvatarError(false);
    setAvatarVersion(Date.now());
  }, [profileUserId]);

  // Load profile data and publications dynamically when userId or loggedInUserId changes
  useEffect(() => {
    let active = true;
    const loadProfileAndPublications = async () => {
      setIsLoading(true);
      
      const targetUserId = userId || loggedInUserId;
      if (!targetUserId) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Fetch user profile if viewing another user's profile
        if (!isOwnProfile) {
          const fetchedUser = await getUserByIdApi(targetUserId);
          if (fetchedUser && active) {
            const normalizedJoinDate = formatJoinDate(fetchedUser.joined || fetchedUser.joinDate);
            setProfile({
              ...fetchedUser,
              name: fetchedUser.name || fetchedUser.fullName || DEFAULT_PROFILE.name,
              username: fetchedUser.username || DEFAULT_PROFILE.handle.replace('@', ''),
              handle: fetchedUser.handle || (fetchedUser.username ? (fetchedUser.username.startsWith('@') ? fetchedUser.username : `@${fetchedUser.username}`) : DEFAULT_PROFILE.handle),
              email: fetchedUser.email || '',
              bio: fetchedUser.bio || '',
              profession: fetchedUser.profession || fetchedUser.title || '',
              title: fetchedUser.profession || fetchedUser.title || DEFAULT_PROFILE.title,
              location: fetchedUser.location || '',
              linkedinUrl: fetchedUser.linkedinUrl || fetchedUser.linkdinUrl || fetchedUser.linkedin || '',
              linkedin: fetchedUser.linkedinUrl || fetchedUser.linkdinUrl || fetchedUser.linkedin || '',
              joined: fetchedUser.joined || fetchedUser.joinDate || '',
              joinDate: normalizedJoinDate,
              profilePic: fetchedUser.avatarImage || '',
              avatarImage: fetchedUser.avatarImage || DEFAULT_PROFILE.avatarImage
            });

            // Set follower count safely
            const initialFollowers = fetchedUser.followersCount !== undefined 
              ? fetchedUser.followersCount 
              : (fetchedUser.followerCount !== undefined ? fetchedUser.followerCount : 0);
            setFollowerCount(initialFollowers);

            // Map and normalize publications directly from the public profile response
            const normalizedPubs = (fetchedUser.publications || []).map(pub => ({
              ...pub,
              id: pub.publicationId || pub.id,
              authors: pub.authorName || pub.authors || fetchedUser.name,
              coverImage: pub.coverImageUrl || pub.coverImage,
              type: pub.publicationType || pub.type,
              publishedDate: pub.publishedAt || pub.publishedDate,
              year: pub.publishedAt ? new Date(pub.publishedAt).getFullYear() : (pub.year || '2026')
            }));
            setPublications(normalizedPubs);
          }
        } else {
          // If own profile, restore from localStorage (already initialised, but sync just in case)
          const savedRaw = localStorage.getItem('loggedInUser') || localStorage.getItem('knowledgesphere_user_profile');
          if (savedRaw && active) {
            const parsed = JSON.parse(savedRaw);
            setProfile({
              ...parsed,
              name: parsed.name || parsed.fullName || DEFAULT_PROFILE.name,
              username: parsed.username || DEFAULT_PROFILE.handle.replace('@', ''),
              handle: parsed.handle || (parsed.username ? (parsed.username.startsWith('@') ? parsed.username : `@${parsed.username}`) : DEFAULT_PROFILE.handle),
              email: parsed.email || '',
              bio: parsed.bio || '',
              profession: parsed.profession || parsed.title || '',
              title: parsed.profession || parsed.title || DEFAULT_PROFILE.title,
              location: parsed.location || '',
              linkedinUrl: parsed.linkedinUrl || parsed.linkdinUrl || parsed.linkedin || '',
              linkedin: parsed.linkedinUrl || parsed.linkdinUrl || parsed.linkedin || '',
              joined: parsed.joined || parsed.joinDate || '',
              joinDate: formatJoinDate(parsed.joined || parsed.joinDate),
              profilePic: parsed.avatarImage || '',
              avatarImage: parsed.avatarImage || DEFAULT_PROFILE.avatarImage
            });

            // Set follower count safely
            const initialFollowers = parsed.followersCount !== undefined 
              ? parsed.followersCount 
              : (parsed.followerCount !== undefined ? parsed.followerCount : 0);
            setFollowerCount(initialFollowers);
          }
        }

        // 2. Fetch publications dynamically (own publications only, public publications are already loaded above)
        if (isOwnProfile) {
          const res = await fetchMyPublications();
          if (active) {
            setPublications(res.data || []);
          }
        }
      } catch (err) {
        console.error('Failed to load profile/publications data:', err);
        if (active) {
          setError(err.message || 'Failed to load profile');
          setPublications([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadProfileAndPublications();

    return () => {
      active = false;
    };
  }, [userId, loggedInUserId]);


  // Handle Local File Upload for Avatar Photo
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const loggedInUserRaw = localStorage.getItem('loggedInUser') || localStorage.getItem('knowledgesphere_user_profile');
      if (!loggedInUserRaw) {
        throw new Error('No logged-in user found.');
      }
      const loggedInUser = JSON.parse(loggedInUserRaw);
      const userId = loggedInUser.userId || loggedInUser.id;
      if (!userId) {
        throw new Error('User ID is missing from logged-in session.');
      }

      const formData = new FormData();
      formData.append('file', file);

      await uploadProfilePictureApi(formData);

      // Fetch the latest profile picture immediately to update UI components
      if (fetchProfilePicture && profileUserId) {
        await fetchProfilePicture(profileUserId);
      }

      // Reset error state and increment version to trigger direct backend fetch
      setAvatarError(false);
      setAvatarVersion(Date.now());
      showToast('Profile picture updated successfully!');
    } catch (err) {
      console.error('Failed to upload profile picture:', err);
      showToast(err.message || 'Failed to upload profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Save profile edits
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setEditError('');

    try {
      // 1. Get logged-in user's ID from local storage
      const loggedInUserRaw = localStorage.getItem('loggedInUser') || localStorage.getItem('knowledgesphere_user_profile');
      if (!loggedInUserRaw) {
        throw new Error('No logged-in user found.');
      }
      const loggedInUser = JSON.parse(loggedInUserRaw);
      const userId = loggedInUser.userId || loggedInUser.id;
      if (!userId) {
        throw new Error('User ID is missing from logged-in session.');
      }

      // 2. Prepare request payload containing ONLY name, profession, bio, location, linkedinUrl
      const requestPayload = {
        name: editFormData.name || '',
        profession: editFormData.title || editFormData.profession || '',
        bio: editFormData.bio || '',
        location: editFormData.location || '',
        linkedinUrl: editFormData.linkedin || editFormData.linkedinUrl || ''
      };

      // 3. Send PUT request to the backend Update Profile API
      const updatedUser = await updateUserProfileApi(requestPayload);

      // 4. Successful Response:
      // Replace the existing loggedInUser in localStorage with the updated user returned by the backend
      const mergedUser = {
        ...loggedInUser,
        ...updatedUser
      };

      // Update localStorage instantly
      localStorage.setItem('loggedInUser', JSON.stringify(mergedUser));
      
      if (updateProfile) {
        updateProfile(mergedUser);
      }

      // Helper function to normalize parsed storage user details to component view format
      const normalizeProfile = (parsed) => {
        return {
          ...parsed,
          name: parsed.name || parsed.fullName || DEFAULT_PROFILE.name,
          username: parsed.username || DEFAULT_PROFILE.handle.replace('@', ''),
          handle: parsed.handle || (parsed.username ? (parsed.username.startsWith('@') ? parsed.username : `@${parsed.username}`) : DEFAULT_PROFILE.handle),
          email: parsed.email || '',
          bio: parsed.bio || '',
          profession: parsed.profession || parsed.title || '',
          title: parsed.profession || parsed.title || DEFAULT_PROFILE.title,
          location: parsed.location || '',
          linkedinUrl: parsed.linkedinUrl || parsed.linkdinUrl || parsed.linkedin || '',
          linkedin: parsed.linkedinUrl || parsed.linkdinUrl || parsed.linkedin || '',
          joined: parsed.joined || parsed.joinDate || '',
          joinDate: formatJoinDate(parsed.joined || parsed.joinDate),
          profilePic: parsed.avatarImage || '',
          avatarImage: parsed.avatarImage || DEFAULT_PROFILE.avatarImage
        };
      };

      // Refresh the Profile page state using the updated localStorage data, preserving the current avatar image
      setProfile(prev => ({
        ...normalizeProfile(mergedUser),
        avatarImage: prev.avatarImage || authUser?.avatarImage || DEFAULT_PROFILE.avatarImage
      }));

      // Close the Edit Profile dialog
      setShowEditModal(false);
      showToast('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Display the backend error message
      setEditError(err.message || 'An error occurred while updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Bookmark handler
  const handleToggleBookmark = async (id) => {
    if (!isLoggedIn) return;
    try {
      const res = await bookmarkApi.addBookmark(id);
      if (res && typeof res.bookmarked === 'boolean') {
        setBookmarkedIds(prev => {
          if (res.bookmarked) {
            return prev.includes(id) ? prev : [...prev, id];
          } else {
            return prev.filter(item => item !== id);
          }
        });
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      showToast('Failed to update bookmark');
    }
  };

  // Toggle Like handler
  const handleToggleLike = (id, res) => {
    const isLikedNow = res ? res.liked : (likedPublicationIds && likedPublicationIds.has(id));
    showToast(isLikedNow ? 'Added to Liked publications' : 'Removed from Liked publications');
  };

  // Follow Button toggle
  const handleToggleFollow = async () => {
    if (!clickedUserId) return;
    try {
      const response = await toggleFollow(clickedUserId);
      const isNowFollowing = response?.following;
      if (isNowFollowing) {
        setFollowerCount(prev => prev + 1);
        showToast('You are now following ' + (profile?.name || 'user'));
      } else {
        setFollowerCount(prev => prev - 1);
        showToast('Unfollowed ' + (profile?.name || 'user'));
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
      showToast(err?.message || "Failed to update follow status");
    }
  };

  // Share Profile
  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Profile link copied to clipboard!');
  };

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  // Handle Delete Publication clicks
  const handleDeleteClick = (id) => {
    const paper = publications.find(p => p.id === id);
    if (!paper) return;
    setPaperToDelete(paper);
    setShowDeleteModal(true);
  };

  // Confirm Delete Paper
  const handleConfirmDelete = async () => {
    if (!paperToDelete || isDeleting) return;
    const paperId = paperToDelete.id;

    // Get logged-in user's ID from local storage
    const loggedInUserRaw = localStorage.getItem('loggedInUser') || localStorage.getItem('knowledgesphere_user_profile');
    let currentUserId = null;
    if (loggedInUserRaw) {
      try {
        const parsed = JSON.parse(loggedInUserRaw);
        currentUserId = parsed.userId || parsed.id;
      } catch (e) {
        console.error('Error parsing logged-in user for deletion:', e);
      }
    }

    if (!currentUserId) {
      showToast('Failed to delete research');
      setShowDeleteModal(false);
      setPaperToDelete(null);
      return;
    }

    setIsDeleting(true);

    try {
      const res = await removePublication(paperId);
      if (res && res.success) {
        // Update local publicationCount
        let userObj = authUser;
        if (!userObj && loggedInUserRaw) {
          try {
            userObj = JSON.parse(loggedInUserRaw);
          } catch (e) {
            console.error('Error parsing user object on deletion count update:', e);
          }
        }
        if (userObj) {
          const currentCount = userObj.publicationCount || 0;
          const newCount = Math.max(0, currentCount - 1);
          const updatedUser = {
            ...userObj,
            publicationCount: newCount
          };
          localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
          localStorage.setItem('knowledgesphere_user_profile', JSON.stringify(updatedUser));
          if (updateProfile) {
            updateProfile(updatedUser);
          }
          // Update local profile state
          setProfile(prev => prev ? { ...prev, publicationCount: newCount } : null);
        }

        // Success -> Close modal, reset delete loading state, reset target paper
        setShowDeleteModal(false);
        setIsDeleting(false);
        setPaperToDelete(null);

        // Optimistic / animated deletion: add to animating list
        setDeletingCardIds(prev => [...prev, paperId]);

        // Wait 500ms for animation to finish, then remove from state
        setTimeout(() => {
          setPublications(prev => prev.filter(p => p.id !== paperId));
          setDeletingCardIds(prev => prev.filter(id => id !== paperId));
        }, 500);

        if (paperId.startsWith('custom-paper-')) {
          deletePaper(paperId).catch(console.error);
        }

        if (bookmarkedIds.includes(paperId)) {
          setBookmarkedIds(prev => prev.filter(x => x !== paperId));
        }

        showToast('Research deleted successfully');
      } else {
        throw new Error(res?.error || 'Failed to delete');
      }
    } catch (err) {
      console.error('Delete publication error:', err);
      showToast('Failed to delete research');
      setIsDeleting(false);
      setShowDeleteModal(false);
      setPaperToDelete(null);
    }
  };



  return (
    <div className="profile-wrapper">
      {renderBackButton()}
      {isLoading ? (
        <SkeletonProfile />
      ) : error ? (
        <div style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
          <ErrorState
            title="Failed to Load Profile"
            message={error}
            onRetry={() => loadProfileAndPublications()}
          />
        </div>
      ) : (
        <>
          {/* Guest Mode Centered Alert Card OR Full Profile */}
          {showGuestBlock ? (
            <div style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '24px',
              padding: '48px 32px',
              textAlign: 'center',
              maxWidth: '560px',
              margin: '60px auto',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '20px',
                backgroundColor: 'rgba(122, 31, 31, 0.08)',
                color: '#7A1F1F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <UserPlus size={34} />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                You are Exploring in Guest Mode
              </h2>
              <p style={{ fontSize: '0.96rem', color: '#64748b', lineHeight: '1.6', marginBottom: '28px' }}>
                Profile customization, publishing, and personal activity management are available after creating your KnowledgeSphere account.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  style={{
                    backgroundColor: '#7A1F1F',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(122, 31, 31, 0.25)'
                  }}
                  id="profile-guest-signup-btn"
                >
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1.5px solid #cbd5e1',
                    padding: '12px 22px',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <LogIn size={18} />
                  <span>Sign In</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* HERO SECTION */}
              <div className="profile-hero-card">
        {/* Profile Header Content */}
        <div className="profile-hero-content">
          <div className="profile-avatar-row">
            {/* Avatar Box with Circular Pencil Edit Icon */}
            <div className="profile-avatar-box">
              <img 
                src={currentAvatarSrc} 
                alt={profile.name} 
                className="profile-avatar-img"
                onError={(e) => {
                  if (profileUserId && !avatarError) {
                    setAvatarError(true);
                  } else {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                  }
                }}
              />
              <div className="profile-avatar-fallback" style={{ display: 'none' }}>
                {profile.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'A'}
              </div>

              {isUploadingAvatar && (
                <div className="profile-avatar-uploading-overlay">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}

              {/* Bottom-right circular pencil edit icon */}
              {isAuthenticated && isOwnProfile && (
                <>
                  <button 
                    type="button"
                    className="avatar-edit-pencil-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile picture"
                    disabled={isUploadingAvatar}
                  >
                    <Pencil size={13} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarUpload} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                </>
              )}
            </div>

            {/* Action Buttons: Follow (for Guest) OR Edit Profile (for Owner) OR Follow (for Visitor) */}
            <div className="profile-action-buttons">
              {!isAuthenticated ? (
                <>
                  <button 
                    className="btn btn-follow-maroon" 
                    onClick={() => {
                      showToast("Login to access this feature");
                    }}
                    style={{ backgroundColor: '#7A1F1F', color: '#ffffff', fontWeight: 700 }}
                    id="profile-action-follow-btn"
                  >
                    <UserPlus size={16} />
                    <span>Follow</span>
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => navigate('/register')}
                  >
                    <span>Sign Up</span>
                  </button>
                </>
              ) : isOwnProfile ? (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setEditFormData({ ...profile });
                    setEditError('');
                    setIsSaving(false);
                    setShowEditModal(true);
                  }}
                >
                  <Edit size={16} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button 
                  className={`btn ${isFollowing ? 'btn-following-active' : 'btn-follow-maroon'}`}
                  onClick={handleToggleFollow}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={16} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}

              <button 
                className="btn btn-secondary icon-only-btn" 
                onClick={handleShareProfile}
                title="Share Profile"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* User Identity Block */}
          <div className="profile-identity-block">
            <div className="profile-name-row">
              <h1 className="profile-full-name">{profile.name}</h1>
              <span className="profile-username">{profile.handle}</span>
            </div>
            <p className="profile-pro-title">{profile.title}</p>
            <p className="profile-bio-text">{profile.bio}</p>

            {/* Simplified Profile Info Below Bio: ONLY Country, LinkedIn, Joined Date */}
            <div className="profile-meta-chips-row">
              {profile.location && (
                <div className="profile-meta-chip">
                  <MapPin size={14} className="maroon-icon" />
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.linkedin && (
                <a 
                  href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="profile-meta-chip link-chip"
                >
                  <Linkedin size={14} className="maroon-icon" />
                  <span>LinkedIn</span>
                  <ExternalLink size={12} />
                </a>
              )}
              {profile.joinDate && (
                <div className="profile-meta-chip">
                  <Calendar size={14} className="maroon-icon" />
                  <span>Joined {profile.joinDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SIMPLIFIED STATISTICS GRID (2 Cards Only: Published, Followers) */}
      <div className="profile-stats-grid-simple">
        <div className="stat-card-clean">
          <div className="stat-card-icon-maroon">
            <BookOpen size={20} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-value">{profile?.publicationCount ?? 0}</span>
            <span className="stat-card-label">Published</span>
          </div>
        </div>

        <div className="stat-card-clean">
          <div className="stat-card-icon-maroon">
            <UserCheck size={20} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-value">
              {(isOwnProfile 
                ? (profile?.followersCount !== undefined ? profile.followersCount : (profile?.followerCount !== undefined ? profile.followerCount : followerCount)) 
                : followerCount
              ).toLocaleString()}
            </span>
            <span className="stat-card-label">Followers</span>
          </div>
        </div>
      </div>

      {/* Published Research Section */}
      <div className="profile-publications-section" style={{ marginTop: '24px' }}>
        <h3 className="profile-section-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px', padding: '0 8px' }}>
          Published Research
        </h3>
        {publications.length > 0 ? (
          <div className="published-grid">
            {publications.map((paper) => (
              <div
                key={paper.id}
                className={deletingCardIds.includes(paper.id) ? 'profile-card-deleting-anim' : ''}
              >
                <ResearchCard
                  paper={paper}
                  isBookmarked={bookmarkedIds.includes(paper.id)}
                  onToggleBookmark={handleToggleBookmark}
                  isLiked={likedIds.includes(paper.id)}
                  onToggleLike={handleToggleLike}
                  onReadArticle={() => navigate(`/research/${paper.id}`)}
                  onDeleteClick={handleDeleteClick}
                  isOwnProfile={isOwnProfile}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="BookOpen"
            title="No publications"
            description={isOwnProfile ? "Start publishing your first article or research." : "This user hasn't published any articles yet."}
            actionText={isOwnProfile ? "Create Publication" : null}
            onAction={isOwnProfile ? () => navigate('/publish') : null}
          />
        )}
      </div>
      </>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => !isSaving && setShowEditModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Researcher Profile</h2>
              <button className="btn-close" onClick={() => !isSaving && setShowEditModal(false)} disabled={isSaving}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form">
              {editError && (
                <div className="profile-edit-error-banner" role="alert">
                  <div className="error-banner-icon">
                    <AlertCircle size={20} />
                  </div>
                  <div className="error-banner-content">
                    <span className="error-banner-text">{editError}</span>
                  </div>
                  <button
                    type="button"
                    className="error-banner-dismiss"
                    onClick={() => setEditError('')}
                    title="Dismiss notice"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editFormData.name} 
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Username / Handle</label>
                  <input 
                    type="text" 
                    className="form-control profile-username-input-readonly" 
                    value={editFormData.handle || ''} 
                    readOnly
                    placeholder="@username"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Professional Title / Designation</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editFormData.title} 
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio / Abstract</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  value={editFormData.bio} 
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  disabled={isSaving}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Country / Location</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editFormData.location} 
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn Profile URL</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    value={editFormData.linkedin} 
                    onChange={(e) => setEditFormData({ ...editFormData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="modal-actions-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSaving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PUBLICATION CONFIRMATION MODAL */}
      {showDeleteModal && paperToDelete && (
        <div 
          className="modal-backdrop"
          onClick={() => {
            if (!isDeleting) {
              setShowDeleteModal(false);
              setPaperToDelete(null);
            }
          }}
        >
          <div 
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              width: '100%',
              maxWidth: '440px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#dc2626' }}>
              <div style={{
                backgroundColor: 'rgba(220, 38, 38, 0.08)',
                padding: '10px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>Delete Publication</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: '1.5' }}>
                Are you sure you want to delete this research?
              </p>
              <p style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600, margin: 0, padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(220, 38, 38, 0.04)', borderLeft: '3px solid #dc2626' }}>
                This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setPaperToDelete(null);
                }}
                disabled={isDeleting}
                style={{ padding: '10px 20px', fontSize: '0.9rem', fontWeight: 600, cursor: isDeleting ? 'not-allowed' : 'pointer' }}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '0.9rem', 
                  fontWeight: 600, 
                  backgroundColor: '#dc2626', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                  transition: 'background-color 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* SUCCESS TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Auth Prompt Modal for Guest Mode */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionText={authActionText}
      />
    </div>
  );
}
