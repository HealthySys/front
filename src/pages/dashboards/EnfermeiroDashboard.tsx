import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ClipboardCheck, Plus, Send, Users } from "lucide-react";
import { useToast } from "../../components/feedback/ToastProvider";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Button } from "../../components/ui/Button";
import { QueueCard } from "../../components/ui/QueueCard";
import { useNotificationCenter } from "../../features/notifications/NotificationCenter";
import { api } from "../../services/api";
import type { Patient, TriageEntry, User } from "../../types";
import { Colors } from "../../design/tokens";
import { formatDateTime, normalizeError, statusLabel } from "../../utils/formatters";
import styles from "./Dashboard.module.css";

interface EnfermeiroDashboardProps {
  user: User;
}

interface EnfermeiroSnapshot {
  activePatients: Patient[];
  recentTriage: TriageEntry[];
  triages: TriageEntry[];
  queue: TriageEntry[];
}

const emptySnapshot: EnfermeiroSnapshot = {
  activePatients: [],
  recentTriage: [],
  triages: [],
  queue: []
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

export function EnfermeiroDashboard({ user }: EnfermeiroDashboardProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { notifications, markRead } = useNotificationCenter();
  const [snapshot, setSnapshot] = useState<EnfermeiroSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const [patients, triages, queue] = await Promise.all([
        api.listPatients(true),
        api.listTriage(),
        api.listTriageQueue()
      ]);

      const sortedTriage = [...triages].sort((a, b) => {
        const aDate = a.triageDate ? new Date(a.triageDate).getTime() : 0;
        const bDate = b.triageDate ? new Date(b.triageDate).getTime() : 0;
        return bDate - aDate;
      });

      setSnapshot({
        activePatients: patients,
        recentTriage: sortedTriage.slice(0, 5),
        triages,
        queue
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

  const waitingForTriage = useMemo(() => {
    const seen = new Set<number>();
    return notifications
      .filter((notification) => notification.type === "PATIENT_FORWARDED" && notification.patientId)
      .filter((notification) => {
        const notifTime = notification.timestamp ? new Date(notification.timestamp).getTime() : 0;
        const hasTriageAfter = snapshot.triages.some(
          (triage) =>
            triage.patientId === notification.patientId &&
            triage.triageDate &&
            new Date(triage.triageDate).getTime() >= notifTime
        );
        return !hasTriageAfter;
      })
      .filter((notification) => {
        if (!notification.patientId || seen.has(notification.patientId)) return false;
        seen.add(notification.patientId);
        return true;
      });
  }, [notifications, snapshot.triages]);

  const handleStartTriage = (patientId: number, notificationId?: string) => {
    if (notificationId) markRead(notificationId);
    navigate(`/app/triagem/nova?patientId=${patientId}`);
  };

  const myTriagesToday = snapshot.recentTriage.filter(
    (entry) => entry.nurseId === user.id && isToday(entry.triageDate)
  );

  if (loading) {
    return <div className={styles.loader}>Carregando seu painel de triagem…</div>;
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow="Visão do enfermeiro"
        title={`Olá, ${user.nome.split(" ")[0]} 👋`}
        description="Pacientes prontos para triagem, suas classificações recentes e a fila atual da unidade."
        actions={
          <Button onClick={() => navigate("/app/triagem/nova")}>
            <Plus size={14} />
            Nova triagem
          </Button>
        }
      />

      <section className={styles.statsGrid}>
        <StatCard
          label="Aguardando triagem"
          value={waitingForTriage.length}
          subtitle="Encaminhados pela recepção"
          color={Colors.danger}
          icon={<Send size={18} />}
        />
        <StatCard
          label="Pacientes ativos"
          value={snapshot.activePatients.length}
          subtitle="Disponíveis para triagem"
          color={Colors.accent}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Suas triagens hoje"
          value={myTriagesToday.length}
          subtitle="Classificações registradas"
          color={Colors.success}
          icon={<ClipboardCheck size={18} />}
        />
        <StatCard
          label="Fila atual"
          value={snapshot.queue.length}
          subtitle="Aguardando médico"
          color={Colors.warning}
          icon={<Activity size={18} />}
        />
      </section>

      <article className={`${styles.section}${waitingForTriage.length ? ` ${styles.sectionDanger}` : ""}`}>
        <header className={styles.sectionHead}>
          <div>
            <p className={styles.kicker}>Recém-chegados</p>
            <h2 className={styles.sectionTitle}>Pacientes aguardando triagem</h2>
          </div>
          {waitingForTriage.length ? (
            <span className={styles.dangerCount}>{waitingForTriage.length}</span>
          ) : null}
        </header>
        {waitingForTriage.length ? (
          <div className={styles.cardList}>
            {waitingForTriage.map((notification) => (
              <QueueCard
                key={notification.id}
                name={notification.patientName ?? "Paciente"}
                subMeta={
                  notification.timestamp
                    ? `Encaminhado em ${formatDateTime(notification.timestamp)}`
                    : "Encaminhado pela recepção"
                }
              >
                <Button
                  size="sm"
                  onClick={() =>
                    handleStartTriage(notification.patientId!, notification.id)
                  }
                >
                  <Plus size={14} />
                  Iniciar triagem
                </Button>
              </QueueCard>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>Nenhum paciente aguardando triagem no momento.</div>
        )}
      </article>

      <section className={styles.mainGrid}>
        <article className={styles.section}>
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Suas triagens recentes</p>
              <h2 className={styles.sectionTitle}>Últimas classificações</h2>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate("/app/triagem")}>
              Ver todas
            </Button>
          </header>
          {snapshot.recentTriage.length ? (
            <div className={styles.cardList}>
              {snapshot.recentTriage.map((entry) => (
                <QueueCard
                  key={entry.id}
                  name={entry.patientName}
                  risk={entry.riskClassification}
                  meta={`${statusLabel(entry.status)} · ${formatDateTime(entry.triageDate)}`}
                  complaint={entry.chiefComplaint || "Sem queixa principal registrada."}
                />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>Nenhuma triagem registrada ainda.</div>
          )}
        </article>

        <article className={styles.section}>
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Fila aguardando médico</p>
              <h2 className={styles.sectionTitle}>Pacientes triados</h2>
            </div>
          </header>
          {snapshot.queue.length ? (
            <div className={styles.cardList}>
              {snapshot.queue.slice(0, 5).map((entry) => (
                <QueueCard
                  key={entry.id}
                  compact
                  name={entry.patientName}
                  risk={entry.riskClassification}
                  subMeta={`Triado em ${formatDateTime(entry.triageDate)}`}
                />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>Nenhum paciente na fila no momento.</div>
          )}
        </article>
      </section>
    </div>
  );
}
