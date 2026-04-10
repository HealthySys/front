import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { MedicalRecord } from "../../../types";
import { formatDateTime, normalizeError } from "../../../utils/formatters";

export function RecordsListPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");

  const loadRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.listRecords();
      setRecords(response);
    } catch (loadError) {
      setError(normalizeError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, []);

  const handleDelete = async (record: MedicalRecord) => {
    if (!window.confirm(`Deseja excluir o prontuário de ${record.patientName}?`)) {
      return;
    }

    try {
      await api.deleteRecord(record.id);
      await loadRecords();
    } catch (deleteError) {
      setError(normalizeError(deleteError));
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.diagnosis ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDoctor =
        doctorFilter.trim() === "" ||
        (record.responsibleDoctorName ?? "").toLowerCase().includes(doctorFilter.toLowerCase());

      return matchesSearch && matchesDoctor;
    });
  }, [records, searchTerm, doctorFilter]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="REGISTRO CLÍNICO"
        title="Prontuários eletrônicos"
        actions={
          <div className="page-actions">
            <button type="button" className="button secondary" onClick={() => void loadRecords()}>
              Atualizar lista
            </button>
            <button type="button" className="button" onClick={() => navigate("/app/prontuarios/novo")}>
              Novo prontuário
            </button>
          </div>
        }
      />

      {error ? <div className="alert error">{error}</div> : null}

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">FILTROS</p>
          </div>
        </div>

        <div className="filters-row">
          <label className="field">
            <span>Buscar por paciente ou diagnóstico</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Digite nome do paciente ou diagnóstico"
            />
          </label>

          <label className="field">
            <span>Filtrar por responsável</span>
            <input
              value={doctorFilter}
              onChange={(event) => setDoctorFilter(event.target.value)}
              placeholder="Nome do médico responsável"
            />
          </label>
        </div>

        <div className="patients-overview-grid">
          <div className="overview-card">
            <span className="overview-label">Prontuários exibidos</span>
            <strong className="overview-value">{filteredRecords.length}</strong>
          </div>

          <div className="overview-card">
            <span className="overview-label">Total cadastrado</span>
            <strong className="overview-value">{records.length}</strong>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">LISTA CLÍNICA</p>
            <h2>Prontuários cadastrados</h2>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Responsável</th>
                <th>Última atualização</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>Carregando prontuários...</td>
                </tr>
              ) : filteredRecords.length ? (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.patientName}</strong>
                      <small>{record.diagnosis || "Sem diagnóstico informado"}</small>
                    </td>
                    <td>{record.responsibleDoctorName || "Não informado"}</td>
                    <td>{formatDateTime(record.updatedAt || record.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={() => navigate(`/app/prontuarios/${record.id}`)}
                        >
                          Ver
                        </button>

                        <button
                          type="button"
                          className="button ghost small"
                          onClick={() => navigate(`/app/prontuarios/${record.id}/editar`)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="button ghost small"
                          onClick={() => void handleDelete(record)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>Nenhum prontuário encontrado com os filtros atuais.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}