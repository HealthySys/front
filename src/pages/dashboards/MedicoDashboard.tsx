import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, Bell, CheckCircle2, RefreshCw, Users } from "lucide-react";
import { useToast } from "../../components/feedback/ToastProvider";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Button } from "../../components/ui/Button";
import { QueueCard } from "../../components/ui/QueueCard";
import { RiskBadge } from "../../components/ui/RiskBadge";
import { api } from "../../services/api";
import type { Notification, TriageEntry, User } from "../../types";
import { Colors } from "../../design/tokens";
import { formatDateTime, normalizeError, riskSla, statusLabel } from "../../utils/formatters";
import styles from "./Dashboard.module.css";

interface MedicoDashboardProps {
  user: User;
}

interface MedicoSnapshot {
  queue: TriageEntry[];
  inProgress: TriageEntry[];
  attendedToday: number;
  notifications: Notification[];
}

const emptySnapshot: MedicoSnapshot = {
  queue: [],
  inProgress: [],
  attendedToday: 0,
  notifications: []
};

function isToday(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

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
        attendedToday: allTriage.filter(
          (entry) => entry.status === "ATENDIDO" && isToday(entry.triageDate)
        ).length,
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
    .slice(0, 3);

  if (loading) {
    return <div className={styles.loader}>Carregando seu painel clínico…</div>;
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow="Visão do médico"
        title={`Olá, Dr(a). ${user.nome.split(" ")[0]} 👋`}
        description="Acompanhe a fila priorizada, casos em atendimento e os alertas críticos do plantão."
      />

      <section className={styles.statsGrid}>
        <StatCard
          label="Fila aguardando"
          value={snapshot.queue.length}
          subtitle="Triados, prontos para chamar"
          color={Colors.accent}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Casos críticos"
          value={criticalCount}
          subtitle="Vermelho ou Laranja"
          color={Colors.riskVermelho}
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          label="Em atendimento"
          value={snapshot.inProgress.length}
          subtitle="Pacientes em consulta"
          color={Colors.warning}
          icon={<Activity size={18} />}
        />
        <StatCard
          label="Atendidos hoje"
          value={snapshot.attendedToday}
          subtitle="Encerrados na sua jornada"
          color={Colors.success}
          icon={<CheckCircle2 size={18} />}
        />
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.section}>
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Próximo paciente</p>
              <h2 className={styles.sectionTitle}>Atender agora</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void loadDashboard()}>
              <RefreshCw size={14} />
              Atualizar
            </Button>
          </header>

          {nextPatient ? (
            <QueueCard
              name={nextPatient.patientName}
              risk={nextPatient.riskClassification}
              meta={`${riskSla(nextPatient.riskClassification)} · Triado em ${formatDateTime(nextPatient.triageDate)}`}
              complaint={nextPatient.chiefComplaint || "Sem queixa principal registrada."}
              subMeta={statusLabel(nextPatient.status)}
            >
              <div className={styles.actions}>
                <Button
                  size="sm"
                  disabled={startingId === nextPatient.id}
                  onClick={() => void handleStartAttendance(nextPatient)}
                >
                  {startingId === nextPatient.id ? "Iniciando..." : "Iniciar atendimento"}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => navigate("/app/triagem")}>
                  Ver fila
                </Button>
              </div>
            </QueueCard>
          ) : (
            <div className={styles.empty}>Nenhum paciente aguardando atendimento agora.</div>
          )}
        </article>

        <article className={`${styles.section}${urgentCases.length ? ` ${styles.sectionDanger}` : ""}`}>
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.kicker} style={{ color: Colors.danger }}>
                Casos urgentes
              </p>
              <h2 className={styles.sectionTitle}>Vermelho e Laranja</h2>
            </div>
            {urgentCases.length ? <span className={styles.dangerCount}>{urgentCases.length}</span> : null}
          </header>
          {urgentCases.length ? (
            <div className={styles.cardList}>
              {urgentCases.map((entry) => (
                <QueueCard
                  key={entry.id}
                  compact
                  name={entry.patientName}
                  risk={entry.riskClassification}
                  subMeta={`${entry.chiefComplaint || "Sem queixa registrada."} · ${formatDateTime(entry.triageDate)}`}
                >
                  <div className={styles.actions}>
                    <Button
                      size="sm"
                      disabled={startingId === entry.id}
                      onClick={() => void handleStartAttendance(entry)}
                    >
                      {startingId === entry.id ? "Iniciando..." : "Iniciar atendimento"}
                    </Button>
                  </div>
                </QueueCard>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>Nenhum caso crítico aguardando.</div>
          )}
        </article>
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.section}>
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Fila em seguida</p>
              <h2 className={styles.sectionTitle}>Próximos pacientes</h2>
            </div>
          </header>
          {upcoming.length ? (
            <div className={styles.cardList}>
              {upcoming.map((entry, index) => (
                <div key={entry.id} className={styles.numberedItem}>
                  <span className={styles.numberCircle}>{index + 1}</span>
                  <div className={styles.numberedItemBody}>
                    <strong>{entry.patientName}</strong>
                    <small>Triado em {formatDateTime(entry.triageDate)}</small>
                  </div>
                  <RiskBadge risk={entry.riskClassification} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>Nenhum outro paciente na fila no momento.</div>
          )}
        </article>

        <article className={styles.section}>
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Alertas críticos</p>
              <h2 className={styles.sectionTitle}>Notificações urgentes</h2>
            </div>
          </header>
          {criticalNotifications.length ? (
            <div className={styles.cardList}>
              {criticalNotifications.map((notification) => (
                <div key={notification.id} className={styles.urgentNotice}>
                  <Bell className={styles.urgentNoticeIcon} size={18} />
                  <div className={styles.urgentNoticeBody}>
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <small>{formatDateTime(notification.timestamp)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>Nenhum alerta crítico recente.</div>
          )}
        </article>
      </section>
    </div>
  );
}
