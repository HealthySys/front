import { Client, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { Notification, Role, WebSocketSubscription } from "../types";

type NotificationHandler = (notification: Notification) => void;
type StatusHandler = (status: string) => void;

class HealthSysWebSocketService {
  private client: Client | null = null;

  private connected = false;

  private currentRole: Role | null = null;

  private subscriptions: StompSubscription[] = [];

  private statusListeners = new Set<StatusHandler>();

  private notificationListeners = new Set<NotificationHandler>();

  connect(role?: Role | null) {
    console.log("Attempting WebSocket connection with role:", role);
    if (this.client?.active || this.connected) {
      if (role && role !== this.currentRole) {
        this.currentRole = role;
        this.refreshSubscriptions();
      }
      return;
    }

    this.currentRole = role ?? null;
    this.emitStatus("Conectando...");

    this.client = new Client({
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS("/ws/notifications"),
      onConnect: () => {
        this.connected = true;
        this.emitStatus("Conectado em tempo real");
        this.refreshSubscriptions();
      },
      onStompError: () => {
        this.emitStatus("Falha no broker");
      },
      onWebSocketClose: () => {
        this.connected = false;
        this.subscriptions = [];
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
    this.subscriptions = [];
    this.currentRole = null;
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

  private refreshSubscriptions() {
    if (!this.client || !this.connected) return;

    this.subscriptions.forEach((sub) => {
      try {
        sub.unsubscribe();
      } catch {
      }
    });
    this.subscriptions = [];

    const topics = this.topicsForRole(this.currentRole);
    topics.forEach((topic) => {
      const sub = this.client?.subscribe(topic, (message) => {
        this.handleMessage(message.body);
      });
      if (sub) this.subscriptions.push(sub);
    });
  }

  private topicsForRole(role: Role | null): string[] {
    const topics = ["/topic/notifications", "/topic/alerts"];
    if (role === "MEDICO") {
      topics.push("/topic/notifications/medico", "/topic/alerts/medico");
    }
    if (role === "ENFERMEIRO") {
      topics.push("/topic/notifications/enfermeiro", "/topic/alerts/enfermeiro");
    }
    return topics;
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
