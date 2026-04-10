import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { Patient, TriagePayload } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import {
  initialTriageForm,
  TriageForm,
  type TriageFormState
} from "../components/TriageForm";

export function CreateTriagePage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<TriageFormState>(initialTriageForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.listPatients(true);
        setPatients(response);
      } catch (loadError) {
        setError(normalizeError(loadError));
      } finally {
        setLoading(false);
      }
    };

    void loadPatients();
  }, []);

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

      await api.createTriage(payload);
      setFeedback("Triagem registrada com sucesso.");
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
          <div className="empty-state">Carregando pacientes para triagem...</div>
        </article>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="TRIAGEM E PRIORIZAÇÃO"
        title="Registrar triagem"
        description="Cadastre uma nova classificação de risco e encaminhe o paciente para o fluxo adequado."
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {patients.length ? (
        <article className="panel">
          <TriageForm
            patients={patients}
            form={form}
            setForm={setForm}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/app/triagem")}
          />
        </article>
      ) : (
        <article className="panel">
          <div className="empty-state">
            Nenhum paciente ativo foi encontrado para iniciar uma triagem agora.
          </div>
        </article>
      )}
    </div>
  );
}
