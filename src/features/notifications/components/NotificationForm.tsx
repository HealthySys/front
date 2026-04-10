import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Notification, NotificationPayload } from "../../../types";
import {
  notificationSeverityOptions,
  notificationTypeOptions,
  severityLabel
} from "../../../utils/formatters";

type NotificationFormProps = {
  form: NotificationPayload;
  setForm: Dispatch<SetStateAction<NotificationPayload>>;
  submitting: boolean;
  submitLabel?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
};

export function NotificationForm({
  form,
  setForm,
  submitting,
  submitLabel = "Enviar notificação",
  onSubmit,
  onCancel
}: NotificationFormProps) {
  return (
    <form className="form-grid wide-grid" onSubmit={onSubmit}>
      <label className="field">
        <span>Tipo</span>
        <select
          value={form.type}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              type: event.target.value as Notification["type"]
            }))
          }
        >
          {notificationTypeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Severidade</span>
        <select
          value={form.severity}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              severity: event.target.value as Notification["severity"]
            }))
          }
        >
          {notificationSeverityOptions.map((severity) => (
            <option key={severity} value={severity}>
              {severityLabel(severity)}
            </option>
          ))}
        </select>
      </label>

      <label className="field field-span-2">
        <span>Título</span>
        <input
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Ex.: Alerta de ocupação, intercorrência ou aviso técnico"
          required
        />
      </label>

      <label className="field field-span-2">
        <span>Mensagem</span>
        <textarea
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          rows={4}
          placeholder="Descreva o conteúdo da notificação"
          required
        />
      </label>

      <label className="field">
        <span>ID do paciente (opcional)</span>
        <input
          value={form.patientId ?? ""}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              patientId: event.target.value ? Number(event.target.value) : undefined
            }))
          }
          placeholder="123"
        />
      </label>

      <label className="field">
        <span>Paciente relacionado (opcional)</span>
        <input
          value={form.patientName ?? ""}
          onChange={(event) =>
            setForm((current) => ({ ...current, patientName: event.target.value }))
          }
          placeholder="Nome do paciente"
        />
      </label>

      <div className="form-actions field-span-2">
        <button type="submit" className="button" disabled={submitting}>
          {submitting ? "Enviando..." : submitLabel}
        </button>

        {onCancel ? (
          <button type="button" className="button ghost" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}