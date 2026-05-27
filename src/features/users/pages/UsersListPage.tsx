import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Shield, UserCheck, UserCog, Users } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatCard } from "../../../components/ui/StatCard";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Colors } from "../../../design/tokens";
import { api } from "../../../services/api";
import type { User } from "../../../types";
import { formatDateTime, normalizeError, roleLabel } from "../../../utils/formatters";
import dashboard from "../../../pages/dashboards/Dashboard.module.css";
import table from "../../../components/ui/DataTable.module.css";

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

  const totalActive = users.filter((u) => u.active).length;
  const admins = users.filter((u) => u.role === "ADMIN").length;
  const assistance = users.filter((u) => u.role === "MEDICO" || u.role === "ENFERMEIRO").length;

  return (
    <div className={dashboard.stack}>
      <PageHeader
        eyebrow="Administração"
        title="Gestão de usuários"
        description="Cadastros, perfis de acesso e status de cada operador da plataforma."
        actions={
          <>
            <Button variant="secondary" onClick={() => void loadUsers()}>
              <RefreshCw size={14} />
              Atualizar
            </Button>
            <Button onClick={() => navigate("/app/usuarios/novo")}>
              <Plus size={14} />
              Novo usuário
            </Button>
          </>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <section className={dashboard.statsGrid}>
        <StatCard
          label="Total"
          value={users.length}
          subtitle="Usuários cadastrados"
          color={Colors.accent}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Ativos"
          value={totalActive}
          subtitle="Acesso liberado"
          color={Colors.success}
          icon={<UserCheck size={18} />}
        />
        <StatCard
          label="Administradores"
          value={admins}
          subtitle="Perfil ADMIN"
          color={Colors.danger}
          icon={<Shield size={18} />}
        />
        <StatCard
          label="Equipe assistencial"
          value={assistance}
          subtitle="Médicos e enfermeiros"
          color={Colors.warning}
          icon={<UserCog size={18} />}
        />
      </section>

      <div className={table.wrapper}>
        <div className={table.scroll}>
          <table className={table.table}>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>E-mail</th>
                <th>Status</th>
                <th>Atualização</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={table.empty}>
                    Carregando usuários…
                  </td>
                </tr>
              ) : users.length ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className={table.cellTwoLines}>
                        <strong>{user.username}</strong>
                        <small>{user.nome}</small>
                      </div>
                    </td>
                    <td>{roleLabel(user.role)}</td>
                    <td>{user.email}</td>
                    <td>
                      <StatusBadge active={user.active} />
                    </td>
                    <td>{formatDateTime(user.updatedAt || user.createdAt)}</td>
                    <td>
                      <div className={table.actions} style={{ justifyContent: "flex-end" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/app/usuarios/${user.id}/editar`)}
                        >
                          Editar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={table.empty}>
                    Nenhum usuário cadastrado até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={table.footer}>{users.length} usuário(s)</div>
      </div>
    </div>
  );
}
