/**
 * CoverArt.jsx — Lazy-loading album art with IntersectionObserver.
 * Loads the cover image only when it enters the viewport.
 */
import React, { useEffect, useRef, useState } from 'react';
import { getTrackCoverBlob } from '../../services/db';
import { acquireUrl, releaseUrl } from '../../services/blobUrlCache';
import { IconMusic } from '../Icons';
import styles from './CoverArt.module.css';

/**
 * @param {{ trackId: string, hasCover: boolean, thumbnailUrl?: string, size?: number, className?: string }} props
 */
const CoverArt = React.memo(function CoverArt({ trackId, hasCover, thumbnailUrl, size = 48, className = '' }) {
  const ref      = useRef(null);
  const [src, setSrc] = useState(null);
  const loadedId  = useRef(null);

  useEffect(() => {
    if (thumbnailUrl) {
      setSrc(thumbnailUrl);
      return;
    }
    if (!hasCover || !trackId) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          // Load blob from DB, create URL
          getTrackCoverBlob(trackId).then((blob) => {
            if (!blob) return;
            const url = acquireUrl(`cover_${trackId}`, blob);
            loadedId.current = `cover_${trackId}`;
            setSrc(url);
          });
        }
      },
      { rootMargin: '100px' } // start loading 100px before visible
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (loadedId.current) {
        releaseUrl(loadedId.current);
        loadedId.current = null;
      }
    };
  }, [trackId, hasCover, thumbnailUrl]);

  return (
    <div
      ref={ref}
      className={`${styles.coverWrap} ${className}`}
      style={{ width: size, height: size, minWidth: size }}
    >
      {src ? (
        <img src={src} alt="Album art" className={styles.img} draggable={false} />
      ) : (
        <div className={styles.placeholder}>
          <IconMusic size={size * 0.4} color="var(--color-accent)" />
        </div>
      )}
    </div>
  );
});

export default CoverArt;
