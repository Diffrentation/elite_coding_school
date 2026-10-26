import { PortalShell } from "@/components/portal-shell";
import { ProfilePage } from "@/components/profile-page";
export default function StudentProfile() {
  return (
    <PortalShell kind="student">
      <main className="portal-content">
        <ProfilePage />
      </main>
    </PortalShell>
  );
}
