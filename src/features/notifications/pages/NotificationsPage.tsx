import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { Notification, NotificationPayload } from "../../../types";
import {
  formatDateTime,
  normalizeError,
  notificationSeverityOptions,
  notificationTypeOptions,
  severityLabel
} from "../../../utils/formatters";

const initialForm: NotificationPayload = {
  type: "INFO",
  title: "",
  message: "",
  severity: "INFO",
  patientName: "",
  patientId: undefined
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [form, setForm] = useState<NotificationPayload>(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Conectando...");

  const mergeNotification = (incoming: Notification) => {
    setNotifications((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)].slice(0, 100));
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      const created = await api.broadcastNotification({
        ...form,
        patientId: form.patientId || undefined,
        patientName: form.patientName || undefined
      });

      mergeNotification(created);
      setForm(initialForm);
      setFeedback("Notificação enviada e publicada no canal em tempo real.");
    } catch (submitError) {
      setError(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

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
        title="Notificações e comunicação operacional"
        description="Acompanhe eventos do sistema, publique avisos manuais e mantenha a equipe sincronizada em tempo real."
        actions={
          <button type="button" className="button ghost" onClick={() => void loadNotifications()}>
            Recarregar histórico
          </button>
        }
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <section className="content-grid two-columns">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">PUBLICAÇÃO MANUAL</p>
              <h2>Enviar notificação</h2>
            </div>
          </div>

          <form className="form-grid wide-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Tipo</span>
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              >
                {notificationTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Severidade</span>
              <select
                value={form.severity}
                onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value }))}
              >
                {notificationSeverityOptions.map((severity) => (
                  <option key={severity} value={severity}>
                    {severityLabel(severity)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-span-2">
              <span>Título</span>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Ex.: Alerta de ocupação, intercorrência ou aviso técnico"
                required
              />
            </label>

            <label className="field field-span-2">
              <span>Mensagem</span>
              <textarea
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                rows={4}
                placeholder="Descreva o conteúdo da notificação"
                required
              />
            </label>

            <label className="field">
              <span>ID do paciente (opcional)</span>
              <input
                value={form.patientId ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    patientId: event.target.value ? Number(event.target.value) : undefined
                  }))
                }
                placeholder="123"
              />
            </label>

            <label className="field">
              <span>Paciente relacionado (opcional)</span>
              <input
                value={form.patientName ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, patientName: event.target.value }))}
                placeholder="Nome do paciente"
              />
            </label>

            <div className="form-actions field-span-2">
              <button type="submit" className="button" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar notificação"}
              </button>
              <button type="button" className="button ghost" onClick={handleClear}>
                Limpar histórico
              </button>
            </div>
          </form>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">TEMPO REAL</p>
              <h2>Status do canal</h2>
            </div>
          </div>

          <div className="info-list">
            <div className="info-row">
              <strong>WebSocket</strong>
              <span>{connectionStatus}</span>
            </div>
            <div className="info-row">
              <strong>Notificações carregadas</strong>
              <span>{notifications.length}</span>
            </div>
            <div className="info-row">
              <strong>Origem</strong>
              <span>Gateway `/ws` com broker STOMP do serviço de notificações.</span>
            </div>
          </div>
        </article>
      </section>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">HISTÓRICO OPERACIONAL</p>
            <h2>Feed de notificações</h2>
          </div>
        </div>

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
      </article>
    </div>
  );
}
