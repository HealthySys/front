import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { useToast } from "../../../components/feedback/ToastProvider";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { MedicalRecord, Patient, RecordEntry, TriageEntry } from "../../../types";
import {
  formatDateTime,
  normalizeError,
  riskLabel,
  riskSla,
  statusLabel
} from "../../../utils/formatters";

interface ConsultationForm {
  diagnosis: string;
  treatment: string;
  observations: string;
}

const emptyConsultation: ConsultationForm = {
  diagnosis: "",
  treatment: "",
  observations: ""
};

function buildEntryDescription(form: ConsultationForm): string {
  const parts: string[] = [];
  if (form.diagnosis.trim()) parts.push(`Diagnóstico: ${form.diagnosis.trim()}`);
  if (form.treatment.trim()) parts.push(`Tratamento: ${form.treatment.trim()}`);
  if (form.observations.trim()) parts.push(`Observações: ${form.observations.trim()}`);
  return parts.join("\n\n");
}

export function AttendancePage() {
  const { triageId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [triage, setTriage] = useState<TriageEntry | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [form, setForm] = useState<ConsultationForm>(emptyConsultation);
  const [loading, setLoading] = useState(true);
  const [savingEntry, setSavingEntry] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const ensureRecord = useCallback(
    async (currentPatient: Patient): Promise<MedicalRecord> => {
      const existing = await api.listRecords(currentPatient.id);
      if (existing.length > 0) {
        return existing[0];
      }

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
        if (active) {
          setLoading(false);
        }
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
    if (updated) {
      setRecord(updated);
    }
  }, [record]);

  const handleSubmitConsultation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!record || !user) return;

    const description = buildEntryDescription(form);
    if (!description) {
      toast.error("Preencha pelo menos um campo da consulta antes de salvar.");
      return;
    }

    setSavingEntry(true);

    try {
      const entry: RecordEntry = {
        type: "CONSULTA",
        description,
        doctorId: String(user.id),
        doctorName: user.nome
      };

      await api.addRecordEntry(record.id, entry);
      await refreshRecord();
      setForm(emptyConsultation);
      toast.success("Consulta registrada no prontuário.");
    } catch (submitError) {
      toast.error(normalizeError(submitError));
    } finally {
      setSavingEntry(false);
    }
  };

  const handleFinish = async (status: TriageEntry["status"], successMessage: string) => {
    if (!triage) return;
    setFinishing(true);

    try {
      await api.updateTriageStatus(triage.id, status);
      toast.success(successMessage);
      navigate("/app");
    } catch (finishError) {
      toast.error(normalizeError(finishError));
    } finally {
      setFinishing(false);
    }
  };

  const consultationEntries = useMemo(
    () => record?.entries.slice().reverse() ?? [],
    [record]
  );

  if (loading) {
    return (
      <div className="page-stack">
        <article className="panel">
          <div className="empty-state">Preparando atendimento...</div>
        </article>
      </div>
    );
  }

  if (!triage || !patient || !record) {
    return null;
  }

  const hasConsultationFilled =
    form.diagnosis.trim() || form.treatment.trim() || form.observations.trim();

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="ATENDIMENTO MÉDICO"
        title={`Atender ${patient.nome}`}
        description="Revise o contexto clínico, registre a evolução e finalize o atendimento."
        actions={
          <button type="button" className="button ghost" onClick={() => navigate("/app")}>
            Voltar ao painel
          </button>
        }
      />

      <section className="content-grid two-columns">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">CONTEXTO DA TRIAGEM</p>
              <h2>Resumo clínico</h2>
            </div>
            <span className={`pill risk ${triage.riskClassification.toLowerCase()}`}>
              {riskLabel(triage.riskClassification)}
            </span>
          </div>

          <div className="info-list">
            <div className="info-row">
              <strong>SLA Manchester</strong>
              <span>{riskSla(triage.riskClassification)}</span>
            </div>
            <div className="info-row">
              <strong>Status atual</strong>
              <span>{statusLabel(triage.status)}</span>
            </div>
            <div className="info-row">
              <strong>Queixa principal</strong>
              <span>{triage.chiefComplaint || "Não informada"}</span>
            </div>
            <div className="info-row">
              <strong>Sinais vitais</strong>
              <span>{triage.vitalSigns || "Não informados"}</span>
            </div>
            <div className="info-row">
              <strong>Observações da triagem</strong>
              <span>{triage.observations || "Sem observações."}</span>
            </div>
            <div className="info-row">
              <strong>Triado por</strong>
              <span>
                {triage.nurseName} • {formatDateTime(triage.triageDate)}
              </span>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">DADOS DO PACIENTE</p>
              <h2>{patient.nome}</h2>
            </div>
          </div>

          <div className="info-list">
            <div className="info-row">
              <strong>CPF</strong>
              <span>{patient.cpf}</span>
            </div>
            <div className="info-row">
              <strong>Telefone</strong>
              <span>{patient.telefone || "Não informado"}</span>
            </div>
            <div className="info-row">
              <strong>Tipo sanguíneo</strong>
              <span>{patient.tipoSanguineo || "Não informado"}</span>
            </div>
            <div className="info-row">
              <strong>Alergias</strong>
              <span>
                {patient.alergias.length
                  ? patient.alergias
                      .map((allergy) => `${allergy.nomeAlergia} (${allergy.severidade})`)
                      .join(", ")
                  : "Nenhuma registrada"}
              </span>
            </div>
            <div className="info-row">
              <strong>Vacinas</strong>
              <span>
                {patient.vacinas.length
                  ? patient.vacinas.map((vaccine) => vaccine.nomeVacina).join(", ")
                  : "Nenhuma registrada"}
              </span>
            </div>
          </div>
        </article>
      </section>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">REGISTRAR CONSULTA</p>
            <h2>Evolução clínica</h2>
          </div>
        </div>

        <form className="form-grid wide-grid" onSubmit={handleSubmitConsultation}>
          <label className="field field-span-2">
            <span>Diagnóstico</span>
            <textarea
              value={form.diagnosis}
              onChange={(event) => setForm((current) => ({ ...current, diagnosis: event.target.value }))}
              rows={3}
              placeholder="Hipóteses diagnósticas e impressão clínica"
            />
          </label>

          <label className="field field-span-2">
            <span>Tratamento / conduta</span>
            <textarea
              value={form.treatment}
              onChange={(event) => setForm((current) => ({ ...current, treatment: event.target.value }))}
              rows={3}
              placeholder="Prescrição, exames solicitados, encaminhamentos"
            />
          </label>

          <label className="field field-span-2">
            <span>Observações adicionais</span>
            <textarea
              value={form.observations}
              onChange={(event) => setForm((current) => ({ ...current, observations: event.target.value }))}
              rows={3}
              placeholder="Notas complementares para a continuidade do cuidado"
            />
          </label>

          <div className="form-actions field-span-2">
            <button type="submit" className="button" disabled={savingEntry || !hasConsultationFilled}>
              {savingEntry ? "Salvando..." : "Salvar consulta"}
            </button>
          </div>
        </form>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">HISTÓRICO DO PRONTUÁRIO</p>
            <h2>Últimas evoluções</h2>
          </div>
        </div>

        {consultationEntries.length ? (
          <div className="timeline">
            {consultationEntries.map((entry, index) => (
              <div key={`${record.id}-${index}`} className="timeline-item">
                <strong>{entry.type}</strong>
                <p style={{ whiteSpace: "pre-wrap" }}>{entry.description}</p>
                <small>
                  {entry.doctorName || "Profissional não informado"} •{" "}
                  {formatDateTime(entry.entryDate)}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">Nenhuma evolução registrada ainda neste prontuário.</div>
        )}
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">FINALIZAR ATENDIMENTO</p>
            <h2>Definir desfecho</h2>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button"
            disabled={finishing}
            onClick={() => void handleFinish("ATENDIDO", "Atendimento finalizado.")}
          >
            {finishing ? "Atualizando..." : "Concluir atendimento"}
          </button>
          <button
            type="button"
            className="button ghost"
            disabled={finishing}
            onClick={() => void handleFinish("TRANSFERIDO", "Paciente transferido.")}
          >
            Transferir
          </button>
          <button
            type="button"
            className="button ghost"
            disabled={finishing}
            onClick={() =>
              void handleFinish("ALTA_ADMINISTRATIVA", "Alta administrativa registrada.")
            }
          >
            Alta administrativa
          </button>
        </div>
      </article>
    </div>
  );
}
