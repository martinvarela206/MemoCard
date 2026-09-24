import React, { useEffect, useMemo, useRef, useState } from 'react';
import { renderTextWithMathAndMarkdown } from '../utils/markdownParser';

/**
 * StudyDrawer component provides thematic accordion navigation, transversal tag filtering,
 * and sequential step identification for deep navigation across study decks.
 *
 * Rationale:
 * - Enables jump-to navigation grouped by syllabus theme (SRP).
 * - Transversal tag filtering allows cross-cutting review (e.g. #examen, #definicion).
 * - Sequence badges clarify multi-step derivations directly in the index list.
 */
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
  // Selected transversal tag for filtering cards (null = all cards)
  const [selectedTag, setSelectedTag] = useState(null);

  const toggleThemeCollapse = (themeName) => {
    setCollapsedThemes(prev => ({
      ...prev,
      [themeName]: !prev[themeName]
    }));
  };

  // Extract all unique tags across cards for the transversal filter bar
  const allTags = useMemo(() => {
    const tagSet = new Set();
    cards.forEach(card => {
      if (card.tags && Array.isArray(card.tags)) {
        card.tags.forEach(t => tagSet.add(t));
      }
    });
    return Array.from(tagSet).sort();
  }, [cards]);

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
              <span className="drawer-subtitle">
                {selectedTag ? `Filtrando por #${selectedTag}` : `${cards.length} tarjetas secuenciales`}
              </span>
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

        {/* Transversal Tag Filtering Bar */}
        {allTags.length > 0 && (
          <div className="drawer-tags-bar" role="region" aria-label="Filtrado transversal por etiquetas">
            <div className="drawer-tags-scroll">
              <button 
                type="button"
                className={`drawer-tag-chip ${selectedTag === null ? 'active' : ''}`}
                onClick={() => setSelectedTag(null)}
              >
                Todas ({cards.length})
              </button>
              {allTags.map(tag => {
                const count = cards.filter(c => c.tags && c.tags.includes(tag)).length;
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`drawer-tag-chip ${selectedTag === tag ? 'active' : ''}`}
                    onClick={() => setSelectedTag(prev => prev === tag ? null : tag)}
                  >
                    #{tag} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="drawer-content">
          {themesList.map((theme) => {
            const isCollapsed = !!collapsedThemes[theme.name];
            const themeCards = cards
              .map((card, idx) => ({ ...card, globalIndex: idx }))
              .filter(card => {
                const matchesTheme = (card.theme || 'Sin Tema') === theme.name;
                const matchesTag = !selectedTag || (card.tags && card.tags.includes(selectedTag));
                return matchesTheme && matchesTag;
              });

            // If a tag filter is active and this theme has no matching cards, omit it
            if (selectedTag && themeCards.length === 0) return null;

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
                          <div className="card-item-left">
                            <span className="card-item-num">#{card.slide_id || card.globalIndex + 1}</span>
                            <div className="card-item-info">
                              {/* Rationale: Card titles in technical decks embed math symbols (e.g. $\Sigma$, $w_1 = w_2$).
                                 Using renderTextWithMathAndMarkdown ensures KaTeX symbols render cleanly in drawer items. */}
                              <span className="card-item-title">
                                {renderTextWithMathAndMarkdown(card.term || card.front, false, `d_title_${card.id}`)}
                              </span>
                              {(card.subtheme || card.sequence) && (
                                <div className="card-item-meta">
                                  {card.subtheme && (
                                    <span className="drawer-subtheme-chip">
                                      {renderTextWithMathAndMarkdown(card.subtheme, false, `d_sub_${card.id}`)}
                                    </span>
                                  )}
                                  {card.sequence && (
                                    <span className="drawer-sequence-chip">
                                      Paso {card.sequence.step}{card.sequence.total ? `/${card.sequence.total}` : ''}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
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
