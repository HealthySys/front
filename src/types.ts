export type Role = "ADMIN" | "MEDICO" | "ENFERMEIRO" | "RECEPCIONISTA" | "PACIENTE";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  email: string;
  role: Role;
}

export interface BootstrapStatus {
  bootstrapRequired: boolean;
  userCount: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserPayload {
  username: string;
  email: string;
  password?: string;
  role: Role;
  active: boolean;
}

export type Sexo = "MASCULINO" | "FEMININO" | "OUTRO";

export interface VaccinePayload {
  id?: number;
  nomeVacina: string;
  dataAplicacao: string;
}

export interface AllergyPayload {
  id?: number;
  nomeAlergia: string;
}

export interface Patient {
  id: number;
  nome: string;
  dataNascimento: string;
  cpf: string;
  email: string;
  telefone: string;
  sexo: Sexo;
  endereco: string;
  tipoSanguineo: string;
  alergias: AllergyPayload[];
  vacinas: VaccinePayload[];
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientPayload {
  nome: string;
  dataNascimento: string;
  cpf: string;
  email: string;
  telefone: string;
  sexo: Sexo;
  endereco: string;
  tipoSanguineo: string;
  alergias: AllergyPayload[];
  vacinas: VaccinePayload[];
  ativo: boolean;
}

export type RiskClassification = "VERMELHO" | "LARANJA" | "AMARELO" | "VERDE" | "AZUL";

export type TriageStatus =
  | "AGUARDANDO_ATENDIMENTO"
  | "EM_ATENDIMENTO"
  | "ATENDIDO"
  | "TRANSFERIDO"
  | "ALTA_ADMINISTRATIVA";

export interface TriageEntry {
  id: number;
  patientId: number;
  patientName: string;
  riskClassification: RiskClassification;
  chiefComplaint: string;
  vitalSigns: string;
  observations: string;
  nurseId: string;
  nurseName: string;
  triageDate?: string;
  status: TriageStatus;
  eventPublished?: boolean;
}

export interface TriagePayload {
  patientId: number;
  patientName: string;
  riskClassification: RiskClassification;
  chiefComplaint: string;
  vitalSigns: string;
  observations: string;
  nurseId: string;
  nurseName: string;
  status?: TriageStatus;
}

export interface RecordEntry {
  type: string;
  description: string;
  doctorId: string;
  doctorName: string;
  entryDate?: string;
  origin?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: number;
  patientName: string;
  diagnosis: string;
  treatment: string;
  observations: string;
  responsibleDoctorId: string;
  responsibleDoctorName: string;
  entries: RecordEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalRecordPayload {
  patientId: number;
  patientName: string;
  diagnosis: string;
  treatment: string;
  observations: string;
  responsibleDoctorId: string;
  responsibleDoctorName: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  patientId?: number;
  patientName?: string;
  timestamp?: string;
}

export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  severity: string;
  patientId?: number;
  patientName?: string;
}
