import React from 'react';
import { SUBJECTS } from '../data/subjects';

export default function SubjectSelector({ onSelectSubject }) {
  return (
    <div className="subject-selector-container">
      <header className="selector-header">
        <div className="logo-badge">MemoCard</div>
        <h1 className="selector-title">Selecciona una Materia</h1>
        <p className="selector-subtitle">
          Elige la materia o coloquio para comenzar tu sesión de repaso con flashcards interactivas y secuenciales.
        </p>
      </header>

      <div className="subjects-grid">
        {SUBJECTS.map((subject) => {
          /* Rationale: Decks can be loaded as structured objects ({ cards, slides })
             or as direct arrays of polymorphic cards ([ card1, card2, ... ]) per json-generation-rules.
             Normalizing here prevents runtime errors and guarantees accurate count badges. */
          const rawCards = Array.isArray(subject.data) 
            ? subject.data 
            : (subject.data?.cards || subject.data?.slides || []);
          const cardsCount = rawCards.length;
          
          const rawThemes = subject.data?.slides || rawCards;
          const themesSet = new Set(rawThemes.map(s => s.theme || 'General'));
          const themesCount = themesSet.size;

          return (
            <div 
              key={subject.id} 
              className="subject-card glass-panel"
              onClick={() => onSelectSubject(subject.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSubject(subject.id);
                }
              }}
            >
              <div className="subject-card-top">
                <span className="subject-icon">{subject.icon}</span>
                <span className="subject-badge">{subject.badge}</span>
              </div>
              
              <h2 className="subject-title">{subject.title}</h2>
              <p className="subject-sub">{subject.subtitle}</p>
              <p className="subject-desc">{subject.description}</p>

              <div className="subject-meta">
                <div className="meta-item">
                  <span className="meta-value">{themesCount}</span>
                  <span className="meta-label">Temas</span>
                </div>
                <div className="meta-divider" />
                <div className="meta-item">
                  <span className="meta-value">{cardsCount}</span>
                  <span className="meta-label">Tarjetas</span>
                </div>
              </div>

              <button className="btn-enter-subject">
                <span>Ingresar a la Materia</span>
                <span className="arrow-icon">→</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
