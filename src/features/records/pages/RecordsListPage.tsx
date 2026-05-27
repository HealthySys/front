import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, FileText, Plus, RefreshCw, Search } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatCard } from "../../../components/ui/StatCard";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { Colors } from "../../../design/tokens";
import { api } from "../../../services/api";
import type { MedicalRecord } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import { RecordAccordion } from "../components/RecordAccordion";
import dashboard from "../../../pages/dashboards/Dashboard.module.css";
import toolbar from "../../../components/ui/Toolbar.module.css";

function isToday(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function RecordsListPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadRecords = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.listRecords();
      setRecords(response);
    } catch (loadError) {
      setError(normalizeError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return records;
    return records.filter(
      (record) =>
        record.patientName.toLowerCase().includes(term) ||
        (record.diagnosis ?? "").toLowerCase().includes(term) ||
        (record.responsibleDoctorName ?? "").toLowerCase().includes(term)
    );
  }, [records, searchTerm]);

  const hasFinalizedEntry = (r: MedicalRecord) =>
    Boolean(r.diagnosis?.trim()) || (r.entries ?? []).some((entry) => entry.type === "CONSULTA");
  const totalFinalizados = records.filter(hasFinalizedEntry).length;
  const totalEmAndamento = records.length - totalFinalizados;
  const finalizadosHoje = records.filter(
    (r) => hasFinalizedEntry(r) && isToday(r.updatedAt || r.createdAt)
  ).length;

  return (
    <div className={dashboard.stack}>
      <PageHeader
        eyebrow="Registro clínico"
        title="Prontuários eletrônicos"
        description="Histórico clínico distribuído de cada paciente, incluindo evoluções da triagem e atendimento."
        actions={
          <>
            <Button variant="secondary" onClick={() => void loadRecords()}>
              <RefreshCw size={14} />
              Atualizar
            </Button>
            <Button onClick={() => navigate("/app/prontuarios/novo")}>
              <Plus size={14} />
              Novo prontuário
            </Button>
          </>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <section className={dashboard.statsGrid3}>
        <StatCard
          label="Total de registros"
          value={records.length}
          subtitle="Prontuários cadastrados"
          color={Colors.accent}
          icon={<FileText size={18} />}
        />
        <StatCard
          label="Em andamento"
          value={totalEmAndamento}
          subtitle="Sem diagnóstico fechado"
          color={Colors.warning}
          icon={<Clock size={18} />}
        />
        <StatCard
          label="Finalizados hoje"
          value={finalizadosHoje}
          subtitle="Concluídos nas últimas 24h"
          color={Colors.success}
          icon={<CheckCircle2 size={18} />}
        />
      </section>

      <div className={toolbar.toolbar}>
        <div className={toolbar.search}>
          <Search size={16} className={toolbar.searchIcon} />
          <input
            className={toolbar.searchInput}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por paciente, diagnóstico ou responsável…"
          />
        </div>
      </div>

      {loading ? (
        <div className={dashboard.empty}>Carregando prontuários…</div>
      ) : filteredRecords.length ? (
        <RecordAccordion
          records={filteredRecords}
          onView={(record) => navigate(`/app/prontuarios/${record.id}`)}
          onEdit={(record) => navigate(`/app/prontuarios/${record.id}/editar`)}
        />
      ) : (
        <div className={dashboard.empty}>Nenhum prontuário encontrado com os filtros atuais.</div>
      )}
    </div>
  );
}
