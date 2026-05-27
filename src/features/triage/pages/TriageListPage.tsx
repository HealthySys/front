import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, ClipboardList, Plus, RefreshCw, Search, Users } from "lucide-react";
import { useAuth } from "../../../auth/AuthProvider";
import { canWrite } from "../../../config/permissions";
import { useToast } from "../../../components/feedback/ToastProvider";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatCard } from "../../../components/ui/StatCard";
import { Button } from "../../../components/ui/Button";
import { RiskBadge } from "../../../components/ui/RiskBadge";
import { Alert } from "../../../components/ui/Alert";
import { Colors } from "../../../design/tokens";
import { api } from "../../../services/api";
import { healthSysWebSocket } from "../../../services/websocket";
import type { TriageEntry } from "../../../types";
import {
  formatDateTime,
  normalizeError,
  riskLabel,
  riskOptions,
  statusLabel,
  triageStatusOptions
} from "../../../utils/formatters";
import { ManchesterLegend } from "../components/ManchesterLegend";
import dashboard from "../../../pages/dashboards/Dashboard.module.css";
import table from "../../../components/ui/DataTable.module.css";
import toolbar from "../../../components/ui/Toolbar.module.css";

type StatusFilter = "todos" | TriageEntry["status"];
type RiskFilter = "todos" | TriageEntry["riskClassification"];

export function TriageListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const canManage = canWrite(user?.role, "triagem");
  const [entries, setEntries] = useState<TriageEntry[]>([]);
  const [queue, setQueue] = useState<TriageEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm.trim().toLowerCase());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTriage = async () => {
    setLoading(true);
    setError("");
    try {
      const [triageResponse, queueResponse] = await Promise.all([api.listTriage(), api.listTriageQueue()]);
      setEntries(triageResponse);
      setQueue(queueResponse);
    } catch (loadError) {
      setError(normalizeError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTriage();
  }, []);

  useEffect(() => {
    const subscription = healthSysWebSocket.onNotification((notification) => {
      if (notification.type !== "ATTENDANCE_STARTED" || !notification.triageId) return;
      const targetId = notification.triageId;
      setQueue((current) => current.filter((entry) => entry.id !== targetId));
      setEntries((current) =>
        current.map((entry) =>
          entry.id === targetId ? { ...entry, status: "EM_ATENDIMENTO" } : entry
        )
      );
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleStatusChange = async (entry: TriageEntry, nextStatus: TriageEntry["status"]) => {
    try {
      await api.updateTriageStatus(entry.id, nextStatus);
      await loadTriage();
    } catch (statusError) {
      setError(normalizeError(statusError));
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !deferredSearch ||
      [entry.patientName, entry.chiefComplaint, entry.nurseName].join(" ").toLowerCase().includes(deferredSearch);

    const matchesStatus = statusFilter === "todos" || entry.status === statusFilter;
    const matchesRisk = riskFilter === "todos" || entry.riskClassification === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const criticalQueueCount = queue.filter(
    (entry) => entry.riskClassification === "VERMELHO" || entry.riskClassification === "LARANJA"
  ).length;

  return (
    <div className={dashboard.stack}>
      <PageHeader
        eyebrow="Triagem e priorização"
        title="Gestão de triagem"
        description="Fila ordenada por risco, com acompanhamento por classificação e status."
        actions={
          <>
            <Button variant="secondary" onClick={() => void loadTriage()}>
              <RefreshCw size={14} />
              Atualizar
            </Button>
            {canManage ? (
              <Button onClick={() => navigate("/app/triagem/nova")}>
                <Plus size={14} />
                Nova triagem
              </Button>
            ) : null}
          </>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <ManchesterLegend />

      <section className={dashboard.statsGrid}>
        <StatCard
          label="Triagens registradas"
          value={entries.length}
          subtitle="Total acumulado"
          color={Colors.accent}
          icon={<ClipboardList size={18} />}
        />
        <StatCard
          label="Na fila"
          value={queue.length}
          subtitle="Aguardando médico"
          color={Colors.warning}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Em atendimento"
          value={entries.filter((entry) => entry.status === "EM_ATENDIMENTO").length}
          subtitle="Em consulta agora"
          color={Colors.success}
          icon={<Activity size={18} />}
        />
        <StatCard
          label="Casos críticos"
          value={criticalQueueCount}
          subtitle="Vermelho ou Laranja"
          color={Colors.danger}
          icon={<AlertTriangle size={18} />}
        />
      </section>


      <article className={dashboard.section}>
        <header className={dashboard.sectionHead}>
          <div>
            <p className={dashboard.kicker}>Histórico</p>
            <h2 className={dashboard.sectionTitle}>Entradas registradas</h2>
          </div>
        </header>

        <div className={toolbar.toolbar} style={{ padding: 0, border: "none", boxShadow: "none" }}>
          <div className={toolbar.search}>
            <Search size={16} className={toolbar.searchIcon} />
            <input
              className={toolbar.searchInput}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por paciente, queixa ou profissional…"
            />
          </div>
          <select
            className={toolbar.select}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="todos">Todos os status</option>
            {triageStatusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
          <select
            className={toolbar.select}
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value as RiskFilter)}
          >
            <option value="todos">Todos os níveis</option>
            {riskOptions.map((risk) => (
              <option key={risk} value={risk}>
                {riskLabel(risk)}
              </option>
            ))}
          </select>
        </div>

        <div className={table.wrapper}>
          <div className={table.scroll}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Risco</th>
                  <th>Status</th>
                  <th>Profissional</th>
                  <th>Registro</th>
                  <th style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className={table.empty}>
                      Carregando triagens…
                    </td>
                  </tr>
                ) : filteredEntries.length ? (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <div className={table.cellTwoLines}>
                          <strong>{entry.patientName}</strong>
                          <small>{entry.chiefComplaint || "Sem queixa informada"}</small>
                        </div>
                      </td>
                      <td>
                        <RiskBadge risk={entry.riskClassification} />
                      </td>
                      <td>
                        {canManage ? (
                          <select
                            className={toolbar.select}
                            style={{ minWidth: 0, padding: "6px 8px", fontSize: 12 }}
                            value={entry.status}
                            onChange={(event) =>
                              void handleStatusChange(entry, event.target.value as TriageEntry["status"])
                            }
                          >
                            {triageStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {statusLabel(status)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>{statusLabel(entry.status)}</span>
                        )}
                      </td>
                      <td>
                        <div className={table.cellTwoLines}>
                          <strong>{entry.nurseName || "Não informado"}</strong>
                          <small>ID {entry.nurseId || "—"}</small>
                        </div>
                      </td>
                      <td>{formatDateTime(entry.triageDate)}</td>
                      <td>
                        {canManage ? (
                          <div className={table.actions} style={{ justifyContent: "flex-end" }}>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate(`/app/triagem/${entry.id}/editar`)}
                            >
                              Editar
                            </Button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={table.empty}>
                      Nenhuma triagem encontrada com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </div>
  );
}
