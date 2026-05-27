import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { useToast } from "../../components/feedback/ToastProvider";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { api } from "../../services/api";
import type { User } from "../../types";
import { Colors } from "../../design/tokens";
import { normalizeError } from "../../utils/formatters";
import styles from "./Dashboard.module.css";

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const toast = useToast();
  const [users, setUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const list = await api.listUsers();
        if (!active) return;
        setUsers(list.length);
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
        description="Gestão de usuários da plataforma."
      />

      <section className={styles.statsGrid}>
        <StatCard
          label="Usuários"
          value={users}
          subtitle="Perfis cadastrados"
          color={Colors.text2}
          icon={<Users size={18} />}
        />
      </section>
    </div>
  );
}
