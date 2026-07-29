import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LogIn
} from 'lucide-react';
import { getPapers, deletePaper } from '../lib/storage';
import { fetchPublications } from '../services/publicationService';
import EmptyState from '../components/EmptyState';

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
  joinDate: 'March 2026',
  avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  coverBanner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
};

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const coverFileInputRef = useRef(null);

  // Determine if viewing own profile vs visitor view
  const [isOwnProfile] = useState(() => !window.location.search.includes('visitor'));

  // Determine if user is authenticated vs guest
  const isAuthenticated = (() => {
    try {
      const authSession = localStorage.getItem('knowledgesphere_auth_session');
      const userProfile = localStorage.getItem('knowledgesphere_user_profile');
      if (authSession) {
        const parsed = JSON.parse(authSession);
        if (parsed.isAuthenticated) return true;
      }
      if (userProfile) {
        const parsed = JSON.parse(userProfile);
        if (parsed.email || parsed.username) return true;
      }
      return false;
    } catch {
      return false;
    }
  })();

  // Tab State: ONLY 'published' and 'liked'
  const [activeTab, setActiveTab] = useState('published');

  // Follower State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(1240);

  // Profile Data State with LocalStorage persistence
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('knowledgesphere_user_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Published Papers State
  const [publishedPapers, setPublishedPapers] = useState([]);

  // Bookmarked Paper IDs
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('knowledgesphere_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Liked Papers IDs State
  const [likedIds, setLikedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('knowledgesphere_liked_papers');
      return saved ? JSON.parse(saved) : ['paper-1', 'paper-2'];
    } catch {
      return ['paper-1', 'paper-2'];
    }
  });

  // Modals & Toast Notifications
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...profile });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionText, setAuthActionText] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load published papers on mount
  useEffect(() => {
    setIsLoading(true);
    fetchPublications()
      .then((res) => {
        setPublishedPapers(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load published papers:', err);
        setPublishedPapers([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);


  // Handle Local File Upload for Avatar Photo
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        const updated = { ...profile, avatarImage: dataUrl };
        setProfile(updated);
        try {
          localStorage.setItem('knowledgesphere_user_profile', JSON.stringify(updated));
        } catch (err) {
          console.error(err);
        }
        showToast('Profile picture updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Local File Upload for Cover Banner Photo
  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        const updated = { ...profile, coverBanner: dataUrl };
        setProfile(updated);
        try {
          localStorage.setItem('knowledgesphere_user_profile', JSON.stringify(updated));
        } catch (err) {
          console.error(err);
        }
        showToast('Cover photo updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save profile edits
  const handleSaveProfile = (e) => {
    e.preventDefault();
    let formattedHandle = editFormData.handle ? editFormData.handle.trim() : '';
    if (formattedHandle && !formattedHandle.startsWith('@')) {
      formattedHandle = '@' + formattedHandle;
    }
    const updatedData = { ...editFormData, handle: formattedHandle };
    setProfile(updatedData);
    try {
      localStorage.setItem('knowledgesphere_user_profile', JSON.stringify(updatedData));
    } catch (err) {
      console.error(err);
    }
    setShowEditModal(false);
    showToast('Profile updated successfully!');
  };

  // Toggle Bookmark handler
  const handleToggleBookmark = (id) => {
    const next = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter(x => x !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(next);
    localStorage.setItem('knowledgesphere_bookmarks', JSON.stringify(next));
  };

  // Toggle Like handler
  const handleToggleLike = (id) => {
    const next = likedIds.includes(id)
      ? likedIds.filter(x => x !== id)
      : [...likedIds, id];
    setLikedIds(next);
    localStorage.setItem('knowledgesphere_liked_papers', JSON.stringify(next));
    showToast(next.includes(id) ? 'Added to Liked publications' : 'Removed from Liked publications');
  };

  // Follow Button toggle
  const handleToggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
      showToast('Unfollowed ' + profile.name);
    } else {
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      showToast('You are now following ' + profile.name);
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
    const paper = publishedPapers.find(p => p.id === id);
    if (!paper) return;
    setPaperToDelete(paper);
    setShowDeleteModal(true);
  };

  // Confirm Delete Paper
  const handleConfirmDelete = () => {
    if (!paperToDelete) return;
    const paperId = paperToDelete.id;
    setShowDeleteModal(false);

    if (paperId.startsWith('custom-paper-')) {
      deletePaper(paperId).catch(console.error);
    }
    setPublishedPapers(prev => prev.filter(p => p.id !== paperId));
    
    if (bookmarkedIds.includes(paperId)) {
      const nextBookmarks = bookmarkedIds.filter(x => x !== paperId);
      setBookmarkedIds(nextBookmarks);
      localStorage.setItem('knowledgesphere_bookmarks', JSON.stringify(nextBookmarks));
    }

    showToast('Publication deleted successfully.');
    setPaperToDelete(null);
  };

  // Filter Liked Papers
  const likedPapers = publishedPapers.filter(p => likedIds.includes(p.id));

  // Navigation tabs configuration
  const TABS = isAuthenticated 
    ? [
        { id: 'published', label: 'Published', count: publishedPapers.length },
        { id: 'liked', label: 'Liked', count: likedPapers.length },
        { id: 'followers', label: 'Followers', count: 0 },
      ]
    : [
        { id: 'published', label: 'Published Publications', count: publishedPapers.length },
      ];

  return (
    <div className="profile-wrapper">
      {isLoading ? (
        <SkeletonProfile />
      ) : (
        <>
          {/* Guest Mode Centered Alert Card OR Full Profile */}
          {!isAuthenticated ? (
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
        {/* Cover / Banner Image */}
        <div className="profile-banner-container">
          <img 
            src={profile.coverBanner} 
            alt="Cover Banner" 
            className="profile-banner-img"
          />
          <div className="profile-banner-overlay" />

          {/* Top-right pencil edit icon for cover photo (Owner only) */}
          {isOwnProfile && isAuthenticated && (
            <>
              <button 
                type="button"
                className="cover-edit-pencil-btn"
                onClick={() => coverFileInputRef.current?.click()}
                title="Change cover photo"
              >
                <Pencil size={15} />
              </button>
              <input 
                type="file" 
                ref={coverFileInputRef} 
                onChange={handleCoverUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </>
          )}
        </div>

        {/* Profile Header Content */}
        <div className="profile-hero-content">
          <div className="profile-avatar-row">
            {/* Avatar Box with Circular Pencil Edit Icon */}
            <div className="profile-avatar-box">
              <img 
                src={profile.avatarImage} 
                alt={profile.name} 
                className="profile-avatar-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <div className="profile-avatar-fallback" style={{ display: 'none' }}>
                {profile.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'A'}
              </div>

              {/* Bottom-right circular pencil edit icon */}
              {isAuthenticated && (
                <>
                  <button 
                    type="button"
                    className="avatar-edit-pencil-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile picture"
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
                      setAuthActionText('follow authors');
                      setShowAuthModal(true);
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

      {/* SIMPLIFIED STATISTICS GRID (3 Cards Only: Publications, Followers, Total Likes) */}
      <div className="profile-stats-grid-simple">
        <div className="stat-card-clean">
          <div className="stat-card-icon-maroon">
            <BookOpen size={20} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-value">{publishedPapers.length}</span>
            <span className="stat-card-label">Publications</span>
          </div>
        </div>

        <div className="stat-card-clean">
          <div className="stat-card-icon-maroon">
            <UserCheck size={20} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-value">{followerCount.toLocaleString()}</span>
            <span className="stat-card-label">Followers</span>
          </div>
        </div>

        <div className="stat-card-clean">
          <div className="stat-card-icon-maroon">
            <Heart size={20} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-value">3.8k</span>
            <span className="stat-card-label">Total Likes</span>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION (2 Tabs Only: Published & Liked) */}
      <div className="profile-tabs-nav-container">
        <div className="profile-tabs-scroll">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`profile-tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="tab-count-badge">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TABS CONTENT PANELS */}
      <div className="profile-tab-content">
        {/* 1. PUBLISHED TAB */}
        {activeTab === 'published' && (
          publishedPapers.length > 0 ? (
            <div className="published-grid">
              {publishedPapers.map((paper) => (
                <ResearchCard
                  key={paper.id}
                  paper={paper}
                  isBookmarked={bookmarkedIds.includes(paper.id)}
                  onToggleBookmark={handleToggleBookmark}
                  isLiked={likedIds.includes(paper.id)}
                  onToggleLike={handleToggleLike}
                  onReadArticle={() => navigate(`/research/${paper.id}`)}
                  onDeleteClick={handleDeleteClick}
                  isOwnProfile={isOwnProfile}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="BookOpen"
              title="No publications yet"
              description="Start publishing your first article or research."
              actionText="Create Publication"
              onAction={() => navigate('/publish')}
            />
          )
        )}

        {/* 2. LIKED TAB */}
        {activeTab === 'liked' && (
          likedPapers.length > 0 ? (
            <div className="published-grid">
              {likedPapers.map((paper) => (
                <ResearchCard
                  key={paper.id}
                  paper={paper}
                  isBookmarked={bookmarkedIds.includes(paper.id)}
                  onToggleBookmark={handleToggleBookmark}
                  isLiked={likedIds.includes(paper.id)}
                  onToggleLike={handleToggleLike}
                  onReadArticle={() => navigate(`/research/${paper.id}`)}
                  isOwnProfile={false}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="Heart"
              title="Nothing liked yet"
              description="Like publications to access them quickly later."
              actionText="Explore Publications"
              onAction={() => navigate('/explore')}
            />
          )
        )}

        {/* 3. FOLLOWERS TAB */}
        {activeTab === 'followers' && (
          <EmptyState
            icon="Users"
            title="No followers yet"
            description="Publish quality content to grow your audience."
          />
        )}
      </div>
      </>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Researcher Profile</h2>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editFormData.name} 
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Username / Handle</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editFormData.handle || ''} 
                    onChange={(e) => setEditFormData({ ...editFormData, handle: e.target.value })}
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
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio / Abstract</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  value={editFormData.bio} 
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
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
                  />
                </div>
              </div>

              <div className="modal-actions-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Save Changes
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
            setShowDeleteModal(false);
            setPaperToDelete(null);
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
                Are you sure you want to permanently delete &ldquo;<strong>{paperToDelete.title}</strong>&rdquo;?
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
                style={{ padding: '10px 20px', fontSize: '0.9rem', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                className="btn" 
                onClick={handleConfirmDelete}
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '0.9rem', 
                  fontWeight: 600, 
                  backgroundColor: '#dc2626', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Delete
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
