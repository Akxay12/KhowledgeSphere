import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import { CATEGORIES, PUBLICATION_TYPES, LANGUAGES } from '../data/researchData';
import { fetchPublications } from '../services/publicationService';
import ResearchCard from '../components/ResearchCard';
import CustomDropdown from '../components/CustomDropdown';
import { SkeletonExplore } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import './Explore.css';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Load user published papers dynamically
  const [allPapers, setAllPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchPublications()
      .then((res) => {
        setAllPapers(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load papers in search:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);


  // Selected filters in local state
  const [selectedField, setSelectedField] = useState('All Fields');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [selectedType, setSelectedType] = useState('All Types');

  // Bookmarking persistence
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('knowledgesphere_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Retrieve search query "q" from the global navigation
  const searchQuery = searchParams.get('q') || '';

  // Synchronize bookmark changes with localStorage
  const handleToggleBookmark = (id) => {
    setBookmarkedIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem('knowledgesphere_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const handleClearSearch = () => {
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  const handleClearAllFilters = () => {
    setSelectedField('All Fields');
    setSelectedYear('All Years');
    setSelectedLanguage('All Languages');
    setSelectedType('All Types');
    setSearchParams({});
  };

  // Dynamic Year List Extraction from combined paper datasets
  const availableYears = Array.from(new Set(allPapers.map(p => p.year).filter(Boolean)))
    .sort()
    .reverse();
  const yearsOptions = ['All Years', ...availableYears];

  // Map option arrays from single source of truth for the dropdowns
  const fieldsOptions = ['All Fields', ...CATEGORIES];
  const languagesOptions = ['All Languages', ...LANGUAGES];
  const typesOptions = ['All Types', ...PUBLICATION_TYPES];

  // Dynamic Filtering Logic
  const filteredPapers = allPapers.filter(paper => {
    // 1. Text Search Query matching case-insensitively across Title, Authors, and Abstract
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = paper.title.toLowerCase().includes(q);
      const matchAuthors = paper.authors.toLowerCase().includes(q);
      const matchAbstract = paper.abstract.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthors && !matchAbstract) {
        return false;
      }
    }

    // 2. Exact match filters
    if (selectedField !== 'All Fields' && paper.field !== selectedField) {
      return false;
    }
    if (selectedYear !== 'All Years' && paper.year !== selectedYear) {
      return false;
    }
    if (selectedLanguage !== 'All Languages' && (paper.language || 'English') !== selectedLanguage) {
      return false;
    }
    if (selectedType !== 'All Types' && paper.type !== selectedType) {
      return false;
    }

    return true;
  });

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
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                const params = new URLSearchParams(searchParams);
                if (val) {
                  params.set('q', val);
                } else {
                  params.delete('q');
                }
                setSearchParams(params, { replace: true });
              }}
            />
            {searchQuery && (
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
            {filteredPapers.length} {filteredPapers.length === 1 ? 'Research Paper' : 'Research Papers'} 
            <span> found matches</span>
          </div>
        </div>

        {filteredPapers.length > 0 ? (
          <div className="results-grid" style={{ marginTop: '20px' }}>
            {filteredPapers.map((paper) => {
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
            icon="Search"
            title="No results found"
            description="Try changing your keywords or filters."
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
