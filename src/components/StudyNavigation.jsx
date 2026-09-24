import React, { useEffect } from 'react';

export default function StudyNavigation({
  onPrevTheme,
  onPrevCard,
  onNextCard,
  onNextTheme,
  onRandomTheme,
  canPrevTheme,
  canPrevCard,
  canNextCard,
  canNextTheme
}) {
  // Global keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is focusing an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();

      // Theme Navigation (Shift + A or Shift + Left / Right or Shift + D)
      if (e.shiftKey && (key === 'a' || e.key === 'ArrowLeft' || e.key === 'Left')) {
        e.preventDefault();
        if (canPrevTheme) onPrevTheme();
      } else if (e.shiftKey && (key === 'd' || e.key === 'ArrowRight' || e.key === 'Right')) {
        e.preventDefault();
        if (canNextTheme) onNextTheme();
      } 
      // Card Navigation (A / Left Arrow, D / Right Arrow)
      else if (!e.shiftKey && (key === 'a' || e.key === 'ArrowLeft' || e.key === 'Left')) {
        e.preventDefault();
        if (canPrevCard) onPrevCard();
      } else if (!e.shiftKey && (key === 'd' || e.key === 'ArrowRight' || e.key === 'Right')) {
        e.preventDefault();
        if (canNextCard) onNextCard();
      } else if (key === 'r') {
        e.preventDefault();
        onRandomTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onPrevTheme, 
    onPrevCard, 
    onNextCard, 
    onNextTheme, 
    onRandomTheme, 
    canPrevTheme, 
    canPrevCard, 
    canNextCard, 
    canNextTheme
  ]);

  return (
    <nav className="study-navigation" aria-label="Navegación de tarjetas y temas">
      <div className="nav-buttons-cluster">
        {/* 1. Tema Anterior */}
        <button
          type="button"
          className="study-nav-btn theme-nav-btn"
          onClick={onPrevTheme}
          disabled={!canPrevTheme}
          title="Tema Anterior (Shift + A o Shift + ←)"
          aria-label="Tema Anterior"
        >
          <span className="btn-icon">⏮️</span>
        </button>

        {/* 2. Card Anterior */}
        <button
          type="button"
          className="study-nav-btn card-nav-btn"
          onClick={onPrevCard}
          disabled={!canPrevCard}
          title="Tarjeta Anterior (Tecla A o ←)"
          aria-label="Tarjeta Anterior"
        >
          <span className="btn-icon">◀️</span>
        </button>

        {/* 3. Card Siguiente */}
        <button
          type="button"
          className="study-nav-btn card-nav-btn primary"
          onClick={onNextCard}
          disabled={!canNextCard}
          title="Tarjeta Siguiente (Tecla D o →)"
          aria-label="Tarjeta Siguiente"
        >
          <span className="btn-icon">▶️</span>
        </button>

        {/* 4. Tema Siguiente */}
        <button
          type="button"
          className="study-nav-btn theme-nav-btn"
          onClick={onNextTheme}
          disabled={!canNextTheme}
          title="Tema Siguiente (Shift + D o Shift + →)"
          aria-label="Tema Siguiente"
        >
          <span className="btn-icon">⏭️</span>
        </button>

        {/* 5. Tema Aleatorio */}
        <button
          type="button"
          className="study-nav-btn random-theme-btn"
          onClick={onRandomTheme}
          title="Tema Aleatorio (Tecla R)"
          aria-label="Tema Aleatorio"
        >
          <span className="btn-icon">🔀</span>
        </button>
      </div>
    </nav>
  );
}
