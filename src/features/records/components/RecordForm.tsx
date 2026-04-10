import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { MedicalRecordPayload, Patient } from "../../../types";

type RecordFormProps = {
  form: MedicalRecordPayload;
  setForm: Dispatch<SetStateAction<MedicalRecordPayload>>;
  patients: Patient[];
  submitting: boolean;
  isEditing?: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
};

export function RecordForm({
  form,
  setForm,
  patients,
  submitting,
  isEditing = false,
  onSubmit,
  onCancel
}: RecordFormProps) {
  return (
    <form className="form-grid wide-grid" onSubmit={onSubmit}>
      <label className="field field-span-2">
        <span>Paciente</span>
        <select
          value={form.patientId || ""}
          onChange={(event) =>
            setForm((current) => ({ ...current, patientId: Number(event.target.value) }))
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
          value={form.diagnosis}
          onChange={(event) =>
            setForm((current) => ({ ...current, diagnosis: event.target.value }))
          }
          rows={3}
          placeholder="Hipótese diagnóstica ou diagnóstico fechado"
        />
      </label>

      <label className="field field-span-2">
        <span>Tratamento</span>
        <textarea
          value={form.treatment}
          onChange={(event) =>
            setForm((current) => ({ ...current, treatment: event.target.value }))
          }
          rows={3}
          placeholder="Conduta, medicações, pedidos e acompanhamento"
        />
      </label>

      <label className="field">
        <span>ID do médico responsável</span>
        <input
          value={form.responsibleDoctorId}
          onChange={(event) =>
            setForm((current) => ({
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
          value={form.responsibleDoctorName}
          onChange={(event) =>
            setForm((current) => ({
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
          value={form.observations}
          onChange={(event) =>
            setForm((current) => ({ ...current, observations: event.target.value }))
          }
          rows={4}
          placeholder="Observações clínicas, pendências, evolução e contexto"
        />
      </label>

      <div className="form-actions field-span-2">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar prontuário"}
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