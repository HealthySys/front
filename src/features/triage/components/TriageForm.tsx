import type { Patient, TriageEntry } from "../../../types";
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
  nurseId: string;
  nurseName: string;
  status: TriageEntry["status"];
};

export const initialTriageForm: TriageFormState = {
  patientId: "",
  riskClassification: "AMARELO",
  chiefComplaint: "",
  vitalSigns: "",
  observations: "",
  nurseId: "",
  nurseName: "",
  status: "AGUARDANDO_ATENDIMENTO"
};

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
