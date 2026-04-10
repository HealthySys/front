import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { User } from "../../../types";
import { formatDateTime, normalizeError, roleLabel } from "../../../utils/formatters";

export function UsersListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
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
        description="Cadastre perfis, altere permissões, ative ou inative acessos e mantenha a base administrativa alinhada."
        actions={
          <div className="page-actions">
            <button type="button" className="button secondary" onClick={() => void loadUsers()}>
              Atualizar lista
            </button>
            <button type="button" className="button" onClick={() => navigate("/app/usuarios/novo")}>
              Novo usuário
            </button>
          </div>
        }
      />

      {error ? <div className="alert error">{error}</div> : null}

      <article>
        <div className="users-overview-grid">
          <div className="overview-card">
            <span className="overview-label">Total de usuários</span>
            <strong className="overview-value">{users.length}</strong>
          </div>

          <div className="overview-card">
            <span className="overview-label">Ativos</span>
            <strong className="overview-value">
              {users.filter((user) => user.active).length}
            </strong>
          </div>

          <div className="overview-card">
            <span className="overview-label">Administradores</span>
            <strong className="overview-value">
              {users.filter((user) => user.role === "ADMIN").length}
            </strong>
          </div>

          <div className="overview-card">
            <span className="overview-label">Equipe assistencial</span>
            <strong className="overview-value">
              {users.filter((user) => user.role === "MEDICO" || user.role === "ENFERMEIRO").length}
            </strong>
          </div>
        </div>
      </article>

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
                    <td><strong>{user.username}</strong></td>
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
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={() => navigate(`/app/usuarios/${user.id}/editar`)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={() => void handleToggleStatus(user)}
                        >
                          {user.active ? "Inativar" : "Ativar"}
                        </button>
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={() => void handleDelete(user)}
                        >
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