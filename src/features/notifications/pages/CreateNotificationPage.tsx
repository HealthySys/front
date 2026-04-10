import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../components/layout/PageHeader";
import { api } from "../../../services/api";
import type { NotificationPayload } from "../../../types";
import { normalizeError } from "../../../utils/formatters";
import { NotificationForm } from "../components/NotificationForm";

const initialForm: NotificationPayload = {
  type: "INFO",
  title: "",
  message: "",
  severity: "INFO",
  patientName: "",
  patientId: undefined
};

export function CreateNotificationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<NotificationPayload>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      await api.broadcastNotification({
        ...form,
        patientId: form.patientId || undefined,
        patientName: form.patientName || undefined
      });

      setFeedback("Notificação enviada com sucesso.");
      setTimeout(() => navigate("/app/notificacoes"), 800);
    } catch (submitError) {
      setError(normalizeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="CENTRAL DE ALERTAS"
        title="Enviar notificação"
        description="Publique um aviso manual para a equipe e registre o evento no histórico operacional."
      />

      {feedback ? <div className="alert success">{feedback}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <article className="panel">
        <div className="panel-head">
          <div>
            <p className="panel-kicker">PUBLICAÇÃO MANUAL</p>
            <h2>Nova notificação</h2>
          </div>
        </div>

        <NotificationForm
          form={form}
          setForm={setForm}
          submitting={submitting}
          submitLabel="Enviar notificação"
          onSubmit={handleSubmit}
          onCancel={() => navigate("/app/notificacoes")}
        />
      </article>
    </div>
  );
}