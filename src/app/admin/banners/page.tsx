import { AdminBanners } from "@/components/admin-banners";
import { PortalShell } from "@/components/portal-shell";
export default function AdminBannersPage() {
  return (
    <PortalShell kind="admin">
      <AdminBanners />
    </PortalShell>
  );
}
