import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from '../assets/images/KnowledgeSphere_logo.png';
import AmbientParticles from './AmbientParticles';
import './OnboardingTransitionOverlay.css';

export default function OnboardingTransitionOverlay({
  isActive,
  targetPath,
  title = 'KnowledgeSphere',
  message,
  submessage = 'Knowledge Unbound • Research & Publication',
  onComplete,
  onNavigate
}) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'enter' | 'expand' | 'exit'

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (onNavigate) onNavigate(targetPath);
      if (onComplete) onComplete();
      return;
    }

    // Phase 1: Enter / center logo animation
    setPhase('enter');

    // Phase 2: At 650ms, start expand transition & trigger route navigation behind
    const expandTimer = setTimeout(() => {
      setPhase('expand');
      if (onNavigate) {
        onNavigate(targetPath);
      }
    }, 650);

    // Phase 3: At 1150ms, complete overlay
    const completeTimer = setTimeout(() => {
      setPhase('exit');
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 150);
    }, 1150);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(completeTimer);
    };
  }, [isActive, targetPath]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="onboarding-overlay-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'exit' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        aria-live="polite"
      >
        {/* Background Particles & Ambient Glow */}
        <AmbientParticles count={26} color="white" />

        {/* Central Stage */}
        <div className="onboarding-overlay-stage">
          {/* Logo Circle + Rotating Ring Assembly */}
          <motion.div
            className="logo-circle-wrapper"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{
              scale: phase === 'expand' ? 18 : 1,
              opacity: phase === 'expand' ? 0 : 1
            }}
            transition={{
              scale: {
                duration: phase === 'expand' ? 0.55 : 0.6,
                ease: phase === 'expand' ? [0.4, 0, 0.2, 1] : [0.16, 1, 0.3, 1]
              },
              opacity: {
                duration: phase === 'expand' ? 0.45 : 0.5,
                ease: 'easeInOut'
              }
            }}
          >
            {/* Outer Orbiting Ring */}
            <motion.div
              className="glowing-orbit-ring"
              animate={{ rotate: 360 }}
              transition={{ duration: 2.8, ease: 'linear', repeat: Infinity }}
            >
              <div className="orbit-ring-circle" />
              <div className="orbit-ring-glow" />
            </motion.div>

            {/* Inner Circular Logo Frame */}
            <div className="inner-logo-circle">
              <img
                src={logoImg}
                alt="KnowledgeSphere Logo"
                className="overlay-logo-img"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Brand Name & Subtitle Fade-In */}
          <motion.div
            className="overlay-brand-text-box"
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: phase === 'expand' ? 0 : 1,
              y: phase === 'expand' ? 15 : 0,
              scale: phase === 'expand' ? 1.15 : 1
            }}
            transition={{
              duration: phase === 'expand' ? 0.35 : 0.45,
              delay: phase === 'expand' ? 0 : 0.2,
              ease: 'easeOut'
            }}
          >
            <h2 className="overlay-brand-name">{title}</h2>
            {message && <p className="overlay-brand-message">{message}</p>}
            <p className="overlay-brand-subtitle">{submessage}</p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

