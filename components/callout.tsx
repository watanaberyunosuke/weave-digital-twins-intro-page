export function Callout({
  kind = "info",
  title,
  children,
}: {
  kind?: "info" | "warning";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside className={`doc-callout ${kind}`} aria-label={title}>
      <p className="callout-title">{title}</p>
      <div>{children}</div>
    </aside>
  );
}
