import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Bookmark, User, Settings, PenTool, Menu, X, ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import logoImg from '../assets/images/KnowledgeSphere_logo.png';
import { isUserAuthenticated, getStoredUserProfile } from '../lib/authStorage';
import './Sidebar.css';

export default function Sidebar({ isCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = isUserAuthenticated();
  const userProfile = getStoredUserProfile();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const getInitials = () => {
    if (!userProfile?.name) return 'KS';
    return userProfile.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Close mobile sidebar automatically on route location change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll on mobile when sidebar drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isReadingArticle = location.pathname.startsWith('/research');

  const isLoggedIn = !!localStorage.getItem("loggedInUser");

  const navItems = [
    { label: 'Home', icon: Home, path: '/home' },
    { label: 'Search', icon: Search, path: '/explore' },
    { 
      label: isLoggedIn ? 'Publish' : 'Login to publish', 
      icon: PenTool, 
      path: isLoggedIn ? '/publish' : '/login' 
    },
    { label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
    { label: 'Profile', icon: User, path: '/profile' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="mobile-header">
        {isReadingArticle ? (
          <button 
            className="mobile-back-btn" 
            onClick={() => navigate(-1)} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'none', 
              border: 'none', 
              color: 'var(--color-text-main)', 
              fontWeight: 600, 
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        ) : (
          <div 
            className="logo-section" 
            style={{ marginBottom: 0, cursor: 'pointer' }}
            onClick={() => { navigate('/home'); setIsOpen(false); }}
          >
            <img 
              src={logoImg} 
              alt="KnowledgeSphere Logo" 
              style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '6px' }} 
              referrerPolicy="no-referrer"
            />
            <span>KnowledgeSphere</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {location.pathname !== '/home' && location.pathname !== '/explore' && (
            <button 
              className="mobile-nav-btn" 
              onClick={() => { navigate('/explore'); setIsOpen(false); }}
              title="Search"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center' }}
            >
              <Search size={20} />
            </button>
          )}
          <button className="mobile-nav-btn" onClick={toggleSidebar} title="Menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}></div>

      {/* Sidebar Panel */}
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header-row">
          <div 
            className="logo-section"
            style={{ cursor: 'pointer', marginBottom: 0 }}
            onClick={() => { navigate('/home'); setIsOpen(false); }}
          >
            <img 
              src={logoImg} 
              alt="KnowledgeSphere Logo" 
              style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }} 
              referrerPolicy="no-referrer"
            />
            <span>KnowledgeSphere</span>
          </div>
          <button 
            className="sidebar-close-btn" 
            onClick={() => setIsOpen(false)}
            title="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Back Button specifically for Article Reading */}
        {isReadingArticle && (
          <div className="sidebar-back-container">
            <button 
              className="sidebar-back-btn" 
              onClick={() => { navigate(-1); setIsOpen(false); }}
              title={isCollapsed ? "Back to Browse" : undefined}
            >
              <ArrowLeft size={18} />
              {!isCollapsed && <span>Back to Feed</span>}
            </button>
          </div>
        )}

        <nav className="nav-links">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-divider"></div>

        {isAuthenticated ? (
          <div 
            className="profile-card" 
            title={`${userProfile?.name || 'User'} (${userProfile?.handle || '@scholar'}) - Click to view Profile`}
            onClick={() => { navigate('/profile'); setIsOpen(false); }}
            style={{ cursor: 'pointer' }}
          >
            <div className="profile-avatar">
              {userProfile?.avatarImage ? (
                <>
                  <img 
                    src={userProfile.avatarImage} 
                    alt={userProfile.name} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <span style={{ display: 'none', width: '100%', height: '100%', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{getInitials()}</span>
                </>
              ) : (
                <span>{getInitials()}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="profile-info">
                <span className="profile-name">{userProfile?.name || 'Scholar'}</span>
                <span className="profile-handle">{userProfile?.handle || '@scholar'}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="sidebar-guest-card">
            {!isCollapsed ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Guest Explorer
                </div>
                <button
                  type="button"
                  onClick={() => { navigate('/register'); setIsOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#7A1F1F',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  id="sidebar-btn-create-account"
                >
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => { navigate('/login'); setIsOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-main)',
                    border: '1px solid var(--color-border)',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  id="sidebar-btn-signin"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </button>
              </div>
            ) : (
              <div 
                className="profile-avatar" 
                onClick={() => { navigate('/login'); setIsOpen(false); }}
                title="Sign In / Create Account"
                style={{ cursor: 'pointer', backgroundColor: '#7A1F1F', color: '#ffffff' }}
              >
                <UserPlus size={18} />
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
