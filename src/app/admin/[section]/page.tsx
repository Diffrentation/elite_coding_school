import { PortalShell } from "@/components/portal-shell";
export function generateStaticParams() {
  return ["students", "courses", "fees", "banners", "inquiries", "queries", "settings"].map((section) => ({
    section,
  }));
}
export default async function AdminSection({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = section.replaceAll("-", " ");
  return (
    <PortalShell kind="admin">
      <main className="portal-content">
        <p className="kicker">ADMIN PANEL</p>
        <h2 className="section-title">{title}</h2>
        <div className="empty-screen">
          <b>✦</b>
          <h3>This module is planned.</h3>
          <p>
            It is intentionally not connected to mock operational data. Its controls will activate when the
            associated backend phase is implemented.
          </p>
        </div>
      </main>
    </PortalShell>
  );
}
