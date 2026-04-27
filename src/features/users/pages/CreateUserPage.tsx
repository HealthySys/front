import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { CreateUserPayload, User } from "../../../types";
import { normalizeError, roleLabel, roleOptions } from "../../../utils/formatters";
import { UserForm, type UserFormState } from "../components/UserForm";

const initialForm: UserFormState = {
  username: "",
  nome: "",
  email: "",
  password: "",
  role: "RECEPCIONISTA",
  active: true,
  assinaturaDigital: ""
};

export function CreateUserPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      const payload: CreateUserPayload = {
        username: form.username,
        nome: form.nome,
        email: form.email,
        password: form.password,
        role: form.role,
        assinaturaDigital: form.assinaturaDigital || undefined
      };

      const created = await api.createUser(payload);

      if (!form.active) {
        await api.updateUserStatus(created.id, false);
      }

      setFeedback("Usuário cadastrado com sucesso.");
      setTimeout(() => navigate("/app/usuarios"), 800);
    } catch (submitError) {
      setError(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="ADMINISTRAÇÃO"
        title="Adicionar usuário"
        description="Cadastre um novo perfil de acesso no sistema."
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <article className="panel">
        <UserForm
          form={form}
          setForm={setForm}
          submitting={submitting}
          onSubmit={handleSubmit}
          roleOptions={roleOptions as User["role"][]}
          roleLabel={roleLabel}
          onCancel={() => navigate("/app/usuarios")}
        />
      </article>
    </div>
  );
}
