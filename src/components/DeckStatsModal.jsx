/**
 * @file DeckStatsModal.jsx
 * Comprehensive statistics modal displaying retention rates, memory maturation,
 * daily streaks, and quality rating distributions.
 *
 * Pedagogical Rationale:
 * - Metacognitive Reinforcement: Visualizing mastery distribution (New vs. Learning vs. Mature)
 *   and retention rates builds student confidence and awareness of their cognitive progress.
 * - Habit Stacking: Daily streak tracking incentivizes consistent, daily spaced repetition.
 */

import React, { useEffect } from 'react';
import { getDeckAnalytics } from '../utils/storageManager';

export default function DeckStatsModal({
  isOpen,
  onClose,
  subjectTitle,
  subjectId,
  cards,
  srsData
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const analytics = getDeckAnalytics(subjectId, cards, srsData);

  return (
    <div 
      className="stats-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-modal-title"
    >
      <div 
        className="stats-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="stats-modal-header">
          <div>
            <h2 id="stats-modal-title" className="stats-modal-title">
              📊 Estadísticas de Repaso
            </h2>
            <p className="stats-modal-subtitle">
              Materia: <strong>{subjectTitle}</strong>
            </p>
          </div>
          <button 
            type="button" 
            className="btn-close-stats-modal" 
            onClick={onClose}
            aria-label="Cerrar estadísticas"
          >
            ✕
          </button>
        </div>

        <div className="stats-metrics-grid">
          <div className="stats-metric-card highlight">
            <span className="stats-metric-icon">🎯</span>
            <span className="stats-metric-value">{analytics.retentionPercent}%</span>
            <span className="stats-metric-label">Tasa de Retención</span>
          </div>

          <div className="stats-metric-card">
            <span className="stats-metric-icon">🔥</span>
            <span className="stats-metric-value">{analytics.currentStreakDays} {analytics.currentStreakDays === 1 ? 'día' : 'días'}</span>
            <span className="stats-metric-label">Racha de Estudio</span>
          </div>

          <div className="stats-metric-card">
            <span className="stats-metric-icon">🌳</span>
            <span className="stats-metric-value">{analytics.matureCards}</span>
            <span className="stats-metric-label">Tarjetas Maduras (&ge;21d)</span>
          </div>

          <div className="stats-metric-card">
            <span className="stats-metric-icon">🌱</span>
            <span className="stats-metric-value">{analytics.learningCards}</span>
            <span className="stats-metric-label">En Aprendizaje</span>
          </div>

          <div className="stats-metric-card">
            <span className="stats-metric-icon">✨</span>
            <span className="stats-metric-value">{analytics.newCards}</span>
            <span className="stats-metric-label">Nuevas sin repasar</span>
          </div>

          <div className="stats-metric-card">
            <span className="stats-metric-icon">📈</span>
            <span className="stats-metric-value">{analytics.totalReviews}</span>
            <span className="stats-metric-label">Repasos Realizados</span>
          </div>
        </div>

        <div className="stats-distribution-section">
          <h3 className="stats-section-title">Distribución de Evaluaciones</h3>
          <div className="stats-rating-distribution">
            <div className="stats-dist-row">
              <span className="stats-dist-name rating-again">Otra vez</span>
              <div className="stats-dist-bar-track">
                <div 
                  className="stats-dist-bar-fill again" 
                  style={{ width: `${analytics.totalReviews > 0 ? (analytics.againCount / analytics.totalReviews) * 100 : 0}%` }}
                />
              </div>
              <span className="stats-dist-count">{analytics.againCount}</span>
            </div>

            <div className="stats-dist-row">
              <span className="stats-dist-name rating-hard">Difícil</span>
              <div className="stats-dist-bar-track">
                <div 
                  className="stats-dist-bar-fill hard" 
                  style={{ width: `${analytics.totalReviews > 0 ? (analytics.hardCount / analytics.totalReviews) * 100 : 0}%` }}
                />
              </div>
              <span className="stats-dist-count">{analytics.hardCount}</span>
            </div>

            <div className="stats-dist-row">
              <span className="stats-dist-name rating-good">Bien</span>
              <div className="stats-dist-bar-track">
                <div 
                  className="stats-dist-bar-fill good" 
                  style={{ width: `${analytics.totalReviews > 0 ? (analytics.goodCount / analytics.totalReviews) * 100 : 0}%` }}
                />
              </div>
              <span className="stats-dist-count">{analytics.goodCount}</span>
            </div>

            <div className="stats-dist-row">
              <span className="stats-dist-name rating-easy">Fácil</span>
              <div className="stats-dist-bar-track">
                <div 
                  className="stats-dist-bar-fill easy" 
                  style={{ width: `${analytics.totalReviews > 0 ? (analytics.easyCount / analytics.totalReviews) * 100 : 0}%` }}
                />
              </div>
              <span className="stats-dist-count">{analytics.easyCount}</span>
            </div>
          </div>
        </div>

        <div className="stats-modal-footer">
          <button 
            type="button" 
            className="btn-stats-modal-close" 
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
