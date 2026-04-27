type NotificationStatusCardProps = {
  connectionStatus: string;
  notificationsCount: number;
};

export function NotificationStatusCard({
  connectionStatus,
  notificationsCount
}: NotificationStatusCardProps) {
  return (
    <div className="info-list">
      <div className="info-row">
        <strong>WebSocket</strong>
        <span>{connectionStatus}</span>
      </div>

      <div className="info-row">
        <strong>Notificações carregadas</strong>
        <span>{notificationsCount}</span>
      </div>

      <div className="info-row">
        <strong>Origem</strong>
        <span>Gateway `/ws/notifications` com broker STOMP do serviço de notificações.</span>
      </div>
    </div>
  );
}
