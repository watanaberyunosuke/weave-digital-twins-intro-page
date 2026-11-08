import { writeFile, readFile } from "node:fs/promises";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";

const token = process.env.NOTION_ACCESS_TOKEN;
// Production builds must publish Notion, the source of the guides, so a missing
// token or a failed fetch fails the deploy and the last good one stays live.
// Previews have no token and build from content/*.mdx. REQUIRE_NOTION_SYNC=1
// forces the sync on any build; =0 lets production fall back while Notion is down.
const required =
  process.env.REQUIRE_NOTION_SYNC === "1" ||
  (process.env.VERCEL_ENV === "production" &&
    process.env.REQUIRE_NOTION_SYNC !== "0");
const destination = new URL(
  "../lib/notion-content.generated.json",
  import.meta.url,
);
if (!token) {
  if (required)
    throw new Error(
      "Notion sync is required for this build (production, or REQUIRE_NOTION_SYNC=1) but NOTION_ACCESS_TOKEN is missing.",
    );
  await writeFile(destination, "{}\n");
  console.warn(
    "Notion sync skipped: NOTION_ACCESS_TOKEN is not set; using repository documentation.",
  );
} else {
  const links = JSON.parse(
    await readFile(
      new URL("../lib/external-docs.json", import.meta.url),
      "utf8",
    ),
  );
  const pages = Object.entries(links.pages);
  const ids = Object.fromEntries(
    pages.map(([slug, url]) => [url.match(/([0-9a-f]{32})$/i)?.[1], slug]),
  );
  if (Object.keys(ids).length !== pages.length || ids.undefined)
    throw new Error("Invalid or duplicate Notion page IDs.");
  const result = {};
  for (const [slug, url] of pages) {
    const id = url.match(/([0-9a-f]{32})$/i)[1];
    const response = await fetch(
      `https://api.notion.com/v1/pages/${id}/markdown`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2026-03-11",
        },
        signal: AbortSignal.timeout(30000),
      },
    );
    if (!response.ok)
      throw new Error(
        `Notion fetch failed for ${slug}: HTTP ${response.status}.`,
      );
    const data = await response.json();
    if (
      typeof data.markdown !== "string" ||
      !data.markdown.trim() ||
      data.truncated ||
      data.unknown_block_ids?.length ||
      data.warnings?.length
    )
      throw new Error(
        `Notion returned incomplete content for ${slug}; refusing to publish.`,
      );
    let markdown = data.markdown;
    // Preserve links to our own guides as links inside the website.
    markdown = markdown.replace(
      /\[([^\]]+)\]\((https:\/\/[^)]+)\)/g,
      (all, label, href) => {
        const pageId = href.match(/([0-9a-f]{32})(?:\?|#|$)/i)?.[1];
        return pageId && ids[pageId]
          ? `[${label}](/docs/${ids[pageId]}/)`
          : all;
      },
    );
    const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
    const headings = [];
    const seen = new Set();
    visit(tree, "heading", (node) => {
      if (node.depth !== 2) return;
      let title = "";
      visit(node, (child) => {
        if (child.type === "text" || child.type === "inlineCode")
          title += child.value;
      });
      const anchor = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      if (!anchor || seen.has(anchor))
        throw new Error(`Invalid or duplicate heading in ${slug}: ${title}`);
      seen.add(anchor);
      headings.push({ title, id: anchor });
    });
    // HTML and Notion-specific XML need explicit support before they can be shown safely.
    let unsupported = false;
    visit(tree, "html", () => {
      unsupported = true;
    });
    if (unsupported)
      throw new Error(
        `Unsupported Notion markup in ${slug}; refusing to drop content.`,
      );
    result[slug] = { markdown, headings, searchText: markdown };
    console.log(`Fetched Notion guide: ${slug}`);
  }
  await writeFile(destination, JSON.stringify(result, null, 2) + "\n");
  console.log(`Notion sync complete: ${pages.length} guides.`);
}
