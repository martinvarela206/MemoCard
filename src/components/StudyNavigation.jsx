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

      if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'Left')) {
        e.preventDefault();
        if (canPrevTheme) onPrevTheme();
      } else if (e.shiftKey && (e.key === 'ArrowRight' || e.key === 'Right')) {
        e.preventDefault();
        if (canNextTheme) onNextTheme();
      } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        e.preventDefault();
        if (canPrevCard) onPrevCard();
      } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        e.preventDefault();
        if (canNextCard) onNextCard();
      } else if (e.key === 'r' || e.key === 'R') {
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
          className="study-nav-btn theme-nav-btn"
          onClick={onPrevTheme}
          disabled={!canPrevTheme}
          title="Saltar a la primera tarjeta del tema anterior (Shift + Flecha Izq)"
        >
          <span className="btn-icon">⏮️</span>
          <span className="btn-text">Tema Anterior</span>
        </button>

        {/* 2. Card Anterior */}
        <button
          className="study-nav-btn card-nav-btn"
          onClick={onPrevCard}
          disabled={!canPrevCard}
          title="Tarjeta anterior (Flecha Izquierda)"
        >
          <span className="btn-icon">◀️</span>
          <span className="btn-text">Anterior</span>
        </button>

        {/* 3. Card Siguiente */}
        <button
          className="study-nav-btn card-nav-btn primary"
          onClick={onNextCard}
          disabled={!canNextCard}
          title="Tarjeta siguiente (Flecha Derecha)"
        >
          <span className="btn-text">Siguiente</span>
          <span className="btn-icon">▶️</span>
        </button>

        {/* 4. Tema Siguiente */}
        <button
          className="study-nav-btn theme-nav-btn"
          onClick={onNextTheme}
          disabled={!canNextTheme}
          title="Saltar a la primera tarjeta del tema siguiente (Shift + Flecha Der)"
        >
          <span className="btn-text">Tema Siguiente</span>
          <span className="btn-icon">⏭️</span>
        </button>

        {/* 5. Tema Aleatorio */}
        <button
          className="study-nav-btn random-theme-btn"
          onClick={onRandomTheme}
          title="Saltar a un tema aleatorio (Tecla R)"
        >
          <span className="btn-icon">🔀</span>
          <span className="btn-text">Tema Aleatorio</span>
        </button>
      </div>
    </nav>
  );
}
