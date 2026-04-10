import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import type { ModuleKey } from "./config/permissions";
import { canAccess, initialRouteForRole } from "./config/permissions";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NotificationsPage } from "./features/notifications/pages/NotificationsPage";
import { PatientsListPage } from "./features/patients/pages/PatientsListPage";
import { CreatePatientPage } from "./features/patients/pages/CreatePatientPage";
import { EditPatientPage } from "./features/patients/pages/EditPatientPage";
import { CreateTriagePage } from "./features/triage/pages/CreateTriagePage";
import { EditTriagePage } from "./features/triage/pages/EditTriagePage";
import { TriageListPage } from "./features/triage/pages/TriageListPage";
import { RecordsListPage } from "./features/records/pages/RecordsListPage";
import { CreateRecordPage } from "./features/records/pages/CreateRecordPage";
import { EditRecordPage } from "./features/records/pages/EditRecordPage";
import { RecordDetailsPage } from "./features/records/pages/RecordDetailsPage";
import { UsersListPage } from "./features/users/pages/UsersListPage";
import { CreateUserPage } from "./features/users/pages/CreateUserPage";
import { EditUserPage } from "./features/users/pages/EditUserPage";

function RoleRoute({
  moduleKey,
  children
}: {
  moduleKey: ModuleKey;
  children: React.ReactElement;
}) {
  const { user } = useAuth();

  if (!canAccess(user?.role, moduleKey)) {
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
          <Route index element={<DashboardPage />} />
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
              <RoleRoute moduleKey="usuarios">
                <CreateUserPage />
              </RoleRoute>
            }
          />
          <Route
            path="usuarios/:id/editar"
            element={
              <RoleRoute moduleKey="usuarios">
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
              <RoleRoute moduleKey="pacientes">
                <CreatePatientPage />
              </RoleRoute>
            }
          />
          <Route
            path="pacientes/:id/editar"
            element={
              <RoleRoute moduleKey="pacientes">
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
              <RoleRoute moduleKey="triagem">
                <CreateTriagePage />
              </RoleRoute>
            }
          />
          <Route
            path="triagem/:id/editar"
            element={
              <RoleRoute moduleKey="triagem">
                <EditTriagePage />
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
              <RoleRoute moduleKey="prontuarios">
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
              <RoleRoute moduleKey="prontuarios">
                <EditRecordPage />
              </RoleRoute>
            }
          />
          <Route
            path="notificacoes"
            element={
              <RoleRoute moduleKey="notificacoes">
                <NotificationsPage />
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
