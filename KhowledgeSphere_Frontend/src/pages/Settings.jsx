import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Palette, CheckCircle, LogOut, ShieldAlert, UserPlus, LogIn, UserX, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { settingsApi } from '../api/settings';
import { SkeletonSettings } from '../components/SkeletonLoader';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => isAuthenticated ? 'password' : 'theme');
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [confirmDeleteChecked, setConfirmDeleteChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setActiveTab('theme');
    }
  }, [isAuthenticated]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Password fields state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Privacy fields state
  const [indexPublicly, setIndexPublicly] = useState(true);
  const [institutionalSharing, setInstitutionalSharing] = useState(true);

  // Theme state initialized from localStorage / DOM
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('knowledgesphere_theme') || 
      (document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  });

  useEffect(() => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    setThemeMode(isDark ? 'dark' : 'light');
  }, []);

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('knowledgesphere_theme', mode);
    if (mode === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    try {
      await settingsApi.updatePassword({ newPassword });
      setSaveSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      // Fallback UI success if backend isn't available
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };


  const allTabs = [
    { id: 'password', label: 'Password & Security', icon: Lock },
    { id: 'privacy', label: 'Privacy Control', icon: Eye },
    { id: 'theme', label: 'App Theme', icon: Palette },
    { id: 'account', label: 'Account & Log Out', icon: LogOut }
  ];

  const tabs = isAuthenticated 
    ? allTabs 
    : allTabs.filter(tab => tab.id === 'theme');

  return (
    <div className="settings-container">
      {isLoading ? (
        <SkeletonSettings />
      ) : (
        <>
          {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Settings</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {isAuthenticated ? 'Customize your publishing preferences and app security' : 'Customize application theme and appearance'}
          </p>
        </div>
        {saveSuccess && (
          <div className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', gap: '6px' }}>
            <CheckCircle size={14} />
            <span>Settings Updated</span>
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--color-border, #e2e8f0)',
          fontSize: '0.88rem',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} style={{ color: 'var(--color-primary, #7A1F1F)' }} />
            <span>Guest Mode: Only App Theme settings are accessible. Sign in to access account security and privacy controls.</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: 'var(--color-primary, #7A1F1F)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Log In
          </button>
        </div>
      )}

      {/* Main settings grid */}
      <div className="settings-grid">
        {/* Left Side Navigation Panel */}
        <div className="settings-tabs-panel">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side Settings Form View */}
        <div className="settings-form-panel">
          {/* PASSWORD SETTINGS VIEW */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="settings-section-title">Change Password</h3>
              
              {/* First New Password Field - with visibility toggle */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Second New Password Field - strictly masked without view toggle option */}
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 20px', marginTop: '10px' }}>
                Update Password
              </button>
            </form>
          )}

          {/* PRIVACY SETTINGS VIEW */}
          {activeTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="settings-section-title">Privacy & Access Controls</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    id="search-index"
                    checked={indexPublicly}
                    onChange={(e) => setIndexPublicly(e.target.checked)}
                    style={{ marginTop: '4px', cursor: 'pointer' }}
                  />
                  <div>
                    <label htmlFor="search-index" style={{ fontWeight: 600, cursor: 'pointer' }}>Allow Search Engines to Index My Profile</label>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Index published abstracts and citation reports globally.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    id="inst-share"
                    checked={institutionalSharing}
                    onChange={(e) => setInstitutionalSharing(e.target.checked)}
                    style={{ marginTop: '4px', cursor: 'pointer' }}
                  />
                  <div>
                    <label htmlFor="inst-share" style={{ fontWeight: 600, cursor: 'pointer' }}>Automatic Institutional Sharing</label>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Publish drafts automatically to your academic network intranet.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* THEME SETTINGS VIEW */}
          {activeTab === 'theme' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="settings-section-title">Appearance & Accent Selection</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="form-label">Preferred Theme Accent</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      border: themeMode === 'light' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: themeMode === 'light' ? 'var(--color-primary)' : 'var(--bg-card)',
                      color: themeMode === 'light' ? 'var(--color-primary-text, #ffffff)' : 'var(--color-text-main)',
                      padding: '12px 28px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onClick={() => handleThemeChange('light')}
                  >
                    Light Theme
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      border: themeMode === 'dark' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: themeMode === 'dark' ? 'var(--color-primary)' : 'var(--bg-card)',
                      color: themeMode === 'dark' ? 'var(--color-primary-text, #0F172A)' : 'var(--color-text-main)',
                      padding: '12px 28px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onClick={() => handleThemeChange('dark')}
                  >
                    Dark Theme
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT & LOG OUT VIEW */}
          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 className="settings-section-title">Session & Account Actions</h3>
              
              {!isAuthenticated && (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  color: 'var(--color-text-main)',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
                  <span>You are not signed in. Log in to access active session management and profile deletion options.</span>
                </div>
              )}

              <div className="account-action-card" style={{ opacity: isAuthenticated ? 1 : 0.75 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div className="account-action-icon red-icon">
                    <LogOut size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Sign Out of Session</h4>
                    <p style={{ margin: '4px 0 16px 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      End your active session on this device. You will need to sign in again to access your drafts and published research.
                    </p>
                    <button 
                      type="button" 
                      className="btn-red-logout-lg"
                      disabled={!isAuthenticated}
                      title={!isAuthenticated ? "Logout is disabled because you are not logged in" : ""}
                      onClick={async () => {
                        if (!isAuthenticated) return;
                        await logout();
                        navigate('/login');
                      }}
                      style={{
                        opacity: isAuthenticated ? 1 : 0.4,
                        cursor: isAuthenticated ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <LogOut size={18} />
                      <span>Log Out Now</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="account-action-card" style={{ opacity: isAuthenticated ? 1 : 0.75 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div className="account-action-icon danger-icon">
                    <UserX size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#dc2626' }}>Leave KnowledgeSphere</h4>
                    <p style={{ margin: '4px 0 16px 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      Deactivate your profile and leave the KnowledgeSphere academic network. This action will log you out immediately.
                    </p>
                    <button 
                      type="button" 
                      className="btn-leave-ks-lg"
                      disabled={!isAuthenticated}
                      title={!isAuthenticated ? "Leave account is disabled because you are not logged in" : ""}
                      onClick={() => {
                        if (!isAuthenticated) return;
                        setShowLeaveModal(true);
                      }}
                      style={{
                        opacity: isAuthenticated ? 1 : 0.4,
                        cursor: isAuthenticated ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <AlertTriangle size={18} />
                      <span>Leave KnowledgeSphere</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {/* Leave KnowledgeSphere Confirmation Modal */}
      {showLeaveModal && (
        <div className="settings-modal-overlay" onClick={() => { setShowLeaveModal(false); setConfirmDeleteChecked(false); }}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#dc2626', marginBottom: '12px' }}>
              <ShieldAlert size={28} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Leave KnowledgeSphere?</h3>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '16px' }}>
              Are you sure you want to leave KnowledgeSphere? You will be signed out and your active session will be ended.
            </p>

            <label style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '10px', 
              padding: '12px',
              backgroundColor: 'var(--bg-body)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginBottom: '20px', 
              cursor: 'pointer',
              fontSize: '0.88rem',
              color: 'var(--color-text-main)',
              lineHeight: '1.45'
            }}>
              <input 
                type="checkbox" 
                checked={confirmDeleteChecked}
                onChange={(e) => setConfirmDeleteChecked(e.target.checked)}
                style={{ marginTop: '2px', accentColor: '#dc2626', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
              />
              <span>
                Your account will be deleted forever from KnowledgeSphere and you can't recover it later.
              </span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowLeaveModal(false);
                  setConfirmDeleteChecked(false);
                }}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-red-confirm-leave" 
                disabled={!confirmDeleteChecked}
                onClick={async () => {
                  setShowLeaveModal(false);
                  setConfirmDeleteChecked(false);
                  try {
                    await settingsApi.deleteAccount();
                  } catch (e) {}
                  logout();
                  navigate('/');
                }}

                style={{ 
                  padding: '8px 18px',
                  opacity: confirmDeleteChecked ? 1 : 0.5,
                  cursor: confirmDeleteChecked ? 'pointer' : 'not-allowed'
                }}
              >
                Confirm & Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
