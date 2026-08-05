import React, { useState, useEffect, useCallback } from 'react';
import data from './data/ColoquioTeoriaComputacion.json';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './App.css';

// Helper component/function to parse LaTeX math and markdown bold/italics
const mdStyleRegex = /(\*\*\*(?=\S).+?(?<=\S)\*\*\*|\*\*(?=\S).+?(?<=\S)\*\*|\*[^\s*]+?(?<=\S)\*|\*(?=\S).+?(?<=\S)\*)/g;

function parseMarkdownText(segment, isClozeMode = false, keyPrefix = "") {
  const parts = segment.split(mdStyleRegex);
  return parts.map((part, pIdx) => {
    if (pIdx % 2 === 0) {
      return part;
    }
    
    const key = `${keyPrefix}_${pIdx}`;
    
    if (part.startsWith('***') && part.endsWith('***')) {
      const content = part.slice(3, -3);
      if (isClozeMode) {
        return (
          <span 
            key={key} 
            className="cloze-concept blurred" 
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.classList.remove('blurred');
            }}
            title="Haz clic para revelar"
          >
            <strong><em>{content}</em></strong>
          </span>
        );
      }
      return <strong key={key}><em>{content}</em></strong>;
    }
    
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      if (isClozeMode) {
        return (
          <span 
            key={key} 
            className="cloze-concept blurred" 
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.classList.remove('blurred');
            }}
            title="Haz clic para revelar"
          >
            <strong>{content}</strong>
          </span>
        );
      }
      return <strong key={key}>{content}</strong>;
    }
    
    if (part.startsWith('*') && part.endsWith('*')) {
      const content = part.slice(1, -1);
      return <em key={key}>{content}</em>;
    }
    
    return part;
  });
}

function restoreMathPlaceholders(nodes, mathItems) {
  if (!nodes) return null;
  
  const restoreInString = (str) => {
    if (typeof str !== 'string') return str;
    
    const parts = str.split(/(%%BLOCKMATH_\d+%%|%%INLINEMATH_\d+%%)/g);
    if (parts.length === 1) return str;
    
    return parts.map((part, idx) => {
      if (idx % 2 === 0) {
        return part;
      }
      const match = part.match(/%%(?:BLOCK|INLINE)MATH_(\d+)%%/);
      if (match) {
        const mathIndex = parseInt(match[1]);
        return mathItems[mathIndex]?.element || part;
      }
      return part;
    });
  };
  
  if (Array.isArray(nodes)) {
    const result = [];
    nodes.forEach((node, idx) => {
      if (typeof node === 'string') {
        const restored = restoreInString(node);
        if (Array.isArray(restored)) {
          result.push(...restored);
        } else {
          result.push(restored);
        }
      } else if (React.isValidElement(node)) {
        if (node.props && node.props.children) {
          const newChildren = restoreMathPlaceholders(node.props.children, mathItems);
          result.push(React.cloneElement(node, { key: node.key || idx }, newChildren));
        } else {
          result.push(node);
        }
      } else {
        result.push(node);
      }
    });
    return result;
  }
  
  if (typeof nodes === 'string') {
    return restoreInString(nodes);
  }
  
  if (React.isValidElement(nodes)) {
    if (nodes.props && nodes.props.children) {
      const newChildren = restoreMathPlaceholders(nodes.props.children, mathItems);
      return React.cloneElement(nodes, {}, newChildren);
    }
    return nodes;
  }
  
  return nodes;
}

function renderTextWithMathAndMarkdown(text, isClozeMode = false, keyPrefix = "") {
  if (!text) return "";
  
  const mathItems = [];
  
  // 1. Extract block math $$...$$
  let processedText = text.replace(/\$\$(.*?)\$\$/gs, (match, mathContent) => {
    const placeholder = `%%BLOCKMATH_${mathItems.length}%%`;
    try {
      const html = katex.renderToString(mathContent, { displayMode: true, throwOnError: false });
      mathItems.push({
        type: 'block',
        element: <div key={placeholder} dangerouslySetInnerHTML={{ __html: html }} className="math-block" />
      });
    } catch (e) {
      mathItems.push({
        type: 'block',
        element: <div key={placeholder} className="math-error">$$ {mathContent} $$</div>
      });
    }
    return placeholder;
  });
  
  // 2. Extract inline math $...$
  processedText = processedText.replace(/\$(.*?)\$/g, (match, mathContent) => {
    const placeholder = `%%INLINEMATH_${mathItems.length}%%`;
    try {
      const html = katex.renderToString(mathContent, { displayMode: false, throwOnError: false });
      mathItems.push({
        type: 'inline',
        element: <span key={placeholder} dangerouslySetInnerHTML={{ __html: html }} className="math-inline" />
      });
    } catch (e) {
      mathItems.push({
        type: 'inline',
        element: <span key={placeholder} className="math-error">${mathContent}$</span>
      });
    }
    return placeholder;
  });
  
  // 3. Parse markdown formatting
  const formattedElements = parseMarkdownText(processedText, isClozeMode, keyPrefix);
  
  // 4. Restore math elements
  return restoreMathPlaceholders(formattedElements, mathItems);
}

