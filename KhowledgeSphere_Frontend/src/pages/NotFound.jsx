import React from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorState from '../components/ErrorState';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '60px 20px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ErrorState
        type="404"
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        actionText="Go Home"
        onAction={() => navigate('/home')}
        secondaryActionText="Go Back"
        onSecondaryAction={() => navigate(-1)}
      />
    </div>
  );
}
