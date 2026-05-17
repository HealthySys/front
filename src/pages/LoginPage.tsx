import { FormEvent, useEffect, useState } from "react";
import { Activity, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { initialRouteForRole } from "../config/permissions";
import { api } from "../services/api";
import { normalizeError } from "../utils/formatters";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { InputField } from "../components/ui/FormField";
import fieldStyles from "../components/ui/FormField.module.css";
import styles from "./LoginPage.module.css";

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
  const [adminNome, setAdminNome] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordConfirmation, setAdminPasswordConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bootstrapSubmitting, setBootstrapSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [adminPasswordVisible, setAdminPasswordVisible] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .getBootstrapStatus()
      .then((status) => {
        if (active) setBootstrapRequired(status.bootstrapRequired);
      })
      .catch(() => {
        if (active) setBootstrapRequired(false);
      })
      .finally(() => {
        if (active) setBootstrapLoading(false);
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
        nome: adminNome,
        email: adminEmail,
        password: adminPassword,
        role: "ADMIN"
      });
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
    <div className={styles.page}>
      <section className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Activity size={20} strokeWidth={2.2} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>HealthSys</span>
            <span className={styles.brandSub}>Plataforma hospitalar v2.0</span>
          </div>
        </div>

        <div className={styles.head}>
          <p className={styles.eyebrow}>Acesso à plataforma</p>
          <h1 className={styles.title}>{bootstrapRequired ? "Primeiro acesso" : "Entrar"}</h1>
          <p className={styles.subtitle}>
            {bootstrapRequired
              ? "Nenhum usuário foi encontrado. Crie o administrador inicial para começar."
              : "Use seu usuário ou e-mail para acessar as telas liberadas ao seu perfil."}
          </p>
        </div>

        {bootstrapLoading ? (
          <div className={styles.notice}>Validando ambiente HealthSys…</div>
        ) : bootstrapRequired ? (
          <form className={styles.form} onSubmit={handleBootstrapSubmit}>
            <InputField
              label="Usuário administrador"
              required
              value={adminUsername}
              onChange={(event) => setAdminUsername(event.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
            <InputField
              label="Nome completo"
              required
              value={adminNome}
              onChange={(event) => setAdminNome(event.target.value)}
              placeholder="Administrador HealthSys"
            />
            <InputField
              label="E-mail administrativo"
              type="email"
              required
              value={adminEmail}
              onChange={(event) => setAdminEmail(event.target.value)}
              placeholder="admin@healthsys.com"
              autoComplete="email"
            />
            <InputField
              label="Senha"
              required
              type={adminPasswordVisible ? "text" : "password"}
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              placeholder="Maiúscula, minúscula, número e símbolo"
              autoComplete="new-password"
              endAdornment={
                <button
                  type="button"
                  className={fieldStyles.adornment}
                  onClick={() => setAdminPasswordVisible((v) => !v)}
                  aria-label={adminPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                >
                  {adminPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <InputField
              label="Confirmar senha"
              required
              type="password"
              value={adminPasswordConfirmation}
              onChange={(event) => setAdminPasswordConfirmation(event.target.value)}
              placeholder="Repita a senha"
              autoComplete="new-password"
            />
            {bootstrapError ? <Alert variant="error">{bootstrapError}</Alert> : null}
            <Button type="submit" disabled={bootstrapSubmitting || isLoading}>
              {bootstrapSubmitting ? "Criando acesso inicial…" : "Criar administrador inicial"}
            </Button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <InputField
              label="Usuário ou e-mail"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin ou admin@example.com"
              autoComplete="username"
            />
            <InputField
              label="Senha"
              required
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              endAdornment={
                <button
                  type="button"
                  className={fieldStyles.adornment}
                  onClick={() => setPasswordVisible((v) => !v)}
                  aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
                >
                  {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            {error ? <Alert variant="error">{error}</Alert> : null}
            <Button type="submit" disabled={submitting || isLoading}>
              {submitting ? "Autenticando…" : "Entrar no HealthSys"}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
