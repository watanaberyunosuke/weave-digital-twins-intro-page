import Link from "next/link";
export function Brand({ context }: { context?: string }) {
  return (
    <Link className="brand" href="/" aria-label="Weave home">
      <svg className="logo" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <g
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 4.5C10 7.6 6.5 10.6 6.5 14a5.5 5.5 0 0 0 11 0C17.5 10.6 14 7.6 12 4.5Z" />
          <path d="M1.5 14c2.33 1.4 4.67 1.4 7 0s4.67-1.4 7 0 4.67 1.4 7 0" />
        </g>
      </svg>
      <strong>Weave</strong>
      {context && <span className="brand-context">{context}</span>}
    </Link>
  );
}
