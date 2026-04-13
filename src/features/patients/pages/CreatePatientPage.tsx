import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { PatientPayload } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import { PatientForm } from "../components/PatientForm";

const initialForm: PatientPayload = {
  nome: "",
  dataNascimento: "",
  cpf: "",
  email: "",
  telefone: "",
  sexo: "FEMININO",
  endereco: "",
  tipoSanguineo: "O+",
  alergias: [],
  vacinas: [],
  ativo: true
};

export function CreatePatientPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PatientPayload>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      await api.createPatient(form);
      setFeedback("Paciente cadastrado com sucesso.");
      setTimeout(() => navigate("/app/pacientes"), 800);
    } catch (submitError) {
      setError(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="CADASTRO CLÍNICO"
        title="Cadastrar paciente"
        description="Crie um novo cadastro com informações administrativas e clínicas iniciais."
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <article className="panel">
        <PatientForm
          form={form}
          setForm={setForm}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/app/pacientes")}
        />
      </article>
    </div>
  );
}