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
  
  let isFootnote = false;
  let textToProcess = text;
  if (typeof text === 'string' && text.trim().startsWith('>')) {
    isFootnote = true;
    textToProcess = text.trim().replace(/^>\s*/, '');
  }

  const mathItems = [];
  
  // 1. Extract block math $$...$$
  let processedText = textToProcess.replace(/\$\$(.*?)\$\$/gs, (match, mathContent) => {
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
  const restored = restoreMathPlaceholders(formattedElements, mathItems);
  return isFootnote ? <span className="card-footnote">{restored}</span> : restored;
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
    const isIndented = /^\s+/.test(line);
    
    if (isBullet || isNumbered) {
      const listType = isBullet ? 'ul' : 'ol';
      let cleanText = isBullet ? trimmed.substring(1).trim() : trimmed.replace(/^\d+\.\s+/, '').trim();
      
      const isFootnote = cleanText.startsWith('>');
      if (isFootnote) {
        cleanText = cleanText.replace(/^>\s*/, '');
      }

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
        isFootnote: isFootnote,
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
      } else if (trimmed.startsWith('>')) {
        const cleanText = trimmed.replace(/^>\s*/, '');
        elements.push(
          <p key={i} className="card-footnote">
            {renderLineWithBlur(cleanText)}
          </p>
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
      const isShortList = el.items.length >= 5 && el.items.every(item => item.text.length < 55 && !item.indented);
      const listClassName = `content-list${isShortList ? " two-columns" : ""}`;
      return (
        <Tag key={`list-${idx}`} className={listClassName}>
          {el.items.map((item, itemIdx) => {
            const className = `${item.indented ? "nested-item" : "main-item"}${item.isFootnote ? " card-footnote" : ""}`;
            return (
              <li key={`item-${idx}-${itemIdx}`} className={className}>
                {renderLineWithBlur(item.text)}
              </li>
            );
          })}
        </Tag>
      );
    }
    if (React.isValidElement(el)) {
      return React.cloneElement(el, { key: `line-${idx}` });
    }
    return <React.Fragment key={`line-${idx}`}>{el}</React.Fragment>;
  });
}

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const val = localStorage.getItem('memocard_active_tab');
    return ['dashboard', 'study', 'slides', 'stats'].includes(val) ? val : 'dashboard';
  });

  const [cards, setCards] = useState(() => {
    const savedProgress = localStorage.getItem('memocard_progress');
    let progressMap = {};
    if (savedProgress) {
      try {
        progressMap = JSON.parse(savedProgress);
      } catch (e) {
        console.error("Error loading progress map", e);
      }
    }
    return data.cards.map(c => ({
      ...c,
      status: progressMap[c.id] || 'unlearned'
    }));
  });

  const [studySession, setStudySession] = useState(() => {
    const savedSession = localStorage.getItem('memocard_study_session');
    if (!savedSession) return null;
    try {
      const parsed = JSON.parse(savedSession);
      const savedProgress = localStorage.getItem('memocard_progress');
      let progressMap = {};
      if (savedProgress) {
        try {
          progressMap = JSON.parse(savedProgress);
        } catch (e) {
          console.error("Error loading progress map", e);
        }
      }
      
      const hydratedCards = data.cards.map(c => ({
        ...c,
        status: progressMap[c.id] || 'unlearned'
      }));

      const reconstructedQueue = parsed.queueIds
        .map(id => hydratedCards.find(c => c.id === id))
        .filter(Boolean);

      if (reconstructedQueue.length > 0) {
        return {
          queue: reconstructedQueue,
          currentIndex: Math.min(parsed.currentIndex, reconstructedQueue.length - 1),
          showAnswer: parsed.showAnswer
        };
      }
    } catch (e) {
      console.error("Error restoring study session", e);
    }
    return null;
  });
  // State variables for selectedSlide, clozeMode and searchSlide removed (orphaned code cleaned)
  
  // Custom filter configs
  const [filterSlideStart, setFilterSlideStart] = useState(1);
  const [filterSlideEnd, setFilterSlideEnd] = useState(data.slides.length);
  const [filterStatus, setFilterStatus] = useState('all');
  const [shuffleCustom, setShuffleCustom] = useState(false);

  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('memocard_selected_theme') || null;
  });

  const [themeStudySession, setThemeStudySession] = useState(() => {
    const savedSession = localStorage.getItem('memocard_theme_study_session');
    if (!savedSession) return null;
    try {
      const parsed = JSON.parse(savedSession);
      const savedProgress = localStorage.getItem('memocard_progress');
      let progressMap = {};
      if (savedProgress) {
        try {
          progressMap = JSON.parse(savedProgress);
        } catch (e) {
          console.error("Error loading progress map", e);
        }
      }
      
      const hydratedCards = data.cards.map(c => ({
        ...c,
        status: progressMap[c.id] || 'unlearned'
      }));

      const reconstructedQueue = parsed.queueIds
        .map(id => hydratedCards.find(c => c.id === id))
        .filter(Boolean);

      if (reconstructedQueue.length > 0) {
        return {
          queue: reconstructedQueue,
          currentIndex: Math.min(parsed.currentIndex, reconstructedQueue.length - 1),
          showAnswer: parsed.showAnswer
        };
      }
    } catch (e) {
      console.error("Error restoring theme study session", e);
    }
    return null;
  });

  useEffect(() => {
    if (themeStudySession) {
      localStorage.setItem('memocard_theme_study_session', JSON.stringify({
        queueIds: themeStudySession.queue.map(c => c.id),
        currentIndex: themeStudySession.currentIndex,
        showAnswer: themeStudySession.showAnswer
      }));
    } else {
      localStorage.removeItem('memocard_theme_study_session');
    }
  }, [themeStudySession]);

  // Dynamic themes computation with progress
  const themesList = React.useMemo(() => {
    const themesMap = {};
    data.slides.forEach(slide => {
      const themeName = slide.theme || "Sin Tema";
      if (!themesMap[themeName]) {
        themesMap[themeName] = {
          name: themeName,
          start: slide.id,
          end: slide.id,
          count: 0
        };
      }
      themesMap[themeName].end = Math.max(themesMap[themeName].end, slide.id);
      themesMap[themeName].start = Math.min(themesMap[themeName].start, slide.id);
      themesMap[themeName].count += 1;
    });

    return Object.values(themesMap).map(theme => {
      const themeCards = cards.filter(c => c.theme === theme.name);
      const total = themeCards.length;
      const mastered = themeCards.filter(c => c.status === 'easy' || c.status === 'good').length;
      const percentMastered = total > 0 ? Math.round((mastered / total) * 100) : 0;
      return {
        ...theme,
        totalCards: total,
        percentMastered
      };
    });
  }, [data, cards]);

  // Sync state to localStorage when changes occur
  useEffect(() => {
    localStorage.setItem('memocard_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedTheme) {
      localStorage.setItem('memocard_selected_theme', selectedTheme);
    } else {
      localStorage.removeItem('memocard_selected_theme');
    }
  }, [selectedTheme]);

  useEffect(() => {
    if (studySession) {
      localStorage.setItem('memocard_study_session', JSON.stringify({
        queueIds: studySession.queue.map(c => c.id),
        currentIndex: studySession.currentIndex,
        showAnswer: studySession.showAnswer
      }));
    } else {
      localStorage.removeItem('memocard_study_session');
    }
  }, [studySession]);

  // Load progress and update study session dynamically when data (JSON) changes
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

    // Sync active study session queue with any modified/added/removed card contents from JSON
    setStudySession(prevSession => {
      if (!prevSession) return null;
      const updatedQueue = prevSession.queue.map(queueCard => {
        const matchingCard = hydratedCards.find(c => c.id === queueCard.id);
        // Keep the updated card data from the fresh JSON, but preserve its status in the active session
        return matchingCard ? { ...matchingCard, status: queueCard.status } : queueCard;
      });
      return {
        ...prevSession,
        queue: updatedQueue
      };
    });

    // Adjust filter ends if slides size changes
    setFilterSlideEnd(prev => {
      if (prev > data.slides.length || prev === 0) {
        return data.slides.length;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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

  // Generic study helper functions to share logic between Global/Range and Theme sessions
  const handleGradeCardGeneric = useCallback((status, session, setSession, onFinish) => {
    if (!session) return;
    
    const currentCard = session.queue[session.currentIndex];
    
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
    if (session.currentIndex + 1 < session.queue.length) {
      setSession(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showAnswer: false
      }));
    } else {
      // Session finished
      alert("¡Sesión finalizada! Buen trabajo repasando tus tarjetas.");
      setSession(null);
      if (onFinish) onFinish();
    }
  }, [cards]);

  const handleNextCardGeneric = useCallback((session, setSession) => {
    if (!session) return;
    if (session.currentIndex + 1 < session.queue.length) {
      setSession(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showAnswer: false
      }));
    } else {
      alert("¡Has llegado al final de la sesión!");
    }
  }, []);

  const handlePrevCardGeneric = useCallback((session, setSession) => {
    if (!session) return;
    if (session.currentIndex > 0) {
      setSession(prev => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
        showAnswer: false
      }));
    }
  }, []);

  // Standard/Range study helpers
  const handleGradeCard = useCallback((status) => {
    handleGradeCardGeneric(status, studySession, setStudySession, () => {
      setActiveTab('dashboard');
    });
  }, [studySession, handleGradeCardGeneric]);

  const handleNextCard = useCallback(() => handleNextCardGeneric(studySession, setStudySession), [studySession, handleNextCardGeneric]);
  const handlePrevCard = useCallback(() => handlePrevCardGeneric(studySession, setStudySession), [studySession, handlePrevCardGeneric]);

  // Theme study helpers
  const handleThemeGradeCard = useCallback((status) => {
    handleGradeCardGeneric(status, themeStudySession, setThemeStudySession, () => {
      setSelectedTheme(null);
    });
  }, [themeStudySession, handleGradeCardGeneric]);

  const handleThemeNextCard = useCallback(() => handleNextCardGeneric(themeStudySession, setThemeStudySession), [themeStudySession, handleNextCardGeneric]);
  const handleThemePrevCard = useCallback(() => handlePrevCardGeneric(themeStudySession, setThemeStudySession), [themeStudySession, handlePrevCardGeneric]);

  // Handle keyboard shortcuts during study (both Standard and Theme sessions)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isStudyTab = activeTab === 'study' && studySession;
      const isSlidesTab = activeTab === 'slides' && themeStudySession;
      if (!isStudyTab && !isSlidesTab) return;

      const currentSession = isStudyTab ? studySession : themeStudySession;
      const setCurrentSession = isStudyTab ? setStudySession : setThemeStudySession;

      const activeGradeCard = isStudyTab ? handleGradeCard : handleThemeGradeCard;
      const activePrevCard = isStudyTab ? handlePrevCard : handleThemePrevCard;
      const activeNextCard = isStudyTab ? handleNextCard : handleThemeNextCard;
      
      if (e.code === 'Space') {
        e.preventDefault();
        if (!currentSession.showAnswer) {
          setCurrentSession(prev => ({ ...prev, showAnswer: true }));
        } else {
          activeGradeCard('good');
        }
      } else if (e.key === 'a' || e.key === 'A' || e.code === 'ArrowLeft') {
        e.preventDefault();
        activePrevCard();
      } else if (e.key === 'd' || e.key === 'D' || e.code === 'ArrowRight') {
        e.preventDefault();
        activeNextCard();
      } else if (currentSession.showAnswer) {
        if (e.key === '1') activeGradeCard('again');
        else if (e.key === '2') activeGradeCard('hard');
        else if (e.key === '3') activeGradeCard('good');
        else if (e.key === '4') activeGradeCard('easy');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, studySession, themeStudySession, handleGradeCard, handlePrevCard, handleNextCard, handleThemeGradeCard, handleThemePrevCard, handleThemeNextCard]);

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
    } else if (mode === 'range') {
      filteredQueue = cards.filter(c => {
        const slideId = c.slide_id;
        return slideId >= filterSlideStart && slideId <= filterSlideEnd;
      });
      filteredQueue.sort((a, b) => a.slide_id - b.slide_id);
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
    } else if (mode === 'range') {
      finalQueue.sort((a, b) => a.slide_id - b.slide_id);
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

  const startThemeStudy = (themeName) => {
    const filteredQueue = cards.filter(c => c.theme === themeName);
    if (filteredQueue.length === 0) {
      alert("No hay tarjetas que coincidan con este tema.");
      return;
    }
    
    filteredQueue.sort((a, b) => a.slide_id - b.slide_id);
    
    setThemeStudySession({
      queue: filteredQueue,
      currentIndex: 0,
      showAnswer: false
    });
    setSelectedTheme(themeName);
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

  // Sidebar filtering and current slide helper constants removed (orphaned code cleaned)

  const renderStudySession = (session, setSession, onGrade, onPrev, onNext, onExit) => {
    return (
      <div className="study-container">
        {/* Stats header */}
        <div className="session-progress glass-panel" style={{ borderRadius: '12px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Repasando: <strong>{session.currentIndex + 1}</strong> de <strong>{session.queue.length}</strong>
          </span>
          
          <div className="progress-track">
            <div 
              className="progress-bar" 
              style={{ width: `${((session.currentIndex) / session.queue.length) * 100}%` }}
            />
          </div>

          <button 
            className="btn-secondary" 
            style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
            onClick={onExit}
          >
            Salir
          </button>
        </div>

        {/* 3D Flip Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
          {/* Left Arrow Button */}
          <button 
            className="btn-secondary" 
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            disabled={session.currentIndex === 0}
            style={{
              borderRadius: '50%',
              width: '45px',
              height: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              padding: '0',
              opacity: session.currentIndex === 0 ? 0.3 : 1,
              cursor: session.currentIndex === 0 ? 'not-allowed' : 'pointer',
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
            onClick={() => setSession(prev => ({ ...prev, showAnswer: !prev.showAnswer }))}
            style={{ flex: 1 }}
          >
            <div className={`card-rotator ${session.showAnswer ? 'flipped' : ''}`}>
              
              {/* Front Face */}
              <div className="card-face front glass-panel">
                <div className="card-header">
                  <span>Diapositiva {session.queue[session.currentIndex].slide_id}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                    {session.queue[session.currentIndex].theme || 'CONCEPTO'}
                  </span>
                </div>
                
                {session.queue[session.currentIndex].context && (
                  <div className="card-context" onClick={(e) => e.stopPropagation()}>
                    {renderMathAndMarkdown(session.queue[session.currentIndex].context)}
                  </div>
                )}
                
                <div className="card-body">
                  <div className="card-term">
                    {renderMathAndMarkdown(session.queue[session.currentIndex].term)}
                  </div>
                </div>
              </div>

              {/* Back Face */}
              <div className="card-face back glass-panel">
                <div className="card-header">
                  <span>Diapositiva {session.queue[session.currentIndex].slide_id}</span>
                  <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>RESPUESTA</span>
                </div>
                
                {session.queue[session.currentIndex].context && (
                  <div className="card-context">
                    {renderMathAndMarkdown(session.queue[session.currentIndex].context)}
                  </div>
                )}
                
                <div className="card-body" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                  <div className="card-answer">
                    {renderSlideLines(session.queue[session.currentIndex].back)}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Arrow Button */}
          <button 
            className="btn-secondary" 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            disabled={session.currentIndex === session.queue.length - 1}
            style={{
              borderRadius: '50%',
              width: '45px',
              height: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              padding: '0',
              opacity: session.currentIndex === session.queue.length - 1 ? 0.3 : 1,
              cursor: session.currentIndex === session.queue.length - 1 ? 'not-allowed' : 'pointer',
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
          {!session.showAnswer ? (
            <button 
              className="flip-prompt"
              onClick={() => setSession(prev => ({ ...prev, showAnswer: true }))}
            >
              Revelar Respuesta (Espacio)
            </button>
          ) : (
            <div className="grade-controls">
              <button className="grade-btn again" onClick={() => onGrade('again')}>
                <span>Otra Vez</span>
                <span className="shortcut">Teclado 1</span>
              </button>
              <button className="grade-btn hard" onClick={() => onGrade('hard')}>
                <span>Difícil</span>
                <span className="shortcut">Teclado 2</span>
              </button>
              <button className="grade-btn good" onClick={() => onGrade('good')}>
                <span>Bien</span>
                <span className="shortcut">Teclado 3</span>
              </button>
              <button className="grade-btn easy" onClick={() => onGrade('easy')}>
                <span>Fácil</span>
                <span className="shortcut">Teclado 4</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">

      {/* Main Navigation Menu */}
      <nav className="nav-menu" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button 
          className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('dashboard'); setStudySession(null); }}
        >
          📊 Dashboard
        </button>
        
        {/* Estudiar por Rango Tab Wrapper */}
        <div 
          className={`nav-button-group ${activeTab === 'study' ? 'active' : ''}`} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: activeTab === 'study' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)', 
            border: `1px solid ${activeTab === 'study' ? 'var(--primary)' : 'var(--border-color)'}`,
            borderRadius: '12px',
            padding: '2px 8px 2px 2px',
            transition: 'all 0.3s ease'
          }}
        >
          <button 
            className="nav-button"
            style={{ 
              border: 'none', 
              background: 'transparent', 
              boxShadow: 'none', 
              color: activeTab === 'study' ? 'var(--primary)' : 'var(--text-secondary)',
              padding: '8px 12px',
              margin: '0'
            }}
            onClick={() => {
              if (!studySession) {
                startStudy('range');
              } else {
                setActiveTab('study');
              }
            }}
          >
            🧠 Estudiar por Rango
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid var(--border-color)', paddingLeft: '8px' }}>
            <input 
              type="number" 
              min="1" 
              max={data.slides.length} 
              value={filterSlideStart} 
              onChange={e => setFilterSlideStart(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 6px', color: 'white', width: '50px', textAlign: 'center', fontSize: '0.8rem' }}
              onClick={e => e.stopPropagation()}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>a</span>
            <input 
              type="number" 
              min="1" 
              max={data.slides.length} 
              value={filterSlideEnd} 
              onChange={e => setFilterSlideEnd(Math.min(data.slides.length, parseInt(e.target.value) || data.slides.length))}
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 6px', color: 'white', width: '50px', textAlign: 'center', fontSize: '0.8rem' }}
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>

        <button 
          className={`nav-button ${activeTab === 'slides' ? 'active' : ''}`}
          onClick={() => { 
            setActiveTab('slides'); 
            setStudySession(null); 
            setSelectedTheme(null); // Reiniciar tema al entrar
          }}
        >
          📖 Estudiar por Tema
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
              renderStudySession(studySession, setStudySession, handleGradeCard, handlePrevCard, handleNextCard, () => setStudySession(null))
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

        {/* STUDY BY THEME TAB */}
        {activeTab === 'slides' && (
          selectedTheme === null ? (
            <div className="themes-grid-container glass-panel" style={{ padding: '30px', flexGrow: 1, overflowY: 'auto' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginBottom: '8px', color: 'var(--text-primary)' }}>📖 Selecciona un Tema para Estudiar</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px' }}>
                Selecciona uno de los temas del coloquio para iniciar una sesión de estudio focalizada con tarjetas memorizables.
              </p>
              
              <div className="themes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {themesList.map(theme => (
                  <div 
                    key={theme.name} 
                    className="theme-card glass-panel"
                    onClick={() => {
                      startThemeStudy(theme.name);
                    }}
                    style={{
                      padding: '20px',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.03)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(6, 182, 212, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'white', margin: '0' }}>{theme.name}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Rango: D{theme.start} a D{theme.end}</span>
                      <span>{theme.count} diapositivas</span>
                    </div>
                    
                    {/* Progress indicator */}
                    <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                        <span>Dominado:</span>
                        <strong style={{ color: 'var(--secondary)' }}>{theme.percentMastered}%</strong>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            background: 'var(--grad-secondary)', 
                            width: `${theme.percentMastered}%`,
                            transition: 'width 0.4s ease'
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            themeStudySession ? (
              renderStudySession(themeStudySession, setThemeStudySession, handleThemeGradeCard, handleThemePrevCard, handleThemeNextCard, () => {
                setThemeStudySession(null);
                setSelectedTheme(null);
              })
            ) : (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h2>Cargando sesión del tema...</h2>
                <button className="btn-primary" onClick={() => setSelectedTheme(null)} style={{ alignSelf: 'center' }}>
                  Volver a Temas
                </button>
              </div>
            )
          )
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
