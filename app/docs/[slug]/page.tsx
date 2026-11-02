import { DocsOutline } from "@/components/docs-outline";
import { notionDocumentationUrl } from "@/components/docs-link";
import { notFound } from "next/navigation";
import Link from "next/link";
import { docs, repository } from "@/lib/docs";
export const dynamicParams = false;
export function generateStaticParams() {
  return docs.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = docs.find((page) => page.slug === slug);
  return { title: doc?.title, description: doc?.description };
}
export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = docs.findIndex((page) => page.slug === slug);
  if (index < 0) notFound();
  const doc = docs[index];
  const Content = doc.Component;
  return (
    <>
      <main id="main" className="doc-main">
        <div className="breadcrumbs">
          <Link href="/docs/">Documentation</Link>
          <span>/</span>
          <span>{doc.group}</span>
        </div>
        <p className="eyebrow">{doc.group}</p>
        <h1>{doc.title}</h1>
        <p className="doc-description">{doc.description}</p>
        <div className="doc-meta">
          <span>GUIDE / {String(index + 1).padStart(2, "0")}</span>
          <a
            href={notionDocumentationUrl(slug)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View in Notion ↗
          </a>
          <a href={`${repository}/blob/main/${doc.source}`}>
            View primary source ↗
          </a>
        </div>
        <details className="mobile-outline">
          <summary>On this page</summary>
          <DocsOutline headings={doc.headings} />
        </details>
        <article className="prose">
          <Content />
        </article>
        <div className="doc-source-note">
          Source-checked 2 November 2026. Commands describe the twin repository;
          runtime availability has not been assessed by this website.
        </div>
        <nav className="page-pagination" aria-label="Documentation pages">
          {index > 0 ? (
            <Link href={`/docs/${docs[index - 1].slug}/`}>
              <small>← Previous</small>
              {docs[index - 1].title}
            </Link>
          ) : (
            <Link href="/docs/">
              <small>← Back</small>Documentation overview
            </Link>
          )}
          {index < docs.length - 1 && (
            <Link href={`/docs/${docs[index + 1].slug}/`}>
              <small>Next →</small>
              {docs[index + 1].title}
            </Link>
          )}
        </nav>
      </main>
      <aside className="page-toc">
        <p className="eyebrow">ON THIS PAGE</p>
        <DocsOutline headings={doc.headings} />
        <a className="toc-help" href={`${repository}/issues`}>
          Something unclear?
          <br />
          Open an issue ↗
        </a>
      </aside>
    </>
  );
}
