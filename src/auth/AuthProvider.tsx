import { createContext, useContext, useEffect, useState } from "react";
import type { AuthResponse, LoginPayload, User } from "../types";
import { api, SESSION_STORAGE_KEY, TOKEN_STORAGE_KEY } from "../services/api";
import { healthSysWebSocket } from "../services/websocket";

interface AuthContextValue {
  token: string | null;
  session: AuthResponse | null;
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession() {
  const stored = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthResponse;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [session, setSession] = useState<AuthResponse | null>(() => readStoredSession());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setToken(null);
    setSession(null);
    setUser(null);
  };

  const persistSession = (nextToken: string, nextSession: AuthResponse) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    setToken(nextToken);
    setSession(nextSession);
  };

  const refreshProfile = async () => {
    const profile = await api.getCurrentUser();

    if (!profile.active) {
      clearSession();
      throw new Error("Seu usuário está inativo. Fale com a administração.");
    }

    setUser(profile);
  };

  const login = async (payload: LoginPayload) => {
    const nextSession = await api.login(payload);
    persistSession(nextSession.token, nextSession);
    healthSysWebSocket.connect();

    const profile = await api.getCurrentUser();

    if (!profile.active) {
      clearSession();
      throw new Error("Seu usuário está inativo. Fale com a administração.");
    }

    setUser(profile);
    return profile;
  };

  const logout = async () => {
    if (session?.refreshToken) {
      try {
        await api.logout(session.refreshToken);
      } catch {
        // O logout local ainda deve ocorrer mesmo se o backend nao responder.
      }
    }
    await healthSysWebSocket.disconnect();
    clearSession();
    setIsLoading(false);
  };

  useEffect(() => {
    let active = true;

    if (!token) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    api
      .getCurrentUser()
      .then((profile) => {
        if (!active) {
          return;
        }

        if (!profile.active) {
          clearSession();
          return;
        }

        healthSysWebSocket.connect();
        setUser(profile);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        void healthSysWebSocket.disconnect();
        clearSession();
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!session?.refreshToken || !session.expiresIn) {
      return undefined;
    }

    const refreshDelayMs = Math.max((session.expiresIn - 300) * 1000, 1000);
    const timer = window.setTimeout(() => {
      void api.refreshToken(session.refreshToken)
        .then((nextSession) => {
          persistSession(nextSession.token, nextSession);
        })
        .catch(() => {
          clearSession();
        });
    }, refreshDelayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        token,
        session,
        user,
        isLoading,
        login,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa ser usado dentro do AuthProvider.");
  }

  return context;
}
