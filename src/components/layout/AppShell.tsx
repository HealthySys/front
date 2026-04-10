import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { canAccess, modules } from "../../config/permissions";
import { roleLabel } from "../../utils/formatters";

const SIDEBAR_STORAGE_KEY = "healthsys.front.sidebar.collapsed";

export function AppShell() {
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  const visibleModules = modules.filter((module) => canAccess(user?.role, module.key));
  const SidebarToggleIcon = isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return (
    <div className={`app-shell${isSidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-head">
          <div className="brand-card">
            <div className="brand-mark">HS</div>
            <div className="brand-copy">
              <strong>HealthSys</strong>
            </div>
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
                title={module.label}
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

        <div className="sidebar-controls">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
          >
            <SidebarToggleIcon size={18} />
          </button>
        </div>
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
