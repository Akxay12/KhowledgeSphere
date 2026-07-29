import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, UserPlus, LogIn } from 'lucide-react';
import logoImg from '../assets/images/KhowledgeSphere_log.png';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar({ onSearch, onToggleSidebar, isSidebarCollapsed }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { user: userProfile, isAuthenticated } = useAuth();


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/explore?q=${encodeURIComponent(query)}`);
    }
  };

  const getInitials = () => {
    if (userProfile?.name) {
      const parts = userProfile.name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return userProfile.name.substring(0, 2).toUpperCase();
    }
    return 'KS';
  };

  return (
    <header className="navbar">
      <div className="nav-left-section">
        <button className="hamburger-btn" onClick={onToggleSidebar} title="Toggle Sidebar">
          <Menu size={22} />
        </button>
        <div className={`nav-logo ${isSidebarCollapsed ? 'visible' : ''}`} onClick={() => navigate('/home')}>
          <img 
            src={logoImg} 
            alt="KnowledgeSphere Logo" 
            style={{ width: '40px', height: '40px', objectFit: 'contain', display: 'block', borderRadius: '6px', flexShrink: 0 }} 
            referrerPolicy="no-referrer"
          />
          <span>KnowledgeSphere</span>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="nav-search-bar">
        <Search size={18} className="text-light" />
        <input
          type="text"
          className="nav-search-input"
          placeholder="Search research, topics, authors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="nav-actions">
        {isAuthenticated ? (
          <div className="nav-user-thumb" onClick={() => navigate('/profile')} title="View Profile">
            {userProfile?.avatarImage ? (
              <img src={userProfile.avatarImage} alt={userProfile.name} className="nav-avatar-img" />
            ) : (
              <span>{getInitials()}</span>
            )}
          </div>
        ) : (
          <div className="nav-guest-actions">
            <button 
              type="button" 
              className="nav-auth-btn-signin"
              onClick={() => navigate('/login')}
              id="nav-btn-signin"
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
            <button 
              type="button" 
              className="nav-auth-btn-register"
              onClick={() => navigate('/register')}
              id="nav-btn-create-account"
            >
              <UserPlus size={16} />
              <span>Create Account</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
