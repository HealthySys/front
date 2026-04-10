import type { Notification } from "../../../types";
import { formatDateTime, severityLabel } from "../../../utils/formatters";

type NotificationsFeedProps = {
  notifications: Notification[];
  loading: boolean;
};

export function NotificationsFeed({
  notifications,
  loading
}: NotificationsFeedProps) {
  return (
    <div className="list-stack">
      {loading ? (
        <div className="empty-state">Carregando notificações...</div>
      ) : notifications.length ? (
        notifications.map((notification) => (
          <div key={notification.id} className="list-card">
            <div className="list-card-top">
              <div>
                <strong>{notification.title}</strong>
                <small>{notification.type}</small>
              </div>

              <span className={`pill severity ${notification.severity?.toLowerCase()}`}>
                {severityLabel(notification.severity)}
              </span>
            </div>

            <p>{notification.message}</p>

            <small>
              {notification.patientName ? `${notification.patientName} • ` : ""}
              {formatDateTime(notification.timestamp)}
            </small>
          </div>
        ))
      ) : (
        <div className="empty-state">Nenhuma notificação registrada até o momento.</div>
      )}
    </div>
  );
}