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
import { TriagePage } from "./features/triage/pages/TriagePage";
import { RecordsPage } from "./features/records/pages/RecordsPage";
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
                <TriagePage />
              </RoleRoute>
            }
          />
          <Route
            path="prontuarios"
            element={
              <RoleRoute moduleKey="prontuarios">
                <RecordsPage />
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
