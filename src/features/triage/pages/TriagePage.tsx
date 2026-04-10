import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { Patient, TriageEntry, TriagePayload } from "../../../types";
import {
  normalizeError,
  riskLabel,
  riskOptions,
  riskSla,
  statusLabel,
  triageStatusOptions
} from "../../../utils/formatters";

type TriageFormState = {
  patientId: string;
  riskClassification: TriageEntry["riskClassification"];
  chiefComplaint: string;
  vitalSigns: string;
  observations: string;
  nurseId: string;
  nurseName: string;
  status: TriageEntry["status"];
};

const initialForm: TriageFormState = {
  patientId: "",
  riskClassification: "AMARELO",
  chiefComplaint: "",
  vitalSigns: "",
  observations: "",
  nurseId: "",
  nurseName: "",
  status: "AGUARDANDO_ATENDIMENTO"
};

export function TriagePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [entries, setEntries] = useState<TriageEntry[]>([]);
  const [queue, setQueue] = useState<TriageEntry[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const loadPage = async () => {
    setLoading(true);
    setError("");

    try {
      const [patientsResponse, triageResponse, queueResponse] = await Promise.all([
        api.listPatients(true),
        api.listTriage(),
        api.listTriageQueue()
      ]);

      setPatients(patientsResponse);
      setEntries(triageResponse);
      setQueue(queueResponse);
    } catch (loadError) {
      setError(normalizeError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const selectedPatient = patients.find((patient) => patient.id === Number(form.patientId));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      const payload: TriagePayload & { status?: TriageEntry["status"] } = {
        patientId: Number(form.patientId),
        patientName: selectedPatient?.nome || "",
        riskClassification: form.riskClassification,
        chiefComplaint: form.chiefComplaint,
        vitalSigns: form.vitalSigns,
        observations: form.observations,
        nurseId: form.nurseId,
        nurseName: form.nurseName,
        status: form.status
      };

      if (editingId) {
        await api.updateTriage(editingId, payload);
        setFeedback("Triagem atualizada com sucesso.");
      } else {
        await api.createTriage(payload);
        setFeedback("Triagem registrada com sucesso.");
      }

      resetForm();
      await loadPage();
    } catch (submitError) {
      setError(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (entry: TriageEntry) => {
    setEditingId(entry.id);
    setForm({
      patientId: String(entry.patientId),
      riskClassification: entry.riskClassification,
      chiefComplaint: entry.chiefComplaint,
      vitalSigns: entry.vitalSigns,
      observations: entry.observations,
      nurseId: entry.nurseId,
      nurseName: entry.nurseName,
      status: entry.status
    });
  };

  const handleDelete = async (entry: TriageEntry) => {
    if (!window.confirm(`Deseja remover a triagem de ${entry.patientName}?`)) {
      return;
    }

    try {
      await api.deleteTriage(entry.id);
      await loadPage();
    } catch (deleteError) {
      setError(normalizeError(deleteError));
    }
  };

  const handleStatusChange = async (entry: TriageEntry, nextStatus: TriageEntry["status"]) => {
    try {
      await api.updateTriageStatus(entry.id, nextStatus);
      await loadPage();
    } catch (statusError) {
      setError(normalizeError(statusError));
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="TRIAGEM E PRIORIZAÇÃO"
        title="Fluxo de triagem"
        description="Classifique risco, acompanhe a fila em tempo real e mantenha o atendimento organizado conforme o protocolo de Manchester."
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <section className="content-grid two-columns">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">{editingId ? "EDIÇÃO" : "NOVA TRIAGEM"}</p>
              <h2>{editingId ? "Atualizar triagem" : "Registrar triagem"}</h2>
            </div>
          </div>

          <form className="form-grid wide-grid" onSubmit={handleSubmit}>
            <label className="field field-span-2">
              <span>Paciente</span>
              <select
                value={form.patientId}
                onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))}
                required
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nome} • {patient.cpf}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Classificação de risco</span>
              <select
                value={form.riskClassification}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    riskClassification: event.target.value as typeof current.riskClassification
                  }))
                }
              >
                {riskOptions.map((risk) => (
                  <option key={risk} value={risk}>
                    {riskLabel(risk)} • {riskSla(risk)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({ ...current, status: event.target.value as typeof current.status }))
                }
              >
                {triageStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-span-2">
              <span>Queixa principal</span>
              <textarea
                value={form.chiefComplaint}
                onChange={(event) =>
                  setForm((current) => ({ ...current, chiefComplaint: event.target.value }))
                }
                rows={3}
                placeholder="Sintomas, sinais e motivo principal da procura"
              />
            </label>

            <label className="field field-span-2">
              <span>Sinais vitais</span>
              <textarea
                value={form.vitalSigns}
                onChange={(event) => setForm((current) => ({ ...current, vitalSigns: event.target.value }))}
                rows={3}
                placeholder="PA, FC, FR, SpO2, temperatura e outros dados relevantes"
              />
            </label>

            <label className="field">
              <span>ID do profissional</span>
              <input
                value={form.nurseId}
                onChange={(event) => setForm((current) => ({ ...current, nurseId: event.target.value }))}
                placeholder="ENF-01"
              />
            </label>

            <label className="field">
              <span>Profissional responsável</span>
              <input
                value={form.nurseName}
                onChange={(event) => setForm((current) => ({ ...current, nurseName: event.target.value }))}
                placeholder="Nome do enfermeiro"
              />
            </label>

            <label className="field field-span-2">
              <span>Observações adicionais</span>
              <textarea
                value={form.observations}
                onChange={(event) => setForm((current) => ({ ...current, observations: event.target.value }))}
                rows={3}
                placeholder="Informações complementares para priorização e continuidade"
              />
            </label>

            <div className="form-actions field-span-2">
              <button type="submit" className="button" disabled={submitting}>
                {submitting ? "Salvando..." : editingId ? "Salvar alterações" : "Registrar triagem"}
              </button>
              <button type="button" className="button ghost" onClick={resetForm}>
                Limpar formulário
              </button>
            </div>
          </form>
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
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>Carregando triagens...</td>
                </tr>
              ) : entries.length ? (
                entries.map((entry) => (
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
                    <td>{entry.nurseName || "Não informado"}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="button ghost small" onClick={() => startEditing(entry)}>
                          Editar
                        </button>
                        <button type="button" className="button ghost small" onClick={() => void handleDelete(entry)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>Nenhuma triagem cadastrada até o momento.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
