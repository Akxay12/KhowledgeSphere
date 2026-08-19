import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ResearchCard from '../components/ResearchCard';
import { SkeletonCard } from '../components/SkeletonLoader';
import { fetchPublications } from '../services/publicationService';
import { bookmarkApi } from '../api/bookmark';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../lib/toast';
import './Bookmarks.css';

export default function Bookmarks() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [allPapers, setAllPapers] = useState([]);
  const [removingBookmarkIds, setRemovingBookmarkIds] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    
    const loadData = async () => {
      try {
        const pubPromise = fetchPublications();
        const bookmarkPromise = isAuthenticated 
          ? bookmarkApi.getBookmarks() 
          : Promise.resolve([]);
          
        const [pubRes, bookmarkRes] = await Promise.all([pubPromise, bookmarkPromise]);
        
        setAllPapers(pubRes.data || []);
        
        const apiIds = Array.isArray(bookmarkRes) 
          ? bookmarkRes 
          : (bookmarkRes && Array.isArray(bookmarkRes.data) ? bookmarkRes.data : []);
        setBookmarkedIds(apiIds.map(id => typeof id === 'object' ? (id.publicationId || id.id) : id));
      } catch (err) {
        console.error('Error loading data for Bookmarks page:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated]);

  const bookmarkedPapers = allPapers.filter(paper => bookmarkedIds.includes(paper.id));

  const handleToggleBookmark = async (id) => {
    if (!isAuthenticated) return;
    if (removingBookmarkIds.includes(id)) return; // Prevent double trigger during animation
    try {
      const res = await bookmarkApi.addBookmark(id);
      if (res && typeof res.bookmarked === 'boolean') {
        if (res.bookmarked) {
          setBookmarkedIds(prev => prev.includes(id) ? prev : [...prev, id]);
        } else {
          // Immediately trigger unbookmarked state in ResearchCard icon and add transition anim
          setRemovingBookmarkIds(prev => [...prev, id]);
          
          setTimeout(() => {
            setBookmarkedIds(prev => prev.filter(item => item !== id));
            setRemovingBookmarkIds(prev => prev.filter(item => item !== id));
          }, 400); // 400ms matches the Bookmarks.css exit animation duration
        }
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      showToast('Failed to update bookmark');
    }
  };


  return (
    <div className="bookmarks-container">
      {/* Header section */}
      <div className="bookmarks-header">
        <div>
          <h2>My Bookmarks</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Access all your saved research papers and scholarly articles</p>
        </div>
      </div>

      {/* Bookmarked list */}
      <div style={{ marginTop: '12px' }}>
        {isLoading ? (
          <div className="bookmarks-cards-grid">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : bookmarkedPapers.length > 0 ? (
          <div className="bookmarks-cards-grid">
            {bookmarkedPapers.map((paper) => {
              const isRemoving = removingBookmarkIds.includes(paper.id);
              return (
                <div
                  key={paper.id}
                  className={isRemoving ? 'bookmark-card-removing-anim' : ''}
                >
                  <ResearchCard
                    paper={paper}
                    isBookmarked={!isRemoving}
                    onToggleBookmark={handleToggleBookmark}
                    onReadArticle={() => navigate(`/research/${paper.id}`)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="Bookmark"
            title="No bookmarked publications yet."
            description="Save publications to read them later."
            actionText="Browse Publications"
            onAction={() => navigate('/explore')}
          />
        )}
      </div>
    </div>
  );
}

