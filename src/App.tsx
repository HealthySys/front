import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import type { ModuleKey } from "./config/permissions";
import { canAccess, initialRouteForRole } from "./config/permissions";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PatientsPage } from "./pages/PatientsPage";
import { RecordsPage } from "./pages/RecordsPage";
import { TriagePage } from "./pages/TriagePage";
import { UsersPage } from "./pages/UsersPage";

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
                <UsersPage />
              </RoleRoute>
            }
          />
          <Route
            path="pacientes"
            element={
              <RoleRoute moduleKey="pacientes">
                <PatientsPage />
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
