import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { RefreshCw, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { fetchPublications, fetchFollowingPublications } from '../services/publicationService';
import ResearchCard from '../components/ResearchCard';
import { SkeletonCard } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { useAuth } from '../context/AuthContext';
import { bookmarkApi } from '../api/bookmark';
import { showToast } from '../lib/toast';
import { getScrollPosition, clearScrollPosition, getPageCache, savePageCache, getPreviousPath } from '../lib/profileNavigation';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, followingIds } = useAuth();

  // Cache validation and restoration logic
  const cached = getPageCache('home');
  const isPop = useNavigationType() === 'POP';
  
  const cachedFollowingKey = cached?.followingIdsKey || '';
  const currentFollowingKey = Array.from(followingIds || []).sort().join(',');
  const followListChanged = cachedFollowingKey && cachedFollowingKey !== currentFollowingKey;

  const hasValidCache = cached && (
    (Array.isArray(cached.papers) && cached.papers.length > 0) ||
    (Array.isArray(cached.followingPapers) && cached.followingPapers.length > 0)
  );
  const shouldRestore = isPop && hasValidCache;
  const shouldRestoreFollowing = shouldRestore && !followListChanged;

  const [activeTab, setActiveTab] = useState(shouldRestore && cached?.activeTab ? cached.activeTab : 'trending');
  const [hasFetchedTrending, setHasFetchedTrending] = useState(shouldRestore && typeof cached?.hasFetchedTrending === 'boolean' ? cached.hasFetchedTrending : false);
  const [papers, setPapers] = useState(shouldRestore ? (cached.papers || []) : []);
  const [isLoading, setIsLoading] = useState(shouldRestore && typeof cached?.isLoading === 'boolean' ? cached.isLoading : true);
  const [error, setError] = useState(shouldRestore ? cached.error : null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Following Tab States
  const [followingPapers, setFollowingPapers] = useState(shouldRestoreFollowing && cached?.followingPapers ? cached.followingPapers : []);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [followingError, setFollowingError] = useState(shouldRestoreFollowing ? cached.followingError : null);
  const [hasFetchedFollowing, setHasFetchedFollowing] = useState(shouldRestoreFollowing && typeof cached?.hasFetchedFollowing === 'boolean' ? cached.hasFetchedFollowing : false);

  useEffect(() => {
    savePageCache('home', { 
      papers, 
      isLoading, 
      error, 
      activeTab,
      followingPapers,
      followingError,
      hasFetchedTrending,
      hasFetchedFollowing,
      followingIdsKey: currentFollowingKey
    });
  }, [papers, isLoading, error, activeTab, followingPapers, followingError, hasFetchedTrending, hasFetchedFollowing, currentFollowingKey]);

  // Bookmarking persistence
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      bookmarkApi.getBookmarks()
        .then((res) => {
          const apiIds = Array.isArray(res) 
            ? res 
            : (res && Array.isArray(res.data) ? res.data : []);
          setBookmarkedIds(apiIds.map(id => typeof id === 'object' ? (id.publicationId || id.id) : id));
        })
        .catch((err) => {
          console.error("Failed to load bookmarks in Home:", err);
        });
    } else {
      setBookmarkedIds([]);
    }
  }, [isAuthenticated]);

  const loadFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchPublications();
      if (res.success) {
        setPapers(res.data || []);
      } else {
        setError(res.error || 'Failed to load feed');
      }
    } catch (err) {
      setError(err.message || 'Error loading publications');
    } finally {
      setIsLoading(false);
      setHasFetchedTrending(true);
    }
  }, []);

  const handleRefreshFeed = async () => {
    setIsRefreshing(true);
    setError(null);
    const apiPromise = fetchPublications();
    const delayPromise = new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const [res] = await Promise.all([apiPromise, delayPromise]);
      if (res.success) {
        setPapers(res.data || []);
      } else {
        setError(res.error || 'Failed to load feed');
      }
    } catch (err) {
      setError(err.message || 'Error loading publications');
    } finally {
      setIsRefreshing(false);
      setHasFetchedTrending(true);
    }
  };

  const loadFollowingFeed = useCallback(async () => {
    setIsFollowingLoading(true);
    setFollowingError(null);
    setFollowingPapers([]);
    try {
      const res = await fetchFollowingPublications();
      if (res.success) {
        setFollowingPapers(res.data || []);
      } else {
        setFollowingError(res.error || 'Unable to load following feed.');
      }
    } catch (err) {
      setFollowingError(err.message || 'Unable to load following feed.');
    } finally {
      setIsFollowingLoading(false);
      setHasFetchedFollowing(true);
    }
  }, []);

  const handleRefreshFollowingFeed = async () => {
    setIsFollowingLoading(true);
    setFollowingError(null);
    setFollowingPapers([]);
    const apiPromise = fetchFollowingPublications();
    const delayPromise = new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const [res] = await Promise.all([apiPromise, delayPromise]);
      if (res.success) {
        setFollowingPapers(res.data || []);
      } else {
        setFollowingError(res.error || 'Unable to load following feed.');
      }
    } catch (err) {
      setFollowingError(err.message || 'Unable to load following feed.');
    } finally {
      setIsFollowingLoading(false);
      setHasFetchedFollowing(true);
    }
  };

  // Dynamically listen to follow/unfollow actions while Home is mounted
  const prevFollowingKeyRef = useRef(currentFollowingKey);
  useEffect(() => {
    if (prevFollowingKeyRef.current !== currentFollowingKey) {
      prevFollowingKeyRef.current = currentFollowingKey;
      setHasFetchedFollowing(false);
      if (activeTab === 'following') {
        loadFollowingFeed();
      }
    }
  }, [currentFollowingKey, activeTab, loadFollowingFeed]);

  useEffect(() => {
    if (activeTab === 'trending' && !shouldRestore && !hasFetchedTrending) {
      loadFeed();
    }
  }, [loadFeed, shouldRestore, activeTab, hasFetchedTrending]);

  useEffect(() => {
    if (activeTab === 'following' && isAuthenticated && !shouldRestoreFollowing && !hasFetchedFollowing) {
      loadFollowingFeed();
    }
  }, [loadFollowingFeed, shouldRestoreFollowing, activeTab, isAuthenticated, hasFetchedFollowing]);

  // Scroll Restoration
  useLayoutEffect(() => {
    const currentLoading = activeTab === 'trending' ? isLoading : isFollowingLoading;
    if (!currentLoading) {
      const savedScroll = getScrollPosition('home');
      if (savedScroll > 0) {
        window.scrollTo({
          top: savedScroll,
          behavior: 'instant'
        });
        clearScrollPosition('home');
      }
    }
  }, [isLoading, isFollowingLoading, activeTab]);

  // Handle bookmark toggle
  const handleToggleBookmark = async (id) => {
    if (!isAuthenticated) return;
    try {
      const res = await bookmarkApi.addBookmark(id);
      if (res && typeof res.bookmarked === 'boolean') {
        setBookmarkedIds(prev => {
          if (res.bookmarked) {
            return prev.includes(id) ? prev : [...prev, id];
          } else {
            return prev.filter(item => item !== id);
          }
        });
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      showToast('Failed to update bookmark');
    }
  };

  return (
    <div className="feed-container">
      {/* Home Title */}
      <div className="feed-header-section">
        <div className="feed-title-block">
          <h2>Home</h2>
        </div>
      </div>

      {/* Feed Header */}
      <div className="tab-nav-wrapper" style={{ marginTop: 0, justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)' }}>
        <div className="feed-tabs">
          <div 
            className={`feed-tab ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => {
              if (activeTab !== 'following') {
                setActiveTab('following');
                if (isAuthenticated) {
                  loadFollowingFeed();
                }
              }
            }}
          >
            Following
          </div>
          <div 
            className={`feed-tab ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => {
              if (activeTab !== 'trending') {
                setActiveTab('trending');
              }
            }}
          >
            Trending
          </div>
        </div>

        {((activeTab === 'trending') || (activeTab === 'following' && isAuthenticated)) && (
          <button 
            className="btn-refresh-feed" 
            onClick={activeTab === 'trending' ? handleRefreshFeed : handleRefreshFollowingFeed}
            disabled={isLoading || isRefreshing || isFollowingLoading}
            title="Refresh Feed"
          >
            <RefreshCw size={15} className={isLoading || isRefreshing || isFollowingLoading ? 'spin-animation' : ''} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Guest Mode Banner - Only shown on Trending tab for guests */}
      {!isAuthenticated && activeTab === 'trending' && !isLoading && (
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

      {activeTab === 'trending' ? (
        isLoading ? (
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
        )
      ) : (
        // Following Tab
        !isAuthenticated ? (
          <EmptyState
            icon="Users"
            title="Following"
            description="Log in or sign up to see followers feed"
            actionText="Sign In"
            onAction={() => navigate('/login')}
            secondaryActionText="Create Account"
            onSecondaryAction={() => navigate('/register')}
          />
        ) : isFollowingLoading ? (
          <div className="feed-cards-grid" style={{ padding: '10px 0 30px' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : followingError ? (
          <ErrorState
            title="Unable to load following feed."
            message="Please try again."
            onRetry={loadFollowingFeed}
          />
        ) : followingPapers.length > 0 ? (
          <div className="feed-cards-grid" style={{ padding: '10px 0 30px' }}>
            {followingPapers.map((paper) => {
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
            icon="Users"
            title="No research from people you follow yet."
            description="Find authors you like and follow them to see their latest work here."
            actionText="Explore Authors"
            onAction={() => navigate('/explore')}
          />
        )
      )}
    </div>
  );
}

