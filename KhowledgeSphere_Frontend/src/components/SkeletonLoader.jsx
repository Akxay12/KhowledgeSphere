import React from 'react';
import './SkeletonLoader.css';

/**
 * Basic Shimmer Pulse Component
 */
export function SkeletonPulse({ className = '', style = {} }) {
  return <div className={`skeleton-shimmer ${className}`} style={style} />;
}

/**
 * Publication Research Card Skeleton
 * Matches ResearchCard layout (Cover image, category badges, bookmark btn, title, subtitle, footer)
 */
export function SkeletonCard() {
  return (
    <div className="skeleton-card-container">
      <SkeletonPulse className="skeleton-cover-img" />
      <div className="skeleton-header-row">
        <div className="skeleton-badges">
          <SkeletonPulse className="skeleton-badge" />
          <SkeletonPulse className="skeleton-badge" />
        </div>
        <SkeletonPulse className="skeleton-bookmark-btn" />
      </div>
      <div className="skeleton-title-lines">
        <SkeletonPulse className="skeleton-title-1" />
        <SkeletonPulse className="skeleton-title-2" />
      </div>
      <div className="skeleton-subtitle-lines">
        <SkeletonPulse className="skeleton-line-full" />
        <SkeletonPulse className="skeleton-line-partial" />
      </div>
      <div className="skeleton-card-footer">
        <div className="skeleton-author-group">
          <SkeletonPulse className="skeleton-avatar-circle" />
          <div className="skeleton-author-meta">
            <SkeletonPulse className="skeleton-author-name" />
            <SkeletonPulse className="skeleton-publish-date" />
          </div>
        </div>
        <SkeletonPulse className="skeleton-read-btn" />
      </div>
    </div>
  );
}

/**
 * Profile Page Skeleton
 * Matches Profile.jsx (Cover banner, circular picture, name, username, bio, meta chips, 3 stats cards, publication grid)
 */
