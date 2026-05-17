/**
 * useDragDrop.js — Global drag-and-drop handler for audio file import.
 * Attaches to the window; shows a drop overlay while dragging.
 */
import { useEffect, useRef } from 'react';
import useLibraryStore from '../store/libraryStore';

export function useDragDrop() {
  const dragCountRef = useRef(0); // track enter/leave pairs across nested elements
  const overlayRef   = useRef(null);

  useEffect(() => {
    const getOverlay = () => {
      if (!overlayRef.current) {
        const el = document.createElement('div');
        el.id = 'drop-overlay';
        el.style.cssText = `
          position: fixed; inset: 0; z-index: 500;
          background: rgba(255,51,102,0.15);
          border: 3px dashed #FF3366;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
          font-family: Inter, sans-serif;
          font-size: 1.25rem; font-weight: 600;
          color: #FF3366;
          letter-spacing: 0.02em;
        `;
        el.textContent = 'Drop MP3 / MP4 files to import';
        overlayRef.current = el;
      }
      return overlayRef.current;
    };

    const onDragEnter = (e) => {
      e.preventDefault();
      dragCountRef.current++;
      if (dragCountRef.current === 1) {
        document.body.appendChild(getOverlay());
      }
    };

    const onDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };

    const onDragLeave = () => {
      dragCountRef.current--;
      if (dragCountRef.current <= 0) {
        dragCountRef.current = 0;
        overlayRef.current?.remove();
      }
    };

    const onDrop = (e) => {
      e.preventDefault();
      dragCountRef.current = 0;
      overlayRef.current?.remove();

      const files = e.dataTransfer?.files;
      if (files?.length) {
        useLibraryStore.getState().importFiles(files);
      }
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover',  onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop',      onDrop);

    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover',  onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop',      onDrop);
      overlayRef.current?.remove();
    };
  }, []);
}
