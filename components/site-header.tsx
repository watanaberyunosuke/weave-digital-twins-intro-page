"use client";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { usePathname } from "next/navigation";
import { ThemePicker, Search } from "@/components/controls";
import links from "@/lib/external-docs.json";
type SearchPage = {
  slug: string;
  title: string;
  description: string;
  text: string;
  headings: { title: string; id: string }[];
};
export function SiteHeader({ pages }: { pages: SearchPage[] }) {
  const path = usePathname();
  const isDocs = path.startsWith("/docs");
  return (
    <header className={`site-header ${isDocs ? "docs-header" : ""}`}>
      <div className="header-inner">
        <Brand context={isDocs ? "documentation" : "digital twins"} />
        <Search pages={pages} />
        <nav aria-label="Main navigation">
          <Link className="overview-link" href="/">
            Overview
          </Link>
          <Link
            className={isDocs ? "current" : ""}
            href="/docs/getting-started/"
            aria-current={isDocs ? "location" : undefined}
          >
            Docs
          </Link>
          <a
            className="notion-link"
            href={links.home}
            target="_blank"
            rel="noopener noreferrer"
          >
            Notion ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a
            className="github-link"
            href="https://github.com/watanaberyunosuke/weave-digital-twins"
          >
            GitHub ↗
          </a>
          <ThemePicker />
        </nav>
      </div>
    </header>
  );
}
