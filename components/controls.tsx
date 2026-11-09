"use client";
import { Children, isValidElement, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mermaid } from "@/components/mermaid";
import { usePathname } from "next/navigation";

type SearchPage = {
  slug: string;
  title: string;
  description: string;
  text: string;
  headings: { title: string; id: string }[];
};
type ThemeChoice = "auto" | "light" | "dark";
const themeLabels: Record<ThemeChoice, string> = {
  auto: "Follow System",
  light: "Light",
  dark: "Dark",
};
function ThemeIcon({ value }: { value: ThemeChoice }) {
  if (value === "light")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4" />
      </svg>
    );
  if (value === "dark")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 15.3A8.5 8.5 0 0 1 8.7 4a8.5 8.5 0 1 0 11.3 11.3Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8m-4-4v4" />
    </svg>
  );
}
export function ThemePicker() {
  const [theme, setTheme] = useState<ThemeChoice>("auto");
  const picker = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("weave-intro-theme");
      if (saved === "auto" || saved === "light" || saved === "dark")
        setTheme(saved);
    } catch {}
  }, []);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "auto" ? (media.matches ? "dark" : "light") : theme;
    };
    const saved = (() => {
      try {
        return localStorage.getItem("weave-intro-theme");
      } catch {
        return null;
      }
    })();
    if (theme !== "auto" || !saved || saved === "auto") apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (picker.current && !picker.current.contains(event.target as Node))
        picker.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && picker.current?.open) {
        picker.current.open = false;
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const choose = (value: ThemeChoice) => {
    setTheme(value);
    try {
      localStorage.setItem("weave-intro-theme", value);
    } catch {}
    document.documentElement.dataset.theme =
      value === "auto"
        ? matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : value;
    if (picker.current) picker.current.open = false;
    trigger.current?.focus();
  };
  return (
    <details className="theme-picker" ref={picker}>
      <summary
        ref={trigger}
        className="theme-trigger"
        aria-label={`Appearance: ${themeLabels[theme]}`}
        title={`Appearance: ${themeLabels[theme]}`}
      >
        <ThemeIcon value={theme} />
      </summary>
      <div className="theme-menu" role="radiogroup" aria-label="Appearance">
        {(["auto", "light", "dark"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={theme === value}
            onClick={() => choose(value)}
          >
            <ThemeIcon value={value} />
            <span>{themeLabels[value]}</span>
            <span className="theme-check" aria-hidden="true">
              {theme === value ? "✓" : ""}
            </span>
          </button>
        ))}
      </div>
    </details>
  );
}
export function Search({ pages }: { pages: SearchPage[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const open = () => {
    dialog.current?.showModal();
    input.current?.focus();
  };
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = pages.filter((page) =>
    terms.every((term) =>
      `${page.title} ${page.text}`.toLowerCase().includes(term),
    ),
  );
  return (
    <>
      <button className="search-trigger" onClick={open}>
        <span>Search docs</span>
        <kbd>⌘ / Ctrl K</kbd>
      </button>
      <dialog
        ref={dialog}
        className="search-dialog"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
        aria-labelledby="search-title"
      >
        <div className="search-heading">
          <h2 id="search-title">Search documentation</h2>
          <button
            className="plain-button"
            onClick={() => dialog.current?.close()}
            aria-label="Close search"
          >
            Close ×
          </button>
        </div>
        <label className="sr-only" htmlFor="docs-search">
          Search pages and headings
        </label>
        <input
          ref={input}
          id="docs-search"
          placeholder="Try baseline, topology or Flink…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="search-count" aria-live="polite">
          {results.length} matching pages
        </p>
        <div className="search-results">
          {results.length ? (
            results.map((page) => (
              <div key={page.slug}>
                <Link
                  onClick={() => dialog.current?.close()}
                  href={`/docs/${page.slug}/`}
                >
                  <strong>{page.title}</strong>
                  <span>{page.description}</span>
                </Link>
                {terms.length > 0 &&
                  page.headings
                    .filter((heading) =>
                      terms.some((term) =>
                        heading.title.toLowerCase().includes(term),
                      ),
                    )
                    .map((heading) => (
                      <Link
                        className="heading-result"
                        key={heading.id}
                        href={`/docs/${page.slug}/#${heading.id}`}
                        onClick={() => dialog.current?.close()}
                      >
                        ↳ {heading.title}
                      </Link>
                    ))}
              </div>
            ))
          ) : (
            <p>No matches. Try a broader term such as “model” or “GIS”.</p>
          )}
        </div>
      </dialog>
    </>
  );
}
const navIcons: Record<string, React.ReactNode> = {
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  "getting-started": (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h12l-2 4 2 4H5" />
    </>
  ),
  concepts: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  architecture: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="8.5" y="14" width="7" height="7" rx="1" />
      <path d="M6.5 10v2h11v-2M12 12v2" />
    </>
  ),
  modelling: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  configuration: (
    <>
      <path d="M4 7h10m4 0h2M4 17h2m4 0h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
  regions: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  telemetry: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4m8.4-8.4a6 6 0 0 1 0 8.4M4.9 4.9a10 10 0 0 0 0 14.2m14.2-14.2a10 10 0 0 1 0 14.2" />
    </>
  ),
  "console-and-gis": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  operations: (
    <path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-2.6-.6-.6-2.6 2.6-2.2Z" />
  ),
  api: <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />,
  contributing: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="9" r="2" />
      <path d="M6 7v10M18 11c0 4-12 2-12 6" />
    </>
  ),
};
function NavIcon({ name }: { name: string }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {navIcons[name] ?? <circle cx="12" cy="12" r="3" />}
    </svg>
  );
}
type SidebarMode = "pinned" | "auto";
const sidebarKey = "weave-docs-sidebar";
const autoHideDelay = 3000;
const leaveDelay = 600;
export function DocsShell({
  pages,
  children,
}: {
  pages: { slug: string; title: string; group: string }[];
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<SidebarMode>("pinned");
  const [peek, setPeek] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aside = useRef<HTMLElement>(null);
  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const hideLater = (delay: number) => {
    clear();
    timer.current = setTimeout(() => setPeek(false), delay);
  };
  useEffect(() => {
    try {
      if (localStorage.getItem(sidebarKey) === "pinned") return;
    } catch {}
    setMode("auto");
  }, []);
  useEffect(() => {
    clear();
    if (mode === "auto") {
      setPeek(true);
      hideLater(autoHideDelay);
    }
    return clear;
  }, [mode]);
  const toggle = () => {
    const next: SidebarMode = mode === "pinned" ? "auto" : "pinned";
    try {
      localStorage.setItem(sidebarKey, next);
    } catch {}
    setMode(next);
  };
  const show = () => {
    clear();
    setPeek(true);
  };
  const auto = mode === "auto";
  const hidden = auto && !peek;
  return (
    <div className="docs-shell" data-mode={mode} data-hidden={hidden}>
      <aside
        ref={aside}
        className="docs-sidebar"
        aria-label="Documentation navigation"
        onMouseEnter={auto ? show : undefined}
        onMouseLeave={auto ? () => hideLater(leaveDelay) : undefined}
        onFocus={auto ? show : undefined}
        onBlur={
          auto
            ? (event) => {
                if (!aside.current?.contains(event.relatedTarget as Node))
                  hideLater(leaveDelay);
              }
            : undefined
        }
      >
        <div className="sidebar-head">
          <p className="eyebrow">WEAVE / DOCUMENTATION</p>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={toggle}
            aria-pressed={!auto}
            aria-label={auto ? "Pin sidebar open" : "Auto-hide sidebar"}
            title={auto ? "Pin sidebar open" : "Auto-hide sidebar"}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 16v6" />
              <path d="M9 3h6l-1 5.5L17.5 12h-11L10 8.5 9 3Z" />
              {auto ? <path d="m4 20 16-16" /> : null}
            </svg>
          </button>
        </div>
        <DocsNav pages={pages} />
      </aside>
      <div className="sidebar-spacer" aria-hidden="true" />
      <button
        type="button"
        className="sidebar-edge"
        aria-label="Show documentation navigation"
        onMouseEnter={show}
        onFocus={show}
        onClick={show}
        tabIndex={hidden ? 0 : -1}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 5 7 7-7 7" />
        </svg>
        <span>Menu</span>
      </button>
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
export function DocsNav({
  pages,
}: {
  pages: { slug: string; title: string; group: string }[];
}) {
  const pathname = usePathname();
  const closeMobile = (event: React.MouseEvent<HTMLElement>) =>
    event.currentTarget.closest("details.mobile-docs")?.removeAttribute("open");
  const links = (group: string) =>
    pages
      .filter((page) => page.group === group)
      .map((page) => {
        const active = pathname.replace(/\/$/, "") === `/docs/${page.slug}`;
        return (
          <Link
            key={page.slug}
            className={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
            href={`/docs/${page.slug}/`}
            onClick={closeMobile}
          >
            <NavIcon name={page.slug} />
            <span className="nav-label">{page.title}</span>
          </Link>
        );
      });
  return (
    <>
      <Link
        className={`docs-home ${pathname === "/docs/" || pathname === "/docs" ? "active" : ""}`}
        href="/docs/"
        onClick={closeMobile}
      >
        <NavIcon name="home" />
        <span className="nav-label">Documentation overview</span>
      </Link>
      {Array.from(new Set(pages.map((page) => page.group))).map((group) => (
        <div className="nav-group" key={group}>
          <details open className="sidebar-section">
            <summary>{group}</summary>
            {links(group)}
          </details>
        </div>
      ))}
    </>
  );
}
function nodeText(node: React.ReactNode): string {
  return Children.toArray(node)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement<{ children?: React.ReactNode }>(child)
          ? nodeText(child.props.children)
          : "",
    )
    .join("");
}
export function CodeBlock({ children, ...props }: React.ComponentProps<"pre">) {
  const code = Children.toArray(children).find(isValidElement) as
    React.ReactElement<{ className?: string }> | undefined;
  const language =
    (props as { "data-language"?: string })["data-language"] ||
    code?.props.className?.replace("language-", "") ||
    "text";
  const block = useRef<HTMLPreElement>(null);
  const [status, setStatus] = useState("Copy");
  if (language === "mermaid") return <Mermaid chart={nodeText(children)} />;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.current?.textContent || "");
      setStatus("Copied");
    } catch {
      setStatus("Select text to copy");
    }
  };
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>{language}</span>
        <button
          onClick={copy}
          aria-live="polite"
          onBlur={() => setStatus("Copy")}
        >
          {status}
        </button>
      </div>
      <pre ref={block} {...props}>
        {children}
      </pre>
    </div>
  );
}
