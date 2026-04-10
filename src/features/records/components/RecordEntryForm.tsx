import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { MedicalRecord, RecordEntry } from "../../../types";
import { recordEntryTypeOptions } from "../../../utils/formatters";

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
    <form className="form-grid" onSubmit={onSubmit}>
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
          onChange={(event) =>
            setEntryForm((current) => ({ ...current, type: event.target.value }))
          }
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
  );
}