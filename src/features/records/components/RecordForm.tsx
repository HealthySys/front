import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { MedicalRecordPayload, Patient } from "../../../types";
import { Button } from "../../../components/ui/Button";
import { InputField, SelectField, TextAreaField } from "../../../components/ui/FormField";
import patientStyles from "../../patients/components/PatientForm.module.css";

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
    <form className={patientStyles.formContainer} onSubmit={onSubmit}>
      <div className={patientStyles.card}>
        <div className={patientStyles.cardHeader}>
          <div>
            <h3 className={patientStyles.cardTitle}>Informações do prontuário</h3>
            <p className={patientStyles.cardDesc}>
              Vincule o paciente, o médico responsável e o quadro clínico atual.
            </p>
          </div>
        </div>
        <div className={patientStyles.grid}>
          <SelectField
            label="Paciente"
            required
            value={form.patientId || ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, patientId: Number(event.target.value) }))
            }
            span2
          >
            <option value="">Selecione um paciente</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.nome} · {patient.cpf}
              </option>
            ))}
          </SelectField>
          <InputField
            label="ID do médico responsável"
            placeholder="MED-01"
            value={form.responsibleDoctorId}
            onChange={(event) =>
              setForm((current) => ({ ...current, responsibleDoctorId: event.target.value }))
            }
          />
          <InputField
            label="Médico responsável"
            placeholder="Nome do médico"
            value={form.responsibleDoctorName}
            onChange={(event) =>
              setForm((current) => ({ ...current, responsibleDoctorName: event.target.value }))
            }
          />
          <TextAreaField
            label="Diagnóstico"
            placeholder="Hipótese diagnóstica ou diagnóstico fechado"
            value={form.diagnosis}
            rows={3}
            onChange={(event) => setForm((current) => ({ ...current, diagnosis: event.target.value }))}
            span2
          />
          <TextAreaField
            label="Tratamento"
            placeholder="Conduta, medicações, pedidos e acompanhamento"
            value={form.treatment}
            rows={3}
            onChange={(event) => setForm((current) => ({ ...current, treatment: event.target.value }))}
            span2
          />
          <TextAreaField
            label="Observações"
            placeholder="Observações clínicas, pendências, evolução e contexto"
            value={form.observations}
            rows={3}
            onChange={(event) =>
              setForm((current) => ({ ...current, observations: event.target.value }))
            }
            span2
          />
        </div>
      </div>

      <div className={patientStyles.formActions}>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando…" : isEditing ? "Salvar alterações" : "Criar prontuário"}
        </Button>
      </div>
    </form>
  );
}
