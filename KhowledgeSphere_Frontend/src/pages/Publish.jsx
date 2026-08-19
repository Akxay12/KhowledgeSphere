import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bold, Italic, Underline, List, Heading1, Heading2, Link2, 
  Upload, Save, Download, CheckCircle, Eye, BookOpen, FileText, Rss, 
  Newspaper, TrendingUp, Search, GraduationCap, Book, 
  ChevronRight, Plus, Trash2, ArrowUp, ArrowDown, 
  Type, Palette, Code, Table, Quote, ArrowLeft, Image, ExternalLink, Calendar,
  Settings, Strikethrough, ChevronDown, CheckCircle2, XCircle, User, UserPlus,
  MoreHorizontal, Check, Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { publishPaper } from '../services/publicationService';
import { createPublicationApi } from '../api/publication';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, PUBLICATION_TYPES as RAW_PUBLICATION_TYPES, LANGUAGES } from '../data/researchData';
import './Publish.css';
import { formatEnumToLabel, formatLabelToEnum } from '../lib/formatters';


// 8 publication types with visual indicators, filtered to match the single source of truth
const ALL_PUBLICATION_TYPES = [
  { id: 'RESEARCH_PAPER', icon: BookOpen, label: 'Research Paper', desc: 'Pre-populated with sections like Abstract, Methodology, Results, and References.' },
  { id: 'ARTICLE', icon: FileText, label: 'Article', desc: 'Structured with Introduction, Main Content body, and Conclusion.' },
  { id: 'BLOG', icon: Rss, label: 'Blog', desc: 'Flexible, content-focused layout with standard title, subtitle, and body canvas.' },
  { id: 'NEWS', icon: Newspaper, label: 'News', desc: 'Pre-formatted headline, subtitle, date/location entry, and sources section.' },
  { id: 'REPORT', icon: TrendingUp, label: 'Report', desc: 'Structured for analysis, with Executive Summary, Findings, and Recommendations.' },
  { id: 'CASE_STUDY', icon: Search, label: 'Case Study', desc: 'Outlined for business/clinical review: Challenge, Solution, and Impact.' },
  { id: 'THESIS', icon: GraduationCap, label: 'Thesis', desc: 'Detailed scholarly framework with Hypothesis, Literature Review, and Bibliography.' },
  { id: 'BOOK_CHAPTER', icon: Book, label: 'Book Chapter', desc: 'Chapter foundations, core textual discussion, and developmental summaries.' }
];

const PUBLICATION_TYPES = ALL_PUBLICATION_TYPES.filter(type => RAW_PUBLICATION_TYPES.some(rawType => formatLabelToEnum(rawType) === type.id));

// Helper to pre-populate default blocks matching publication type
const getTemplateBlocks = (pubType) => {
  const commonStyles = { fontSize: 'base', fontFamily: 'sans', color: 'default', bold: false, italic: false, underline: false };
  switch (pubType) {
    case 'RESEARCH_PAPER':
      return [
        { id: 'rp-1', type: 'heading-2', content: 'Abstract', ...commonStyles },
        { id: 'rp-2', type: 'paragraph', content: '', placeholder: 'Provide a concise summary of the key findings, methodology, and academic implications of your research paper here...', ...commonStyles },
        { id: 'rp-3', type: 'heading-2', content: 'Introduction', ...commonStyles },
        { id: 'rp-4', type: 'paragraph', content: '', placeholder: 'Introduce your research topic, state your scientific research questions, and outline the overall significance of your study...', ...commonStyles },
        { id: 'rp-5', type: 'heading-2', content: 'Literature Review', ...commonStyles },
        { id: 'rp-6', type: 'paragraph', content: '', placeholder: 'Synthesize previous scholarly work related to this topic, identifying gaps that your research aims to address...', ...commonStyles },
        { id: 'rp-7', type: 'heading-2', content: 'Problem Statement', ...commonStyles },
        { id: 'rp-8', type: 'paragraph', content: '', placeholder: 'Clearly articulate the specific problem, theoretical challenge, or practical dilemma your research investigates...', ...commonStyles },
        { id: 'rp-9', type: 'heading-2', content: 'Methodology', ...commonStyles },
        { id: 'rp-10', type: 'paragraph', content: '', placeholder: 'Describe the experimental design, data collection methods, statistical analysis procedures, and instruments used...', ...commonStyles },
        { id: 'rp-11', type: 'heading-2', content: 'Results', ...commonStyles },
        { id: 'rp-12', type: 'paragraph', content: '', placeholder: 'Present your computational or empirical findings clearly, using tables or charts if necessary to illustrate your points...', ...commonStyles },
        { id: 'rp-13', type: 'heading-2', content: 'Discussion', ...commonStyles },
        { id: 'rp-14', type: 'paragraph', content: '', placeholder: 'Interpret your results in depth, compare them with previous studies in the literature, and discuss potential limitations...', ...commonStyles },
        { id: 'rp-15', type: 'heading-2', content: 'Conclusion', ...commonStyles },
        { id: 'rp-16', type: 'paragraph', content: '', placeholder: 'Summarize the primary conclusions of the study and propose valuable avenues for future research...', ...commonStyles },
        { id: 'rp-17', type: 'heading-2', content: 'References', ...commonStyles },
        { id: 'rp-18', type: 'paragraph', content: '', placeholder: '[1] Author Surname, A. B. (Year). Title of the work. Publisher.\n[2] Author Surname, C. D. (Year). Journal article title. Journal Name, Volume(Issue), pages.', ...commonStyles },
      ];
    case 'ARTICLE':
      return [
        { id: 'ar-1', type: 'heading-2', content: 'Introduction', ...commonStyles },
        { id: 'ar-2', type: 'paragraph', content: '', placeholder: 'Hook your readers with an engaging introduction. Set the general context and present your main thesis or theme...', ...commonStyles },
        { id: 'ar-3', type: 'heading-2', content: 'Main Content', ...commonStyles },
        { id: 'ar-4', type: 'paragraph', content: '', placeholder: 'Elaborate on your main arguments, supporting them with verified facts, industry examples, and detailed analysis. You can split this into further sub-headings...', ...commonStyles },
        { id: 'ar-5', type: 'heading-2', content: 'Conclusion', ...commonStyles },
        { id: 'ar-6', type: 'paragraph', content: '', placeholder: 'Summarize the core takeaways and leave the reader with an inspiring final thought or call to action...', ...commonStyles },
        { id: 'ar-7', type: 'heading-2', content: 'References (Optional)', ...commonStyles },
        { id: 'ar-8', type: 'paragraph', content: '', placeholder: 'Provide hyperlinks or citations to any academic or digital sources referenced in this article.', ...commonStyles },
      ];
    case 'BLOG':
      return [
        { id: 'bl-1', type: 'paragraph', content: '', placeholder: 'Start writing your engaging blog post here! Share your personal insights, narratives, and creative ideas. You can easily insert quotes, code snippets, lists, and images to make it visually engaging and readable.', ...commonStyles },
      ];
    case 'NEWS':
      return [
        { id: 'nw-1', type: 'paragraph', content: '', placeholder: 'CITY, Country — Write your news article lead here. Start with the most crucial information: Who, What, Where, When, and Why. Keep paragraphs short and punchy.', ...commonStyles },
        { id: 'nw-2', type: 'heading-2', content: 'Sources', ...commonStyles },
        { id: 'nw-3', type: 'paragraph', content: '', placeholder: 'List the direct interviews, official press releases, and publications that sourced this reporting.', ...commonStyles },
      ];
    case 'REPORT':
      return [
        { id: 'rp-r1', type: 'heading-2', content: 'Executive Summary', ...commonStyles },
        { id: 'rp-r2', type: 'paragraph', content: '', placeholder: 'Provide a high-level overview of the entire report, highlighting the core objectives, key findings, and final strategic recommendations...', ...commonStyles },
        { id: 'rp-r3', type: 'heading-2', content: 'Objective', ...commonStyles },
        { id: 'rp-r4', type: 'paragraph', content: '', placeholder: 'State the precise purpose of this report, what key questions it seeks to answer, and its operational scope...', ...commonStyles },
        { id: 'rp-r5', type: 'heading-2', content: 'Findings', ...commonStyles },
        { id: 'rp-r6', type: 'paragraph', content: '', placeholder: 'Detail the scientific data, observations, and key facts uncovered during the investigation or study...', ...commonStyles },
        { id: 'rp-r7', type: 'heading-2', content: 'Analysis', ...commonStyles },
        { id: 'rp-r8', type: 'paragraph', content: '', placeholder: 'Interpret the findings, evaluate the industrial implications, and explain the underlying causes or patterns...', ...commonStyles },
        { id: 'rp-r9', type: 'heading-2', content: 'Recommendations', ...commonStyles },
        { id: 'rp-r10', type: 'paragraph', content: '', placeholder: 'List actionable suggestions, step-by-step solutions, or mitigation strategies based on the analysis of the findings...', ...commonStyles },
        { id: 'rp-r11', type: 'heading-2', content: 'Conclusion', ...commonStyles },
        { id: 'rp-r12', type: 'paragraph', content: '', placeholder: 'Wrap up the report with a concise summary of the key outcomes, strategic milestones, and next steps...', ...commonStyles },
      ];
    case 'CASE_STUDY':
      return [
        { id: 'cs-1', type: 'heading-2', content: 'Executive Summary', ...commonStyles },
        { id: 'cs-2', type: 'paragraph', content: '', placeholder: 'Provide a quick outline of the client or subject, the core challenge faced, and the amazing quantitative results achieved...', ...commonStyles },
        { id: 'cs-3', type: 'heading-2', content: 'Background', ...commonStyles },
        { id: 'cs-4', type: 'paragraph', content: '', placeholder: 'Describe the organization, industry segment, or socio-economic context of the study...', ...commonStyles },
        { id: 'cs-5', type: 'heading-2', content: 'The Challenge', ...commonStyles },
        { id: 'cs-6', type: 'paragraph', content: '', placeholder: 'Outline the specific obstacles, technical blockages, or market inefficiencies that needed to be solved...', ...commonStyles },
        { id: 'cs-7', type: 'heading-2', content: 'The Solution', ...commonStyles },
        { id: 'cs-8', type: 'paragraph', content: '', placeholder: 'Explain the technical strategy, research methodology, and step-by-step measures implemented to resolve the challenge...', ...commonStyles },
        { id: 'cs-9', type: 'heading-2', content: 'Results & Impact', ...commonStyles },
        { id: 'cs-10', type: 'paragraph', content: '', placeholder: 'Quantify and qualify the success, detailing key performance metrics (KPIs) and testimonial feedback from clients...', ...commonStyles },
      ];
    case 'THESIS':
      return [
        { id: 'th-1', type: 'heading-2', content: 'Dedication & Acknowledgements', ...commonStyles },
        { id: 'th-2', type: 'paragraph', content: '', placeholder: 'Express academic and personal gratitude to advisors, supporting institutions, and peers...', ...commonStyles },
        { id: 'th-3', type: 'heading-2', content: 'Abstract', ...commonStyles },
        { id: 'th-4', type: 'paragraph', content: '', placeholder: 'A rigorous academic abstract summarizing the thesis hypothesis, central methodology, scientific contributions, and findings...', ...commonStyles },
        { id: 'th-5', type: 'heading-2', content: 'Introduction', ...commonStyles },
        { id: 'th-6', type: 'paragraph', content: '', placeholder: 'Establish the scholastic context, core hypotheses, intellectual motivation, and structural roadmap of the dissertation...', ...commonStyles },
        { id: 'th-7', type: 'heading-2', content: 'Literature Review', ...commonStyles },
        { id: 'th-8', type: 'paragraph', content: '', placeholder: 'An exhaustive, structured review of existing academic literature mapping the field of inquiry and highlighting key controversies...', ...commonStyles },
        { id: 'th-9', type: 'heading-2', content: 'Methodology & Data', ...commonStyles },
        { id: 'th-10', type: 'paragraph', content: '', placeholder: 'Detailed descriptions of scientific models, calculations, dataset sources, variables, and procedural parameters...', ...commonStyles },
        { id: 'th-11', type: 'heading-2', content: 'Analysis & Findings', ...commonStyles },
        { id: 'th-12', type: 'paragraph', content: '', placeholder: 'In-depth analysis of empirical findings, theoretical deductions, and hypothesis testing...', ...commonStyles },
        { id: 'th-13', type: 'heading-2', content: 'Conclusion & Recommendations', ...commonStyles },
        { id: 'th-14', type: 'paragraph', content: '', placeholder: 'Synthesis of the academic findings and recommendations for broader discipline integration...', ...commonStyles },
        { id: 'th-15', type: 'heading-2', content: 'Bibliography', ...commonStyles },
        { id: 'th-16', type: 'paragraph', content: '', placeholder: 'Complete scholastic bibliography formatted strictly in APA, Chicago, or Harvard style.', ...commonStyles },
      ];
    case 'BOOK_CHAPTER':
      return [
        { id: 'bc-1', type: 'heading-2', content: 'Introduction to Chapter', ...commonStyles },
        { id: 'bc-2', type: 'paragraph', content: '', placeholder: 'Set the stage for this specific chapter. Bridge it seamlessly with preceding chapters and introduce the key themes discussed here...', ...commonStyles },
        { id: 'bc-3', type: 'heading-2', content: 'Theoretical Foundations', ...commonStyles },
        { id: 'bc-4', type: 'paragraph', content: '', placeholder: 'Provide the underlying theories, historical background, or conceptual frameworks guiding your discussion...', ...commonStyles },
        { id: 'bc-5', type: 'heading-2', content: 'Core Discussion', ...commonStyles },
        { id: 'bc-6', type: 'paragraph', content: '', placeholder: 'Flesh out the main narratives, sub-theses, textual arguments, or quantitative observations of this chapter...', ...commonStyles },
        { id: 'bc-7', type: 'heading-2', content: 'Summary', ...commonStyles },
        { id: 'bc-8', type: 'paragraph', content: '', placeholder: 'Conclude the chapter by wrapping up its key developments and foreshadowing the next phase of the book...', ...commonStyles },
      ];
    default:
      return [
        { id: 'df-1', type: 'paragraph', content: '', placeholder: 'Start drafting your custom content here...', ...commonStyles },
      ];
  }
};

