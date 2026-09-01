import DashboardTopbar from "@/src/components/dashboard/dashboard-topbar";
import { requirePageAdmin } from "@/src/features/portal/access";
import AdminNavigation from "./admin-navigation";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageAdmin();
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <DashboardTopbar
          email={user.email}
          image={user.image}
          name={user.name}
        />
        <aside className={styles.navPanel}>
          <div className={styles.navLabel}>Workspace</div>
          <AdminNavigation />
        </aside>
        <section className={styles.workspace}>
          <div className={styles.workspaceContent}>{children}</div>
        </section>
      </div>
    </main>
  );
}
