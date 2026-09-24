/**
 * @file TypeAnswerBox.jsx
 * Interactive Type-in-the-Answer module with visual diff feedback for MemoCard.
 *
 * Architectural & Ergonomic Rationale:
 * - Isolation of Keyboard Events: Text inputs capture key events (Space, Enter, A, D)
 *   and explicitly stop propagation. This prevents typing answers like "automata" or "determinista"
 *   from erroneously triggering card flips or deck navigation shortcuts.
 * - Multi-stage Workflow:
 *   1. Input stage: User types answer in input field. Pressing Enter or clicking "Comprobar" submits.
 *   2. Evaluation stage: Evaluates answer against accepted variants using `validateAnswer`,
 *      computes character-level diff via `computeCharacterDiff`, and renders colored diff blocks.
 *   3. Resolution stage: Space or Enter now flips card to view complete explanation.
 * - Passive Mode Degradation: When `interactive === false`, this component cleanly unmounts or
 *   renders nothing, deferring completely to standard front/back card presentation.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { validateAnswer } from '../utils/answerValidator';
import { computeCharacterDiff } from '../utils/characterDiff';

export default function TypeAnswerBox({
  card,
  isFlipped = false,
  onFlip = () => {},
  interactive = true
}) {
  const [typedInput, setTypedInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);

  // Clear typed state whenever the active card changes
  useEffect(() => {
    setTypedInput('');
    setSubmitted(false);
  }, [card?.id]);

  // Focus input automatically on mount or card change if in front face and interactive
  useEffect(() => {
    if (interactive && !isFlipped && !submitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [interactive, isFlipped, submitted, card?.id]);

  // Determine accepted answer variants
  const acceptedAnswers = useMemo(() => {
    if (!card) return [];
    if (Array.isArray(card.answers) && card.answers.length > 0) {
      return card.answers;
    }
    if (typeof card.answer === 'string' && card.answer.trim().length > 0) {
      return [card.answer.trim()];
    }
    // Fallback: extract first line of back if no explicit answer field
    if (typeof card.back === 'string' && card.back.trim().length > 0) {
      const firstLine = card.back.split('\n')[0].replace(/^[#*->\s]+/, '').trim();
      return [firstLine];
    }
    return [];
  }, [card]);

  // Evaluation outcome
  const evaluation = useMemo(() => {
    if (!submitted) return null;
    return validateAnswer(typedInput, acceptedAnswers);
  }, [submitted, typedInput, acceptedAnswers]);

  // Diff breakdown
  const diffResult = useMemo(() => {
    if (!submitted || !evaluation) return null;
    return computeCharacterDiff(typedInput, evaluation.bestMatch);
  }, [submitted, evaluation, typedInput]);

  if (!interactive) return null;

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (submitted) {
      onFlip();
      return;
    }
    setSubmitted(true);
  };

  return (
    <div 
      className="type-answer-wrapper" 
      onClick={(e) => e.stopPropagation()}
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="type-answer-form">
          <div className="type-input-group">
            <input
              ref={inputRef}
              type="text"
              className="type-answer-input"
              placeholder="Escribe tu respuesta aquí..."
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              onKeyDown={(e) => {
                // Prevent global shortcuts while actively typing
                e.stopPropagation();
                if (e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="submit"
              className="btn-submit-answer"
              disabled={typedInput.trim().length === 0}
            >
              Comprobar
            </button>
          </div>
        </form>
      ) : (
        <div className="type-answer-feedback">
          <div className={`answer-status-badge ${evaluation?.isCorrect ? 'correct' : 'incorrect'}`}>
            {evaluation?.isCorrect ? '✓ ¡Respuesta Correcta!' : '✗ Respuesta Incorrecta'}
          </div>

          <div className="diff-display-container">
            <div className="diff-row typed-row">
              <span className="diff-label">Tu respuesta:</span>
              <span className="diff-chars">
                {diffResult?.typedSegments.map((seg, idx) => (
                  <span 
                    key={`typed-seg-${idx}`} 
                    className={`diff-char ${seg.type}`}
                  >
                    {seg.text}
                  </span>
                ))}
              </span>
            </div>

            <div className="diff-row expected-row">
              <span className="diff-label">Esperada:</span>
              <span className="diff-chars">
                {diffResult?.expectedSegments.map((seg, idx) => (
                  <span 
                    key={`exp-seg-${idx}`} 
                    className={`diff-char ${seg.type === 'missing' ? 'missing' : 'correct'}`}
                  >
                    {seg.text}
                  </span>
                ))}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-continue-card"
            onClick={(e) => {
              e.stopPropagation();
              onFlip();
            }}
          >
            Ver explicación en el dorso ↷
          </button>
        </div>
      )}
    </div>
  );
}
