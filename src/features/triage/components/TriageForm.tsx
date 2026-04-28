import type { AllergyPayload, Patient, Severidade, TriageEntry, VaccinePayload } from "../../../types";
import {
  riskLabel,
  riskOptions,
  riskSla,
  statusLabel,
  triageStatusOptions
} from "../../../utils/formatters";

export type TriageFormState = {
  patientId: string;
  riskClassification: TriageEntry["riskClassification"];
  chiefComplaint: string;
  vitalSigns: string;
  observations: string;
  status: TriageEntry["status"];
  alergiasReportadas: AllergyPayload[];
  vacinasReportadas: VaccinePayload[];
};

export const initialTriageForm: TriageFormState = {
  patientId: "",
  riskClassification: "AMARELO",
  chiefComplaint: "",
  vitalSigns: "",
  observations: "",
  status: "AGUARDANDO_ATENDIMENTO",
  alergiasReportadas: [],
  vacinasReportadas: []
};

const emptyAllergy: AllergyPayload = { nomeAlergia: "", severidade: "LEVE" };
const emptyVaccine: VaccinePayload = { nomeVacina: "", dataAplicacao: "" };

const severityOptions: Severidade[] = ["LEVE", "MODERADA", "GRAVE"];

type TriageFormProps = {
  patients: Patient[];
  form: TriageFormState;
  setForm: React.Dispatch<React.SetStateAction<TriageFormState>>;
  submitting: boolean;
  isEditing?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
};

export function TriageForm({
  patients,
  form,
  setForm,
  submitting,
  isEditing = false,
  onSubmit,
  onCancel
}: TriageFormProps) {
  const updateAllergy = (index: number, patch: Partial<AllergyPayload>) =>
    setForm((current) => ({
      ...current,
      alergiasReportadas: current.alergiasReportadas.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      )
    }));

  const removeAllergy = (index: number) =>
    setForm((current) => ({
      ...current,
      alergiasReportadas: current.alergiasReportadas.filter((_, i) => i !== index)
    }));

  const addAllergy = () =>
    setForm((current) => ({
      ...current,
      alergiasReportadas: [...current.alergiasReportadas, { ...emptyAllergy }]
    }));

  const updateVaccine = (index: number, patch: Partial<VaccinePayload>) =>
    setForm((current) => ({
      ...current,
      vacinasReportadas: current.vacinasReportadas.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      )
    }));

  const removeVaccine = (index: number) =>
    setForm((current) => ({
      ...current,
      vacinasReportadas: current.vacinasReportadas.filter((_, i) => i !== index)
    }));

  const addVaccine = () =>
    setForm((current) => ({
      ...current,
      vacinasReportadas: [...current.vacinasReportadas, { ...emptyVaccine }]
    }));

  return (
    <form className="form-grid wide-grid" onSubmit={onSubmit}>
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
              riskClassification: event.target.value as TriageEntry["riskClassification"]
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

      {isEditing ? (
        <label className="field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as TriageEntry["status"]
              }))
            }
          >
            {triageStatusOptions.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="field field-span-2">
        <span>Queixa principal</span>
        <textarea
          value={form.chiefComplaint}
          onChange={(event) => setForm((current) => ({ ...current, chiefComplaint: event.target.value }))}
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

      <label className="field field-span-2">
        <span>Observações adicionais</span>
        <textarea
          value={form.observations}
          onChange={(event) => setForm((current) => ({ ...current, observations: event.target.value }))}
          rows={3}
          placeholder="Informações complementares para priorização e continuidade"
        />
      </label>

      {!isEditing ? (
        <>
          <div className="field-span-2">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">ALERGIAS RELATADAS</p>
              </div>
              <button type="button" className="button ghost" onClick={addAllergy}>
                + Adicionar alergia
              </button>
            </div>

            {form.alergiasReportadas.length === 0 ? (
              <p className="empty-state">Nenhuma alergia relatada nesta triagem.</p>
            ) : (
              <div className="stack-form">
                {form.alergiasReportadas.map((allergy, index) => (
                  <div key={index} className="form-grid wide-grid">
                    <label className="field">
                      <span>Nome da alergia</span>
                      <input
                        value={allergy.nomeAlergia}
                        onChange={(event) => updateAllergy(index, { nomeAlergia: event.target.value })}
                        placeholder="Ex: Dipirona"
                      />
                    </label>

                    <label className="field">
                      <span>Severidade</span>
                      <select
                        value={allergy.severidade}
                        onChange={(event) =>
                          updateAllergy(index, { severidade: event.target.value as Severidade })
                        }
                      >
                        {severityOptions.map((severity) => (
                          <option key={severity} value={severity}>
                            {severity}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="form-actions">
                      <button type="button" className="button ghost" onClick={() => removeAllergy(index)}>
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="field-span-2">
            <div className="panel-head">
              <div>
                <p className="panel-kicker">VACINAS RELATADAS</p>
              </div>
              <button type="button" className="button ghost" onClick={addVaccine}>
                + Adicionar vacina
              </button>
            </div>

            {form.vacinasReportadas.length === 0 ? (
              <p className="empty-state">Nenhuma vacina relatada nesta triagem.</p>
            ) : (
              <div className="stack-form">
                {form.vacinasReportadas.map((vaccine, index) => (
                  <div key={index} className="form-grid wide-grid">
                    <label className="field">
                      <span>Nome da vacina</span>
                      <input
                        value={vaccine.nomeVacina}
                        onChange={(event) => updateVaccine(index, { nomeVacina: event.target.value })}
                        placeholder="Ex: Tétano"
                      />
                    </label>

                    <label className="field">
                      <span>Data de aplicação</span>
                      <input
                        type="date"
                        value={vaccine.dataAplicacao}
                        onChange={(event) => updateVaccine(index, { dataAplicacao: event.target.value })}
                      />
                    </label>

                    <div className="form-actions">
                      <button type="button" className="button ghost" onClick={() => removeVaccine(index)}>
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      <div className="form-actions field-span-2">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Registrar triagem"}
        </button>

        {onCancel ? (
          <button type="button" className="button ghost" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
