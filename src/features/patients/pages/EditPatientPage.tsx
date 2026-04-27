import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { Patient, PatientPayload } from "../../../types";
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
  tipoSanguineo: "",
  alergias: [],
  vacinas: [],
  ativo: true
};

export function EditPatientPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState<PatientPayload>(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatient = async () => {
      setLoading(true);
      setError("");

      try {
        const patients = await api.listPatients(undefined);
        const patient = patients.find((item: Patient) => item.id === Number(id));

        if (!patient) {
          setError("Paciente não encontrado.");
          return;
        }

        setForm({
          nome: patient.nome,
          dataNascimento: patient.dataNascimento,
          cpf: patient.cpf,
          email: patient.email,
          telefone: patient.telefone,
          sexo: patient.sexo,
          endereco: patient.endereco,
          tipoSanguineo: patient.tipoSanguineo,
          alergias: patient.alergias || [],
          vacinas: patient.vacinas || [],
          ativo: patient.ativo
        });
      } catch (loadError) {
        setError(normalizeError(loadError));
      } finally {
        setLoading(false);
      }
    };

    void loadPatient();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      await api.updatePatient(Number(id), form);
      setFeedback("Paciente atualizado com sucesso.");
      setTimeout(() => navigate("/app/pacientes"), 800);
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
          <div className="empty-state">Carregando paciente...</div>
        </article>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="CADASTRO CLÍNICO"
        title="Editar paciente"
        description="Atualize as informações cadastrais e clínicas do paciente."
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <article className="panel">
        <PatientForm
          form={form}
          setForm={setForm}
          submitting={submitting}
          isEditing
          onSubmit={handleSubmit}
          onCancel={() => navigate("/app/pacientes")}
        />
      </article>
    </div>
  );
}
