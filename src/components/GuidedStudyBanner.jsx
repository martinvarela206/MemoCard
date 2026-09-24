/**
 * @file GuidedStudyBanner.jsx
 * Guided Sequential Learning Mode banner and progress indicator.
 *
 * Pedagogical & Ergonomic Rationale:
 * - Scaffolding Learning Theory: Memorization requires foundational mastery of prerequisite concepts
 *   before advancing to complex synthesis. Guided Learning enforces structured, topic-by-topic
 *   linear progression through the syllabus.
 * - Conceptual Checkpoints: Displays local theme progress (e.g., "Tarjeta 3 de 12 en este tema")
 *   alongside global deck progress. When reaching the final card of a topic, it displays a completion
 *   badge to trigger positive reinforcement.
 */

import React from 'react';

export default function GuidedStudyBanner({
  themeName,
  themeIndex,
  totalThemes,
  cardIndexInTheme,
  totalCardsInTheme,
  onExitGuided,
  onNextTheme,
  canNextTheme
}) {
  const isThemeFinished = cardIndexInTheme === totalCardsInTheme;
  const themePercent = totalCardsInTheme > 0 ? Math.round((cardIndexInTheme / totalCardsInTheme) * 100) : 0;

  return (
    <div className="guided-learning-banner" role="status" aria-live="polite">
      <div className="guided-banner-left">
        <span className="guided-badge">🎓 Aprendizaje Guiado</span>
        <span className="guided-theme-info">
          Tema {themeIndex + 1}/{totalThemes}: <strong>{themeName}</strong>
        </span>
      </div>

      <div className="guided-banner-center">
        <div className="guided-mini-progress-bar">
          <div 
            className="guided-mini-progress-fill" 
            style={{ width: `${themePercent}%` }}
          />
        </div>
        <span className="guided-counter">
          {cardIndexInTheme} de {totalCardsInTheme} ({themePercent}%)
        </span>
      </div>

      <div className="guided-banner-right">
        {isThemeFinished ? (
          <div className="guided-finished-actions">
            <span className="theme-checkpoint-pill">
              🏆 ¡Tema completado!
            </span>
            {canNextTheme && onNextTheme && (
              <button 
                type="button" 
                className="btn-next-theme-guided" 
                onClick={onNextTheme}
                title="Avanzar al siguiente tema en la secuencia de aprendizaje"
              >
                Siguiente Tema →
              </button>
            )}
          </div>
        ) : (
          <button 
            type="button"
            className="btn-exit-guided"
            onClick={onExitGuided}
            title="Salir a Modo Exploración Libre"
          >
            Modo Libre
          </button>
        )}
      </div>
    </div>
  );
}
