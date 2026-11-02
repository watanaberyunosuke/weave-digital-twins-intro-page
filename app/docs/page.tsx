import Link from "next/link";
import { docs } from "@/lib/docs";
export const metadata = {
  title: "Documentation",
  description:
    "Install Weave, configure a region and understand the hydraulic model.",
};
export default function DocsPage() {
  return (
    <main id="main" className="doc-main docs-index">
      <div className="breadcrumbs">Weave / Documentation</div>
      <p className="eyebrow">THE FIELD GUIDE</p>
      <h1>
        Build understanding.
        <br />
        Then build your twin.
      </h1>
      <p className="doc-description">
        From the first container to the assumptions behind a pressure residual.
        Follow a path, or go straight to the reference you need.
      </p>
      <Link className="start-guide" href="/docs/getting-started/">
        <span className="step-number">01</span>
        <div>
          <span className="eyebrow">NEW TO WEAVE?</span>
          <h2>Start with a local stack</h2>
          <p>
            Prepare a region, bring up the services and verify the pipeline.
          </p>
        </div>
        <span>↗</span>
      </Link>
      {Array.from(new Set(docs.map((page) => page.group))).map((group) => (
        <section className="docs-index-group" key={group}>
          <h2>{group}</h2>
          <div className="doc-grid">
            {docs
              .filter((page) => page.group === group)
              .map((page) => (
                <Link
                  className="doc-card"
                  href={`/docs/${page.slug}/`}
                  key={page.slug}
                >
                  <h3>
                    {page.title}
                    <span>↗</span>
                  </h3>
                  <p>{page.description}</p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
