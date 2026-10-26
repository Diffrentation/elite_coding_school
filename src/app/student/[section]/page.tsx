import { PortalShell } from "@/components/portal-shell";
export function generateStaticParams() {
  return ["profile", "courses", "queries", "fees", "settings"].map((section) => ({ section }));
}
export default async function StudentSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = section.replaceAll("-", " ");
  return (
    <PortalShell kind="student">
      <main className="portal-content">
        <p className="kicker">STUDENT PORTAL</p>
        <h2 className="section-title">{title}</h2>
        <div className="empty-screen">
          <b>✦</b>
          <h3>This area is being prepared.</h3>
          <p>
            Its secure functionality will be enabled in the matching development phase after student
            authentication is available.
          </p>
        </div>
      </main>
    </PortalShell>
  );
}
