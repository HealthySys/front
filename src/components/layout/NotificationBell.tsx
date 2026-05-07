import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { useNotificationCenter } from "../../features/notifications/NotificationCenter";
import { NotificationsFeed } from "../../features/notifications/components/NotificationsFeed";
import type { Notification } from "../../types";
import styles from "./NotificationBell.module.css";

export function NotificationBell() {
  const { notifications, unreadIds, unreadCount, markRead, markAllRead } =
    useNotificationCenter();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleActivate = (notification: Notification) => {
    if (notification.id) {
      markRead(notification.id);
    }
    if (notification.type === "PATIENT_FORWARDED" && notification.patientId) {
      setOpen(false);
      navigate(`/app/triagem/nova?patientId=${notification.patientId}`);
    }
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((current) => !current)}
        aria-label={`Notificações${unreadCount ? ` (${unreadCount} não lidas)` : ""}`}
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 ? (
          <span className={styles.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <div className={styles.panel} role="dialog" aria-label="Notificações">
          <header className={styles.header}>
            <span className={styles.title}>Notificações</span>
            <button
              type="button"
              className={styles.markAll}
              onClick={() => markAllRead()}
              disabled={!unreadCount}
            >
              <CheckCheck size={14} />
              Marcar todas como lidas
            </button>
          </header>

          <div className={styles.body}>
            <NotificationsFeed
              notifications={notifications}
              loading={false}
              unreadIds={unreadIds}
              onActivate={handleActivate}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
