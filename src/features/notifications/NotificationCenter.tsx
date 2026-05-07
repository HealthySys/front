import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Notification } from "../../types";
import { healthSysWebSocket } from "../../services/websocket";
import { api } from "../../services/api";
import { useAuth } from "../../auth/AuthProvider";

interface NotificationCenterValue {
  notifications: Notification[];
  unreadIds: Set<string>;
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  refresh: () => Promise<void>;
}

const NotificationCenterContext = createContext<NotificationCenterValue | undefined>(undefined);

const READ_STORAGE_KEY = "healthsys.frontend.notifications.read";

function readStoredReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function persistReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
  }
}

export function NotificationCenterProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const readIdsRef = useRef<Set<string>>(readStoredReadIds());
  const [readIdsVersion, setReadIdsVersion] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const list = await api.listNotifications();
      setNotifications(list);
    } catch {
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    void refresh();
  }, [user, refresh]);

  useEffect(() => {
    const subscription = healthSysWebSocket.onNotification((incoming) => {
      setNotifications((current) => {
        const exists = current.some((item) => item.id === incoming.id);
        if (exists) return current;
        return [incoming, ...current];
      });
    });
    return () => subscription.unsubscribe();
  }, []);

  const markRead = useCallback((id: string) => {
    if (!id) return;
    if (readIdsRef.current.has(id)) return;
    readIdsRef.current.add(id);
    persistReadIds(readIdsRef.current);
    setReadIdsVersion((v) => v + 1);
  }, []);

  const markAllRead = useCallback(() => {
    let changed = false;
    notifications.forEach((item) => {
      if (item.id && !readIdsRef.current.has(item.id)) {
        readIdsRef.current.add(item.id);
        changed = true;
      }
    });
    if (changed) {
      persistReadIds(readIdsRef.current);
      setReadIdsVersion((v) => v + 1);
    }
  }, [notifications]);

  const value = useMemo<NotificationCenterValue>(() => {
    void readIdsVersion;
    const unreadIds = new Set<string>();
    notifications.forEach((item) => {
      if (item.id && !readIdsRef.current.has(item.id)) {
        unreadIds.add(item.id);
      }
    });
    return {
      notifications,
      unreadIds,
      unreadCount: unreadIds.size,
      markRead,
      markAllRead,
      refresh
    };
  }, [notifications, readIdsVersion, markRead, markAllRead, refresh]);

  return <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>;
}

export function useNotificationCenter() {
  const ctx = useContext(NotificationCenterContext);
  if (!ctx) {
    throw new Error("useNotificationCenter precisa ser usado dentro do NotificationCenterProvider.");
  }
  return ctx;
}