function renderMathAndMarkdown(text) {
  return renderTextWithMathAndMarkdown(text, false, "math_md");
}

// Function to render slide body lines with list detection and nested list elements
function renderSlideLines(content, blurConcepts = false, onRevealConcept = null) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements = [];
  
  let currentList = null;
  let currentListType = null; // 'ul' or 'ol'
  
  // Custom math + markdown renderer that supports blurring of bold concepts
  const renderLineWithBlur = (text) => {
    if (!text) return "";
    
    // If not blurring, use the standard math + markdown renderer
    if (!blurConcepts) {
      return renderMathAndMarkdown(text);
    }
    
    return renderTextWithMathAndMarkdown(text, true, "cloze");
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentList) {
        elements.push(currentList);
        currentList = null;
        currentListType = null;
      }
      continue;
    }
    
    // Check if it's a list item
    const isBullet = /^([*-])\s+/.test(trimmed);
    const isNumbered = /^\d+\.\s+/.test(trimmed);
    const isIndented = line.startsWith('    ') || line.startsWith('\t');
    
    if (isBullet || isNumbered) {
      const listType = isBullet ? 'ul' : 'ol';
      const cleanText = isBullet ? trimmed.substring(1).trim() : trimmed.replace(/^\d+\.\s+/, '').trim();
      
      // If we change list type or start a new list
      if (currentListType !== listType || !currentList) {
        if (currentList) {
          elements.push(currentList);
        }
        currentListType = listType;
        currentList = { type: listType, items: [] };
      }
      
      currentList.items.push({
        text: cleanText,
        indented: isIndented,
        key: i
      });
    } else {
      // Not a list item
      if (currentList) {
        elements.push(currentList);
        currentList = null;
        currentListType = null;
      }
      
      // Check if it's block math $$...$$
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
        const math = trimmed.substring(2, trimmed.length - 2).trim();
        elements.push(
          <div key={i} className="math-block-line">
            {renderLineWithBlur(`$$${math}$$`)}
          </div>
        );
      } else {
        elements.push(
          <p key={i} className="text-line">
            {renderLineWithBlur(line)}
          </p>
        );
      }
    }
  }
  
  if (currentList) {
    elements.push(currentList);
  }
  
  return elements.map((el, idx) => {
    if (el.type === 'ul' || el.type === 'ol') {
      const Tag = el.type;
      return (
        <Tag key={idx} className="content-list">
          {el.items.map((item, itemIdx) => (
            <li key={itemIdx} className={item.indented ? "nested-item" : "main-item"}>
              {renderLineWithBlur(item.text)}
            </li>
          ))}
        </Tag>
      );
    }
    return el;
  });
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cards, setCards] = useState([]);
  const [studySession, setStudySession] = useState(null); // { queue: [], currentIndex: 0, showAnswer: false }
  const [selectedSlide, setSelectedSlide] = useState(data.slides[0]?.id || 1);
  const [clozeMode, setClozeMode] = useState(false);
  const [searchSlide, setSearchSlide] = useState('');
  
  // Custom filter configs
  const [filterSlideStart, setFilterSlideStart] = useState(1);
  const [filterSlideEnd, setFilterSlideEnd] = useState(data.slides.length);
  const [filterStatus, setFilterStatus] = useState('all');
  const [shuffleCustom, setShuffleCustom] = useState(false);

  // Load progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('memocard_progress');
    let progressMap = {};
    if (savedProgress) {
      try {
        progressMap = JSON.parse(savedProgress);
      } catch (e) {
        console.error("Error loading progress map", e);
      }
    }
    
    // Hydrate cards with saved status
    const hydratedCards = data.cards.map(c => ({
      ...c,
      status: progressMap[c.id] || 'unlearned'
    }));
    setCards(hydratedCards);
  }, []);

  // Save progress when cards change
  const saveProgress = (updatedCards) => {
    const progressMap = {};
    updatedCards.forEach(c => {
      if (c.status !== 'unlearned') {
        progressMap[c.id] = c.status;
      }
    });
    localStorage.setItem('memocard_progress', JSON.stringify(progressMap));
  };

  // Grade card helper
  const handleGradeCard = useCallback((status) => {
    if (!studySession) return;
    
    const currentCard = studySession.queue[studySession.currentIndex];
    
    // Update card status
    const updatedCards = cards.map(c => {
      if (c.id === currentCard.id) {
        return { ...c, status };
      }
      return c;
    });
    
    setCards(updatedCards);
    saveProgress(updatedCards);
    
    // Advance queue
    if (studySession.currentIndex + 1 < studySession.queue.length) {
      setStudySession(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showAnswer: false
      }));
    } else {
      // Session finished
      alert("¡Sesión finalizada! Buen trabajo repasando tus tarjetas.");
      setStudySession(null);
      setActiveTab('dashboard');
    }
  }, [studySession, cards]);

  // Card navigation helpers
  const handleNextCard = useCallback(() => {
    if (!studySession) return;
    if (studySession.currentIndex + 1 < studySession.queue.length) {
      setStudySession(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showAnswer: false
      }));
    } else {
      alert("¡Has llegado al final de la sesión!");
    }
  }, [studySession]);

  const handlePrevCard = useCallback(() => {
    if (!studySession) return;
    if (studySession.currentIndex > 0) {
      setStudySession(prev => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
        showAnswer: false
      }));
    }
  }, [studySession]);

  // Handle keyboard shortcuts during study
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeTab !== 'study' || !studySession) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        if (!studySession.showAnswer) {
          setStudySession(prev => ({ ...prev, showAnswer: true }));
        } else {
          // If already showing answer, space acts as "Good" grade
          handleGradeCard('good');
        }
      } else if (e.key === 'a' || e.key === 'A' || e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === 'd' || e.key === 'D' || e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (studySession.showAnswer) {
        if (e.key === '1') handleGradeCard('again');
        else if (e.key === '2') handleGradeCard('hard');
        else if (e.key === '3') handleGradeCard('good');
        else if (e.key === '4') handleGradeCard('easy');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, studySession, handleGradeCard, handlePrevCard, handleNextCard]);

  // Statistics calculation
  const stats = {
    total: cards.length,
    unlearned: cards.filter(c => c.status === 'unlearned').length,
    again: cards.filter(c => c.status === 'again').length,
    hard: cards.filter(c => c.status === 'hard').length,
    good: cards.filter(c => c.status === 'good').length,
    easy: cards.filter(c => c.status === 'easy').length,
    mastered: cards.filter(c => c.status === 'easy' || c.status === 'good').length,
  };
  
  stats.percentLearned = stats.total > 0 ? Math.round(((stats.total - stats.unlearned) / stats.total) * 100) : 0;
  stats.percentMastered = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  // Initialize a study session
  const startStudy = (mode = 'all') => {
    let filteredQueue = [];
    
    if (mode === 'all') {
      filteredQueue = [...cards];
    } else if (mode === 'weak') {
      filteredQueue = cards.filter(c => c.status === 'again' || c.status === 'hard');
    } else if (mode === 'pending') {
      filteredQueue = cards.filter(c => c.status === 'unlearned');
    } else if (mode === 'custom') {
      filteredQueue = cards.filter(c => {
        const slideId = c.slide_id;
        const matchesRange = slideId >= filterSlideStart && slideId <= filterSlideEnd;
        const matchesStatus = filterStatus === 'all' || 
          (filterStatus === 'unlearned' && c.status === 'unlearned') ||
          (filterStatus === 'weak' && (c.status === 'again' || c.status === 'hard')) ||
          (filterStatus === 'mastered' && (c.status === 'good' || c.status === 'easy'));
        
        return matchesRange && matchesStatus;
      });
    }
    
    if (filteredQueue.length === 0) {
      alert("No hay tarjetas que coincidan con los criterios seleccionados.");
      return;
    }
    
    // Sort or shuffle the queue
    let finalQueue = [...filteredQueue];
    if (mode === 'custom') {
      if (shuffleCustom) {
        finalQueue.sort(() => Math.random() - 0.5);
      } else {
        finalQueue.sort((a, b) => a.slide_id - b.slide_id);
      }
    } else {
      finalQueue.sort(() => Math.random() - 0.5);
    }
    
    setStudySession({
      queue: finalQueue,
      currentIndex: 0,
      showAnswer: false
    });
    setActiveTab('study');
  };

  const resetProgress = () => {
    if (window.confirm("¿Estás seguro de que quieres restablecer todo el progreso de estudio? Esto borrará el historial de todas las tarjetas.")) {
      const reset = cards.map(c => ({ ...c, status: 'unlearned' }));
      setCards(reset);
      saveProgress(reset);
      setStudySession(null);
      alert("Progreso restablecido correctamente.");
    }
  };

  // Filter slides in sidebar
  const filteredSlides = data.slides.filter(slide => 
    slide.title.toLowerCase().includes(searchSlide.toLowerCase()) ||
    `Diapositiva ${slide.id}`.toLowerCase().includes(searchSlide.toLowerCase())
  );

  const currentSlideObj = data.slides.find(s => s.id === selectedSlide) || data.slides[0];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-title-wrapper">
          <span className="app-badge">Study Engine</span>
          <h1>{data.title}</h1>
          <p>{data.subtitle}</p>
        </div>
      </header>

      {/* Main Navigation Menu */}
      <nav className="nav-menu">
        <button 
          className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('dashboard'); setStudySession(null); }}
        >
          📊 Dashboard
        </button>
        <button 
          className={`nav-button ${activeTab === 'study' ? 'active' : ''}`}
          onClick={() => {
            if (!studySession) {
              startStudy('all');
            } else {
              setActiveTab('study');
            }
          }}
        >
          🧠 Memorización
        </button>
        <button 
          className={`nav-button ${activeTab === 'slides' ? 'active' : ''}`}
          onClick={() => { setActiveTab('slides'); setStudySession(null); }}
        >
          📖 Diapositivas
        </button>
        <button 
          className={`nav-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => { setActiveTab('stats'); setStudySession(null); }}
        >
          📈 Estadísticas
        </button>
      </nav>

      {/* Component Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="dashboard-grid">
              <div className="stat-card glass-panel">
                <span className="stat-label">Diapositivas</span>
                <span className="stat-value">{data.slides.length}</span>
                <span className="stat-desc">Diapositivas de estudio cargadas</span>
              </div>
              <div className="stat-card glass-panel">
                <span className="stat-label">Tarjetas Totales</span>
                <span className="stat-value">{stats.total}</span>
                <span className="stat-desc">Conceptos clave extraídos</span>
              </div>
              <div className="stat-card glass-panel">
                <span className="stat-label">Aprendidas</span>
                <span className="stat-value">{stats.percentLearned}%</span>
                <span className="stat-desc">{stats.total - stats.unlearned} de {stats.total} tarjetas vistas</span>
              </div>
              <div className="stat-card glass-panel">
                <span className="stat-label">Dominadas</span>
                <span className="stat-value">{stats.percentMastered}%</span>
                <span className="stat-desc">{stats.mastered} tarjetas en Bien o Fácil</span>
              </div>
            </div>

            {/* Quick Session Launcher */}
            <div className="action-box glass-panel">
              <h2>¿Listo para comenzar una sesión?</h2>
              <p>Elige tu método de estudio preferido. Recomendamos estudiar por intervalos o seleccionar diapositivas específicas si estás preparando un examen.</p>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                <button className="btn-primary" onClick={() => startStudy('all')}>
                  Estudiar Todo ({stats.total} tjt)
                </button>
                {stats.again + stats.hard > 0 && (
                  <button 
                    className="btn-primary" 
                    style={{ background: 'var(--grad-secondary)', boxShadow: '0 4px 20px rgba(6, 182, 212, 0.4)' }}
                    onClick={() => startStudy('weak')}
                  >
                    Repasar Débiles ({stats.again + stats.hard})
                  </button>
                )}
                {stats.unlearned > 0 && (
                  <button 
                    className="btn-primary" 
                    style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid var(--border-color)', boxShadow: 'none' }}
                    onClick={() => startStudy('pending')}
                  >
                    Estudiar Pendientes ({stats.unlearned})
                  </button>
                )}
              </div>
            </div>

            {/* Custom Study Selector Panel */}
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'left' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '15px', color: 'var(--text-primary)' }}>
                ⚙️ Sesión de Estudio Personalizada
              </h3>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rango de Diapositivas (Desde - Hasta):</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      min="1" 
                      max={data.slides.length} 
                      value={filterSlideStart} 
                      onChange={e => setFilterSlideStart(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', color: 'white', width: '70px', textAlign: 'center' }}
                    />
                    <span style={{ color: 'var(--text-muted)' }}>a</span>
                    <input 
                      type="number" 
                      min="1" 
                      max={data.slides.length} 
                      value={filterSlideEnd} 
                      onChange={e => setFilterSlideEnd(Math.min(data.slides.length, parseInt(e.target.value) || data.slides.length))}
                      style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', color: 'white', width: '70px', textAlign: 'center' }}
                    />
                  </div>
                </div>

                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filtrar por Estado:</label>
                  <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', color: 'white', cursor: 'pointer' }}
                  >
                    <option value="all">Todas las tarjetas del rango</option>
                    <option value="unlearned">Solo No Estudiadas</option>
                    <option value="weak">Solo Errores/Dificiles (Otra vez/Difícil)</option>
                    <option value="mastered">Solo Dominadas (Bien/Fácil)</option>
                  </select>
                </div>

                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'flex-end', paddingBottom: '10px' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={shuffleCustom} 
                      onChange={e => setShuffleCustom(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    Mezclar orden (aleatorio)
                  </label>
                </div>

                <div style={{ flex: '1 1 150px', display: 'flex', alignItems: 'flex-end' }}>
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '10px 20px', fontSize: '0.95rem' }}
                    onClick={() => startStudy('custom')}
                  >
                    Iniciar Personalizado
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MEMORIZATION TAB */}
        {activeTab === 'study' && (
          <div className="study-container">
            {studySession ? (
              <>
                {/* Stats header */}
                <div className="session-progress glass-panel" style={{ borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Repasando: <strong>{studySession.currentIndex + 1}</strong> de <strong>{studySession.queue.length}</strong>
                  </span>
                  
                  <div className="progress-track">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${((studySession.currentIndex) / studySession.queue.length) * 100}%` }}
                    />
                  </div>

                  <button 
                    className="btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                    onClick={() => setStudySession(null)}
                  >
                    Salir
                  </button>
                </div>

                {/* 3D Flip Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
                  {/* Left Arrow Button */}
                  <button 
                    className="btn-secondary" 
                    onClick={(e) => { e.stopPropagation(); handlePrevCard(); }}
                    disabled={studySession.currentIndex === 0}
                    style={{
                      borderRadius: '50%',
                      width: '45px',
                      height: '45px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      padding: '0',
                      opacity: studySession.currentIndex === 0 ? 0.3 : 1,
                      cursor: studySession.currentIndex === 0 ? 'not-allowed' : 'pointer',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      boxShadow: 'var(--shadow-glass)',
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}
                    title="Tarjeta anterior (Tecla A / Flecha Izquierda)"
                  >
                    ◀
                  </button>

                  {/* 3D Flip Card */}
                  <div 
                    className="card-perspective" 
                    onClick={() => setStudySession(prev => ({ ...prev, showAnswer: !prev.showAnswer }))}
                    style={{ flex: 1 }}
                  >
                    <div className={`card-rotator ${studySession.showAnswer ? 'flipped' : ''}`}>
                      
                      {/* Front Face */}
                      <div className="card-face front glass-panel">
                        <div className="card-header">
                          <span>Diapositiva {studySession.queue[studySession.currentIndex].slide_id}</span>
                          <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>CONCEPTO</span>
                        </div>
                        
                        {studySession.queue[studySession.currentIndex].context && (
                          <div className="card-context" onClick={(e) => e.stopPropagation()}>
                            {renderMathAndMarkdown(studySession.queue[studySession.currentIndex].context)}
                          </div>
                        )}
                        
                        <div className="card-body">
                          <div className="card-term">
                            {renderMathAndMarkdown(studySession.queue[studySession.currentIndex].term)}
                          </div>
                          <span className="card-instruction">Haz clic en la tarjeta o presiona Espacio para revelarla</span>
                        </div>
                      </div>

                      {/* Back Face */}
                      <div className="card-face back glass-panel">
                        <div className="card-header">
                          <span>Diapositiva {studySession.queue[studySession.currentIndex].slide_id}</span>
                          <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>RESPUESTA</span>
                        </div>
                        
                        {studySession.queue[studySession.currentIndex].context && (
                          <div className="card-context">
                            {renderMathAndMarkdown(studySession.queue[studySession.currentIndex].context)}
                          </div>
                        )}
                        
                        <div className="card-body" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                          <div className="card-answer">
                            {renderSlideLines(studySession.queue[studySession.currentIndex].back)}
                          </div>
                        </div>
                        
                        <div className="card-instruction" style={{ textAlign: 'center', width: '100%' }}>
                          Califica tu recuerdo abajo para reprogramarla
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Right Arrow Button */}
                  <button 
                    className="btn-secondary" 
                    onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
                    disabled={studySession.currentIndex === studySession.queue.length - 1}
                    style={{
                      borderRadius: '50%',
                      width: '45px',
                      height: '45px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      padding: '0',
                      opacity: studySession.currentIndex === studySession.queue.length - 1 ? 0.3 : 1,
                      cursor: studySession.currentIndex === studySession.queue.length - 1 ? 'not-allowed' : 'pointer',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      boxShadow: 'var(--shadow-glass)',
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}
                    title="Siguiente tarjeta (Tecla D / Flecha Derecha)"
                  >
                    ▶
                  </button>
                </div>

                {/* Controls */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                  {!studySession.showAnswer ? (
                    <button 
                      className="flip-prompt"
                      onClick={() => setStudySession(prev => ({ ...prev, showAnswer: true }))}
                    >
                      Revelar Respuesta (Espacio)
                    </button>
                  ) : (
                    <div className="grade-controls">
                      <button className="grade-btn again" onClick={() => handleGradeCard('again')}>
                        <span>Otra Vez</span>
                        <span className="shortcut">Teclado 1</span>
                      </button>
                      <button className="grade-btn hard" onClick={() => handleGradeCard('hard')}>
                        <span>Difícil</span>
                        <span className="shortcut">Teclado 2</span>
                      </button>
                      <button className="grade-btn good" onClick={() => handleGradeCard('good')}>
                        <span>Bien</span>
                        <span className="shortcut">Teclado 3</span>
                      </button>
                      <button className="grade-btn easy" onClick={() => handleGradeCard('easy')}>
                        <span>Fácil</span>
                        <span className="shortcut">Teclado 4</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h2>No hay ninguna sesión activa</h2>
                <p>Ve al Dashboard para iniciar una sesión de estudio o crear una lista de reproducción personalizada.</p>
                <button className="btn-primary" onClick={() => startStudy('all')} style={{ alignSelf: 'center' }}>
                  Iniciar Sesión Completa
                </button>
              </div>
            )}
          </div>
        )}

        {/* SLIDE VIEWER TAB */}
        {activeTab === 'slides' && (
          <div className="slide-viewer-container glass-panel">
            {/* Sidebar list */}
            <div className="slide-sidebar" style={{ borderRight: '1px solid var(--border-color)' }}>
              <div className="sidebar-title">Estructura del Coloquio</div>
              <input 
                type="text"
                placeholder="🔍 Buscar diapositiva..."
                value={searchSlide}
                onChange={e => setSearchSlide(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'white',
                  fontSize: '0.85rem',
                  marginBottom: '10px',
                  width: '100%'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1, overflowY: 'auto' }}>
                {filteredSlides.map(slide => (
                  <button
                    key={slide.id}
                    className={`slide-nav-item ${selectedSlide === slide.id ? 'active' : ''}`}
                    onClick={() => setSelectedSlide(slide.id)}
                  >
                    D{slide.id}: {slide.title}
                  </button>
                ))}
                {filteredSlides.length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                    No se encontraron diapositivas
                  </div>
                )}
              </div>
            </div>

            {/* Selected Slide Content Display */}
            <div className="slide-content-area">
              <div className="slide-content-header">
                <h2>{currentSlideObj.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    onClick={() => setClozeMode(!clozeMode)}
                    style={{
                      background: clozeMode ? 'var(--primary-glow)' : 'transparent',
                      border: `1px solid ${clozeMode ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: '6px',
                      padding: '4px 10px',
                      color: clozeMode ? 'var(--primary)' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    title="Oculta los conceptos clave en negrita. Haz clic sobre ellos para revelarlos uno a uno."
                  >
                    {clozeMode ? '👁️ Revelar Todo' : '🙈 Ocultar Conceptos'}
                  </button>
                  <span className="slide-index-badge">Diapositiva {currentSlideObj.id} / {data.slides.length}</span>
                </div>
              </div>

              <div className="slide-body">
                {renderSlideLines(currentSlideObj.content, clozeMode)}
              </div>
              
              {/* Previous/Next quick buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', marginTop: 'auto', paddingTop: '20px' }}>
                <button
                  className="btn-secondary"
                  disabled={currentSlideObj.id === 1}
                  onClick={() => setSelectedSlide(prev => Math.max(1, prev - 1))}
                  style={{ opacity: currentSlideObj.id === 1 ? 0.3 : 1, cursor: currentSlideObj.id === 1 ? 'not-allowed' : 'pointer' }}
                >
                  ◀ Anterior
                </button>
                <button
                  className="btn-secondary"
                  disabled={currentSlideObj.id === data.slides.length}
                  onClick={() => setSelectedSlide(prev => Math.min(data.slides.length, prev + 1))}
                  style={{ opacity: currentSlideObj.id === data.slides.length ? 0.3 : 1, cursor: currentSlideObj.id === data.slides.length ? 'not-allowed' : 'pointer' }}
                >
                  Siguiente ▶
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATISTICS TAB */}
        {activeTab === 'stats' && (
          <div className="stats-panel glass-panel">
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '10px' }}>Estadísticas de Memorización</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
              Tu progreso se calcula a partir de las calificaciones que asignas a cada tarjeta en tus sesiones de memorización.
            </p>

            <div className="progress-summary">
              <div className="summary-row">
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Porcentaje Aprendido:</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{stats.percentLearned}%</strong>
              </div>
              <div className="summary-row">
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Porcentaje Dominado (Bien/Fácil):</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--secondary)' }}>{stats.percentMastered}%</strong>
              </div>
              
              <div className="summary-bar-wrapper">
                <div className="bar-segment easy" style={{ width: `${(stats.easy / stats.total) * 100}%` }} title={`Fácil: ${stats.easy}`} />
                <div className="bar-segment good" style={{ width: `${(stats.good / stats.total) * 100}%` }} title={`Bien: ${stats.good}`} />
                <div className="bar-segment hard" style={{ width: `${(stats.hard / stats.total) * 100}%` }} title={`Difícil: ${stats.hard}`} />
                <div className="bar-segment again" style={{ width: `${(stats.again / stats.total) * 100}%` }} title={`Repasar: ${stats.again}`} />
                <div className="bar-segment unlearned" style={{ width: `${(stats.unlearned / stats.total) * 100}%` }} title={`Pendiente: ${stats.unlearned}`} />
              </div>
            </div>

            <div className="legend-grid">
              <div className="legend-item">
                <div className="legend-color easy" />
                <div className="legend-info">
                  <span className="legend-name">Fácil</span>
                  <span className="legend-count">{stats.easy} tarjetas ({Math.round(stats.easy/stats.total*100)}%)</span>
                </div>
              </div>
              <div className="legend-item">
                <div className="legend-color good" />
                <div className="legend-info">
                  <span className="legend-name">Bien</span>
                  <span className="legend-count">{stats.good} tarjetas ({Math.round(stats.good/stats.total*100)}%)</span>
                </div>
              </div>
              <div className="legend-item">
                <div className="legend-color hard" />
                <div className="legend-info">
                  <span className="legend-name">Difícil</span>
                  <span className="legend-count">{stats.hard} tarjetas ({Math.round(stats.hard/stats.total*100)}%)</span>
                </div>
              </div>
              <div className="legend-item">
                <div className="legend-color again" />
                <div className="legend-info">
                  <span className="legend-name">Repasar</span>
                  <span className="legend-count">{stats.again} tarjetas ({Math.round(stats.again/stats.total*100)}%)</span>
                </div>
              </div>
              <div className="legend-item" style={{ gridColumn: 'span 2' }}>
                <div className="legend-color unlearned" />
                <div className="legend-info">
                  <span className="legend-name">Pendiente de estudio</span>
                  <span className="legend-count">{stats.unlearned} tarjetas ({Math.round(stats.unlearned/stats.total*100)}%)</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dominio = Calificadas como Bien o Fácil</span>
              <button className="btn-secondary" onClick={resetProgress}>
                🗑️ Restablecer Progreso
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{ marginTop: '50px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>MemoCard &copy; {new Date().getFullYear()} - Diseñado para el estudio eficiente de la computación teórica</p>
      </footer>
    </div>
  );
}

export default App;
