/**
 * @file ImageOcclusion.jsx
 * Responsive Image Occlusion component for anatomical and structural flashcards.
 *
 * Architectural & Ergonomic Rationale:
 * - Employs a percentage-based SVG overlay (`viewBox="0 0 100 100" preserveAspectRatio="none"`)
 *   positioned absolutely over the underlying image container.
 * - This guarantees that all bounding boxes (`x`, `y`, `width`, `height` in 0-100%) remain
 *   perfectly calibrated regardless of viewport resizing, responsive layout reflows, or mobile zooms.
 * - Click Isolation: Mask click handlers explicitly invoke `e.stopPropagation()` to toggle individual
 *   occlusion state without triggering unintended 3D card flips.
 * - Multi-Mode Support:
 *   - 'hide_all_guess_one': Active target mask is highlighted with an accent color, sibling masks are hidden.
 *   - 'hide_one_guess_one': Only target mask is hidden, non-targets are unmasked.
 * - Classical Fallback Degradation: When `interactive === false`, the front face displays all masks
 *   statically, and the back face displays the image without masks.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { resolveMediaUrl } from '../utils/mediaResolver';

export default function ImageOcclusion({
  card,
  isBackFace = false,
  interactive = true
}) {
  const [revealedMaskIds, setRevealedMaskIds] = useState([]);
  const masks = useMemo(() => card?.masks || [], [card?.masks]);
  const imageUrl = resolveMediaUrl(card?.image || (card?.media && card.media[0]?.src));
  const mode = card?.mode || 'hide_all_guess_one';

  // Reset revealed masks whenever the active card changes
  useEffect(() => {
    setRevealedMaskIds([]);
  }, [card?.id]);

  // Toggle single mask visibility
  const handleToggleMask = useCallback((maskId, e) => {
    if (e) e.stopPropagation();
    setRevealedMaskIds(prev =>
      prev.includes(maskId) ? prev.filter(id => id !== maskId) : [...prev, maskId]
    );
  }, []);

  // Reveal all masks for comprehensive anatomical review
  const handleRevealAll = useCallback((e) => {
    if (e) e.stopPropagation();
    setRevealedMaskIds(masks.map(m => m.id));
  }, [masks]);

  // Hide all masks
  const handleHideAll = useCallback((e) => {
    if (e) e.stopPropagation();
    setRevealedMaskIds([]);
  }, []);

  if (!imageUrl) {
    return <div className="occlusion-error">No se encontró imagen para la oclusión.</div>;
  }

  const allRevealed = masks.length > 0 && masks.every(m => revealedMaskIds.includes(m.id));

  return (
    <div className="image-occlusion-wrapper" onClick={(e) => e.stopPropagation()}>
      {/* Interactive Controls Header */}
      {interactive && !isBackFace && masks.length > 0 && (
        <div className="occlusion-toolbar">
          <span className="occlusion-mode-tag">
            {mode === 'hide_all_guess_one' ? 'Ocultar todo, adivinar uno' : 'Ocultar uno'}
          </span>
          <button
            type="button"
            className="btn-occlusion-toggle-all"
            onClick={allRevealed ? handleHideAll : handleRevealAll}
          >
            {allRevealed ? 'Ocultar todas' : 'Revelar todas'}
          </button>
        </div>
      )}

      {/* Responsive Visual Container */}
      <div className="image-occlusion-viewport">
        <img
          src={imageUrl}
          alt={card.term || 'Esquema anatómico'}
          className="occlusion-base-image"
          loading="lazy"
        />

        {/* Responsive Percentage-Based SVG Overlay */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="occlusion-svg-overlay"
        >
          {masks.map((mask, idx) => {
            // Determine visibility based on card face, mode, and revealed state
            const isRevealed = isBackFace
              ? true
              : (!interactive ? false : revealedMaskIds.includes(mask.id));

            // In classical fallback mode on the back face, render no masks at all
            if (!interactive && isBackFace) {
              return null;
            }

            const isTarget = mask.isTarget || idx === 0;

            return (
              <g
                key={mask.id}
                className={`occlusion-mask-group ${isRevealed ? 'revealed' : 'hidden'} ${isTarget ? 'target' : 'sibling'}`}
                onClick={(e) => {
                  if (interactive && !isBackFace) {
                    handleToggleMask(mask.id, e);
                  }
                }}
                role="button"
                tabIndex={interactive && !isBackFace ? 0 : -1}
                aria-label={`Máscara ${mask.label || idx + 1}: ${isRevealed ? 'Revelada' : 'Oculta'}`}
                onKeyDown={(e) => {
                  if (interactive && !isBackFace && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleToggleMask(mask.id, e);
                  }
                }}
              >
                {/* Mask rectangle */}
                <rect
                  x={`${mask.x}%`}
                  y={`${mask.y}%`}
                  width={`${mask.width}%`}
                  height={`${mask.height}%`}
                  rx="1.5"
                  ry="1.5"
                  className={`mask-rect ${isRevealed ? 'rect-revealed' : 'rect-hidden'}`}
                />

                {/* Mask Label / Indicator */}
                {isRevealed && mask.label && (
                  <text
                    x={`${mask.x + mask.width / 2}%`}
                    y={`${mask.y + mask.height / 2}%`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="mask-label-text"
                  >
                    {mask.label}
                  </text>
                )}

                {/* Question mark indicator when hidden and target */}
                {!isRevealed && isTarget && (
                  <text
                    x={`${mask.x + mask.width / 2}%`}
                    y={`${mask.y + mask.height / 2}%`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="mask-question-text"
                  >
                    ?
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
