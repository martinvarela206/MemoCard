/**
 * @file storageManager.js
 * Centralized, robust offline persistence engine for MemoCard using namespaced Web Storage.
 * Manages subject progress, SRS scheduling, review history, and longitudinal retention metrics.
 *
 * Technical & Reliability Rationale:
 * - Isolation & Namespacing: All keys use the standard prefix `memocard_v1:` to avoid collisions
 *   with other origin applications or outdated schema versions.
 * - Defensive Error Handling: Web Storage access can fail due to private browsing restrictions,
 *   quota exhaustion, or corrupted JSON. All operations wrap in try/catch blocks with in-memory fallbacks.
 * - Metacognitive Metrics Calculation:
 *   - Mature Cards: Anki convention where interval >= 21 days represents solidified long-term memory.
 *   - Retention Rate: Percentage of successful recalls (ratings 2, 3, 4) versus total review attempts.
 *   - Review Streaks: Consecutive daily study sessions tracked via UTC calendar dates.
 */

const STORAGE_PREFIX = 'memocard_v1:';

const KEYS = {
  THEME: `${STORAGE_PREFIX}theme`,
  SELECTED_SUBJECT: `${STORAGE_PREFIX}selected_subject`,
  INTERACTIVE_MODE: `${STORAGE_PREFIX}interactive_mode`,
  GUIDED_MODE: `${STORAGE_PREFIX}guided_mode`,
  SUBJECT_CARD_INDEX: (subjectId) => `${STORAGE_PREFIX}idx:${subjectId}`,
  SUBJECT_SRS: (subjectId) => `${STORAGE_PREFIX}srs:${subjectId}`,
  SUBJECT_STATS: (subjectId) => `${STORAGE_PREFIX}stats:${subjectId}`
};

// In-memory fallback cache when localStorage is restricted or unavailable
const memoryStorage = {};

function safeGet(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return memoryStorage[key] ?? defaultValue;
    return JSON.parse(item);
  } catch {
    return memoryStorage[key] ?? defaultValue;
  }
}

function safeSet(key, value) {
  try {
    memoryStorage[key] = value;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // QuotaExceededError or private browsing safety
  }
}

/**
 * Returns default retention statistics structure for a subject deck.
 * @returns {Object} Default statistics record
 */
export function getDefaultDeckStats() {
  return {
    totalReviews: 0,
    successfulReviews: 0, // Ratings 2, 3, 4
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0,
    currentStreakDays: 0,
    lastStudiedDate: null
  };
}

/**
 * Loads the stored SRS state map for a specific subject.
 * @param {string} subjectId - Unique identifier of the subject
 * @returns {Object} Map of cardId to SRS metadata
 */
export function loadSubjectSRS(subjectId) {
  if (!subjectId) return {};
  // Backward compatibility check with legacy key
  const legacy = localStorage.getItem(`memocard_srs_${subjectId}`);
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy);
      safeSet(KEYS.SUBJECT_SRS(subjectId), parsed);
      localStorage.removeItem(`memocard_srs_${subjectId}`);
      return parsed;
    } catch {
      // Ignore legacy parsing errors
    }
  }
  return safeGet(KEYS.SUBJECT_SRS(subjectId), {});
}

/**
 * Saves the updated SRS state map for a specific subject.
 * @param {string} subjectId - Unique identifier of the subject
 * @param {Object} srsData - Map of cardId to SRS metadata
 */
export function saveSubjectSRS(subjectId, srsData) {
  if (!subjectId) return;
  safeSet(KEYS.SUBJECT_SRS(subjectId), srsData);
}

/**
 * Loads cumulative retention statistics and review history for a subject.
 * @param {string} subjectId - Unique identifier of the subject
 * @returns {Object} Deck retention statistics
 */
export function loadSubjectStats(subjectId) {
  if (!subjectId) return getDefaultDeckStats();
  return safeGet(KEYS.SUBJECT_STATS(subjectId), getDefaultDeckStats());
}

/**
 * Records an atomic review event and recalibrates retention rate, rating counts, and streak.
 *
 * @param {string} subjectId - Subject ID
 * @param {number} rating - Quality rating (1: Again, 2: Hard, 3: Good, 4: Easy)
 * @returns {Object} Updated deck statistics
 */
