import Link from "next/link";
export function Brand({ context }: { context?: string }) {
  return (
    <Link className="brand" href="/" aria-label="Weave home">
      <svg className="logo" viewBox="0 0 32 36" fill="none" aria-hidden="true">
        <g
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 3C12.5 8.5 6.5 14 6.5 20a9.5 9.5 0 0 0 19 0C25.5 14 19.5 8.5 16 3Z" />
          <path d="M10.5 21c1.8-1.5 3.6-1.5 5.5 0s3.7 1.5 5.5 0" />
        </g>
      </svg>
      <strong>Weave</strong>
      {context && <span className="brand-context">{context}</span>}
    </Link>
  );
}
