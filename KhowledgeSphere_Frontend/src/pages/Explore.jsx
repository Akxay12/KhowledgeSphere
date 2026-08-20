import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useSearchParams, useNavigate, useNavigationType } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import { CATEGORIES, PUBLICATION_TYPES, LANGUAGES } from '../data/researchData';
import { fetchPublications, searchPublications, searchGlobal } from '../services/publicationService';
import { formatLabelToEnum } from '../lib/formatters';
import ResearchCard from '../components/ResearchCard';
import CustomDropdown from '../components/CustomDropdown';
import { SkeletonExplore } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import ImageWithFallback from '../components/ImageWithFallback';
import { useAuth } from '../context/AuthContext';
import { bookmarkApi } from '../api/bookmark';
import { API_BASE_URL } from '../api/client';
import { showToast } from '../lib/toast';
import { getScrollPosition, clearScrollPosition, getPageCache, savePageCache, getPreviousPath } from '../lib/profileNavigation';
import './Explore.css';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Cache validation and restoration logic
  const cached = getPageCache('explore');
  const isPop = useNavigationType() === 'POP';
  const hasValidCache = cached && Array.isArray(cached.allPapers) && cached.allPapers.length > 0;
  const shouldRestore = isPop && hasValidCache;
  const searchQuery = searchParams.get('q') || '';
  const shouldRestoreSearchResults = shouldRestore && searchQuery === (cached?.searchQuery || '');

  const [defaultPapers, setDefaultPapers] = useState(shouldRestore ? (cached.defaultPapers || []) : []);
  const [allPapers, setAllPapers] = useState(shouldRestore ? cached.allPapers : []);
  const [isLoading, setIsLoading] = useState(shouldRestore ? false : true);
  const [error, setError] = useState(shouldRestore ? (cached.error || null) : null);

  // Selected filters in local state
  const [selectedField, setSelectedField] = useState(shouldRestore ? (cached.selectedField || 'All Fields') : 'All Fields');
  const [selectedYear, setSelectedYear] = useState(shouldRestore ? (cached.selectedYear || 'All Years') : 'All Years');
  const [selectedLanguage, setSelectedLanguage] = useState(shouldRestore ? (cached.selectedLanguage || 'All Languages') : 'All Languages');
  const [selectedType, setSelectedType] = useState(shouldRestore ? (cached.selectedType || 'All Types') : 'All Types');

  // Search API States
  const [searchVal, setSearchVal] = useState(searchQuery);
  const [searchedResearches, setSearchedResearches] = useState(shouldRestoreSearchResults ? (cached.searchedResearches || []) : []);
  const [searchedUsers, setSearchedUsers] = useState(shouldRestoreSearchResults ? (cached.searchedUsers || []) : []);
  const [isSearching, setIsSearching] = useState(shouldRestoreSearchResults ? (cached.isSearching || false) : false);

  // Synchronize local input value with URL search query
  useEffect(() => {
    if (searchQuery !== searchVal) {
      setSearchVal(searchQuery);
    }
  }, [searchQuery]);

  // Debounced update of URL search params
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentQ = searchParams.get('q') || '';
      if (searchVal !== currentQ) {
        const params = new URLSearchParams(searchParams);
        if (searchVal.trim()) {
          params.set('q', searchVal);
        } else {
          params.delete('q');
        }
        setSearchParams(params, { replace: true });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchVal]);

  const mapTypeToEnum = (typeLabel) => {
    if (typeLabel === 'Research Paper') {
      return 'RESEARCH';
    }
    return formatLabelToEnum(typeLabel);
  };

  const hasActiveDropdownFilters = 
    selectedField !== 'All Fields' || 
    selectedYear !== 'All Years' || 
    selectedLanguage !== 'All Languages' || 
    selectedType !== 'All Types';

  // Synchronize state with cache
  useEffect(() => {
    if (defaultPapers && defaultPapers.length > 0) {
      savePageCache('explore', {
        allPapers,
        defaultPapers,
        isLoading,
        error,
        selectedField,
        selectedYear,
        selectedLanguage,
        selectedType,
        searchedResearches,
        searchedUsers,
        isSearching,
        searchQuery
      });
    }
  }, [
    allPapers,
    defaultPapers,
    isLoading,
    error,
    selectedField,
    selectedYear,
    selectedLanguage,
    selectedType,
    searchedResearches,
    searchedUsers,
    isSearching,
    searchQuery
  ]);

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    // Skip loading data on first mount if state is already restored from cache
    const isDataAlreadyRestored = searchQuery ? shouldRestoreSearchResults : shouldRestore;
    if (isDataAlreadyRestored && isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    isFirstRender.current = false;

    let active = true;

    const loadData = async () => {
      setError(null);

      const isInitialLoad = defaultPapers.length === 0 && !hasActiveDropdownFilters && !searchQuery;
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsSearching(true);
      }

      if (searchQuery) {
        try {
          const res = await searchGlobal(searchQuery);
          if (!active) return;
          if (res.success) {
            setSearchedResearches(res.data.researches || []);
            setSearchedUsers(res.data.users || []);
            setError(null);
          } else {
            setSearchedResearches([]);
            setSearchedUsers([]);
            setError(res.error || 'No results found');
          }
        } catch (err) {
          if (!active) return;
          setSearchedResearches([]);
          setSearchedUsers([]);
          setError('No results found');
        } finally {
          if (active) {
            setIsSearching(false);
            setIsLoading(false);
          }
        }
      } else {
        if (active) {
          setSearchedResearches([]);
          setSearchedUsers([]);
        }

        if (hasActiveDropdownFilters) {
          // Build search parameters dynamically
          const params = {};
          if (selectedField !== 'All Fields') {
            params.category = formatLabelToEnum(selectedField);
          }
          if (selectedYear !== 'All Years') {
            params.year = selectedYear;
          }
          if (selectedLanguage !== 'All Languages') {
            params.language = selectedLanguage;
          }
          if (selectedType !== 'All Types') {
            params.publicationType = mapTypeToEnum(selectedType);
          }

          try {
            const res = await searchPublications(params);
            if (!active) return;
            if (res.success) {
              if (!res.data || res.data.length === 0) {
                setAllPapers([]);
                setError('no publications found 😥');
              } else {
                setAllPapers(res.data);
                setError(null);
              }
            } else {
              setAllPapers([]);
              setError('no publications found 😥');
            }
          } catch (err) {
            if (!active) return;
            setAllPapers([]);
            setError('no publications found 😥');
          } finally {
            if (active) {
              setIsSearching(false);
              setIsLoading(false);
            }
          }
        } else {
          // MODE 1 - No dropdown filters active
          if (defaultPapers && defaultPapers.length > 0) {
            if (active) {
              setAllPapers(defaultPapers);
              setIsSearching(false);
              setIsLoading(false);
            }
          } else {
            try {
              const res = await fetchPublications();
              if (!active) return;
              if (res.success) {
                const reversed = res.data ? [...res.data].reverse() : [];
                setDefaultPapers(reversed);
                setAllPapers(reversed);
              } else {
                setError(res.error || 'Failed to load publications');
              }
            } catch (err) {
              if (!active) return;
              setError(err.message || 'Failed to load publications');
            } finally {
              if (active) {
                setIsSearching(false);
                setIsLoading(false);
              }
            }
          }
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [
    selectedField,
    selectedYear,
    selectedLanguage,
    selectedType,
    searchQuery,
    shouldRestore,
    shouldRestoreSearchResults
  ]);

  // Scroll Restoration
  useLayoutEffect(() => {
    if (!isLoading) {
      const savedScroll = getScrollPosition('explore');
      if (savedScroll > 0) {
        window.scrollTo({
          top: savedScroll,
          behavior: 'instant'
        });
        clearScrollPosition('explore');
      }
    }
  }, [isLoading]);

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
          console.error("Failed to load bookmarks in Explore:", err);
        });
    } else {
      setBookmarkedIds([]);
    }
  }, [isAuthenticated]);

  // Synchronize bookmark changes with backend
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

  const handleClearSearch = () => {
    setSearchVal('');
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  const handleClearAllFilters = () => {
    setSelectedField('All Fields');
    setSelectedYear('All Years');
    setSelectedLanguage('All Languages');
    setSelectedType('All Types');
    setSearchVal('');
    setSearchParams({});
  };

  // Dynamic Year List Extraction from default paper datasets
  const availableYears = Array.from(new Set(defaultPapers.map(p => p.year).filter(Boolean)))
    .sort()
    .reverse();
  const yearsOptions = ['All Years', ...availableYears];

  // Map option arrays from single source of truth for the dropdowns
  const fieldsOptions = ['All Fields', ...CATEGORIES];
  const languagesOptions = ['All Languages', ...LANGUAGES];
  const typesOptions = ['All Types', ...PUBLICATION_TYPES];

  // Dynamic Filtering Logic
  const filteredPapers = allPapers;

  // Filter searched researches by active dropdown parameters client-side
  const filteredSearchedResearches = searchedResearches.filter(paper => {
    if (selectedField !== 'All Fields' && paper.category !== selectedField) {
      return false;
    }
    if (selectedYear !== 'All Years' && paper.year !== selectedYear) {
      return false;
    }
    if (selectedLanguage !== 'All Languages' && paper.language !== selectedLanguage) {
      return false;
    }
    if (selectedType !== 'All Types' && paper.type !== selectedType) {
      return false;
    }
    return true;
  });

  const displayedResearches = searchQuery ? filteredSearchedResearches : filteredPapers;
  const displayedUsers = searchQuery ? searchedUsers : [];

  const isAnyFilterActive = 
    selectedField !== 'All Fields' || 
    selectedYear !== 'All Years' || 
    selectedLanguage !== 'All Languages' || 
    selectedType !== 'All Types' || 
    searchQuery.trim().length > 0;

  return (
    <div className="explore-container">
      {isLoading ? (
        <SkeletonExplore />
      ) : (
        <>
          {/* Title & Subtitle block */}
      <div className="explore-header-section">
        <div className="explore-title-row">
          <h2>Explore Research</h2>
          {searchQuery && (
            <div className="search-query-badge">
              <span>Search: &ldquo;{searchQuery}&rdquo;</span>
              <button onClick={handleClearSearch} title="Clear Search">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        <p className="explore-subtitle">
          Search and filter peer-reviewed literature and scholarly preprints across diverse scientific fields
        </p>

        {/* Main Search Bar */}
        <div className="explore-search-wrapper">
          <div className="explore-search-bar">
            <Search size={20} className="explore-search-icon" />
            <input
              type="text"
              className="explore-search-input"
              placeholder="Search research papers, topics, authors..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            {searchVal && (
              <button 
                type="button" 
                className="explore-search-clear" 
                onClick={handleClearSearch} 
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightweight 2x2 Filter Panel */}
      <div className="filter-card">
        <div className="filter-grid">
          {/* Research Field Filter */}
          <div className="filter-group">
            <label className="filter-label">Research Field</label>
            <CustomDropdown
              value={selectedField}
              options={fieldsOptions}
              onChange={setSelectedField}
            />
          </div>

          {/* Publication Year Filter */}
          <div className="filter-group">
            <label className="filter-label">Publication Year</label>
            <CustomDropdown
              value={selectedYear}
              options={yearsOptions}
              onChange={setSelectedYear}
            />
          </div>

          {/* Language Filter */}
          <div className="filter-group">
            <label className="filter-label">Language</label>
            <CustomDropdown
              value={selectedLanguage}
              options={languagesOptions}
              onChange={setSelectedLanguage}
            />
          </div>

          {/* Publication Type Filter */}
          <div className="filter-group">
            <label className="filter-label">Publication Type</label>
            <CustomDropdown
              value={selectedType}
              options={typesOptions}
              onChange={setSelectedType}
            />
          </div>
        </div>

        {isAnyFilterActive && (
          <div className="filter-card-footer">
            <button className="clear-filters-btn" onClick={handleClearAllFilters}>
              <X size={15} />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div>
        <div className="results-info-row">
          <div className="results-count">
            {displayedResearches.length} {displayedResearches.length === 1 ? 'Research Paper' : 'Research Papers'} 
            <span> found matches</span>
          </div>
        </div>

        {isSearching ? (
          <div className="search-loading-container">
            <div className="search-spinner"></div>
            <span className="search-loading-text">Loading...</span>
          </div>
        ) : (displayedResearches.length > 0 || displayedUsers.length > 0) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            
            {/* Users Section */}
            {displayedUsers.length > 0 && (
              <div>
                <h3 className="section-title">Users</h3>
                <div className="users-grid">
                  {displayedUsers.map((user) => (
                    <div 
                      key={user.userId || user.id} 
                      className="user-search-card" 
                      onClick={() => navigate(`/user/${user.userId || user.id}`)}
                    >
                      <div className="user-search-avatar">
                        <ImageWithFallback 
                          src={`${API_BASE_URL}/public/${user.userId || user.id}/picture`}
                          alt={user.name || user.username}
                          fallbackType="avatar"
                        />
                      </div>
                      <div className="user-search-info">
                        <h4 className="user-search-name">{user.name}</h4>
                        <span className="user-search-username">@{user.username}</span>
                        <p className="user-search-profession">{user.profession || 'Researcher'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Research Section */}
            {displayedResearches.length > 0 && (
              <div>
                {searchQuery && <h3 className="section-title">Research</h3>}
                <div className="results-grid"> 
                  {displayedResearches.map((paper) => {
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
              </div>
            )}
            
          </div>
        ) : (
          <EmptyState
            icon="Search"
            title={error || "No results found"}
            description={error ? "Try changing your filters or keywords." : "Try changing your keywords or filters."}
            actionText="Clear Filters"
            onAction={handleClearAllFilters}
          />
        )}
      </div>
      </>
      )}
    </div>
  );
}
