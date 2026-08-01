import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useOnboardingTransition } from '../context/OnboardingTransitionContext';
import './LandingPage.css';
import brainImage from '../assets/images/brainimage.png';
import logoImg from '../assets/images/KnowledgeSphere_logo.png';

export default function LandingPage() {
  const navigate = useNavigate();
  const { triggerTransition } = useOnboardingTransition();

  return (
    <div className="landing-container">
      {/* Minimal Header */}
      <header className="landing-nav">
        <div className="landing-nav-logo" onClick={() => navigate('/')}>
          <img 
            src={logoImg} 
            alt="KnowledgeSphere Logo" 
            style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '6px' }} 
            referrerPolicy="no-referrer"
          />
          <span>KnowledgeSphere</span>
        </div>
        <div className="landing-nav-actions">
          <button
            type="button"
            className="nav-link-btn"
            onClick={() => triggerTransition('/login')}
          >
            Login
          </button>
          <button
            type="button"
            className="nav-primary-btn"
            onClick={() => triggerTransition('/register')}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Hero Grid */}
      <main className="hero-section">
        {/* Left Content Column */}
        <div className="hero-left">
          <h1 className="hero-title">
            Share What You Know.<br />
            Discover What You Don't.
          </h1>
          <p className="hero-description">
            A platform to write blogs, publish research, save your work, and connect with curious minds around the world.
          </p>
          <div className="hero-cta-group">
            <button
              type="button"
              className="btn-pill-primary"
              onClick={() => navigate('/home')}
              id="btn-hero-start-reading"
            >
              <span>Start Reading</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Right Illustration Column */}
        <div className="hero-right">
          <div className="brain-image-wrapper">
            <img src={brainImage} alt="KnowledgeSphere Brain" className="brain-image" referrerPolicy="no-referrer" />
          </div>
        </div>
      </main>
    </div>
  );
}


