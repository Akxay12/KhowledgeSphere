import React, { useState } from 'react';
import { Bookmark, Calendar, Globe, BookOpen, Trash2, Heart } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import { isUserAuthenticated } from '../lib/authStorage';
import AuthPromptModal from './AuthPromptModal';
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
  const { id, title, authors, year, country, language, field, type, abstract, coverImage } = paper;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionText, setAuthActionText] = useState('');

  const cleanTitle = typeof title === 'string' ? title.replace(/<[^>]+>/g, '').trim() : title;
  const cleanAbstract = typeof abstract === 'string' ? abstract.replace(/<[^>]+>/g, '').trim() : abstract;

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (!isUserAuthenticated()) {
      if (onAuthRequired) {
        onAuthRequired('like');
      } else {
        setAuthActionText('like publications');
        setShowAuthModal(true);
      }
      return;
    }
    if (onToggleLike) onToggleLike(id);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    if (!isUserAuthenticated()) {
      if (onAuthRequired) {
        onAuthRequired('bookmark');
      } else {
        setAuthActionText('save bookmarks');
        setShowAuthModal(true);
      }
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
            {field && <span className="card-chip-field">{field}</span>}
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
            <div className="card-authors-container">
              <div className="card-avatar-circle">
                {authors.charAt(0).toUpperCase()}
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
              <span>{year || '2026'}</span>
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
              {onToggleLike && (
                <button 
                  className={`btn-like-action ${isLiked ? 'active' : ''}`}
                  onClick={handleLikeClick}
                  title={isLiked ? 'Unlike Publication' : 'Like Publication'}
                >
                  <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>
              )}

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
                    className="btn-read-article-action" 
                    onClick={onReadArticle}
                    title="Read Article"
                  >
                    <span>Read</span>
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
                    >
                      <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
                      <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                    </button>
                  )}
                  <button 
                    className="btn-read-article-action" 
                    onClick={onReadArticle}
                    title="Read Article"
                  >
                    <span>Read</span>
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
