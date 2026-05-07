import { useEffect, useState } from "react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Alert } from "../../../components/ui/Alert";
import { Card } from "../../../components/ui/Card";
import { InfoItem } from "../../../components/ui/InfoItem";
import { Avatar } from "../../../components/ui/Avatar";
import { useAuth } from "../../../auth/AuthProvider";
import { api } from "../../../services/api";
import type { MedicalRecord, Patient } from "../../../types";
import { formatDate, normalizeError, sexoLabel } from "../../../utils/formatters";
import { RecordDetails } from "../components/RecordDetails";
import dashboard from "../../../pages/dashboards/Dashboard.module.css";

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
        if (!active) return;
        setPatient(currentPatient);
        setRecords(currentRecords);
      } catch (loadError) {
        if (active) setError(normalizeError(loadError));
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadMyRecord();
    return () => {
      active = false;
    };
  }, []);

  const latestRecord = records[0] ?? null;

  return (
    <div className={dashboard.stack}>
      <PageHeader
        eyebrow="Portal do paciente"
        title="Meu prontuário"
        description={`Consulta em modo leitura para ${user?.nome ?? user?.username ?? "paciente"}.`}
      />
      {error ? <Alert variant="error">{error}</Alert> : null}

      {loading ? (
        <div className={dashboard.loader}>Carregando seus dados clínicos…</div>
      ) : patient ? (
        <>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <Avatar name={patient.nome} size={48} fontSize={18} />
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{patient.nome}</h3>
                <span style={{ fontSize: 12, color: "var(--hs-text-3)" }}>
                  {sexoLabel(patient.sexo)} · Nascimento {formatDate(patient.dataNascimento)}
                </span>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10
              }}
            >
              <InfoItem label="CPF" value={patient.cpf} />
              <InfoItem label="Telefone" value={patient.telefone} />
              <InfoItem label="E-mail" value={patient.email} />
              <InfoItem label="Tipo sanguíneo" value={patient.tipoSanguineo} />
            </div>
          </Card>

          <RecordDetails record={latestRecord} />
        </>
      ) : (
        <div className={dashboard.empty}>Nenhum cadastro de paciente vinculado à sua conta.</div>
      )}
    </div>
  );
}
