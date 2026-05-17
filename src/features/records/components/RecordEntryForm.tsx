import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { MedicalRecord, RecordEntry } from "../../../types";
import { recordEntryTypeOptions } from "../../../utils/formatters";
import { Button } from "../../../components/ui/Button";
import { InputField, SelectField, TextAreaField } from "../../../components/ui/FormField";
import patientStyles from "../../patients/components/PatientForm.module.css";

type RecordEntryFormProps = {
  records: MedicalRecord[];
  selectedRecordId: string | null;
  setSelectedRecordId: Dispatch<SetStateAction<string | null>>;
  entryForm: RecordEntry;
  setEntryForm: Dispatch<SetStateAction<RecordEntry>>;
  submitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function RecordEntryForm({
  records,
  selectedRecordId,
  setSelectedRecordId,
  entryForm,
  setEntryForm,
  submitting,
  onSubmit
}: RecordEntryFormProps) {
  return (
    <form className={patientStyles.formContainer} onSubmit={onSubmit}>
      <div className={patientStyles.card}>
        <div className={patientStyles.cardHeader}>
          <div>
            <h3 className={patientStyles.cardTitle}>Nova evolução</h3>
            <p className={patientStyles.cardDesc}>Adicione um item ao histórico do prontuário selecionado.</p>
          </div>
        </div>
        <div className={patientStyles.grid}>
          <SelectField
            label="Prontuário"
            required
            value={selectedRecordId || ""}
            onChange={(event) => setSelectedRecordId(event.target.value || null)}
          >
            <option value="">Selecione um prontuário</option>
            {records.map((record) => (
              <option key={record.id} value={record.id}>
                {record.patientName} · {record.responsibleDoctorName || "Sem responsável"}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Tipo de entrada"
            value={entryForm.type}
            onChange={(event) => setEntryForm((c) => ({ ...c, type: event.target.value }))}
          >
            {recordEntryTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </SelectField>
          <InputField
            label="ID do profissional"
            placeholder="MED-01"
            value={entryForm.doctorId}
            onChange={(event) => setEntryForm((c) => ({ ...c, doctorId: event.target.value }))}
          />
          <InputField
            label="Nome do profissional"
            placeholder="Responsável pela evolução"
            value={entryForm.doctorName}
            onChange={(event) => setEntryForm((c) => ({ ...c, doctorName: event.target.value }))}
          />
          <TextAreaField
            label="Descrição"
            placeholder="Descreva a evolução, exame ou procedimento"
            value={entryForm.description}
            rows={4}
            onChange={(event) => setEntryForm((c) => ({ ...c, description: event.target.value }))}
            span2
          />
        </div>
      </div>

      <div className={patientStyles.formActions}>
        <Button type="submit" disabled={submitting || !selectedRecordId}>
          {submitting ? "Salvando…" : "Adicionar evolução"}
        </Button>
      </div>
    </form>
  );
}
