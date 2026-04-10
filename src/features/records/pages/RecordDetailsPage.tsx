import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { MedicalRecord } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import { RecordDetails } from "../components/RecordDetails";

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
    <div className="page-stack">
      <PageHeader
        eyebrow="REGISTRO CLÍNICO"
        title="Detalhes do prontuário"
        description="Visualize o histórico consolidado de evoluções e informações clínicas do paciente."
        actions={
          <div className="page-actions">
            <button type="button" className="button ghost" onClick={() => navigate("/app/prontuarios")}>
              Voltar
            </button>
            {record ? (
              <button
                type="button"
                className="button"
                onClick={() => navigate(`/app/prontuarios/${record.id}/editar`)}
              >
                Editar prontuário
              </button>
            ) : null}
          </div>
        }
      />

      {error ? <div className="alert error">{error}</div> : null}

      <article className="panel">
        {loading ? (
          <div className="empty-state">Carregando prontuário...</div>
        ) : (
          <RecordDetails record={record} />
        )}
      </article>
    </div>
  );
}
