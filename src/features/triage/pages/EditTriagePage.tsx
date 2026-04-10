import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { Patient, TriagePayload } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import {
  initialTriageForm,
  TriageForm,
  type TriageFormState
} from "../components/TriageForm";

export function EditTriagePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<TriageFormState>(initialTriageForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      setError("");

      try {
        const [patientsResponse, entry] = await Promise.all([
          api.listPatients(),
          api.getTriage(Number(id))
        ]);

        setPatients(patientsResponse);
        setForm({
          patientId: String(entry.patientId),
          riskClassification: entry.riskClassification,
          chiefComplaint: entry.chiefComplaint,
          vitalSigns: entry.vitalSigns,
          observations: entry.observations,
          nurseId: entry.nurseId,
          nurseName: entry.nurseName,
          status: entry.status
        });
      } catch (loadError) {
        setError(normalizeError(loadError));
      } finally {
        setLoading(false);
      }
    };

    void loadPage();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      const selectedPatient = patients.find((patient) => patient.id === Number(form.patientId));
      const payload: TriagePayload = {
        patientId: Number(form.patientId),
        patientName: selectedPatient?.nome || "",
        riskClassification: form.riskClassification,
        chiefComplaint: form.chiefComplaint,
        vitalSigns: form.vitalSigns,
        observations: form.observations,
        nurseId: form.nurseId,
        nurseName: form.nurseName,
        status: form.status
      };

      await api.updateTriage(Number(id), payload);
      setFeedback("Triagem atualizada com sucesso.");
      setTimeout(() => navigate("/app/triagem"), 800);
    } catch (submitError) {
      setError(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-stack">
        <article className="panel">
          <div className="empty-state">Carregando dados da triagem...</div>
        </article>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="TRIAGEM E PRIORIZAÇÃO"
        title="Editar triagem"
        description="Ajuste a classificação, o status e os dados clínicos para manter o fluxo assistencial atualizado."
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <article className="panel">
        <TriageForm
          patients={patients}
          form={form}
          setForm={setForm}
          submitting={submitting}
          isEditing
          onSubmit={handleSubmit}
          onCancel={() => navigate("/app/triagem")}
        />
      </article>
    </div>
  );
}
