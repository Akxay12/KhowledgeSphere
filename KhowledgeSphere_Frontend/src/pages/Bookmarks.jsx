import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ResearchCard from '../components/ResearchCard';
import { SkeletonCard } from '../components/SkeletonLoader';
import { fetchPublications } from '../services/publicationService';
import { bookmarkApi } from '../api/bookmark';
import { useAuth } from '../context/AuthContext';
import './Bookmarks.css';

export default function Bookmarks() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('knowledgesphere_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [allPapers, setAllPapers] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    fetchPublications()
      .then((res) => {
        setAllPapers(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load publications in bookmarks:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    if (isAuthenticated) {
      bookmarkApi.getBookmarks()
        .then((res) => {
          if (res.data) {
            const apiIds = res.data.map(b => b.publicationId || b.id);
            setBookmarkedIds(prev => Array.from(new Set([...prev, ...apiIds])));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const bookmarkedPapers = allPapers.filter(paper => bookmarkedIds.includes(paper.id));

  const handleToggleBookmark = (id) => {
    setBookmarkedIds(prev => {
      const isBookmarked = prev.includes(id);
      const next = isBookmarked ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('knowledgesphere_bookmarks', JSON.stringify(next));

      if (isAuthenticated) {
        if (isBookmarked) {
          bookmarkApi.removeBookmark(id).catch(() => {});
        } else {
          bookmarkApi.addBookmark(id).catch(() => {});
        }
      }

      return next;
    });
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
            {bookmarkedPapers.map((paper) => (
              <ResearchCard
                key={paper.id}
                paper={paper}
                isBookmarked={true}
                onToggleBookmark={handleToggleBookmark}
                onReadArticle={() => navigate(`/research/${paper.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="Bookmark"
            title="No bookmarks yet"
            description="Save publications to read them later."
            actionText="Browse Publications"
            onAction={() => navigate('/explore')}
          />
        )}
      </div>
    </div>
  );
}
