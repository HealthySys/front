import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { Notification } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import { NotificationStatusCard } from "../components/NotificationStatusCard";
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
    const client = new Client({
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS("/ws"),
      onConnect: () => {
        setConnectionStatus("Conectado em tempo real");

        client.subscribe("/topic/notifications", (message) => {
          try {
            const notification = JSON.parse(message.body) as Notification;
            mergeNotification(notification);
          } catch {
            setConnectionStatus("Conectado com alerta de leitura");
          }
        });
      },
      onStompError: () => {
        setConnectionStatus("Falha no broker");
      },
      onWebSocketClose: () => {
        setConnectionStatus("Conexão encerrada");
      }
    });

    client.activate();

    return () => {
      void client.deactivate();
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
          </div>
        </div>

        <NotificationsFeed notifications={notifications} loading={loading} />
      </article>
    </div>
  );
}