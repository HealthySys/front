import {
  LayoutDashboard,
  Users,
  UserRound,
  ClipboardPlus,
  FileText
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "../types";

export type ModuleKey =
  | "dashboard"
  | "usuarios"
  | "pacientes"
  | "triagem"
  | "prontuarios";

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
  RECEPCIONISTA: "Recepcionista"
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
  }
];

const permissionMatrix: Record<Role, ModuleKey[]> = {
  ADMIN: ["dashboard", "usuarios"],
  MEDICO: ["dashboard", "triagem", "prontuarios"],
  ENFERMEIRO: ["dashboard", "pacientes", "triagem"],
  RECEPCIONISTA: ["pacientes"]
};

const writeMatrix: Record<Role, ModuleKey[]> = {
  ADMIN: ["usuarios"],
  MEDICO: ["prontuarios"],
  ENFERMEIRO: ["triagem"],
  RECEPCIONISTA: ["pacientes"]
};

export function canAccess(role: Role | undefined, moduleKey: ModuleKey) {
  if (!role) {
    return false;
  }

  return permissionMatrix[role].includes(moduleKey);
}

export function canWrite(role: Role | undefined, moduleKey: ModuleKey) {
  if (!role) {
    return false;
  }

  return writeMatrix[role].includes(moduleKey);
}

export function initialRouteForRole(role: Role | undefined) {
  if (!role) {
    return "/login";
  }

  const firstAvailable = modules.find((module) => canAccess(role, module.key));
  return firstAvailable?.path ?? "/login";
}
