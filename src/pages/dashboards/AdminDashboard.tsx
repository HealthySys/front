import { useEffect, useState } from "react";
import { Activity, Bell, Server, UserCheck, Users } from "lucide-react";
import { useToast } from "../../components/feedback/ToastProvider";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { QueueCard } from "../../components/ui/QueueCard";
import { api } from "../../services/api";
import type { Notification, TriageEntry, User } from "../../types";
import { Colors } from "../../design/tokens";
import { formatDateTime, normalizeError, severityLabel, statusLabel } from "../../utils/formatters";
import styles from "./Dashboard.module.css";

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

function severityClass(severity?: string) {
  switch (severity) {
    case "CRITICAL":
      return styles.severityCritical;
    case "WARNING":
      return styles.severityWarning;
    default:
      return styles.severityInfo;
  }
}

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

        if (!active) return;

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
        if (active) toast.error(normalizeError(loadError));
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [toast]);

  if (loading) {
    return <div className={styles.loader}>Carregando visão administrativa…</div>;
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow="Visão administrativa"
        title={`Olá, ${user.nome.split(" ")[0]} 👋`}
        description="Indicadores gerais da plataforma e saúde dos serviços distribuídos."
      />

      <section className={styles.statsGrid}>
        <StatCard
          label="Gateway"
          value={snapshot.gatewayStatus}
          subtitle="Ponto de entrada HTTP"
          color={Colors.accent}
          icon={<Server size={18} />}
        />
        <StatCard
          label="Usuários"
          value={snapshot.users}
          subtitle="Perfis cadastrados"
          color={Colors.text2}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Pacientes ativos"
          value={snapshot.activePatients}
          subtitle={`${snapshot.patients} no total`}
          color={Colors.success}
          icon={<UserCheck size={18} />}
        />
        <StatCard
          label="Fila de triagem"
          value={snapshot.triageQueue}
          subtitle="Aguardando médico"
          color={Colors.warning}
          icon={<Activity size={18} />}
        />
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.section}>
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Filas e risco</p>
              <h2 className={styles.sectionTitle}>Casos em atenção</h2>
            </div>
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
            <div className={styles.empty}>Nenhum caso na fila neste momento.</div>
          )}
        </article>

        <article className={styles.section}>
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.kicker}>Comunicação operacional</p>
              <h2 className={styles.sectionTitle}>Últimas notificações</h2>
            </div>
          </header>
          {snapshot.recentNotifications.length ? (
            <div className={styles.cardList}>
              {snapshot.recentNotifications.map((notification) => (
                <div key={notification.id} className={styles.urgentNotice}>
                  <Bell className={`${styles.urgentNoticeIcon} ${severityClass(notification.severity)}`} size={18} />
                  <div className={styles.urgentNoticeBody}>
                    <strong>
                      {notification.title}{" "}
                      <span className={severityClass(notification.severity)} style={{ fontSize: 11 }}>
                        · {severityLabel(notification.severity)}
                      </span>
                    </strong>
                    <p>{notification.message}</p>
                    <small>{formatDateTime(notification.timestamp)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>Nenhuma notificação recente.</div>
          )}
        </article>
      </section>
    </div>
  );
}
