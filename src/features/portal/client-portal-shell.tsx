import type { ReactNode } from "react";
import DashboardTopbar from "@/src/components/dashboard/dashboard-topbar";
import styles from "./client-dashboard.module.css";

export type ClientPortalSection = "overview" | "contract" | "billing";

type ClientPortalShellProps = {
  account: {
    email: string;
    image?: string | null;
    name?: string | null;
  };
  active: ClientPortalSection;
  children: ReactNode;
  routes?: Record<ClientPortalSection, string>;
};

const defaultRoutes: Record<ClientPortalSection, string> = {
  overview: "/account",
  contract: "/account/contract",
  billing: "/account/billing",
};

export default function ClientPortalShell({
  account,
  active,
  children,
  routes = defaultRoutes,
}: ClientPortalShellProps) {
  return (
    <main className={styles.dashboardPage}>
      <div className={styles.clientShell}>
        <DashboardTopbar
          email={account.email}
          image={account.image}
          name={account.name}
        />
        <aside className={styles.clientNav}>
          <div className={styles.clientNavLabel}>Your workspace</div>
          <nav aria-label="Client navigation">
            {(Object.keys(routes) as ClientPortalSection[]).map(
              (section, index) => (
                <a
                  className={
                    active === section ? styles.clientActive : undefined
                  }
                  href={routes[section]}
                  key={section}
                >
                  <span>0{index + 1}</span>
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </a>
              ),
            )}
          </nav>
        </aside>
        <section className={styles.clientWorkspace}>
          <div className={styles.clientContent}>{children}</div>
        </section>
      </div>
    </main>
  );
}
