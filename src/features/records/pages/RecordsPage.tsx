import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { MedicalRecord, MedicalRecordPayload, Patient, RecordEntry } from "../../../types";
import { formatDateTime, normalizeError, recordEntryTypeOptions } from "../../../utils/formatters";

const initialRecordForm: MedicalRecordPayload = {
  patientId: 0,
  patientName: "",
  diagnosis: "",
  treatment: "",
  observations: "",
  responsibleDoctorId: "",
  responsibleDoctorName: ""
};

const initialEntryForm: RecordEntry = {
  type: "CONSULTA",
  description: "",
  doctorId: "",
  doctorName: ""
};

export function RecordsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordForm, setRecordForm] = useState<MedicalRecordPayload>(initialRecordForm);
  const [entryForm, setEntryForm] = useState<RecordEntry>(initialEntryForm);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const loadPage = async () => {
    setLoading(true);
    setError("");

    try {
      const [patientsResponse, recordsResponse] = await Promise.all([api.listPatients(true), api.listRecords()]);
      setPatients(patientsResponse);
      setRecords(recordsResponse);

      if (!selectedRecordId && recordsResponse.length) {
        setSelectedRecordId(recordsResponse[0].id);
      }
    } catch (loadError) {
      setError(normalizeError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, []);

  const selectedPatient = patients.find((patient) => patient.id === recordForm.patientId);
  const selectedRecord = records.find((record) => record.id === selectedRecordId) || null;

  const resetRecordForm = () => {
    setRecordForm(initialRecordForm);
    setEditingRecordId(null);
  };

  const handleRecordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      const payload: MedicalRecordPayload = {
        ...recordForm,
        patientName: selectedPatient?.nome || recordForm.patientName
      };

      if (editingRecordId) {
        const updated = await api.updateRecord(editingRecordId, payload);
        setSelectedRecordId(updated.id);
        setFeedback("Prontuário atualizado com sucesso.");
      } else {
        const created = await api.createRecord(payload);
        setSelectedRecordId(created.id);
        setFeedback("Prontuário criado com sucesso.");
      }

      resetRecordForm();
      await loadPage();
    } catch (submitError) {
      setError(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEntrySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedRecordId) {
      setError("Selecione um prontuário antes de adicionar uma evolução.");
      return;
    }

    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      await api.addRecordEntry(selectedRecordId, entryForm);
      setEntryForm(initialEntryForm);
      setFeedback("Evolução adicionada ao prontuário.");
      await loadPage();
    } catch (submitError) {
      setError(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (record: MedicalRecord) => {
    setEditingRecordId(record.id);
    setSelectedRecordId(record.id);
    setRecordForm({
      patientId: record.patientId,
      patientName: record.patientName,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      observations: record.observations,
      responsibleDoctorId: record.responsibleDoctorId,
      responsibleDoctorName: record.responsibleDoctorName
    });
  };

  const handleDelete = async (record: MedicalRecord) => {
    if (!window.confirm(`Deseja excluir o prontuário de ${record.patientName}?`)) {
      return;
    }

    try {
      await api.deleteRecord(record.id);
      if (selectedRecordId === record.id) {
        setSelectedRecordId(null);
      }
      await loadPage();
    } catch (deleteError) {
      setError(normalizeError(deleteError));
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="REGISTRO CLÍNICO"
        title="Prontuários eletrônicos"
        description="Consolide diagnósticos, tratamentos, observações e evoluções para sustentar o histórico clínico do paciente."
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <section className="content-grid two-columns">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">{editingRecordId ? "EDIÇÃO" : "NOVO PRONTUÁRIO"}</p>
              <h2>{editingRecordId ? "Atualizar prontuário" : "Criar prontuário"}</h2>
            </div>
          </div>

          <form className="form-grid wide-grid" onSubmit={handleRecordSubmit}>
            <label className="field field-span-2">
              <span>Paciente</span>
              <select
                value={recordForm.patientId || ""}
                onChange={(event) =>
                  setRecordForm((current) => ({ ...current, patientId: Number(event.target.value) }))
                }
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

            <label className="field field-span-2">
              <span>Diagnóstico</span>
              <textarea
                value={recordForm.diagnosis}
                onChange={(event) =>
                  setRecordForm((current) => ({ ...current, diagnosis: event.target.value }))
                }
                rows={3}
                placeholder="Hipótese diagnóstica ou diagnóstico fechado"
              />
            </label>

            <label className="field field-span-2">
              <span>Tratamento</span>
              <textarea
                value={recordForm.treatment}
                onChange={(event) =>
                  setRecordForm((current) => ({ ...current, treatment: event.target.value }))
                }
                rows={3}
                placeholder="Conduta, medicações, pedidos e acompanhamento"
              />
            </label>

            <label className="field">
              <span>ID do médico responsável</span>
              <input
                value={recordForm.responsibleDoctorId}
                onChange={(event) =>
                  setRecordForm((current) => ({
                    ...current,
                    responsibleDoctorId: event.target.value
                  }))
                }
                placeholder="MED-01"
              />
            </label>

            <label className="field">
              <span>Médico responsável</span>
              <input
                value={recordForm.responsibleDoctorName}
                onChange={(event) =>
                  setRecordForm((current) => ({
                    ...current,
                    responsibleDoctorName: event.target.value
                  }))
                }
                placeholder="Nome do médico"
              />
            </label>

            <label className="field field-span-2">
              <span>Observações</span>
              <textarea
                value={recordForm.observations}
                onChange={(event) =>
                  setRecordForm((current) => ({ ...current, observations: event.target.value }))
                }
                rows={4}
                placeholder="Observações clínicas, pendências, evolução e contexto"
              />
            </label>

            <div className="form-actions field-span-2">
              <button type="submit" className="button" disabled={submitting}>
                {submitting ? "Salvando..." : editingRecordId ? "Salvar alterações" : "Criar prontuário"}
              </button>
              <button type="button" className="button ghost" onClick={resetRecordForm}>
                Limpar formulário
              </button>
            </div>
          </form>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">EVOLUÇÕES</p>
              <h2>Adicionar registro ao prontuário</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleEntrySubmit}>
            <label className="field">
              <span>Prontuário selecionado</span>
              <select
                value={selectedRecordId || ""}
                onChange={(event) => setSelectedRecordId(event.target.value || null)}
              >
                <option value="">Selecione um prontuário</option>
                {records.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.patientName} • {record.responsibleDoctorName || "Sem responsável"}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Tipo de entrada</span>
              <select
                value={entryForm.type}
                onChange={(event) => setEntryForm((current) => ({ ...current, type: event.target.value }))}
              >
                {recordEntryTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-span-2">
              <span>Descrição</span>
              <textarea
                value={entryForm.description}
                onChange={(event) =>
                  setEntryForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={4}
                placeholder="Descreva a evolução, exame ou procedimento"
              />
            </label>

            <label className="field">
              <span>ID do profissional</span>
              <input
                value={entryForm.doctorId}
                onChange={(event) =>
                  setEntryForm((current) => ({ ...current, doctorId: event.target.value }))
                }
                placeholder="MED-01"
              />
            </label>

            <label className="field">
              <span>Nome do profissional</span>
              <input
                value={entryForm.doctorName}
                onChange={(event) =>
                  setEntryForm((current) => ({ ...current, doctorName: event.target.value }))
                }
                placeholder="Responsável pela evolução"
              />
            </label>

            <div className="form-actions field-span-2">
              <button type="submit" className="button" disabled={submitting || !selectedRecordId}>
                {submitting ? "Salvando..." : "Adicionar evolução"}
              </button>
            </div>
          </form>
        </article>
      </section>

      <section className="content-grid two-columns">
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
                ) : records.length ? (
                  records.map((record) => (
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
                            onClick={() => setSelectedRecordId(record.id)}
                          >
                            Ver
                          </button>
                          <button type="button" className="button ghost small" onClick={() => startEditing(record)}>
                            Editar
                          </button>
                          <button type="button" className="button ghost small" onClick={() => void handleDelete(record)}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>Nenhum prontuário cadastrado até o momento.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">DETALHE DO PRONTUÁRIO</p>
              <h2>{selectedRecord?.patientName || "Selecione um prontuário"}</h2>
            </div>
          </div>

          {selectedRecord ? (
            <div className="detail-stack">
              <div className="info-list">
                <div className="info-row">
                  <strong>Diagnóstico</strong>
                  <span>{selectedRecord.diagnosis || "Não informado"}</span>
                </div>
                <div className="info-row">
                  <strong>Tratamento</strong>
                  <span>{selectedRecord.treatment || "Não informado"}</span>
                </div>
                <div className="info-row">
                  <strong>Observações</strong>
                  <span>{selectedRecord.observations || "Sem observações adicionais."}</span>
                </div>
              </div>

              <div className="timeline">
                {selectedRecord.entries.length ? (
                  selectedRecord.entries.map((entry, index) => (
                    <div key={`${selectedRecord.id}-${index}`} className="timeline-item">
                      <strong>{entry.type}</strong>
                      <p>{entry.description}</p>
                      <small>
                        {entry.doctorName || "Profissional não informado"} •{" "}
                        {formatDateTime(entry.entryDate)}
                      </small>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">Este prontuário ainda não possui evoluções registradas.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              Selecione um prontuário na tabela para visualizar o histórico clínico.
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
