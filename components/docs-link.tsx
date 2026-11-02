import type { ComponentProps } from "react";
import Link from "next/link";
import links from "@/lib/external-docs.json";
export function notionDocumentationUrl(slug?: string) {
  return slug
    ? links.pages[slug as keyof typeof links.pages] || links.home
    : links.home;
}
export function DocsLink({
  href = "/docs/",
  children,
  ...props
}: ComponentProps<"a">) {
  return (
    <Link {...props} href={href}>
      {children}
    </Link>
  );
}
