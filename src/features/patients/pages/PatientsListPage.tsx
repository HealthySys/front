import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { Patient } from "../../../types";
import { formatDate, normalizeError, sexoLabel } from "../../../utils/formatters";

export function PatientsListPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativos" | "inativos">("ativos");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm.trim());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const activeFilter =
        statusFilter === "todos" ? undefined : statusFilter === "ativos";

      const response =
        deferredSearch.length >= 2
          ? await api.searchPatients(deferredSearch)
          : await api.listPatients(activeFilter);

      const filtered =
        statusFilter === "todos"
          ? response
          : response.filter((patient) => patient.ativo === (statusFilter === "ativos"));

      setPatients(filtered);
    } catch (loadError) {
      setError(normalizeError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPatients();
  }, [deferredSearch, statusFilter]);

  const handleToggleStatus = async (patient: Patient) => {
    try {
      await api.updatePatientStatus(patient.id, !patient.ativo);
      await loadPatients();
    } catch (statusError) {
      setError(normalizeError(statusError));
    }
  };

  const handleDelete = async (patient: Patient) => {
    if (!window.confirm(`Deseja excluir o cadastro de ${patient.nome}?`)) {
      return;
    }

    try {
      await api.deletePatient(patient.id);
      await loadPatients();
    } catch (deleteError) {
      setError(normalizeError(deleteError));
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="CADASTRO CLÍNICO"
        title="Gestão de pacientes"
        actions={
          <div className="page-actions">
            <button type="button" className="button secondary" onClick={() => void loadPatients()}>
              Atualizar lista
            </button>
            <button type="button" className="button" onClick={() => navigate("/app/pacientes/novo")}>
              Novo paciente
            </button>
          </div>
        }
      />

      {error ? <div className="alert error">{error}</div> : null}

      <div className="patients-overview-grid">
        <div className="overview-card">
          <span className="overview-label">Pacientes exibidos</span>
          <strong className="overview-value">{patients.length}</strong>
        </div>

        <div className="overview-card">
          <span className="overview-label">Ativos na lista</span>
          <strong className="overview-value">
            {patients.filter((patient) => patient.ativo).length}
          </strong>
        </div>
      </div>
      
      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">FILTROS E CONTEXTO</p>
          </div>
        </div>

        <div className="stack-form">
          <div className="filters-row">
            <label className="field">
              <span>Buscar por nome</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Digite pelo menos 2 caracteres"
              />
            </label>

            <label className="field">
              <span>Situação do cadastro</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "todos" | "ativos" | "inativos")
                }
              >
                <option value="ativos">Somente ativos</option>
                <option value="inativos">Somente inativos</option>
                <option value="todos">Todos</option>
              </select>
            </label>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">BASE CADASTRAL</p>
            <h2>Pacientes cadastrados</h2>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>CPF</th>
                <th>Sexo</th>
                <th>Nascimento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>Carregando pacientes...</td>
                </tr>
              ) : patients.length ? (
                patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <strong>{patient.nome}</strong>
                      <small>{patient.email || patient.telefone || "Sem contato informado"}</small>
                    </td>
                    <td>{patient.cpf}</td>
                    <td>{sexoLabel(patient.sexo)}</td>
                    <td>{formatDate(patient.dataNascimento)}</td>
                    <td>
                      <span className={`pill ${patient.ativo ? "success" : "neutral"}`}>
                        {patient.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={() => navigate(`/app/pacientes/${patient.id}/editar`)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={() => void handleToggleStatus(patient)}
                        >
                          {patient.ativo ? "Inativar" : "Ativar"}
                        </button>
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={() => void handleDelete(patient)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>Nenhum paciente encontrado com os filtros atuais.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}