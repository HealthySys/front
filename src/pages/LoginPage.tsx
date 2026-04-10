import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { initialRouteForRole } from "../config/permissions";
import { api } from "../services/api";
import { normalizeError } from "../utils/formatters";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [bootstrapError, setBootstrapError] = useState("");
  const [bootstrapRequired, setBootstrapRequired] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordConfirmation, setAdminPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bootstrapSubmitting, setBootstrapSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    api
      .getBootstrapStatus()
      .then((status) => {
        if (!active) {
          return;
        }

        setBootstrapRequired(status.bootstrapRequired);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setBootstrapRequired(false);
      })
      .finally(() => {
        if (active) {
          setBootstrapLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const profile = await login({ username, password });
      navigate(initialRouteForRole(profile.role), { replace: true });
    } catch (submitError) {
      setError(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBootstrapSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBootstrapError("");

    if (adminPassword !== adminPasswordConfirmation) {
      setBootstrapError("A confirmação de senha não confere.");
      return;
    }

    setBootstrapSubmitting(true);

    try {
      await api.register({
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        role: "ADMIN"
      });

      setUsername(adminUsername);
      setPassword(adminPassword);
      setBootstrapRequired(false);

      const profile = await login({ username: adminUsername, password: adminPassword });
      navigate(initialRouteForRole(profile.role), { replace: true });
    } catch (submitError) {
      setBootstrapError(normalizeError(submitError));
    } finally {
      setBootstrapSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-card">
        <div className="login-card-head">
          <p className="page-eyebrow">ACESSO À PLATAFORMA</p>
          <h3>{bootstrapRequired ? "Primeiro acesso" : "Entrar"}</h3>
          <p>
            {bootstrapRequired
              ? "Nenhum usuário foi encontrado. Crie o administrador inicial para começar o projeto."
              : "Use seu usuário ou e-mail para acessar as telas liberadas ao seu perfil."}
          </p>
        </div>

        {bootstrapLoading ? (
          <div className="info-panel">
            <strong>Verificando ambiente</strong>
            <p>Estamos validando se este é o primeiro acesso do HealthSys.</p>
          </div>
        ) : bootstrapRequired ? (
          <form className="stack-form" onSubmit={handleBootstrapSubmit}>
            <label className="field">
              <span>Usuário administrador</span>
              <input
                value={adminUsername}
                onChange={(event) => setAdminUsername(event.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
              />
            </label>

            <label className="field">
              <span>E-mail administrativo</span>
              <input
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                type="email"
                placeholder="admin@healthsys.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              <span>Senha</span>
              <input
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                type="password"
                placeholder="Senha com letra maiúscula, minúscula, número e símbolo"
                autoComplete="new-password"
                required
              />
            </label>

            <label className="field">
              <span>Confirmar senha</span>
              <input
                value={adminPasswordConfirmation}
                onChange={(event) => setAdminPasswordConfirmation(event.target.value)}
                type="password"
                placeholder="Repita a senha"
                autoComplete="new-password"
                required
              />
            </label>

            <button type="submit" className="button" disabled={bootstrapSubmitting || isLoading}>
              {bootstrapSubmitting ? "Criando acesso inicial..." : "Criar administrador inicial"}
            </button>
          </form>
        ) : (
          <form className="stack-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Usuário ou e-mail</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin ou admin@example.com"
                autoComplete="username"
                required
              />
            </label>

            <label className="field">
              <span>Senha</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Sua senha"
                autoComplete="current-password"
                required
              />
            </label>

            <button type="submit" className="button" disabled={submitting || isLoading}>
              {submitting ? "Autenticando..." : "Entrar no HealthSys"}
            </button>
          </form>
        )}

        {error ? <div className="alert error">{error}</div> : null}
        {bootstrapError ? <div className="alert error">{bootstrapError}</div> : null}
      </section>
    </div>
  );
}
