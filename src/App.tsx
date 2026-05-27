import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import type { ModuleKey } from "./config/permissions";
import { canAccess, canWrite, initialRouteForRole } from "./config/permissions";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { PatientsListPage } from "./features/patients/pages/PatientsListPage";
import { CreatePatientPage } from "./features/patients/pages/CreatePatientPage";
import { EditPatientPage } from "./features/patients/pages/EditPatientPage";
import { CreateTriagePage } from "./features/triage/pages/CreateTriagePage";
import { EditTriagePage } from "./features/triage/pages/EditTriagePage";
import { TriageListPage } from "./features/triage/pages/TriageListPage";
import { AttendancePage } from "./features/attendance/pages/AttendancePage";
import { RecordsListPage } from "./features/records/pages/RecordsListPage";
import { CreateRecordPage } from "./features/records/pages/CreateRecordPage";
import { EditRecordPage } from "./features/records/pages/EditRecordPage";
import { RecordDetailsPage } from "./features/records/pages/RecordDetailsPage";
import { UsersListPage } from "./features/users/pages/UsersListPage";
import { CreateUserPage } from "./features/users/pages/CreateUserPage";
import { EditUserPage } from "./features/users/pages/EditUserPage";

function RoleRoute({
  moduleKey,
  requireWrite = false,
  children
}: {
  moduleKey: ModuleKey;
  requireWrite?: boolean;
  children: React.ReactElement;
}) {
  const { user } = useAuth();

  if (!canAccess(user?.role, moduleKey)) {
    return <Navigate to={initialRouteForRole(user?.role)} replace />;
  }

  if (requireWrite && !canWrite(user?.role, moduleKey)) {
    return <Navigate to={initialRouteForRole(user?.role)} replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route
            index
            element={
              canAccess(user?.role, "dashboard") ? (
                <DashboardPage />
              ) : (
                <Navigate to={initialRouteForRole(user?.role)} replace />
              )
            }
          />
          <Route
            path="usuarios"
            element={
              <RoleRoute moduleKey="usuarios">
                <UsersListPage />
              </RoleRoute>
            }
          />
          <Route
            path="usuarios/novo"
            element={
              <RoleRoute moduleKey="usuarios" requireWrite>
                <CreateUserPage />
              </RoleRoute>
            }
          />
          <Route
            path="usuarios/:id/editar"
            element={
              <RoleRoute moduleKey="usuarios" requireWrite>
                <EditUserPage />
              </RoleRoute>
            }
          />
          <Route
            path="pacientes"
            element={
              <RoleRoute moduleKey="pacientes">
                <PatientsListPage />
              </RoleRoute>
            }
          />
          <Route
            path="pacientes/novo"
            element={
              <RoleRoute moduleKey="pacientes" requireWrite>
                <CreatePatientPage />
              </RoleRoute>
            }
          />
          <Route
            path="pacientes/:id/editar"
            element={
              <RoleRoute moduleKey="pacientes" requireWrite>
                <EditPatientPage />
              </RoleRoute>
            }
          />
          <Route
            path="triagem"
            element={
              <RoleRoute moduleKey="triagem">
                <TriageListPage />
              </RoleRoute>
            }
          />
          <Route
            path="triagem/nova"
            element={
              <RoleRoute moduleKey="triagem" requireWrite>
                <CreateTriagePage />
              </RoleRoute>
            }
          />
          <Route
            path="triagem/:id/editar"
            element={
              <RoleRoute moduleKey="triagem" requireWrite>
                <EditTriagePage />
              </RoleRoute>
            }
          />
          <Route
            path="atendimento/:triageId"
            element={
              <RoleRoute moduleKey="prontuarios">
                <AttendancePage />
              </RoleRoute>
            }
          />
          <Route
            path="prontuarios"
            element={
              <RoleRoute moduleKey="prontuarios">
                <RecordsListPage />
              </RoleRoute>
            }
          />

          <Route
            path="prontuarios/novo"
            element={
              <RoleRoute moduleKey="prontuarios" requireWrite>
                <CreateRecordPage />
              </RoleRoute>
            }
          />

          <Route
            path="prontuarios/:id"
            element={
              <RoleRoute moduleKey="prontuarios">
                <RecordDetailsPage />
              </RoleRoute>
            }
          />

          <Route
            path="prontuarios/:id/editar"
            element={
              <RoleRoute moduleKey="prontuarios" requireWrite>
                <EditRecordPage />
              </RoleRoute>
            }
          />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={user ? initialRouteForRole(user.role) : "/login"} replace />} />
      <Route path="*" element={<Navigate to={user ? initialRouteForRole(user.role) : "/login"} replace />} />
    </Routes>
  );
}
