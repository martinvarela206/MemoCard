import React, { useState } from 'react';
import { resolveMediaUrl } from '../utils/mediaResolver';

export default function CardMedia({ asset, className = '' }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!asset || !asset.src) return null;

  const resolvedUrl = resolveMediaUrl(asset.src);
  const altText = asset.alt || 'Recurso visual de la tarjeta';
  const caption = asset.caption;

  const style = {};
  if (asset.dimensions?.aspectRatio) {
    style.aspectRatio = asset.dimensions.aspectRatio;
  }
  if (asset.dimensions?.width) {
    style.maxWidth = `${asset.dimensions.width}px`;
  }

  const handleMediaClick = (e) => {
    e.stopPropagation(); // Prevent flipping the card when clicking the image
    setIsZoomed(true);
  };

  const handleCloseZoom = (e) => {
    e.stopPropagation();
    setIsZoomed(false);
  };

  return (
    <>
      <figure 
        className={`card-media-figure ${className}`} 
        style={style}
        onClick={handleMediaClick}
        title="Haz clic para ampliar la imagen"
      >
        {!hasError ? (
          <img 
            src={resolvedUrl} 
            alt={altText}
            className="card-media-img"
            loading="lazy"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="card-media-fallback">
            <span className="fallback-icon">🖼️</span>
            <span className="fallback-text">{altText}</span>
          </div>
        )}

        {caption && (
          <figcaption className="card-media-caption">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox / Zoom Modal */}
      {isZoomed && (
        <div 
          className="media-lightbox-overlay" 
          onClick={handleCloseZoom}
          role="dialog"
          aria-label="Vista ampliada de la imagen"
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="lightbox-close-btn" 
              onClick={handleCloseZoom}
              aria-label="Cerrar imagen"
            >
              ✕
            </button>
            <img 
              src={resolvedUrl} 
              alt={altText} 
              className="lightbox-img" 
            />
            {caption && (
              <p className="lightbox-caption">{caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
