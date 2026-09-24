/**
 * @file CardZoomControls.jsx
 * Compact vertical toolbar for adjusting card content scaling (text & math).
 *
 * Ergonomics & Cognitive Accessibility Rationale:
 * - Content Adaptation: Long definition slides with multi-line KaTeX formulas
 *   often exceed available vertical viewport height in mobile landscape.
 * - Icon-Only Ergonomics: 3 SVG icons (Zoom In, 1:1 Reset, Zoom Out) give immediate
 *   tactile control without visual noise or textual distraction.
 * - Event Isolation: Uses stopPropagation to prevent accidental card flipping.
 */

import React from 'react';

export default function CardZoomControls({
  zoomLevel = 1,
  onZoomIn,
  onZoomOut,
  onZoomReset
}) {
  return (
    <aside 
      className="card-zoom-controls" 
      aria-label="Controles de tamaño de texto de tarjeta"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Lupa con + (Zoom In) */}
      <button
        type="button"
        className="btn-zoom-action zoom-in"
        onClick={onZoomIn}
        disabled={zoomLevel >= 1.5}
        title="Aumentar tamaño de texto (Zoom In)"
        aria-label="Aumentar tamaño de texto"
      >
        <svg 
          viewBox="0 0 24 24" 
          width="20" 
          height="20" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.5" y1="15.5" x2="21" y2="21" />
          <line x1="10.5" y1="7.5" x2="10.5" y2="13.5" />
          <line x1="7.5" y1="10.5" x2="13.5" y2="10.5" />
        </svg>
      </button>

      {/* 2. Lupa 1:1 (Reset) */}
      <button
        type="button"
        className={`btn-zoom-action zoom-reset ${zoomLevel === 1 ? 'active' : ''}`}
        onClick={onZoomReset}
        title="Restablecer tamaño normal (1:1)"
        aria-label="Restablecer tamaño normal"
      >
        <svg 
          viewBox="0 0 24 24" 
          width="20" 
          height="20" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="7" />
          <line x1="15.5" y1="15.5" x2="21" y2="21" />
          <text 
            x="10" 
            y="13" 
            fontSize="7" 
            fontFamily="sans-serif" 
            fontWeight="bold" 
            textAnchor="middle" 
            fill="currentColor" 
            stroke="none"
          >
            1:1
          </text>
        </svg>
      </button>

      {/* 3. Lupa con - (Zoom Out) */}
      <button
        type="button"
        className="btn-zoom-action zoom-out"
        onClick={onZoomOut}
        disabled={zoomLevel <= 0.7}
        title="Reducir tamaño de texto (Zoom Out)"
        aria-label="Reducir tamaño de texto"
      >
        <svg 
          viewBox="0 0 24 24" 
          width="20" 
          height="20" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.5" y1="15.5" x2="21" y2="21" />
          <line x1="7.5" y1="10.5" x2="13.5" y2="10.5" />
        </svg>
      </button>
    </aside>
  );
}
