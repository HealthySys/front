import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { useToast } from "../../../components/feedback/ToastProvider";
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
  const toast = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState<TriageFormState>(initialTriageForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);

      try {
        const response = await api.listPatients(true);
        setPatients(response);
      } catch (loadError) {
        toast.error(normalizeError(loadError));
      } finally {
        setLoading(false);
      }
    };

    void loadPatients();
  }, [toast]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const selectedPatient = patients.find((patient) => patient.id === Number(form.patientId));
      const cleanedAllergies = form.alergiasReportadas.filter(
        (allergy) => allergy.nomeAlergia.trim().length > 0
      );
      const cleanedVaccines = form.vacinasReportadas.filter(
        (vaccine) => vaccine.nomeVacina.trim().length > 0
      );
      const payload: TriagePayload = {
        patientId: Number(form.patientId),
        patientName: selectedPatient?.nome || "",
        riskClassification: form.riskClassification,
        chiefComplaint: form.chiefComplaint,
        vitalSigns: form.vitalSigns,
        observations: form.observations,
        alergiasReportadas: cleanedAllergies,
        vacinasReportadas: cleanedVaccines
      };

      await api.createTriage(payload);
      toast.success("Triagem feita com sucesso!");
      navigate("/app/triagem");
    } catch (submitError) {
      toast.error(normalizeError(submitError));
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
