import React, { useEffect, useRef, useState } from 'react';

export default function StudyDrawer({ 
  isOpen, 
  onClose, 
  themesList, 
  cards, 
  currentCardIndex, 
  onSelectCard 
}) {
  const activeItemRef = useRef(null);
  // Keep track of which themes are expanded (all expanded by default)
  const [collapsedThemes, setCollapsedThemes] = useState({});

  const toggleThemeCollapse = (themeName) => {
    setCollapsedThemes(prev => ({
      ...prev,
      [themeName]: !prev[themeName]
    }));
  };

  // Scroll active item into view when drawer opens or currentCard changes
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isOpen, currentCardIndex]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside 
        className="study-drawer" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Temario y Tarjetas"
      >
        <div className="drawer-header">
          <div className="drawer-title-box">
            <span className="drawer-icon">📚</span>
            <div>
              <h3 className="drawer-title">Temario y Tarjetas</h3>
              <span className="drawer-subtitle">{cards.length} tarjetas secuenciales</span>
            </div>
          </div>
          <button 
            className="drawer-close-btn" 
            onClick={onClose}
            aria-label="Cerrar drawer"
          >
            ✕
          </button>
        </div>

        <div className="drawer-content">
          {themesList.map((theme) => {
            const isCollapsed = !!collapsedThemes[theme.name];
            const themeCards = cards
              .map((card, idx) => ({ ...card, globalIndex: idx }))
              .filter(card => (card.theme || 'Sin Tema') === theme.name);

            return (
              <div key={theme.name} className="drawer-theme-group">
                <button 
                  className="drawer-theme-header" 
                  onClick={() => toggleThemeCollapse(theme.name)}
                >
                  <span className="collapse-arrow">{isCollapsed ? '▶' : '▼'}</span>
                  <span className="theme-name">{theme.name}</span>
                  <span className="theme-card-count">{themeCards.length}</span>
                </button>

                {!isCollapsed && (
                  <ul className="drawer-cards-list">
                    {themeCards.map((card) => {
                      const isActive = card.globalIndex === currentCardIndex;
                      return (
                        <li 
                          key={card.id}
                          ref={isActive ? activeItemRef : null}
                          className={`drawer-card-item ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            onSelectCard(card.globalIndex);
                          }}
                        >
                          <span className="card-item-num">#{card.slide_id || card.globalIndex + 1}</span>
                          <span className="card-item-title">{card.term || card.front}</span>
                          {isActive && <span className="active-dot" title="Tarjeta actual" />}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
