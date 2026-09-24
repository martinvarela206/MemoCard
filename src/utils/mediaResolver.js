/**
 * @file mediaResolver.js
 * Resolves media paths across local directories, Vite public assets, and remote CDN URLs.
 */

/**
 * Resolves a media src into an absolute path or URL that the browser can display.
 * 
 * @param {string} src Raw path or URL
 * @returns {string} Fully resolved path/URL
 */
export function resolveMediaUrl(src) {
  if (!src || typeof src !== 'string') return '';

  // 1. Data URLs or Remote absolute URLs (http://, https://)
  if (src.startsWith('data:') || /^https?:\/\//i.test(src)) {
    return src;
  }

  // 2. Base URL handling for Vite deployments (handling subdirectory deployments)
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src;

  return `${cleanBase}${cleanSrc}`;
}
