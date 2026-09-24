/**
 * @file answerValidator.js
 * Answer validation and text normalization engine for Type-in-the-Answer interactive flashcards.
 *
 * Architectural & Algorithmic Rationale:
 * - Employs Unicode Canonical Decomposition (NFD) combined with diacritical mark stripping
 *   (/[\u0300-\u036f]/g) to allow accent-insensitive comparisons (e.g. "máquina" matches "maquina")
 *   without loss of base alphanumeric semantic content.
 * - Collapses consecutive whitespace characters into a single space and trims extremities to avoid
 *   penalizing users for unintentional typing gaps.
 * - When cards provide multiple acceptable answer variants (e.g. ["Sigma*", "Σ*", "\\Sigma^*"]),
 *   it performs multi-candidate evaluation and computes Levenshtein distance against all variants.
 *   This identifies the "closest candidate" for visual character-by-character diffing, ensuring
 *   helpful feedback rather than diffing against an arbitrary variant.
 */

/**
 * Normalizes a raw string for comparison.
 *
 * @param {string} text Input text
 * @param {Object} [options={}] Normalization configurations
 * @param {boolean} [options.caseSensitive=false] Whether case differences are strictly enforced
 * @param {boolean} [options.ignoreDiacritics=true] Whether accents/tildes are stripped
 * @param {boolean} [options.trimWhitespace=true] Whether leading/trailing whitespace is removed
 * @returns {string} Normalized string
 */
export function normalizeAnswer(text, options = {}) {
  if (typeof text !== 'string') return '';

  const {
    caseSensitive = false,
    ignoreDiacritics = true,
    trimWhitespace = true
  } = options;

  let normalized = text;

  if (trimWhitespace) {
    normalized = normalized.trim().replace(/\s+/g, ' ');
  }

  if (!caseSensitive) {
    normalized = normalized.toLowerCase();
  }

  if (ignoreDiacritics) {
    // Unicode NFD separates glyphs from accent modifiers, allowing clean removal of [\u0300-\u036f]
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  return normalized;
}

/**
 * Calculates the Levenshtein edit distance between two strings.
 * Used to identify the closest accepted answer variant for diff feedback.
 *
 * @param {string} s1 First string
 * @param {string} s2 Second string
 * @returns {number} Minimum edit distance
 */
export function calculateLevenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Validates a user input against a list of acceptable answers.
 *
 * @param {string} userInput The user's typed response
 * @param {string|Array<string>} acceptedAnswers Array of acceptable variants or single string
 * @param {Object} [options={}] Normalization options
 * @returns {Object} Validation outcome: { isCorrect, bestMatch, distance, rawInput }
 */
export function validateAnswer(userInput, acceptedAnswers, options = {}) {
  const rawInput = typeof userInput === 'string' ? userInput : '';
  const answersList = Array.isArray(acceptedAnswers)
    ? acceptedAnswers.filter(a => typeof a === 'string' && a.length > 0)
    : (typeof acceptedAnswers === 'string' && acceptedAnswers.length > 0 ? [acceptedAnswers] : []);

  if (answersList.length === 0) {
    return {
      isCorrect: false,
      bestMatch: '',
      distance: rawInput.length,
      rawInput,
      normalizedInput: normalizeAnswer(rawInput, options)
    };
  }

  const normalizedInput = normalizeAnswer(rawInput, options);

  let isCorrect = false;
  let bestMatch = answersList[0];
  let minDistance = Infinity;

  for (const answer of answersList) {
    const normalizedAns = normalizeAnswer(answer, options);

    if (normalizedInput === normalizedAns) {
      isCorrect = true;
      bestMatch = answer;
      minDistance = 0;
      break;
    }

    const dist = calculateLevenshteinDistance(normalizedInput, normalizedAns);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = answer;
    }
  }

  return {
    isCorrect,
    bestMatch,
    distance: minDistance,
    rawInput,
    normalizedInput
  };
}
