import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { UpdateUserPayload, User } from "../../../types";
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

export function EditUserPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError("");

      try {
        const users = await api.listUsers();
        const user = users.find((item) => item.id === Number(id));

        if (!user) {
          setError("Usuário não encontrado.");
          return;
        }

        setForm({
          username: user.username,
          nome: user.nome,
          email: user.email,
          password: "",
          role: user.role,
          active: user.active,
          assinaturaDigital: user.assinaturaDigital ?? ""
        });
      } catch (loadError) {
        setError(normalizeError(loadError));
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      const payload: UpdateUserPayload = {
        username: form.username,
        nome: form.nome,
        email: form.email,
        role: form.role,
        active: form.active,
        assinaturaDigital: form.assinaturaDigital || undefined,
        ...(form.password ? { password: form.password } : {})
      };

      await api.updateUser(Number(id), payload);
      setFeedback("Usuário atualizado com sucesso.");
      setTimeout(() => navigate("/app/usuarios"), 800);
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
          <div className="empty-state">Carregando usuário...</div>
        </article>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="ADMINISTRAÇÃO"
        title="Editar usuário"
        description="Atualize dados, perfil de acesso e status do usuário."
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <article className="panel">
        <UserForm
          form={form}
          setForm={setForm}
          submitting={submitting}
          isEditing
          onSubmit={handleSubmit}
          roleOptions={roleOptions as User["role"][]}
          roleLabel={roleLabel}
          onCancel={() => navigate("/app/usuarios")}
        />
      </article>
    </div>
  );
}
