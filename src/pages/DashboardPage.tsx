import { startTransition, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { PageHeader } from "../components/layout/PageHeader";
import { canAccess, modules } from "../config/permissions";
import { api } from "../services/api";
import type { Notification, TriageEntry } from "../types";
import { formatDateTime, normalizeError, riskLabel, roleLabel, severityLabel, statusLabel } from "../utils/formatters";

interface DashboardSnapshot {
  gatewayStatus: string;
  users: number;
  patients: number;
  activePatients: number;
  triageQueue: number;
  records: number;
  notifications: number;
  recentTriage: TriageEntry[];
  recentNotifications: Notification[];
}

const emptySnapshot: DashboardSnapshot = {
  gatewayStatus: "Verificando...",
  users: 0,
  patients: 0,
  activePatients: 0,
  triageQueue: 0,
  records: 0,
  notifications: 0,
  recentTriage: [],
  recentNotifications: []
};

export function DashboardPage() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          gatewayResult,
          usersResult,
          patientsResult,
          queueResult,
          recordsResult,
          notificationsResult
        ] = await Promise.all([
          api.checkGateway().catch(() => ({ status: "Indisponível" })),
          canAccess(user?.role, "usuarios") ? api.listUsers() : Promise.resolve([]),
          canAccess(user?.role, "pacientes") ? api.listPatients() : Promise.resolve([]),
          canAccess(user?.role, "triagem") ? api.listTriageQueue() : Promise.resolve([]),
          canAccess(user?.role, "prontuarios") ? api.listRecords() : Promise.resolve([]),
          canAccess(user?.role, "notificacoes") ? api.listNotifications() : Promise.resolve([])
        ]);

        if (!active) {
          return;
        }

        startTransition(() => {
          setSnapshot({
            gatewayStatus: gatewayResult.status,
            users: usersResult.length,
            patients: patientsResult.length,
            activePatients: patientsResult.filter((patient) => patient.ativo).length,
            triageQueue: queueResult.length,
            records: recordsResult.length,
            notifications: notificationsResult.length,
            recentTriage: queueResult.slice(0, 5),
            recentNotifications: notificationsResult.slice(0, 5)
          });
        });
      } catch (loadError) {
        if (active) {
          setError(normalizeError(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [user?.role]);

  const visibleModules = modules.filter((module) => canAccess(user?.role, module.key));

  return (
    <div className="page-stack">  
      <PageHeader
        title={`Olá, ${user?.username ?? "profissional"}`}
      />

      {error ? <div className="alert error">{error}</div> : null}

      <section className="stats-grid">
        {canAccess(user?.role, "usuarios") ? (
          <article className="stat-card">
            <span>Usuários</span>
            <strong>{snapshot.users}</strong>
            <small>Perfis administrativos e assistenciais cadastrados.</small>
          </article>
        ) : null}
        {canAccess(user?.role, "pacientes") ? (
          <>
            <article className="stat-card">
              <span>Pacientes</span>
              <strong>{snapshot.patients}</strong>
              <small>Cadastros totais disponíveis para o seu perfil.</small>
            </article>
            <article className="stat-card">
              <span>Pacientes ativos</span>
              <strong>{snapshot.activePatients}</strong>
              <small>Base atualmente habilitada para atendimento.</small>
            </article>
          </>
        ) : null}
        {canAccess(user?.role, "triagem") ? (
          <article className="stat-card">
            <span>Fila de triagem</span>
            <strong>{snapshot.triageQueue}</strong>
            <small>Casos aguardando atendimento conforme risco.</small>
          </article>
        ) : null}
        {canAccess(user?.role, "prontuarios") ? (
          <article className="stat-card">
            <span>Prontuários</span>
            <strong>{snapshot.records}</strong>
            <small>Registros clínicos disponíveis para consulta e evolução.</small>
          </article>
        ) : null}
        {/* {canAccess(user?.role, "notificacoes") ? (
          <article className="stat-card">
            <span>Notificações</span>
            <strong>{snapshot.notifications}</strong>
            <small>Eventos recentes e comunicados do ambiente.</small>
          </article>
        ) : null} */}
      </section>

      <section className="content-grid two-columns">
        {canAccess(user?.role, "triagem") ? (
          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">FILAS E RISCO</p>
                <h2>Casos em atenção</h2>
              </div>
            </div>
            {snapshot.recentTriage.length ? (
              <div className="list-stack">
                {snapshot.recentTriage.map((entry) => (
                  <div key={entry.id} className="list-card">
                    <div className="list-card-top">
                      <strong>{entry.patientName}</strong>
                      <span className={`pill risk ${entry.riskClassification.toLowerCase()}`}>
                        {riskLabel(entry.riskClassification)}
                      </span>
                    </div>
                    <p>{entry.chiefComplaint || "Sem queixa principal registrada."}</p>
                    <small>
                      {statusLabel(entry.status)} • {formatDateTime(entry.triageDate)}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">Nenhum caso aguardando na fila neste momento.</div>
            )}
          </article>
        ) : null}

        {canAccess(user?.role, "notificacoes") ? (
          <article className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">COMUNICAÇÃO OPERACIONAL</p>
                <h2>Últimas notificações</h2>
              </div>
            </div>
            {snapshot.recentNotifications.length ? (
              <div className="list-stack">
                {snapshot.recentNotifications.map((notification) => (
                  <div key={notification.id} className="list-card">
                    <div className="list-card-top">
                      <strong>{notification.title}</strong>
                      <span className={`pill severity ${notification.severity?.toLowerCase()}`}>
                        {severityLabel(notification.severity)}
                      </span>
                    </div>
                    <p>{notification.message}</p>
                    <small>{formatDateTime(notification.timestamp)}</small>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">Nenhuma notificação recente disponível.</div>
            )}
          </article>
        ) : null}
      </section>
    </div>
  );
}
