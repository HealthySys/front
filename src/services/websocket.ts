import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { Notification, WebSocketSubscription } from "../types";

type NotificationHandler = (notification: Notification) => void;
type StatusHandler = (status: string) => void;

class HealthSysWebSocketService {
  private client: Client | null = null;

  private connected = false;

  private statusListeners = new Set<StatusHandler>();

  private notificationListeners = new Set<NotificationHandler>();

  connect() {
    if (this.client?.active || this.connected) {
      return;
    }

    this.emitStatus("Conectando...");

    this.client = new Client({
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS("/ws/notifications"),
      onConnect: () => {
        this.connected = true;
        this.emitStatus("Conectado em tempo real");

        this.client?.subscribe("/topic/notifications", (message) => {
          this.handleMessage(message.body);
        });

        this.client?.subscribe("/topic/alerts", (message) => {
          this.handleMessage(message.body);
        });
      },
      onStompError: () => {
        this.emitStatus("Falha no broker");
      },
      onWebSocketClose: () => {
        this.connected = false;
        this.emitStatus("Conexão encerrada");
      }
    });

    this.client.activate();
  }

  async disconnect() {
    if (!this.client) {
      this.connected = false;
      return;
    }

    const activeClient = this.client;
    this.client = null;
    this.connected = false;
    await activeClient.deactivate();
    this.emitStatus("Desconectado");
  }

  onStatusChange(handler: StatusHandler): WebSocketSubscription {
    this.statusListeners.add(handler);
    return {
      unsubscribe: () => {
        this.statusListeners.delete(handler);
      }
    };
  }

  onNotification(handler: NotificationHandler): WebSocketSubscription {
    this.notificationListeners.add(handler);
    return {
      unsubscribe: () => {
        this.notificationListeners.delete(handler);
      }
    };
  }

  private handleMessage(body: string) {
    try {
      const notification = JSON.parse(body) as Notification;
      this.notificationListeners.forEach((listener) => listener(notification));
    } catch {
      this.emitStatus("Conectado com alerta de leitura");
    }
  }

  private emitStatus(status: string) {
    this.statusListeners.forEach((listener) => listener(status));
  }
}

export const healthSysWebSocket = new HealthSysWebSocketService();
