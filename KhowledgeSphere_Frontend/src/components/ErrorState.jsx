import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';

const ERROR_PRESETS = {
  network: {
    icon: 'WifiOff',
    title: 'Connection Lost',
    description: 'Please check your internet connection and try again.',
    actionText: 'Retry'
  },
  server: {
    icon: 'ServerCrash',
    title: "Something went wrong",
    description: "We're having trouble loading this content.",
    actionText: 'Try Again'
  },
  404: {
    icon: 'Compass',
    title: 'Page Not Found',
    description: "The page you're looking for doesn't exist or has been moved.",
    actionText: 'Go Home',
    secondaryActionText: 'Go Back'
  },
  publication_not_found: {
    icon: 'FileX',
    title: 'Publication Not Found',
    description: 'This publication may have been deleted or is no longer available.',
    actionText: 'Browse Publications'
  },
  profile_not_found: {
    icon: 'UserX',
    title: 'Profile Not Found',
    description: 'The requested profile could not be found.',
    actionText: 'Go Home'
  },
  access_denied: {
    icon: 'ShieldAlert',
    title: 'Access Restricted',
    description: "You don't have permission to access this page.",
    actionText: 'Return Home'
  },
  speech_unsupported: {
    icon: 'VolumeX',
    title: 'Listening is unavailable',
    description: "Your browser doesn't support the listening feature.",
    actionText: 'Continue Reading'
  },
  generic: {
    icon: 'AlertCircle',
    title: 'Unexpected Error',
    description: 'An unexpected issue occurred. Please try refreshing or returning home.',
    actionText: 'Try Again',
    secondaryActionText: 'Go Home'
  }
};

export default function ErrorState({
  type = 'generic',
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  isRetrying = false,
  className = ''
}) {
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);

  const preset = ERROR_PRESETS[type] || ERROR_PRESETS.generic;

  const finalTitle = title || preset.title;
  const finalDescription = description || preset.description;
  const finalActionText = actionText || preset.actionText;
  const finalSecondaryText = secondaryActionText || preset.secondaryActionText;

  // Default handler logic based on preset type if no custom callback passed
  const handlePrimaryAction = async () => {
    if (onAction) {
      setRetrying(true);
      try {
        await Promise.resolve(onAction());
      } finally {
        setRetrying(false);
      }
      return;
    }

    // Fallback default actions
    if (type === '404' || type === 'profile_not_found' || type === 'access_denied') {
      navigate('/home');
    } else if (type === 'publication_not_found') {
      navigate('/explore');
    } else {
      window.location.reload();
    }
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
      return;
    }

    if (type === '404') {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  return (
    <EmptyState
      icon={preset.icon}
      title={finalTitle}
      description={finalDescription}
      actionText={finalActionText}
      onAction={handlePrimaryAction}
      secondaryActionText={finalSecondaryText}
      onSecondaryAction={handleSecondaryAction}
      isLoadingAction={isRetrying || retrying}
      variant="error"
      className={className}
    />
  );
}
