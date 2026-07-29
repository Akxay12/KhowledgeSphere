import React, { useState } from 'react';
import { BookOpen, User, Image as ImageIcon } from 'lucide-react';

export default function ImageWithFallback({
  src,
  alt = '',
  className = '',
  style = {},
  fallbackType = 'cover', // 'cover' | 'avatar' | 'banner' | 'generic'
  ...props
}) {
  const [hasError, setHasError] = useState(!src);

  if (hasError || !src) {
    if (fallbackType === 'avatar') {
      return (
        <div
          className={`image-fallback-avatar ${className}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-primary-light, #fef2f2)',
            color: 'var(--color-primary, #dc2626)',
            borderRadius: '50%',
            fontWeight: 600,
            fontSize: '1rem',
            width: '100%',
            height: '100%',
            userSelect: 'none',
            ...style
          }}
        >
          <User size={20} />
        </div>
      );
    }

    if (fallbackType === 'banner') {
      return (
        <div
          className={`image-fallback-banner ${className}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #881337 100%)',
            color: '#ffffff',
            width: '100%',
            height: '100%',
            ...style
          }}
        >
          <ImageIcon size={32} style={{ opacity: 0.6 }} />
        </div>
      );
    }

    return (
      <div
        className={`image-fallback-cover ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-card, #f8fafc)',
          border: '1px solid var(--color-border, #e2e8f0)',
          color: 'var(--color-text-muted, #64748b)',
          borderRadius: '8px',
          width: '100%',
          height: '100%',
          padding: '16px',
          boxSizing: 'border-box',
          ...style
        }}
      >
        <BookOpen size={28} strokeWidth={1.5} />
        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>KnowledgeSphere Article</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
