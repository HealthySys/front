import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, Trash2 } from "lucide-react";
import { useAuth } from "../../../auth/AuthProvider";
import { useToast } from "../../../components/feedback/ToastProvider";
import { useTopBarSlot } from "../../../components/layout/TopBarContext";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { InfoItem } from "../../../components/ui/InfoItem";
import { RiskBadge } from "../../../components/ui/RiskBadge";
import { InputField, SelectField, TextAreaField } from "../../../components/ui/FormField";
import { api } from "../../../services/api";
import type {
  AtendimentoExamInput,
  AtendimentoPayload,
  AtendimentoPrescriptionInput,
  Exam,
  MedicalRecord,
  Patient,
  Prescription,
  RecordEntry,
  StatusExame,
  TipoExame,
  TriageEntry,
  ViaAdministracao
} from "../../../types";
import {
  formatDate,
  formatDateTime,
  normalizeError,
  riskSla,
  sexoLabel,
  statusLabel
} from "../../../utils/formatters";
import styles from "./AttendancePage.module.css";

type Tab = "entry" | "history";

interface ConsultationForm {
  diagnosis: string;
  treatment: string;
  observations: string;
}

interface PrescriptionDraft {
  medicamento: string;
  dosagem: string;
  via: ViaAdministracao;
  frequencia: string;
  duracao: string;
  observacoes: string;
}

interface ExamDraft {
  tipo: TipoExame;
  nome: string;
  indicacaoClinica: string;
}

const emptyConsultation: ConsultationForm = {
  diagnosis: "",
  treatment: "",
  observations: ""
};

const emptyPrescriptionDraft: PrescriptionDraft = {
  medicamento: "",
  dosagem: "",
  via: "ORAL",
  frequencia: "",
  duracao: "",
  observacoes: ""
};

const emptyExamDraft: ExamDraft = {
  tipo: "LABORATORIAL",
  nome: "",
  indicacaoClinica: ""
};

const viaOptions: ViaAdministracao[] = [
  "ORAL",
  "INTRAVENOSA",
  "INTRAMUSCULAR",
  "SUBCUTANEA",
  "TOPICA",
  "INALATORIA",
  "OUTRA"
];

const viaLabels: Record<ViaAdministracao, string> = {
  ORAL: "Oral",
  INTRAVENOSA: "Intravenosa (IV)",
  INTRAMUSCULAR: "Intramuscular (IM)",
  SUBCUTANEA: "Subcutânea (SC)",
  TOPICA: "Tópica",
  INALATORIA: "Inalatória",
  OUTRA: "Outra"
};

const tipoExameOptions: TipoExame[] = ["LABORATORIAL", "IMAGEM", "CARDIOLOGICO", "OUTRO"];

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

function calculateAge(dob?: string): string {
  if (!dob) return "Idade não informada";
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return "Idade não informada";
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const m = now.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age--;
  return `${age} anos`;
}

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

function buildAtendimentoHistory(record: MedicalRecord | null): AtendimentoGroup[] {
  if (!record) return [];

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
  if (group.entries.length) parts.push(`${group.entries.length} consulta${group.entries.length > 1 ? "s" : ""}`);
  if (group.prescriptions.length) parts.push(`${group.prescriptions.length} prescrição${group.prescriptions.length > 1 ? "ões" : ""}`);
  if (group.exams.length) parts.push(`${group.exams.length} exame${group.exams.length > 1 ? "s" : ""}`);
  return parts.join(" · ");
}

