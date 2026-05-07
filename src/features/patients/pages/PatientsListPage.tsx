import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, Search, Send, UserCheck, Users, UserX } from "lucide-react";
import { useAuth } from "../../../auth/AuthProvider";
import { canWrite } from "../../../config/permissions";
import { useToast } from "../../../components/feedback/ToastProvider";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatCard } from "../../../components/ui/StatCard";
import { Button } from "../../../components/ui/Button";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Alert } from "../../../components/ui/Alert";
import { Colors } from "../../../design/tokens";
import { api } from "../../../services/api";
import type { Patient } from "../../../types";
import { formatDate, normalizeError, sexoLabel } from "../../../utils/formatters";
import dashboard from "../../../pages/dashboards/Dashboard.module.css";
import table from "../../../components/ui/DataTable.module.css";
import toolbar from "../../../components/ui/Toolbar.module.css";

type StatusFilter = "todos" | "ativos" | "inativos";

export function PatientsListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const canManage = canWrite(user?.role, "pacientes");
  const canForward = user?.role === "RECEPCIONISTA" || user?.role === "ADMIN";
  const [patients, setPatients] = useState<Patient[]>([]);
  const [forwardingId, setForwardingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ativos");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm.trim());
  const [cpfFilter, setCpfFilter] = useState("");
  const deferredCpf = useDeferredValue(cpfFilter.replace(/\D/g, ""));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const visiblePatients = deferredCpf
    ? patients.filter((patient) => (patient.cpf ?? "").replace(/\D/g, "").includes(deferredCpf))
    : patients;

  const loadPatients = async () => {
    setLoading(true);
    setError("");

    try {
      const activeFilter = statusFilter === "todos" ? undefined : statusFilter === "ativos";

      const response =
        deferredSearch.length >= 2
          ? await api.searchPatients(deferredSearch)
          : await api.listPatients(activeFilter);

      const filtered =
        statusFilter === "todos"
          ? response
          : response.filter((patient) => patient.ativo === (statusFilter === "ativos"));

      setPatients(filtered);
    } catch (loadError) {
      setError(normalizeError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPatients();
  }, [deferredSearch, statusFilter]);

  const handleDelete = async (patient: Patient) => {
    if (!window.confirm(`Deseja excluir o cadastro de ${patient.nome}?`)) {
      return;
    }
    try {
      await api.deletePatient(patient.id);
      await loadPatients();
    } catch (deleteError) {
      setError(normalizeError(deleteError));
    }
  };

  const handleForward = async (patient: Patient) => {
    setForwardingId(patient.id);
    try {
      await api.forwardPatientToTriage(patient.id);
      toast.success(`${patient.nome} encaminhado(a) para triagem.`);
    } catch (forwardError) {
      toast.error(normalizeError(forwardError));
    } finally {
      setForwardingId(null);
    }
  };

  const totalAtivos = visiblePatients.filter((p) => p.ativo).length;
  const totalInativos = visiblePatients.length - totalAtivos;

  return (
    <div className={dashboard.stack}>
      <PageHeader
        eyebrow="Cadastro clínico"
        title="Gestão de pacientes"
        description="Cadastre, atualize e mantenha a base de pacientes em dia."
        actions={
          <>
            <Button variant="secondary" size="md" onClick={() => void loadPatients()}>
              <RefreshCw size={14} />
              Atualizar
            </Button>
            {canManage ? (
              <Button onClick={() => navigate("/app/pacientes/novo")}>
                <Plus size={14} />
                Novo paciente
              </Button>
            ) : null}
          </>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <section className={dashboard.statsGrid3}>
        <StatCard
          label="Total exibido"
          value={visiblePatients.length}
          subtitle="Conforme filtro atual"
          color={Colors.accent}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Ativos"
          value={totalAtivos}
          subtitle="Habilitados para atendimento"
          color={Colors.success}
          icon={<UserCheck size={18} />}
        />
        <StatCard
          label="Inativos"
          value={totalInativos}
          subtitle="Cadastros desabilitados"
          color={Colors.text3}
          icon={<UserX size={18} />}
        />
      </section>

      <div className={toolbar.toolbar}>
        <div className={toolbar.search}>
          <Search size={16} className={toolbar.searchIcon} />
          <input
            className={toolbar.searchInput}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome (mín. 2 caracteres)..."
          />
        </div>
        <div className={toolbar.search}>
          <Search size={16} className={toolbar.searchIcon} />
          <input
            className={toolbar.searchInput}
            value={cpfFilter}
            onChange={(event) => setCpfFilter(event.target.value)}
            placeholder="Filtrar por CPF…"
            inputMode="numeric"
          />
        </div>
        <select
          className={toolbar.select}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
        >
          <option value="ativos">Somente ativos</option>
          <option value="inativos">Somente inativos</option>
          <option value="todos">Todos</option>
        </select>
        <div className={toolbar.spacer} />
      </div>

      <div className={table.wrapper}>
        <div className={table.scroll}>
          <table className={table.table}>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>CPF</th>
                <th>Sexo</th>
                <th>Nascimento</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={table.empty}>
                    Carregando pacientes…
                  </td>
                </tr>
              ) : visiblePatients.length ? (
                visiblePatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <div className={table.cellTwoLines}>
                        <strong>{patient.nome}</strong>
                        <small>{patient.email || patient.telefone || "Sem contato informado"}</small>
                      </div>
                    </td>
                    <td>{patient.cpf}</td>
                    <td>{sexoLabel(patient.sexo)}</td>
                    <td>{formatDate(patient.dataNascimento)}</td>
                    <td>
                      <StatusBadge active={patient.ativo} />
                    </td>
                    <td>
                      <div className={table.actions} style={{ justifyContent: "flex-end" }}>
                        {canForward && patient.ativo ? (
                          <Button
                            size="sm"
                            disabled={forwardingId === patient.id}
                            onClick={() => void handleForward(patient)}
                          >
                            <Send size={14} />
                            {forwardingId === patient.id ? "Encaminhando…" : "Encaminhar para triagem"}
                          </Button>
                        ) : null}
                        {canManage ? (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate(`/app/pacientes/${patient.id}/editar`)}
                            >
                              Editar
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => void handleDelete(patient)}>
                              Excluir
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={table.empty}>
                    Nenhum paciente encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={table.footer}>{visiblePatients.length} paciente(s) exibido(s)</div>
      </div>
    </div>
  );
}
