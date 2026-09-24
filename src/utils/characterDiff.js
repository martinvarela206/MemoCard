/**
 * @file characterDiff.js
 * Anki-style visual character-by-character diff algorithm for flashcards.
 *
 * Algorithmic Rationale:
 * - Employs dynamic programming to compute the Longest Common Subsequence (LCS) matrix
 *   between the user's typed string and the closest accepted canonical answer.
 * - Backtracking through the LCS matrix produces an optimal sequence alignment:
 *   - 'correct': Characters present in both strings at corresponding positions (rendered green).
 *   - 'extra' / 'wrong': Extraneous or incorrect characters typed by the user (rendered red with strikethrough).
 *   - 'missing': Characters required by the canonical answer that the user omitted (rendered in the target row).
 * - Avoids naive index-by-index comparison, which catastrophically breaks whenever a user
 *   accidentally adds or omits a single letter at the beginning of a word.
 */

/**
 * Computes character alignment between typed string and expected canonical string.
 *
 * @param {string} typed The user's typed answer
 * @param {string} expected The expected canonical answer
 * @returns {Object} Structured diff containing { typedSegments, expectedSegments, isExactMatch }
 */
export function computeCharacterDiff(typed = '', expected = '') {
  const s1 = typeof typed === 'string' ? typed : '';
  const s2 = typeof expected === 'string' ? expected : '';

  if (s1 === s2) {
    return {
      isExactMatch: true,
      typedSegments: [{ type: 'correct', text: s1 }],
      expectedSegments: [{ type: 'correct', text: s2 }]
    };
  }

  const m = s1.length;
  const n = s2.length;

  // 1. Build Longest Common Subsequence (LCS) table
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 2. Backtrack from (m, n) to determine character classifications
  const typedDiff = [];
  const expectedDiff = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase()) {
      typedDiff.unshift({ type: 'correct', char: s1[i - 1] });
      expectedDiff.unshift({ type: 'correct', char: s2[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Missing in typed: exists only in expected
      expectedDiff.unshift({ type: 'missing', char: s2[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      // Extra / wrong in typed: does not exist in expected
      typedDiff.unshift({ type: 'wrong', char: s1[i - 1] });
      i--;
    }
  }

  // 3. Compact consecutive character tokens of the same type into contiguous segments
  const compactSegments = (tokens) => {
    if (tokens.length === 0) return [];
    const segments = [];
    let current = { type: tokens[0].type, text: tokens[0].char };

    for (let k = 1; k < tokens.length; k++) {
      if (tokens[k].type === current.type) {
        current.text += tokens[k].char;
      } else {
        segments.push(current);
        current = { type: tokens[k].type, text: tokens[k].char };
      }
    }
    segments.push(current);
    return segments;
  };

  return {
    isExactMatch: false,
    typedSegments: compactSegments(typedDiff),
    expectedSegments: compactSegments(expectedDiff)
  };
}