export function AttendancePage() {
  const { triageId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [triage, setTriage] = useState<TriageEntry | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [consultation, setConsultation] = useState<ConsultationForm>(emptyConsultation);
  const [prescriptionDrafts, setPrescriptionDrafts] = useState<PrescriptionDraft[]>([]);
  const [examDrafts, setExamDrafts] = useState<ExamDraft[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("entry");
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const topBarExtras = useMemo(
    () =>
      triage ? (
        <>
          <RiskBadge risk={triage.riskClassification} />
          <span className={styles.attendingPill}>Em atendimento</span>
        </>
      ) : null,
    [triage?.riskClassification]
  );

  const topBarMeta = useMemo(
    () => ({
      eyebrow: "Atendimento médico",
      title: patient ? patient.nome : "Em atendimento",
      extras: topBarExtras
    }),
    [patient?.nome, topBarExtras]
  );

  useTopBarSlot(topBarMeta);

  const ensureRecord = useCallback(
    async (currentPatient: Patient): Promise<MedicalRecord> => {
      const existing = await api.listRecords(currentPatient.id);
      if (existing.length > 0) return existing[0];

      return api.createRecord({
        patientId: currentPatient.id,
        patientName: currentPatient.nome,
        diagnosis: "",
        treatment: "",
        observations: "",
        responsibleDoctorId: user ? String(user.id) : "",
        responsibleDoctorName: user?.nome ?? ""
      });
    },
    [user]
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!triageId) {
        toast.error("Triagem inválida.");
        navigate("/app");
        return;
      }

      setLoading(true);
      try {
        const triageEntry = await api.getTriage(Number(triageId));
        if (!active) return;
        const patientData = await api.getPatient(triageEntry.patientId);
        if (!active) return;
        const recordData = await ensureRecord(patientData);
        if (!active) return;

        setTriage(triageEntry);
        setPatient(patientData);
        setRecord(recordData);
      } catch (loadError) {
        if (active) {
          toast.error(normalizeError(loadError));
          navigate("/app");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [triageId, ensureRecord, navigate, toast]);

  const refreshRecord = useCallback(async () => {
    if (!record) return;
    const records = await api.listRecords(record.patientId);
    const updated = records.find((item) => item.id === record.id) ?? records[0];
    if (updated) setRecord(updated);
  }, [record]);

  const updatePrescription = (index: number, patch: Partial<PrescriptionDraft>) =>
    setPrescriptionDrafts((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );

  const removePrescription = (index: number) =>
    setPrescriptionDrafts((current) => current.filter((_, i) => i !== index));

  const addPrescription = () =>
    setPrescriptionDrafts((current) => [...current, { ...emptyPrescriptionDraft }]);

  const updateExam = (index: number, patch: Partial<ExamDraft>) =>
    setExamDrafts((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const removeExam = (index: number) =>
    setExamDrafts((current) => current.filter((_, i) => i !== index));

  const addExam = () => setExamDrafts((current) => [...current, { ...emptyExamDraft }]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!record) return;

    const consultationPayload =
      consultation.diagnosis.trim() || consultation.treatment.trim() || consultation.observations.trim()
        ? {
            diagnosis: consultation.diagnosis.trim(),
            treatment: consultation.treatment.trim(),
            observations: consultation.observations.trim()
          }
        : null;

    const prescriptionsPayload: AtendimentoPrescriptionInput[] = [];
    for (const draft of prescriptionDrafts) {
      const medicamento = draft.medicamento.trim();
      if (!medicamento) continue;
      const dosagem = draft.dosagem.trim();
      if (!dosagem) {
        toast.error(`Informe a dosagem da prescrição "${medicamento}".`);
        return;
      }
      prescriptionsPayload.push({
        medicamento,
        dosagem,
        via: draft.via,
        frequencia: draft.frequencia.trim(),
        duracao: draft.duracao.trim(),
        observacoes: draft.observacoes.trim() || undefined
      });
    }

    const examsPayload: AtendimentoExamInput[] = [];
    for (const draft of examDrafts) {
      const nome = draft.nome.trim();
      if (!nome) continue;
      examsPayload.push({
        tipo: draft.tipo,
        nome,
        indicacaoClinica: draft.indicacaoClinica.trim() || undefined
      });
    }

    if (!consultationPayload && prescriptionsPayload.length === 0 && examsPayload.length === 0) {
      toast.error("Preencha ao menos uma das seções antes de salvar.");
      return;
    }

    const payload: AtendimentoPayload = {
      consultation: consultationPayload,
      prescriptions: prescriptionsPayload,
      exams: examsPayload
    };

    if (!triage) return;

    setSaving(true);
    try {
      await api.registerAtendimento(record.id, payload);
    } catch (submitError) {
      toast.error(normalizeError(submitError));
      setSaving(false);
      return;
    }

    try {
      await api.updateTriageStatus(triage.id, "ATENDIDO");
      toast.success("Atendimento finalizado.");
    } catch (statusError) {
      toast.error(
        `Atendimento salvo, mas não foi possível encerrar a triagem: ${normalizeError(statusError)}`
      );
    } finally {
      setSaving(false);
    }

    navigate("/app");
  };

  const history = useMemo(() => buildAtendimentoHistory(record), [record]);

  if (loading) {
    return <div className={styles.loader}>Preparando atendimento…</div>;
  }
  if (!triage || !patient || !record) return null;

  return (
    <div className={styles.shell}>
      <aside className={styles.left}>
        <button type="button" className={styles.back} onClick={() => navigate("/app/triagem")}>
          <ArrowLeft size={14} />
          Voltar à fila
        </button>

        <div className={styles.identity}>
          <div className={styles.identityHead}>
            <Avatar name={patient.nome} size={48} fontSize={18} />
            <div>
              <h2 className={styles.identityName}>{patient.nome}</h2>
              <span className={styles.identitySub}>
                {calculateAge(patient.dataNascimento)} · {sexoLabel(patient.sexo)}
              </span>
            </div>
          </div>
          <div className={styles.grid2}>
            <InfoItem label="CPF" value={patient.cpf} />
            <InfoItem label="Telefone" value={patient.telefone} />
            <InfoItem label="E-mail" value={patient.email} />
            <InfoItem label="Endereço" value={patient.endereco} />
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Dados clínicos</span>
          <div className={styles.grid2}>
            <InfoItem label="Tipo sanguíneo" value={patient.tipoSanguineo} />
            <InfoItem label="Nascimento" value={formatDate(patient.dataNascimento)} />
          </div>

          <div>
            <span className={styles.sectionLabel} style={{ display: "block", marginBottom: 6 }}>
              Alergias
            </span>
            {patient.alergias?.length ? (
              <div className={styles.pillRow}>
                {patient.alergias.map((allergy, idx) => (
                  <span key={idx} className={styles.allergyPill}>
                    {allergy.nomeAlergia} · {allergy.severidade}
                  </span>
                ))}
              </div>
            ) : (
              <span className={styles.empty}>Nenhuma alergia registrada.</span>
            )}
          </div>

          <div>
            <span className={styles.sectionLabel} style={{ display: "block", marginBottom: 6 }}>
              Vacinas
            </span>
            {patient.vacinas?.length ? (
              <div className={styles.pillRow}>
                {patient.vacinas.map((vaccine, idx) => (
                  <span key={idx} className={styles.vaccinePill}>
                    {vaccine.nomeVacina}
                  </span>
                ))}
              </div>
            ) : (
              <span className={styles.empty}>Nenhuma vacina registrada.</span>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.triageHead}>
            <span className={styles.sectionLabel}>Triagem</span>
            <RiskBadge risk={triage.riskClassification} />
          </div>
          <div className={styles.boxRow}>
            <div className={styles.boxSlaManchester}>
              <span className={styles.boxLabel}>Risco</span>
              <span className={styles.boxValue}>{riskSla(triage.riskClassification)}</span>
            </div>
            <div className={styles.boxStatus}>
              <span className={styles.boxLabel}>Status</span>
              <span className={styles.boxValue}>{statusLabel(triage.status)}</span>
            </div>
          </div>
          <InfoItem label="Queixa principal" value={triage.chiefComplaint} />
          <InfoItem label="Sinais vitais" value={triage.vitalSigns} />
          <InfoItem label="Triado em" value={formatDateTime(triage.triageDate)} />
          <InfoItem label="Triado por" value={triage.nurseName} />
          {triage.observations ? (
            <div>
              <span className={styles.sectionLabel} style={{ display: "block", marginBottom: 6 }}>
                Observações da triagem
              </span>
              <div className={styles.observations}>{triage.observations}</div>
            </div>
          ) : null}
        </div>
      </aside>

      <section className={styles.right}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab}${activeTab === "entry" ? ` ${styles.tabActive}` : ""}`}
            onClick={() => setActiveTab("entry")}
          >
            Novo atendimento
          </button>
          <button
            type="button"
            className={`${styles.tab}${activeTab === "history" ? ` ${styles.tabActive}` : ""}`}
            onClick={() => setActiveTab("history")}
          >
            Histórico
            <span className={styles.tabBadge}>{history.length}</span>
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "entry" ? (
            <form onSubmit={handleSubmit}>
              <div className={styles.entryCard}>
                <div className={styles.attendSectionHead}>
                  <h3 className={styles.attendSectionTitle}>Consulta</h3>
                  <p className={styles.attendSectionDesc}>
                    Diagnóstico, conduta e observações da avaliação clínica.
                  </p>
                </div>
                <TextAreaField
                  label="Diagnóstico"
                  value={consultation.diagnosis}
                  onChange={(event) => setConsultation((c) => ({ ...c, diagnosis: event.target.value }))}
                  rows={3}
                  placeholder="Hipóteses diagnósticas e impressão clínica…"
                />
                <TextAreaField
                  label="Tratamento / conduta"
                  value={consultation.treatment}
                  onChange={(event) => setConsultation((c) => ({ ...c, treatment: event.target.value }))}
                  rows={3}
                  placeholder="Conduta, encaminhamentos, recomendações…"
                />
                <TextAreaField
                  label="Observações adicionais"
                  value={consultation.observations}
                  onChange={(event) => setConsultation((c) => ({ ...c, observations: event.target.value }))}
                  rows={2}
                  placeholder="Notas complementares…"
                />
              </div>

              <div className={styles.entryCard}>
                <div className={styles.attendSectionHead}>
                  <div>
                    <h3 className={styles.attendSectionTitle}>Prescrições</h3>
                    <p className={styles.attendSectionDesc}>
                      Medicamentos a serem prescritos neste atendimento.
                    </p>
                  </div>
                  <Button type="button" variant="secondary" size="sm" onClick={addPrescription}>
                    + Adicionar prescrição
                  </Button>
                </div>

                {prescriptionDrafts.length === 0 ? (
                  <p className={styles.attendEmpty}>Nenhuma prescrição adicionada.</p>
                ) : (
                  prescriptionDrafts.map((draft, index) => (
                    <div key={index} className={styles.attendItem}>
                      <div className={styles.attendItemHead}>
                        <span className={styles.attendItemNumber}>{index + 1}</span>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removePrescription(index)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <div className={styles.attendItemGrid}>
                        <InputField
                          label="Medicamento"
                          value={draft.medicamento}
                          onChange={(event) =>
                            updatePrescription(index, { medicamento: event.target.value })
                          }
                          placeholder="Ex.: Dipirona 500mg"
                          span2
                        />
                        <InputField
                          label="Dosagem"
                          value={draft.dosagem}
                          onChange={(event) => updatePrescription(index, { dosagem: event.target.value })}
                          placeholder="Ex.: 1 comprimido"
                        />
                        <SelectField
                          label="Via de administração"
                          value={draft.via}
                          onChange={(event) =>
                            updatePrescription(index, { via: event.target.value as ViaAdministracao })
                          }
                        >
                          {viaOptions.map((via) => (
                            <option key={via} value={via}>
                              {viaLabels[via]}
                            </option>
                          ))}
                        </SelectField>
                        <InputField
                          label="Frequência"
                          value={draft.frequencia}
                          onChange={(event) =>
                            updatePrescription(index, { frequencia: event.target.value })
                          }
                          placeholder="Ex.: a cada 8 horas"
                        />
                        <InputField
                          label="Duração"
                          value={draft.duracao}
                          onChange={(event) => updatePrescription(index, { duracao: event.target.value })}
                          placeholder="Ex.: 7 dias / uso contínuo"
                        />
                        <TextAreaField
                          label="Observações"
                          value={draft.observacoes}
                          onChange={(event) =>
                            updatePrescription(index, { observacoes: event.target.value })
                          }
                          rows={2}
                          placeholder="Ex.: tomar em jejum, não interromper…"
                          span2
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.entryCard}>
                <div className={styles.attendSectionHead}>
                  <div>
                    <h3 className={styles.attendSectionTitle}>Exames</h3>
                    <p className={styles.attendSectionDesc}>
                      Exames a serem solicitados neste atendimento.
                    </p>
                  </div>
                  <Button type="button" variant="secondary" size="sm" onClick={addExam}>
                    + Adicionar exame
                  </Button>
                </div>

                {examDrafts.length === 0 ? (
                  <p className={styles.attendEmpty}>Nenhum exame adicionado.</p>
                ) : (
                  examDrafts.map((draft, index) => (
                    <div key={index} className={styles.attendItem}>
                      <div className={styles.attendItemHead}>
                        <span className={styles.attendItemNumber}>{index + 1}</span>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeExam(index)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <div className={styles.attendItemGrid}>
                        <SelectField
                          label="Tipo de exame"
                          value={draft.tipo}
                          onChange={(event) =>
                            updateExam(index, { tipo: event.target.value as TipoExame })
                          }
                        >
                          {tipoExameOptions.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipoExameLabels[tipo]}
                            </option>
                          ))}
                        </SelectField>
                        <InputField
                          label="Nome do exame"
                          value={draft.nome}
                          onChange={(event) => updateExam(index, { nome: event.target.value })}
                          placeholder="Ex.: Hemograma completo"
                        />
                        <TextAreaField
                          label="Indicação clínica"
                          value={draft.indicacaoClinica}
                          onChange={(event) =>
                            updateExam(index, { indicacaoClinica: event.target.value })
                          }
                          rows={2}
                          placeholder="Justificativa clínica para a solicitação…"
                          span2
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.formActions}>
                <Button type="submit" disabled={saving}>
                  {saving ? "Finalizando…" : "Finalizar atendimento"}
                </Button>
              </div>
              <p className={styles.note}>
                Ao finalizar, o atendimento é gravado e o paciente é marcado como atendido. Se algum item
                falhar, nada é persistido — você pode tentar novamente. Seções não preenchidas são opcionais.
              </p>
            </form>
          ) : null}

          {activeTab === "history" ? (
            history.length ? (
              <div className={styles.history}>
                {history.map((group) => {
                  const isOpen = openGroupKey === group.key;
                  return (
                    <div key={group.key} className={styles.historyItem}>
                      <button
                        type="button"
                        className={styles.historyHead}
                        onClick={() => setOpenGroupKey(isOpen ? null : group.key)}
                      >
                        <div className={styles.historyMain}>
                          <span className={styles.historyExcerpt}>{groupTitle(group)}</span>
                          <span className={styles.historyMeta}>
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
                        <div className={styles.historyExpanded}>
                          {renderGroupBody(group)}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.note} style={{ textAlign: "center", padding: 32 }}>
                Nenhum atendimento registrado ainda neste prontuário.
              </div>
            )
          ) : null}

        </div>
      </section>
    </div>
  );
}

function renderGroupBody(group: AtendimentoGroup) {
  return (
    <div className={styles.groupBody}>
      {group.entries.length ? (
        <div className={styles.groupSection}>
          <span className={styles.groupSectionLabel}>Consulta</span>
          {group.entries.map((entry, index) => (
            <div key={`entry-${index}`} className={styles.groupEntry}>
              <div className={styles.groupEntryMeta}>
                {formatDateTime(entry.entryDate)} · {entry.doctorName || "Profissional não informado"}
                {entry.type && entry.type !== "CONSULTA" ? ` · ${entry.type}` : ""}
              </div>
              <pre className={styles.groupEntryText}>{entry.description ?? ""}</pre>
            </div>
          ))}
        </div>
      ) : null}

      {group.prescriptions.length ? (
        <div className={styles.groupSection}>
          <span className={styles.groupSectionLabel}>Prescrições</span>
          {group.prescriptions.map((p) => (
            <div key={p.id} className={styles.groupEntry}>
              <div className={styles.groupEntryTitle}>
                {p.medicamento} · {p.dosagem}
              </div>
              <div className={styles.groupGrid}>
                <InfoItem label="Via" value={viaLabels[p.via] ?? p.via} />
                <InfoItem label="Frequência" value={p.frequencia || "—"} />
                <InfoItem label="Duração" value={p.duracao || "—"} />
                <InfoItem label="Médico" value={p.doctorName || "—"} />
                {p.observacoes ? (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <InfoItem label="Observações" value={p.observacoes} />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {group.exams.length ? (
        <div className={styles.groupSection}>
          <span className={styles.groupSectionLabel}>Exames</span>
          {group.exams.map((exam) => (
            <div key={exam.id} className={styles.groupEntry}>
              <div className={styles.groupEntryTitle}>
                {exam.nome} · {tipoExameLabels[exam.tipo] ?? exam.tipo}
              </div>
              <div className={styles.groupGrid}>
                <InfoItem label="Status" value={statusExameLabels[exam.status] ?? exam.status} />
                <InfoItem label="Solicitado em" value={formatDateTime(exam.requestedAt)} />
                <InfoItem label="Médico" value={exam.doctorName || "—"} />
                {exam.indicacaoClinica ? (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <InfoItem label="Indicação clínica" value={exam.indicacaoClinica} />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