const ContentEditableBlock = React.memo(({ html, onChange, className, placeholder, onFocus, onBlur, blockId, itemIndex, rowIndex, colIndex }) => {
  const elementRef = useRef(null);
  const lastHtmlRef = useRef(html);

  // Update DOM only if HTML changes externally
  useEffect(() => {
    if (elementRef.current && html !== lastHtmlRef.current) {
      if (document.activeElement !== elementRef.current) {
        const isHtmlEmpty = !html || html === '<br>' || html === '<div><br></div>' || html === '<p><br></p>';
        elementRef.current.innerHTML = isHtmlEmpty ? '' : html;
        lastHtmlRef.current = isHtmlEmpty ? '' : html;
      } else {
        lastHtmlRef.current = html;
      }
    }
  }, [html]);

  const handleInput = (e) => {
    let newHtml = e.target.innerHTML;
    const textContent = e.target.textContent || '';
    // Normalize empty or quasi-empty browser states so the :empty pseudo-class triggers perfectly
    if (!textContent.trim() && (newHtml === '<br>' || newHtml === '<div><br></div>' || newHtml === '<p><br></p>' || !newHtml)) {
      newHtml = '';
      e.target.innerHTML = '';
    }
    lastHtmlRef.current = newHtml;
    onChange(newHtml);
  };

  const handleBlur = (e) => {
    let newHtml = e.target.innerHTML;
    const textContent = e.target.textContent || '';
    if (!textContent.trim() && (newHtml === '<br>' || newHtml === '<div><br></div>' || newHtml === '<p><br></p>' || !newHtml)) {
      newHtml = '';
      e.target.innerHTML = '';
      if (onChange) onChange('');
    }
    if (onBlur) onBlur(e);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleBlockClick = (e) => {
    const anchor = e.target.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href) {
        e.preventDefault();
        e.stopPropagation();
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const uniqueId = `editable-block-${blockId}${itemIndex !== undefined ? `-item-${itemIndex}` : ''}${rowIndex !== undefined ? `-row-${rowIndex}-col-${colIndex}` : ''}`;

  return (
    <div
      id={uniqueId}
      ref={elementRef}
      contentEditable
      className={className}
      onInput={handleInput}
      onPaste={handlePaste}
      onFocus={onFocus}
      onBlur={handleBlur}
      onClick={handleBlockClick}
      style={{ outline: 'none', minWidth: '1px' }}
      dangerouslySetInnerHTML={{ __html: lastHtmlRef.current || '' }}
      data-placeholder={placeholder}
      data-block-id={blockId}
      data-item-index={itemIndex}
      data-row-index={rowIndex}
      data-col-index={colIndex}
    />
  );
}, () => {
  // Always prevent React from re-rendering this block container after mount.
  // Content and formatting changes will be cleanly updated via ref and useEffect.
  return true;
});

const ToolbarDropdown = ({ 
  icon: Icon, 
  labelSpan, 
  value, 
  options, 
  onChange, 
  placeholder,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption = options.find(o => o.value === value);

  return (
    <div className={`toolbar-custom-dropdown ${className || ''}`} ref={containerRef}>
      <button
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'active' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault(); // CRITICAL: prevents stealing focus from contenteditable editor
          setIsOpen(!isOpen);
        }}
        title={placeholder}
      >
        {Icon && <Icon size={14} className="dropdown-icon" />}
        {labelSpan}
        <span className="dropdown-trigger-label" style={{ marginLeft: labelSpan ? '4px' : '0' }}>
          {activeOption ? activeOption.label : (placeholder || 'Select')}
        </span>
        <ChevronDown size={12} className="dropdown-arrow-icon" />
      </button>

      {isOpen && (
        <div 
          className="custom-dropdown-menu"
          onMouseDown={(e) => {
            e.preventDefault(); // CRITICAL: prevents stealing focus from contenteditable editor when scrolling or clicking background
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`custom-dropdown-item ${opt.value === value ? 'selected' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault(); // CRITICAL: prevents stealing focus from contenteditable editor
              }}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={opt.style || {}}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const fontFamilyOptions = [
  { value: 'sans', label: 'Sans-Serif (Inter)' },
  { value: 'serif', label: 'Serif (Playfair)' },
  { value: 'mono', label: 'Monospace (Fira)' }
];

const fontSizeOptions = [
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Normal' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' }
];

const textColorOptions = [
  { value: 'default', label: 'Default Text' },
  { value: 'muted', label: 'Muted Slate' },
  { value: 'blue', label: 'Scholar Blue' },
  { value: 'green', label: 'Bio Green' },
  { value: 'red', label: 'Alert Red' },
  { value: 'indigo', label: 'Space Indigo' }
];

const highlightOptions = [
  { value: 'none', label: 'No Highlight' },
  { value: 'yellow', label: 'Yellow', style: { backgroundColor: '#fef08a', color: '#000' } },
  { value: 'green', label: 'Green', style: { backgroundColor: '#bbf7d0', color: '#000' } },
  { value: 'blue', label: 'Blue', style: { backgroundColor: '#bfdbfe', color: '#000' } },
  { value: 'red', label: 'Red', style: { backgroundColor: '#fecaca', color: '#000' } },
  { value: 'orange', label: 'Orange', style: { backgroundColor: '#fed7aa', color: '#000' } }
];

const insertOptions = [
  { value: 'heading-2', label: 'Header (H2)' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'quote', label: 'Quote Block' },
  { value: 'list', label: 'List Block' },
  { value: 'table', label: 'Table Block' },
  { value: 'code', label: 'Code Snippet' },
  { value: 'image', label: 'Inline Image' }
];

export default function Publish() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const fileInputRef = useRef(null);
  
  // States
  const [step, setStep] = useState(1); // 1 = Setup setup, 2 = Editor editor
  const [category, setCategory] = useState('');
  const [pubType, setPubType] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  
  const [coverImage, setCoverImage] = useState('');
  const [isImageValid, setIsImageValid] = useState(true);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [authorshipName, setAuthorshipName] = useState(user?.name || '');
  const [authorNameError, setAuthorNameError] = useState('');
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    if (user) {
      if (!authorshipName && user.name) setAuthorshipName(user.name);
    }
  }, [user]);


  // Mobile Writing Focus Mode States & Hooks
  const [isMobileFocusMode, setIsMobileFocusMode] = useState(false);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);

  const scrollToActiveElement = () => {
    if (window.innerWidth <= 1024) {
      setTimeout(() => {
        try {
          const activeEl = document.activeElement;
          if (activeEl && (activeEl.closest('.composer-canvas') || activeEl.classList?.contains('composer-title-input') || activeEl.classList?.contains('composer-subtitle-input'))) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } catch (err) {}
      }, 120);
    }
  };

  useEffect(() => {
    const handleFocusIn = (e) => {
      if (window.innerWidth <= 1024) {
        const isEditorCanvas = e.target.closest('.composer-canvas') || 
                               e.target.classList?.contains('composer-title-input') || 
                               e.target.classList?.contains('composer-subtitle-input') ||
                               e.target.closest('.block-content-area');
        if (isEditorCanvas) {
          setIsMobileFocusMode(true);
          scrollToActiveElement();
        }
      }
    };

    const handleVisualViewportResize = () => {
      if (window.innerWidth <= 1024 && window.visualViewport) {
        const isKeyboardOpen = window.visualViewport.height < window.innerHeight - 100;
        if (isKeyboardOpen) {
          setIsMobileFocusMode(true);
          scrollToActiveElement();
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
    }

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
      }
    };
  }, []);

  useEffect(() => {
    if (activeBlockId && isMobileFocusMode) {
      scrollToActiveElement();
    }
  }, [activeBlockId, isMobileFocusMode]);

  const handleExitMobileFocus = () => {
    setIsMobileFocusMode(false);
    setShowMobileMoreMenu(false);
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  };

  // New Publishing flow states
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishedPaperId, setPublishedPaperId] = useState(null);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);


  // Hyperlink and Reference States
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const savedRangeRef = useRef(null);
  const linkPopoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutsidePopover = (e) => {
      if (linkPopoverRef.current && !linkPopoverRef.current.contains(e.target)) {
        const isToolbarBtn = e.target.closest('.toolbar-btn');
        if (!isToolbarBtn) {
          setShowLinkModal(false);
          savedRangeRef.current = null;
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutsidePopover);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsidePopover);
    };
  }, []);

  const [showRefModal, setShowRefModal] = useState(false);
  const [refType, setRefType] = useState('website');
  const [refTitle, setRefTitle] = useState('');
  const [refDesc, setRefDesc] = useState('');
  const [refUrl, setRefUrl] = useState('');
  const [refFileName, setRefFileName] = useState('');
  const [refFileData, setRefFileData] = useState('');
  const [editingBlockRefId, setEditingBlockRefId] = useState(null);
  const [isRefDragging, setIsRefDragging] = useState(false);

  // Global bibliography document references state
  const [docReferences, setDocReferences] = useState([]);
  const [isEditingDocRefIndex, setIsEditingDocRefIndex] = useState(null);

  // Formatting state tracker for selection
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    inlineCode: false,
    fontSize: 'base',
    color: 'default',
    fontFamily: 'sans'
  });

  useEffect(() => {
    const handleSelectionChange = () => {
      let activeFontSize = 'base';
      try {
        const sizeVal = document.queryCommandValue('fontSize');
        if (sizeVal === '2') activeFontSize = 'sm';
        else if (sizeVal === '3') activeFontSize = 'base';
        else if (sizeVal === '4') activeFontSize = 'lg';
        else if (sizeVal === '5') activeFontSize = 'xl';
      } catch (e) {}

      let activeColor = 'default';
      try {
        const colorVal = document.queryCommandValue('foreColor');
        if (colorVal) {
          const rgbMap = {
            'rgb(15, 23, 42)': 'default',
            'rgb(100, 116, 139)': 'muted',
            'rgb(37, 99, 235)': 'blue',
            'rgb(22, 163, 74)': 'green',
            'rgb(220, 38, 38)': 'red',
            'rgb(79, 70, 229)': 'indigo'
          };
          if (rgbMap[colorVal]) {
            activeColor = rgbMap[colorVal];
          } else {
            const normalized = colorVal.replace(/\s+/g, '').toLowerCase();
            if (normalized.includes('37,99,235') || normalized === '#2563eb') activeColor = 'blue';
            else if (normalized.includes('22,163,74') || normalized === '#16a34a') activeColor = 'green';
            else if (normalized.includes('220,38,38') || normalized === '#dc2626') activeColor = 'red';
            else if (normalized.includes('79,70,229') || normalized === '#4f46e5') activeColor = 'indigo';
            else if (normalized.includes('100,116,139') || normalized === '#64748b') activeColor = 'muted';
            else if (normalized.includes('15,23,42') || normalized === '#0f172a') activeColor = 'default';
          }
        }
      } catch (e) {}

      let activeFontFamily = 'sans';
      try {
        const fontVal = document.queryCommandValue('fontName');
        if (fontVal) {
          if (fontVal.toLowerCase().includes('mono') || fontVal.toLowerCase().includes('monospace')) {
            activeFontFamily = 'mono';
          } else if (fontVal.toLowerCase().includes('serif')) {
            activeFontFamily = 'serif';
          }
        }
      } catch (e) {}

      setActiveStyles({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough'),
        inlineCode: isSelectionInlineCode(),
        fontSize: activeFontSize,
        color: activeColor,
        fontFamily: activeFontFamily
      });
    };

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);
    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
    };
  }, []);

  const isSelectionInlineCode = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    let node = selection.getRangeAt(0).commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }
    return node.closest && !!node.closest('code.inline-code');
  };

  const updateStateFromDOMElement = (editableEl) => {
    if (!editableEl) return;
    const blockIdAttr = editableEl.getAttribute('data-block-id');
    const itemIdxAttr = editableEl.getAttribute('data-item-index');
    const rowIdxAttr = editableEl.getAttribute('data-row-index');
    const colIdxAttr = editableEl.getAttribute('data-col-index');

    let html = editableEl.innerHTML;

    // Normalize empty states so they trigger placeholders correctly
    const textContent = editableEl.textContent || '';
    if (!textContent.trim() && (html === '<br>' || html === '<div><br></div>' || html === '<p><br></p>' || !html)) {
      html = '';
      editableEl.innerHTML = '';
    }

    if (blockIdAttr) {
      if (itemIdxAttr !== null) {
        const itemIdx = parseInt(itemIdxAttr, 10);
        setBlocks(prevBlocks => prevBlocks.map(b => {
          if (b.id === blockIdAttr) {
            const updatedItems = [...b.items];
            updatedItems[itemIdx] = html;
            return { ...b, items: updatedItems };
          }
          return b;
        }));
      } else if (rowIdxAttr !== null && colIdxAttr !== null) {
        const rowIdx = parseInt(rowIdxAttr, 10);
        const colIdx = parseInt(colIdxAttr, 10);
        setBlocks(prevBlocks => prevBlocks.map(b => {
          if (b.id === blockIdAttr) {
            const updatedRows = b.rows.map((r, rI) => 
              rI === rowIdx ? r.map((c, cI) => cI === colIdx ? html : c) : r
            );
            return { ...b, rows: updatedRows };
          }
          return b;
        }));
      } else {
        setBlocks(prevBlocks => prevBlocks.map(b => 
          b.id === blockIdAttr ? { ...b, content: html } : b
        ));
      }
    }
  };

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);

    // Refresh active styles immediately
    let activeFontSize = 'base';
    try {
      const sizeVal = document.queryCommandValue('fontSize');
      if (sizeVal === '2') activeFontSize = 'sm';
      else if (sizeVal === '3') activeFontSize = 'base';
      else if (sizeVal === '4') activeFontSize = 'lg';
      else if (sizeVal === '5') activeFontSize = 'xl';
    } catch (e) {}

    let activeColor = 'default';
    try {
      const colorVal = document.queryCommandValue('foreColor');
      if (colorVal) {
        const rgbMap = {
          'rgb(15, 23, 42)': 'default',
          'rgb(100, 116, 139)': 'muted',
          'rgb(37, 99, 235)': 'blue',
          'rgb(22, 163, 74)': 'green',
          'rgb(220, 38, 38)': 'red',
          'rgb(79, 70, 229)': 'indigo'
        };
        if (rgbMap[colorVal]) {
          activeColor = rgbMap[colorVal];
        } else {
          const normalized = colorVal.replace(/\s+/g, '').toLowerCase();
          if (normalized.includes('37,99,235') || normalized === '#2563eb') activeColor = 'blue';
          else if (normalized.includes('22,163,74') || normalized === '#16a34a') activeColor = 'green';
          else if (normalized.includes('220,38,38') || normalized === '#dc2626') activeColor = 'red';
          else if (normalized.includes('79,70,229') || normalized === '#4f46e5') activeColor = 'indigo';
          else if (normalized.includes('100,116,139') || normalized === '#64748b') activeColor = 'muted';
          else if (normalized.includes('15,23,42') || normalized === '#0f172a') activeColor = 'default';
        }
      }
    } catch (e) {}

    let activeFontFamily = 'sans';
    try {
      const fontVal = document.queryCommandValue('fontName');
      if (fontVal) {
        if (fontVal.toLowerCase().includes('mono') || fontVal.toLowerCase().includes('monospace')) {
          activeFontFamily = 'mono';
        } else if (fontVal.toLowerCase().includes('serif')) {
          activeFontFamily = 'serif';
        }
      }
    } catch (e) {}

    setActiveStyles({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikeThrough'),
      inlineCode: isSelectionInlineCode(),
      fontSize: activeFontSize,
      color: activeColor,
      fontFamily: activeFontFamily
    });

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
      }
      const editableEl = node.closest('[contenteditable="true"]');
      if (editableEl) {
        updateStateFromDOMElement(editableEl);
      }
    }
  };

  const toggleInlineCode = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let node = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }

    const codeEl = node.closest ? node.closest('code.inline-code') : null;
    const editableEl = node.closest ? node.closest('[contenteditable="true"]') : null;

    if (codeEl && editableEl) {
      // User is inside a code tag, so they want to toggle it OFF (return to normal)
      if (selection.isCollapsed) {
        // Cursor is collapsed: move cursor OUT of the code tag
        const parent = codeEl.parentNode;
        if (parent) {
          // Create a text node with a zero-width space right after the code element
          const textNode = document.createTextNode('\u200B');
          if (codeEl.nextSibling) {
            parent.insertBefore(textNode, codeEl.nextSibling);
          } else {
            parent.appendChild(textNode);
          }

          // Position the cursor at the end of the new textNode
          const newRange = document.createRange();
          newRange.setStart(textNode, textNode.length);
          newRange.setEnd(textNode, textNode.length);
          selection.removeAllRanges();
          selection.addRange(newRange);

          updateStateFromDOMElement(editableEl);
          setActiveStyles(prev => ({ ...prev, inlineCode: false }));
        }
      } else {
        // Text is selected: unwrap the entire code tag back to normal text
        const parent = codeEl.parentNode;
        if (parent) {
          const fragment = document.createDocumentFragment();
          while (codeEl.firstChild) {
            fragment.appendChild(codeEl.firstChild);
          }
          parent.replaceChild(fragment, codeEl);

          updateStateFromDOMElement(editableEl);
          setActiveStyles(prev => ({ ...prev, inlineCode: false }));
        }
      }
    } else if (editableEl) {
      // User is NOT inside a code tag, so they want to toggle it ON
      if (selection.isCollapsed) {
        // Cursor is collapsed: create a code tag and put cursor inside it
        const codeNode = document.createElement('code');
        codeNode.className = 'inline-code';
        codeNode.innerHTML = '&#x200B;'; // zero-width space
        range.insertNode(codeNode);

        // Position cursor inside the code tag, after the zero-width space
        const newRange = document.createRange();
        newRange.setStart(codeNode.firstChild, 1);
        newRange.setEnd(codeNode.firstChild, 1);
        selection.removeAllRanges();
        selection.addRange(newRange);

        updateStateFromDOMElement(editableEl);
        setActiveStyles(prev => ({ ...prev, inlineCode: true }));
      } else {
        // Text is selected: wrap selection in code format
        const selectedText = range.toString();
        const inlineCodeHTML = `<code class="inline-code">${selectedText}</code>`;
        applyFormat('insertHTML', inlineCodeHTML);
      }
    }
  };

  const handleToggleBold = () => {
    applyFormat('bold');
  };

  const handleToggleItalic = () => {
    applyFormat('italic');
  };

  const handleToggleUnderline = () => {
    applyFormat('underline');
  };

  const handleToggleStrikethrough = () => {
    applyFormat('strikeThrough');
  };

  const handleFontFamilyChange = (fontFamily) => {
    const fontMap = {
      sans: 'Inter, sans-serif',
      serif: 'Georgia, serif',
      mono: 'JetBrains Mono, monospace'
    };
    applyFormat('fontName', fontMap[fontFamily] || fontFamily);
  };

  const handleFontSizeChange = (fontSize) => {
    const sizeMap = {
      sm: '2',
      base: '3',
      lg: '4',
      xl: '5'
    };
    applyFormat('fontSize', sizeMap[fontSize]);
  };

  const handleColorChange = (color) => {
    const colorMap = {
      default: '#0f172a',
      muted: '#64748b',
      blue: '#2563eb',
      green: '#16a34a',
      red: '#dc2626',
      indigo: '#4f46e5'
    };
    applyFormat('foreColor', colorMap[color]);
  };

  // Filter categories based on search input
  const filteredCategories = CATEGORIES.filter(c => 
    c.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleContinue = () => {
    if (category && pubType) {
      // Setup title/headline default depending on news
      if (pubType === 'NEWS') {
        setTitle('HEADLINE: ');
      } else {
        setTitle('');
      }
      setSubtitle('');
      setBlocks(getTemplateBlocks(pubType));
      setStep(2);
    }
  };

  // Compression utility for base64 images to prevent localStorage QuotaExceededError
  const compressImage = (dataUrl, maxWidth = 1000, maxHeight = 1000, quality = 0.7) => {
    return new Promise((resolve) => {
      try {
        const img = new window.Image();
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;
            if (width > maxWidth || height > maxHeight) {
              if (width > height) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
              resolve(compressedDataUrl);
            } else {
              resolve(dataUrl);
            }
          } catch (err) {
            console.error('Error in compressImage onload, falling back to original image:', err);
            resolve(dataUrl);
          }
        };
        img.onerror = (err) => {
          console.error('Error loading image in compressImage, falling back to original image:', err);
          resolve(dataUrl);
        };
        img.src = dataUrl;
      } catch (err) {
        console.error('Critical error in compressImage initialization, falling back to original:', err);
        resolve(dataUrl);
      }
    });
  };

  // Effect to validate pasted cover image URL and verify if it can be loaded
  useEffect(() => {
    if (!coverImage) {
      setIsImageValid(true);
      return;
    }

    if (!coverImage.startsWith('https://')) {
      setIsImageValid(false);
      return;
    }

    let active = true;
    const img = new window.Image();
    img.src = coverImage;
    img.onload = () => {
      if (active) setIsImageValid(true);
    };
    img.onerror = () => {
      if (active) setIsImageValid(false);
    };

    return () => {
      active = false;
    };
  }, [coverImage]);

  const handleInlineImageChange = (blockId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        compressImage(reader.result).then(compressed => {
          setBlocks(prevBlocks => prevBlocks.map(b => b.id === blockId ? { ...b, src: compressed } : b));
        }).catch((err) => {
          console.error('Failed compressing inline image, falling back to raw result:', err);
          setBlocks(prevBlocks => prevBlocks.map(b => b.id === blockId ? { ...b, src: reader.result } : b));
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Block creation/management actions
  const addBlock = (type) => {
    const newId = `custom-block-${Date.now()}`;
    const common = { fontSize: 'base', fontFamily: 'sans', color: 'default', bold: false, italic: false, underline: false };
    
    let newBlock = { id: newId, type, content: '', ...common };
    
    if (type === 'table') {
      newBlock.rows = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ];
    } else if (type === 'list') {
      newBlock.listType = 'bullet';
      newBlock.items = ['', ''];
    } else if (type === 'code') {
      newBlock.language = 'javascript';
      newBlock.content = '';
      newBlock.placeholder = '// Write your code snippet here...';
    } else if (type === 'image') {
      newBlock.src = '';
      newBlock.caption = '';
      newBlock.placeholder = 'Enter image caption here...';
    } else if (type === 'heading-1') {
      newBlock.content = '';
      newBlock.placeholder = 'Heading 1 Title...';
    } else if (type === 'heading-2') {
      newBlock.content = '';
      newBlock.placeholder = 'Section Title...';
    } else if (type === 'quote') {
      newBlock.content = '';
      newBlock.placeholder = '“Write your elegant blockquote here...”';
    } else {
      newBlock.content = '';
      newBlock.placeholder = 'Start typing paragraph text...';
    }

    if (activeBlockId) {
      const index = blocks.findIndex(b => b.id === activeBlockId);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }
    setActiveBlockId(newId);
  };

  const deleteBlock = (id) => {
    if (blocks.length <= 1) return; // Always keep at least one block
    const nextActive = blocks.find(b => b.id !== id);
    setBlocks(blocks.filter(b => b.id !== id));
    if (activeBlockId === id) {
      setActiveBlockId(nextActive ? nextActive.id : null);
    }
  };

  const moveBlock = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[nextIndex];
    newBlocks[nextIndex] = temp;
    setBlocks(newBlocks);
  };

  const updateBlockContent = (id, newContent) => {
    setBlocks(prevBlocks => prevBlocks.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  const updateBlockProperty = (properties) => {
    if (!activeBlockId) return;
    setBlocks(prevBlocks => prevBlocks.map(b => b.id === activeBlockId ? { ...b, ...properties } : b));
  };

  // Formatting toggles for active block
  const toggleActiveBold = () => {
    const active = blocks.find(b => b.id === activeBlockId);
    if (active) updateBlockProperty({ bold: !active.bold });
  };

  const toggleActiveItalic = () => {
    const active = blocks.find(b => b.id === activeBlockId);
    if (active) updateBlockProperty({ italic: !active.italic });
  };

  const toggleActiveUnderline = () => {
    const active = blocks.find(b => b.id === activeBlockId);
    if (active) updateBlockProperty({ underline: !active.underline });
  };

  const formatUrl = (inputUrl) => {
    if (!inputUrl) return '';
    let trimmed = inputUrl.trim();
    if (!/^https?:\/\//i.test(trimmed) && !/^mailto:/i.test(trimmed) && !/^tel:/i.test(trimmed) && !/^ftp:/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const applyHyperlink = (url, titleText) => {
    const formattedUrl = formatUrl(url);
    if (!formattedUrl) return;

    // 1. Restore selection range and focus contenteditable
    const range = savedRangeRef.current;
    if (range) {
      let container = range.commonAncestorContainer;
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentNode;
      }
      const editableEl = container.closest ? container.closest('[contenteditable="true"]') : null;
      if (editableEl) {
        editableEl.focus();
      }
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // 2. Execute createLink with formatted URL
    document.execCommand('createLink', false, formattedUrl);

    // 3. Set custom attributes on the created link
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node = selection.anchorNode;
      if (node) {
        if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentNode;
        }
        const anchor = node.closest ? node.closest('a') : null;
        if (anchor) {
          anchor.setAttribute('target', '_blank');
          anchor.setAttribute('rel', 'noopener noreferrer');
          if (titleText) {
            anchor.setAttribute('title', titleText);
          }
        }
      }
    }

    // 4. Manually trigger updating state of the active block content
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
      }
      const editableEl = node.closest('[contenteditable="true"]');
      if (editableEl) {
        const blockIdAttr = editableEl.getAttribute('data-block-id');
        const itemIdxAttr = editableEl.getAttribute('data-item-index');
        const rowIdxAttr = editableEl.getAttribute('data-row-index');
        const colIdxAttr = editableEl.getAttribute('data-col-index');

        const html = editableEl.innerHTML;

        if (blockIdAttr) {
          if (itemIdxAttr !== null && itemIdxAttr !== undefined && !isNaN(parseInt(itemIdxAttr, 10))) {
            const itemIdx = parseInt(itemIdxAttr, 10);
            setBlocks(prevBlocks => prevBlocks.map(b => {
              if (b.id === blockIdAttr) {
                const updatedItems = [...b.items];
                updatedItems[itemIdx] = html;
                return { ...b, items: updatedItems };
              }
              return b;
            }));
          } else if (rowIdxAttr !== null && rowIdxAttr !== undefined && colIdxAttr !== null && colIdxAttr !== undefined && !isNaN(parseInt(rowIdxAttr, 10))) {
            const rowIdx = parseInt(rowIdxAttr, 10);
            const colIdx = parseInt(colIdxAttr, 10);
            setBlocks(prevBlocks => prevBlocks.map(b => {
              if (b.id === blockIdAttr) {
                const updatedRows = b.rows.map((r, rI) => 
                  rI === rowIdx ? r.map((c, cI) => cI === colIdx ? html : c) : r
                );
                return { ...b, rows: updatedRows };
              }
              return b;
            }));
          } else {
            setBlocks(prevBlocks => prevBlocks.map(b => 
              b.id === blockIdAttr ? { ...b, content: html } : b
            ));
          }
        }
      }
    }
  };

  const handleRefFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRefFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefFileData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenReference = (ref) => {
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
      } else {
        const link = document.createElement('a');
        link.href = ref.fileData;
        link.download = ref.fileName || 'uploaded_document';
        link.click();
      }
    }
  };

  const handleSaveReference = () => {
    const formattedUrl = (refType !== 'document' && refUrl) ? formatUrl(refUrl) : '';
    const newRef = {
      id: `ref-${Date.now()}`,
      type: refType,
      title: refTitle.trim(),
      description: refDesc.trim(),
      url: formattedUrl,
      fileName: refFileName || '',
      fileData: refFileData || ''
    };

    const targetBlockId = editingBlockRefId;

    if (editingBlockRefId) {
      // 1. Attach reference to block
      setBlocks(prevBlocks => prevBlocks.map(b => {
        if (b.id === editingBlockRefId) {
          const currentRefs = b.references || [];
          return { ...b, references: [...currentRefs, newRef] };
        }
        return b;
      }));

      // 2. Also add to document-wide references if not exists by URL or title
      setDocReferences(prev => {
        const exists = prev.some(r => 
          (newRef.url && r.url === newRef.url) || r.title.toLowerCase() === newRef.title.toLowerCase()
        );
        if (!exists) {
          return [...prev, newRef];
        }
        return prev;
      });
    } else if (isEditingDocRefIndex !== null) {
      // Editing existing document reference
      setDocReferences(prev => prev.map((r, i) => i === isEditingDocRefIndex ? { ...r, ...newRef, id: r.id } : r));
    } else {
      // Adding new document-wide reference
      setDocReferences(prev => [...prev, newRef]);
    }

    // Reset reference modal form states
    setRefType('website');
    setRefTitle('');
    setRefDesc('');
    setRefUrl('');
    setRefFileName('');
    setRefFileData('');
    setEditingBlockRefId(null);
    setIsEditingDocRefIndex(null);
    setShowRefModal(false);

    // Automatically restore focus and cursor to the paragraph editor after inserting a button
    if (targetBlockId) {
      setTimeout(() => {
        const el = document.querySelector(`[id^="editable-block-${targetBlockId}"]`);
        if (el) {
          el.focus();
          try {
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(el);
            range.collapse(false); // Move cursor to the absolute end of the paragraph
            sel.removeAllRanges();
            sel.addRange(range);
          } catch (err) {
            console.error('Failed to restore cursor focus:', err);
          }
        }
      }, 50);
    }
  };

  const handlePublish = (e) => {
    if (e) e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowSignUpModal(true);
      return;
    }

    // 1. Validate the article
    const titleText = (title || '').trim();
    if (!titleText) {
      setPublishError("Title is required. Please enter a valid title for your publication.");
      return;
    }

    const authorText = (authorshipName || '').trim();
    if (!authorText) {
      setAuthorNameError("Author Name is required.");
      return;
    } else {
      setAuthorNameError('');
    }



    if (!pubType) {
      setPublishError("Publication Type is required. Please select a publication type before publishing.");
      return;
    }

    if (!category) {
      setPublishError("Research Category is required. Please select a category before publishing.");
      return;
    }

    // Reset any previous errors and trigger the loading state
    setPublishError(null);
    setIsPublishing(true);

    const payload = {
      title: titleText,
      subtitle: (subtitle || '').trim(),
      coverImageUrl: coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      publicationType: pubType,
      category: category,
      authorName: authorText,
      language: language || 'English',
      content: JSON.stringify({
        blocks: blocks,
        docReferences: docReferences
      })
    };

    // Publish via direct API
    createPublicationApi(payload)
      .then((metadata) => {
        // Update local publicationCount
        if (user) {
          const updatedUser = {
            ...user,
            publicationCount: (user.publicationCount || 0) + 1
          };
          localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
          localStorage.setItem('knowledgesphere_user_profile', JSON.stringify(updatedUser));
          if (updateProfile) {
            updateProfile(updatedUser);
          }
        }

        // Store the metadata in localStorage as an array
        try {
          const existingRaw = localStorage.getItem('knowledgesphere_newly_published');
          let existingList = [];
          if (existingRaw) {
            const parsed = JSON.parse(existingRaw);
            existingList = Array.isArray(parsed) ? parsed : [parsed];
          }
          if (!existingList.some(item => item.publicationId === metadata.publicationId)) {
            existingList.unshift(metadata); // Show newest first
          }
          localStorage.setItem('knowledgesphere_newly_published', JSON.stringify(existingList));
        } catch (e) {
          localStorage.setItem('knowledgesphere_newly_published', JSON.stringify([metadata]));
        }

        setPublishedPaperId(metadata.publicationId);
        setIsPublishing(false);
        setShowPublishSuccess(true);
      })
      .catch((err) => {
        console.error('Error saving custom paper:', err);
        setIsPublishing(false);
        setPublishError(err.message || "Something went wrong while publishing your research. Please try again.");
      });
  };


  const generatePDF = () => {
    // Show save indicator
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);

    import('html2pdf.js').then((html2pdfModule) => {
      const html2pdf = html2pdfModule.default || html2pdfModule;
      
      // Create a temporary container styled elegantly
      const container = document.createElement('div');
      container.style.padding = '40px';
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#1e293b';
      container.style.fontFamily = 'Inter, system-ui, sans-serif';
      container.style.lineHeight = '1.6';
      
      // Cover Image (if any)
      if (coverImage) {
        const img = document.createElement('img');
        img.src = coverImage;
        img.style.width = '100%';
        img.style.maxHeight = '280px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        img.style.marginBottom = '24px';
        img.style.display = 'block';
        container.appendChild(img);
      }
      
      // Title
      const titleEl = document.createElement('h1');
      titleEl.innerText = title || 'Untitled Publication';
      titleEl.style.fontSize = '28px';
      titleEl.style.fontWeight = 'bold';
      titleEl.style.color = '#0f172a';
      titleEl.style.marginBottom = '8px';
      titleEl.style.lineHeight = '1.2';
      container.appendChild(titleEl);
      
      // Subtitle / Abstract
      if (subtitle) {
        const subEl = document.createElement('p');
        subEl.innerText = subtitle;
        subEl.style.fontSize = '14px';
        subEl.style.color = '#475569';
        subEl.style.marginBottom = '24px';
        subEl.style.fontStyle = 'italic';
        container.appendChild(subEl);
      }
      
      // Metadata (Author & Affiliation)
      const metaContainer = document.createElement('div');
      metaContainer.style.display = 'flex';
      metaContainer.style.flexDirection = 'column';
      metaContainer.style.gap = '4px';
      metaContainer.style.borderBottom = '2px solid #e2e8f0';
      metaContainer.style.paddingBottom = '16px';
      metaContainer.style.marginBottom = '24px';
      
      const authorLine = document.createElement('div');
      authorLine.style.fontSize = '13px';
      authorLine.style.color = '#334155';
      authorLine.innerHTML = `<strong>Author:</strong> ${authorshipName || 'Anonymous'}`;
      metaContainer.appendChild(authorLine);
      

      
      const typeLine = document.createElement('div');
      typeLine.style.fontSize = '12px';
      typeLine.style.color = '#64748b';
      typeLine.style.marginTop = '4px';
      typeLine.innerHTML = `<span style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 500; text-transform: uppercase; font-size: 10px;">${pubType || 'Draft'}</span> | <span style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 500; text-transform: uppercase; font-size: 10px;">${category || 'General'}</span>`;
      metaContainer.appendChild(typeLine);
      
      container.appendChild(metaContainer);
      
      // Blocks Content
      blocks.forEach((block) => {
        const blockDiv = document.createElement('div');
        blockDiv.style.marginBottom = '18px';
        
        // Font Family mapping
        if (block.fontFamily === 'serif') {
          blockDiv.style.fontFamily = "'Playfair Display', Georgia, serif";
        } else if (block.fontFamily === 'mono') {
          blockDiv.style.fontFamily = "'JetBrains Mono', Courier New, monospace";
        } else {
          blockDiv.style.fontFamily = "Inter, sans-serif";
        }
        
        // Font Size mapping
        if (block.fontSize === 'sm') {
          blockDiv.style.fontSize = '12px';
        } else if (block.fontSize === 'lg') {
          blockDiv.style.fontSize = '18px';
        } else if (block.fontSize === 'xl') {
          blockDiv.style.fontSize = '24px';
        } else {
          blockDiv.style.fontSize = '14px';
        }
        
        // Font Color mapping
        if (block.color === 'muted') {
          blockDiv.style.color = '#64748b';
        } else if (block.color === 'blue') {
          blockDiv.style.color = '#1e40af';
        } else if (block.color === 'green') {
          blockDiv.style.color = '#065f46';
        } else if (block.color === 'red') {
          blockDiv.style.color = '#991b1b';
        } else if (block.color === 'indigo') {
          blockDiv.style.color = '#4338ca';
        } else {
          blockDiv.style.color = '#1e293b';
        }
        
        // Formatting modifiers
        if (block.bold) blockDiv.style.fontWeight = 'bold';
        if (block.italic) blockDiv.style.fontStyle = 'italic';
        if (block.underline) blockDiv.style.textDecoration = 'underline';
        
        // Content rendering matching original
        if (block.type === 'heading-2') {
          const h = document.createElement('h2');
          h.innerHTML = block.content || 'Section';
          h.style.fontSize = '20px';
          h.style.fontWeight = 'bold';
          h.style.color = '#0f172a';
          h.style.marginTop = '24px';
          h.style.borderBottom = '1px solid #f1f5f9';
          h.style.paddingBottom = '4px';
          blockDiv.appendChild(h);
        } else if (block.type === 'paragraph') {
          const p = document.createElement('p');
          p.innerHTML = block.content || '';
          p.style.lineHeight = '1.6';
          blockDiv.appendChild(p);
        } else if (block.type === 'quote') {
          const q = document.createElement('blockquote');
          q.innerHTML = block.content || '';
          q.style.borderLeft = '4px solid #3b82f6';
          q.style.paddingLeft = '16px';
          q.style.fontStyle = 'italic';
          q.style.color = '#475569';
          blockDiv.appendChild(q);
        } else if (block.type === 'list') {
          const listType = block.listType === 'ordered' ? 'ol' : 'ul';
          const listEl = document.createElement(listType);
          listEl.style.paddingLeft = '24px';
          listEl.style.margin = '8px 0';
          
          (block.items || []).forEach((item) => {
            const li = document.createElement('li');
            li.innerHTML = item || '';
            li.style.marginBottom = '4px';
            listEl.appendChild(li);
          });
          blockDiv.appendChild(listEl);
        } else if (block.type === 'code') {
          const pre = document.createElement('pre');
          pre.style.backgroundColor = '#1e293b';
          pre.style.color = '#f8fafc';
          pre.style.padding = '12px';
          pre.style.borderRadius = '6px';
          pre.style.overflowX = 'auto';
          pre.style.fontFamily = "'JetBrains Mono', Courier New, monospace";
          pre.style.fontSize = '12px';
          pre.style.margin = '12px 0';
          
          const code = document.createElement('code');
          code.innerText = block.content || '';
          pre.appendChild(code);
          blockDiv.appendChild(pre);
        } else if (block.type === 'table') {
          const tableEl = document.createElement('table');
          tableEl.style.width = '100%';
          tableEl.style.borderCollapse = 'collapse';
          tableEl.style.margin = '16px 0';
          tableEl.style.fontSize = '12px';
          
          (block.rows || []).forEach((row, rI) => {
            const tr = document.createElement('tr');
            row.forEach((cell) => {
              const td = document.createElement(rI === 0 ? 'th' : 'td');
              td.innerHTML = cell || '';
              td.style.border = '1px solid #e2e8f0';
              td.style.padding = '8px';
              if (rI === 0) {
                td.style.backgroundColor = '#f1f5f9';
                td.style.fontWeight = 'bold';
                td.style.textAlign = 'left';
              }
              tr.appendChild(td);
            });
            tableEl.appendChild(tr);
          });
          blockDiv.appendChild(tableEl);
        } else if (block.type === 'image') {
          if (block.src) {
            const imgEl = document.createElement('img');
            imgEl.src = block.src;
            imgEl.style.width = '100%';
            imgEl.style.maxHeight = '240px';
            imgEl.style.objectFit = 'contain';
            imgEl.style.borderRadius = '4px';
            imgEl.style.margin = '12px 0 4px 0';
            blockDiv.appendChild(imgEl);
            
            if (block.caption) {
              const captionEl = document.createElement('div');
              captionEl.innerText = block.caption;
              captionEl.style.textAlign = 'center';
              captionEl.style.fontSize = '11px';
              captionEl.style.color = '#64748b';
              captionEl.style.marginTop = '4px';
              blockDiv.appendChild(captionEl);
            }
          }
        }
        
        container.appendChild(blockDiv);
      });
      
      // Bibliography / References
      if (docReferences && docReferences.length > 0) {
        const bibDiv = document.createElement('div');
        bibDiv.style.marginTop = '40px';
        bibDiv.style.paddingTop = '16px';
        bibDiv.style.borderTop = '2px dashed #cbd5e1';
        
        const bibHeader = document.createElement('h3');
        bibHeader.innerText = 'Bibliography & Citations';
        bibHeader.style.fontSize = '16px';
        bibHeader.style.fontWeight = 'bold';
        bibHeader.style.color = '#0f172a';
        bibHeader.style.marginBottom = '12px';
        bibDiv.appendChild(bibHeader);
        
        const bibList = document.createElement('ul');
        bibList.style.paddingLeft = '20px';
        bibList.style.fontSize = '12px';
        bibList.style.color = '#475569';
        
        docReferences.forEach((ref) => {
          const li = document.createElement('li');
          li.style.marginBottom = '8px';
          
          let refText = `<strong>${ref.title || 'Untitled Reference'}</strong> (${ref.type ? ref.type.toUpperCase() : 'Web'})`;
          if (ref.description) {
            refText += ` - ${ref.description}`;
          }
          if (ref.url) {
            refText += ` | <span style="color: #2563eb; text-decoration: underline;">${ref.url}</span>`;
          } else if (ref.fileName) {
            refText += ` | 📄 Attached document: ${ref.fileName}`;
          }
          
          li.innerHTML = refText;
          bibList.appendChild(li);
        });
        
        bibDiv.appendChild(bibList);
        container.appendChild(bibDiv);
      }
      
      // Set html2pdf options
      const filenameBase = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'offline_draft';
      const opt = {
        margin:       15,
        filename:     `${filenameBase}_draft.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().from(container).set(opt).save();
    }).catch(err => {
      console.error("Error generating PDF:", err);
    });
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanTag = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (cleanTag && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="publish-container" id="publish-main">
      <AnimatePresence mode="wait">
        {isPublishing && (
          <motion.div
            key="publishing-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="publish-status-overlay"
          >
            <div className="publish-status-card">
              <div className="publish-spinner-container">
                <div className="publish-spinner"></div>
                <div className="publish-loading-text-bold">Publishing your research...</div>
                <div className="publish-loading-text-sub">Please wait...</div>
              </div>
            </div>
          </motion.div>
        )}

        {showPublishSuccess && (
          <motion.div
            key="publishing-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="publish-status-overlay"
          >
            <div className="publish-status-card">
              <div className="publish-status-icon-wrapper success">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="publish-status-title">✅ Research Published Successfully!</h2>
              <p className="publish-status-desc">
                Your publication is now live on KnowledgeSphere.
              </p>
              
              <hr className="publish-status-divider" />
              
              <div className="publish-status-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate('/profile', { state: { activeTab: 'published' } })}
                  style={{ minWidth: '160px', justifyContent: 'center' }}
                >
                  <BookOpen size={16} />
                  <span>View Publication</span>
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => navigate('/profile', { state: { activeTab: 'published' } })}
                  style={{ minWidth: '160px', justifyContent: 'center' }}
                >
                  <User size={16} />
                  <span>Go to Profile</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {publishError && (
          <motion.div
            key="publishing-error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="publish-status-overlay"
          >
            <div className="publish-status-card">
              <div className="publish-status-icon-wrapper error">
                <XCircle size={36} />
              </div>
              <h2 className="publish-status-title">❌ Publishing Failed</h2>
              <p className="publish-status-desc" style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>
                {publishError}
              </p>
              <p className="publish-status-desc">
                Something went wrong while publishing your research. Please try again.
              </p>
              
              <hr className="publish-status-divider" />
              
              <div className="publish-status-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={() => setPublishError(null)}
                  style={{ minWidth: '160px', justifyContent: 'center' }}
                >
                  <span>Go Back to Editor</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {!isPublishing && !showPublishSuccess && !publishError && (
          <motion.div
            key="publish-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {/* STEP 1: SETUP ENTRY PAGE */}
            {step === 1 && (
        <div className="publish-setup-card" id="publish-setup-step-1">
          {!isAuthenticated && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              boxShadow: '0 4px 12px rgba(122, 31, 31, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#7A1F1F',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <UserPlus size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    Sign Up Required to Publish
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.86rem', color: '#475569' }}>
                    You are exploring as a guest. Please sign up for an account to create and publish research papers.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                    boxShadow: '0 4px 12px rgba(122, 31, 31, 0.2)'
                  }}
                  id="publish-guest-banner-signup"
                >
                  <UserPlus size={16} />
                  <span>Sign Up Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1.5px solid #cbd5e1',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Log In
                </button>
              </div>
            </div>
          )}

          <div className="setup-header">
            <button className="setup-back-btn" onClick={() => navigate(-1)} id="btn-setup-back">
              <ArrowLeft size={18} />
              <span>Back to Home</span>
            </button>
            <h1 className="setup-main-title">Publish New Content</h1>
            <p className="setup-subtitle">Select a research category and publication type to begin writing.</p>
          </div>

          <div className="setup-fields-grid">
            {/* Category Field */}
            <div className="setup-form-group">
              <label className="setup-field-label">
                Research Category
                <span className="required-star">*</span>
              </label>
              
              <div className="custom-combobox-container">
                <div 
                  className={`combobox-trigger ${category ? 'has-val' : ''}`}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  id="category-combobox"
                >
                  {category ? (
                    <span className="selected-category-text">{formatEnumToLabel(category)}</span>
                  ) : (
                    <span className="placeholder-text">Select Category...</span>
                  )}
                  <ChevronRight size={16} className={`chevron-indicator ${showCategoryDropdown ? 'open' : ''}`} />
                </div>

                {showCategoryDropdown && (
                  <div className="combobox-dropdown">
                    <div className="combobox-search-box">
                      <Search size={14} className="search-icon" />
                      <input 
                        type="text" 
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <div className="combobox-options-list">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat, idx) => {
                          const catEnum = formatLabelToEnum(cat);
                          return (
                            <div 
                              key={idx} 
                              className={`combobox-option-item ${category === catEnum ? 'active' : ''}`}
                              onClick={() => {
                                setCategory(catEnum);
                                setShowCategoryDropdown(false);
                                setCategorySearch('');
                              }}
                            >
                              <span>{cat}</span>
                              {category === catEnum && <CheckCircle size={14} className="check-icon" />}
                            </div>
                          );
                        })
                      ) : (
                        <div className="no-options">No categories match your search</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Publication Type Field */}
            <div className="setup-form-group">
              <label className="setup-field-label">
                Publication Type
                <span className="required-star">*</span>
              </label>

              <div className="pub-types-grid">
                {PUBLICATION_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  const isSelected = pubType === type.id;
                  return (
                    <div 
                      key={type.id}
                      className={`pub-type-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setPubType(type.id)}
                      id={`pub-type-${type.id.toLowerCase().replace(' ', '-')}`}
                    >
                      <div className="pub-type-icon-wrapper">
                        <IconComponent size={24} />
                      </div>
                      <div className="pub-type-info">
                        <h3 className="pub-type-title">{type.label}</h3>
                        <p className="pub-type-desc">{type.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="setup-action-footer">
            <button 
              className="btn btn-primary btn-setup-continue" 
              onClick={handleContinue}
              disabled={!category || !pubType}
              id="setup-continue-btn"
            >
              <span>Continue to Editor</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: COMPOSER */}
      {step === 2 && (
        <div className={`editor-workspace ${isMobileFocusMode ? 'mobile-writing-focus' : ''}`} id="editor-workspace-step-2">
          {/* Minimal Top Banner when writing on mobile focus mode */}
          <div className="mobile-focus-top-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mobile-focus-title">Writing Focus</span>
              <span className="meta-badge-type" style={{ fontSize: '0.7rem' }}>{formatEnumToLabel(pubType)}</span>
            </div>
            <button 
              type="button" 
              className="btn-exit-mobile-focus" 
              onClick={handleExitMobileFocus}
              title="Done Writing"
            >
              <Check size={16} />
              <span>Done</span>
            </button>
          </div>

          {/* Top Actions Floating Bar */}
          <div className="editor-top-bar">
            <div className="top-bar-meta">
              <button className="top-bar-back-btn" onClick={() => setStep(1)} id="btn-editor-back-to-setup">
                <ArrowLeft size={16} />
                <span>Setup</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="meta-badge-tag">{formatEnumToLabel(category)}</span>
                <span className="meta-badge-type">{formatEnumToLabel(pubType)}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {saveSuccess && (
                <div className="badge success-badge-alert animate-fade-in">
                  <CheckCircle size={14} />
                  <span>Success! Saved</span>
                </div>
              )}
              <button className="btn btn-secondary" onClick={generatePDF} id="btn-save-draft">
                <Save size={16} />
                <span>Save Draft</span>
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handlePublish} 
                id="btn-publish-submit"
                disabled={isPublishing}
              >
                <span>{isPublishing ? 'Publishing...' : 'Publish Work'}</span>
              </button>
            </div>
          </div>

          {/* Unified Rich Text & Insert Toolbar */}
          <div className="unified-editor-toolbar" id="rich-text-toolbar">
            <div className="toolbar-group">
              <button 
                type="button" 
                className={`toolbar-btn ${activeStyles.bold ? 'active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleToggleBold();
                }}
                title="Bold (Ctrl+B)"
              >
                <Bold size={16} />
              </button>
              <button 
                type="button" 
                className={`toolbar-btn ${activeStyles.italic ? 'active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleToggleItalic();
                }}
                title="Italic (Ctrl+I)"
              >
                <Italic size={16} />
              </button>
              <button 
                type="button" 
                className={`toolbar-btn ${activeStyles.underline ? 'active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleToggleUnderline();
                }}
                title="Underline (Ctrl+U)"
              >
                <Underline size={16} />
              </button>
              <button 
                type="button" 
                className={`toolbar-btn ${activeStyles.strikethrough ? 'active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleToggleStrikethrough();
                }}
                title="Strikethrough"
              >
                <Strikethrough size={16} />
              </button>
              <button 
                type="button" 
                className={`toolbar-btn ${activeStyles.inlineCode ? 'active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  toggleInlineCode();
                }}
                title="Inline Code"
              >
                <Code size={14} />
              </button>

              {/* Hyperlink Tool */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button 
                  type="button" 
                  className={`toolbar-btn ${showLinkModal ? 'active' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                      savedRangeRef.current = selection.getRangeAt(0);
                      setSelectedText(selection.toString());
                      setLinkUrl('');
                      setLinkTitle('');
                      setShowLinkModal(true);
                    } else {
                      alert('Please select some text in the editor first to add a hyperlink.');
                    }
                  }}
                  title="Insert Hyperlink"
                >
                  <Link2 size={16} />
                </button>
                
                {showLinkModal && (
                  <div 
                    className="hyperlink-popover-toolbar"
                    ref={linkPopoverRef}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      marginTop: '8px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      width: '320px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      zIndex: 1000,
                      animation: 'modal-slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Create Hyperlink</span>
                    </div>

                    <div className="form-group-ref">
                      <label className="field-label-ref" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Selected Text</label>
                      <input 
                        type="text" 
                        className="input-field-ref" 
                        value={selectedText} 
                        readOnly 
                        style={{ backgroundColor: 'var(--bg-primary)', cursor: 'not-allowed', opacity: 0.8, fontSize: '0.82rem', padding: '6px 10px' }}
                      />
                    </div>

                    <div className="form-group-ref">
                      <label className="field-label-ref" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Link URL <span className="required-star">*</span></label>
                      <input 
                        type="text" 
                        className="input-field-ref" 
                        placeholder="https://example.com" 
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        autoFocus
                        style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (linkUrl) {
                              applyHyperlink(linkUrl, linkTitle);
                              setShowLinkModal(false);
                              savedRangeRef.current = null;
                            }
                          }
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                      <button 
                        type="button" 
                        className="modal-btn-ref btn-cancel-ref"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLinkModal(false);
                          savedRangeRef.current = null;
                        }}
                        style={{ padding: '6px 12px', fontSize: '0.78rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', backgroundColor: 'var(--bg-primary)', color: 'var(--color-text-muted)' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        className="modal-btn-ref btn-save-ref"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (linkUrl) {
                            applyHyperlink(linkUrl, linkTitle);
                            setShowLinkModal(false);
                            savedRangeRef.current = null;
                          } else {
                            alert('Please provide a URL link.');
                          }
                        }}
                        style={{ padding: '6px 12px', fontSize: '0.78rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reference Tool */}
              <button 
                type="button" 
                className="toolbar-btn"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (activeBlockId) {
                    setRefType('website');
                    setRefTitle('');
                    setRefDesc('');
                    setRefUrl('');
                    setRefFileName('');
                    setRefFileData('');
                    setEditingBlockRefId(activeBlockId);
                    setShowRefModal(true);
                  } else {
                    alert('Please click on a paragraph or block first to attach a reference.');
                  }
                }}
                title="Attach Source Reference to Block"
              >
                <BookOpen size={16} />
              </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
              {/* Font Family */}
              <ToolbarDropdown
                icon={Type}
                value={activeStyles.fontFamily || 'sans'}
                options={fontFamilyOptions}
                onChange={handleFontFamilyChange}
                placeholder="Font Family"
              />

              {/* Font Size */}
              <ToolbarDropdown
                labelSpan={<span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Size</span>}
                value={activeStyles.fontSize || 'base'}
                options={fontSizeOptions}
                onChange={handleFontSizeChange}
                placeholder="Size"
              />
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
              {/* Text Color */}
              <ToolbarDropdown
                icon={Palette}
                value={activeStyles.color || 'default'}
                options={textColorOptions}
                onChange={handleColorChange}
                placeholder="Text Color"
              />

              {/* Highlight Color */}
              <ToolbarDropdown
                icon={() => <Palette size={14} style={{ color: 'var(--color-primary)' }} />}
                value=""
                options={highlightOptions}
                onChange={(val) => {
                  const highlightMap = {
                    none: 'transparent',
                    yellow: '#fef08a',
                    green: '#bbf7d0',
                    blue: '#bfdbfe',
                    red: '#fecaca',
                    orange: '#fed7aa'
                  };
                  applyFormat('hiliteColor', highlightMap[val]);
                }}
                placeholder="Highlight"
              />
            </div>

            <div className="toolbar-divider" />

            {/* Desktop Insert Group */}
            <div className="toolbar-group insert-desktop-group">
              <button type="button" className="toolbar-btn btn-insert-compact" onClick={() => addBlock('heading-2')} title="Insert Heading 2">
                <Heading2 size={16} />
              </button>
              <button type="button" className="toolbar-btn btn-insert-compact" onClick={() => addBlock('paragraph')} title="Insert Paragraph">
                <FileText size={16} />
              </button>
              <button type="button" className="toolbar-btn btn-insert-compact" onClick={() => addBlock('quote')} title="Insert Quote Block">
                <Quote size={16} />
              </button>
              <button type="button" className="toolbar-btn btn-insert-compact" onClick={() => addBlock('list')} title="Insert List Block">
                <List size={16} />
              </button>
              <button type="button" className="toolbar-btn btn-insert-compact" onClick={() => addBlock('table')} title="Insert Table Block">
                <Table size={16} />
              </button>
              <button type="button" className="toolbar-btn btn-insert-compact" onClick={() => addBlock('code')} title="Insert Code Snippet">
                <Code size={16} />
              </button>
              <button type="button" className="toolbar-btn btn-insert-compact" onClick={() => addBlock('image')} title="Insert Inline Image">
                <Image size={16} />
              </button>
            </div>

            {/* Mobile Insert Dropdown */}
            <div className="toolbar-group insert-mobile-group">
              <ToolbarDropdown
                icon={Plus}
                value=""
                options={insertOptions}
                onChange={(val) => addBlock(val)}
                placeholder="Insert Block"
                className="insert-mobile-dropdown"
              />
            </div>
          </div>

          <div className="composer-grid">
            {/* Left Content Canvas */}
            <div className="composer-canvas">
              {/* Cover Image Section */}
              <div className="composer-cover-section" id="composer-cover-image">
                <div className="cover-url-form-group" style={{ marginBottom: '16px' }}>
                  <label className="cover-url-label" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                    Cover Image URL
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="url" 
                      placeholder="Paste cover image URL (https://...)" 
                      value={coverImage} 
                      onChange={(e) => setCoverImage(e.target.value)} 
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1.5px solid var(--color-border)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--color-text-main)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        transition: 'all var(--transition-fast)'
                      }}
                      className="cover-url-input-field"
                    />
                    {coverImage && (
                      <button 
                        type="button"
                        onClick={() => setCoverImage('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-light)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Clear URL"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                  {!isImageValid && coverImage && (
                    <p className="validation-error-message" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px', margin: 0, fontWeight: 500 }}>
                      Unable to load image from this URL.
                    </p>
                  )}
                </div>

                {coverImage && isImageValid ? (
                  <div className="cover-preview-container">
                    <img 
                      src={coverImage} 
                      alt="Cover Preview" 
                      className="cover-img-rendered" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                ) : (
                  <div className="cover-preview-container placeholder-preview" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '1.5px dashed var(--color-border)', 
                    borderRadius: 'var(--radius-xl)',
                    height: '240px',
                    gap: '12px' 
                  }}>
                    <Image size={40} style={{ color: 'var(--color-text-light)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                      {coverImage ? "Unable to load image preview" : "No cover image URL entered"}
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Subtitle block */}
              <div className="composer-titles-section">
                <input 
                  type="text" 
                  className="composer-title-input"
                  placeholder={pubType === 'NEWS' ? "Enter your News Headline..." : "Enter your publication title..."}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  id="publication-title"
                />
                
                <textarea 
                  className="composer-subtitle-input"
                  placeholder="Write a short subtitle, executive summary, or synopsis statement..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={2}
                  id="publication-subtitle"
                />
              </div>

              {/* Date Block specifically for News */}
              {pubType === 'NEWS' && (
                <div className="news-date-location-bar">
                  <div className="meta-field">
                    <Calendar size={14} />
                    <input type="date" className="news-date-picker" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="meta-field">
                    <span>Location:</span>
                    <input type="text" className="news-location-input" placeholder="City, Country..." />
                  </div>
                </div>
              )}

              {/* Dynamic Sections/Blocks Content */}
              <div className="blocks-stream" id="editor-blocks-stream">
                {blocks.map((block, index) => {
                  const isActive = activeBlockId === block.id;
                  
                  // Compute block CSS classes
                  const blockClasses = [
                    'stream-block-wrapper',
                    isActive ? 'block-active' : '',
                    `font-family-${block.fontFamily || 'sans'}`,
                    `font-size-${block.fontSize || 'base'}`,
                    `color-theme-${block.color || 'default'}`,
                    block.bold ? 'format-bold' : '',
                    block.italic ? 'format-italic' : '',
                    block.underline ? 'format-underline' : ''
                  ].filter(Boolean).join(' ');

                  return (
                    <div 
                      key={block.id} 
                      className={blockClasses}
                      onClick={() => setActiveBlockId(block.id)}
                      id={`block-wrapper-${block.id}`}
                    >
                      {/* Left Block Controls */}
                      <div className="block-context-controls">
                        <button type="button" className="btn-block-ctrl" onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} title="Move block up">
                          <ArrowUp size={12} />
                        </button>
                        <button type="button" className="btn-block-ctrl" onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }} title="Move block down">
                          <ArrowDown size={12} />
                        </button>
                        <button type="button" className="btn-block-ctrl btn-delete-ctrl" onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} title="Delete block">
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Content Renderers depending on block type */}
                      <div className="block-content-area">
                        {(block.type === 'heading-1' || block.type === 'heading-2') && (
                          <div className="heading-block-container">
                            <span className="block-type-tag">{block.type === 'heading-1' ? 'Header 1' : 'Section Header'}</span>
                            <ContentEditableBlock
                              html={block.content}
                              onChange={(html) => updateBlockContent(block.id, html)}
                              placeholder={block.placeholder || (block.type === 'heading-1' ? "Heading 1 Title..." : "Section Title...")}
                              className={block.type === 'heading-1' ? "block-heading-2-input font-size-xl" : "block-heading-2-input"}
                              onFocus={() => setActiveBlockId(block.id)}
                              blockId={block.id}
                            />
                          </div>
                        )}

                        {block.type === 'paragraph' && (
                          <ContentEditableBlock
                            html={block.content}
                            onChange={(html) => updateBlockContent(block.id, html)}
                            placeholder={block.placeholder || "Start typing paragraph text..."}
                            className="block-paragraph-textarea text-area-editable"
                            onFocus={() => setActiveBlockId(block.id)}
                            blockId={block.id}
                          />
                        )}

                        {block.type === 'quote' && (
                          <div className="quote-block-container">
                            <ContentEditableBlock
                              html={block.content}
                              onChange={(html) => updateBlockContent(block.id, html)}
                              placeholder={block.placeholder || "“Write your blockquote here...”"}
                              className="block-quote-textarea text-area-editable"
                              onFocus={() => setActiveBlockId(block.id)}
                              blockId={block.id}
                            />
                          </div>
                        )}

                        {block.type === 'list' && (
                          <div className="list-block-container">
                            <div className="list-controls">
                              <select 
                                className="list-style-select"
                                value={block.listType || 'bullet'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBlocks(prevBlocks => prevBlocks.map(b => b.id === block.id ? { ...b, listType: val } : b));
                                }}
                              >
                                <option value="bullet">Bulleted List (•)</option>
                                <option value="ordered">Numbered List (1, 2, 3)</option>
                              </select>
                              <button 
                                type="button" 
                                className="btn-add-list-item"
                                onClick={() => {
                                  setBlocks(prevBlocks => prevBlocks.map(b => {
                                    if (b.id === block.id) {
                                      return { ...b, items: [...(b.items || []), ''] };
                                    }
                                    return b;
                                  }));
                                }}
                              >
                                <Plus size={12} />
                                <span>Add Item</span>
                              </button>
                            </div>

                            <div className="list-items-holder">
                              {(block.items || []).map((item, itemIdx) => (
                                <div key={itemIdx} className="list-item-row">
                                  <span className="list-prefix">
                                    {block.listType === 'ordered' ? `${itemIdx + 1}.` : '•'}
                                  </span>
                                  <ContentEditableBlock
                                    html={item}
                                    onChange={(html) => {
                                      setBlocks(prevBlocks => prevBlocks.map(b => {
                                        if (b.id === block.id) {
                                          const updatedItems = [...(b.items || [])];
                                          updatedItems[itemIdx] = html;
                                          return { ...b, items: updatedItems };
                                        }
                                        return b;
                                      }));
                                    }}
                                    className="list-item-input"
                                    placeholder="List item..."
                                    onFocus={() => setActiveBlockId(block.id)}
                                    blockId={block.id}
                                    itemIndex={itemIdx}
                                  />
                                  <button 
                                    type="button" 
                                    className="btn-remove-list-item"
                                    onClick={() => {
                                      setBlocks(prevBlocks => prevBlocks.map(b => {
                                        if (b.id === block.id) {
                                          return { ...b, items: (b.items || []).filter((_, i) => i !== itemIdx) };
                                        }
                                        return b;
                                      }));
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === 'code' && (
                          <div className="code-block-container">
                            <div className="code-header">
                              <select 
                                className="code-lang-select"
                                value={block.language || 'javascript'}
                                onChange={(e) => {
                                  const lang = e.target.value;
                                  setBlocks(prevBlocks => prevBlocks.map(b => b.id === block.id ? { ...b, language: lang } : b));
                                }}
                              >
                                <option value="javascript">JavaScript (Node)</option>
                                <option value="python">Python 3</option>
                                <option value="cpp">C++ 17</option>
                                <option value="html">HTML5</option>
                                <option value="css">CSS3</option>
                                <option value="sql">PostgreSQL / SQL</option>
                              </select>
                              <span className="code-snippet-tag">Syntax Highlighter Mode</span>
                            </div>
                            <textarea 
                              className="code-snippet-textarea"
                              value={block.content}
                              onChange={(e) => updateBlockContent(block.id, e.target.value)}
                              rows={5}
                            />
                          </div>
                        )}

                        {block.type === 'table' && (
                          <div className="table-block-container">
                            <div className="table-wrapper-scroll">
                              <table className="composer-table">
                                <tbody>
                                  {(block.rows || []).map((row, rowIdx) => (
                                    <tr key={rowIdx}>
                                      {row.map((cell, colIdx) => (
                                        <td key={colIdx} className={rowIdx === 0 ? 'header-td' : 'data-td'}>
                                          <ContentEditableBlock
                                            html={cell}
                                            onChange={(html) => {
                                              setBlocks(prevBlocks => prevBlocks.map(b => {
                                                if (b.id === block.id) {
                                                  const updatedRows = (b.rows || []).map((r, rI) => 
                                                    rI === rowIdx ? r.map((c, cI) => cI === colIdx ? html : c) : r
                                                  );
                                                  return { ...b, rows: updatedRows };
                                                }
                                                return b;
                                              }));
                                            }}
                                            className="table-cell-input"
                                            placeholder="..."
                                            onFocus={() => setActiveBlockId(block.id)}
                                            blockId={block.id}
                                            rowIndex={rowIdx}
                                            colIndex={colIdx}
                                          />
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="table-row-controls">
                              <button 
                                type="button" 
                                className="btn-table-action"
                                onClick={() => {
                                  setBlocks(prevBlocks => prevBlocks.map(b => {
                                    if (b.id === block.id) {
                                      const colCount = b.rows[0]?.length || 1;
                                      const newRow = Array(colCount).fill('New Cell');
                                      return { ...b, rows: [...(b.rows || []), newRow] };
                                    }
                                    return b;
                                  }));
                                }}
                              >
                                + Row
                              </button>
                              <button 
                                type="button" 
                                className="btn-table-action"
                                onClick={() => {
                                  setBlocks(prevBlocks => prevBlocks.map(b => {
                                    if (b.id === block.id) {
                                      const updatedRows = (b.rows || []).map(row => [...row, 'New Cell']);
                                      return { ...b, rows: updatedRows };
                                    }
                                    return b;
                                  }));
                                }}
                              >
                                + Column
                              </button>
                              <button 
                                type="button" 
                                className="btn-table-action btn-danger-action"
                                disabled={block.rows.length <= 1}
                                onClick={() => {
                                  setBlocks(prevBlocks => prevBlocks.map(b => {
                                    if (b.id === block.id) {
                                      return { ...b, rows: (b.rows || []).slice(0, -1) };
                                    }
                                    return b;
                                  }));
                                }}
                              >
                                - Row
                              </button>
                              <button 
                                type="button" 
                                className="btn-table-action btn-danger-action"
                                disabled={block.rows[0].length <= 1}
                                onClick={() => {
                                  setBlocks(prevBlocks => prevBlocks.map(b => {
                                    if (b.id === block.id) {
                                      const updatedRows = (b.rows || []).map(row => row.slice(0, -1));
                                      return { ...b, rows: updatedRows };
                                    }
                                    return b;
                                  }));
                                }}
                              >
                                - Column
                              </button>
                            </div>
                          </div>
                        )}

                        {block.type === 'image' && (
                          <div className="inline-image-block-container">
                            {block.src ? (
                              <div className="inline-img-rendered-wrapper">
                                <img src={block.src} alt="Inline block" className="inline-img-file" referrerPolicy="no-referrer" />
                                <div className="inline-img-controls">
                                  <label className="inline-img-btn" htmlFor={`inline-file-replace-${block.id}`}>
                                    Replace Image
                                  </label>
                                  <input 
                                    type="file" 
                                    id={`inline-file-replace-${block.id}`} 
                                    accept="image/*" 
                                    onChange={(e) => handleInlineImageChange(block.id, e)} 
                                    style={{ display: 'none' }} 
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="inline-image-selector">
                                <label htmlFor={`inline-file-${block.id}`} className="inline-upload-btn">
                                  <Image size={20} />
                                  <span>Upload Block Image</span>
                                </label>
                                <input 
                                  type="file" 
                                  id={`inline-file-${block.id}`} 
                                  accept="image/*" 
                                  onChange={(e) => handleInlineImageChange(block.id, e)} 
                                  style={{ display: 'none' }} 
                                />
                              </div>
                            )}
                            <input 
                              type="text" 
                              className="inline-image-caption" 
                              value={block.caption || ''} 
                              onChange={(e) => {
                                const captionText = e.target.value;
                                setBlocks(prevBlocks => prevBlocks.map(b => b.id === block.id ? { ...b, caption: captionText } : b));
                              }}
                              placeholder="Enter image caption here..."
                            />
                          </div>
                        )}
                      </div>

                      {/* Block Attached References Container */}
                      {block.references && block.references.length > 0 && (
                        <div 
                          className="block-attached-references-list" 
                          id={`attached-refs-list-${block.id}`} 
                          style={{ 
                            marginTop: '8px', 
                            paddingLeft: '4px', 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '8px',
                            alignItems: 'center' 
                          }}
                        >
                          {block.references.map((ref, refIdx) => (
                            <div 
                              key={ref.id || refIdx} 
                              className="block-attached-reference-item" 
                              id={`ref-item-${ref.id || refIdx}`} 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                margin: 0 
                              }}
                            >
                              <button
                                type="button"
                                className="ref-action-btn btn-view-ref"
                                onClick={() => handleOpenReference(ref)}
                                id={`btn-view-ref-${ref.id || refIdx}`}
                                style={{ 
                                  backgroundColor: '#0066cc', 
                                  color: '#ffffff', 
                                  border: 'none', 
                                  borderRadius: 'var(--radius-md)', 
                                  padding: '5px 12px', 
                                  fontSize: '0.8rem', 
                                  fontWeight: '600', 
                                  cursor: 'pointer', 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '6px',
                                  transition: 'background-color var(--transition-fast)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#004499'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
                              >
                                <BookOpen size={13} />
                                <span>View Source: {ref.title || 'Reference'}</span>
                              </button>
                              <button
                                type="button"
                                className="ref-action-btn btn-delete-ref"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBlocks(prevBlocks => prevBlocks.map(b => {
                                    if (b.id === block.id) {
                                      const updatedRefs = (b.references || []).filter((_, i) => i !== refIdx);
                                      return { ...b, references: updatedRefs };
                                    }
                                    return b;
                                  }));
                                }}
                                id={`btn-remove-ref-${ref.id || refIdx}`}
                                style={{ 
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                                  color: '#ef4444', 
                                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                                  borderRadius: 'var(--radius-md)', 
                                  padding: '5px 8px', 
                                  fontSize: '0.8rem', 
                                  cursor: 'pointer', 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  transition: 'all var(--transition-fast)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#ef4444';
                                  e.currentTarget.style.color = '#ffffff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                  e.currentTarget.style.color = '#ef4444';
                                }}
                                title="Remove reference"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Insert Block Trigger */}
              <div className="bottom-quick-insert">
                <button type="button" className="btn-bottom-add" onClick={() => addBlock('paragraph')}>
                  <Plus size={16} />
                  <span>Insert paragraph block at bottom</span>
                </button>
              </div>

              {/* Dedicated Bibliography Section at the End */}
              <div className="composer-bibliography-section" id="editor-bibliography-section" style={{ marginTop: '40px', paddingTop: '24px', borderTop: '2px dashed var(--color-border)' }}>
                <div className="bibliography-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
                  <h3 className="bibliography-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-main)', margin: 0 }}>References & Bibliography</h3>
                </div>
                <p className="bibliography-subtitle" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 16px 0' }}>
                  Add, edit, delete, and reorder full publication-wide references and bibliography entries.
                </p>

                {docReferences.length === 0 ? (
                  <div className="bibliography-empty-state" style={{ padding: '24px', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>No document-wide bibliography references added yet.</p>
                    <button 
                      type="button" 
                      className="btn-add-bib-ref"
                      onClick={() => {
                        setRefType('website');
                        setRefTitle('');
                        setRefDesc('');
                        setRefUrl('');
                        setRefFileName('');
                        setRefFileData('');
                        setIsEditingDocRefIndex(null);
                        setEditingBlockRefId(null);
                        setShowRefModal(true);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, padding: '6px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid rgba(37, 99, 235, 0.15)', cursor: 'pointer' }}
                    >
                      <Plus size={14} />
                      <span>Add First Reference</span>
                    </button>
                  </div>
                ) : (
                  <div className="bibliography-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {docReferences.map((ref, index) => (
                      <div key={index} className="bibliography-list-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-primary)' }}>
                        <div className="bib-item-index" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', minWidth: '20px' }}>{index + 1}.</div>
                        <div className="bib-item-details" style={{ flex: 1 }}>
                          <div className="bib-item-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span className="bib-type-tag" style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(37, 99, 235, 0.08)', color: 'var(--color-primary)' }}>{ref.type}</span>
                            {ref.url && <span className="bib-link-indicator" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>🔗 {ref.url}</span>}
                            {ref.fileName && <span className="bib-link-indicator" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>📄 {ref.fileName}</span>}
                          </div>
                          <h4 className="bib-title" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>{ref.title || 'Untitled Reference'}</h4>
                          {ref.description && <p className="bib-desc" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>{ref.description}</p>}
                        </div>
                        <div className="bib-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            type="button" 
                            className="bib-action-btn"
                            disabled={index === 0}
                            onClick={() => {
                              const newList = [...docReferences];
                              const temp = newList[index];
                              newList[index] = newList[index - 1];
                              newList[index - 1] = temp;
                              setDocReferences(newList);
                            }}
                            title="Move Up"
                            style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.4 : 1 }}
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button 
                            type="button" 
                            className="bib-action-btn"
                            disabled={index === docReferences.length - 1}
                            onClick={() => {
                              const newList = [...docReferences];
                              const temp = newList[index];
                              newList[index] = newList[index + 1];
                              newList[index + 1] = temp;
                              setDocReferences(newList);
                            }}
                            title="Move Down"
                            style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-muted)', cursor: index === docReferences.length - 1 ? 'not-allowed' : 'pointer', opacity: index === docReferences.length - 1 ? 0.4 : 1 }}
                          >
                            <ArrowDown size={11} />
                          </button>
                          <button 
                            type="button" 
                            className="bib-action-btn"
                            onClick={() => {
                              setRefType(ref.type || 'website');
                              setRefTitle(ref.title || '');
                              setRefDesc(ref.description || '');
                              setRefUrl(ref.url || '');
                              setRefFileName(ref.fileName || '');
                              setRefFileData(ref.fileData || '');
                              setIsEditingDocRefIndex(index);
                              setEditingBlockRefId(null);
                              setShowRefModal(true);
                            }}
                            title="Edit Reference"
                            style={{ fontSize: '0.78rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', fontWeight: 500 }}
                          >
                            Edit
                          </button>
                          <button 
                            type="button" 
                            className="bib-action-btn btn-delete-ref"
                            onClick={() => {
                              setDocReferences(docReferences.filter((_, i) => i !== index));
                            }}
                            title="Delete Reference"
                            style={{ fontSize: '0.78rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', fontWeight: 500 }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      type="button" 
                      className="btn-add-bib-ref"
                      onClick={() => {
                        setRefType('website');
                        setRefTitle('');
                        setRefDesc('');
                        setRefUrl('');
                        setRefFileName('');
                        setRefFileData('');
                        setIsEditingDocRefIndex(null);
                        setEditingBlockRefId(null);
                        setShowRefModal(true);
                      }}
                      style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, padding: '6px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid rgba(37, 99, 235, 0.15)', cursor: 'pointer', marginTop: '8px' }}
                    >
                      <Plus size={14} />
                      <span>Add Bibliography Reference</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Settings Panel Overlay for Mobile/Tablet */}
            {showMobileSidebar && (
              <div className="sidebar-overlay" onClick={() => setShowMobileSidebar(false)} />
            )}

            {/* Right Side Settings Panel */}
            <div className={`composer-sidebar ${showMobileSidebar ? 'open' : ''}`}>
              <div className="sidebar-header-mobile">
                <h3 className="panel-title-main">Document Settings</h3>
                <button 
                  type="button" 
                  className="btn-close-sidebar" 
                  onClick={() => setShowMobileSidebar(false)}
                  title="Close Settings"
                >
                  ×
                </button>
              </div>

              <div className="sidebar-panel">
                <h3 className="panel-title">Publication Metadata</h3>
                
                <div className="sidebar-meta-row">
                  <span className="meta-row-label">Category:</span>
                  <span className="meta-row-value">{formatEnumToLabel(category)}</span>
                </div>
                <div className="sidebar-meta-row" style={{ marginBottom: '16px' }}>
                  <span className="meta-row-label">Format:</span>
                  <span className="meta-row-value">{formatEnumToLabel(pubType)}</span>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Author Name
                    <span className="required-star" style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={authorshipName} 
                    onChange={(e) => {
                      setAuthorshipName(e.target.value);
                      if (e.target.value.trim()) {
                        setAuthorNameError('');
                      }
                    }}
                    placeholder="Enter author name (required)..." 
                    required
                  />
                  {authorNameError && (
                    <span className="validation-warning" style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                      {authorNameError}
                    </span>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    Language
                    <span className="required-star" style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>
                  </label>
                  <select 
                    className="form-control" 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', height: '42px' }}
                    onClick={handlePublish}
                    id="sidebar-publish-btn"
                    disabled={isPublishing}
                  >
                    <span>{isPublishing ? 'Publishing...' : 'Publish Document'}</span>
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ width: '100%', justifyContent: 'center', height: '42px' }}
                    onClick={generatePDF}
                  >
                    <Download size={16} />
                    <span>Download Offline Draft</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Metadata Toggle for Mobile/Tablet */}
            <button 
              type="button"
              className="floating-metadata-toggle"
              onClick={() => setShowMobileSidebar(true)}
              title="Show Document Metadata"
              id="floating-meta-toggle"
            >
              <Settings size={18} />
              <span>Metadata & Settings</span>
            </button>

            {/* Mobile Compact Formatting Toolbar (Sticky at bottom during typing) */}
            <div className={`mobile-compact-toolbar ${isMobileFocusMode ? 'active' : ''}`} id="mobile-compact-toolbar">
              <div className="mobile-toolbar-inner">
                <button
                  type="button"
                  className={`mobile-tb-btn ${activeStyles.bold ? 'active' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); handleToggleBold(); }}
                  onTouchStart={(e) => { e.preventDefault(); handleToggleBold(); }}
                  title="Bold"
                >
                  <Bold size={18} />
                </button>

                <button
                  type="button"
                  className={`mobile-tb-btn ${activeStyles.italic ? 'active' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); handleToggleItalic(); }}
                  onTouchStart={(e) => { e.preventDefault(); handleToggleItalic(); }}
                  title="Italic"
                >
                  <Italic size={18} />
                </button>

                <button
                  type="button"
                  className={`mobile-tb-btn ${activeStyles.underline ? 'active' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); handleToggleUnderline(); }}
                  onTouchStart={(e) => { e.preventDefault(); handleToggleUnderline(); }}
                  title="Underline"
                >
                  <Underline size={18} />
                </button>

                <button
                  type="button"
                  className={`mobile-tb-btn ${showLinkModal ? 'active' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                      savedRangeRef.current = selection.getRangeAt(0);
                      setSelectedText(selection.toString());
                      setLinkUrl('');
                      setLinkTitle('');
                      setShowLinkModal(true);
                    } else {
                      alert('Please select some text first to add a link.');
                    }
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                      savedRangeRef.current = selection.getRangeAt(0);
                      setSelectedText(selection.toString());
                      setLinkUrl('');
                      setLinkTitle('');
                      setShowLinkModal(true);
                    } else {
                      alert('Please select some text first to add a link.');
                    }
                  }}
                  title="Insert Link"
                >
                  <Link2 size={18} />
                </button>

                <button
                  type="button"
                  className="mobile-tb-btn"
                  onMouseDown={(e) => { e.preventDefault(); addBlock('image'); }}
                  onTouchStart={(e) => { e.preventDefault(); addBlock('image'); }}
                  title="Insert Image"
                >
                  <Image size={18} />
                </button>

                <button
                  type="button"
                  className={`mobile-tb-btn ${showMobileMoreMenu ? 'active' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); setShowMobileMoreMenu(!showMobileMoreMenu); }}
                  onTouchStart={(e) => { e.preventDefault(); setShowMobileMoreMenu(!showMobileMoreMenu); }}
                  title="More Options"
                >
                  <MoreHorizontal size={18} />
                </button>

                <div className="mobile-tb-divider" />

                <button
                  type="button"
                  className="mobile-tb-btn btn-done-writing"
                  onClick={handleExitMobileFocus}
                  title="Done / Close Keyboard"
                >
                  <Check size={18} />
                  <span>Done</span>
                </button>
              </div>

              {/* Mobile "More" Drawer Popover */}
              {showMobileMoreMenu && (
                <div className="mobile-more-drawer animate-slide-up" onMouseDown={(e) => e.preventDefault()}>
                  <div className="more-drawer-header">
                    <span className="drawer-title">Advanced Formatting & Blocks</span>
                    <button 
                      type="button" 
                      className="drawer-close-btn"
                      onClick={() => setShowMobileMoreMenu(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="more-drawer-section">
                    <span className="drawer-section-label">Insert Content Blocks</span>
                    <div className="drawer-blocks-grid">
                      <button type="button" className="drawer-block-btn" onClick={() => { addBlock('heading-1'); setShowMobileMoreMenu(false); }}>
                        <Heading1 size={16} />
                        <span>H1 Title</span>
                      </button>
                      <button type="button" className="drawer-block-btn" onClick={() => { addBlock('heading-2'); setShowMobileMoreMenu(false); }}>
                        <Heading2 size={16} />
                        <span>H2 Header</span>
                      </button>
                      <button type="button" className="drawer-block-btn" onClick={() => { addBlock('paragraph'); setShowMobileMoreMenu(false); }}>
                        <FileText size={16} />
                        <span>Paragraph</span>
                      </button>
                      <button type="button" className="drawer-block-btn" onClick={() => { addBlock('quote'); setShowMobileMoreMenu(false); }}>
                        <Quote size={16} />
                        <span>Quote</span>
                      </button>
                      <button type="button" className="drawer-block-btn" onClick={() => { addBlock('list'); setShowMobileMoreMenu(false); }}>
                        <List size={16} />
                        <span>List</span>
                      </button>
                      <button type="button" className="drawer-block-btn" onClick={() => { addBlock('code'); setShowMobileMoreMenu(false); }}>
                        <Code size={16} />
                        <span>Code</span>
                      </button>
                      <button type="button" className="drawer-block-btn" onClick={() => { addBlock('table'); setShowMobileMoreMenu(false); }}>
                        <Table size={16} />
                        <span>Table</span>
                      </button>
                    </div>
                  </div>

                  <div className="more-drawer-section">
                    <span className="drawer-section-label">Style & Settings</span>
                    <div className="drawer-format-row">
                      <button 
                        type="button" 
                        className={`drawer-fmt-btn ${activeStyles.strikethrough ? 'active' : ''}`}
                        onClick={() => handleToggleStrikethrough()}
                      >
                        <Strikethrough size={16} />
                        <span>Strikethrough</span>
                      </button>
                      <button 
                        type="button" 
                        className={`drawer-fmt-btn ${activeStyles.inlineCode ? 'active' : ''}`}
                        onClick={() => toggleInlineCode()}
                      >
                        <Code size={16} />
                        <span>Inline Code</span>
                      </button>
                      <button 
                        type="button" 
                        className="drawer-fmt-btn"
                        onClick={() => {
                          setShowMobileSidebar(true);
                          setShowMobileMoreMenu(false);
                        }}
                      >
                        <Settings size={16} />
                        <span>Doc Settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

          </motion.div>
        )}
      </AnimatePresence>



      {/* Reference Dialog Modal */}
      {showRefModal && (
        <div className="modal-overlay-ref" id="reference-modal-overlay">
          <div className="modal-card-ref">
            <h3 className="modal-title-ref">
              {editingBlockRefId 
                ? 'Attach Source Reference to Block' 
                : (isEditingDocRefIndex !== null ? 'Edit Bibliography Reference' : 'Add Bibliography Reference')}
            </h3>
            <p className="modal-subtitle-ref">Specify metadata and file/URL attachments for this supporting citation.</p>
            
            <div className="form-group-ref">
              <label className="field-label-ref">Reference Type <span className="required-star">*</span></label>
              <select 
                className="select-field-ref" 
                value={refType}
                onChange={(e) => setRefType(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--color-text-main)', fontSize: '0.9rem', outline: 'none' }}
              >
                <option value="website">Website URL Citation</option>
                <option value="doi">Digital Object Identifier (DOI)</option>
                <option value="paper">Academic Research Paper</option>
                <option value="pdf">Online PDF Source</option>
                <option value="document">Local Document File</option>
              </select>
            </div>

            <div className="form-group-ref">
              <label className="field-label-ref">Reference Title <span className="required-star">*</span></label>
              <input 
                type="text" 
                className="input-field-ref" 
                placeholder="e.g. Nature Quantum Mechanics Study, 2024" 
                value={refTitle}
                onChange={(e) => setRefTitle(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--color-text-main)', fontSize: '0.9rem', outline: 'none' }}
                required
              />
            </div>

            <div className="form-group-ref">
              <label className="field-label-ref">Supporting Description / Snippet (Optional)</label>
              <textarea 
                className="textarea-field-ref" 
                rows={3}
                placeholder="Briefly describe the key takeaways, data findings, or quote supported..." 
                value={refDesc}
                onChange={(e) => setRefDesc(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--color-text-main)', fontSize: '0.9rem', outline: 'none', resize: 'none' }}
              />
            </div>

            {/* Render URL input for web-linked sources */}
            {refType !== 'document' && (
              <div className="form-group-ref">
                <label className="field-label-ref">
                  {refType === 'doi' ? 'DOI Code / URL' : 'Source Link / URL'} <span className="required-star">*</span>
                </label>
                <input 
                  type="text" 
                  className="input-field-ref" 
                  placeholder={refType === 'doi' ? 'e.g. 10.1038/s41567-023-02055-1' : 'https://example.org/resource'} 
                  value={refUrl}
                  onChange={(e) => setRefUrl(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--color-text-main)', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            )}

            {/* Render File Upload for all reference types */}
            <div className="form-group-ref">
              <label className="field-label-ref">Upload PDF / Document File (Optional if URL provided)</label>
              <div 
                className={`file-dropzone-ref ${isRefDragging ? 'dragging' : ''}`}
                onClick={() => document.getElementById('ref-file-input').click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsRefDragging(true);
                }}
                onDragLeave={() => setIsRefDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsRefDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    setRefFileName(file.name);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setRefFileData(reader.result);
                    };
                    reader.onerror = (err) => {
                      console.error('FileReader error on dropped file:', err);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ 
                  border: isRefDragging ? '2.5px dashed var(--color-primary)' : '2px dashed var(--color-border)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '24px 20px', 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  backgroundColor: isRefDragging ? 'var(--color-primary-light)' : 'var(--bg-primary)', 
                  transition: 'all 0.2s',
                  transform: isRefDragging ? 'scale(1.01)' : 'none'
                }}
              >
                <Upload size={24} style={{ color: isRefDragging ? 'var(--color-primary)' : 'var(--color-text-light)', margin: '0 auto 8px auto' }} />
                {refFileName ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                    <span className="file-name-indicator" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>Selected: {refFileName}</span>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setRefFileName('');
                        setRefFileData('');
                      }}
                      style={{ fontSize: '0.75rem', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <span className="file-name-indicator" style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Click to choose or drag document/PDF here</span>
                )}
                <input 
                  type="file" 
                  id="ref-file-input" 
                  style={{ display: 'none' }} 
                  accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg" 
                  onChange={handleRefFileUpload}
                />
              </div>
            </div>

            <div className="modal-actions-ref" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                type="button" 
                className="modal-btn-ref btn-cancel-ref"
                onClick={() => {
                  setShowRefModal(false);
                  setEditingBlockRefId(null);
                  setIsEditingDocRefIndex(null);
                }}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--bg-primary)', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="modal-btn-ref btn-save-ref"
                onClick={() => {
                  if (!refTitle) {
                    alert('Please provide a title for the reference.');
                    return;
                  }
                  if (refType !== 'document' && !refUrl && !refFileData) {
                    alert('Please provide either a source URL link or upload a local file/PDF.');
                    return;
                  }
                  handleSaveReference();
                }}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}
              >
                {editingBlockRefId ? 'Attach to Paragraph' : 'Save Reference'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIGN UP REQUIRED MODAL OVERLAY */}
      {showSignUpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '460px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              color: '#7A1F1F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <UserPlus size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
              Sign Up Required to Publish
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              You are currently exploring KnowledgeSphere as a guest. Please sign up for an account to publish your research papers and articles.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                onClick={() => navigate('/register')}
                style={{
                  width: '100%',
                  backgroundColor: '#7A1F1F',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(122, 31, 31, 0.25)'
                }}
                id="modal-signup-now-btn"
              >
                Sign Up Now
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  width: '100%',
                  backgroundColor: '#f8fafc',
                  color: '#334155',
                  border: '1.5px solid #cbd5e1',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setShowSignUpModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  padding: '8px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
