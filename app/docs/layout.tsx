import { DocsNav } from "@/components/controls";
import { docs } from "@/lib/docs";
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pages = docs.map(({ slug, title, group }) => ({ slug, title, group }));
  return (
    <div className="docs-shell">
      <aside className="docs-sidebar" aria-label="Documentation navigation">
        <p className="eyebrow">WEAVE / DOCUMENTATION</p>
        <DocsNav pages={pages} />
      </aside>
      <details className="mobile-docs">
        <summary>Documentation navigation</summary>
        <nav aria-label="Mobile documentation">
          <DocsNav pages={pages} />
        </nav>
      </details>
      {children}
    </div>
  );
}
