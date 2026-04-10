import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { api } from "../services/api";
import type { CreateUserPayload, UpdateUserPayload, User } from "../types";
import { formatDateTime, normalizeError, roleLabel, roleOptions } from "../utils/formatters";

type UserFormState = {
  username: string;
  email: string;
  password: string;
  role: User["role"];
  active: boolean;
};

const initialForm: UserFormState = {
  username: "",
  email: "",
  password: "",
  role: "RECEPCIONISTA",
  active: true
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.listUsers();
      setUsers(response);
    } catch (loadError) {
      setError(normalizeError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingUserId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      if (editingUserId) {
        const payload: UpdateUserPayload = {
          username: form.username,
          email: form.email,
          role: form.role,
          active: form.active,
          ...(form.password ? { password: form.password } : {})
        };

        await api.updateUser(editingUserId, payload);
        setFeedback("Usuário atualizado com sucesso.");
      } else {
        const payload: CreateUserPayload = {
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role
        };

        const created = await api.createUser(payload);

        if (!form.active) {
          await api.updateUserStatus(created.id, false);
        }

        setFeedback("Usuário cadastrado com sucesso.");
      }

      resetForm();
      await loadUsers();
    } catch (submitError) {
      setError(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setForm({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      active: user.active
    });
    setFeedback("");
    setError("");
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await api.updateUserStatus(user.id, !user.active);
      await loadUsers();
    } catch (statusError) {
      setError(normalizeError(statusError));
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Deseja remover o usuário ${user.username}?`)) {
      return;
    }

    try {
      await api.deleteUser(user.id);
      await loadUsers();
    } catch (deleteError) {
      setError(normalizeError(deleteError));
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="ADMINISTRAÇÃO"
        title="Gestão de usuários"
        description="Cadastre perfis, altere permissões, ative ou inative acessos e mantenha a base administrativa alinhada ao papel de cada profissional."
        actions={
          <button type="button" className="button secondary" onClick={() => void loadUsers()}>
            Atualizar lista
          </button>
        }
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <section className="content-grid two-columns">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">{editingUserId ? "EDIÇÃO" : "NOVO CADASTRO"}</p>
              <h2>{editingUserId ? "Atualizar usuário" : "Adicionar usuário"}</h2>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Usuário</span>
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="recepcao.centro"
                required
              />
            </label>

            <label className="field">
              <span>E-mail</span>
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                type="email"
                placeholder="equipe@hospital.com"
                required
              />
            </label>

            <label className="field">
              <span>{editingUserId ? "Nova senha (opcional)" : "Senha"}</span>
              <input
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                type="password"
                placeholder="Senha com 8+ caracteres, maiúsculas, números e símbolo"
                required={!editingUserId}
              />
            </label>

            <label className="field">
              <span>Perfil</span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({ ...current, role: event.target.value as User["role"] }))
                }
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
              </select>
            </label>

            <label className="switch-field">
              <input
                checked={form.active}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                type="checkbox"
              />
              <span>Usuário ativo</span>
            </label>

            <div className="form-actions">
              <button type="submit" className="button" disabled={submitting}>
                {submitting ? "Salvando..." : editingUserId ? "Salvar alterações" : "Cadastrar usuário"}
              </button>
              <button type="button" className="button ghost" onClick={resetForm}>
                Limpar formulário
              </button>
            </div>
          </form>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">VISÃO GERAL</p>
              <h2>Resumo administrativo</h2>
            </div>
          </div>
          <div className="info-list">
            <div className="info-row">
              <strong>Total de usuários</strong>
              <span>{users.length}</span>
            </div>
            <div className="info-row">
              <strong>Ativos</strong>
              <span>{users.filter((user) => user.active).length}</span>
            </div>
            <div className="info-row">
              <strong>Administradores</strong>
              <span>{users.filter((user) => user.role === "ADMIN").length}</span>
            </div>
            <div className="info-row">
              <strong>Equipe assistencial</strong>
              <span>{users.filter((user) => user.role === "MEDICO" || user.role === "ENFERMEIRO").length}</span>
            </div>
          </div>
        </article>
      </section>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">LISTA DE ACESSOS</p>
            <h2>Usuários cadastrados</h2>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>E-mail</th>
                <th>Status</th>
                <th>Atualização</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>Carregando usuários...</td>
                </tr>
              ) : users.length ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.username}</strong>
                    </td>
                    <td>{roleLabel(user.role)}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`pill ${user.active ? "success" : "neutral"}`}>
                        {user.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>{formatDateTime(user.updatedAt || user.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="button ghost small" onClick={() => startEditing(user)}>
                          Editar
                        </button>
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={() => void handleToggleStatus(user)}
                        >
                          {user.active ? "Inativar" : "Ativar"}
                        </button>
                        <button type="button" className="button ghost small" onClick={() => void handleDelete(user)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>Nenhum usuário cadastrado até o momento.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
