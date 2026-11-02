"use client";
import { useEffect, useState } from "react";
export function DocsOutline({
  headings,
}: {
  headings: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(headings[0]?.id || "");
  useEffect(() => {
    const update = () => {
      let current = headings[0]?.id || "";
      for (const { id } of headings) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 140) current = id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("hashchange", update);
    };
  }, [headings]);
  return (
    <nav aria-label="On this page">
      {headings.map((heading) => (
        <a
          key={heading.id}
          className={active === heading.id ? "active" : ""}
          aria-current={active === heading.id ? "location" : undefined}
          href={`#${heading.id}`}
        >
          {heading.title}
        </a>
      ))}
    </nav>
  );
}
