import type { MedicalRecord } from "../../../types";
import { formatDateTime } from "../../../utils/formatters";

type RecordDetailsProps = {
  record: MedicalRecord | null;
};

export function RecordDetails({ record }: RecordDetailsProps) {
  if (!record) {
    return (
      <div className="empty-state">
        Selecione um prontuário na tabela para visualizar o histórico clínico.
      </div>
    );
  }

  return (
    <div className="detail-stack">
      <div className="info-list">
        <div className="info-row">
          <strong>Diagnóstico</strong>
          <span>{record.diagnosis || "Não informado"}</span>
        </div>
        <div className="info-row">
          <strong>Tratamento</strong>
          <span>{record.treatment || "Não informado"}</span>
        </div>
        <div className="info-row">
          <strong>Observações</strong>
          <span>{record.observations || "Sem observações adicionais."}</span>
        </div>
      </div>

      <div className="timeline">
        {record.entries.length ? (
          record.entries.map((entry, index) => (
            <div key={`${record.id}-${index}`} className="timeline-item">
              <strong>{entry.type}</strong>
              <p>{entry.description}</p>
              <small>
                {entry.doctorName || "Profissional não informado"} •{" "}
                {formatDateTime(entry.entryDate)}
              </small>
            </div>
          ))
        ) : (
          <div className="empty-state">
            Este prontuário ainda não possui evoluções registradas.
          </div>
        )}
      </div>
    </div>
  );
}