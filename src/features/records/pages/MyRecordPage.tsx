import { useEffect, useState } from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { useAuth } from "../../../auth/AuthProvider";
import { api } from "../../../services/api";
import type { MedicalRecord, Patient } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import { RecordDetails } from "../components/RecordDetails";

export function MyRecordPage() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadMyRecord = async () => {
      setLoading(true);
      setError("");

      try {
        const currentPatient = await api.getCurrentPatient();
        const currentRecords = await api.getMyRecord(currentPatient.id);

        if (!active) {
          return;
        }

        setPatient(currentPatient);
        setRecords(currentRecords);
      } catch (loadError) {
        if (active) {
          setError(normalizeError(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadMyRecord();

    return () => {
      active = false;
    };
  }, []);

  const latestRecord = records[0] ?? null;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="PORTAL DO PACIENTE"
        title="Meu prontuário"
        description={`Consulta em modo leitura para ${user?.nome ?? user?.username ?? "paciente"}.`}
      />

      {error ? <div className="alert error">{error}</div> : null}

      <article className="panel">
        {loading ? (
          <div className="empty-state">Carregando seus dados clínicos...</div>
        ) : patient ? (
          <div className="detail-stack">
            <div className="info-list">
              <div className="info-row">
                <strong>Paciente</strong>
                <span>{patient.nome}</span>
              </div>
              <div className="info-row">
                <strong>CPF</strong>
                <span>{patient.cpf}</span>
              </div>
              <div className="info-row">
                <strong>E-mail</strong>
                <span>{patient.email || "Não informado"}</span>
              </div>
            </div>

            <RecordDetails record={latestRecord} />
          </div>
        ) : (
          <div className="empty-state">Nenhum cadastro de paciente vinculado à sua conta.</div>
        )}
      </article>
    </div>
  );
}
