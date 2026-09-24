import React from 'react';
import { renderSlideLines } from '../utils/markdownParser';
import CardMedia from './CardMedia';

export default function FlashCard({ 
  card, 
  isFlipped, 
  onFlip, 
  currentIndex, 
  totalCards 
}) {
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
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onFlip();
        }
      }}
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
            </div>
            <span className="card-counter">
              {currentIndex + 1} / {totalCards}
            </span>
          </div>

          <div className="card-body front-body">
            <span className="slide-num-tag">Diapositiva #{card.slide_id || currentIndex + 1}</span>
            <h2 className="card-term">{card.term || card.front}</h2>
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
              <span className="flip-icon">↷</span> Haz clic o presiona <kbd>Espacio</kbd> para ver la definición
            </span>
          </div>
        </div>

        {/* Lado Trasero (Back) */}
        <div className="card-face back">
          <div className="card-header">
            <div className="card-back-header-left">
              <span className="card-mini-title">{card.term || card.front}</span>
              {card.sequence && (
                <span className="sequence-badge mini">
                  Paso {card.sequence.step}
                </span>
              )}
            </div>
            <span className="card-counter">
              {currentIndex + 1} / {totalCards}
            </span>
          </div>

          <div className="card-body back-body">
            <div className="card-answer">
              {renderSlideLines(card.back)}
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
