import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import { healthSysWebSocket } from "../../../services/websocket";
import type { Notification } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import { NotificationsFeed } from "../components/NotificationsFeed";

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Conectando...");

  const mergeNotification = (incoming: Notification) => {
    setNotifications((current) =>
      [incoming, ...current.filter((item) => item.id !== incoming.id)].slice(0, 100)
    );
  };

  const loadNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.listNotifications();
      setNotifications(response);
    } catch (loadError) {
      setError(normalizeError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  useEffect(() => {
    healthSysWebSocket.connect();
    const notificationSubscription = healthSysWebSocket.onNotification((notification) => {
      mergeNotification(notification);
    });
    const statusSubscription = healthSysWebSocket.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    return () => {
      notificationSubscription.unsubscribe();
      statusSubscription.unsubscribe();
    };
  }, []);

  const handleClear = async () => {
    if (!window.confirm("Deseja limpar o histórico local de notificações?")) {
      return;
    }

    try {
      await api.clearNotifications();
      setNotifications([]);
    } catch (clearError) {
      setError(normalizeError(clearError));
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="CENTRAL DE ALERTAS"
        title="Notificações"
        actions={
          <div className="page-actions">
            <button type="button" className="button secondary" onClick={() => void loadNotifications()}>
              Recarregar histórico
            </button>

            <button
              type="button"
              className="button secondary"
              onClick={() => void handleClear()}
            >
              Limpar histórico
            </button>

            <button
              type="button"
              className="button"
              onClick={() => navigate("/app/notificacoes/nova")}
            >
              Nova notificação
            </button>
          </div>
        }
      />

      {error ? <div className="alert error">{error}</div> : null}

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">HISTÓRICO OPERACIONAL</p>
            <h2>Feed de notificações</h2>
            <small>{connectionStatus}</small>
          </div>
        </div>

        <NotificationsFeed notifications={notifications} loading={loading} />
      </article>
    </div>
  );
}
