import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type {
  Exam,
  MedicalRecord,
  Prescription,
  RecordEntry,
  StatusExame,
  TipoExame,
  ViaAdministracao
} from "../../../types";
import { formatDate, formatDateTime } from "../../../utils/formatters";
import { Card } from "../../../components/ui/Card";
import { EntryBadge } from "../../../components/ui/EntryBadge";
import { InfoItem } from "../../../components/ui/InfoItem";
import styles from "./RecordAccordion.module.css";

const viaLabels: Record<ViaAdministracao, string> = {
  ORAL: "Oral",
  INTRAVENOSA: "Intravenosa (IV)",
  INTRAMUSCULAR: "Intramuscular (IM)",
  SUBCUTANEA: "Subcutânea (SC)",
  TOPICA: "Tópica",
  INALATORIA: "Inalatória",
  OUTRA: "Outra"
};

const tipoExameLabels: Record<TipoExame, string> = {
  LABORATORIAL: "Laboratorial",
  IMAGEM: "Imagem",
  CARDIOLOGICO: "Cardiológico",
  OUTRO: "Outro"
};

const statusExameLabels: Record<StatusExame, string> = {
  SOLICITADO: "Solicitado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado"
};

type AtendimentoGroup = {
  key: string;
  correlationId: string | null;
  date: string;
  entries: RecordEntry[];
  prescriptions: Prescription[];
  exams: Exam[];
};

function dayKey(timestamp?: string): string {
  if (!timestamp) return "sem-data";
  return timestamp.slice(0, 10);
}

function ensureGroup(
  groups: Map<string, AtendimentoGroup>,
  key: string,
  correlationId: string | null,
  timestamp: string | undefined
): AtendimentoGroup {
  let group = groups.get(key);
  if (!group) {
    group = {
      key,
      correlationId,
      date: timestamp ?? "",
      entries: [],
      prescriptions: [],
      exams: []
    };
    groups.set(key, group);
  }
  if (!group.date && timestamp) group.date = timestamp;
  return group;
}

function buildAtendimentoHistory(record: MedicalRecord): AtendimentoGroup[] {
  const groups = new Map<string, AtendimentoGroup>();

  for (const entry of record.entries ?? []) {
    const key = entry.correlationId ?? `day-${dayKey(entry.entryDate)}`;
    const group = ensureGroup(groups, key, entry.correlationId ?? null, entry.entryDate);
    group.entries.push(entry);
  }

  for (const prescription of record.prescriptions ?? []) {
    const key = prescription.correlationId ?? `day-${dayKey(prescription.prescribedAt)}`;
    const group = ensureGroup(groups, key, prescription.correlationId ?? null, prescription.prescribedAt);
    group.prescriptions.push(prescription);
  }

  for (const exam of record.exams ?? []) {
    const key = exam.correlationId ?? `day-${dayKey(exam.requestedAt)}`;
    const group = ensureGroup(groups, key, exam.correlationId ?? null, exam.requestedAt);
    group.exams.push(exam);
  }

  return [...groups.values()].sort((a, b) => {
    const da = new Date(a.date).getTime() || 0;
    const db = new Date(b.date).getTime() || 0;
    return db - da;
  });
}

function groupTitle(group: AtendimentoGroup): string {
  if (group.correlationId) {
    return `Atendimento de ${formatDateTime(group.date)}`;
  }
  return `Registros de ${formatDate(group.date)}`;
}

function groupSummary(group: AtendimentoGroup): string {
  const parts: string[] = [];
  if (group.entries.length) {
    parts.push(`${group.entries.length} evoluç${group.entries.length > 1 ? "ões" : "ão"}`);
  }
  if (group.prescriptions.length) {
    parts.push(`${group.prescriptions.length} prescriç${group.prescriptions.length > 1 ? "ões" : "ão"}`);
  }
  if (group.exams.length) {
    parts.push(`${group.exams.length} exame${group.exams.length > 1 ? "s" : ""}`);
  }
  return parts.join(" · ");
}

type RecordDetailsProps = {
  record: MedicalRecord | null;
};

