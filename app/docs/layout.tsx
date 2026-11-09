import { DocsShell } from "@/components/controls";
import { docs } from "@/lib/docs";
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pages = docs.map(({ slug, title, group }) => ({ slug, title, group }));
  return <DocsShell pages={pages}>{children}</DocsShell>;
}
