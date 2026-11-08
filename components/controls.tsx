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
export function DocsNav({
  pages,
}: {
  pages: { slug: string; title: string; group: string }[];
}) {
  const pathname = usePathname();
  return (
    <>
      <Link
        className={`docs-home ${pathname === "/docs/" || pathname === "/docs" ? "active" : ""}`}
        href="/docs/"
        onClick={(event) =>
          event.currentTarget
            .closest("details.mobile-docs")
            ?.removeAttribute("open")
        }
      >
        Documentation overview
      </Link>
      {Array.from(new Set(pages.map((page) => page.group))).map((group) => (
        <div className="nav-group" key={group}>
          <details open className="sidebar-section">
            <summary>{group}</summary>
            {pages
              .filter((page) => page.group === group)
              .map((page) => {
                const active =
                  pathname.replace(/\/$/, "") === `/docs/${page.slug}`;
                return (
                  <Link
                    key={page.slug}
                    className={active ? "active" : ""}
                    aria-current={active ? "page" : undefined}
                    href={`/docs/${page.slug}/`}
                    onClick={(event) =>
                      event.currentTarget
                        .closest("details.mobile-docs")
                        ?.removeAttribute("open")
                    }
                  >
                    {page.title}
                  </Link>
                );
              })}
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
