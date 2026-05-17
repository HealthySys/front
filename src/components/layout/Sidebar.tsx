import { Activity, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { canAccess, modules } from "../../config/permissions";
import { roleLabel } from "../../utils/formatters";
import { Avatar } from "../ui/Avatar";
import { useSidebar } from "./SidebarContext";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  const { user, logout } = useAuth();
  const { collapsed } = useSidebar();

  const visibleModules = modules.filter((module) => canAccess(user?.role, module.key));

  return (
    <aside
      className={`${styles.sidebar}${collapsed ? ` ${styles.collapsed}` : ""}`}
      aria-hidden={collapsed}
    >
      <div className={styles.brandRow}>
        <div className={styles.brandIcon}>
          <Activity size={18} strokeWidth={2.2} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>HealthSys</span>
          <span className={styles.brandVersion}>v2.0</span>
        </div>
      </div>

      <nav className={styles.scroll}>
        <span className={styles.sectionLabel}>Menu</span>
        {visibleModules.map((module) => {
          const Icon = module.icon;

          return (
            <NavLink
              key={module.key}
              to={module.path}
              end={module.path === "/app"}
              className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ""}`}
            >
              <Icon className={styles.icon} size={18} />
              <span className={styles.linkLabel}>{module.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.userArea}>
        <Avatar name={user?.nome} size={32} />
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.nome ?? "—"}</span>
          <span className={styles.userRole}>{roleLabel(user?.role)}</span>
        </div>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={() => void logout()}
          title="Sair"
          aria-label="Sair"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}
