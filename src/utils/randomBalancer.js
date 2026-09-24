/**
 * @file randomBalancer.js
 * @description Circular and session-weighted random card selection algorithm.
 * 
 * Technical Rationale:
 * Naive pseudo-random number generation (Math.random()) suffers from statistical clustering,
 * causing certain flashcards to repeat frequently while others are starved of review.
 * This module enforces a balanced circular distribution over a 1-hour session window:
 * 1. Tracks card appearance frequencies in localStorage with a 1-hour TTL.
 * 2. Uses rejection sampling where the probability of rejection and re-rolling is P = K / N
 *    (K = card appearance count, N = total deck card count).
 * 3. Once every card in the deck has appeared at least once (all counts >= 1),
 *    a baseline reduction is triggered, decrementing all counts by 1 to maintain relative weights
 *    without numeric overflow.
 * 4. A fallback to the minimum-frequency card guarantees O(1) bounded execution if max attempts are reached.
 */

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REROLL_ATTEMPTS = 40;

/**
 * Loads or initializes the random distribution session for a given subject.
 * 
 * @param {string} subjectId - The active subject identifier.
 * @returns {{ timestamp: number, counts: Record<string, number> }} Active session record.
 */
function getSessionRecord(subjectId) {
  const storageKey = `memocard_random_session_${subjectId || 'default'}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.timestamp === 'number' && parsed.counts) {
        if (Date.now() - parsed.timestamp < SESSION_TTL_MS) {
          return parsed;
        }
      }
    }
  } catch {
    // Gracefully handle localStorage corruption or private browsing quota errors
  }

  return {
    timestamp: Date.now(),
    counts: {}
  };
}

/**
 * Persists the active session record to localStorage.
 * 
 * @param {string} subjectId - The active subject identifier.
 * @param {{ timestamp: number, counts: Record<string, number> }} session - Session state.
 */
function saveSessionRecord(subjectId, session) {
  const storageKey = `memocard_random_session_${subjectId || 'default'}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(session));
  } catch {
    // Fail silently if storage quota is exceeded
  }
}

/**
 * Selects the next card index using circular, session-weighted rejection sampling.
 * 
 * @param {Array<object>} cards - List of cards in the active deck.
 * @param {number} currentIndex - Index of currently displayed card.
 * @param {string} subjectId - Active subject identifier.
 * @returns {number} The chosen card index.
 */
export function getNextBalancedRandomCardIndex(cards, currentIndex, subjectId) {
  if (!cards || cards.length === 0) return 0;
  if (cards.length === 1) return 0;

  const totalCards = cards.length;
  const session = getSessionRecord(subjectId);

  // Exclude current card from candidate pool to ensure navigation advances
  const candidateIndices = [];
  for (let i = 0; i < totalCards; i += 1) {
    if (i !== currentIndex) {
      candidateIndices.push(i);
    }
  }

  const pool = candidateIndices.length > 0 ? candidateIndices : [0];

  let selectedIndex = -1;

  // Rejection sampling loop
  for (let attempt = 0; attempt < MAX_REROLL_ATTEMPTS; attempt += 1) {
    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    const candidateCard = cards[randomPick];
    const cardId = candidateCard?.id || String(randomPick);
    const count = session.counts[cardId] || 0;

    // Rejection probability: P = min(1, count / totalCards)
    const rejectionThreshold = Math.min(1, count / totalCards);
    const roll = Math.random();

    // If roll is greater than or equal to rejectionThreshold, candidate is accepted
    if (roll >= rejectionThreshold) {
      selectedIndex = randomPick;
      break;
    }
  }

  // Fallback: If rejection sampling exhausted attempts, select candidate with lowest count
  if (selectedIndex === -1) {
    let minCount = Infinity;
    let bestPick = pool[0];
    for (const idx of pool) {
      const cid = cards[idx]?.id || String(idx);
      const c = session.counts[cid] || 0;
      if (c < minCount) {
        minCount = c;
        bestPick = idx;
      }
    }
    selectedIndex = bestPick;
  }

  // Register presentation of selected card
  const chosenCard = cards[selectedIndex];
  const chosenCardId = chosenCard?.id || String(selectedIndex);
  session.counts[chosenCardId] = (session.counts[chosenCardId] || 0) + 1;

  // Baseline reduction: when every card in the deck has count >= 1, decrement all by 1
  let allCardsShown = true;
  for (const card of cards) {
    const cid = card.id || '';
    if ((session.counts[cid] || 0) < 1) {
      allCardsShown = false;
      break;
    }
  }

  if (allCardsShown) {
    for (const card of cards) {
      const cid = card.id || '';
      if (session.counts[cid]) {
        session.counts[cid] -= 1;
        if (session.counts[cid] <= 0) {
          delete session.counts[cid];
        }
      }
    }
  }

  session.timestamp = Date.now();
  saveSessionRecord(subjectId, session);

  return selectedIndex;
}
