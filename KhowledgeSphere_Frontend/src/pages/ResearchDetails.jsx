import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Bookmark, Share2, Calendar, Clock, MessageSquare, Send, BookOpen, User, Sparkles, ExternalLink, Headphones, Square, Play, UserPlus } from 'lucide-react';
import { fetchPublicationById, fetchPublications } from '../services/publicationService';

import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import ImageWithFallback from '../components/ImageWithFallback';
import { SkeletonPublication } from '../components/SkeletonLoader';
import AuthPromptModal from '../components/AuthPromptModal';
import './ResearchDetails.css';


// Sentence splitter helper for smooth speech read-along highlighting
const splitIntoSentences = (text) => {
  if (!text) return [];
  const clean = typeof text === 'string' ? text.replace(/<[^>]+>/g, '').trim() : '';
  if (!clean) return [];
  const matches = clean.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g);
  if (!matches) return [clean];
  return matches.map(s => s.trim()).filter(Boolean);
};

// Component for rendering text with light blue speech highlight on currently spoken sentence
function HighlightableText({
  text,
  speechIdPrefix,
  activeSpeechId,
  className = '',
  tag: Tag = 'p',
  style,
  dangerouslySetHtml
}) {
  if (text === null || text === undefined) {
    return <Tag className={className} style={style} />;
  }

  const textStr = typeof text === 'string' ? text : String(text);
  const hasHtml = dangerouslySetHtml || /<[a-z][\s\S]*>/i.test(textStr);

  if (hasHtml) {
    let contentHtml = textStr;
    // Strip redundant outer <p> wrapper if rendering inside <p> or inline tag to prevent invalid nested DOM elements
    if (Tag === 'p' || Tag === 'h1' || Tag === 'h2' || Tag === 'h3' || Tag === 'blockquote' || Tag === 'li') {
      contentHtml = contentHtml.replace(/^<p\b[^>]*>/i, '').replace(/<\/p>$/i, '');
    }

    const speechId = `${speechIdPrefix}-0`;
    const isHighlighted = activeSpeechId && activeSpeechId.startsWith(`${speechIdPrefix}-`);

    return (
      <Tag
        id={speechId}
        className={`${className} ${isHighlighted ? 'speech-highlight' : ''}`.trim()}
        style={style}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  }

  const sentences = splitIntoSentences(textStr);

  if (sentences.length <= 1) {
    const speechId = `${speechIdPrefix}-0`;
    const isHighlighted = activeSpeechId === speechId;
    return (
      <Tag
        id={speechId}
        className={`${className} ${isHighlighted ? 'speech-highlight' : ''}`.trim()}
        style={style}
      >
        {textStr}
      </Tag>
    );
  }

  return (
    <Tag className={className} style={style}>
      {sentences.map((sentence, sIdx) => {
        const speechId = `${speechIdPrefix}-${sIdx}`;
        const isHighlighted = activeSpeechId === speechId;
        return (
          <span
            key={sIdx}
            id={speechId}
            className={isHighlighted ? 'speech-highlight' : ''}
          >
            {sentence}{' '}
          </span>
        );
      })}
    </Tag>
  );
}

export default function ResearchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [paper, setPaper] = useState(null);
  const [allPapers, setAllPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Speech synthesis state
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeechInitializing, setIsSpeechInitializing] = useState(false);
  const [speechErrorModal, setSpeechErrorModal] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState(null);

  const speechItemsRef = useRef([]);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    fetchPublicationById(id)
      .then((res) => {
        if (res.success && res.data) {
          setPaper(res.data);
        } else {
          setPaper(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching paper:', err);
        setPaper(null);
      })
      .finally(() => {
        setLoading(false);
      });

    fetchPublications()
      .then((res) => {
        setAllPapers(res.data || []);
      })
      .catch(() => {});
  }, [id]);



  const getReferencesForPaper = (currentPaper) => {
    if (!currentPaper) return [];
    
    // If this is a custom user publication, return its dedicated bibliography references!
    if (currentPaper.docReferences && currentPaper.docReferences.length > 0) {
      return currentPaper.docReferences.map((ref, i) => ({
        id: i + 1,
        citation: `${ref.title} (${ref.type.toUpperCase()})${ref.description ? ` - ${ref.description}` : ''}`,
        description: ref.description || 'Bibliography resource citation.',
        url: ref.url,
        fileData: ref.fileData,
        fileName: ref.fileName
      }));
    }
    if (currentPaper.id === 'paper-1') {
      return [
        {
          id: 1,
          citation: "Russell, S., & Norvig, P. (2021). Artificial Intelligence: A Modern Approach (4th ed.). Pearson.",
          description: "A comprehensive textbook covering modern AI concepts, reasoning systems, search algorithms, and machine learning foundations.",
          url: "https://aima.cs.berkeley.edu/"
        },
        {
          id: 2,
          citation: "Marcus, G. (2020). The Next Decades in AI: Cognitive Science Meets Deep Learning. arXiv preprint arXiv:2002.06177.",
          description: "An influential position paper outlining the critical limitations of deep learning and advocating for neural-symbolic integration to achieve robust, aligned intelligence.",
          url: "https://arxiv.org/abs/2002.06177"
        },
        {
          id: 3,
          citation: "Sutton, R. S. (2019). The Bitter Lesson. Incomplete Ideas Blog.",
          description: "A philosophical and historical examination of artificial intelligence research, demonstrating that methods leveraging computational power eventually outperform human-designed heuristics.",
          url: "http://www.incompleteideas.net/IncIdeas/BitterLesson.html"
        }
      ];
    }
    if (currentPaper.id === 'paper-2') {
      return [
        {
          id: 1,
          citation: "Searle, J. R. (1980). Minds, brains, and programs. Behavioral and Brain Sciences, 3(3), 417-424.",
          description: "The seminal philosophical paper introducing the Chinese Room thought experiment, challenging the notion of strong artificial intelligence and purely computational understanding.",
          url: "https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/abs/minds-brains-and-programs/C4C79C92C0742E29092896FE2285BC2C"
        },
        {
          id: 2,
          citation: "Chalmers, D. J. (1995). Facing up to the problem of consciousness. Journal of Consciousness Studies, 2(3), 200-219.",
          description: "Explores the fundamental distinction between the easy problems of behavioral explanation and the hard problem of subjective experience in conscious minds.",
          url: "http://consc.net/papers/facing.html"
        },
        {
          id: 3,
          citation: "Dennett, D. C. (1987). The Intentional Stance. MIT Press.",
          description: "A foundational text on cognitive theory, describing how we attribute beliefs, desires, and rationality to complex organisms and automated machines to predict their behaviors.",
          url: "https://mitpress.mit.edu/9780262540537/the-intentional-stance/"
        }
      ];
    }

    const authorLastName = currentPaper.authors ? currentPaper.authors.split(' ')[0].replace(/,/g, '') : 'Author';
    return [
      {
        id: 1,
        citation: `${authorLastName}, A. et al. (${currentPaper.year}). Emerging paradigms in ${currentPaper.field.split('/')[1] || currentPaper.field}. Global Journal of Advanced Research, 14(2), pp. 118-132.`,
        description: `A foundational academic study detailing innovative research models, practical case observations, and core methodologies in ${currentPaper.field.toLowerCase()}.`,
        url: "https://scholar.google.com"
      },
      {
        id: 2,
        citation: `International Scholarly Consortium. (${parseInt(currentPaper.year) - 2 || 2024}). Methodological safety, logical alignment, and quality assurance frameworks in modern decentralized research. Scholarly Agency Review, 42(1).`,
        description: `An extensively peer-reviewed whitepaper laying out global industry guidelines and compliance standards for research validation in the global community.`,
        url: ""
      }
    ];
  };

  const references = getReferencesForPaper(paper);

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionText, setAuthActionText] = useState('');

  useEffect(() => {
    if (!paper) return;
    try {
      const saved = localStorage.getItem('knowledgesphere_bookmarks');
      const parsed = saved ? JSON.parse(saved) : [];
      setIsBookmarked(parsed.includes(paper.id));
    } catch {
      setIsBookmarked(false);
    }
  }, [paper]);

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  const handleLikeClick = () => {
    if (!isAuthenticated) {
      setAuthActionText('like publications');
      setShowAuthModal(true);
      return;
    }
    setIsLiked(!isLiked);
  };

  const handleBookmarkClick = () => {
    if (!isAuthenticated) {
      setAuthActionText('save bookmarks');
      setShowAuthModal(true);
      return;
    }
    handleToggleBookmark();
  };

  const handleFollowClick = () => {
    if (!isAuthenticated) {
      setAuthActionText('follow authors');
      setShowAuthModal(true);
      return;
    }
    setIsFollowing(!isFollowing);
  };


  // Sync bookmark to local storage
  const handleToggleBookmark = () => {
    if (!paper) return;
    try {
      const saved = localStorage.getItem('knowledgesphere_bookmarks');
      let parsed = saved ? JSON.parse(saved) : [];
      if (parsed.includes(paper.id)) {
        parsed = parsed.filter(item => item !== paper.id);
        setIsBookmarked(false);
      } else {
        parsed.push(paper.id);
        setIsBookmarked(true);
      }
      localStorage.setItem('knowledgesphere_bookmarks', JSON.stringify(parsed));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthActionText('post comments and peer feedback');
      setShowAuthModal(true);
      return;
    }
    if (!commentText.trim()) return;


    const newComment = {
      id: Date.now(),
      author: 'Scholar User',
      handle: '@scholar',
      text: commentText,
      date: 'Just now'
    };

    setComments([newComment, ...comments]);
    setCommentText('');
  };

  // Extract primary initials for the author avatar
  const getInitials = (authorsStr) => {
    if (!authorsStr) return 'A';
    const clean = authorsStr.replace(/(Dr\.|Prof\.|PhD|M\.D\.)/g, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return clean.substring(0, 2).toUpperCase();
  };

  // Extract readable speech units excluding references and author metadata
  const extractSpeechItems = (currentPaper) => {
    if (!currentPaper) return [];
    const items = [];

    // 1. Title
    if (currentPaper.title) {
      const titleSentences = splitIntoSentences(currentPaper.title);
      titleSentences.forEach((sText, sIdx) => {
        items.push({
          id: `speech-title-${sIdx}`,
          text: sText,
        });
      });
    }

    // 2. Subtitle / Summary
    const subtitle = `An in-depth empirical exploration concerning ${currentPaper.field ? currentPaper.field.toLowerCase() : 'research'} methodologies and academic impacts.`;
    const subtitleSentences = splitIntoSentences(subtitle);
    subtitleSentences.forEach((sText, sIdx) => {
      items.push({
        id: `speech-subtitle-${sIdx}`,
        text: sText,
      });
    });

    // 3. Main Body Content
    if (currentPaper.blocks && currentPaper.blocks.length > 0) {
      currentPaper.blocks.forEach((block, bIdx) => {
        if (block.type === 'heading-2' || block.type === 'paragraph' || block.type === 'quote') {
          const rawText = block.content ? block.content.replace(/<[^>]+>/g, '').trim() : '';
          if (rawText) {
            const sentences = splitIntoSentences(rawText);
            sentences.forEach((sText, sIdx) => {
              items.push({
                id: `speech-block-${bIdx}-sent-${sIdx}`,
                text: sText,
              });
            });
          }
        } else if (block.type === 'list') {
          (block.items || []).forEach((itemText, iIdx) => {
            const rawItem = itemText ? itemText.replace(/<[^>]+>/g, '').trim() : '';
            if (rawItem) {
              const sentences = splitIntoSentences(rawItem);
              sentences.forEach((sText, sIdx) => {
                items.push({
                  id: `speech-block-${bIdx}-item-${iIdx}-sent-${sIdx}`,
                  text: sText,
                });
              });
            }
          });
        }
      });
    } else if (currentPaper.content) {
      const sections = currentPaper.content.split('\n\n');
      sections.forEach((section, sIdx) => {
        const trimmed = section.trim();
        if (!trimmed || trimmed.startsWith('Full Article Content:')) return;

        if (trimmed.startsWith('- ') || trimmed.includes('\n- ')) {
          const listItems = trimmed
            .split('\n')
            .map(line => line.replace(/^-\s*/, '').trim())
            .filter(Boolean);
          listItems.forEach((itemText, lIdx) => {
            const sentences = splitIntoSentences(itemText);
            sentences.forEach((sText, sIdxSent) => {
              items.push({
                id: `speech-content-${sIdx}-item-${lIdx}-sent-${sIdxSent}`,
                text: sText,
              });
            });
          });
        } else {
          const cleanText = trimmed.replace(/^###\s*/, '').replace(/^##\s*/, '').replace(/^>\s*/, '').trim();
          if (cleanText) {
            const sentences = splitIntoSentences(cleanText);
            sentences.forEach((sText, sIdxSent) => {
              items.push({
                id: `speech-content-${sIdx}-sent-${sIdxSent}`,
                text: sText,
              });
            });
          }
        }
      });
    }

    return items;
  };

  // Auto-scroll highlighted sentence into view
  useEffect(() => {
    if (activeSpeechId) {
      const el = document.getElementById(activeSpeechId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeSpeechId]);

  // Cleanup speech synthesis on unmount or publication change
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        isCancelledRef.current = true;
        window.speechSynthesis.cancel();
      }
    };
  }, [id]);

  const handleStopListening = () => {
    isCancelledRef.current = true;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setIsPaused(false);
    setIsSpeechInitializing(false);
    setActiveSpeechId(null);
  };

  const speakItem = (index) => {
    if (isCancelledRef.current) return;
    const items = speechItemsRef.current;

    if (index >= items.length) {
      // Finished reading publication content automatically before References
      handleStopListening();
      return;
    }

    const currentItem = items[index];
    setActiveSpeechId(currentItem.id);

    const utterance = new SpeechSynthesisUtterance(currentItem.text);
    utterance.rate = 0.95; // Natural clear pace

    utterance.onstart = () => {
      setIsSpeechInitializing(false);
    };

    utterance.onend = () => {
      if (!isCancelledRef.current) {
        speakItem(index + 1);
      }
    };

    utterance.onerror = (e) => {
      setIsSpeechInitializing(false);
      if (!isCancelledRef.current && e.error !== 'interrupted' && e.error !== 'canceled') {
        speakItem(index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStartListen = () => {
    if (!('speechSynthesis' in window)) {
      setSpeechErrorModal(true);
      return;
    }

    try {
      isCancelledRef.current = false;
      window.speechSynthesis.cancel();

      const items = extractSpeechItems(paper);
      speechItemsRef.current = items;

      if (items.length === 0) return;

      setIsSpeechInitializing(true);
      setIsListening(true);
      setIsPaused(false);

      speakItem(0);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      setSpeechErrorModal(true);
    }
  };

  const handleToggleStopResume = () => {
    if (!isListening) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // Early return for loading
  if (loading) {
    return (
      <div className="reader-wrapper">
        <SkeletonPublication />
      </div>
    );
  }

  // Publication Not Found error state
  if (!paper) {
    return (
      <div className="reader-wrapper" style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
        <ErrorState
          type="publication_not_found"
          title="Publication Not Found"
          description="This publication may have been deleted or is no longer available."
          actionText="Browse Publications"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  // Get reading time
  const readingTime = Math.max(3, Math.ceil((paper.content?.split(/\s+/).length || 200) / 180));

  // Find academic institution mock based on author
  const getAffiliation = (authors) => {
    if (authors.includes('Jenkins')) return 'MIT Cognitive Science & Artificial Intelligence Lab';
    if (authors.includes('Vance')) return 'University of Toronto, Department of Philosophy & Epistemology';
    return 'Stanford Center for Advanced Study & Digital Humanities';
  };

  // Parse plain-text / rich structure into beautiful HTML blocks with speech highlight support
  const renderArticleContent = (text) => {
    if (!text) return null;

    const sections = text.split('\n\n');
    return sections.map((section, idx) => {
      const trimmed = section.trim();
      if (!trimmed) return null;

      // Filter out redundant full article title introduction if any
      if (trimmed.startsWith('Full Article Content:')) return null;

      // Identify major subheadings
      const isHeader = trimmed.length < 50 && (
        trimmed === 'Abstract' ||
        trimmed === 'Methodology' ||
        trimmed === 'Results & Future Directions' ||
        trimmed === 'Key Arguments' ||
        trimmed === 'Conclusion' ||
        trimmed.startsWith('###') ||
        trimmed.startsWith('##')
      );

      if (isHeader) {
        const headerText = trimmed.replace(/^###\s*/, '').replace(/^##\s*/, '');
        return (
          <HighlightableText
            key={idx}
            text={headerText}
            speechIdPrefix={`speech-content-${idx}-sent`}
            activeSpeechId={activeSpeechId}
            tag="h2"
            className="reader-heading"
          />
        );
      }

      // Check if list
      if (trimmed.startsWith('- ') || trimmed.includes('\n- ')) {
        const listItems = trimmed
          .split('\n')
          .map(line => line.replace(/^-\s*/, '').trim())
          .filter(Boolean);
        return (
          <ul key={idx} className="reader-bullet-list">
            {listItems.map((item, i) => (
              <HighlightableText
                key={i}
                text={item}
                speechIdPrefix={`speech-content-${idx}-item-${i}-sent`}
                activeSpeechId={activeSpeechId}
                tag="li"
              />
            ))}
          </ul>
        );
      }

      // Check if quote
      if (trimmed.startsWith('>') || trimmed.startsWith('“')) {
        return (
          <HighlightableText
            key={idx}
            text={trimmed.replace(/^>\s*/, '')}
            speechIdPrefix={`speech-content-${idx}-sent`}
            activeSpeechId={activeSpeechId}
            tag="blockquote"
            className="reader-quote"
          />
        );
      }

      // Default high-readability paragraph
      return (
        <HighlightableText
          key={idx}
          text={trimmed}
          speechIdPrefix={`speech-content-${idx}-sent`}
          activeSpeechId={activeSpeechId}
          tag="p"
          className="reader-paragraph"
        />
      );
    });
  };

  // Filter other papers for "Related Articles"
  const relatedArticles = allPapers.filter(p => p.id !== paper?.id);


  return (
    <article className="reader-wrapper">
      
      {/* Upper left back button & sharing controls */}
      <div className="reader-top-controls">
        <div style={{ flex: 1 }} />
        <div className="reader-actions-group">
          <button 
            className={`reader-circle-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeClick}
            title={isLiked ? 'Unlike' : 'Like Article'}
          >
            <Heart size={18} fill={isLiked ? 'var(--color-primary)' : 'none'} />
          </button>
          <button 
            className={`reader-circle-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmarkClick}
            title={isBookmarked ? 'Remove Bookmark' : 'Save Article'}
          >
            <Bookmark size={18} fill={isBookmarked ? 'var(--color-primary)' : 'none'} />
          </button>
          <button className="reader-circle-btn" title="Copy Link" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Article link copied to clipboard!');
          }}>
            <Share2 size={18} />
          </button>

          {/* Listen Button */}
          <button
            className={`reader-action-btn-pill btn-listen ${isListening ? 'listening-active' : ''}`}
            onClick={handleStartListen}
            disabled={isSpeechInitializing}
            title={isListening ? "Restart listening from beginning" : "Listen to Research"}
          >
            <Headphones size={16} />
            <span>{isSpeechInitializing ? "Initializing..." : "Listen"}</span>
          </button>

          {/* Stop / Resume Button (Only visible while listening) */}
          {isListening && (
            <button
              className={`reader-action-btn-pill btn-stop-resume ${isPaused ? 'resumed-state' : ''}`}
              onClick={handleToggleStopResume}
              title={isPaused ? "Resume reading" : "Stop reading"}
            >
              {isPaused ? <Play size={15} /> : <Square size={15} />}
              <span>{isPaused ? "Resume" : "Stop"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Spacious Premium Reading Frame */}
      <div className="reader-frame">
        
        {/* Cover Image */}
        <div className="reader-cover-container">
          <ImageWithFallback 
            src={paper.coverImage} 
            alt={paper.title} 
            className="reader-cover-image"
            fallbackType="cover"
          />
        </div>

        {/* Article Taxonomy Badges */}
        <div className="reader-taxonomy-row">
          <span className="reader-badge-field">{paper.field}</span>
          <span className="reader-badge-type">{paper.type}</span>
        </div>

        {/* Title & Subtitle */}
        <HighlightableText
          text={paper.title}
          speechIdPrefix="speech-title"
          activeSpeechId={activeSpeechId}
          tag="h1"
          className="reader-article-title"
        />
        <HighlightableText
          text={`An in-depth empirical exploration concerning ${paper.field ? paper.field.toLowerCase() : 'research'} methodologies and academic impacts published in ${paper.language || 'English'}.`}
          speechIdPrefix="speech-subtitle"
          activeSpeechId={activeSpeechId}
          tag="p"
          className="reader-article-subtitle"
        />

        {/* Author information & Affiliation */}
        <div className="reader-author-section">
          <div className="reader-avatar">
            {getInitials(paper.authors)}
          </div>
          <div className="reader-author-info">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <span className="reader-author-names">{paper.authors}</span>
              <button
                type="button"
                className="btn-follow-author"
                onClick={handleFollowClick}
                style={{
                  backgroundColor: isFollowing ? '#f1f5f9' : '#7A1F1F',
                  color: isFollowing ? '#334155' : '#ffffff',
                  border: isFollowing ? '1px solid #cbd5e1' : 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <UserPlus size={14} />
                <span>{isFollowing ? 'Following' : 'Follow Author'}</span>
              </button>
            </div>
            <span className="reader-author-affiliation">{getAffiliation(paper.authors)}</span>
            
            <div className="reader-meta-details">
              <span className="reader-meta-item">
                <Calendar size={13} />
                <span>Published: {paper.year}</span>
              </span>
              <span className="reader-meta-dot">•</span>
              <span className="reader-meta-item">
                <Clock size={13} />
                <span>{readingTime} min read</span>
              </span>
              <span className="reader-meta-dot">•</span>
              <span className="reader-meta-item">
                <span>{paper.language || 'English'}</span>
              </span>
            </div>
          </div>
        </div>

        <hr className="reader-divider" />

        {/* Core Article Body Content */}
        <div className="reader-content-body">
          {paper.blocks && paper.blocks.length > 0 ? (
            <div className="reader-blocks-container">
              {paper.blocks.map((block, idx) => {
                const blockClasses = [
                  'reader-block',
                  `font-family-${block.fontFamily || 'sans'}`,
                  `font-size-${block.fontSize || 'base'}`,
                  `color-theme-${block.color || 'default'}`,
                  block.bold ? 'format-bold' : '',
                  block.italic ? 'format-italic' : '',
                  block.underline ? 'format-underline' : ''
                ].filter(Boolean).join(' ');

                return (
                  <div key={block.id || idx} className={blockClasses} style={{ marginBottom: '24px' }}>
                    {block.type === 'heading-2' && (
                      <HighlightableText
                        text={block.content}
                        speechIdPrefix={`speech-block-${idx}-sent`}
                        activeSpeechId={activeSpeechId}
                        tag="h2"
                        className={`reader-heading ${blockClasses}`}
                        style={{ 
                          fontSize: block.fontSize === 'sm' ? '1.3rem' : block.fontSize === 'lg' ? '2.0rem' : block.fontSize === 'xl' ? '2.4rem' : '1.6rem', 
                          fontWeight: block.bold ? 700 : 700, 
                          marginTop: '24px', 
                          marginBottom: '12px', 
                          color: (block.color && block.color !== 'default') ? 'inherit' : 'var(--color-text-main)', 
                          fontFamily: 'inherit' 
                        }}
                      />
                    )}

                    {block.type === 'paragraph' && (
                      <HighlightableText
                        text={block.content}
                        speechIdPrefix={`speech-block-${idx}-sent`}
                        activeSpeechId={activeSpeechId}
                        tag="p"
                        className={`reader-paragraph ${blockClasses}`}
                        style={{ fontSize: 'inherit', lineHeight: '1.7', color: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', fontStyle: 'inherit', textDecoration: 'inherit', margin: 0 }}
                      />
                    )}

                    {block.type === 'quote' && (
                      <HighlightableText
                        text={block.content}
                        speechIdPrefix={`speech-block-${idx}-sent`}
                        activeSpeechId={activeSpeechId}
                        tag="blockquote"
                        className={`reader-quote ${blockClasses}`}
                        style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '16px', fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', fontStyle: 'italic', color: (block.color && block.color !== 'default') ? 'inherit' : 'var(--color-text-muted)', margin: '16px 0' }}
                      />
                    )}

                    {block.type === 'list' && (
                      <div className="reader-list-container" style={{ margin: '12px 0' }}>
                        {(block.listType === 'ordered' || block.listType === 'number' || block.listType === 'numbered') ? (
                          <ol className={`reader-ordered-list ${blockClasses}`} style={{ listStyleType: 'decimal', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(block.items || []).map((item, i) => (
                              <HighlightableText
                                key={i}
                                text={item}
                                speechIdPrefix={`speech-block-${idx}-item-${i}-sent`}
                                activeSpeechId={activeSpeechId}
                                tag="li"
                                className={blockClasses}
                                style={{ fontSize: 'inherit', color: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', fontStyle: 'inherit', textDecoration: 'inherit' }}
                              />
                            ))}
                          </ol>
                        ) : (
                          <ul className={`reader-bullet-list ${blockClasses}`} style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(block.items || []).map((item, i) => (
                              <HighlightableText
                                key={i}
                                text={item}
                                speechIdPrefix={`speech-block-${idx}-item-${i}-sent`}
                                activeSpeechId={activeSpeechId}
                                tag="li"
                                className={blockClasses}
                                style={{ fontSize: 'inherit', color: 'inherit', fontFamily: 'inherit', fontWeight: 'inherit', fontStyle: 'inherit', textDecoration: 'inherit' }}
                              />
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {block.type === 'code' && (
                      <pre className="reader-code-container" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', overflowX: 'auto', margin: '16px 0' }}>
                        <code>{block.content}</code>
                      </pre>
                    )}

                    {block.type === 'table' && (
                      <div className="reader-table-container" style={{ overflowX: 'auto', margin: '16px 0' }}>
                        <table className="reader-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--color-border)' }}>
                          <tbody>
                            {(block.rows || []).map((row, rIdx) => (
                              <tr key={rIdx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} style={{ padding: '8px 12px', backgroundColor: rIdx === 0 ? 'var(--bg-primary)' : 'transparent', fontWeight: rIdx === 0 ? '600' : 'normal', borderRight: '1px solid var(--color-border)' }} dangerouslySetInnerHTML={{ __html: cell }} />
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {block.type === 'image' && (
                      <div className="reader-image-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '16px 0' }}>
                        {block.src && <img src={block.src} alt="Article visual" style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }} referrerPolicy="no-referrer" />}
                        {block.caption && <span className="reader-image-caption" style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{block.caption}</span>}
                      </div>
                    )}

                    {/* Block Attached References Container */}
                    {block.references && block.references.length > 0 && (
                      <div className="reader-block-attached-refs" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                        {block.references.map((ref, rIdx) => (
                          <button
                            key={ref.id || rIdx}
                            type="button"
                            className="reader-view-reference-btn"
                            onClick={() => {
                              if (ref.url) {
                                let targetUrl = ref.url;
                                if (ref.type === 'doi' && !targetUrl.startsWith('http')) {
                                  targetUrl = `https://doi.org/${targetUrl}`;
                                }
                                window.open(targetUrl, '_blank', 'noopener,noreferrer');
                              } else if (ref.fileData) {
                                const newTab = window.open();
                                if (newTab) {
                                  newTab.document.write(`<iframe src="${ref.fileData}" style="width:100%; height:100%; border:none;"></iframe>`);
                                }
                              }
                            }}
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              fontSize: '0.8rem', 
                              fontWeight: 600, 
                              padding: '5px 12px', 
                              borderRadius: 'var(--radius-md)', 
                              backgroundColor: '#0066cc', 
                              color: '#ffffff', 
                              border: 'none', 
                              cursor: 'pointer', 
                              transition: 'background-color var(--transition-fast)' 
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#004499'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
                          >
                            <BookOpen size={13} />
                            <span>View Source: {ref.title || 'Reference'}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            renderArticleContent(paper.content)
          )}
        </div>

        <hr className="reader-divider" />

        {/* References Section */}
        <div className="reader-references-section">
          <h3 className="reader-section-sub">
            <BookOpen size={18} />
            <span>Academic References</span>
          </h3>
          <div className="reader-references-container">
            {references.map((ref) => (
              <div key={ref.id} className="reader-reference-item-card" id={`reference-${ref.id}`}>
                <div className="ref-card-header">
                  <span className="ref-card-number">[{ref.id}]</span>
                  <p className="ref-card-citation">{ref.citation}</p>
                </div>
                {ref.description && (
                  <div className="ref-card-body">
                    <span className="ref-card-desc-label">Description</span>
                    <p className="ref-card-description">{ref.description}</p>
                  </div>
                )}
                {ref.url && (
                  <div className="ref-card-footer">
                    <a 
                      href={ref.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ref-card-link-btn"
                      id={`reference-link-${ref.id}`}
                    >
                      <span>View Reference</span>
                      <ExternalLink size={14} style={{ color: '#2563eb' }} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <hr className="reader-divider" />

        {/* Related Articles Section */}
        <div className="reader-related-section">
          <h3 className="reader-section-sub">
            <Sparkles size={18} />
            <span>Continue Reading</span>
          </h3>
          <div className="reader-related-grid">
            {relatedArticles.map(article => (
              <div 
                key={article.id} 
                className="reader-related-card"
                onClick={() => {
                  navigate(`/research/${article.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {article.coverImage && (
                  <div className="related-img-container">
                    <img src={article.coverImage} alt={article.title} referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="related-card-content">
                  <span className="related-badge">{article.type}</span>
                  <h4>{article.title}</h4>
                  <span className="related-authors">{article.authors}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="reader-divider" />

        {/* Discussion / Comments section */}
        <div className="reader-discussion-section">
          <h3 className="reader-section-sub">
            <MessageSquare size={18} />
            <span>Discussion & Peer Feedback</span>
          </h3>

          <form onSubmit={handlePostComment} className="reader-comment-form">
            <textarea
              className="reader-comment-input"
              placeholder="Add your review, feedback, or ask a question regarding this paper..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
            <button type="submit" className="reader-comment-submit-btn">
              <Send size={14} />
              <span>Post Comment</span>
            </button>
          </form>

          <div className="reader-comments-list">
            {comments.length > 0 ? (
              comments.map(c => (
                <div key={c.id} className="reader-comment-card">
                  <div className="comment-header">
                    <div className="comment-avatar">
                      <span>AV</span>
                    </div>
                    <div>
                      <span className="comment-author-name">{c.author}</span>
                      <span className="comment-author-handle">{c.handle}</span>
                    </div>
                    <span className="comment-time">{c.date}</span>
                  </div>
                  <p className="comment-text">{c.text}</p>
                </div>
              ))
            ) : (
              <EmptyState
                icon="MessageSquare"
                title="No comments yet"
                description="Share your insights or raise questions. Your critique will help advance the research discussion."
              />
            )}
          </div>
        </div>

      </div>

      {/* Speech Unavailable Error State Modal */}
      {speechErrorModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSpeechErrorModal(false)}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ErrorState
              type="speech_unsupported"
              title="Listening is unavailable"
              description="Your browser doesn't support the listening feature."
              actionText="Continue Reading"
              onAction={() => setSpeechErrorModal(false)}
            />
          </div>
        </div>
      )}
      {/* Auth Prompt Modal for Guest Mode */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionText={authActionText}
      />
    </article>
  );
}
