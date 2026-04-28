import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/feedback/ToastProvider";
import { PageHeader } from "../../components/layout/PageHeader";
import { api } from "../../services/api";
import type { Patient, TriageEntry, User } from "../../types";
import {
  formatDateTime,
  normalizeError,
  riskLabel,
  statusLabel
} from "../../utils/formatters";

interface EnfermeiroDashboardProps {
  user: User;
}

interface EnfermeiroSnapshot {
  activePatients: Patient[];
  recentTriage: TriageEntry[];
  queue: TriageEntry[];
}

const emptySnapshot: EnfermeiroSnapshot = {
  activePatients: [],
  recentTriage: [],
  queue: []
};

function isToday(value?: string) {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function EnfermeiroDashboard({ user }: EnfermeiroDashboardProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [snapshot, setSnapshot] = useState<EnfermeiroSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    try {
      const [patients, triages, queue] = await Promise.all([
        api.listPatients(true),
        api.listTriage(),
        api.listTriageQueue()
      ]);

      const sortedTriage = [...triages].sort((a, b) => {
        const aDate = a.triageDate ? new Date(a.triageDate).getTime() : 0;
        const bDate = b.triageDate ? new Date(b.triageDate).getTime() : 0;
        return bDate - aDate;
      });

      setSnapshot({
        activePatients: patients,
        recentTriage: sortedTriage.slice(0, 5),
        queue
      });
    } catch (loadError) {
      toast.error(normalizeError(loadError));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const ownerNurseId = user.id;
  const triageToday = snapshot.recentTriage.filter((entry) => isToday(entry.triageDate));
  const myTriagesToday = triageToday.filter((entry) => entry.nurseId === ownerNurseId);

  if (loading) {
    return (
      <div className="page-stack">
        <article className="panel">
          <div className="empty-state">Carregando seu painel de triagem...</div>
        </article>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="VISÃO DO ENFERMEIRO"
        title={`Olá, ${user.nome}`}
        description="Pacientes prontos para triagem, suas classificações recentes e a fila atual da unidade."
        actions={
          <button type="button" className="button" onClick={() => navigate("/app/triagem/nova")}>
            + Nova triagem
          </button>
        }
      />

      <section className="stats-grid">
        <article className="stat-card">
          <span>Pacientes ativos</span>
          <strong>{snapshot.activePatients.length}</strong>
          <small>Disponíveis para nova triagem.</small>
        </article>
        <article className="stat-card">
          <span>Suas triagens hoje</span>
          <strong>{myTriagesToday.length}</strong>
          <small>Classificações registradas por você.</small>
        </article>
        <article className="stat-card">
          <span>Fila atual</span>
          <strong>{snapshot.queue.length}</strong>
          <small>Aguardando atendimento médico.</small>
        </article>
      </section>

      <section className="content-grid two-columns">
        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">SUAS TRIAGENS RECENTES</p>
              <h2>Últimas classificações</h2>
            </div>
            <button type="button" className="button ghost" onClick={() => navigate("/app/triagem")}>
              Ver todas
            </button>
          </div>
          {snapshot.recentTriage.length ? (
            <div className="list-stack">
              {snapshot.recentTriage.map((entry) => (
                <div key={entry.id} className="list-card">
                  <div className="list-card-top">
                    <strong>{entry.patientName}</strong>
                    <span className={`pill risk ${entry.riskClassification.toLowerCase()}`}>
                      {riskLabel(entry.riskClassification)}
                    </span>
                  </div>
                  <p>{entry.chiefComplaint || "Sem queixa principal registrada."}</p>
                  <small>
                    {statusLabel(entry.status)} • {formatDateTime(entry.triageDate)}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Nenhuma triagem registrada ainda.</div>
          )}
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <p className="panel-kicker">FILA AGUARDANDO MÉDICO</p>
              <h2>Pacientes triados</h2>
            </div>
          </div>
          {snapshot.queue.length ? (
            <div className="list-stack">
              {snapshot.queue.slice(0, 5).map((entry) => (
                <div key={entry.id} className="list-card">
                  <div className="list-card-top">
                    <strong>{entry.patientName}</strong>
                    <span className={`pill risk ${entry.riskClassification.toLowerCase()}`}>
                      {riskLabel(entry.riskClassification)}
                    </span>
                  </div>
                  <small>Triado em {formatDateTime(entry.triageDate)}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">Nenhum paciente na fila no momento.</div>
          )}
        </article>
      </section>
    </div>
  );
}