export function RecordDetails({ record }: RecordDetailsProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  if (!record) {
    return (
      <Card>
        <p style={{ margin: 0, color: "var(--hs-text-3)" }}>
          Selecione um prontuário na lista para visualizar o histórico clínico.
        </p>
      </Card>
    );
  }

  const history = buildAtendimentoHistory(record);

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
          Histórico de atendimentos
        </h3>
        {history.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map((group) => {
              const isOpen = openKey === group.key;
              return (
                <div
                  key={group.key}
                  style={{
                    border: "1px solid var(--hs-border)",
                    borderRadius: 10,
                    background: "var(--hs-surface-2)",
                    overflow: "hidden"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenKey(isOpen ? null : group.key)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: 14,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "var(--hs-text-1)"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{groupTitle(group)}</span>
                      <span style={{ fontSize: 11.5, color: "var(--hs-text-3)" }}>
                        {groupSummary(group) || "Sem itens"}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      style={{
                        color: "var(--hs-text-3)",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                        transition: "transform 160ms ease"
                      }}
                    />
                  </button>
                  {isOpen ? (
                    <div
                      style={{
                        padding: "0 14px 14px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 14
                      }}
                    >
                      {group.entries.length ? (
                        <Section title="Consulta">
                          {group.entries.map((entry, idx) => (
                            <div
                              key={`entry-${idx}`}
                              style={{
                                border: "1px solid var(--hs-border)",
                                borderRadius: 8,
                                padding: 12,
                                background: "var(--hs-surface-1)"
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 8,
                                  marginBottom: 6
                                }}
                              >
                                <EntryBadge type={entry.type} />
                                <span style={{ fontSize: 11, color: "var(--hs-text-3)" }}>
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
                        </Section>
                      ) : null}

                      {group.prescriptions.length ? (
                        <Section title="Prescrições">
                          {group.prescriptions.map((p) => (
                            <div
                              key={p.id}
                              style={{
                                border: "1px solid var(--hs-border)",
                                borderRadius: 8,
                                padding: 12,
                                background: "var(--hs-surface-1)"
                              }}
                            >
                              <div style={{ marginBottom: 8, fontSize: 13.5, fontWeight: 600 }}>
                                {p.medicamento} · {p.dosagem}
                              </div>
                              <div className={styles.summary}>
                                <InfoItem label="Via" value={viaLabels[p.via] ?? p.via} />
                                <InfoItem label="Frequência" value={p.frequencia || "—"} />
                                <InfoItem label="Duração" value={p.duracao || "—"} />
                                <InfoItem label="Médico" value={p.doctorName || "—"} />
                              </div>
                              {p.observacoes ? (
                                <div className={styles.cell} style={{ marginTop: 8 }}>
                                  <span className={styles.cellLabel}>Observações</span>
                                  <span className={styles.cellValue}>{p.observacoes}</span>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </Section>
                      ) : null}

                      {group.exams.length ? (
                        <Section title="Exames">
                          {group.exams.map((exam) => (
                            <div
                              key={exam.id}
                              style={{
                                border: "1px solid var(--hs-border)",
                                borderRadius: 8,
                                padding: 12,
                                background: "var(--hs-surface-1)"
                              }}
                            >
                              <div style={{ marginBottom: 8, fontSize: 13.5, fontWeight: 600 }}>
                                {exam.nome} · {tipoExameLabels[exam.tipo] ?? exam.tipo}
                              </div>
                              <div className={styles.summary}>
                                <InfoItem
                                  label="Status"
                                  value={statusExameLabels[exam.status] ?? exam.status}
                                />
                                <InfoItem label="Médico" value={exam.doctorName || "—"} />
                                {exam.resultedAt ? (
                                  <InfoItem
                                    label="Resultado em"
                                    value={formatDateTime(exam.resultedAt)}
                                  />
                                ) : null}
                              </div>
                              {exam.indicacaoClinica ? (
                                <div className={styles.cell} style={{ marginTop: 8 }}>
                                  <span className={styles.cellLabel}>Indicação clínica</span>
                                  <span className={styles.cellValue}>{exam.indicacaoClinica}</span>
                                </div>
                              ) : null}
                              {exam.resultado ? (
                                <div className={styles.cell} style={{ marginTop: 8 }}>
                                  <span className={styles.cellLabel}>Resultado</span>
                                  <span className={styles.cellValue}>{exam.resultado}</span>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </Section>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ margin: 0, color: "var(--hs-text-3)", fontStyle: "italic" }}>
            Este prontuário ainda não possui atendimentos registrados.
          </p>
        )}
      </Card>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: "var(--hs-text-3)"
        }}
      >
        {title}
      </span>
      {children}
    </div>
  );
}
