/**
 * @file clozeParser.js
 * Anki-compatible Cloze Deletion parser and AST generator for MemoCard.
 *
 * Syntax specifications:
 * - Single deletion: {{c1::hidden_text}}
 * - Deletion with hint: {{c1::hidden_text::custom_hint}}
 * - Multiple same index: {{c1::hidden_1}} and {{c1::hidden_2}} reveal simultaneously.
 * - Multiple distinct indices: {{c1::text_1}} and {{c2::text_2}} generate distinct sub-cards (c1, c2)
 *   or support sequential progressive revelation.
 *
 * Rationale:
 * - Employs a non-greedy regex with optional hint group: /\{\{c(\d+)::(.*?)(?:::([^}]*?))?\}\}/g
 * - Deconstructs input strings into an array of typed tokens ('text' | 'cloze') to prevent
 *   string slicing anomalies, preserve whitespace, and support nesting with math or markdown.
 * - Follows standard Anki semantics: when generating a card for active index cN, other clozes (cM, M!=N)
 *   are rendered as plain unmasked text so the question prompt remains grammatically coherent.
 */

export const CLOZE_PREFIX_REGEX = /\{\{c(\d+)::/g;

/**
 * Checks whether a given string contains any Anki cloze syntax patterns.
 * Validates the strict prefix `{{c\d+::` to prevent false matches with standard LaTeX double braces.
 *
 * @param {string} text Input text string
 * @returns {boolean} True if cloze pattern exists
 */
export function hasClozeSyntax(text) {
  if (typeof text !== 'string' || text.length === 0) return false;
  CLOZE_PREFIX_REGEX.lastIndex = 0;
  return CLOZE_PREFIX_REGEX.test(text);
}

/**
 * Parses a string into an Abstract Syntax Tree (AST) array of tokens using balanced brace scanning.
 *
 * Algorithmic & Engineering Rationale:
 * - Naive non-greedy regexes (`/\{\{c(\d+)::(.*?)\}\}/`) fail catastrophically when clozes
 *   contain nested LaTeX formulas like `{{c1::\frac{a}{b}}}` or `{{c1::\mathbf{{a_i}}}}`, because
 *   the first inner closing brace `}` immediately terminates the regex match prematurely.
 * - This scanner detects the strict prefix `{{c\d+::` and maintains an internal `braceDepth` counter
 *   for all nested `{` and `}` characters.
 * - Cloze termination `}}` is only recognized when `braceDepth === 0`, ensuring complete preservation
 *   of complex mathematical expressions and preventing syntax leakage.
 *
 * Tokens:
 * - TextToken:  { type: 'text', content: string }
 * - ClozeToken: { type: 'cloze', index: number, hiddenText: string, hint: string | null, raw: string, id: string }
 *
 * @param {string} text Text containing optional cloze syntax
 * @returns {Array<Object>} List of typed tokens
 */
export function parseClozeTokens(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return [{ type: 'text', content: text || '' }];
  }

  const tokens = [];
  let lastIndex = 0;
  let counter = 0;
  CLOZE_PREFIX_REGEX.lastIndex = 0;

  let match;
  while ((match = CLOZE_PREFIX_REGEX.exec(text)) !== null) {
    const startIndex = match.index;
    const index = parseInt(match[1], 10);
    let i = CLOZE_PREFIX_REGEX.lastIndex;
    let braceDepth = 0;
    let separatorIndex = -1;
    let endIndex = -1;

    // Scan forward with balanced brace awareness
    while (i < text.length) {
      if (braceDepth === 0 && text[i] === '}' && text[i + 1] === '}') {
        endIndex = i;
        break;
      }

      if (text[i] === '{') {
        braceDepth++;
      } else if (text[i] === '}') {
        if (braceDepth > 0) braceDepth--;
      } else if (braceDepth === 0 && separatorIndex === -1 && text[i] === ':' && text[i + 1] === ':') {
        separatorIndex = i;
        i += 2;
        continue;
      }
      i++;
    }

    if (endIndex !== -1) {
      // Push preceding plain text segment if non-empty
      if (startIndex > lastIndex) {
        tokens.push({
          type: 'text',
          content: text.slice(lastIndex, startIndex)
        });
      }

      const fullMatch = text.slice(startIndex, endIndex + 2);
      let hiddenText = '';
      let hint = null;

      if (separatorIndex !== -1) {
        hiddenText = text.slice(match.index + match[0].length, separatorIndex);
        hint = text.slice(separatorIndex + 2, endIndex);
      } else {
        hiddenText = text.slice(match.index + match[0].length, endIndex);
      }

      tokens.push({
        type: 'cloze',
        index,
        hiddenText,
        hint,
        raw: fullMatch,
        id: `cloze-${index}-${counter++}`
      });

      lastIndex = endIndex + 2;
      CLOZE_PREFIX_REGEX.lastIndex = lastIndex;
    }
  }

  // Push remaining trailing text if any
  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  return tokens;
}

export const CLOZE_REGEX = CLOZE_PREFIX_REGEX;

/**
 * Extracts all unique cloze indices present in a text or array of texts, sorted ascending.
 * Example: "text {{c2::foo}} and {{c1::bar}}" -> [1, 2]
 *
 * @param {string|Array<string>} input Text or array of strings
 * @returns {Array<number>} Sorted unique numeric indices
 */
export function getClozeIndices(input) {
  const texts = Array.isArray(input) ? input : [input];
  const indicesSet = new Set();

  texts.forEach(str => {
    if (typeof str !== 'string') return;
    CLOZE_PREFIX_REGEX.lastIndex = 0;
    let match;
    while ((match = CLOZE_PREFIX_REGEX.exec(str)) !== null) {
      const idx = parseInt(match[1], 10);
      if (!Number.isNaN(idx)) {
        indicesSet.add(idx);
      }
    }
  });

  return Array.from(indicesSet).sort((a, b) => a - b);
}

/**
 * Transforms cloze tokens into a string for the Front face of a flashcard.
 *
 * Behavior:
 * - If token is active (token.index === activeIndex):
 *   Replaced with masked placeholder: `[${token.hint || '...'}]`.
 * - If token is inactive (token.index !== activeIndex):
 *   Exposed as plain hiddenText so the sentence remains legible and grammatical.
 *
 * @param {string} text Text containing cloze markup
 * @param {number} [activeClozeIndex=1] The cloze index currently being tested
 * @param {Object} [options={}] Custom mask placeholder options
 * @returns {string} Processed text for front face
 */
export function renderClozeFrontText(text, activeClozeIndex = 1, options = {}) {
  const { placeholder = null } = options;
  const tokens = parseClozeTokens(text);

  return tokens.map(token => {
    if (token.type === 'text') return token.content;

    // Active cloze deletion
    if (token.index === activeClozeIndex) {
      if (placeholder) return placeholder;
      return token.hint ? `[${token.hint}]` : '[...]';
    }

    // Inactive sibling cloze: reveal plain text per Anki standard specification
    return token.hiddenText;
  }).join('');
}

/**
 * Transforms cloze tokens into a string for the Back face of a flashcard.
 *
 * Behavior:
 * - If token is active (token.index === activeIndex):
 *   Rendered with markdown bold emphasis `**hiddenText**` or custom wrapper.
 * - If token is inactive:
 *   Rendered as plain hiddenText.
 *
 * @param {string} text Text containing cloze markup
 * @param {number} [activeClozeIndex=1] The cloze index currently being tested
 * @returns {string} Processed text for back face with active answer emphasized
 */
export function renderClozeBackText(text, activeClozeIndex = 1) {
  const tokens = parseClozeTokens(text);

  return tokens.map(token => {
    if (token.type === 'text') return token.content;

    if (token.index === activeClozeIndex) {
      // Highlight active answer with markdown bold emphasis
      return `**${token.hiddenText}**`;
    }

    return token.hiddenText;
  }).join('');
}

/**
 * Renders classical fallback mode text (completely non-interactive static representation).
 *
 * Behavior:
 * - Front: All clozes replaced by `[hint]` or `[...]`.
 * - Back: All clozes replaced by emphasized `**hiddenText**`.
 *
 * @param {string} text Text containing cloze markup
 * @param {boolean} isFront True for front face, false for back face
 * @returns {string} Transformed fallback string
 */
export function renderClassicalClozeFallback(text, isFront) {
  const tokens = parseClozeTokens(text);

  return tokens.map(token => {
    if (token.type === 'text') return token.content;

    if (isFront) {
      return token.hint ? `[${token.hint}]` : '[...]';
    }

    return `**${token.hiddenText}**`;
  }).join('');
}

/**
 * Expands cards containing multiple distinct cloze indices (c1, c2, etc.) into discrete sub-cards.
 *
 * Anki Cloze Sub-card Generation Rule:
 * - If card has no cloze syntax or only 1 index (e.g. all c1): returns the card with activeClozeIndex = 1.
 * - If card has N distinct indices ([1, 2, ...]): generates N sub-cards with unique IDs
 *   (`${card.id}_c1`, `${card.id}_c2`), each targeting its respective activeClozeIndex.
 * - Cards with identical cloze indices (c1, c1) remain a single card, revealing both targets simultaneously.
 *
 * @param {Array<Object>} cards Normalized cards array
 * @returns {Array<Object>} Expanded cards array with cloze sub-cards where applicable
 */
export function expandClozeCards(cards) {
  if (!Array.isArray(cards)) return [];

  const expanded = [];

  cards.forEach(card => {
    // Check if card contains clozes in front, back, or context
    const cardTextSources = [card.front, card.term, card.back].filter(Boolean);
    const indices = getClozeIndices(cardTextSources);

    // If not a cloze card or only contains a single index (or none)
    if (card.type !== 'cloze' && indices.length === 0) {
      expanded.push(card);
      return;
    }

    // Default to index 1 if no explicit index found
    const targetIndices = indices.length > 0 ? indices : [1];

    if (targetIndices.length === 1) {
      expanded.push({
        ...card,
        type: 'cloze',
        activeClozeIndex: targetIndices[0],
        clozeTotal: 1
      });
      return;
    }

    // Multiple distinct indices (e.g., c1, c2): generate discrete Anki sub-cards
    targetIndices.forEach((clozeIdx) => {
      expanded.push({
        ...card,
        id: `${card.id}_c${clozeIdx}`,
        parentCardId: card.id,
        type: 'cloze',
        activeClozeIndex: clozeIdx,
        clozeTotal: targetIndices.length,
        subtheme: card.subtheme || `Hueco [c${clozeIdx}]`
      });
    });
  });

  return expanded;
}
