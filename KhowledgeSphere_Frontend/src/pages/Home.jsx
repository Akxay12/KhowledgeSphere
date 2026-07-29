import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { fetchPublications } from '../services/publicationService';
import ResearchCard from '../components/ResearchCard';
import { SkeletonCard } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('for-you');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [papers, setPapers] = useState([]);

  // Bookmarking persistence
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('knowledgesphere_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchPublications({ tab: activeTab });
      if (res.success) {
        setPapers(res.data || []);
      } else {
        setError(res.error || 'Failed to load feed');
      }
    } catch (err) {
      setError(err.message || 'Error loading publications');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Handle bookmark toggle
  const handleToggleBookmark = (id) => {
    setBookmarkedIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('knowledgesphere_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const tabs = [
    { id: 'for-you', label: 'For You' },
    { id: 'following', label: 'Following' }
  ];

  return (
    <div className="feed-container">
      {/* Tabs */}
      <div className="tab-nav-wrapper" style={{ marginTop: 0 }}>
        <div className="feed-tabs">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`feed-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <button 
          className="btn-refresh-feed" 
          onClick={loadFeed}
          disabled={isLoading}
          title="Refresh Feed"
        >
          <RefreshCw size={15} className={isLoading ? 'spin-animation' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Guest Mode Banner */}
      {!isAuthenticated && !isLoading && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid #fecaca',
          borderRadius: '16px',
          padding: '20px 24px',
          marginTop: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          boxShadow: '0 10px 25px -5px rgba(122, 31, 31, 0.08), 0 4px 10px -2px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 300px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: '#fef2f2',
              color: '#7A1F1F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Join KnowledgeSphere
              </h4>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.45 }}>
                Join KnowledgeSphere to bookmark publications, follow authors, and publish your own research.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={{
                backgroundColor: '#7A1F1F',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(122, 31, 31, 0.22)'
              }}
              id="home-cta-btn-register"
            >
              <UserPlus size={16} />
              <span>Create Account</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: '#f8fafc',
                color: '#334155',
                border: '1.5px solid #cbd5e1',
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              id="home-cta-btn-signin"
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="feed-cards-grid" style={{ padding: '10px 0 30px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to Load Publications"
          message={error}
          onRetry={loadFeed}
        />
      ) : papers.length > 0 ? (
        <div className="feed-cards-grid" style={{ padding: '10px 0 30px' }}>
          {papers.map((paper) => {
            const isBookmarked = bookmarkedIds.includes(paper.id);
            return (
              <ResearchCard
                key={paper.id}
                paper={paper}
                isBookmarked={isBookmarked}
                onToggleBookmark={handleToggleBookmark}
                onReadArticle={() => navigate(`/research/${paper.id}`)}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="BookOpen"
          title="No publications available"
          description="Be the first to share knowledge with the community."
          actionText="Publish Research"
          onAction={() => navigate('/publish')}
        />
      )}
    </div>
  );
}

