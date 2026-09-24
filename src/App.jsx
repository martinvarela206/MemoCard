import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getSubjectById } from './data/subjects';
import { normalizeAndExpandCards } from './types/cardTypes';
import SubjectSelector from './components/SubjectSelector';
import FlashCard from './components/FlashCard';
import StudyNavigation from './components/StudyNavigation';
import StudyDrawer from './components/StudyDrawer';
import './App.css';

export default function App() {
  // Current subject selection (persisted)
  const [selectedSubjectId, setSelectedSubjectId] = useState(() => {
    return localStorage.getItem('memocard_selected_subject') || null;
  });

  // Visual Theme (dark vs. high-contrast)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('memocard_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('memocard_theme', theme);
  }, [theme]);

  // Global interactive mode flag (persisted, defaults to true)
  const [interactiveMode, setInteractiveMode] = useState(() => {
    const saved = localStorage.getItem('memocard_interactive_mode');
    return saved !== null ? saved === 'true' : true;
  });

  // Persist interactive mode state
  useEffect(() => {
    localStorage.setItem('memocard_interactive_mode', String(interactiveMode));
  }, [interactiveMode]);

  const subject = useMemo(() => {
    return selectedSubjectId ? getSubjectById(selectedSubjectId) : null;
  }, [selectedSubjectId]);

  // Persist selected subject
  useEffect(() => {
    if (selectedSubjectId) {
      localStorage.setItem('memocard_selected_subject', selectedSubjectId);
    } else {
      localStorage.removeItem('memocard_selected_subject');
    }
  }, [selectedSubjectId]);

  const cards = useMemo(() => {
    return normalizeAndExpandCards(subject?.data?.cards || []);
  }, [subject]);

  // Dynamic themes list with start index for sequential jumping
  const themesList = useMemo(() => {
    if (!subject?.data?.slides) return [];
    const themesMap = {};
    
    subject.data.slides.forEach((slide) => {
      const themeName = slide.theme || 'General';
      if (!themesMap[themeName]) {
        themesMap[themeName] = {
          name: themeName,
          cardsCount: 0,
          firstCardIndex: -1
        };
      }
      themesMap[themeName].cardsCount += 1;
    });

    // Find the first card index for each theme
    Object.keys(themesMap).forEach((themeName) => {
      const firstIdx = cards.findIndex(c => (c.theme || 'General') === themeName);
      themesMap[themeName].firstCardIndex = firstIdx >= 0 ? firstIdx : 0;
    });

    return Object.values(themesMap);
  }, [subject, cards]);

  // Card index within current subject (persisted per subject)
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Initialize or restore card index when subject changes
  useEffect(() => {
    if (selectedSubjectId && cards.length > 0) {
      const savedIndexStr = localStorage.getItem(`memocard_card_idx_${selectedSubjectId}`);
      if (savedIndexStr !== null) {
        const savedIndex = parseInt(savedIndexStr, 10);
        if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < cards.length) {
          setCurrentCardIndex(savedIndex);
          return;
        }
      }
      setCurrentCardIndex(0);
    }
  }, [selectedSubjectId, cards.length]);

  // Persist current card index
  useEffect(() => {
    if (selectedSubjectId) {
      localStorage.setItem(`memocard_card_idx_${selectedSubjectId}`, String(currentCardIndex));
    }
  }, [selectedSubjectId, currentCardIndex]);

  // Card flip state (always reset to false when card changes)
  const [isFlipped, setIsFlipped] = useState(false);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const currentCard = cards[currentCardIndex] || null;
  const currentThemeName = currentCard?.theme || 'General';
  const currentThemeIndex = themesList.findIndex(t => t.name === currentThemeName);

  // Navigation handlers
  const handleSelectCard = useCallback((index) => {
    if (index >= 0 && index < cards.length) {
      setCurrentCardIndex(index);
      setIsFlipped(false);
    }
  }, [cards.length]);

  const handlePrevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      handleSelectCard(currentCardIndex - 1);
    }
  }, [currentCardIndex, handleSelectCard]);

  const handleNextCard = useCallback(() => {
    if (currentCardIndex < cards.length - 1) {
      handleSelectCard(currentCardIndex + 1);
    }
  }, [currentCardIndex, cards.length, handleSelectCard]);

  const handlePrevTheme = useCallback(() => {
    if (currentThemeIndex > 0) {
      const prevTheme = themesList[currentThemeIndex - 1];
      if (prevTheme && prevTheme.firstCardIndex >= 0) {
        handleSelectCard(prevTheme.firstCardIndex);
      }
    }
  }, [currentThemeIndex, themesList, handleSelectCard]);

  const handleNextTheme = useCallback(() => {
    if (currentThemeIndex >= 0 && currentThemeIndex < themesList.length - 1) {
      const nextTheme = themesList[currentThemeIndex + 1];
      if (nextTheme && nextTheme.firstCardIndex >= 0) {
        handleSelectCard(nextTheme.firstCardIndex);
      }
    }
  }, [currentThemeIndex, themesList, handleSelectCard]);

  const handleRandomTheme = useCallback(() => {
    if (themesList.length <= 1) return;
    const otherThemes = themesList.filter((_, idx) => idx !== currentThemeIndex);
    const randomIndex = Math.floor(Math.random() * otherThemes.length);
    const randomTheme = otherThemes[randomIndex];
    if (randomTheme && randomTheme.firstCardIndex >= 0) {
      handleSelectCard(randomTheme.firstCardIndex);
    }
  }, [themesList, currentThemeIndex, handleSelectCard]);

  // If no subject selected, render SubjectSelector
  if (!selectedSubjectId || !subject) {
    return (
      <div className="app-layout">
        <SubjectSelector onSelectSubject={(id) => setSelectedSubjectId(id)} />
      </div>
    );
  }

  const progressPercent = cards.length > 0 ? Math.round(((currentCardIndex + 1) / cards.length) * 100) : 0;

  return (
    <div className="app-layout">
      {/* Top Application Header */}
      <header className="study-topbar">
        <div className="topbar-left">
          <button 
            className="btn-back-subjects"
            onClick={() => setSelectedSubjectId(null)}
            title="Volver a la selección de materias"
          >
            <span className="back-arrow">←</span>
            <span className="btn-text">Materias</span>
          </button>
          
          <div className="subject-info-badge">
            <span className="subject-icon-small">{subject.icon}</span>
            <span className="subject-title-small">{subject.title}</span>
          </div>
        </div>

        <div className="topbar-center">
          <span className="active-theme-pill" title={`Tema activo: ${currentThemeName}`}>
            📖 {currentThemeName}
          </span>
        </div>

        <div className="topbar-right">
          <button 
            className={`btn-contrast-toggle ${theme === 'high-contrast' ? 'active' : ''}`}
            onClick={() => setTheme(t => t === 'dark' ? 'high-contrast' : 'dark')}
            aria-label="Alternar modo de alto contraste y visión nocturna"
            title={theme === 'high-contrast' ? "Desactivar Alto Contraste (Volver a Tema Oscuro estándar)" : "Activar Alto Contraste (Modo Nocturno / Fórmulas Nítidas)"}
          >
            <span className="contrast-icon">🌓</span>
            <span className="contrast-label">{theme === 'high-contrast' ? 'Alto Contraste' : 'Contraste'}</span>
          </button>

          <button 
            className={`btn-mode-toggle ${interactiveMode ? 'interactive' : 'classic'}`}
            onClick={() => setInteractiveMode(prev => !prev)}
            aria-label={interactiveMode ? "Modo interactivo activo. Cambiar a modo clásico pasivo" : "Modo clásico activo. Cambiar a modo interactivo"}
            title={interactiveMode ? "Modo Interactivo activo. Clic para cambiar a Modo Clásico (Lectura pasiva sin censuras interactivas)" : "Modo Clásico activo. Clic para activar Modo Interactivo (Clozes y ejercicios activos)"}
          >
            <span className="mode-toggle-icon">{interactiveMode ? '⚡' : '📖'}</span>
            <span className="mode-toggle-label">{interactiveMode ? 'Interactivo' : 'Clásico'}</span>
          </button>

          <button 
            className="btn-toggle-drawer"
            onClick={() => setIsDrawerOpen(prev => !prev)}
            aria-label="Abrir panel de tarjetas"
            title="Abrir temario y lista de tarjetas"
          >
            <span className="drawer-burger-icon">☰</span>
            <span className="drawer-btn-label">Temas y Cards</span>
            <span className="drawer-count-badge">{currentCardIndex + 1}/{cards.length}</span>
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="study-progress-wrapper" title={`Progreso: ${progressPercent}% (${currentCardIndex + 1} de ${cards.length})`}>
        <div className="study-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Main Study Arena */}
      <main className="study-arena">
        <div className="card-and-controls-wrapper">
          <FlashCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(f => !f)}
            currentIndex={currentCardIndex}
            totalCards={cards.length}
            interactiveMode={interactiveMode}
          />

          <StudyNavigation
            onPrevTheme={handlePrevTheme}
            onPrevCard={handlePrevCard}
            onNextCard={handleNextCard}
            onNextTheme={handleNextTheme}
            onRandomTheme={handleRandomTheme}
            canPrevTheme={currentThemeIndex > 0}
            canPrevCard={currentCardIndex > 0}
            canNextCard={currentCardIndex < cards.length - 1}
            canNextTheme={currentThemeIndex >= 0 && currentThemeIndex < themesList.length - 1}
          />
        </div>
      </main>

      {/* Study Drawer Sidebar */}
      <StudyDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        themesList={themesList}
        cards={cards}
        currentCardIndex={currentCardIndex}
        onSelectCard={(idx) => {
          handleSelectCard(idx);
          setIsDrawerOpen(false);
        }}
      />
    </div>
  );
}
