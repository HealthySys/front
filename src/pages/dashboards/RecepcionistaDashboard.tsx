import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/feedback/ToastProvider";
import { PageHeader } from "../../components/layout/PageHeader";
import { api } from "../../services/api";
import type { Patient, User } from "../../types";
import { formatDate, normalizeError, sexoLabel } from "../../utils/formatters";

interface RecepcionistaDashboardProps {
  user: User;
}

export function RecepcionistaDashboard({ user }: RecepcionistaDashboardProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const response = await api.listPatients();
        if (!active) {
          return;
        }
        setPatients(response);
      } catch (loadError) {
        if (active) {
          toast.error(normalizeError(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [toast]);

  const activePatients = patients.filter((patient) => patient.ativo);
  const recentPatients = [...patients]
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    })
    .slice(0, 5);

  if (loading) {
    return (
      <div className="page-stack">
        <article className="panel">
          <div className="empty-state">Carregando seu painel de recepção...</div>
        </article>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="VISÃO DA RECEPÇÃO"
        title={`Olá, ${user.nome}`}
        description="Acompanhe os cadastros recentes e mantenha a base de pacientes atualizada."
        actions={
          <button type="button" className="button" onClick={() => navigate("/app/pacientes/novo")}>
            + Cadastrar paciente
          </button>
        }
      />

      <section className="stats-grid">
        <article className="stat-card">
          <span>Pacientes ativos</span>
          <strong>{activePatients.length}</strong>
          <small>Habilitados para atendimento.</small>
        </article>
        <article className="stat-card">
          <span>Total cadastrado</span>
          <strong>{patients.length}</strong>
          <small>Ativos e inativos na base.</small>
        </article>
        <article className="stat-card">
          <span>Inativos</span>
          <strong>{patients.length - activePatients.length}</strong>
          <small>Cadastros desabilitados.</small>
        </article>
      </section>

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">CADASTROS RECENTES</p>
            <h2>Últimos pacientes</h2>
          </div>
          <button type="button" className="button ghost" onClick={() => navigate("/app/pacientes")}>
            Ver todos
          </button>
        </div>

        {recentPatients.length ? (
          <div className="list-stack">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="list-card">
                <div className="list-card-top">
                  <strong>{patient.nome}</strong>
                  <span className={`pill ${patient.ativo ? "severity info" : "severity warning"}`}>
                    {patient.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <p>
                  {sexoLabel(patient.sexo)} • Nascimento {formatDate(patient.dataNascimento)}
                </p>
                <small>Cadastrado em {formatDate(patient.createdAt)}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">Nenhum paciente cadastrado ainda.</div>
        )}
      </article>
    </div>
  );
}
