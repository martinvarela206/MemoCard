/**
 * @file ClozeText.jsx
 * Interactive Cloze Deletion component for MemoCard.
 *
 * Architectural & Technical Rationale:
 * - Decouples cloze token parsing from UI presentation (SRP).
 * - Avoids full string re-renders by tokenizing input into discrete text, math, and cloze pills.
 * - Handles event propagation: clicking a cloze pill toggles its individual revealed state
 *   without bubbling to parent containers, preventing accidental card flipping (e.stopPropagation).
 * - Supports inline math ($...$) inside both standard text and hidden cloze content seamlessly.
 * - Replaces naive static regex masking with an accessible, interactive DOM structure
 *   (role="button", tabIndex=0, aria-expanded).
 */

import React from 'react';
import { parseClozeTokens } from '../utils/clozeParser';
import { renderTextWithMathAndMarkdown } from '../utils/markdownParser';

export default function ClozeText({
  text = '',
  activeClozeIndex = 1,
  revealedClozeIds = [],
  onToggleCloze = () => {},
  interactive = true,
  keyPrefix = 'cloze'
}) {
  if (!text) return null;

  const tokens = parseClozeTokens(text);
  const revealedSet = new Set(revealedClozeIds);

  return (
    <span className="cloze-container">
      {tokens.map((token, idx) => {
        const key = `${keyPrefix}_token_${idx}_${token.id || idx}`;

        // Plain text token: render with LaTeX math and markdown support
        if (token.type === 'text') {
          return (
            <React.Fragment key={key}>
              {renderTextWithMathAndMarkdown(token.content, false, `${key}_txt`)}
            </React.Fragment>
          );
        }

        // Active cloze deletion matching the tested index
        if (token.index === activeClozeIndex) {
          const isRevealed = revealedSet.has(token.id);

          if (!interactive) {
            // Non-interactive fallback: show hint or [...] placeholder
            return (
              <span key={key} className="cloze-pill static-hidden">
                {token.hint ? `[${token.hint}]` : '[...]'}
              </span>
            );
          }

          return (
            <span
              key={key}
              role="button"
              tabIndex={0}
              aria-label={isRevealed ? `Cloze revelado: ${token.hiddenText}` : `Cloze oculto: ${token.hint || 'hueco'}. Clic para revelar.`}
              aria-expanded={isRevealed}
              className={`cloze-pill ${isRevealed ? 'revealed' : 'hidden'}`}
              onClick={(e) => {
                // Prevents parent card from triggering a 3D flip when toggling cloze
                e.stopPropagation();
                onToggleCloze(token.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  e.preventDefault();
                  onToggleCloze(token.id);
                }
              }}
              title={
                isRevealed
                  ? 'Clic para volver a ocultar'
                  : token.hint
                    ? `Pista: ${token.hint} (Clic para revelar)`
                    : 'Clic o espacio para revelar'
              }
            >
              {isRevealed ? (
                <span className="cloze-revealed-content">
                  {renderTextWithMathAndMarkdown(token.hiddenText, false, `${key}_rev`)}
                </span>
              ) : (
                <span className="cloze-placeholder">
                  {token.hint ? `[${token.hint}]` : '[...]'}
                </span>
              )}
            </span>
          );
        }

        // Inactive sibling cloze: per standard Anki semantics, show plaintext to maintain grammatical coherence
        return (
          <React.Fragment key={key}>
            {renderTextWithMathAndMarkdown(token.hiddenText, false, `${key}_sibling`)}
          </React.Fragment>
        );
      })}
    </span>
  );
}
