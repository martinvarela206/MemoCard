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

import { hasClozeSyntax, getClozeIndices, expandClozeCards } from '../utils/clozeParser';

export const CARD_TYPES = Object.freeze({
  BASIC: 'basic',
  CLOZE: 'cloze',
  INPUT: 'input',
  IMAGE_OCCLUSION: 'image_occlusion'
});

/**
 * Normalizes a media item or image definition into a structured MediaAsset object.
 * Metadata supported:
 * - src: Path (local relative/public or CDN/remote URL)
 * - alt: Alternative text for accessibility and search
 * - caption: Description / footnote displayed below image
 * - dimensions: { width, height, aspectRatio }
 * - placement: 'front' | 'back' | 'both' (default: 'back')
 * - type: 'image' | 'svg' | 'audio' (default: 'image')
 * 
 * @param {string|Object} asset Media asset raw representation
 * @param {string} [defaultAlt=''] Fallback alternative text
 * @returns {Object|null} Normalized MediaAsset
 */
export function normalizeMediaAsset(asset, defaultAlt = '') {
  if (!asset) return null;
  if (typeof asset === 'string') {
    return {
      src: asset,
      alt: defaultAlt || 'Recurso visual de la tarjeta',
      caption: null,
      dimensions: null,
      placement: 'back',
      type: 'image'
    };
  }

  return {
    src: asset.src || '',
    alt: asset.alt || defaultAlt || 'Recurso visual de la tarjeta',
    caption: asset.caption || null,
    dimensions: asset.dimensions && typeof asset.dimensions === 'object'
      ? {
          width: asset.dimensions.width || null,
          height: asset.dimensions.height || null,
          aspectRatio: asset.dimensions.aspectRatio || null
        }
      : null,
    placement: asset.placement || 'back',
    type: asset.type || 'image'
  };
}

/**
 * Normalizes all media associated with a card (from 'media' array or legacy 'image' field)
 * 
 * @param {Object} rawCard Raw card object
 * @returns {Array<Object>} Array of normalized MediaAssets
 */
export function normalizeCardMedia(rawCard) {
  const mediaList = [];
  
  // 1. Process explicit media array or object
  if (Array.isArray(rawCard.media)) {
    rawCard.media.forEach(m => {
      const normalized = normalizeMediaAsset(m, rawCard.term || rawCard.front);
      if (normalized && normalized.src) mediaList.push(normalized);
    });
  } else if (rawCard.media) {
    const normalized = normalizeMediaAsset(rawCard.media, rawCard.term || rawCard.front);
    if (normalized && normalized.src) mediaList.push(normalized);
  }

  // 2. Backward compatibility: if legacy 'image' is provided and not already included
  if (rawCard.image && typeof rawCard.image === 'string' && !mediaList.some(m => m.src === rawCard.image)) {
    mediaList.push(normalizeMediaAsset({
      src: rawCard.image,
      alt: rawCard.term || rawCard.front || 'Imagen de la tarjeta',
      caption: rawCard.caption || null,
      dimensions: rawCard.dimensions || null,
      placement: rawCard.type === 'image_occlusion' ? 'both' : 'back',
      type: 'image'
    }));
  }

  return mediaList;
}

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
      media: []
    };
  }

  const slideId = rawCard.slide_id || fallbackId;
  const term = rawCard.term || rawCard.front || '';
  const front = rawCard.front || term;
  const back = typeof rawCard.back === 'string' ? rawCard.back : '';
  const media = normalizeCardMedia(rawCard);
  const primaryImage = media.length > 0 ? media[0].src : (rawCard.image || null);

  // Automatically infer 'cloze' type if cloze deletion markup is present and type was default 'basic'
  let inferredType = rawCard.type && Object.values(CARD_TYPES).includes(rawCard.type)
    ? rawCard.type
    : CARD_TYPES.BASIC;

  if (inferredType === CARD_TYPES.BASIC) {
    if (hasClozeSyntax(front) || hasClozeSyntax(term) || hasClozeSyntax(back)) {
      inferredType = CARD_TYPES.CLOZE;
    }
  }

  // Cloze metadata: active index and total distinct indices
  const clozeIndices = getClozeIndices([front, term, back]);
  const activeClozeIndex = rawCard.activeClozeIndex || (clozeIndices.length > 0 ? clozeIndices[0] : 1);
  const clozeTotal = rawCard.clozeTotal || (clozeIndices.length > 0 ? clozeIndices.length : 1);

  return {
    id: rawCard.id || `card_${slideId}`,
    slide_id: slideId,
    type: inferredType,
    activeClozeIndex,
    clozeTotal,
    theme: rawCard.theme || 'General',
    subtheme: rawCard.subtheme || null,
    tags: Array.isArray(rawCard.tags)
      ? rawCard.tags.map(t => String(t).trim().toLowerCase()).filter(Boolean)
      : [],
    sequence: rawCard.sequence && typeof rawCard.sequence === 'object'
      ? {
          step: Number(rawCard.sequence.step) || 1,
          total: Number(rawCard.sequence.total) || null,
          chainId: rawCard.sequence.chainId ? String(rawCard.sequence.chainId) : null
        }
      : (rawCard.step
          ? {
              step: Number(rawCard.step) || 1,
              total: Number(rawCard.total_steps) || null,
              chainId: rawCard.chain_id ? String(rawCard.chain_id) : null
            }
          : null),
    term,
    front,
    back,
    context: rawCard.context || null,
    // Polymorphic extended properties with safe defaults
    answers: Array.isArray(rawCard.answers) ? rawCard.answers : [],
    image: primaryImage,
    masks: Array.isArray(rawCard.masks) ? rawCard.masks : [],
    mode: rawCard.mode || (inferredType === CARD_TYPES.IMAGE_OCCLUSION ? 'hide_all_guess_one' : null),
    media
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

/**
 * Normalizes cards and expands multi-index cloze cards into distinct sub-cards per Anki specifications.
 *
 * @param {Array} cards Raw cards array
 * @returns {Array} Array of normalized and expanded cards
 */
export function normalizeAndExpandCards(cards) {
  const normalized = normalizeCards(cards);
  return expandClozeCards(normalized);
}

export { expandClozeCards };

