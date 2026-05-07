import type { MedicalRecord } from "../../../types";
import { formatDateTime } from "../../../utils/formatters";
import { Card } from "../../../components/ui/Card";
import { EntryBadge } from "../../../components/ui/EntryBadge";
import { InfoItem } from "../../../components/ui/InfoItem";
import styles from "./RecordAccordion.module.css";

type RecordDetailsProps = {
  record: MedicalRecord | null;
};

export function RecordDetails({ record }: RecordDetailsProps) {
  if (!record) {
    return (
      <Card>
        <p style={{ margin: 0, color: "var(--hs-text-3)" }}>
          Selecione um prontuário na lista para visualizar o histórico clínico.
        </p>
      </Card>
    );
  }

  const entries = record.entries.slice().reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div className={styles.summary} style={{ marginBottom: 12 }}>
          <InfoItem label="Paciente" value={record.patientName} />
          <InfoItem label="Médico responsável" value={record.responsibleDoctorName} />
          <InfoItem label="Diagnóstico" value={record.diagnosis} />
          <InfoItem label="Tratamento" value={record.treatment} />
        </div>
        {record.observations ? (
          <div className={styles.cell}>
            <span className={styles.cellLabel}>Observações</span>
            <span className={styles.cellValue}>{record.observations}</span>
          </div>
        ) : null}
      </Card>

      <Card>
        <h3 style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: 700 }}>
          Histórico de evoluções
        </h3>
        {entries.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {entries.map((entry, index) => (
              <div
                key={`${record.id}-${index}`}
                style={{
                  border: "1px solid var(--hs-border)",
                  borderRadius: 10,
                  padding: 14,
                  background: "var(--hs-surface-2)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    gap: 8
                  }}
                >
                  <EntryBadge type={entry.type} />
                  <span style={{ fontSize: 11.5, color: "var(--hs-text-3)" }}>
                    {entry.doctorName || "Profissional não informado"} ·{" "}
                    {formatDateTime(entry.entryDate)}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    fontSize: 13,
                    color: "var(--hs-text-2)",
                    lineHeight: 1.6
                  }}
                >
                  {entry.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: "var(--hs-text-3)", fontStyle: "italic" }}>
            Este prontuário ainda não possui evoluções registradas.
          </p>
        )}
      </Card>
    </div>
  );
}
