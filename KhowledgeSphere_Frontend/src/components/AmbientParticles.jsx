import React from 'react';
import './AmbientParticles.css';

export default function AmbientParticles({ count = 18, color = 'maroon' }) {
  // Generate deterministic-looking positions and animation delays
  const particles = Array.from({ length: count }, (_, i) => {
    const size = 3 + (i % 5) * 2; // 3px to 11px
    const left = (i * 17 + 7) % 100; // spread evenly 0-100%
    const top = (i * 23 + 13) % 100;
    const duration = 12 + (i % 6) * 4; // 12s to 32s
    const delay = -(i % 7) * 2; // offset start
    const opacity = 0.15 + (i % 4) * 0.12;

    return {
      id: i,
      size,
      left: `${left}%`,
      top: `${top}%`,
      duration: `${duration}s`,
      delay: `${delay}s`,
      opacity
    };
  });

  return (
    <div className="ambient-particles-container" aria-hidden="true">
      {/* Background Soft Glow Orbs */}
      <div className={`ambient-glow-orb orb-primary ${color}`} />
      <div className={`ambient-glow-orb orb-secondary ${color}`} />
      <div className="ambient-glow-orb orb-accent" />

      {/* Floating Translucent Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className={`ambient-particle ${color}`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: p.left,
            top: p.top,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay
          }}
        />
      ))}
    </div>
  );
}
