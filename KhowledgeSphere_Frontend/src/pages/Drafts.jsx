import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PenTool, FolderPlus } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import './Drafts.css';

export default function Drafts() {
  const navigate = useNavigate();

  return (
    <div className="drafts-container">
      {/* Header block */}
      <div className="drafts-header">
        <div>
          <h2>My Drafts</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage your unpublished research and ongoing scripts</p>
        </div>
        
        <button className="btn btn-primary" onClick={() => navigate('/publish')} style={{ display: 'flex', gap: '8px' }}>
          <PenTool size={16} />
          <span>New Draft</span>
        </button>
      </div>

      {/* Render requested empty state */}
      <div style={{ marginTop: '12px' }}>
        <EmptyState
          icon="PenTool"
          title="No Drafts Available"
          description="No Drafts Available. Compositions you save as drafts will appear in this list for further editing."
          actionText="Create New Draft"
          onAction={() => navigate('/publish')}
        />
      </div>
    </div>
  );
}
