import type { RiskClassification, Role, Sexo, TriageStatus } from "../types";
import { roleLabels } from "../config/permissions";

export const roleOptions: Role[] = ["ADMIN", "MEDICO", "ENFERMEIRO", "RECEPCIONISTA"];
export const sexoOptions: Sexo[] = ["FEMININO", "MASCULINO", "OUTRO"];
export const bloodTypeOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const riskOptions: RiskClassification[] = ["VERMELHO", "LARANJA", "AMARELO", "VERDE", "AZUL"];
export const triageStatusOptions: TriageStatus[] = [
  "AGUARDANDO_ATENDIMENTO",
  "EM_ATENDIMENTO",
  "ATENDIDO",
  "TRANSFERIDO",
  "ALTA_ADMINISTRATIVA"
];
export const recordEntryTypeOptions = ["CONSULTA", "EXAME", "TRIAGEM"];
export const notificationSeverityOptions = ["INFO", "WARNING", "CRITICAL"];
export const notificationTypeOptions = ["INFO", "ALERTA_CLINICO", "AVISO_OPERACIONAL", "EMERGENCY_ALERT"];

const riskLabels: Record<RiskClassification, string> = {
  VERMELHO: "Vermelho",
  LARANJA: "Laranja",
  AMARELO: "Amarelo",
  VERDE: "Verde",
  AZUL: "Azul"
};

const riskSlaMap: Record<RiskClassification, string> = {
  VERMELHO: "Atendimento imediato",
  LARANJA: "Até 10 minutos",
  AMARELO: "Até 60 minutos",
  VERDE: "Até 120 minutos",
  AZUL: "Até 240 minutos"
};

const statusLabels: Record<TriageStatus, string> = {
  AGUARDANDO_ATENDIMENTO: "Aguardando atendimento",
  EM_ATENDIMENTO: "Em atendimento",
  ATENDIDO: "Atendido",
  TRANSFERIDO: "Transferido",
  ALTA_ADMINISTRATIVA: "Alta administrativa"
};

const sexoLabels: Record<Sexo, string> = {
  FEMININO: "Feminino",
  MASCULINO: "Masculino",
  OUTRO: "Outro"
};

const severityLabels: Record<string, string> = {
  INFO: "Informativo",
  WARNING: "Atenção",
  CRITICAL: "Crítico"
};

export function formatDate(value?: string) {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

export function formatDateTime(value?: string) {
  if (!value) {
    return "Agora";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function roleLabel(role?: Role) {
  return role ? roleLabels[role] : "Perfil não definido";
}

export function sexoLabel(value?: Sexo) {
  return value ? sexoLabels[value] : "Não informado";
}

export function riskLabel(value: RiskClassification) {
  return riskLabels[value];
}

export function riskSla(value: RiskClassification) {
  return riskSlaMap[value];
}

export function statusLabel(value: TriageStatus) {
  return statusLabels[value];
}

export function severityLabel(value?: string) {
  return value ? severityLabels[value] || value : "Informativo";
}

export function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu uma falha inesperada.";
}

export function booleanLabel(value: boolean) {
  return value ? "Sim" : "Não";
}
