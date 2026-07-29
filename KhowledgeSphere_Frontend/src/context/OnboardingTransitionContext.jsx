import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingTransitionOverlay from '../components/OnboardingTransitionOverlay';

const OnboardingTransitionContext = createContext({
  triggerTransition: (path) => {}
});

export function OnboardingTransitionProvider({ children }) {
  const navigate = useNavigate();
  const [isTransitionActive, setIsTransitionActive] = useState(false);
  const [targetPath, setTargetPath] = useState('/register');
  const [overlayOptions, setOverlayOptions] = useState({});

  const triggerTransition = useCallback((path = '/register', options = {}) => {
    // Check if user is already on the target path or if prefers-reduced-motion is active
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      navigate(path);
      return;
    }

    setOverlayOptions(options || {});
    setTargetPath(path);
    setIsTransitionActive(true);
  }, [navigate]);

  const handleComplete = useCallback(() => {
    setIsTransitionActive(false);
    setOverlayOptions({});
  }, []);

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  return (
    <OnboardingTransitionContext.Provider value={{ triggerTransition }}>
      {children}
      <OnboardingTransitionOverlay
        isActive={isTransitionActive}
        targetPath={targetPath}
        title={overlayOptions.title}
        message={overlayOptions.message}
        submessage={overlayOptions.submessage}
        onNavigate={handleNavigate}
        onComplete={handleComplete}
      />
    </OnboardingTransitionContext.Provider>
  );
}

export function useOnboardingTransition() {
  return useContext(OnboardingTransitionContext);
}
