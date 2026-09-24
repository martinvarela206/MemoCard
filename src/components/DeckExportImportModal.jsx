/**
 * @file DeckExportImportModal.jsx
 * Modal dialog for exporting and importing deck bundles with notes, flashcards,
 * and longitudinal SRS statistics in JSON format.
 *
 * Technical & Portability Rationale:
 * - Data Ownership & Portability: Allows learners to backup their active recall history,
 *   transfer learning states between devices, and share decks offline without remote servers.
 * - JSON Schema Validation: Validates incoming files before merging into persistent storage
 *   to prevent state corruption or schema drift.
 * - Non-Destructive Merge: Gives users the option to restore scheduling metadata while preserving
 *   existing cards or updating definitions.
 */

import React, { useState, useEffect, useRef } from 'react';
import { loadSubjectStats } from '../utils/storageManager';

export default function DeckExportImportModal({
  isOpen,
  onClose,
  subject,
  cards,
  srsData,
  onImportDeck
}) {
  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import'
  const [includeStats, setIncludeStats] = useState(true);
  const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [importedPreview, setImportedPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setImportStatus(null);
      setImportedPreview(null);
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Export deck handler
  const handleExport = () => {
    try {
      const stats = includeStats && subject ? loadSubjectStats(subject.id) : null;
      const exportPayload = {
        memoCardVersion: '1.0',
        exportedAt: new Date().toISOString(),
        subject: {
          id: subject?.id,
          title: subject?.title,
          icon: subject?.icon,
          color: subject?.color,
          description: subject?.description
        },
        cardsCount: cards.length,
        slides: subject?.data?.slides || (Array.isArray(subject?.data) ? subject.data : []),
        cards: cards,
        srsData: includeStats ? srsData : {},
        stats: stats
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `MemoCard_${subject?.id || 'deck'}_backup.json`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setImportStatus({
        type: 'success',
        message: `Mazo "${subject?.title}" exportado con éxito como ${filename}.`
      });
    } catch {
      setImportStatus({
        type: 'error',
        message: 'Ocurrió un error al generar el archivo de exportación.'
      });
    }
  };

  // File selection for import
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || (!parsed.cards && !parsed.slides && !Array.isArray(parsed))) {
          throw new Error('El archivo no contiene una estructura válida de mazo MemoCard.');
        }

        setImportedPreview(parsed);
        setImportStatus(null);
      } catch (err) {
        setImportStatus({
          type: 'error',
          message: err.message || 'Error al analizar el archivo JSON.'
        });
        setImportedPreview(null);
      }
    };
    reader.readAsText(file);
  };

  // Confirm import handler
  const handleConfirmImport = () => {
    if (!importedPreview) return;
    try {
      if (onImportDeck) {
        onImportDeck(importedPreview);
      }
      setImportStatus({
        type: 'success',
        message: '¡Mazo y estadísticas importados y sincronizados correctamente!'
      });
      setImportedPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: 'Error al aplicar los datos importados: ' + err.message
      });
    }
  };

  return (
    <div 
      className="export-import-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-export-import-title"
    >
      <div 
        className="export-import-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="modal-export-import-title" className="modal-title">
              📦 Respaldo del Mazo
            </h2>
            <p className="modal-subtitle">
              Exporta tus tarjetas y estadísticas o restaura un respaldo en formato JSON.
            </p>
          </div>
          <button 
            type="button" 
            className="btn-modal-close" 
            onClick={onClose}
            aria-label="Cerrar modal de exportación e importación"
          >
            ✕
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            type="button"
            className={`modal-tab-btn ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => { setActiveTab('export'); setImportStatus(null); }}
          >
            📥 Exportar Mazo
          </button>
          <button 
            type="button"
            className={`modal-tab-btn ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => { setActiveTab('import'); setImportStatus(null); }}
          >
            📤 Importar Respaldo
          </button>
        </div>

        {importStatus && (
          <div className={`modal-alert ${importStatus.type}`}>
            <span className="alert-icon">{importStatus.type === 'success' ? '✅' : '⚠️'}</span>
            <span className="alert-message">{importStatus.message}</span>
          </div>
        )}

        {activeTab === 'export' ? (
          <div className="export-tab-panel">
            <div className="export-summary-box">
              <div className="summary-item">
                <span className="summary-label">Materia Activa:</span>
                <span className="summary-value"><strong>{subject?.title}</strong></span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total de Tarjetas:</span>
                <span className="summary-value">{cards.length} tarjetas</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Registros SRS Programados:</span>
                <span className="summary-value">{Object.keys(srsData || {}).length}</span>
              </div>
            </div>

            <label className="checkbox-option-label">
              <input 
                type="checkbox" 
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
              />
              <span>Incluir historial de estudio, estadísticas de retención y programación SM-2</span>
            </label>

            <button 
              type="button" 
              className="btn-primary-action"
              onClick={handleExport}
            >
              📥 Descargar Archivo JSON de Respaldo
            </button>
          </div>
        ) : (
          <div className="import-tab-panel">
            <div className="file-drop-zone">
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json,application/json" 
                onChange={handleFileChange}
                id="deck-file-input"
                className="hidden-file-input"
              />
              <label htmlFor="deck-file-input" className="file-drop-label">
                <span className="file-drop-icon">📁</span>
                <span className="file-drop-text">Selecciona un archivo <strong>.json</strong> para restaurar</span>
                <span className="file-drop-hint">Formatos compatibles: respaldos generados por MemoCard</span>
              </label>
            </div>

            {importedPreview && (
              <div className="imported-preview-card">
                <h4 className="preview-heading">Detalles del Archivo Seleccionado</h4>
                <div className="preview-meta-grid">
                  <div><strong>Materia:</strong> {importedPreview.subject?.title || (Array.isArray(importedPreview) ? importedPreview[0]?.theme : null) || 'Personalizada'}</div>
                  <div><strong>Tarjetas:</strong> {Array.isArray(importedPreview) ? importedPreview.length : (importedPreview.cards?.length || importedPreview.slides?.length || 0)}</div>
                  <div><strong>Fecha de Creación:</strong> {importedPreview.exportedAt ? new Date(importedPreview.exportedAt).toLocaleDateString() : 'N/A'}</div>
                  <div><strong>Estados SRS:</strong> {importedPreview.srsData ? Object.keys(importedPreview.srsData).length : 0}</div>
                </div>

                <button 
                  type="button" 
                  className="btn-confirm-import"
                  onClick={handleConfirmImport}
                >
                  🚀 Confirmar e Importar al Sistema
                </button>
              </div>
            )}
          </div>
        )}

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-cancel-modal" 
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
