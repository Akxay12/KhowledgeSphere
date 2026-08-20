import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Calendar, Globe, BookOpen, Trash2, Heart } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import { isUserAuthenticated } from '../lib/authStorage';
import { handleProfileNavigate } from '../lib/profileNavigation';
import AuthPromptModal from './AuthPromptModal';
import { showToast } from '../lib/toast';
import { toggleLike } from '../services/publicationService';
import { useAuth } from '../context/AuthContext';
import './ResearchCard.css';

export default function ResearchCard({
  paper,
  isBookmarked = false,
  onToggleBookmark,
  isLiked = false,
  onToggleLike,
  onReadArticle,
  onDeleteClick,
  isOwnProfile = false,
  onAuthRequired
}) {
  const navigate = useNavigate();
  const { id, title, authors, year, country, language, field, type, abstract, coverImage } = paper;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionText, setAuthActionText] = useState('');

  const cleanTitle = typeof title === 'string' ? title.replace(/<[^>]+>/g, '').trim() : title;
  const cleanAbstract = typeof abstract === 'string' ? abstract.replace(/<[^>]+>/g, '').trim() : abstract;

  const { likedPublicationIds, setLikedPublicationIds, isAuthenticated } = useAuth();
  const isLoggedIn = isAuthenticated;

  const paperIdStr = String(paper.publicationId || paper.id || id);
  const localLiked = isAuthenticated && likedPublicationIds && likedPublicationIds.has(paperIdStr);

  const [localLikeCount, setLocalLikeCount] = useState(paper.likeCount ?? 0);

  useEffect(() => {
    setLocalLikeCount(paper.likeCount ?? 0);
  }, [paper.likeCount]);

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      showToast("Login to access this feature");
      return;
    }
    try {
      const res = await toggleLike(paperIdStr);
      if (res) {
        setLocalLikeCount(res.likeCount);
        if (setLikedPublicationIds && res.likedPublicationIds) {
          setLikedPublicationIds(new Set(res.likedPublicationIds.map(String)));
        }
        if (onToggleLike) {
          onToggleLike(paperIdStr, res);
        }
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
      showToast("Try again later");
    }
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      showToast("Login to access this feature");
      return;
    }
    if (onToggleBookmark) onToggleBookmark(id);
  };

  return (
    <>
      <article className="research-card">
        {/* 1. Large Cover Image (16:9 aspect ratio) */}
        <div className="card-image-wrapper">
          <ImageWithFallback
            src={coverImage}
            alt={cleanTitle || 'Research paper'}
            className="card-cover-img"
            fallbackType="cover"
          />
        </div>

        <div className="card-body">
          {/* 2. Research Field & Publication Type chips */}
          <div className="card-header-chips">
            {(paper.category || field) && <span className="card-chip-field">{paper.category || field}</span>}
            {type && <span className="card-chip-type">{type}</span>}
          </div>

          {/* 3. Article Title (Max 2 lines) */}
          <h3 
            className="card-title-text" 
            onClick={onReadArticle}
            title="Read Full Paper"
          >
            {cleanTitle}
          </h3>

          {/* 4. Author Name */}
          {authors && (
            <div 
              className="card-authors-container"
              onClick={(e) => {
                if (paper.userId) {
                  e.stopPropagation();
                  handleProfileNavigate(navigate, paper.userId);
                }
              }}
              style={{ cursor: paper.userId ? 'pointer' : 'default' }}
            >
              <div className="card-avatar-circle" style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {paper.userId ? (
                  <ImageWithFallback
                    src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/public/${paper.userId}/picture`}
                    alt={authors}
                    fallbackType="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  authors.charAt(0).toUpperCase()
                )}
              </div>
              <div className="card-authors-info">
                <span className="card-authors-label">By</span>
                <span className="card-authors-value">{authors}</span>
              </div>
            </div>
          )}

          {/* 5. Short Abstract Description (2-3 lines) */}
          <p className="card-abstract-preview">{cleanAbstract}</p>

          {/* Meta row: Year & Language */}
          <div className="card-meta-row">
            <div className="card-meta-item" title="Publish Date">
              <Calendar size={13} />
              <span>
                {paper.publishedDate ? (() => {
                  try {
                    const date = new Date(paper.publishedDate);
                    if (!isNaN(date.getTime())) {
                      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    }
                  } catch (e) {}
                  return paper.publishedDate;
                })() : (year || '2026')}
              </span>
            </div>
            {language && (
              <div className="card-meta-item" title="Language">
                <Globe size={13} />
                <span>{language}</span>
              </div>
            )}
          </div>

          {/* 6. Footer Actions */}
          <div className="card-footer-actions">
            <div className="actions-right-aligned">
              {isOwnProfile && onDeleteClick ? (
                <>
                  <button
                    className="btn-delete-card-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(id);
                    }}
                    title="Delete Publication"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>

                  <button 
                    className={`btn-like-action ${localLiked ? 'active' : ''}`}
                    onClick={handleLikeClick}
                    title={localLiked ? 'Unlike Publication' : 'Like Publication'}
                  >
                    <Heart size={15} fill={localLiked ? 'currentColor' : 'none'} />
                    <span>{localLikeCount}</span>
                  </button>

                  <button 
                    className="btn-read-article-action" 
                    onClick={paper.comingSoon ? null : onReadArticle}
                    disabled={paper.comingSoon}
                    title={paper.comingSoon ? "Coming Soon" : "Read Article"}
                    style={paper.comingSoon ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  >
                    <span>{paper.comingSoon ? 'Coming Soon' : 'Read'}</span>
                    <BookOpen size={14} />
                  </button>
                </>
              ) : (
                <>
                  {onToggleBookmark && (
                    <button 
                      className={`btn-bookmark-action ${isBookmarked ? 'active' : ''}`}
                      onClick={handleBookmarkClick}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Paper'}
                      style={!isLoggedIn ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                    >
                      <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
                      <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                    </button>
                  )}

                  <button 
                    className={`btn-like-action ${localLiked ? 'active' : ''}`}
                    onClick={handleLikeClick}
                    title={localLiked ? 'Unlike Publication' : 'Like Publication'}
                  >
                    <Heart size={15} fill={localLiked ? 'currentColor' : 'none'} />
                    <span>{localLikeCount}</span>
                  </button>

                  <button 
                    className="btn-read-article-action" 
                    onClick={paper.comingSoon ? null : onReadArticle}
                    disabled={paper.comingSoon}
                    title={paper.comingSoon ? "Coming Soon" : "Read Article"}
                    style={paper.comingSoon ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                  >
                    <span>{paper.comingSoon ? 'Coming Soon' : 'Read'}</span>
                    <BookOpen size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </article>

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionText={authActionText}
      />
    </>
  );
}
