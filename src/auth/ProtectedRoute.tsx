import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fullscreen-state">
        <div className="loader-card">
          <div className="flex">
            <span className="loader-dot" />
          <strong>Carregando o ambiente HealthSys...</strong>
          </div>
          <p>Verificando sua sessão e preparando os módulos autorizados.</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
