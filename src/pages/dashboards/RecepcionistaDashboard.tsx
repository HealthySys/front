import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, UserCheck, Users, UserX } from "lucide-react";
import { useToast } from "../../components/feedback/ToastProvider";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { api } from "../../services/api";
import type { Patient, User } from "../../types";
import { Colors } from "../../design/tokens";
import { formatDate, normalizeError, sexoLabel } from "../../utils/formatters";
import styles from "./Dashboard.module.css";

interface RecepcionistaDashboardProps {
  user: User;
}

export function RecepcionistaDashboard({ user }: RecepcionistaDashboardProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const response = await api.listPatients();
        if (!active) return;
        setPatients(response);
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

  const activePatients = patients.filter((patient) => patient.ativo);
  const recentPatients = [...patients]
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 5);

  if (loading) {
    return <div className={styles.loader}>Carregando seu painel de recepção…</div>;
  }

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow="Visão da recepção"
        title={`Olá, ${user.nome.split(" ")[0]} 👋`}
        description="Acompanhe os cadastros recentes e mantenha a base de pacientes atualizada."
        actions={
          <Button onClick={() => navigate("/app/pacientes/novo")}>
            <Plus size={14} />
            Cadastrar paciente
          </Button>
        }
      />

      <section className={styles.statsGrid3}>
        <StatCard
          label="Pacientes ativos"
          value={activePatients.length}
          subtitle="Habilitados para atendimento"
          color={Colors.success}
          icon={<UserCheck size={18} />}
        />
        <StatCard
          label="Total cadastrado"
          value={patients.length}
          subtitle="Ativos e inativos"
          color={Colors.accent}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Inativos"
          value={patients.length - activePatients.length}
          subtitle="Cadastros desabilitados"
          color={Colors.text3}
          icon={<UserX size={18} />}
        />
      </section>

      <article className={styles.section}>
        <header className={styles.sectionHead}>
          <div>
            <p className={styles.kicker}>Cadastros recentes</p>
            <h2 className={styles.sectionTitle}>Últimos pacientes</h2>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate("/app/pacientes")}>
            Ver todos
          </Button>
        </header>

        {recentPatients.length ? (
          <div className={styles.cardList}>
            {recentPatients.map((patient) => (
              <div key={patient.id} className={styles.numberedItem}>
                <div className={styles.numberedItemBody}>
                  <strong>{patient.nome}</strong>
                  <small>
                    {sexoLabel(patient.sexo)} · Nascimento {formatDate(patient.dataNascimento)} · Cadastrado em{" "}
                    {formatDate(patient.createdAt)}
                  </small>
                </div>
                <StatusBadge active={patient.ativo} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>Nenhum paciente cadastrado ainda.</div>
        )}
      </article>
    </div>
  );
}
