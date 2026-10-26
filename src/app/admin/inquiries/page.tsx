import { AdminInquiries } from "@/components/admin-inquiries";
import { PortalShell } from "@/components/portal-shell";

export default function AdminInquiriesPage() {
  return (
    <PortalShell kind="admin">
      <AdminInquiries />
    </PortalShell>
  );
}
