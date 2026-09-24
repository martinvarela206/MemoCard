/**
 * @file SRSRatingBar.jsx
 * Interactive Anki-style quality rating bar for Spaced Repetition (SRS).
 *
 * Ergonomics & Cognitive Feedback Rationale:
 * - Active Recall Feedback Loop: Once the answer is revealed on the back of the card,
 *   prompting the learner for immediate metacognitive evaluation solidifies memory traces.
 * - Predicted Interval Badges: Displaying calculated SM-2 intervals directly on the buttons
 *   (e.g., '< 1 d', '6 d', '10 d') gives the learner transparency and agency over their review schedule.
 * - Keyboard Accelerator (1, 2, 3, 4): Fast numeric shortcuts eliminate mouse friction during
 *   high-volume study sessions. An active input check guarantees typing in answer boxes is never interrupted.
 */

import React, { useEffect, useCallback } from 'react';
import { SRS_RATINGS, getNextIntervalEstimates } from '../utils/srsEngine';

export default function SRSRatingBar({
  cardSRSState,
  onRate,
  disabled = false
}) {
  const estimates = getNextIntervalEstimates(cardSRSState);

  const handleRating = useCallback((rating) => {
    if (disabled || !onRate) return;
    onRate(rating);
  }, [disabled, onRate]);

  // Global numeric keypress shortcuts (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return;
      // Guard against typing inside input fields or textareas
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.key === '1') {
        e.preventDefault();
        handleRating(SRS_RATINGS.AGAIN);
      } else if (e.key === '2') {
        e.preventDefault();
        handleRating(SRS_RATINGS.HARD);
      } else if (e.key === '3') {
        e.preventDefault();
        handleRating(SRS_RATINGS.GOOD);
      } else if (e.key === '4') {
        e.preventDefault();
        handleRating(SRS_RATINGS.EASY);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, handleRating]);

  return (
    <div className="srs-rating-container" role="group" aria-label="Calificación de repaso espaciado">
      <div className="srs-rating-header">
        <span className="srs-rating-prompt">¿Cómo recordaste esta tarjeta?</span>
      </div>

      <div className="srs-rating-buttons">
        <button
          type="button"
          className="btn-srs-rating rating-again"
          onClick={() => handleRating(SRS_RATINGS.AGAIN)}
          title="Otra vez (No recordé la respuesta - Atajo: 1)"
          disabled={disabled}
        >
          <span className="srs-btn-shortcut">1</span>
          <span className="srs-btn-label">Otra vez</span>
          <span className="srs-btn-interval">{estimates[SRS_RATINGS.AGAIN]}</span>
        </button>

        <button
          type="button"
          className="btn-srs-rating rating-hard"
          onClick={() => handleRating(SRS_RATINGS.HARD)}
          title="Difícil (Recordé con esfuerzo significativo - Atajo: 2)"
          disabled={disabled}
        >
          <span className="srs-btn-shortcut">2</span>
          <span className="srs-btn-label">Difícil</span>
          <span className="srs-btn-interval">{estimates[SRS_RATINGS.HARD]}</span>
        </button>

        <button
          type="button"
          className="btn-srs-rating rating-good"
          onClick={() => handleRating(SRS_RATINGS.GOOD)}
          title="Bien (Respuesta correcta estándar - Atajo: 3)"
          disabled={disabled}
        >
          <span className="srs-btn-shortcut">3</span>
          <span className="srs-btn-label">Bien</span>
          <span className="srs-btn-interval">{estimates[SRS_RATINGS.GOOD]}</span>
        </button>

        <button
          type="button"
          className="btn-srs-rating rating-easy"
          onClick={() => handleRating(SRS_RATINGS.EASY)}
          title="Fácil (Respuesta perfecta e inmediata - Atajo: 4)"
          disabled={disabled}
        >
          <span className="srs-btn-shortcut">4</span>
          <span className="srs-btn-label">Fácil</span>
          <span className="srs-btn-interval">{estimates[SRS_RATINGS.EASY]}</span>
        </button>
      </div>
    </div>
  );
}
