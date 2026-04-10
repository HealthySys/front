import { FormEvent, useDeferredValue, useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { api } from "../services/api";
import type { Patient, PatientPayload } from "../types";
import {
  bloodTypeOptions,
  formatDate,
  normalizeError,
  sexoLabel,
  sexoOptions
} from "../utils/formatters";

const initialForm: PatientPayload = {
  nome: "",
  dataNascimento: "",
  cpf: "",
  email: "",
  telefone: "",
  sexo: "FEMININO",
  endereco: "",
  tipoSanguineo: "O+",
  alergias: "",
  historicoVacinas: "",
  ativo: true
};

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<PatientPayload>(initialForm);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativos" | "inativos">("ativos");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm.trim());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
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

  const resetForm = () => {
    setForm(initialForm);
    setEditingPatientId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      if (editingPatientId) {
        await api.updatePatient(editingPatientId, form);
        setFeedback("Paciente atualizado com sucesso.");
      } else {
        await api.createPatient(form);
        setFeedback("Paciente cadastrado com sucesso.");
      }

      resetForm();
      await loadPatients();
    } catch (submitError) {
      setError(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (patient: Patient) => {
    setEditingPatientId(patient.id);
    setForm({
      nome: patient.nome,
      dataNascimento: patient.dataNascimento,
      cpf: patient.cpf,
      email: patient.email,
      telefone: patient.telefone,
      sexo: patient.sexo,
      endereco: patient.endereco,
      tipoSanguineo: patient.tipoSanguineo,
      alergias: patient.alergias,
      historicoVacinas: patient.historicoVacinas,
      ativo: patient.ativo
    });
    setFeedback("");
    setError("");
  };

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
        description="Cadastre informações administrativas e clínicas iniciais, incluindo endereço, alergias, histórico de vacinas e situação de ativação."
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <section className="content-grid two-columns">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">{editingPatientId ? "EDIÇÃO" : "NOVO CADASTRO"}</p>
              <h2>{editingPatientId ? "Atualizar paciente" : "Cadastrar paciente"}</h2>
            </div>
          </div>

          <form className="form-grid wide-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Nome completo</span>
              <input
                value={form.nome}
                onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
                placeholder="Nome do paciente"
                required
              />
            </label>

            <label className="field">
              <span>Data de nascimento</span>
              <input
                value={form.dataNascimento}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dataNascimento: event.target.value }))
                }
                type="date"
                required
              />
            </label>

            <label className="field">
              <span>CPF</span>
              <input
                value={form.cpf}
                onChange={(event) => setForm((current) => ({ ...current, cpf: event.target.value }))}
                placeholder="Somente números"
                required
              />
            </label>

            <label className="field">
              <span>E-mail</span>
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                type="email"
                placeholder="paciente@exemplo.com"
              />
            </label>

            <label className="field">
              <span>Telefone</span>
              <input
                value={form.telefone}
                onChange={(event) => setForm((current) => ({ ...current, telefone: event.target.value }))}
                placeholder="(85) 99999-0000"
              />
            </label>

            <label className="field">
              <span>Sexo</span>
              <select
                value={form.sexo}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sexo: event.target.value as PatientPayload["sexo"] }))
                }
              >
                {sexoOptions.map((sexo) => (
                  <option key={sexo} value={sexo}>
                    {sexoLabel(sexo)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-span-2">
              <span>Endereço</span>
              <input
                value={form.endereco}
                onChange={(event) => setForm((current) => ({ ...current, endereco: event.target.value }))}
                placeholder="Rua, número, bairro e complemento"
              />
            </label>

            <label className="field">
              <span>Tipo sanguíneo</span>
              <select
                value={form.tipoSanguineo}
                onChange={(event) =>
                  setForm((current) => ({ ...current, tipoSanguineo: event.target.value }))
                }
              >
                {bloodTypeOptions.map((bloodType) => (
                  <option key={bloodType} value={bloodType}>
                    {bloodType}
                  </option>
                ))}
              </select>
            </label>

            <label className="switch-field">
              <input
                checked={form.ativo}
                onChange={(event) => setForm((current) => ({ ...current, ativo: event.target.checked }))}
                type="checkbox"
              />
              <span>Paciente ativo</span>
            </label>

            <label className="field field-span-2">
              <span>Alergias</span>
              <textarea
                value={form.alergias}
                onChange={(event) => setForm((current) => ({ ...current, alergias: event.target.value }))}
                rows={3}
                placeholder="Medicamentos, alimentos, insumos ou observações relevantes"
              />
            </label>

            <label className="field field-span-2">
              <span>Histórico de vacinas</span>
              <textarea
                value={form.historicoVacinas}
                onChange={(event) =>
                  setForm((current) => ({ ...current, historicoVacinas: event.target.value }))
                }
                rows={3}
                placeholder="Vacinas registradas, datas ou pendências conhecidas"
              />
            </label>

            <div className="form-actions field-span-2">
              <button type="submit" className="button" disabled={submitting}>
                {submitting ? "Salvando..." : editingPatientId ? "Salvar alterações" : "Cadastrar paciente"}
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
              <p className="panel-kicker">FILTROS E CONTEXTO</p>
              <h2>Busca rápida</h2>
            </div>
          </div>

          <div className="stack-form">
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

            <div className="info-list">
              <div className="info-row">
                <strong>Pacientes exibidos</strong>
                <span>{patients.length}</span>
              </div>
              <div className="info-row">
                <strong>Ativos na lista</strong>
                <span>{patients.filter((patient) => patient.ativo).length}</span>
              </div>
            </div>
          </div>
        </article>
      </section>

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
                        <button type="button" className="button ghost small" onClick={() => startEditing(patient)}>
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
