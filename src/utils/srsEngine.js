/**
 * @file srsEngine.js
 * Implementation of the SuperMemo-2 (SM-2) spaced repetition scheduling algorithm
 * with interval progression, dynamic ease factor calibration, and Anki-style
 * interval preview calculations.
 *
 * Technical & Algorithmic Rationale:
 * - SM-2 vs Naive Leitner: The SM-2 algorithm models the human memory forgetting curve
 *   (Ebbinghaus decay) continuously rather than with rigid discrete boxes. Each card maintains
 *   an individual Ease Factor (EF) representing intrinsic conceptual difficulty.
 * - Minimum Ease Factor Threshold (1.3): The mathematical lower bound prevents "ease hell",
 *   where a difficult card becomes permanently stuck in an infinite daily repetition loop.
 * - Dynamic Step Scaling:
 *   - Rating 1 (Otra vez / Again): Resets repetitions to 0, sets interval to 1 day, decrements EF.
 *   - Rating 2 (Difícil / Hard): Preserves memory streak but compresses interval growth by 1.2x.
 *   - Rating 3 (Bien / Good): Standard SM-2 interval progression (1d -> 6d -> I * EF).
 *   - Rating 4 (Fácil / Easy): Accelerated progression with bonus multiplier (1.3x) and EF increment.
 */

export const SRS_RATINGS = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4
};

export const MIN_EASE_FACTOR = 1.3;
export const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Creates a default, unreviewed SRS state record for a flashcard.
 * @returns {Object} Fresh SRS state metadata
 */
export function getDefaultSRSState() {
  return {
    reps: 0,
    interval: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    dueDate: new Date().toISOString(),
    lastReviewed: null,
    lapses: 0
  };
}

/**
 * Computes the updated SM-2 review parameters based on user quality rating.
 *
 * @param {Object} currentState - Current SRS parameters of the card
 * @param {number} rating - Quality rating (1: Again, 2: Hard, 3: Good, 4: Easy)
 * @param {Date} [reviewDate=new Date()] - Explicit review timestamp
 * @returns {Object} Updated SRS parameters and calculated due date
 */
export function calculateNextReview(currentState = getDefaultSRSState(), rating, reviewDate = new Date()) {
  const current = {
    reps: currentState?.reps ?? 0,
    interval: currentState?.interval ?? 0,
    easeFactor: currentState?.easeFactor ?? DEFAULT_EASE_FACTOR,
    lapses: currentState?.lapses ?? 0
  };

  const now = reviewDate instanceof Date ? reviewDate : new Date(reviewDate);
  let nextReps = current.reps;
  let nextInterval = 1;
  let nextEase = current.easeFactor;
  let nextLapses = current.lapses;

  switch (rating) {
    case SRS_RATINGS.AGAIN: {
      // Memory failure: reset streak and increment lapse counter
      nextReps = 0;
      nextInterval = 1;
      nextLapses += 1;
      nextEase = Math.max(MIN_EASE_FACTOR, current.easeFactor - 0.2);
      break;
    }

    case SRS_RATINGS.HARD: {
      // Correct recall with high cognitive strain: advance streak with constrained interval
      nextReps += 1;
      nextInterval = current.interval <= 1 ? 1 : Math.round(current.interval * 1.2);
      nextEase = Math.max(MIN_EASE_FACTOR, current.easeFactor - 0.15);
      break;
    }

    case SRS_RATINGS.GOOD: {
      // Standard smooth recall: canonical SM-2 progression
      if (current.reps === 0) {
        nextInterval = 1;
      } else if (current.reps === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.round(current.interval * current.easeFactor);
      }
      nextReps += 1;
      // EF formula adjustment for grade 4 (on 0-5 scale): delta = 0
      // Maintains stability when user consistently selects 'Bien'
      break;
    }

    case SRS_RATINGS.EASY: {
      // Immediate, effortless recall: reward with bonus multiplier and increased EF
      if (current.reps === 0) {
        nextInterval = 4;
      } else if (current.reps === 1) {
        nextInterval = 10;
      } else {
        nextInterval = Math.round(current.interval * current.easeFactor * 1.3);
      }
      nextReps += 1;
      nextEase = current.easeFactor + 0.15;
      break;
    }

    default:
      throw new Error(`Invalid SRS rating provided: ${rating}. Expected 1, 2, 3, or 4.`);
  }

  // Ensure minimum interval is at least 1 full day
  nextInterval = Math.max(1, nextInterval);

  // Compute exact next due date based on calculated interval
  const nextDueDate = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000);

  return {
    reps: nextReps,
    interval: nextInterval,
    easeFactor: parseFloat(nextEase.toFixed(2)),
    dueDate: nextDueDate.toISOString(),
    lastReviewed: now.toISOString(),
    lapses: nextLapses
  };
}

/**
 * Checks whether a card is currently due for spaced repetition review.
 *
 * @param {Object} cardSRSState - Stored SRS metadata of the card
 * @param {Date|number} [now=Date.now()] - Current reference timestamp
 * @returns {boolean} True if card has never been reviewed or due date has passed
 */
export function isCardDue(cardSRSState, now = Date.now()) {
  if (!cardSRSState || !cardSRSState.dueDate) return true;
  const dueTime = new Date(cardSRSState.dueDate).getTime();
  const currentTime = typeof now === 'number' ? now : now.getTime();
  return dueTime <= currentTime;
}

/**
 * Human-readable localized formatting for review intervals.
 *
 * @param {number} days - Interval in days
 * @returns {string} Formatted label (e.g., '1 d', '6 d', '1.2 m')
 */
export function formatInterval(days) {
  if (days <= 0) return '< 1 d';
  if (days === 1) return '1 d';
  if (days < 30) return `${days} d`;
  if (days < 365) {
    const months = (days / 30).toFixed(1).replace('.0', '');
    return `${months} m`;
  }
  const years = (days / 365).toFixed(1).replace('.0', '');
  return `${years} a`;
}

/**
 * Generates preview interval estimations for all 4 ratings to display inside UI buttons.
 *
 * @param {Object} currentState - Current SRS state of the card
 * @returns {Object} Object with formatted interval preview strings for each rating
 */
export function getNextIntervalEstimates(currentState = getDefaultSRSState()) {
  return {
    [SRS_RATINGS.AGAIN]: formatInterval(calculateNextReview(currentState, SRS_RATINGS.AGAIN).interval),
    [SRS_RATINGS.HARD]: formatInterval(calculateNextReview(currentState, SRS_RATINGS.HARD).interval),
    [SRS_RATINGS.GOOD]: formatInterval(calculateNextReview(currentState, SRS_RATINGS.GOOD).interval),
    [SRS_RATINGS.EASY]: formatInterval(calculateNextReview(currentState, SRS_RATINGS.EASY).interval)
  };
}
