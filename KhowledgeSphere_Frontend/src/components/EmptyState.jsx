import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({
  icon = 'FileText',
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  isLoadingAction = false,
  variant = 'empty', // 'empty' | 'error' | 'info'
  className = ''
}) {
  const [internalLoading, setInternalLoading] = useState(false);

  // Resolve Lucide icon safely
  let IconComponent = Icons.FileText;
  if (typeof icon === 'string' && Icons[icon]) {
    IconComponent = Icons[icon];
  } else if (typeof icon === 'function' || typeof icon === 'object') {
    IconComponent = icon;
  }

  const handlePrimaryClick = async () => {
    if (!onAction) return;
    try {
      setInternalLoading(true);
      await Promise.resolve(onAction());
    } finally {
      setInternalLoading(false);
    }
  };

  const isBtnDisabled = isLoadingAction || internalLoading;

  return (
    <div className={`empty-state variant-${variant} ${className}`}>
      <div className="empty-state-icon-wrapper">
        <IconComponent size={30} strokeWidth={1.8} />
      </div>
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-desc">{description}</p>}
      {(actionText || secondaryActionText) && (
        <div className="empty-state-actions">
          {actionText && (
            <button
              className="btn-empty-action btn-empty-primary"
              onClick={handlePrimaryClick}
              disabled={isBtnDisabled}
            >
              {isBtnDisabled && <span className="btn-spinner" />}
              <span>{isBtnDisabled ? 'Processing...' : actionText}</span>
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              className="btn-empty-action btn-empty-secondary"
              onClick={onSecondaryAction}
              disabled={isBtnDisabled}
            >
              <span>{secondaryActionText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
