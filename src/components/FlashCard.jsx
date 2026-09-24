import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { renderSlideLines } from '../utils/markdownParser';
import { renderClozeBackText, hasClozeSyntax, parseClozeTokens } from '../utils/clozeParser';
import ClozeText from './ClozeText';
import TypeAnswerBox from './TypeAnswerBox';
import ImageOcclusion from './ImageOcclusion';
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
 * - Supports polymorphic card layouts: basic, cloze, input, and image_occlusion.
 */
export default function FlashCard({ 
  card, 
  isFlipped, 
  onFlip, 
  currentIndex, 
  totalCards,
  interactiveMode = true
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

      // Progressive cloze reveal is only active in interactive mode on the front face
      if (interactiveMode && !isFlipped && activeClozeTokens.length > 0) {
        const nextHidden = activeClozeTokens.find(t => !revealedClozeIds.includes(t.id));
        if (nextHidden) {
          handleToggleCloze(nextHidden.id);
          return;
        }
      }

      // If all clozes are revealed, mode is classic, or not a cloze card: standard card flip
      onFlip();
      return;
    }

    // Number keys (1-9) toggle matching cloze items in interactive mode
    if (interactiveMode && /^[1-9]$/.test(e.key) && !isFlipped && activeClozeTokens.length > 0) {
      const targetIdx = parseInt(e.key, 10) - 1;
      if (targetIdx >= 0 && targetIdx < activeClozeTokens.length) {
        e.preventDefault();
        handleToggleCloze(activeClozeTokens[targetIdx].id);
      }
    }
  }, [interactiveMode, isFlipped, activeClozeTokens, revealedClozeIds, handleToggleCloze, onFlip]);

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
      aria-label={`Tarjeta ${currentIndex + 1} de ${totalCards}: ${card.term}. Haz clic o presiona espacio para voltear.`}
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
              {card.type === 'input' && (
                <span className="input-card-badge" title="Tarjeta interactiva con entrada de texto">
                  ⌨️ Input
                </span>
              )}
              {card.type === 'image_occlusion' && (
                <span className="occlusion-card-badge" title="Tarjeta interactiva de oclusión de imágenes">
                  🫀 Oclusión
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
                  interactive={interactiveMode}
                />
              ) : (
                rawFront
              )}
            </h2>

            {card.type === 'input' && (
              <TypeAnswerBox 
                card={card}
                isFlipped={isFlipped}
                onFlip={onFlip}
                interactive={interactiveMode}
              />
            )}

            {card.type === 'image_occlusion' && (
              <ImageOcclusion
                card={card}
                isBackFace={false}
                interactive={interactiveMode}
                onFlip={onFlip}
              />
            )}

            {card.type !== 'image_occlusion' && frontMedia.map((asset, idx) => (
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
              {card.type === 'image_occlusion' ? (
                <>
                  <span className="flip-icon">🫀</span> Haz clic en una máscara para revelarla, o presiona <kbd>Espacio</kbd> para voltear
                </>
              ) : card.type === 'input' && interactiveMode ? (
                <>
                  <span className="flip-icon">⌨️</span> Escribe tu respuesta y presiona <kbd>Enter</kbd> para comprobar
                </>
              ) : interactiveMode && isClozeCard && activeClozeTokens.some(t => !revealedClozeIds.includes(t.id)) ? (
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
              {card.type === 'image_occlusion' && (
                <span className="occlusion-card-badge mini">
                  🫀 Esquema Resuelto
                </span>
              )}
            </div>
            <span className="card-counter">
              {currentIndex + 1} / {totalCards}
            </span>
          </div>

          <div className="card-body back-body">
            {card.type === 'image_occlusion' && (
              <ImageOcclusion
                card={card}
                isBackFace={true}
                interactive={interactiveMode}
                onFlip={onFlip}
              />
            )}

            <div className="card-answer">
              {renderSlideLines(displayBack)}
            </div>

            {card.type !== 'image_occlusion' && backMedia.map((asset, idx) => (
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
