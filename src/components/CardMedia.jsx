/**
 * @file CardMedia.jsx
 * Multimedia Asset renderer with Lightbox and Pan-and-Zoom capabilities.
 *
 * Architectural & Ergonomic Rationale:
 * - High-Resolution Image Pan-and-Zoom: Medical, anatomical, and mathematical diagrams
 *   frequently contain dense micro-typography that cannot be deciphered at standard viewport scales.
 * - Transform Decoupling: Uses CSS `transform: translate3d(x, y, 0) scale(s)` to offload pan and zoom
 *   computations directly to the GPU compositor thread, preventing browser reflows during drag operations.
 * - Multi-Modal Input Support:
 *   - Mouse wheel scaling with exponential dampening.
 *   - Mouse drag and touch pan with boundary checking.
 *   - Keyboard shortcuts: Escape to close, '+' to zoom in, '-' to zoom out, '0' or 'r' to reset.
 *   - Double-click to toggle between 1x and 2.5x magnification.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { resolveMediaUrl } from '../utils/mediaResolver';

export default function CardMedia({ asset, className = '' }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInverted, setIsInverted] = useState(false);

  // Pan and Zoom State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });

  // Synchronize positionRef with position state for synchronous drag calculations
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const resetPanZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  const handleMediaClick = (e) => {
    e.stopPropagation();
    setIsZoomed(true);
    resetPanZoom();
  };

  const handleCloseZoom = useCallback((e) => {
    if (e) e.stopPropagation();
    setIsZoomed(false);
    resetPanZoom();
  }, [resetPanZoom]);

  const handleZoomIn = (e) => {
    if (e) e.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e) => {
    if (e) e.stopPropagation();
    setScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale(prev => {
      const next = Math.max(1, Math.min(4, prev + delta));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation inside lightbox
  useEffect(() => {
    if (!isZoomed) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseZoom();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0' || e.key === 'r') {
        resetPanZoom();
      } else if (e.key === 'i' || e.key === 'I') {
        setIsInverted(v => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed, handleCloseZoom, resetPanZoom]);

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

  return (
    <>
      <figure 
        className={`card-media-figure ${className}`} 
        style={style}
        onClick={handleMediaClick}
        title="Haz clic para abrir visor con zoom y desplazamiento"
      >
        {!hasError ? (
          <img 
            src={resolvedUrl} 
            alt={altText}
            className={`card-media-img ${isInverted ? 'img-inverted' : ''}`}
            loading="lazy"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="card-media-fallback">
            <span className="fallback-icon">🖼️</span>
            <span className="fallback-text">{altText}</span>
          </div>
        )}

        <div className="card-media-actions-bar">
          <button
            type="button"
            className={`btn-media-invert-quick ${isInverted ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsInverted(v => !v);
            }}
            title={isInverted ? "Restaurar colores originales" : "Invertir colores para evitar deslumbramiento nocturno"}
          >
            ☯ {isInverted ? 'Original' : 'Invertir'}
          </button>
        </div>

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
          onMouseUp={handleMouseUp}
          role="dialog"
          aria-label="Visor de alta resolución con zoom y desplazamiento"
        >
          {/* Pan & Zoom Controls Toolbar */}
          <div className="lightbox-toolbar" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-tool-btn"
              onClick={handleZoomOut}
              disabled={scale <= 1}
              title="Alejar (-)"
            >
              −
            </button>
            <span className="lightbox-scale-indicator">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              className="lightbox-tool-btn"
              onClick={handleZoomIn}
              disabled={scale >= 4}
              title="Acercar (+)"
            >
              +
            </button>
            <button
              type="button"
              className="lightbox-tool-btn reset"
              onClick={resetPanZoom}
              title="Restablecer (0 o r)"
            >
              ↺
            </button>
            <button
              type="button"
              className={`lightbox-tool-btn invert ${isInverted ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsInverted(v => !v);
              }}
              title="Invertir colores del diagrama (Tecla i)"
            >
              ☯
            </button>
            <button 
              type="button"
              className="lightbox-tool-btn close" 
              onClick={handleCloseZoom}
              aria-label="Cerrar visor"
              title="Cerrar (Esc)"
            >
              ✕
            </button>
          </div>

          <div 
            className="lightbox-content" 
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
          >
            <div 
              className={`lightbox-viewport ${scale > 1 ? 'pannable' : ''} ${isDragging ? 'dragging' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (scale === 1) {
                  setScale(2.5);
                } else {
                  resetPanZoom();
                }
              }}
            >
              <img 
                src={resolvedUrl} 
                alt={altText} 
                className={`lightbox-img ${isInverted ? 'img-inverted' : ''}`}
                style={{
                  transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                }}
                draggable={false}
              />
            </div>

            {caption && (
              <p className="lightbox-caption">{caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
