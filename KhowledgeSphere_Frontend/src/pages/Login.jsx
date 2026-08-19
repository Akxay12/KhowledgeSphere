import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  X,
  CheckCircle2,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { signInWithGoogle } from '../lib/googleAuth';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/images/KnowledgeSphere_logo.png';
import AmbientParticles from '../components/AmbientParticles';
import { useOnboardingTransition } from '../context/OnboardingTransitionContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { triggerTransition } = useOnboardingTransition();

  // Form Field State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [animatingError, setAnimatingError] = useState(false);
  const [fallbackEmail, setFallbackEmail] = useState('');
  const [fallbackPassword, setFallbackPassword] = useState('');

  // Touched state for inline validation feedback
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Auth & UI States
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState(''); // 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'GOOGLE_CANCELLED' | 'NETWORK_ERROR' | 'SERVER_ERROR'

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [resetSending, setResetSending] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  // Check for expired session query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === 'true') {
      setErrorMessage('Your session has expired. Please log in again.');
      setErrorType('SESSION_EXPIRED');
    }
  }, []);


  // Inline Validation Helpers
  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const isEmailValid = validateEmail(email);
  const isPasswordValid = password.length > 0;
  const isFormValid = isEmailValid && isPasswordValid && !isSigningIn && !isGoogleSigningIn;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Handle Manual Email / Password Login Submit
  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setErrorMessage('');
    setErrorType('');
    setIsSigningIn(true);

    try {
      await login(email.trim().toLowerCase(), password);

      triggerTransition('/home', {
        title: 'Welcome Back',
        message: 'Preparing your workspace...',
        submessage: 'Loading your personalized experience...'
      });
    } catch (err) {
      setIsSigningIn(false);
      if (err.status === 403 || err.response?.status === 403) {
        setFallbackEmail(email);
        setFallbackPassword('•'.repeat(password.length));
        setAnimatingError(true);
        setErrorType('INVALID_CREDENTIALS');
        setErrorMessage('🧐 who are you 🔫🤨');
        
        // Clear fields instantly
        setEmail('');
        setPassword('');
        
        setTimeout(() => {
          setAnimatingError(false);
          setFallbackEmail('');
          setFallbackPassword('');
        }, 800);
      } else {
        setErrorType('INVALID_CREDENTIALS');
        setErrorMessage(err.message || 'Invalid Email or Password');
      }
    }
  };


  // Handle Google OAuth Sign-In Flow
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setErrorType('');
    setIsGoogleSigningIn(true);

    try {
      const googleProfile = await signInWithGoogle();

      // Check if returning user with completed profile
      if (isReturningUser(googleProfile.email) || isReturningUser(googleProfile.googleId)) {
        saveUserProfile({
          ...googleProfile,
          onboardingCompleted: true
        });

        // Trigger branded success transition
        triggerTransition('/home', {
          title: 'Welcome Back',
          message: 'Preparing your workspace...',
          submessage: 'Loading your personalized experience...'
        });
        return;
      }

      // First-time user flow: Save draft profile with prefilled Google name and email, then redirect to Signup
      saveUserProfile({
        ...googleProfile,
        onboardingCompleted: false
      });

      triggerTransition('/register');
    } catch (err) {
      if (err.message === 'AUTHENTICATION_CANCELLED') {
        setErrorType('GOOGLE_CANCELLED');
        setErrorMessage('Google sign-in was cancelled. Click "Continue with Google" to try again.');
      } else if (err.message === 'NETWORK_ERROR') {
        setErrorType('NETWORK_ERROR');
        setErrorMessage('Network error connecting to Google. Please check your internet connection.');
      } else {
        setErrorType('SERVER_ERROR');
        setErrorMessage('Google authentication failed. Please try again.');
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  // Handle Forgot Password Form Submission
  const handleSendResetEmail = (e) => {
    e.preventDefault();
    if (!validateEmail(resetEmail)) return;

    setResetSending(true);
    setTimeout(() => {
      setResetSending(false);
      setResetSubmitted(true);
    }, 700);
  };

  return (
    <div className="login-page-container">
      {/* Ambient Background Particles & Glow */}
      <AmbientParticles count={22} color="maroon" />

      <div className="login-card">
        {/* PAGE HEADER */}
        <div className="login-header">
          <div className="login-logo" onClick={() => navigate('/')}>
            <img
              src={logoImg}
              alt="KnowledgeSphere Logo"
              className="login-logo-img"
              referrerPolicy="no-referrer"
            />
            <span className="login-logo-text">KnowledgeSphere</span>
          </div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">
            Sign in to continue your knowledge journey.
          </p>
        </div>

        {/* ELEGANT ERROR BANNER */}
        {errorMessage && (
          <div className="login-error-banner" role="alert">
            {errorMessage !== '🧐 who are you 🔫🤨' && (
              <div className="error-banner-icon">
                <AlertCircle size={20} />
              </div>
            )}
            <div className="error-banner-content" style={errorMessage === '🧐 who are you 🔫🤨' ? { display: 'flex', justifyContent: 'center', width: '100%' } : {}}>
              {errorMessage === '🧐 who are you 🔫🤨' ? (
                <span className="playful-error-text" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>🧐</span>
                  <span style={{ fontSize: '1.05rem', color: '#dc2626' }}>who are you</span>
                  <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>🔫🤨</span>
                </span>
              ) : (
                <span className="error-banner-text">{errorMessage}</span>
              )}
            </div>
            <button
              type="button"
              className="error-banner-dismiss"
              onClick={() => {
                setErrorMessage('');
                setErrorType('');
              }}
              title="Dismiss notice"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleEmailPasswordSubmit} className="login-form" noValidate>
          {/* FIELD 1: Email Address */}
          <div className="form-group">
            <label htmlFor="login-email" className="login-form-label">
              Email Address <span className="req-star">*</span>
            </label>
            <div className={`input-icon-wrapper ${touched.email && !isEmailValid ? 'has-error' : ''} ${animatingError ? 'shake-inputs' : ''}`}>
              <Mail className="input-field-icon" size={18} />
              <input
                id="login-email"
                type="email"
                className="form-input-styled"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) {
                    setErrorMessage('');
                    setErrorType('');
                  }
                }}
                onBlur={() => handleBlur('email')}
                disabled={isSigningIn || isGoogleSigningIn}
                autoComplete="email"
              />
              {animatingError && fallbackEmail && (
                <div className="falling-text-overlay falling-text">
                  {fallbackEmail}
                </div>
              )}
            </div>
            {touched.email && !isEmailValid && email.length > 0 && (
              <span className="field-inline-error">Please enter a valid email address.</span>
            )}
            {touched.email && email.length === 0 && (
              <span className="field-inline-error">Email address is required.</span>
            )}
          </div>

          {/* FIELD 2: Password */}
          <div className="form-group">
            <div className="label-with-action">
              <label htmlFor="login-password" className="login-form-label">
                Password <span className="req-star">*</span>
              </label>
            </div>
            <div className={`input-icon-wrapper ${touched.password && !isPasswordValid ? 'has-error' : ''} ${animatingError ? 'shake-inputs' : ''}`}>
              <Lock className="input-field-icon" size={18} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input-styled pr-toggle"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) {
                    setErrorMessage('');
                    setErrorType('');
                  }
                }}
                onBlur={() => handleBlur('password')}
                disabled={isSigningIn || isGoogleSigningIn}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {animatingError && fallbackPassword && (
                <div className="falling-text-overlay falling-text">
                  {fallbackPassword}
                </div>
              )}
            </div>
            {touched.password && !isPasswordValid && (
              <span className="field-inline-error">Password is required.</span>
            )}

            {/* FORGOT PASSWORD LINK */}
            <div className="forgot-password-box">
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setResetEmail(email);
                  setResetSubmitted(false);
                  setShowForgotModal(true);
                }}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* PRIMARY BUTTON: Sign In */}
          <button
            type="submit"
            className="primary-login-btn"
            disabled={!isFormValid}
          >
            {isSigningIn ? (
              <div className="btn-loading-content">
                <Loader2 size={19} className="animate-spin" />
                <span>Signing you in...</span>
              </div>
            ) : (
              <div className="btn-normal-content">
                <span>Sign In</span>
                <ArrowRight size={18} />
              </div>
            )}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="login-divider-container">
          <div className="divider-line" />
          <span className="divider-text">OR</span>
          <div className="divider-line" />
        </div>

        {/* GOOGLE SIGN IN BUTTON */}
        <div className="google-login-wrapper">
          <button
            type="button"
            className="google-official-btn"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn || isGoogleSigningIn}
          >
            {isGoogleSigningIn ? (
              <div className="btn-loading-content">
                <Loader2 size={19} className="animate-spin maroon-spinner" />
                <span>Connecting to Google...</span>
              </div>
            ) : (
              <>
                <svg className="google-btn-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
          <div className="google-security-badge">
            <ShieldCheck size={15} className="security-icon" />
            <span>Encrypted • OAuth 2.0 • No password stored</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="login-footer">
          Don't have an account?{' '}
          <button
            type="button"
            className="login-link-btn"
            onClick={() => triggerTransition('/register')}
          >
            Create Account
          </button>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="forgot-modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="forgot-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="forgot-modal-close"
              onClick={() => setShowForgotModal(false)}
            >
              <X size={18} />
            </button>

            {!resetSubmitted ? (
              <>
                <div className="forgot-modal-icon-header">
                  <Mail size={24} className="forgot-icon" />
                </div>
                <h3 className="forgot-modal-title">Reset Your Password</h3>
                <p className="forgot-modal-sub">
                  Enter your KnowledgeSphere email address below and we will send you a secure link to reset your password.
                </p>

                <form onSubmit={handleSendResetEmail} className="forgot-modal-form">
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-input-styled"
                      placeholder="Enter your email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="primary-login-btn"
                    disabled={!validateEmail(resetEmail) || resetSending}
                  >
                    {resetSending ? (
                      <div className="btn-loading-content">
                        <Loader2 size={18} className="animate-spin" />
                        <span>Sending reset link...</span>
                      </div>
                    ) : (
                      <span>Send Reset Instructions</span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="forgot-success-box">
                <div className="forgot-success-icon">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="forgot-modal-title">Instructions Sent</h3>
                <p className="forgot-modal-sub">
                  We have sent password reset instructions to <strong>{resetEmail}</strong>. Please check your inbox and follow the link.
                </p>
                <button
                  type="button"
                  className="primary-login-btn"
                  onClick={() => setShowForgotModal(false)}
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
