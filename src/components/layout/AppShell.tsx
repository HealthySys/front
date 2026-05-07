import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { TopBarProvider } from "./TopBarContext";
import { SidebarProvider } from "./SidebarContext";
import { NotificationCenterProvider } from "../../features/notifications/NotificationCenter";
import styles from "./AppShell.module.css";

export function AppShell() {
  return (
    <NotificationCenterProvider>
      <SidebarProvider>
        <TopBarProvider>
          <div className={styles.shell}>
            <Sidebar />
            <section className={styles.main}>
              <TopBar />
              <main className={styles.content}>
                <Outlet />
              </main>
            </section>
          </div>
        </TopBarProvider>
      </SidebarProvider>
    </NotificationCenterProvider>
  );
}
