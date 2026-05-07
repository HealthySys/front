import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useToast } from "../../../components/feedback/ToastProvider";
import { api } from "../../../services/api";
import type { PatientPayload } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import { PatientForm } from "../components/PatientForm";
import dashboard from "../../../pages/dashboards/Dashboard.module.css";

const initialForm: PatientPayload = {
  nome: "",
  dataNascimento: "",
  cpf: "",
  email: "",
  telefone: "",
  sexo: "FEMININO",
  endereco: "",
  tipoSanguineo: "",
  alergias: [],
  vacinas: [],
  ativo: true
};

export function CreatePatientPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState<PatientPayload>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const created = await api.createPatient(form);
      const autoForward = user?.role === "RECEPCIONISTA";

      if (autoForward) {
        try {
          await api.forwardPatientToTriage(created.id);
          toast.success(`${created.nome} cadastrado(a) e encaminhado(a) para triagem.`);
        } catch (forwardError) {
          toast.success("Paciente cadastrado.");
          toast.error(`Falha ao encaminhar para triagem: ${normalizeError(forwardError)}`);
        }
      } else {
        toast.success("Paciente cadastrado com sucesso.");
      }

      navigate("/app/pacientes");
    } catch (submitError) {
      toast.error(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={dashboard.stack}>
      <PageHeader
        eyebrow="Cadastro administrativo"
        title="Cadastrar paciente"
        description="Crie o cadastro inicial do paciente. As informações clínicas são preenchidas depois, na triagem."
      />
      <PatientForm
        form={form}
        setForm={setForm}
        submitting={submitting}
        showClinicalSection={false}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/app/pacientes")}
      />
    </div>
  );
}
