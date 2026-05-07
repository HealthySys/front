import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useToast } from "../../../components/feedback/ToastProvider";
import { api } from "../../../services/api";
import type { CreateUserPayload, User } from "../../../types";
import { normalizeError, roleLabel, roleOptions } from "../../../utils/formatters";
import { UserForm, type UserFormState } from "../components/UserForm";
import dashboard from "../../../pages/dashboards/Dashboard.module.css";

const initialForm: UserFormState = {
  username: "",
  nome: "",
  email: "",
  password: "",
  role: "RECEPCIONISTA",
  active: true
};

export function CreateUserPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload: CreateUserPayload = {
        username: form.username,
        nome: form.nome,
        email: form.email,
        password: form.password,
        role: form.role
      };
      await api.createUser(payload);
      toast.success("Usuário cadastrado com sucesso.");
      navigate("/app/usuarios");
    } catch (submitError) {
      toast.error(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={dashboard.stack}>
      <PageHeader
        eyebrow="Administração"
        title="Adicionar usuário"
        description="Cadastre um novo perfil de acesso no sistema."
      />
      <UserForm
        form={form}
        setForm={setForm}
        submitting={submitting}
        onSubmit={handleSubmit}
        roleOptions={roleOptions as User["role"][]}
        roleLabel={roleLabel}
        onCancel={() => navigate("/app/usuarios")}
      />
    </div>
  );
}
