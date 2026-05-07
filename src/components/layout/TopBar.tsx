import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { roleLabel } from "../../utils/formatters";
import { getRouteMeta } from "./routeMeta";
import { NotificationBell } from "./NotificationBell";
import { useTopBarMeta } from "./TopBarContext";
import { useSidebar } from "./SidebarContext";
import styles from "./TopBar.module.css";

const ROLES_WITH_NOTIFICATIONS = new Set(["MEDICO", "ENFERMEIRO"]);

export function TopBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const override = useTopBarMeta();
  const { collapsed, toggle } = useSidebar();

  const fallback = getRouteMeta(location.pathname);
  const eyebrow = override.eyebrow ?? fallback.eyebrow;
  const title = override.title ?? fallback.title;
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const showBell = user?.role ? ROLES_WITH_NOTIFICATIONS.has(user.role) : false;

  return (
    <header className={styles.topbar}>
      <div className={styles.leftWrap}>
        <button
          type="button"
          className={styles.toggle}
          onClick={toggle}
          aria-label={collapsed ? "Mostrar menu lateral" : "Esconder menu lateral"}
          aria-pressed={!collapsed}
          title={collapsed ? "Mostrar menu lateral" : "Esconder menu lateral"}
        >
          <ToggleIcon size={16} />
        </button>
        <div className={styles.left}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <span className={styles.title}>{title}</span>
        </div>
      </div>
      <div className={styles.right}>
        {override.extras}
        {showBell ? <NotificationBell /> : null}
        <span className={styles.userTag}>{roleLabel(user?.role)}</span>
        <button type="button" className={styles.exitBtn} onClick={() => void logout()}>
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </header>
  );
}
