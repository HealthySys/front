import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useToast } from "../../../components/feedback/ToastProvider";
import { api } from "../../../services/api";
import type { Patient, TriagePayload } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import { initialTriageForm, TriageForm, type TriageFormState } from "../components/TriageForm";
import dashboard from "../../../pages/dashboards/Dashboard.module.css";

export function CreateTriagePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");
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
        if (preselectedPatientId) {
          const exists = response.some((patient) => String(patient.id) === preselectedPatientId);
          if (exists) {
            setForm((current) => ({ ...current, patientId: preselectedPatientId }));
          } else {
            toast.error("Paciente encaminhado não está mais ativo.");
          }
        }
      } catch (loadError) {
        toast.error(normalizeError(loadError));
      } finally {
        setLoading(false);
      }
    };
    void loadPatients();
  }, [toast, preselectedPatientId]);

  useEffect(() => {
    if (!form.patientId) {
      setForm((current) => ({
        ...current,
        existingAllergies: [],
        existingVaccines: []
      }));
      return;
    }
    const id = Number(form.patientId);
    if (Number.isNaN(id)) return;

    let cancelled = false;
    void (async () => {
      try {
        const patient = await api.getPatient(id);
        if (cancelled) return;
        setForm((current) => ({
          ...current,
          existingAllergies: patient.alergias ?? [],
          existingVaccines: patient.vacinas ?? []
        }));
      } catch {
        if (cancelled) return;
        setForm((current) => ({
          ...current,
          existingAllergies: [],
          existingVaccines: []
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form.patientId]);

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
      toast.success("Triagem registrada com sucesso.");
      navigate("/app/triagem");
    } catch (submitError) {
      toast.error(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={dashboard.loader}>Carregando pacientes para triagem…</div>;
  }

  return (
    <div className={dashboard.stack}>
      <PageHeader
        eyebrow="Triagem"
        title="Registrar triagem"
        description="Cadastre uma nova classificação de risco e encaminhe o paciente para o fluxo adequado."
      />
      {patients.length ? (
        <TriageForm
          patients={patients}
          form={form}
          setForm={setForm}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/app/triagem")}
        />
      ) : (
        <div className={dashboard.empty}>
          Nenhum paciente ativo encontrado para iniciar uma triagem agora.
        </div>
      )}
    </div>
  );
}
