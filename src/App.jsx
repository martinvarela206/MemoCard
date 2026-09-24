import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getSubjectById } from './data/subjects';
import { normalizeAndExpandCards } from './types/cardTypes';
import SubjectSelector from './components/SubjectSelector';
import FlashCard from './components/FlashCard';
import StudyNavigation from './components/StudyNavigation';
import StudyDrawer from './components/StudyDrawer';
import GuidedStudyBanner from './components/GuidedStudyBanner';
import DeckStatsModal from './components/DeckStatsModal';
import DeckExportImportModal from './components/DeckExportImportModal';
import { getDefaultSRSState, calculateNextReview, isCardDue } from './utils/srsEngine';
import { 
  loadSubjectSRS, 
  saveSubjectSRS, 
  loadSubjectCardIndex, 
  saveSubjectCardIndex, 
  recordReviewEvent 
} from './utils/storageManager';
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

  // Guided learning mode flag (persisted, defaults to false)
  const [guidedMode, setGuidedMode] = useState(() => {
    const saved = localStorage.getItem('memocard_guided_mode');
    return saved !== null ? saved === 'true' : false;
  });

  // Persist guided mode state
  useEffect(() => {
    localStorage.setItem('memocard_guided_mode', String(guidedMode));
  }, [guidedMode]);

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

  // Spaced Repetition (SRS) data map per subject: { [cardId]: srsRecord }
  const [srsData, setSrsData] = useState(() => {
    return {};
  });

  // Reload SRS data via storageManager when subject changes
  useEffect(() => {
    if (selectedSubjectId) {
      setSrsData(loadSubjectSRS(selectedSubjectId));
    } else {
      setSrsData({});
    }
  }, [selectedSubjectId]);

  // Persist SRS data via storageManager
  const saveSRSData = useCallback((newData) => {
    setSrsData(newData);
    if (selectedSubjectId) {
      saveSubjectSRS(selectedSubjectId, newData);
    }
  }, [selectedSubjectId]);

  // SRS filter mode: when true, only due cards are shown
  const [srsOnlyDue, setSrsOnlyDue] = useState(false);

  // Due cards count
  const dueCardsCount = useMemo(() => {
    return cards.filter(c => isCardDue(srsData[c.id])).length;
  }, [cards, srsData]);

  // Active study deck (either due cards only or all deck cards)
  const activeDeckCards = useMemo(() => {
    if (!srsOnlyDue) return cards;
    return cards.filter(c => isCardDue(srsData[c.id]));
  }, [cards, srsOnlyDue, srsData]);

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

  // Card index within current subject (persisted per subject via storageManager)
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Initialize or restore card index when subject changes
  useEffect(() => {
    if (selectedSubjectId && cards.length > 0) {
      const savedIndex = loadSubjectCardIndex(selectedSubjectId);
      if (savedIndex >= 0 && savedIndex < cards.length) {
        setCurrentCardIndex(savedIndex);
        return;
      }
      setCurrentCardIndex(0);
    }
  }, [selectedSubjectId, cards.length]);

  // Persist current card index via storageManager
  useEffect(() => {
    if (selectedSubjectId) {
      saveSubjectCardIndex(selectedSubjectId, currentCardIndex);
    }
  }, [selectedSubjectId, currentCardIndex]);

  // Card flip state (always reset to false when card changes)
  const [isFlipped, setIsFlipped] = useState(false);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Retention stats modal state
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Deck export/import backup modal state
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Callback to merge and restore imported deck data
  const handleImportDeck = useCallback((importedData) => {
    if (!importedData) return;
    if (importedData.srsData) {
      const mergedSRS = {
        ...srsData,
        ...importedData.srsData
      };
      saveSRSData(mergedSRS);
    }
  }, [srsData, saveSRSData]);

  const currentCard = activeDeckCards[currentCardIndex] || null;
  const currentThemeName = currentCard?.theme || 'General';
  const currentThemeIndex = themesList.findIndex(t => t.name === currentThemeName);

  // Filter cards strictly for the current theme to support sequential guided progression
  const cardsInCurrentTheme = useMemo(() => {
    return cards.filter(c => (c.theme || 'General') === currentThemeName);
  }, [cards, currentThemeName]);

  const cardIndexInTheme = useMemo(() => {
    if (!currentCard) return 1;
    const idx = cardsInCurrentTheme.findIndex(c => c.id === currentCard.id);
    return idx >= 0 ? idx + 1 : 1;
  }, [cardsInCurrentTheme, currentCard]);

  // SRS rating handler: calculates SM-2 progression, stores update, and advances card
  const handleRateCard = useCallback((rating) => {
    if (!currentCard) return;
    const currentCardSRS = srsData[currentCard.id] || getDefaultSRSState();
    const updatedRecord = calculateNextReview(currentCardSRS, rating);
    const updatedData = {
      ...srsData,
      [currentCard.id]: updatedRecord
    };
    saveSRSData(updatedData);

    // Record review event for longitudinal retention statistics
    if (selectedSubjectId) {
      recordReviewEvent(selectedSubjectId, rating);
    }

    setIsFlipped(false);
    if (srsOnlyDue) {
      if (currentCardIndex >= activeDeckCards.length - 1) {
        setCurrentCardIndex(0);
      }
    } else {
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      }
    }
  }, [currentCard, srsData, saveSRSData, selectedSubjectId, srsOnlyDue, currentCardIndex, activeDeckCards.length, cards.length]);

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
            className={`btn-guided-toggle ${guidedMode ? 'active' : ''}`}
            onClick={() => setGuidedMode(prev => !prev)}
            aria-label={guidedMode ? "Modo Guiado activo. Cambiar a modo exploración libre" : "Modo Libre activo. Cambiar a aprendizaje guiado secuencial"}
            title={guidedMode ? "Modo Guiado activo. Clic para cambiar a exploración libre" : "Modo Libre activo. Clic para activar Aprendizaje Guiado secuencial por temas"}
          >
            <span className="guided-toggle-icon">🎓</span>
            <span className="guided-toggle-label">{guidedMode ? 'Guiado' : 'Libre'}</span>
          </button>

          <button 
            className={`btn-srs-toggle ${srsOnlyDue ? 'active' : ''}`}
            onClick={() => {
              setSrsOnlyDue(prev => !prev);
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            aria-label="Alternar filtro de repaso espaciado para tarjetas pendientes hoy"
            title={srsOnlyDue ? "Filtro SRS activo (Solo tarjetas pendientes). Clic para volver a ver todo el mazo" : `Activar sesión de Repaso Espaciado (${dueCardsCount} pendientes hoy)`}
          >
            <span className="srs-toggle-icon">🎯</span>
            <span className="srs-toggle-label">SRS</span>
            <span className="srs-due-badge">{dueCardsCount}</span>
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
            className="btn-stats-toggle"
            onClick={() => setIsStatsOpen(true)}
            aria-label="Ver estadísticas de retención y repaso"
            title="Ver estadísticas de retención, rachas y distribución de tarjetas"
          >
            <span className="stats-toggle-icon">📊</span>
            <span className="stats-toggle-label">Estadísticas</span>
          </button>

          <button 
            className="btn-backup-toggle"
            onClick={() => setIsBackupOpen(true)}
            aria-label="Exportar o importar respaldos del mazo"
            title="Exportar mazo con notas y estadísticas o restaurar un respaldo"
          >
            <span className="backup-toggle-icon">📦</span>
            <span className="backup-toggle-label">Respaldo</span>
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

      {/* Guided Sequential Learning Banner */}
      {guidedMode && (
        <GuidedStudyBanner
          themeName={currentThemeName}
          themeIndex={currentThemeIndex >= 0 ? currentThemeIndex : 0}
          totalThemes={themesList.length}
          cardIndexInTheme={cardIndexInTheme}
          totalCardsInTheme={cardsInCurrentTheme.length}
          onExitGuided={() => setGuidedMode(false)}
          onNextTheme={handleNextTheme}
          canNextTheme={currentThemeIndex >= 0 && currentThemeIndex < themesList.length - 1}
        />
      )}

      {/* Main Study Arena */}
      <main className="study-arena">
        {srsOnlyDue && activeDeckCards.length === 0 ? (
          <div className="srs-completed-state">
            <span className="srs-completed-icon">🎉</span>
            <h2 className="srs-completed-title">¡Mazo al día!</h2>
            <p className="srs-completed-msg">
              Has repasado todas las tarjetas programadas para hoy según el algoritmo SM-2.
            </p>
            <button
              type="button"
              className="btn-srs-return-all"
              onClick={() => {
                setSrsOnlyDue(false);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
            >
              Explorar todo el mazo libremente
            </button>
          </div>
        ) : (
          <div className="card-and-controls-wrapper">
            <FlashCard
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(f => !f)}
              currentIndex={currentCardIndex}
              totalCards={activeDeckCards.length}
              interactiveMode={interactiveMode}
              cardSRSState={currentCard ? srsData[currentCard.id] : null}
              onRateSRS={handleRateCard}
            />

            <StudyNavigation
              onPrevTheme={handlePrevTheme}
              onPrevCard={handlePrevCard}
              onNextCard={handleNextCard}
              onNextTheme={handleNextTheme}
              onRandomTheme={handleRandomTheme}
              canPrevTheme={currentThemeIndex > 0}
              canPrevCard={currentCardIndex > 0}
              canNextCard={currentCardIndex < activeDeckCards.length - 1}
              canNextTheme={currentThemeIndex >= 0 && currentThemeIndex < themesList.length - 1}
            />
          </div>
        )}
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

      {/* Retention Analytics Modal */}
      <DeckStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        subjectTitle={subject.title}
        subjectId={selectedSubjectId}
        cards={cards}
        srsData={srsData}
      />

      {/* Deck Export / Import Modal */}
      <DeckExportImportModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        subject={subject}
        cards={cards}
        srsData={srsData}
        onImportDeck={handleImportDeck}
      />
    </div>
  );
}
