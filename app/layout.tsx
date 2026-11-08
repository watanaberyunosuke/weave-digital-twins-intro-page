import type { Metadata, Viewport } from "next";
import { Brand } from "@/components/brand";
import { SiteHeader } from "@/components/site-header";
import { docs } from "@/lib/docs";
import { DocsLink } from "@/components/docs-link";
import { Analytics } from "@vercel/analytics/next";
const repository = "https://github.com/watanaberyunosuke/weave-digital-twins";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Weave — utility network digital twins",
    template: "%s · Weave",
  },
  description:
    "Explore utility networks with real geography, explicitly synthetic telemetry and traceable hydraulic modelling.",
};
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e131b" },
  ],
};
const bootTheme = `(function(){var t='auto';try{var s=localStorage.getItem('weave-intro-theme');if(['auto','light','dark'].includes(s))t=s}catch(e){}document.documentElement.dataset.theme=t==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t})()`;
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: bootTheme }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader
          pages={docs.map(
            ({ slug, title, description, searchText, headings }) => ({
              slug,
              title,
              description,
              text: searchText,
              headings,
            }),
          )}
        />
        {children}
        <footer className="site-footer">
          <div>
            <Brand />
            <p>Real geography. Explicit assumptions. Traceable modelling.</p>
          </div>
          <div>
            <DocsLink href="/docs/getting-started/">Get started ↗</DocsLink>
            <DocsLink href="/docs/contributing/">Contribute ↗</DocsLink>
            <a href={repository}>Source ↗</a>
          </div>
          <p>Project documentation · No connection to a running twin</p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
