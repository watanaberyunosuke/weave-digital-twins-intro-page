import { DocsLink } from "@/components/docs-link";
export default function NotFound() {
  return (
    <main id="main" className="container empty-page">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>This route is off the map.</h1>
      <p>Find your way back through the documentation index.</p>
      <DocsLink className="button" href="/docs/">
        Browse documentation →
      </DocsLink>
    </main>
  );
}
