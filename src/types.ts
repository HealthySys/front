export type Role = "ADMIN" | "MEDICO" | "ENFERMEIRO" | "RECEPCIONISTA";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  userId: number;
  username: string;
  nome: string;
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
  nome: string;
  email: string;
  role: Role;
  assinaturaDigital?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  username: string;
  nome: string;
  email: string;
  password: string;
  role: Role;
  assinaturaDigital?: string;
}

export interface UpdateUserPayload {
  username: string;
  nome: string;
  email: string;
  password?: string;
  role: Role;
  active: boolean;
  assinaturaDigital?: string;
}

export type Sexo = "MASCULINO" | "FEMININO" | "OUTRO";

export type Severidade = "LEVE" | "MODERADA" | "GRAVE";

export interface VaccinePayload {
  id?: number;
  nomeVacina: string;
  dataAplicacao: string;
  lote?: string;
  profissionalResp?: string;
}

export interface AllergyPayload {
  id?: number;
  nomeAlergia: string;
  severidade: Severidade;
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

export interface WebSocketSubscription {
  unsubscribe: () => void;
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
  correlationId?: string;
  patientId: number;
  patientName: string;
  riskClassification: RiskClassification;
  chiefComplaint: string;
  vitalSigns: string;
  observations: string;
  nurseId: number;
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
  status?: TriageStatus;
  alergiasReportadas?: AllergyPayload[];
  vacinasReportadas?: VaccinePayload[];
}

export interface RecordEntry {
  type: string;
  description: string;
  doctorId: string;
  doctorName: string;
  entryDate?: string;
  origin?: string;
  correlationId?: string;
}

export type ViaAdministracao =
  | "ORAL"
  | "INTRAVENOSA"
  | "INTRAMUSCULAR"
  | "SUBCUTANEA"
  | "TOPICA"
  | "INALATORIA"
  | "OUTRA";

export interface Prescription {
  id: string;
  medicamento: string;
  dosagem: string;
  via: ViaAdministracao;
  frequencia: string;
  duracao: string;
  observacoes?: string;
  doctorId?: string;
  doctorName?: string;
  prescribedAt?: string;
  correlationId?: string;
}

export interface PrescriptionPayload {
  medicamento: string;
  dosagem: string;
  via: ViaAdministracao;
  frequencia: string;
  duracao: string;
  observacoes?: string;
}

export type TipoExame = "LABORATORIAL" | "IMAGEM" | "CARDIOLOGICO" | "OUTRO";

export type StatusExame = "SOLICITADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";

export interface Exam {
  id: string;
  tipo: TipoExame;
  nome: string;
  indicacaoClinica?: string;
  status: StatusExame;
  resultado?: string;
  doctorId?: string;
  doctorName?: string;
  requestedAt?: string;
  resultedAt?: string;
  correlationId?: string;
}

export interface ExamPayload {
  tipo: TipoExame;
  nome: string;
  indicacaoClinica?: string;
}

export interface ExamResultPayload {
  resultado: string;
  status?: StatusExame;
}

export interface AtendimentoConsultationInput {
  diagnosis: string;
  treatment: string;
  observations: string;
}

export interface AtendimentoPrescriptionInput {
  medicamento: string;
  dosagem: string;
  via: ViaAdministracao;
  frequencia: string;
  duracao: string;
  observacoes?: string;
}

export interface AtendimentoExamInput {
  tipo: TipoExame;
  nome: string;
  indicacaoClinica?: string;
}

export interface AtendimentoPayload {
  consultation: AtendimentoConsultationInput | null;
  prescriptions: AtendimentoPrescriptionInput[];
  exams: AtendimentoExamInput[];
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
  prescriptions?: Prescription[];
  exams?: Exam[];
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
  triageId?: number;
  correlationId?: string;
  targetRoles?: string[];
  timestamp?: string;
}

