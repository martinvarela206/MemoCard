import React from 'react';
import { renderSlideLines } from '../utils/markdownParser';

export default function FlashCard({ 
  card, 
  isFlipped, 
  onFlip, 
  currentIndex, 
  totalCards 
}) {
  if (!card) return null;

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
            <span className="theme-badge">{card.theme || 'General'}</span>
            <span className="card-counter">
              {currentIndex + 1} / {totalCards}
            </span>
          </div>

          <div className="card-body front-body">
            <span className="slide-num-tag">Diapositiva #{card.slide_id || currentIndex + 1}</span>
            <h2 className="card-term">{card.term || card.front}</h2>
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
            <span className="card-mini-title">{card.term || card.front}</span>
            <span className="card-counter">
              {currentIndex + 1} / {totalCards}
            </span>
          </div>

          <div className="card-body back-body">
            <div className="card-answer">
              {renderSlideLines(card.back)}
            </div>
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
