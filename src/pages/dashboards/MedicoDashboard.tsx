import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/feedback/ToastProvider";
import { PageHeader } from "../../components/layout/PageHeader";
import { api } from "../../services/api";
import type { Notification, TriageEntry, User } from "../../types";
import {
  formatDateTime,
  normalizeError,
  riskLabel,
  riskSla,
  severityLabel,
  statusLabel
} from "../../utils/formatters";

interface MedicoDashboardProps {
  user: User;
}

interface MedicoSnapshot {
  queue: TriageEntry[];
  inProgress: TriageEntry[];
  notifications: Notification[];
}

const emptySnapshot: MedicoSnapshot = {
  queue: [],
  inProgress: [],
  notifications: []
};

export function MedicoDashboard({ user }: MedicoDashboardProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [snapshot, setSnapshot] = useState<MedicoSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const [queue, allTriage, notifications] = await Promise.all([
        api.listTriageQueue(),
        api.listTriage(),
        api.listNotifications()
      ]);

      setSnapshot({
        queue,
        inProgress: allTriage.filter((entry) => entry.status === "EM_ATENDIMENTO"),
        notifications
      });
    } catch (loadError) {
      toast.error(normalizeError(loadError));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleStartAttendance = async (entry: TriageEntry) => {
    setStartingId(entry.id);

    try {
      await api.updateTriageStatus(entry.id, "EM_ATENDIMENTO");
      toast.success(`Atendimento iniciado para ${entry.patientName}.`);
      navigate(`/app/atendimento/${entry.id}`);
    } catch (error) {
      toast.error(normalizeError(error));
      setStartingId(null);
    }
  };

  const criticalCount = snapshot.queue.filter(
    (entry) => entry.riskClassification === "VERMELHO" || entry.riskClassification === "LARANJA"
  ).length;

  const nextPatient = snapshot.queue[0];
  const urgentCases = snapshot.queue
    .filter((entry) => entry.riskClassification === "VERMELHO" || entry.riskClassification === "LARANJA")
    .slice(0, 5);
  const upcoming = snapshot.queue.slice(1, 5);
  const criticalNotifications = snapshot.notifications
    .filter((notification) => notification.severity === "CRITICAL")
    .slice(0, 5);

  if (loading) {
    return (
      <div className="page-stack">
        <article className="panel">
          <div className="empty-state">Carregando seu painel clínico...</div>
        </article>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="VISÃO DO MÉDICO"
        title={`Olá, Dr(a). ${user.nome}`}
        description="Acompanhe a fila priorizada, casos em atendimento e os alertas críticos do plantão."
      />

      <section className="stats-grid">
        <article className="stat-card">
          <span>Fila aguardando</span>
          <strong>{snapshot.queue.length}</strong>
          <small>Triados, prontos para chamar.</small>
        </article>
        <article className="stat-card">
          <span>Casos críticos</span>
          <strong>{criticalCount}</strong>
          <small>Vermelho ou Laranja na fila.</small>
        </article>
        <article className="stat-card">
          <span>Em atendimento</span>
          <strong>{snapshot.inProgress.length}</strong>
          <small>Pacientes em consulta agora.</small>
        </article>
      </section>

      <section className="content-grid two-columns">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">PRÓXIMO PACIENTE</p>
              <h2>Atender agora</h2>
            </div>
            <button type="button" className="button ghost" onClick={() => void loadDashboard()}>
              Atualizar
            </button>
          </div>

          {nextPatient ? (
            <div className="list-card next-patient-card">
              <div className="list-card-top">
                <strong>{nextPatient.patientName}</strong>
                <span className={`pill risk ${nextPatient.riskClassification.toLowerCase()}`}>
                  {riskLabel(nextPatient.riskClassification)}
                </span>
              </div>
              <small>{riskSla(nextPatient.riskClassification)}</small>
              <p>{nextPatient.chiefComplaint || "Sem queixa principal registrada."}</p>
              <small>
                {statusLabel(nextPatient.status)} • Triado em {formatDateTime(nextPatient.triageDate)}
              </small>
              <div className="form-actions">
                <button
                  type="button"
                  className="button"
                  disabled={startingId === nextPatient.id}
                  onClick={() => void handleStartAttendance(nextPatient)}
                >
                  {startingId === nextPatient.id ? "Iniciando..." : "Iniciar atendimento"}
                </button>
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => navigate("/app/triagem")}
                >
                  Ver fila
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">Nenhum paciente aguardando atendimento agora.</div>
          )}
        </article>

        <article className="panel urgent-panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">CASOS URGENTES</p>
              <h2>Vermelho e Laranja</h2>
            </div>
            <span className="urgent-count">{urgentCases.length}</span>
          </div>
          {urgentCases.length ? (
            <div className="list-stack">
              {urgentCases.map((entry) => (
                <div key={entry.id} className="list-card urgent-card">
                  <div className="list-card-top">
                    <strong>{entry.patientName}</strong>
                    <span className={`pill risk ${entry.riskClassification.toLowerCase()}`}>
                      {riskLabel(entry.riskClassification)}
                    </span>
                  </div>
                  <small>
                    {entry.chiefComplaint || "Sem queixa registrada."} • {formatDateTime(entry.triageDate)}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Nenhum caso crítico aguardando.</div>
          )}
        </article>
      </section>

      <section className="content-grid two-columns">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">FILA EM SEGUIDA</p>
              <h2>Próximos pacientes</h2>
            </div>
          </div>
          {upcoming.length ? (
            <div className="list-stack">
              {upcoming.map((entry) => (
                <div key={entry.id} className="list-card">
                  <div className="list-card-top">
                    <strong>{entry.patientName}</strong>
                    <span className={`pill risk ${entry.riskClassification.toLowerCase()}`}>
                      {riskLabel(entry.riskClassification)}
                    </span>
                  </div>
                  <small>Triado em {formatDateTime(entry.triageDate)}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Nenhum outro paciente na fila no momento.</div>
          )}
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">ALERTAS CRÍTICOS</p>
              <h2>Notificações urgentes</h2>
            </div>
          </div>
          {criticalNotifications.length ? (
            <div className="list-stack">
              {criticalNotifications.map((notification) => (
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
            <div className="empty-state">Nenhum alerta crítico recente.</div>
          )}
        </article>
      </section>
    </div>
  );
}
