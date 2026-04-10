import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { canAccess, modules } from "../../config/permissions";
import { roleLabel } from "../../utils/formatters";

export function AppShell() {
  const { user, logout } = useAuth();

  const visibleModules = modules.filter((module) => canAccess(user?.role, module.key));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <div className="brand-mark">HS</div>
          <div className="brand-copy">
            <strong>HealthSys</strong>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visibleModules.map((module) => {
            const Icon = module.icon;

            return (
              <NavLink
                key={module.key}
                to={module.path}
                end={module.path === "/app"}
                className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
              >
                <div className="sidebar-link-content">
                  <Icon size={18} />
                  <span>{module.label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <section className="app-content">
        <header className="topbar">
          <div>
            <p className="mini-label">Painel operacional</p>
            <strong>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(new Date())}</strong>
          </div>
          <div className="topbar-actions">
            <div className="user-chip">
              <small>{roleLabel(user?.role)}</small>
            </div>
            <button type="button" className="quit-button" onClick={logout}>
              Sair
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}