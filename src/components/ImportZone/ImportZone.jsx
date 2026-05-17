import React, { useCallback } from 'react';
import useLibraryStore from '../../store/libraryStore';
import useUiStore from '../../store/uiStore';
import { IconX, IconUpload } from '../Icons';
import styles from './ImportZone.module.css';

export default function ImportZone() {
  const importModalOpen = useUiStore((s) => s.importModalOpen);
  const closeImportModal = useUiStore((s) => s.closeImportModal);
  const importFiles     = useLibraryStore((s) => s.importFiles);
  const importProgress  = useLibraryStore((s) => s.importProgress);

  const handleFileInput = useCallback((e) => {
    if (e.target.files?.length) {
      importFiles(e.target.files);
      closeImportModal();
    }
  }, [importFiles, closeImportModal]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) {
      importFiles(e.dataTransfer.files);
      closeImportModal();
    }
  }, [importFiles, closeImportModal]);

  if (!importModalOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => e.target === e.currentTarget && closeImportModal()}
      id="import-modal"
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Import music files">
        <div className={styles.header}>
          <h2 className={styles.title}>Import Music</h2>
          <button className={styles.closeBtn} onClick={closeImportModal} id="import-close">
            <IconX size={18} />
          </button>
        </div>

        {/* Drop zone */}
        <label
          htmlFor="file-input"
          className={styles.dropZone}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          id="import-dropzone"
        >
          <IconUpload size={36} color="var(--color-accent)" />
          <p className={styles.dropText}>Drag & drop MP3 or MP4 files here</p>
          <p className={styles.dropSub}>or click to browse your files</p>
          <input
            id="file-input"
            type="file"
            multiple
            accept=".mp3,.mp4,.m4a,audio/mpeg,video/mp4,audio/mp4"
            onChange={handleFileInput}
            className={styles.hiddenInput}
          />
        </label>

        <p className={styles.note}>
          Files are stored locally in your browser's IndexedDB. They persist between sessions.
        </p>

        {importProgress && (
          <div className={styles.progressWrap}>
            <div
              className={styles.progressBar}
              style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
            />
            <span className={styles.progressLabel}>
              Importing {importProgress.current} / {importProgress.total}…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
