import React from 'react';
import useUiStore from '../../store/uiStore';
import { IconX, IconX as CloseIcon } from '../Icons';
import styles from './Notification.module.css';

export default function NotificationStack() {
  const notifications  = useUiStore((s) => s.notifications);
  const dismiss        = useUiStore((s) => s.dismissNotification);

  if (!notifications.length) return null;

  return (
    <div className={styles.stack} role="region" aria-live="polite" aria-label="Notifications">
      {notifications.map((n) => (
        <div key={n.id} className={`${styles.toast} ${styles[n.type]}`} id={`notif-${n.id}`}>
          <span className={styles.msg}>{n.message}</span>
          <button className={styles.dismissBtn} onClick={() => dismiss(n.id)} aria-label="Dismiss">
            <IconX size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
