import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { TriageEntry } from "../../../types";
import {
  formatDateTime,
  normalizeError,
  riskLabel,
  riskOptions,
  riskSla,
  statusLabel,
  triageStatusOptions
} from "../../../utils/formatters";

type StatusFilter = "todos" | TriageEntry["status"];
type RiskFilter = "todos" | TriageEntry["riskClassification"];

export function TriageListPage() {
  const navigate = useNavigate();
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
      const [triageResponse, queueResponse] = await Promise.all([
        api.listTriage(),
        api.listTriageQueue()
      ]);

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

  const handleDelete = async (entry: TriageEntry) => {
    if (!window.confirm(`Deseja remover a triagem de ${entry.patientName}?`)) {
      return;
    }

    try {
      await api.deleteTriage(entry.id);
      await loadTriage();
    } catch (deleteError) {
      setError(normalizeError(deleteError));
    }
  };

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
      [entry.patientName, entry.chiefComplaint, entry.nurseName, entry.nurseId]
        .join(" ")
        .toLowerCase()
        .includes(deferredSearch);

    const matchesStatus = statusFilter === "todos" || entry.status === statusFilter;
    const matchesRisk = riskFilter === "todos" || entry.riskClassification === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const criticalQueueCount = queue.filter(
    (entry) => entry.riskClassification === "VERMELHO" || entry.riskClassification === "LARANJA"
  ).length;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="TRIAGEM E PRIORIZAÇÃO"
        title="Gestão de triagem"
        actions={
          <div className="page-actions">
            <button type="button" className="button secondary" onClick={() => void loadTriage()}>
              Atualizar fila
            </button>
            <button type="button" className="button" onClick={() => navigate("/app/triagem/nova")}>
              Nova triagem
            </button>
          </div>
        }
      />

      {error ? <div className="alert error">{error}</div> : null}

      <article>
        <div className="triage-overview-grid">
          <div className="overview-card">
            <span className="overview-label">Triagens registradas</span>
            <strong className="overview-value">{entries.length}</strong>
          </div>

          <div className="overview-card">
            <span className="overview-label">Na fila</span>
            <strong className="overview-value">{queue.length}</strong>
          </div>

          <div className="overview-card">
            <span className="overview-label">Em atendimento</span>
            <strong className="overview-value">
              {entries.filter((entry) => entry.status === "EM_ATENDIMENTO").length}
            </strong>
          </div>

          <div className="overview-card">
            <span className="overview-label">Casos críticos</span>
            <strong className="overview-value">{criticalQueueCount}</strong>
          </div>
        </div>
      </article>

      <section className="content-grid two-columns">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">FILTROS E CONTEXTO</p>
              <h2>Fluxo assistencial</h2>
            </div>
          </div>

          <div className="stack-form">
            <div className="triage-filters-grid">
              <label className="field">
                <span>Buscar triagem</span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Paciente, queixa ou profissional"
                />
              </label>

              <label className="field">
                <span>Status</span>
                <select
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
              </label>

              <label className="field">
                <span>Prioridade</span>
                <select
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
              </label>
            </div>

            <div className="info-panel">
              A fila segue o protocolo de Manchester. Os tempos de resposta esperados variam
              conforme a cor de risco e podem ser acompanhados na própria listagem.
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">FILA PRIORITÁRIA</p>
              <h2>Casos aguardando</h2>
            </div>
          </div>

          {queue.length ? (
            <div className="list-stack">
              {queue.map((entry) => (
                <div key={entry.id} className="list-card">
                  <div className="list-card-top">
                    <strong>{entry.patientName}</strong>
                    <span className={`pill risk ${entry.riskClassification.toLowerCase()}`}>
                      {riskLabel(entry.riskClassification)}
                    </span>
                  </div>
                  <p>{entry.chiefComplaint || "Sem queixa detalhada."}</p>
                  <small>{riskSla(entry.riskClassification)}</small>
                </div>
              ))}
            </div>
          ) : loading ? (
            <div className="empty-state">Carregando fila de triagem...</div>
          ) : (
            <div className="empty-state">Nenhum paciente aguardando na fila no momento.</div>
          )}
        </article>
      </section>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">HISTÓRICO DA TRIAGEM</p>
            <h2>Entradas registradas</h2>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Risco</th>
                <th>Status</th>
                <th>Profissional</th>
                <th>Registro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>Carregando triagens...</td>
                </tr>
              ) : filteredEntries.length ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <strong>{entry.patientName}</strong>
                      <small>{entry.chiefComplaint || "Sem queixa informada"}</small>
                    </td>
                    <td>
                      <span className={`pill risk ${entry.riskClassification.toLowerCase()}`}>
                        {riskLabel(entry.riskClassification)}
                      </span>
                    </td>
                    <td>
                      <select
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
                    </td>
                    <td>
                      <strong>{entry.nurseName || "Não informado"}</strong>
                      <small>{entry.nurseId || "Sem identificação"}</small>
                    </td>
                    <td>{formatDateTime(entry.triageDate)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={() => navigate(`/app/triagem/${entry.id}/editar`)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={() => void handleDelete(entry)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>Nenhuma triagem encontrada com os filtros atuais.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
