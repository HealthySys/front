import { useEffect, useState } from "react";
import { Users, Gauge, Play, ExternalLink } from "lucide-react";
import { useToast } from "../../components/feedback/ToastProvider";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Button } from "../../components/ui/Button";
import { api } from "../../services/api";
import type { LoadTestState, User } from "../../types";
import { Colors } from "../../design/tokens";
import { normalizeError } from "../../utils/formatters";
import styles from "./Dashboard.module.css";

interface AdminDashboardProps {
  user: User;
}

function fmt(value: number | null | undefined, suffix = ""): string {
  if (value === null || value === undefined) return "—";
  return `${value}${suffix}`;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const toast = useToast();
  const [users, setUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadTest, setLoadTest] = useState<LoadTestState | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const [list, lt] = await Promise.all([api.listUsers(), api.getLoadTestStatus()]);
        if (!active) return;
        setUsers(list.length);
        setLoadTest(lt);
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

  // Enquanto o teste roda, atualiza o status a cada 3s ate terminar.
  useEffect(() => {
    if (loadTest?.status !== "RUNNING") return;

    const id = setInterval(async () => {
      try {
        const next = await api.getLoadTestStatus();
        setLoadTest(next);
      } catch {
        // erro transitorio de polling — ignora e tenta de novo no proximo tick
      }
    }, 3000);

    return () => clearInterval(id);
  }, [loadTest?.status]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const next = await api.startLoadTest();
      setLoadTest(next);
      toast.success("Teste de carga iniciado. Acompanhe os resultados abaixo.");
    } catch (startError) {
      toast.error(normalizeError(startError));
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <div className={styles.loader}>Carregando visão administrativa…</div>;
  }

  const status = loadTest?.status ?? "IDLE";
  const running = status === "RUNNING";
  const summary = loadTest?.summary ?? null;

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

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.kicker}>Observabilidade</p>
            <h2 className={styles.sectionTitle}>Teste de carga</h2>
          </div>
          <div className={styles.actions}>
            <Button onClick={handleStart} disabled={starting || running}>
              <Play size={15} style={{ marginRight: 6 }} />
              {running ? "Em andamento…" : starting ? "Iniciando…" : "Disparar teste"}
            </Button>
            <Button variant="secondary" onClick={() => window.open("/grafana", "_blank")}>
              <ExternalLink size={15} style={{ marginRight: 6 }} />
              Abrir Grafana
            </Button>
          </div>
        </div>

        {running ? (
          <div className={styles.urgentNotice}>
            <Gauge size={18} className={styles.urgentNoticeIcon} />
            <div className={styles.urgentNoticeBody}>
              <strong>Gerando carga…</strong>
              <p>
                O k6 está simulando usuários por ~3 min. Os números aparecem aqui ao
                terminar; em tempo real, acompanhe no Grafana.
              </p>
            </div>
          </div>
        ) : null}

        {status === "FAILED" && loadTest?.message ? (
          <div className={styles.empty}>{loadTest.message}</div>
        ) : null}

        {summary ? (
          <div className={styles.statsGrid}>
            <StatCard
              label="SLA"
              value={summary.passed ? "PASSOU" : "FALHOU"}
              subtitle="p95<800ms · erro<1% · login<1s"
              color={summary.passed ? Colors.success : Colors.danger}
              icon={<Gauge size={18} />}
            />
            <StatCard
              label="Requisições/s"
              value={fmt(summary.reqRate)}
              subtitle={`${fmt(summary.reqCount)} no total`}
              color={Colors.accent}
            />
            <StatCard
              label="Latência p95"
              value={fmt(summary.durationP95, " ms")}
              subtitle={`média ${fmt(summary.durationAvg, " ms")}`}
              color={Colors.text2}
            />
            <StatCard
              label="Erros"
              value={fmt(summary.errorRate, "%")}
              subtitle="requisições que falharam"
              color={summary.errorRate && summary.errorRate > 0 ? Colors.danger : Colors.success}
            />
            <StatCard
              label="Login p95"
              value={fmt(summary.loginP95, " ms")}
              subtitle="latência do login"
              color={Colors.text2}
            />
            <StatCard
              label="Checks OK"
              value={fmt(summary.checksRate, "%")}
              subtitle={`${fmt(summary.iterations)} iterações · ${fmt(summary.vusMax)} VUs`}
              color={Colors.accent}
            />
          </div>
        ) : status === "IDLE" ? (
          <div className={styles.empty}>
            Nenhum teste executado ainda. Clique em “Disparar teste” para gerar carga e
            ver as métricas.
          </div>
        ) : null}
      </section>
    </div>
  );
}
