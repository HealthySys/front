import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Alert } from "../../../components/ui/Alert";
import { RecordForm } from "../components/RecordForm";
import { api } from "../../../services/api";
import type { MedicalRecordPayload, Patient } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import dashboard from "../../../pages/dashboards/Dashboard.module.css";

const initialRecordForm: MedicalRecordPayload = {
  patientId: 0,
  patientName: "",
  diagnosis: "",
  treatment: "",
  observations: "",
  responsibleDoctorId: "",
  responsibleDoctorName: ""
};

export function CreateRecordPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<MedicalRecordPayload>(initialRecordForm);
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

  const selectedPatient = patients.find((patient) => patient.id === form.patientId);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");
    try {
      const payload: MedicalRecordPayload = {
        ...form,
        patientName: selectedPatient?.nome || form.patientName
      };
      await api.createRecord(payload);
      setFeedback("Prontuário criado com sucesso.");
      setTimeout(() => navigate("/app/prontuarios"), 800);
    } catch (submitError) {
      setError(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={dashboard.loader}>Carregando pacientes…</div>;
  }

  return (
    <div className={dashboard.stack}>
      <PageHeader
        eyebrow="Registro clínico"
        title="Criar prontuário"
        description="Cadastre um novo prontuário eletrônico para o paciente selecionado."
      />
      {feedback ? <Alert variant="success">{feedback}</Alert> : null}
      {error ? <Alert variant="error">{error}</Alert> : null}
      <RecordForm
        form={form}
        setForm={setForm}
        patients={patients}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/app/prontuarios")}
      />
    </div>
  );
}
