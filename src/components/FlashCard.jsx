import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { renderSlideLines } from '../utils/markdownParser';
import { renderClozeBackText, hasClozeSyntax, parseClozeTokens } from '../utils/clozeParser';
import ClozeText from './ClozeText';
import CardMedia from './CardMedia';

/**
 * FlashCard Component
 * 
 * Architectural Rationale:
 * - Employs a 3D flip card paradigm with accessibility attributes (role="button", tabIndex=0).
 * - Implements progressive cloze revelation: when unrevealed cloze tokens exist on the front face,
 *   pressing the spacebar or enter key reveals the next hidden token sequentially. Volumetric card flip
 *   occurs only after all active clozes have been revealed or if the card is already in the back face.
 * - Local state `revealedClozeIds` is purged upon card transition to prevent state leakage across slides.
 */
export default function FlashCard({ 
  card, 
  isFlipped, 
  onFlip, 
  currentIndex, 
  totalCards 
}) {
  const [revealedClozeIds, setRevealedClozeIds] = useState([]);

  // Reset cloze reveal state upon navigating to a new card
  useEffect(() => {
    setRevealedClozeIds([]);
  }, [card?.id, currentIndex]);

  const rawFront = useMemo(() => {
    if (!card) return '';
    return card.term || card.front || '';
  }, [card]);

  const isClozeCard = useMemo(() => {
    if (!card) return false;
    return card.type === 'cloze' || hasClozeSyntax(rawFront);
  }, [card, rawFront]);

  const activeClozeIndex = card?.activeClozeIndex || 1;

  // Active cloze tokens belonging to the currently tested index
  const activeClozeTokens = useMemo(() => {
    if (!isClozeCard || !rawFront) return [];
    return parseClozeTokens(rawFront).filter(
      t => t.type === 'cloze' && t.index === activeClozeIndex
    );
  }, [isClozeCard, rawFront, activeClozeIndex]);

  // Toggle individual cloze token visibility without triggering card flip
  const handleToggleCloze = useCallback((clozeId) => {
    setRevealedClozeIds(prev => 
      prev.includes(clozeId) ? prev.filter(id => id !== clozeId) : [...prev, clozeId]
    );
  }, []);

  // Keyboard accessibility and progressive reveal handler
  const handleKeyDown = useCallback((e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();

      // If on front face and there are unrevealed clozes, reveal the first hidden one
      if (!isFlipped && activeClozeTokens.length > 0) {
        const nextHidden = activeClozeTokens.find(t => !revealedClozeIds.includes(t.id));
        if (nextHidden) {
          handleToggleCloze(nextHidden.id);
          return;
        }
      }

      // If all clozes are revealed or not a cloze card, execute standard card flip
      onFlip();
      return;
    }

    // Number keys (1-9) toggle matching cloze items
    if (/^[1-9]$/.test(e.key) && !isFlipped && activeClozeTokens.length > 0) {
      const targetIdx = parseInt(e.key, 10) - 1;
      if (targetIdx >= 0 && targetIdx < activeClozeTokens.length) {
        e.preventDefault();
        handleToggleCloze(activeClozeTokens[targetIdx].id);
      }
    }
  }, [isFlipped, activeClozeTokens, revealedClozeIds, handleToggleCloze, onFlip]);

  const displayBack = useMemo(() => {
    if (!card) return '';
    const raw = card.back || '';
    if (isClozeCard) {
      return renderClozeBackText(raw, activeClozeIndex);
    }
    return raw;
  }, [card, isClozeCard, activeClozeIndex]);

  if (!card) return null;

  const frontMedia = (card.media || []).filter(m => m.placement === 'front' || m.placement === 'both');
  const backMedia = (card.media || []).filter(m => m.placement === 'back' || m.placement === 'both');

  return (
    <div 
      className="card-perspective" 
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-label={`Tarjeta ${currentIndex + 1} de ${totalCards}: ${card.term}. Haz clic o presiona espacio para revelar clozes o voltear.`}
      onKeyDown={handleKeyDown}
    >
      <div className={`card-rotator ${isFlipped ? 'flipped' : ''}`}>
        {/* Lado Frontal (Front) */}
        <div className="card-face front">
          <div className="card-header">
            <div className="card-theme-cluster">
              <span className="theme-badge">{card.theme || 'General'}</span>
              {card.subtheme && (
                <span className="subtheme-badge">{card.subtheme}</span>
              )}
              {card.sequence && (
                <span className="sequence-badge" title="Concepto encadenado o derivación en pasos">
                  Paso {card.sequence.step}{card.sequence.total ? ` de ${card.sequence.total}` : ''}
                </span>
              )}
              {isClozeCard && (
                <span className="cloze-badge" title={`Tarjeta cloze hueco c${activeClozeIndex} de ${card.clozeTotal || 1}`}>
                  Cloze [c{activeClozeIndex}]
                </span>
              )}
            </div>
            <span className="card-counter">
              {currentIndex + 1} / {totalCards}
            </span>
          </div>

          <div className="card-body front-body">
            <span className="slide-num-tag">Diapositiva #{card.slide_id || currentIndex + 1}</span>
            <h2 className="card-term">
              {isClozeCard ? (
                <ClozeText 
                  text={rawFront}
                  activeClozeIndex={activeClozeIndex}
                  revealedClozeIds={revealedClozeIds}
                  onToggleCloze={handleToggleCloze}
                />
              ) : (
                rawFront
              )}
            </h2>

            {frontMedia.map((asset, idx) => (
              <CardMedia key={`front-media-${idx}`} asset={asset} className="card-front-media" />
            ))}

            {card.tags && card.tags.length > 0 && (
              <div className="card-tags-list">
                {card.tags.map((tag) => (
                  <span key={tag} className="card-tag-pill">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="card-footer">
            <span className="flip-hint">
              {isClozeCard && activeClozeTokens.some(t => !revealedClozeIds.includes(t.id)) ? (
                <>
                  <span className="flip-icon">👁️</span> Presiona <kbd>Espacio</kbd> o haz clic en la censura para revelar
                </>
              ) : (
                <>
                  <span className="flip-icon">↷</span> Haz clic o presiona <kbd>Espacio</kbd> para ver la definición
                </>
              )}
            </span>
          </div>
        </div>

        {/* Lado Trasero (Back) */}
        <div className="card-face back">
          <div className="card-header">
            <div className="card-back-header-left">
              <span className="card-mini-title">
                {isClozeCard ? (
                  <ClozeText 
                    text={rawFront}
                    activeClozeIndex={activeClozeIndex}
                    revealedClozeIds={activeClozeTokens.map(t => t.id)}
                    interactive={false}
                  />
                ) : (
                  rawFront
                )}
              </span>
              {card.sequence && (
                <span className="sequence-badge mini">
                  Paso {card.sequence.step}
                </span>
              )}
              {isClozeCard && (
                <span className="cloze-badge mini">
                  [c{activeClozeIndex}]
                </span>
              )}
            </div>
            <span className="card-counter">
              {currentIndex + 1} / {totalCards}
            </span>
          </div>

          <div className="card-body back-body">
            <div className="card-answer">
              {renderSlideLines(displayBack)}
            </div>
            {backMedia.map((asset, idx) => (
              <CardMedia key={`back-media-${idx}`} asset={asset} className="card-back-media" />
            ))}
          </div>

          <div className="card-footer">
            <span className="flip-hint">
              <span className="flip-icon">↶</span> Haz clic para volver al frente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
