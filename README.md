# Weave project website

A static Next.js and TypeScript website with a documentation layout inspired by [MaaFramework’s quick-start guide](https://maafw.com/docs/1.1-QuickStarted/): a persistent grouped sidebar, focused reading column, active page outline, searchable content, highlighted code, callouts and previous/next navigation.

The website documentation is the primary reader experience. The separately published [Notion documentation](https://harrybwatson.notion.site/Weave-documentation-40c6e7f930a481d3a1c5d397aa1a49b8) remains available as a secondary copy, linked from individual guides. Production builds on Vercel fetch the guides from Notion (see Notion sync below).

## Run locally

Use Node.js 24 LTS and npm:

```bash
npm ci
npm run dev
```

Open http://127.0.0.1:3000/docs/getting-started/.

## Build and preview

```bash
npm run build
npm run serve
```

Open http://127.0.0.1:8080/docs/getting-started/. Deploy the contents of `out/` to a static host with directory index support. No Node server or backend is required after building. This task does not deploy the website publicly or change the running twin.

## Documentation maintenance

- `content/*.mdx`: eleven substantive guides, including callouts and copyable code blocks.
- `lib/docs.ts`: titles, groups, source paths, heading lists, search text and MDX imports. Update the matching heading/search entries when changing a guide.
- `app/docs/`: the documentation index and static guide routes.
- `components/site-header.tsx`: navigation, search and persistent appearance control.
- `components/docs-outline.tsx`: page outline and active-section tracking.
- `components/controls.tsx`: search dialog, collapsible navigation groups and clipboard controls.
- `mdx-components.tsx`: heading anchors, code rendering and callout mapping.
- `lib/external-docs.json`: destinations for the optional Notion links.

Search runs locally over actual guide text and headings. Syntax highlighting is generated during the build with Shiki through rehype-pretty-code. Mobile layouts use collapsible documentation navigation and a page outline. Appearance supports Auto, Light and Dark using the existing browser preference.

Earlier standalone and documentation layouts are retained locally in the ignored `archive/` directory.

## Notion sync

`npm run build` runs `scripts/sync-notion.mjs` first. With `NOTION_ACCESS_TOKEN` set, it fetches every guide listed in `lib/external-docs.json` and the site renders that text instead of `content/*.mdx`; without it, the sync is skipped and the repository copy is used.

- Production (`VERCEL_ENV=production`) requires the sync: a missing token, a failed fetch or content the site can't render fails the build, so the previous deployment stays live rather than publishing stale text.
- The token is set for Production only, so preview builds use `content/*.mdx`. Keep those files aligned with Notion so previews stay representative.
- `REQUIRE_NOTION_SYNC=1` requires the sync on any build; `REQUIRE_NOTION_SYNC=0` lets a production build fall back to the repository copy, for example while Notion is unavailable.

## Checks

```bash
npx playwright install chromium
python3 -m http.server 4173 --bind 127.0.0.1 --directory out
```

In another terminal:

```bash
node scripts/check-site.mjs
```

The browser check covers static routes, heading targets, search, clipboard, appearance persistence, system changes, collapsible groups, active outlines, syntax highlighting and responsive overflow. Screenshots are saved under `output/playwright/`. Set `WEAVE_SITE_URL` for another local preview URL.

## Content scope

Technical content was checked against the twin repository on 8 November 2026. It identifies EPANET water modelling as the current implementation, keeps provenance explicit, and does not claim runtime health or validated field detection accuracy. No commands in the documentation are executed by this website.

## Brand

The website and documentation share the console’s exact light/dark palette and system font family. The logo is a closed monoline droplet with a level tide line running through it, drawn on a 24-unit grid at stroke 1.8 in the brand ink (`--mark-ink`: #124c62 light, #e3e8ef dark), with no gradients, shadows or dimensional effects. The mark and tokens follow the Weave design system. `components/brand.tsx` supplies the shared wordmark; `public/weave-mark.svg` is the standalone vector and `app/icon.svg` is the matching favicon. The running console is unchanged.
