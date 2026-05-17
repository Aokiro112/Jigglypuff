import React, { useRef } from 'react';
import useUiStore from '../../store/uiStore';
import useLibraryStore from '../../store/libraryStore';
import { IconChevronLeft, IconChevronRight, IconSearch, IconUpload } from '../Icons';
import styles from './TopBar.module.css';

export default function TopBar() {
  const goBack     = useUiStore((s) => s.goBack);
  const goForward  = useUiStore((s) => s.goForward);
  const history    = useUiStore((s) => s.history);
  const historyIdx = useUiStore((s) => s.historyIndex);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);
  const navigate   = useUiStore((s) => s.navigate);
  const openImportModal = useUiStore((s) => s.openImportModal);
  const importProgress = useLibraryStore((s) => s.importProgress);

  const inputRef = useRef(null);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) navigate('search');
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      inputRef.current?.blur();
    }
  };

  return (
    <header className={styles.topBar}>
      {/* Back / Forward */}
      <div className={styles.navBtns}>
        <button
          className={styles.navArrow}
          onClick={goBack}
          disabled={historyIdx <= 0}
          title="Go back"
          id="topbar-back"
        >
          <IconChevronLeft size={16} />
        </button>
        <button
          className={styles.navArrow}
          onClick={goForward}
          disabled={historyIdx >= history.length - 1}
          title="Go forward"
          id="topbar-forward"
        >
          <IconChevronRight size={16} />
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <IconSearch size={14} color="var(--color-accent)" className={styles.searchIcon} />
        <input
          ref={inputRef}
          id="topbar-search"
          type="text"
          placeholder="Search tracks, artists, albums…"
          value={searchQuery}
          onChange={handleSearch}
          onKeyDown={handleSearchKey}
          className={styles.searchInput}
          aria-label="Search music library"
        />
      </div>

      {/* Import + progress */}
      <div className={styles.rightArea}>
        {importProgress && (
          <div className={styles.importProg} title={`Importing ${importProgress.current}/${importProgress.total}`}>
            <div
              className={styles.importProgBar}
              style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
            />
          </div>
        )}
        <button
          className={styles.importBtn}
          onClick={openImportModal}
          title="Import files (Ctrl+O)"
          id="topbar-import"
        >
          <IconUpload size={15} />
          <span>Import</span>
        </button>
      </div>
    </header>
  );
}
