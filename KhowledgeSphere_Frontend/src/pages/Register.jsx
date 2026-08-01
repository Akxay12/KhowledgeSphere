import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  UserCheck,
  Sparkles,
  Check
} from 'lucide-react';
import { signInWithGoogle } from '../lib/googleAuth';
import { useAuth } from '../context/AuthContext';
import { getStoredUserProfile } from '../lib/authStorage';
import logoImg from '../assets/images/KnowledgeSphere_logo.png';
import AmbientParticles from '../components/AmbientParticles';
import { useOnboardingTransition } from '../context/OnboardingTransitionContext';
import './Register.css';



// Pre-reserved taken usernames for availability checking simulation
const RESERVED_TAKEN_USERNAMES = [
  'admin',
  'researcher',
  'scholar',
  'knowledgesphere',
  'support',
  'official',
  'google',
  'editor',
  'moderator',
  'professor',
  'student',
  'developer'
];

export default function Register() {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const { triggerTransition } = useOnboardingTransition();


  // Form Fields State

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility Toggle (Field 4 ONLY)
  const [showPassword, setShowPassword] = useState(false);

  // Google Auto-fill / Read-only state
  const [isGoogleAutofilled, setIsGoogleAutofilled] = useState(false);
  const [googleProfileData, setGoogleProfileData] = useState(null);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);

  // Username Availability State
  const [usernameStatus, setUsernameStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken'
  const [suggestions, setSuggestions] = useState([]);

  // Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [authError, setAuthError] = useState('');

  // Touched state for inline validation feedback
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    username: false,
    password: false,
    confirmPassword: false
  });

  // On mount check if user is already logged in
  useEffect(() => {
    const existing = getStoredUserProfile();
    if (existing && existing.onboardingCompleted && existing.username) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  // Real-time username availability checker
  useEffect(() => {
    const trimmed = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!trimmed || trimmed.length === 0) {
      setUsernameStatus('idle');
      setSuggestions([]);
      return;
    }

    setUsernameStatus('checking');

    const timer = setTimeout(() => {
      if (trimmed.length < 3) {
        setUsernameStatus('taken');
        setSuggestions([`${trimmed}_ai`, `${trimmed}_scholar`, `${trimmed}_ks`]);
      } else if (RESERVED_TAKEN_USERNAMES.includes(trimmed)) {
        setUsernameStatus('taken');
        setSuggestions([
          `${trimmed}_ai`,
          `${trimmed}_research`,
          `${trimmed}_dev`,
          `${trimmed}_ks`
        ]);
      } else {
        setUsernameStatus('available');
        setSuggestions([]);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [username]);

  // Email Format Validation
  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  // Validation Checks
  const isNameValid = fullName.trim().length > 0;
  const isEmailValid = validateEmail(email.trim());
  const isUsernameValid = usernameStatus === 'available' && username.trim().length >= 3;
  const isPasswordValid = password.length >= 6;
  const isConfirmMatch = confirmPassword.length > 0 && confirmPassword === password;

  const isFormValid =
    isNameValid &&
    isEmailValid &&
    isUsernameValid &&
    isPasswordValid &&
    isConfirmMatch &&
    !isSubmitting;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Handle Username Input Change
  const handleUsernameChange = (e) => {
    const cleanValue = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanValue);
  };

  // Select suggestion chip
  const handleSelectSuggestion = (sug) => {
    setUsername(sug);
  };

  // Trigger Google OAuth Flow
  const handleGoogleSignUp = async () => {
    setAuthError('');
    setGoogleSigningIn(true);

    try {
      const googleProfile = await signInWithGoogle();

      // Automatically populate Full Name and Email Address
      setFullName(googleProfile.fullName || '');
      setEmail(googleProfile.email || '');
      setIsGoogleAutofilled(true);
      setGoogleProfileData(googleProfile);

      setTouched((prev) => ({ ...prev, fullName: true, email: true }));

      // Auto-suggest username if empty
      if (!username) {
        let defaultUser = (googleProfile.email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (defaultUser.length < 3) defaultUser = `${defaultUser}_ks`;
        setUsername(defaultUser);
      }
    } catch (err) {
      if (err.message === 'AUTHENTICATION_CANCELLED') {
        setAuthError('Google sign-in was cancelled.');
      } else {
        setAuthError('Google authentication was unavailable or blocked. Please enter your registration details manually.');
      }
    } finally {
      setGoogleSigningIn(false);
    }
  };

  // Clear Google pre-fill to allow manual edit
  const handleClearGoogleAutofill = () => {
    setIsGoogleAutofilled(false);
    setGoogleProfileData(null);
  };

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!isFormValid) {
      setTouched({
        fullName: true,
        email: true,
        username: true,
        password: true,
        confirmPassword: true
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await authRegister({
        name: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        password
      });

      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        triggerTransition('/home', {
          title: 'Welcome to KnowledgeSphere',
          message: 'Setting up your profile...',
          submessage: 'Preparing your academic workspace...'
        });
      }, 1000);
    } catch (err) {
      setIsSubmitting(false);
      setAuthError(err.response?.data?.message || err.message || 'Failed to create account. Please try again.');
    }
  };


  return (
    <div className="signup-page-container">
      {/* Ambient background particles and glow effects */}
      <AmbientParticles count={20} color="maroon" />

      {/* Brand Header */}

      <header className="signup-header-brand">
        <div className="signup-logo-box" onClick={() => navigate('/')}>
          <img
            src={logoImg}
            alt="KnowledgeSphere Logo"
            className="signup-logo-img"
            referrerPolicy="no-referrer"
          />
          <span className="signup-logo-text">KnowledgeSphere</span>
        </div>
        <h1 className="signup-main-heading">Create Your Account</h1>
        <p className="signup-main-subtitle">
          Join KnowledgeSphere to publish research, connect with scholars, and explore ideas.
        </p>
      </header>

      {/* Centered Auth Card Container */}
      <div className="signup-center-wrapper">
        <main className="signup-card">
          {/* SUCCESS MESSAGE FLOW */}
          {successMessage ? (
            <div className="success-flow-container">
              <div className="success-icon-badge">
                <CheckCircle2 size={38} />
              </div>
              <h2 className="success-flow-title">Registration Successful</h2>
              <p className="success-flow-sub">{successMessage}</p>
              <div className="success-redirect-loader">
                <Loader2 size={18} className="animate-spin" />
                <span>Redirecting to Login...</span>
              </div>
            </div>
          ) : (
            <>
              {/* GOOGLE AUTOFILL NOTIFICATION BADGE IF CONNECTED */}
              {isGoogleAutofilled && (
                <div className="google-connected-banner">
                  <div className="google-connected-left">
                    {googleProfileData?.picture ? (
                      <img
                        src={googleProfileData.picture}
                        alt="Google avatar"
                        className="google-banner-avatar"
                      />
                    ) : (
                      <UserCheck size={18} className="google-banner-icon" />
                    )}
                    <div className="google-banner-text">
                      <span className="google-banner-title">Connected via Google</span>
                      <span className="google-banner-sub">Name & Email auto-filled and locked.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="google-clear-btn"
                    onClick={handleClearGoogleAutofill}
                    title="Switch to manual input"
                  >
                    Edit Manually
                  </button>
                </div>
              )}

              {/* AUTH ERROR ALERT */}
              {authError && (
                <div className="inline-auth-error">
                  <AlertCircle size={16} />
                  <span>{authError}</span>
                </div>
              )}

              {/* SIGN UP FORM */}
              <form onSubmit={handleSubmit} className="signup-main-form" noValidate>
                {/* 1. FULL NAME */}
                <div className="form-field-group">
                  <label htmlFor="fullname-input" className="form-field-label">
                    Full Name <span className="required-star">*</span>
                    {isGoogleAutofilled && (
                      <span className="readonly-badge">Google Verified</span>
                    )}
                  </label>
                  <div className="input-relative-box">
                    <input
                      id="fullname-input"
                      type="text"
                      required
                      readOnly={isGoogleAutofilled}
                      className={`form-input-field ${
                        isGoogleAutofilled ? 'input-readonly' : ''
                      } ${
                        touched.fullName && !isNameValid ? 'input-error' : ''
                      } ${touched.fullName && isNameValid ? 'input-success' : ''}`}
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => handleBlur('fullName')}
                    />
                  </div>
                  {touched.fullName && !isNameValid && (
                    <span className="field-error-msg">Full name is required.</span>
                  )}
                </div>

                {/* 2. EMAIL ADDRESS */}
                <div className="form-field-group">
                  <label htmlFor="email-input" className="form-field-label">
                    Email Address <span className="required-star">*</span>
                    {isGoogleAutofilled && (
                      <span className="readonly-badge">Google Verified</span>
                    )}
                  </label>
                  <div className="input-relative-box">
                    <input
                      id="email-input"
                      type="email"
                      required
                      readOnly={isGoogleAutofilled}
                      className={`form-input-field ${
                        isGoogleAutofilled ? 'input-readonly' : ''
                      } ${
                        touched.email && !isEmailValid ? 'input-error' : ''
                      } ${touched.email && isEmailValid ? 'input-success' : ''}`}
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur('email')}
                    />
                  </div>
                  {touched.email && !isEmailValid && (
                    <span className="field-error-msg">
                      {email.trim().length === 0
                        ? 'Email address is required.'
                        : 'Please enter a valid email address.'}
                    </span>
                  )}
                </div>

                {/* 3. USERNAME WITH REAL-TIME AVAILABILITY */}
                <div className="form-field-group">
                  <label htmlFor="username-input" className="form-field-label">
                    <span>Username <span className="required-star">*</span></span>

                    {/* Availability Status Indicators */}
                    {usernameStatus === 'checking' && (
                      <span className="status-indicator checking">
                        <Loader2 size={13} className="animate-spin" /> Checking...
                      </span>
                    )}
                    {usernameStatus === 'available' && (
                      <span className="status-indicator available">
                        ✓ Username Available
                      </span>
                    )}
                    {usernameStatus === 'taken' && (
                      <span className="status-indicator taken">
                        ✕ Username Already Taken
                      </span>
                    )}
                  </label>

                  <div className="username-input-container">
                    <span className="username-prefix">@</span>
                    <input
                      id="username-input"
                      type="text"
                      required
                      className={`form-input-field username-field-padding ${
                        usernameStatus === 'taken' ? 'input-error' : ''
                      } ${usernameStatus === 'available' ? 'input-success' : ''}`}
                      placeholder="Choose a unique username"
                      value={username}
                      onChange={handleUsernameChange}
                      onBlur={() => handleBlur('username')}
                      maxLength={30}
                    />
                  </div>

                  {/* Inline Error or Suggestions */}
                  {usernameStatus === 'taken' && suggestions.length > 0 && (
                    <div className="username-suggestions-container">
                      <span className="suggestions-label">Try an available suggestion:</span>
                      <div className="suggestions-chips-row">
                        {suggestions.map((sug) => (
                          <button
                            type="button"
                            key={sug}
                            className="suggestion-chip-btn"
                            onClick={() => handleSelectSuggestion(sug)}
                          >
                            @{sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {touched.username && username.trim().length < 3 && usernameStatus !== 'checking' && (
                    <span className="field-error-msg">Username must be at least 3 characters.</span>
                  )}
                </div>

                {/* 4. PASSWORD (WITH SHOW/HIDE EYE TOGGLE) */}
                <div className="form-field-group">
                  <label htmlFor="password-input" className="form-field-label">
                    Password <span className="required-star">*</span>
                  </label>
                  <div className="input-relative-box">
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className={`form-input-field password-input-padding ${
                        touched.password && !isPasswordValid ? 'input-error' : ''
                      } ${touched.password && isPasswordValid ? 'input-success' : ''}`}
                      placeholder="Enter a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur('password')}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                      title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      <span className="toggle-btn-label">
                        {showPassword ? 'Hide Password' : 'Show Password'}
                      </span>
                    </button>
                  </div>
                  {touched.password && !isPasswordValid && (
                    <span className="field-error-msg">
                      Password must be at least 6 characters.
                    </span>
                  )}
                </div>

                {/* 5. CONFIRM PASSWORD (HIDDEN AT ALL TIMES, NO TOGGLE) */}
                <div className="form-field-group">
                  <label htmlFor="confirm-password-input" className="form-field-label">
                    Confirm Password <span className="required-star">*</span>
                  </label>
                  <div className="input-relative-box">
                    <input
                      id="confirm-password-input"
                      type="password"
                      required
                      className={`form-input-field ${
                        touched.confirmPassword && !isConfirmMatch ? 'input-error' : ''
                      } ${touched.confirmPassword && isConfirmMatch ? 'input-success' : ''}`}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                    />
                  </div>
                  {touched.confirmPassword && !isConfirmMatch && (
                    <span className="field-error-msg">
                      {confirmPassword.length === 0
                        ? 'Please confirm your password.'
                        : 'Passwords do not match.'}
                    </span>
                  )}
                </div>

                {/* PRIMARY ACTION BUTTON */}
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="create-account-primary-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </form>

              {/* DIVIDER */}
              <div className="signup-divider-container">
                <div className="signup-divider-line"></div>
                <span className="signup-divider-text">OR</span>
                <div className="signup-divider-line"></div>
              </div>

              {/* GOOGLE SIGN UP BUTTON */}
              <div className="google-signup-wrapper">
                <button
                  type="button"
                  disabled={googleSigningIn || isSubmitting}
                  className="google-official-btn"
                  onClick={handleGoogleSignUp}
                >
                  {googleSigningIn ? (
                    <>
                      <Loader2 size={20} className="animate-spin loading-maroon-spinner" />
                      <span>Connecting to Google...</span>
                    </>
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
              </div>

              {/* FOOTER LINK TO LOGIN */}
              <div className="signup-footer-login">
                Already have an account?{' '}
                <button
                  type="button"
                  className="signup-login-link-btn"
                  onClick={() => triggerTransition('/login')}
                >
                  Log in
                </button>
              </div>
            </>
          )}

          {/* LEGAL FOOTER */}
          <footer className="signup-legal-footer">
            By registering, you agree to KnowledgeSphere's{' '}
            <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
          </footer>
        </main>
      </div>
    </div>
  );
}
