import { Activity, AlertTriangle, Bell } from "lucide-react";
import type { Notification } from "../../../types";
import { Colors } from "../../../design/tokens";
import { formatDateTime } from "../../../utils/formatters";
import styles from "./NotificationsFeed.module.css";

type Variant = "critical" | "urgent" | "info" | "system";

interface VariantConfig {
  icon: typeof Bell;
  color: string;
  bg: string;
  border: string;
}

const variants: Record<Variant, VariantConfig> = {
  critical: { icon: AlertTriangle, color: Colors.danger,  bg: Colors.dangerBg,    border: Colors.dangerBd },
  urgent:   { icon: AlertTriangle, color: "#f97316",      bg: "#fff7ed",          border: "#fdba74" },
  info:     { icon: Bell,          color: Colors.accent,  bg: Colors.accentDim,   border: Colors.accentLight },
  system:   { icon: Activity,      color: "#64748b",      bg: "#f8fafc",          border: Colors.border }
};

function variantOf(notification: Notification): Variant {
  const sev = notification.severity?.toUpperCase();
  if (sev === "CRITICAL") return "critical";
  if (sev === "WARNING") return "urgent";
  if (notification.type === "ALERTA_CLINICO" || notification.type === "EMERGENCY_ALERT") return "urgent";
  if (notification.type === "AVISO_OPERACIONAL") return "system";
  return "info";
}

type NotificationsFeedProps = {
  notifications: Notification[];
  loading: boolean;
  unreadIds: Set<string>;
  onActivate?: (notification: Notification) => void;
};

export function NotificationsFeed({
  notifications,
  loading,
  unreadIds,
  onActivate
}: NotificationsFeedProps) {
  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--hs-text-3)" }}>
        Carregando notificações…
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--hs-text-3)" }}>
        Nenhuma notificação registrada até o momento.
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {notifications.map((notification) => {
        const variant = variantOf(notification);
        const config = variants[variant];
        const Icon = config.icon;
        const isUnread = notification.id ? unreadIds.has(notification.id) : false;

        return (
          <button
            key={notification.id}
            type="button"
            className={`${styles.item} ${isUnread ? styles.unread : styles.read}`}
            style={{
              background: isUnread ? config.bg : "var(--hs-surface)",
              borderColor: isUnread ? config.border : "var(--hs-border)"
            }}
            onClick={() => onActivate?.(notification)}
          >
            <span
              className={styles.iconBox}
              style={{ background: config.bg, color: config.color }}
            >
              <Icon size={18} />
            </span>
            <div className={styles.body}>
              <span className={styles.title}>{notification.title}</span>
              <p className={styles.message}>{notification.message}</p>
              <span className={styles.meta}>
                {notification.patientName ? `${notification.patientName} · ` : ""}
                {formatDateTime(notification.timestamp)}
              </span>
            </div>
            <div className={styles.right}>
              {isUnread ? <span className={styles.dot} style={{ background: config.color }} /> : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
