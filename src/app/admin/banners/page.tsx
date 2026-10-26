import { AdminBanners } from "@/components/admin-banners";
import { PortalShell } from "@/components/portal-shell";
export default function AdminBannersPage() {
  return (
    <PortalShell kind="admin">
      <main className="portal-content">
        <AdminBanners />
      </main>
    </PortalShell>
  );
}
