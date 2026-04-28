import { useAuth } from "../auth/AuthProvider";
import { AdminDashboard } from "./dashboards/AdminDashboard";
import { EnfermeiroDashboard } from "./dashboards/EnfermeiroDashboard";
import { MedicoDashboard } from "./dashboards/MedicoDashboard";
import { RecepcionistaDashboard } from "./dashboards/RecepcionistaDashboard";

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="page-stack">
        <article className="panel">
          <div className="empty-state">Carregando seu perfil...</div>
        </article>
      </div>
    );
  }

  switch (user.role) {
    case "MEDICO":
      return <MedicoDashboard user={user} />;
    case "ENFERMEIRO":
      return <EnfermeiroDashboard user={user} />;
    case "RECEPCIONISTA":
      return <RecepcionistaDashboard user={user} />;
    case "ADMIN":
    default:
      return <AdminDashboard user={user} />;
  }
}