export function recordReviewEvent(subjectId, rating) {
  if (!subjectId) return getDefaultDeckStats();
  const currentStats = loadSubjectStats(subjectId);
  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];

  const isSuccess = rating > 1;
  const updated = {
    ...currentStats,
    totalReviews: currentStats.totalReviews + 1,
    successfulReviews: currentStats.successfulReviews + (isSuccess ? 1 : 0),
    againCount: currentStats.againCount + (rating === 1 ? 1 : 0),
    hardCount: currentStats.hardCount + (rating === 2 ? 1 : 0),
    goodCount: currentStats.goodCount + (rating === 3 ? 1 : 0),
    easyCount: currentStats.easyCount + (rating === 4 ? 1 : 0)
  };

  // Streak calculation
  if (!currentStats.lastStudiedDate) {
    updated.currentStreakDays = 1;
  } else {
    const lastDate = currentStats.lastStudiedDate;
    if (lastDate !== todayISO) {
      const diffMs = now.getTime() - new Date(lastDate).getTime();
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        updated.currentStreakDays += 1;
      } else if (diffDays > 1) {
        updated.currentStreakDays = 1; // Streak reset
      }
    }
  }

  updated.lastStudiedDate = todayISO;
  safeSet(KEYS.SUBJECT_STATS(subjectId), updated);
  return updated;
}

/**
 * Compiles a comprehensive analytics report for a deck.
 *
 * @param {string} subjectId - Subject ID
 * @param {Array<Object>} cards - List of cards in the deck
 * @param {Object} srsData - Stored SRS data for the deck
 * @returns {Object} Analyzed deck performance metrics
 */
export function getDeckAnalytics(subjectId, cards = [], srsData = {}) {
  const stats = loadSubjectStats(subjectId);
  const totalCards = cards.length;

  let newCards = 0;
  let learningCards = 0; // Reps > 0 && interval < 21
  let matureCards = 0;   // Interval >= 21 days
  let totalIntervalDays = 0;

  cards.forEach((card) => {
    const srs = srsData[card.id];
    if (!srs || srs.reps === 0) {
      newCards += 1;
    } else if (srs.interval >= 21) {
      matureCards += 1;
      totalIntervalDays += srs.interval;
    } else {
      learningCards += 1;
      totalIntervalDays += srs.interval;
    }
  });

  const reviewedCards = learningCards + matureCards;
  const coveragePercent = totalCards > 0 ? Math.round((reviewedCards / totalCards) * 100) : 0;
  const retentionPercent = stats.totalReviews > 0 ? Math.round((stats.successfulReviews / stats.totalReviews) * 100) : 0;
  const averageInterval = reviewedCards > 0 ? (totalIntervalDays / reviewedCards).toFixed(1) : 0;

  return {
    ...stats,
    totalCards,
    newCards,
    learningCards,
    matureCards,
    coveragePercent,
    retentionPercent,
    averageInterval
  };
}

/**
 * Loads the last viewed card index for a subject.
 * @param {string} subjectId - Subject ID
 * @returns {number} Card index (defaults to 0)
 */
export function loadSubjectCardIndex(subjectId) {
  if (!subjectId) return 0;
  // Check legacy key
  const legacy = localStorage.getItem(`memocard_card_idx_${subjectId}`);
  if (legacy !== null) {
    const idx = parseInt(legacy, 10);
    if (!isNaN(idx)) {
      safeSet(KEYS.SUBJECT_CARD_INDEX(subjectId), idx);
      localStorage.removeItem(`memocard_card_idx_${subjectId}`);
      return idx;
    }
  }
  return safeGet(KEYS.SUBJECT_CARD_INDEX(subjectId), 0);
}

/**
 * Saves the current card index for a subject.
 * @param {string} subjectId - Subject ID
 * @param {number} index - Card index
 */
export function saveSubjectCardIndex(subjectId, index) {
  if (!subjectId) return;
  safeSet(KEYS.SUBJECT_CARD_INDEX(subjectId), index);
}
