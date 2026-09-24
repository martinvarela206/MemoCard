/**
 * @file cardTypes.js
 * Formal card data model and schema adapter for polymorphic flashcards.
 * 
 * Supports:
 * - 'basic': Standard two-sided card (front / back)
 * - 'cloze': Card with cloze deletions ({{c1::answer::hint}})
 * - 'input': Interactive card requiring user text input and validation
 * - 'image_occlusion': Image with bounding boxes occluding anatomical or structural details
 */

export const CARD_TYPES = Object.freeze({
  BASIC: 'basic',
  CLOZE: 'cloze',
  INPUT: 'input',
  IMAGE_OCCLUSION: 'image_occlusion'
});

/**
 * Normalizes any card object, guaranteeing retroactive compatibility with v1 schema.
 * If a card lacks a 'type' property, it is automatically assigned 'basic'.
 *
 * @param {Object} rawCard Raw card object from JSON or external sources
 * @param {number} [fallbackId=1] Fallback ID if missing
 * @returns {Object} Normalized card adhering strictly to polymorphic schema
 */
export function normalizeCard(rawCard, fallbackId = 1) {
  if (!rawCard || typeof rawCard !== 'object') {
    return {
      id: `card_${fallbackId}`,
      slide_id: fallbackId,
      type: CARD_TYPES.BASIC,
      theme: 'General',
      term: '',
      front: '',
      back: '',
      context: null,
      answers: [],
      image: null,
      masks: [],
      mode: null,
      media: null
    };
  }

  // Determine formal card type with automatic fallback to 'basic' for v1 retrocompatibility
  const type = rawCard.type && Object.values(CARD_TYPES).includes(rawCard.type)
    ? rawCard.type
    : CARD_TYPES.BASIC;

  const slideId = rawCard.slide_id || fallbackId;
  const term = rawCard.term || rawCard.front || '';
  const front = rawCard.front || term;
  const back = typeof rawCard.back === 'string' ? rawCard.back : '';

  return {
    id: rawCard.id || `card_${slideId}`,
    slide_id: slideId,
    type,
    theme: rawCard.theme || 'General',
    term,
    front,
    back,
    context: rawCard.context || null,
    // Polymorphic extended properties with safe defaults
    answers: Array.isArray(rawCard.answers) ? rawCard.answers : [],
    image: rawCard.image || null,
    masks: Array.isArray(rawCard.masks) ? rawCard.masks : [],
    mode: rawCard.mode || (type === CARD_TYPES.IMAGE_OCCLUSION ? 'hide_all_guess_one' : null),
    media: rawCard.media || null
  };
}

/**
 * Normalizes an array of cards, preserving ordering and retrocompatibility.
 *
 * @param {Array} cards Raw cards array
 * @returns {Array} Array of normalized polymorphic cards
 */
export function normalizeCards(cards) {
  if (!Array.isArray(cards)) return [];
  return cards.map((card, idx) => normalizeCard(card, idx + 1));
}
