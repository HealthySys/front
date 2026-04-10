import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { RecordForm } from "../components/RecordForm";
import { api } from "../../../services/api";
import type { MedicalRecord, MedicalRecordPayload, Patient } from "../../../types";
import { normalizeError } from "../../../utils/formatters";

const initialRecordForm: MedicalRecordPayload = {
  patientId: 0,
  patientName: "",
  diagnosis: "",
  treatment: "",
  observations: "",
  responsibleDoctorId: "",
  responsibleDoctorName: ""
};

export function EditRecordPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<MedicalRecordPayload>(initialRecordForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      setError("");

      try {
        const [patientsResponse, recordsResponse] = await Promise.all([
          api.listPatients(true),
          api.listRecords()
        ]);

        setPatients(patientsResponse);

        const record = recordsResponse.find((item: MedicalRecord) => item.id === id);

        if (!record) {
          setError("Prontuário não encontrado.");
          return;
        }

        setForm({
          patientId: record.patientId,
          patientName: record.patientName,
          diagnosis: record.diagnosis,
          treatment: record.treatment,
          observations: record.observations,
          responsibleDoctorId: record.responsibleDoctorId,
          responsibleDoctorName: record.responsibleDoctorName
        });
      } catch (loadError) {
        setError(normalizeError(loadError));
      } finally {
        setLoading(false);
      }
    };

    void loadPage();
  }, [id]);

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

      await api.updateRecord(String(id), payload);
      setFeedback("Prontuário atualizado com sucesso.");
      setTimeout(() => navigate("/app/prontuarios"), 800);
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
          <div className="empty-state">Carregando prontuário...</div>
        </article>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="REGISTRO CLÍNICO"
        title="Editar prontuário"
        description="Atualize os dados clínicos e administrativos do prontuário."
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <article className="panel">
        <RecordForm
          form={form}
          setForm={setForm}
          patients={patients}
          submitting={submitting}
          isEditing
          onSubmit={handleSubmit}
          onCancel={() => navigate("/app/prontuarios")}
        />
      </article>
    </div>
  );
}