export function SkeletonProfile() {
  return (
    <div className="skeleton-profile-container">
      {/* Hero Header Card */}
      <div className="skeleton-hero-card">
        <SkeletonPulse className="skeleton-banner-img" />
        <div className="skeleton-hero-content">
          <div className="skeleton-avatar-row">
            <SkeletonPulse className="skeleton-avatar-large" />
            <div className="skeleton-action-btns">
              <SkeletonPulse className="skeleton-btn-box" />
              <SkeletonPulse className="skeleton-btn-icon" />
            </div>
          </div>
          <div className="skeleton-identity-block">
            <SkeletonPulse className="skeleton-name-lg" />
            <SkeletonPulse className="skeleton-handle-sm" />
            <SkeletonPulse className="skeleton-pro-title" />
            <div className="skeleton-bio-lines">
              <SkeletonPulse className="skeleton-line-full" />
              <SkeletonPulse className="skeleton-line-partial" />
            </div>
            <div className="skeleton-meta-chips-row">
              <SkeletonPulse className="skeleton-meta-chip" />
              <SkeletonPulse className="skeleton-meta-chip" />
              <SkeletonPulse className="skeleton-meta-chip" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid (3 Cards) */}
      <div className="skeleton-stats-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-stat-card">
            <SkeletonPulse className="skeleton-stat-icon" />
            <div className="skeleton-stat-data">
              <SkeletonPulse className="skeleton-stat-value" />
              <SkeletonPulse className="skeleton-stat-label" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Bar Skeleton */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginTop: '8px' }}>
        <SkeletonPulse style={{ width: '110px', height: '32px', borderRadius: '8px' }} />
        <SkeletonPulse style={{ width: '90px', height: '32px', borderRadius: '8px' }} />
      </div>

      {/* Publications Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

/**
 * Publication Reader Details Skeleton
 * Matches ResearchDetails.jsx layout (Cover image, title, subtitle, author info, publish date, reading time, action buttons, multiple paragraphs)
 */
export function SkeletonPublication() {
  return (
    <div className="skeleton-reader-container">
      {/* Top Action Buttons (Like, Bookmark, Share, Listen) */}
      <div className="skeleton-reader-top-controls">
        <SkeletonPulse className="skeleton-circle-btn" />
        <SkeletonPulse className="skeleton-circle-btn" />
        <SkeletonPulse className="skeleton-circle-btn" />
        <SkeletonPulse className="skeleton-pill-btn" />
      </div>

      {/* Article Body Container */}
      <div className="skeleton-reader-frame">
        {/* Cover Image */}
        <SkeletonPulse className="skeleton-reader-cover" />

        {/* Taxonomy Badges */}
        <div className="skeleton-taxonomy-row">
          <SkeletonPulse className="skeleton-badge" style={{ width: '100px', height: '24px' }} />
          <SkeletonPulse className="skeleton-badge" style={{ width: '80px', height: '24px' }} />
        </div>

        {/* Title */}
        <div className="skeleton-title-lines">
          <SkeletonPulse style={{ width: '95%', height: '32px' }} />
          <SkeletonPulse style={{ width: '70%', height: '32px' }} />
        </div>

        {/* Subtitle */}
        <SkeletonPulse style={{ width: '85%', height: '18px', marginTop: '6px' }} />

        {/* Author Section */}
        <div className="skeleton-author-header">
          <SkeletonPulse className="skeleton-author-avatar-lg" />
          <div className="skeleton-author-info-lines" style={{ flex: 1 }}>
            <SkeletonPulse style={{ width: '180px', height: '18px' }} />
            <SkeletonPulse style={{ width: '280px', height: '14px' }} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <SkeletonPulse style={{ width: '110px', height: '12px' }} />
              <SkeletonPulse style={{ width: '80px', height: '12px' }} />
            </div>
          </div>
        </div>

        <SkeletonPulse style={{ width: '100%', height: '1px', margin: '12px 0' }} />

        {/* Paragraph 1 */}
        <div className="skeleton-paragraph-block">
          <SkeletonPulse style={{ width: '30%', height: '24px', marginBottom: '8px' }} />
          <SkeletonPulse className="skeleton-line-full" />
          <SkeletonPulse className="skeleton-line-full" />
          <SkeletonPulse className="skeleton-line-full" />
          <SkeletonPulse className="skeleton-line-partial" />
        </div>

        {/* Paragraph 2 */}
        <div className="skeleton-paragraph-block">
          <SkeletonPulse style={{ width: '40%', height: '24px', marginBottom: '8px' }} />
          <SkeletonPulse className="skeleton-line-full" />
          <SkeletonPulse className="skeleton-line-full" />
          <SkeletonPulse className="skeleton-line-partial" />
        </div>

        {/* Paragraph 3 */}
        <div className="skeleton-paragraph-block">
          <SkeletonPulse className="skeleton-line-full" />
          <SkeletonPulse className="skeleton-line-full" />
          <SkeletonPulse className="skeleton-line-partial" />
        </div>
      </div>
    </div>
  );
}

/**
 * Explore / Search Page Skeleton
 * Matches Explore.jsx (Search/Filter card with 2x2 grid, dropdown placeholders, results count, publication cards)
 */
export function SkeletonExplore() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Title & Subtitle */}
      <div>
        <SkeletonPulse style={{ width: '220px', height: '28px', marginBottom: '8px' }} />
        <SkeletonPulse style={{ width: '450px', height: '16px', maxWidth: '100%' }} />
      </div>

      {/* Filter Card */}
      <div className="skeleton-filter-card">
        <div className="skeleton-filter-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-form-group">
              <SkeletonPulse style={{ width: '110px', height: '14px' }} />
              <SkeletonPulse className="skeleton-input-field" />
            </div>
          ))}
        </div>
      </div>

      {/* Results Count Line */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <SkeletonPulse style={{ width: '160px', height: '18px' }} />
      </div>

      {/* Results Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

/**
 * Settings Page Skeleton
 * Matches Settings.jsx (Left nav menu, settings cards, toggle switches, input fields, buttons)
 */
export function SkeletonSettings() {
  return (
    <div className="skeleton-settings-container">
      {/* Header */}
      <div>
        <SkeletonPulse style={{ width: '200px', height: '28px', marginBottom: '8px' }} />
        <SkeletonPulse style={{ width: '380px', height: '16px', maxWidth: '100%' }} />
      </div>

      {/* Settings Grid */}
      <div className="skeleton-settings-grid">
        {/* Left Side Navigation Panel */}
        <div className="skeleton-settings-panel" style={{ gap: '12px' }}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonPulse key={i} style={{ width: '100%', height: '42px', borderRadius: '8px' }} />
          ))}
        </div>

        {/* Right Side Form View */}
        <div className="skeleton-settings-panel">
          <SkeletonPulse style={{ width: '180px', height: '22px', marginBottom: '12px' }} />
          <div className="skeleton-form-group">
            <SkeletonPulse style={{ width: '120px', height: '14px' }} />
            <SkeletonPulse className="skeleton-input-field" />
          </div>
          <div className="skeleton-form-group">
            <SkeletonPulse style={{ width: '140px', height: '14px' }} />
            <SkeletonPulse className="skeleton-input-field" />
          </div>
          <div className="skeleton-toggle-row">
            <div>
              <SkeletonPulse style={{ width: '220px', height: '16px', marginBottom: '4px' }} />
              <SkeletonPulse style={{ width: '180px', height: '12px' }} />
            </div>
            <SkeletonPulse className="skeleton-toggle-switch" />
          </div>
          <SkeletonPulse style={{ width: '150px', height: '40px', borderRadius: '8px', marginTop: '12px' }} />
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;
