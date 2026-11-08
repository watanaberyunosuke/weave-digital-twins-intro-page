import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { CodeBlock } from "@/components/controls";
import { Children, isValidElement, type ReactNode } from "react";
function headingText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? headingText(child.props.children)
          : "",
    )
    .join("");
}
// rehype-pretty-code highlights asynchronously, which the synchronous renderer
// can't run, so this renders on the server with the async one.
export async function NotionContent({ markdown }: { markdown: string }) {
  return (
    <MarkdownAsync
      skipHtml
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        [
          rehypePrettyCode,
          {
            theme: { light: "github-light", dark: "github-dark" },
            keepBackground: false,
          },
        ],
      ]}
      components={{
        h2: ({ children }) => {
          const title = headingText(children);
          const id = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          return (
            <h2 id={id}>
              {children}
              <a
                className="heading-anchor"
                href={`#${id}`}
                aria-label={`Link to ${title}`}
              >
                #
              </a>
            </h2>
          );
        },
        pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        table: ({ children }) => (
          <div className="table-scroll">
            <table>{children}</table>
          </div>
        ),
      }}
    >
      {markdown}
    </MarkdownAsync>
  );
}
