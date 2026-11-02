import { Callout } from "@/components/callout";
import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/controls";
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Callout,
    h2: ({ children }) => {
      const id = String(children)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return (
        <h2 id={id}>
          {children}
          <a
            className="heading-anchor"
            href={`#${id}`}
            aria-label={`Link to ${children}`}
          >
            #
          </a>
        </h2>
      );
    },
    pre: CodeBlock,
    table: (props) => (
      <div className="table-scroll">
        <table {...props} />
      </div>
    ),
    ...components,
  };
}
