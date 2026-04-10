import type {
  AuthResponse,
  BootstrapStatus,
  CreateUserPayload,
  LoginPayload,
  MedicalRecord,
  MedicalRecordPayload,
  Notification,
  NotificationPayload,
  Patient,
  PatientPayload,
  RecordEntry,
  TriageEntry,
  TriagePayload,
  TriageStatus,
  UpdateUserPayload,
  User
} from "../types";

export const TOKEN_STORAGE_KEY = "healthsys.frontend.token";
export const SESSION_STORAGE_KEY = "healthsys.frontend.session";

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!options.skipAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload || `${response.status} ${response.statusText}`
        : payload?.message || payload?.error || `${response.status} ${response.statusText}`;

    throw new Error(message);
  }

  return payload as T;
}

export const api = {
  login(payload: LoginPayload) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true
    });
  },

  register(payload: CreateUserPayload) {
    return request<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true
    });
  },

  getBootstrapStatus() {
    return request<BootstrapStatus>("/api/auth/bootstrap-status", {
      skipAuth: true
    });
  },

  getCurrentUser() {
    return request<User>("/api/users/me");
  },

  listUsers() {
    return request<User[]>("/api/users");
  },

  createUser(payload: CreateUserPayload) {
    return request<User>("/api/users", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  updateUser(id: number, payload: UpdateUserPayload) {
    return request<User>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  updateUserStatus(id: number, active: boolean) {
    return request<User>(`/api/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ active })
    });
  },

  deleteUser(id: number) {
    return request<void>(`/api/users/${id}`, {
      method: "DELETE"
    });
  },

  listPatients(active?: boolean) {
    const suffix = typeof active === "boolean" ? `?ativo=${active}` : "";
    return request<Patient[]>(`/api/patients${suffix}`);
  },

  searchPatients(name: string) {
    return request<Patient[]>(`/api/patients/search?nome=${encodeURIComponent(name)}`);
  },

  createPatient(payload: PatientPayload) {
    return request<Patient>("/api/patients", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  updatePatient(id: number, payload: PatientPayload) {
    return request<Patient>(`/api/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  updatePatientStatus(id: number, active: boolean) {
    return request<Patient>(`/api/patients/${id}/status?ativo=${active}`, {
      method: "PATCH"
    });
  },

  deletePatient(id: number) {
    return request<void>(`/api/patients/${id}`, {
      method: "DELETE"
    });
  },

  listTriage() {
    return request<TriageEntry[]>("/api/triage");
  },

  getTriage(id: number) {
    return request<TriageEntry>(`/api/triage/${id}`);
  },

  listTriageQueue() {
    return request<TriageEntry[]>("/api/triage/queue");
  },

  createTriage(payload: TriagePayload) {
    return request<TriageEntry>("/api/triage", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  updateTriage(id: number, payload: TriagePayload & { status?: TriageStatus }) {
    return request<TriageEntry>(`/api/triage/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  updateTriageStatus(id: number, status: TriageStatus) {
    return request<TriageEntry>(`/api/triage/${id}/status?status=${status}`, {
      method: "PATCH"
    });
  },

  deleteTriage(id: number) {
    return request<void>(`/api/triage/${id}`, {
      method: "DELETE"
    });
  },

  listRecords() {
    return request<MedicalRecord[]>("/api/records");
  },

  createRecord(payload: MedicalRecordPayload) {
    return request<MedicalRecord>("/api/records", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  updateRecord(id: string, payload: MedicalRecordPayload) {
    return request<MedicalRecord>(`/api/records/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  addRecordEntry(id: string, payload: RecordEntry) {
    return request<MedicalRecord>(`/api/records/${id}/entries`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  deleteRecord(id: string) {
    return request<void>(`/api/records/${id}`, {
      method: "DELETE"
    });
  },

  listNotifications() {
    return request<Notification[]>("/api/notifications");
  },

  broadcastNotification(payload: NotificationPayload) {
    return request<Notification>("/api/notifications/broadcast", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  clearNotifications() {
    return request<void>("/api/notifications", {
      method: "DELETE"
    });
  },

  checkGateway() {
    return request<{ status: string }>("/actuator/health", {
      skipAuth: true
    });
  }
};
