import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useToast } from "../../../components/feedback/ToastProvider";
import { api } from "../../../services/api";
import type { Patient, TriagePayload } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import { initialTriageForm, TriageForm, type TriageFormState } from "../components/TriageForm";
import dashboard from "../../../pages/dashboards/Dashboard.module.css";

export function EditTriagePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<TriageFormState>(initialTriageForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
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
          status: entry.status,
          alergiasReportadas: [],
          vacinasReportadas: [],
          existingAllergies: [],
          existingVaccines: []
        });
      } catch (loadError) {
        toast.error(normalizeError(loadError));
      } finally {
        setLoading(false);
      }
    };
    void loadPage();
  }, [id, toast]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const selectedPatient = patients.find((patient) => patient.id === Number(form.patientId));
      const payload: TriagePayload = {
        patientId: Number(form.patientId),
        patientName: selectedPatient?.nome || "",
        riskClassification: form.riskClassification,
        chiefComplaint: form.chiefComplaint,
        vitalSigns: form.vitalSigns,
        observations: form.observations,
        status: form.status
      };
      await api.updateTriage(Number(id), payload);
      toast.success("Triagem atualizada com sucesso.");
      navigate("/app/triagem");
    } catch (submitError) {
      toast.error(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={dashboard.loader}>Carregando dados da triagem…</div>;
  }

  return (
    <div className={dashboard.stack}>
      <PageHeader
        eyebrow="Triagem"
        title="Editar triagem"
        description="Ajuste a classificação, o status e os dados clínicos para manter o fluxo atualizado."
      />
      <TriageForm
        patients={patients}
        form={form}
        setForm={setForm}
        submitting={submitting}
        isEditing
        onSubmit={handleSubmit}
        onCancel={() => navigate("/app/triagem")}
      />
    </div>
  );
}
