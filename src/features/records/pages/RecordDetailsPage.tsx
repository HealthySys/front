import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { api } from "../../../services/api";
import type { MedicalRecord } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import { RecordDetails } from "../components/RecordDetails";
import dashboard from "../../../pages/dashboards/Dashboard.module.css";

export function RecordDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecord = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.listRecords();
        const selected = response.find((item) => item.id === id) || null;
        if (!selected) {
          setError("Prontuário não encontrado.");
          return;
        }
        setRecord(selected);
      } catch (loadError) {
        setError(normalizeError(loadError));
      } finally {
        setLoading(false);
      }
    };
    void loadRecord();
  }, [id]);

  return (
    <div className={dashboard.stack}>
      <PageHeader
        eyebrow="Registro clínico"
        title={record ? `Prontuário de ${record.patientName}` : "Prontuário"}
        description="Histórico consolidado de evoluções e informações clínicas do paciente."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/app/prontuarios")}>
              <ArrowLeft size={14} />
              Voltar
            </Button>
            {record ? (
              <Button onClick={() => navigate(`/app/prontuarios/${record.id}/editar`)}>
                <Pencil size={14} />
                Editar
              </Button>
            ) : null}
          </>
        }
      />
      {error ? <Alert variant="error">{error}</Alert> : null}
      {loading ? (
        <div className={dashboard.loader}>Carregando prontuário…</div>
      ) : (
        <RecordDetails record={record} />
      )}
    </div>
  );
}
