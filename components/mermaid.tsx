"use client";
import { useEffect, useId, useState } from "react";

const currentTheme = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "default";

// Rendered in the browser because the site is a static export; the source stays
// readable text until the script runs.
export function Mermaid({ chart }: { chart: string }) {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);
  const [theme, setTheme] = useState<"dark" | "default">("default");
  useEffect(() => {
    setTheme(currentTheme());
    const observer = new MutationObserver(() => setTheme(currentTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme,
        });
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled) {
          setSvg(svg);
          setFailed(false);
        }
      } catch (error) {
        console.error("Mermaid render failed", error);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, theme, id]);
  if (failed)
    return (
      <pre>
        <code>{chart}</code>
      </pre>
    );
  return (
    <div
      className="mermaid-diagram"
      role="img"
      aria-label="Diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
