import {
  LayoutDashboard,
  Users,
  UserRound,
  ClipboardPlus,
  FileText,
  Bell
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "../types";

export type ModuleKey =
  | "dashboard"
  | "usuarios"
  | "pacientes"
  | "triagem"
  | "prontuarios"
  | "notificacoes"
  | "meu-prontuario";

export interface ModuleDefinition {
  key: ModuleKey;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const roleLabels: Record<Role, string> = {
  ADMIN: "Administrador do sistema",
  MEDICO: "Médico",
  ENFERMEIRO: "Enfermeiro",
  RECEPCIONISTA: "Recepcionista",
  PACIENTE: "Paciente"
};

export const modules: ModuleDefinition[] = [
  {
    key: "dashboard",
    label: "Painel",
    path: "/app",
    icon: LayoutDashboard,
  },
  {
    key: "usuarios",
    label: "Usuários",
    path: "/app/usuarios",
    icon: Users,
  },
  {
    key: "pacientes",
    label: "Pacientes",
    path: "/app/pacientes",
    icon: UserRound,
  },
  {
    key: "triagem",
    label: "Triagem",
    path: "/app/triagem",
    icon: ClipboardPlus,
  },
  {
    key: "prontuarios",
    label: "Prontuários",
    path: "/app/prontuarios",
    icon: FileText,
  },
  {
    key: "notificacoes",
    label: "Notificações",
    path: "/app/notificacoes",
    icon: Bell,
  },
  {
    key: "meu-prontuario",
    label: "Meu prontuário",
    path: "/app/meu-prontuario",
    icon: FileText,
  }
];

const permissionMatrix: Record<Role, ModuleKey[]> = {
  ADMIN: ["dashboard", "usuarios", "pacientes", "triagem", "prontuarios", "notificacoes"],
  MEDICO: ["dashboard", "pacientes", "triagem", "prontuarios", "notificacoes"],
  ENFERMEIRO: ["dashboard", "pacientes", "triagem", "prontuarios", "notificacoes"],
  RECEPCIONISTA: ["dashboard", "pacientes"],
  PACIENTE: ["meu-prontuario"]
};

export function canAccess(role: Role | undefined, moduleKey: ModuleKey) {
  if (!role) {
    return false;
  }

  return permissionMatrix[role].includes(moduleKey);
}

export function initialRouteForRole(role: Role | undefined) {
  if (!role) {
    return "/login";
  }

  if (role === "PACIENTE") {
    return "/app/meu-prontuario";
  }

  const firstAvailable = modules.find((module) => canAccess(role, module.key));
  return firstAvailable?.path ?? "/login";
}
