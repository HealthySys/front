import { useEffect, useState } from "react";
import { useToast } from "../../components/feedback/ToastProvider";
import { PageHeader } from "../../components/layout/PageHeader";
import { api } from "../../services/api";
import type { Notification, TriageEntry, User } from "../../types";
import {
  formatDateTime,
  normalizeError,
  riskLabel,
  severityLabel,
  statusLabel
} from "../../utils/formatters";

interface AdminDashboardProps {
  user: User;
}

interface AdminSnapshot {
  gatewayStatus: string;
  users: number;
  patients: number;
  activePatients: number;
  triageQueue: number;
  records: number;
  recentTriage: TriageEntry[];
  recentNotifications: Notification[];
}

const emptySnapshot: AdminSnapshot = {
  gatewayStatus: "Verificando...",
  users: 0,
  patients: 0,
  activePatients: 0,
  triageQueue: 0,
  records: 0,
  recentTriage: [],
  recentNotifications: []
};

export function AdminDashboard({ user }: AdminDashboardProps) {
  const toast = useToast();
  const [snapshot, setSnapshot] = useState<AdminSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const [gateway, users, patients, queue, records, notifications] = await Promise.all([
          api.checkGateway().catch(() => ({ status: "Indisponível" })),
          api.listUsers(),
          api.listPatients(),
          api.listTriageQueue(),
          api.listRecords(),
          api.listNotifications()
        ]);

        if (!active) {
          return;
        }

        setSnapshot({
          gatewayStatus: gateway.status,
          users: users.length,
          patients: patients.length,
          activePatients: patients.filter((patient) => patient.ativo).length,
          triageQueue: queue.length,
          records: records.length,
          recentTriage: queue.slice(0, 5),
          recentNotifications: notifications.slice(0, 5)
        });
      } catch (loadError) {
        if (active) {
          toast.error(normalizeError(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="page-stack">
        <article className="panel">
          <div className="empty-state">Carregando visão administrativa...</div>
        </article>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="VISÃO ADMINISTRATIVA"
        title={`Olá, ${user.nome}`}
        description="Indicadores gerais da plataforma e saúde dos serviços distribuídos."
      />

      <section className="stats-grid">
        <article className="stat-card">
          <span>Gateway</span>
          <strong>{snapshot.gatewayStatus}</strong>
          <small>Ponto de entrada HTTP.</small>
        </article>
        <article className="stat-card">
          <span>Usuários</span>
          <strong>{snapshot.users}</strong>
          <small>Perfis cadastrados na base.</small>
        </article>
        <article className="stat-card">
          <span>Pacientes ativos</span>
          <strong>{snapshot.activePatients}</strong>
          <small>Habilitados para atendimento.</small>
        </article>
        <article className="stat-card">
          <span>Fila de triagem</span>
          <strong>{snapshot.triageQueue}</strong>
          <small>Aguardando atendimento médico.</small>
        </article>
      </section>

      <section className="content-grid two-columns">
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
            <div className="empty-state">Nenhum caso na fila neste momento.</div>
          )}
        </article>

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
            <div className="empty-state">Nenhuma notificação recente.</div>
          )}
        </article>
      </section>
    </div>
  );
}
